import { create } from 'zustand';
import type { Note } from '../types';
import { notesApi } from '../api/notes.api';

interface NotesState {
  notes: Note[];
  loading: boolean;
  fetchNotes: () => Promise<void>;
  addNote: (content: string) => Promise<Note>;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  loading: false,
  fetchNotes: async () => {
    set({ loading: true });
    try {
      const res = await notesApi.getNotes();
      set({ notes: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addNote: async (content: string) => {
    const res = await notesApi.addNote(content);
    set((state) => ({ notes: [res.data, ...state.notes] }));
    return res.data;
  },
}));
