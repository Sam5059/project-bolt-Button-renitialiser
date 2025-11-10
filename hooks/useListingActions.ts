import { useState } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

export function useListingActions() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [visiblePhone, setVisiblePhone] = useState<string | null>(null);

  const onCallSeller = (listing: any) => {
    if (!listing?.profiles?.phone_number) {
      Alert.alert(
        t?.('common.error') || 'Erreur',
        language === 'ar' ? 'رقم الهاتف غير متاح' : language === 'en' ? 'Phone number not available' : 'Numéro de téléphone non disponible'
      );
      return;
    }

    const phone = listing.profiles.phone_number;

    if (Platform.OS === 'web') {
      setVisiblePhone(phone);
      return;
    }

    Linking.openURL(`tel:${phone}`);
  };

  const onSendMessage = async (listing: any) => {
    if (!user) {
      Alert.alert(
        t?.('pro.loginRequired') || 'Connexion requise',
        t?.('pro.mustLogin') || 'Vous devez vous connecter pour envoyer un message',
        [
          { text: t?.('common.cancel') || 'Annuler', style: 'cancel' },
          {
            text: t?.('common.login') || 'Se connecter',
            onPress: () => router.push('/(auth)/login')
          }
        ]
      );
      return;
    }

    if (listing?.user_id === user.id) {
      Alert.alert(
        'Impossible',
        language === 'ar' ? 'لا يمكنك إرسال رسالة إلى نفسك' : language === 'en' ? 'You cannot message yourself' : 'Vous ne pouvez pas envoyer un message sur votre propre annonce'
      );
      return;
    }

    try {
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('listing_id', listing.id)
        .eq('buyer_id', user.id)
        .single();

      if (existingConversation) {
        router.push(`/conversation/${existingConversation.id}`);
        return;
      }

      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing.id,
          seller_id: listing.user_id,
          buyer_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (newConversation) {
        router.push(`/conversation/${newConversation.id}`);
      }
    } catch (error) {
      console.error('[useListingActions] Error creating conversation:', error);
      Alert.alert(
        t?.('common.error') || 'Erreur',
        language === 'ar' ? 'فشل إنشاء المحادثة' : language === 'en' ? 'Failed to create conversation' : 'Impossible de créer la conversation'
      );
    }
  };

  const dismissPhone = () => {
    setVisiblePhone(null);
  };

  return {
    onCallSeller,
    onSendMessage,
    visiblePhone,
    dismissPhone,
  };
}
