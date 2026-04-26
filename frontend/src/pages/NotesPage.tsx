import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotesStore } from '../store/notes.store';
import { Plus, Search, Calendar, Mic, StickyNote } from 'lucide-react';
import { notesApi } from '../api/notes.api';
import { CustomSpinner } from '../components/ui/CustomSpinner';
import beetleTexture from '../assets/beetle_texture.png';
import { cn } from '../lib/utils';

export function NotesPage() {
  const { notes, fetchNotes, addNote, loading } = useNotesStore();
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    } finally {
      setIsReindexing(false);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="relative glass-strong p-8 rounded-[32px] overflow-hidden group">
        {/* Beetle Texture background */}
        <div className="absolute right-0 top-0 h-full w-2/3 pointer-events-none opacity-40 mix-blend-screen group-hover:opacity-60 transition-opacity duration-700">
           <img 
            src={beetleTexture} 
            className="h-full w-full object-cover" 
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black)'
            }}
          />
        </div>

        <div className="relative z-10 space-y-2">
          <h1 className="text-[32px] font-bold tracking-[-0.03em]">Base <span className="gradient-text">Memories</span></h1>
          <p className="text-muted-foreground text-[14px] max-w-sm">The semantic foundation of your digital avatar. Every note expands your twin's intelligence.</p>
        </div>

        <button
          onClick={handleReindex}
          disabled={isReindexing}
          className="absolute bottom-6 right-6 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[12px] font-semibold hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50 active-click z-10"
        >
          {isReindexing ? <CustomSpinner className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
          <span>Synapse Reindexing</span>
        </button>
      </header>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-[24px] space-y-6 relative overflow-hidden">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Translate your current experience into data..."
          className="w-full h-32 bg-transparent border-none focus:ring-0 resize-none text-[18px] placeholder:text-muted-foreground/20 leading-relaxed font-medium"
          required
        />
        
        <div className="flex items-center justify-between pt-6 border-t border-white/[0.03]">
          <div className="flex items-center gap-4">
            <button type="button" className="p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground transition-all active-click">
              <Mic className="w-5 h-5 stroke-[1.5]" />
            </button>
            <div className={cn(
              "char-count font-mono text-primary/60",
              content.length > 4500 && "visible"
            )}>
              {content.length}/5000
            </div>
          </div>
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-8 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-3 emerald-glow active-click"
          >
            {isSubmitting ? <CustomSpinner className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
            Establish Memory
          </button>
        </div>
      </form>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Query the consciousness base..."
          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-black/40 border border-[#00CC6610] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <AnimatePresence>
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="glass p-6 rounded-[24px] group transition-all hover-lift relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                  <Calendar className="w-3 h-3 text-primary/60" />
                  {new Date(note.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#00CC6620] group-hover:bg-primary transition-colors" />
              </div>
              <p className="text-[14px] leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors whitespace-pre-wrap">
                {note.content}
              </p>
              <div className="absolute left-0 top-0 h-full w-[2px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredNotes.length === 0 && !loading && (
          <div className="col-span-full h-64 dashed-trace flex flex-col items-center justify-center text-center p-8 opacity-40">
             <StickyNote className="w-12 h-12 mb-4 text-muted-foreground/40" strokeWidth={1} />
             <p className="text-[14px] font-medium tracking-wide uppercase">No corresponding patterns found</p>
          </div>
        )}
      </div>

      {loading && filteredNotes.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass p-6 rounded-[24px] h-40 skeleton" />
          ))}
        </div>
      )}
    </div>
  );
}
