import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatDrawerContextType {
  isOpen: boolean;
  conversationId: string | null;
  openChat: (conversationId: string) => void;
  closeChat: () => void;
}

const ChatDrawerContext = createContext<ChatDrawerContextType | undefined>(undefined);

export function ChatDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const openChat = (convId: string) => {
    setConversationId(convId);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setTimeout(() => setConversationId(null), 300);
  };

  return (
    <ChatDrawerContext.Provider value={{ isOpen, conversationId, openChat, closeChat }}>
      {children}
    </ChatDrawerContext.Provider>
  );
}

export function useChatDrawer() {
  const context = useContext(ChatDrawerContext);
  if (context === undefined) {
    throw new Error('useChatDrawer must be used within a ChatDrawerProvider');
  }
  return context;
}
