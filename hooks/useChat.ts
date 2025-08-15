import { useState, useCallback } from 'react';

export interface ChatMessage {
  content: string;
  type: 'user' | 'ai' | 'system' | 'file-update' | 'command' | 'error';
  timestamp: Date;
  metadata?: {
    scrapedUrl?: string;
    scrapedContent?: any;
    generatedCode?: string;
    appliedFiles?: string[];
    commandType?: 'input' | 'output' | 'error' | 'success';
  };
}

export const useChat = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [conversationContext, setConversationContext] = useState<{
    scrapedWebsites: Array<{ url: string; content: any; timestamp: Date }>;
    generatedComponents: Array<{ name: string; path: string; content: string }>;
    appliedCode: Array<{ files: string[]; timestamp: Date }>;
    currentProject: string;
    lastGeneratedCode?: string;
  }>({
    scrapedWebsites: [],
    generatedComponents: [],
    appliedCode: [],
    currentProject: '',
    lastGeneratedCode: undefined
  });

  const addChatMessage = useCallback((content: string, type: ChatMessage['type'], metadata?: ChatMessage['metadata']) => {
    setChatMessages(prev => {
      // Skip duplicate consecutive system messages
      if (type === 'system' && prev.length > 0) {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.type === 'system' && lastMessage.content === content) {
          return prev; // Skip duplicate
        }
      }
      return [...prev, { content, type, timestamp: new Date(), metadata }];
    });
  }, []);

  const clearChatHistory = useCallback(() => {
    setChatMessages([{
      content: 'Chat history cleared. How can I help you?',
      type: 'system',
      timestamp: new Date()
    }]);
  }, []);

  return {
    chatMessages,
    conversationContext,
    addChatMessage,
    clearChatHistory,
    setConversationContext,
  };
};