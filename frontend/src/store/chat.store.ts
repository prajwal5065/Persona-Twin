import { create } from 'zustand';
import type { ChatMessage } from '../types';
import { chatApi } from '../api/chat.api';

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (query: string) => Promise<void>;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  sendMessage: async (query: string) => {
    const newUserMessage: ChatMessage = { role: 'user', content: query };
    set({ messages: [...get().messages, newUserMessage], loading: true });
    
    try {
      const res = await chatApi.sendMessage(query);
      const assistantMessage: ChatMessage = { role: 'assistant', content: res.data.response };
      set({ messages: [...get().messages, assistantMessage], loading: false });
    } catch {
      set({ loading: false });
    }
  },
  clearChat: () => set({ messages: [] }),
}));
