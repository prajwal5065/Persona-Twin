import client from './client';

export const chatApi = {
  sendMessage: (query: string) => client.post('/chat', { query }),
};
