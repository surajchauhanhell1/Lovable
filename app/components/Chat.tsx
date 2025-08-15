import { useChat } from '@/hooks/useChat';

export const Chat = () => {
  const { chatMessages, addChatMessage, clearChatHistory } = useChat();

  // ... render chat messages and input

  return <div>...</div>;
};