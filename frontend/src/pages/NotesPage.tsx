import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Sparkles, Search, X, Trash2, Calendar, Tag as TagIcon } from 'lucide-react';
import { useNotesStore } from '../store/notes.store';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

// ─── types & constants ───────────────────────────────────────────────────────

const TAG_COLORS: Record<string, string> = {
  productivity: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  habits: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  psychology: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  work: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  energy: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  values: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  philosophy: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  growth: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  'decision-making': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
};

/** 
 * Virtual parsing: Extracts [TITLE:...] and [TAGS:...] from the content string.
 */
function parseNoteContent(rawContent: string) {
  const titleMatch = rawContent.match(/\[TITLE:(.*?)\]/);
  const tagsMatch = rawContent.match(/\[TAGS:(.*?)\]/);
  
  let content = rawContent;
  let title = '';
  let tags: string[] = [];

  if (titleMatch) {
    title = titleMatch[1];
    content = content.replace(titleMatch[0], '');
  }
  if (tagsMatch) {
    tags = tagsMatch[1].split(',').filter(Boolean);
    content = content.replace(tagsMatch[0], '');
  }

  content = content.trim();
  
  if (!title) {
    const lines = content.split('\n');
    title = lines[0].slice(0, 50) + (lines[0].length > 50 ? '...' : '');
  }

  return { title, tags, content };
}

function packNoteContent(title: string, tags: string[], content: string) {
  return `[TITLE:${title}] [TAGS:${tags.join(',')}] ${content}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── sub-components ──────────────────────────────────────────────────────────

function NoteCard({ note, onDelete }: { note: any; onDelete: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);
  const { title, tags, content } = note;
  
  // Simulated linked insights for the UI feel
  const linkedInsights = Math.floor(Math.random() * 3);

  const tagClass = (tag: string) => TAG_COLORS[tag] || 'text-muted-foreground bg-surface-700 border-surface-600';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="card-hover p-5 cursor-pointer group relative flex flex-col h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-accent-400 transition-colors line-clamp-1">
          {title}
        </h3>
        {hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-90"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">{content}</p>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-700/50">
        <div className="flex flex-wrap gap-1.5">
          {tags.length > 0 ? (
            tags.map((tag: string) => (
              <span key={tag} className={`badge border text-[10px] ${tagClass(tag)}`}>
                {tag}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-muted-foreground/30 flex items-center gap-1">
              <TagIcon size={10} /> untagged
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-shrink-0 ml-2">
          {linkedInsights > 0 && (
            <span className="flex items-center gap-1 text-accent-400 font-bold">
              <Sparkles size={10} /> {linkedInsights} insights
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {timeAgo(note.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function AddNoteModal({ onClose, onAdd }: { onClose: () => void; onAdd: (content: string) => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setTags((prev) => [...new Set([...prev, tagInput.trim().toLowerCase()])]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    const packed = packNoteContent(title.trim(), tags, content.trim());
    onAdd(packed);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
          <h2 className="text-sm font-semibold text-white">Establish New Memory</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="section-label block mb-2">Subject Coordinate</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief identifier..."
              className="input-base"
            />
          </div>
          <div>
            <label className="section-label block mb-2">Cognitive Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely. Your twin will synchronize with this data..."
              rows={5}
              className="input-base resize-none"
            />
          </div>
          <div>
            <label className="section-label block mb-2">Neural Tags</label>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add tag and press Enter"
              className="input-base"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tags.map((tag) => (
                  <span key={tag} className="badge bg-accent-500/10 text-accent-400 border border-accent-500/20 gap-1.5 pl-2 pr-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-white p-0.5 rounded-sm"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-700">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="btn-primary disabled:opacity-40"
          >
            <FileText size={14} />
            Establish Memory
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export function NotesPage() {
  const { notes, addNote, deleteNote, fetchNotes } = useNotesStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const parsedNotes = notes.map(n => ({ ...n, ...parseNoteContent(n.content) }));
  const allTags = [...new Set(parsedNotes.flatMap(n => n.tags))];

  const filtered = parsedNotes.filter((n) => {
    const matchesSearch = !search || 
      n.title.toLowerCase().includes(search.toLowerCase()) || 
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTag || n.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <PageHeader
        title="Memories"
        subtitle="Every note feeds your twin's understanding of your cognitive fingerprint."
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={14} strokeWidth={3} />
            New Memory
          </button>
        }
      />

      {/* Filter Layer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="relative w-full max-w-sm group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent-400 transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memory patterns..."
            className="input-base pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-[11px] px-3 py-1 rounded-full border transition-all duration-200 font-bold uppercase tracking-wider ${
                activeTag === tag
                  ? 'bg-accent-500/15 text-accent-400 border-accent-500/30 shadow-[0_0_15px_rgba(0,204,102,0.1)]'
                  : 'text-muted-foreground border-surface-700 hover:border-surface-600 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
          {activeTag && (
             <button onClick={() => setActiveTag(null)} className="text-[10px] text-muted-foreground hover:text-white ml-2 flex items-center gap-1">
               <X size={10} /> Clear
             </button>
          )}
        </div>
      </div>

      {/* Vital Stats */}
      <div className="flex items-center gap-8 mb-8 px-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-white tracking-tight">{notes.length}</span>
          <span className="section-label translate-y-0.5">Established</span>
        </div>
        <div className="h-6 w-px bg-surface-700" />
        <div>
          <span className="text-white font-bold">{allTags.length}</span>
          <span className="ml-2 section-label">Active Topics</span>
        </div>
        {notes.length > 0 && (
          <>
            <div className="h-6 w-px bg-surface-700" />
            <div className="text-[11px] font-medium tracking-tight">
              Last Synced <span className="text-white ml-1.5">{timeAgo(notes[0].created_at)}</span>
            </div>
          </>
        )}
      </div>

      {/* Grid Display */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search || activeTag ? "No matches found" : "Neural base empty"}
          description={search || activeTag ? "Try adjusting your query or filters." : "Start capturing your thoughts. Each memory expands your twin's intelligence."}
          action={
            !search && !activeTag && (
              <button onClick={() => setShowModal(true)} className="btn-primary">
                <Plus size={14} /> Write your first memory
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {showModal && <AddNoteModal onClose={() => setShowModal(false)} onAdd={addNote} />}
    </div>
  );
}
