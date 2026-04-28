import { create } from 'zustand';
import type { ChatMessage } from '../types';
import { chatApi } from '../api/chat.api';

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  /** true while the minimum "thinking" delay is pending */
  thinking: boolean;
  sendMessage: (query: string) => Promise<void>;
  clearChat: () => void;
}

const MIN_THINKING_MS = 600; // minimum delay before showing response — feels natural

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  thinking: false,

  sendMessage: async (query: string) => {
    const userMessage: ChatMessage = { role: 'user', content: query };
    set({ messages: [...get().messages, userMessage], loading: true, thinking: true });

    // Start API call and minimum delay in parallel
    const [res] = await Promise.all([
      chatApi.sendMessage(query),
      new Promise((resolve) => setTimeout(resolve, MIN_THINKING_MS)),
    ]);

    set({ thinking: false });

    const assistantMessage: ChatMessage = { role: 'assistant', content: res.data.response };
    set({ messages: [...get().messages, assistantMessage], loading: false });
  },

  clearChat: () => set({ messages: [], loading: false, thinking: false }),
}));
