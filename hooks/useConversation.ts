import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  listings?: {
    id: string;
    title: string;
    images: string[];
  };
  buyer_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  seller_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export function useConversation(conversationId: string | null) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      setLoading(false);
      return;
    }

    loadConversationAndMarkRead();
    loadMessages();

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);

          if (newMsg.sender_id !== user?.id) {
            markMessagesAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const loadConversationAndMarkRead = async () => {
    if (!conversationId || !user) return;

    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        listings (id, title, images),
        buyer_profile:profiles!conversations_buyer_id_fkey (id, full_name, avatar_url),
        seller_profile:profiles!conversations_seller_id_fkey (id, full_name, avatar_url)
      `)
      .eq('id', conversationId)
      .maybeSingle();

    if (data) {
      setConversation(data);

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      const isBuyer = data.buyer_id === user.id;
      const updateField = isBuyer ? 'unread_count_buyer' : 'unread_count_seller';

      await supabase
        .from('conversations')
        .update({ [updateField]: 0 })
        .eq('id', conversationId);
    }
  };

  const loadMessages = async () => {
    if (!conversationId) return;

    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const markMessagesAsRead = async () => {
    if (!user || !conversationId || !conversation) return;

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    const isBuyer = conversation.buyer_id === user.id;
    const updateField = isBuyer ? 'unread_count_buyer' : 'unread_count_seller';

    await supabase
      .from('conversations')
      .update({ [updateField]: 0 })
      .eq('id', conversationId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || sending || !conversationId) return;

    setSending(true);

    try {
      const { data: spamCheck } = await supabase.rpc('check_content_for_spam', {
        content_text: newMessage.trim(),
      });

      if (spamCheck && spamCheck.length > 0) {
        const result = spamCheck[0];

        if (result.has_spam && result.suggested_action === 'block') {
          Alert.alert(
            'Message Bloqué',
            'Votre message contient des mots interdits et ne peut pas être envoyé.'
          );
          setSending(false);
          return;
        }
      }

      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage.trim(),
        is_read: false,
      });

      if (error) throw error;

      const isBuyer = conversation?.buyer_id === user.id;
      const updateField = isBuyer ? 'unread_count_seller' : 'unread_count_buyer';

      const { data: conv } = await supabase
        .from('conversations')
        .select('unread_count_buyer, unread_count_seller')
        .eq('id', conversationId)
        .single();

      const currentCount = isBuyer
        ? (conv?.unread_count_seller || 0)
        : (conv?.unread_count_buyer || 0);

      await supabase
        .from('conversations')
        .update({
          last_message: newMessage.trim(),
          last_message_at: new Date().toISOString(),
          [updateField]: currentCount + 1,
        })
        .eq('id', conversationId);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = () => {
    if (!conversation || !user) return null;
    return conversation.buyer_id === user.id
      ? conversation.seller_profile
      : conversation.buyer_profile;
  };

  return {
    conversation,
    messages,
    newMessage,
    setNewMessage,
    loading,
    sending,
    handleSendMessage,
    getOtherUser,
  };
}
