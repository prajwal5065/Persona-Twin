import client from './client';
import type { Note } from '../types';

export const notesApi = {
  getNotes: (params?: any) => client.get<Note[]>('/notes', { params }),
  addNote: (content: string) => client.post<Note>('/add-note', { content }),
  reindex: () => client.post('/notes/reindex'),
  voiceToNote: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.mp3');
    return client.post('/notes/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteNote: (id: number) => client.delete(`/notes/${id}`),
};
