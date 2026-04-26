import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotesStore } from '../store/notes.store';
import { Plus, Search, Calendar, Mic, Loader2 } from 'lucide-react';
import { notesApi } from '../api/notes.api';

export function NotesPage() {
  const { notes, fetchNotes, addNote, loading } = useNotesStore();
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addNote(content);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReindex = async () => {
    setIsReindexing(true);
    try {
      await notesApi.reindex();
      alert('FAISS index successfully rebuilt!');
    } catch {
      alert('Failed to reindex.');
    } finally {
      setIsReindexing(false);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Memories</h1>
          <p className="text-muted-foreground">The data source for your digital twin.</p>
        </div>
        <button
          onClick={handleReindex}
          disabled={isReindexing}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isReindexing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Loader2 className="w-4 h-4" />}
          <span>Rebuild FAISS Index</span>
        </button>
      </header>

      <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Capture a thought, experience, or reflection..."
          className="w-full h-32 bg-transparent border-none focus:ring-0 resize-none text-lg placeholder:text-muted-foreground/30"
          required
        />
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex gap-2">
            <button type="button" className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground transition-all">
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Save Note
          </button>
        </div>
      </form>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter memories..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass p-5 rounded-2xl group transition-all"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-medium">
                <Calendar className="w-3 h-3" />
                {new Date(note.created_at).toLocaleString()}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {loading && filteredNotes.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
