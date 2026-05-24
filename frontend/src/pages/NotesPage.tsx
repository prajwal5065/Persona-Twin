import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Sparkles, Search, X, Trash2, Calendar, Tag as TagIcon } from 'lucide-react';
import { useNotesStore } from '../store/notes.store';
import EmptyState from '../components/EmptyState';

// ─── types & constants ───────────────────────────────────────────────────────

const TAG_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  productivity:      { text: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)' },
  habits:            { text: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
  psychology:        { text: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
  work:              { text: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  energy:            { text: 'var(--primary)', bg: 'rgba(247,97,30,0.08)', border: 'rgba(247,97,30,0.2)' },
  values:            { text: '#e11d48', bg: 'rgba(225,29,72,0.08)',  border: 'rgba(225,29,72,0.2)' },
  philosophy:        { text: '#06b6d4', bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.2)' },
  growth:            { text: '#14b8a6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.2)' },
  'decision-making': { text: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
};

const DEFAULT_TAG = { text: 'var(--steel)', bg: 'var(--surface)', border: 'var(--hairline)' };

function parseNoteContent(rawContent: string) {
  const titleMatch = rawContent.match(/\[TITLE:(.*?)\]/);
  const tagsMatch = rawContent.match(/\[TAGS:(.*?)\]/);
  let content = rawContent;
  let title = '';
  let tags: string[] = [];
  if (titleMatch) { title = titleMatch[1]; content = content.replace(titleMatch[0], ''); }
  if (tagsMatch) { tags = tagsMatch[1].split(',').filter(Boolean); content = content.replace(tagsMatch[0], ''); }
  content = content.trim();
  if (!title) { const lines = content.split('\n'); title = lines[0].slice(0, 50) + (lines[0].length > 50 ? '...' : ''); }
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

// ─── NoteCard ──────────────────────────────────────────────────────────────

function NoteCard({ note, onDelete }: { note: any; onDelete: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);
  const { title, tags, content } = note;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="card-hover"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <h3 style={{
          fontSize: 14, fontWeight: 600, color: 'var(--ink)',
          lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
          transition: 'color 150ms',
        }}>
          {title}
        </h3>
        {hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            style={{
              flexShrink: 0, padding: '4px 6px', borderRadius: 6,
              color: 'var(--steel)', background: 'none', border: 'none',
              cursor: 'pointer', transition: 'color 150ms, background 150ms',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#dc2626';
              (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--steel)';
              (e.currentTarget as HTMLElement).style.background = 'none';
            }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <p style={{
        fontSize: 13, color: 'var(--slate)', lineHeight: 1.6, flex: 1,
        marginBottom: 16,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
      }}>
        {content}
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '1px solid var(--hairline-soft)',
        marginTop: 'auto',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tags.length > 0 ? (
            tags.map((tag: string) => {
              const tc = TAG_COLORS[tag] || DEFAULT_TAG;
              return (
                <span key={tag} style={{
                  fontSize: 10, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 999,
                  color: tc.text, background: tc.bg,
                  border: `1px solid ${tc.border}`,
                }}>
                  {tag}
                </span>
              );
            })
          ) : (
            <span style={{ fontSize: 10, color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <TagIcon size={10} /> untagged
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, color: 'var(--steel)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <Calendar size={10} />
          {timeAgo(note.created_at)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── AddNoteModal ─────────────────────────────────────────────────────────────

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
    onAdd(packNoteContent(title.trim(), tags, content.trim()));
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16,
    }}>
      <div
        className="animate-scale-in"
        style={{
          background: 'var(--cream)',
          border: '1px solid var(--beige-deep)',
          borderRadius: 16,
          width: '100%', maxWidth: 520,
          boxShadow: 'var(--shadow-4)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid var(--beige-deep)',
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20, fontWeight: 400, color: 'var(--ink)',
          }}>
            New Memory
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--steel)', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate)', marginBottom: 6 }}>
              Title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief identifier..."
              className="input-base"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate)', marginBottom: 6 }}>
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely. Your twin will synchronize with this data..."
              rows={5}
              className="input-base"
              style={{ height: 'auto', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate)', marginBottom: 6 }}>
              Tags
            </label>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add tag and press Enter"
              className="input-base"
            />
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {tags.map((tag) => (
                  <span key={tag} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 11, fontWeight: 600,
                    background: 'rgba(247,97,30,0.08)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(247,97,30,0.2)',
                    padding: '3px 8px 3px 10px',
                    borderRadius: 999,
                  }}>
                    {tag}
                    <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1 }}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
          padding: '14px 24px',
          borderTop: '1px solid var(--beige-deep)',
        }}>
          <button onClick={onClose} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>Cancel</button>
          <button
            id="save-note-btn"
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="btn-primary"
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            <FileText size={13} />
            Save Memory
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
    const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTag || n.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>

      {/* Page header band */}
      <div style={{
        background: 'var(--canvas)',
        borderBottom: '1px solid var(--hairline-soft)',
        padding: '28px 32px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', maxWidth: 1200, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--steel)', marginBottom: 6 }}>
              Memory Bank
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 400, fontSize: 32, color: 'var(--ink)',
              letterSpacing: '-0.5px', lineHeight: 1.15,
            }}>
              Memories
            </h1>
            <p style={{ fontSize: 14, color: 'var(--slate)', marginTop: 6 }}>
              Every note feeds your twin's understanding of your cognitive fingerprint.
            </p>
          </div>
          <button
            id="new-memory-btn"
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus size={14} strokeWidth={2.5} />
            New Memory
          </button>
        </div>
      </div>

      {/* Sunset stripe */}
      <div className="sunset-stripe" />

      {/* Filters + content */}
      <div style={{ padding: '28px 32px', maxWidth: 1200 }}>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--hairline-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 400, fontSize: 36, color: 'var(--ink)', lineHeight: 1,
            }}>{notes.length}</span>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--steel)' }}>Stored</span>
          </div>
          <div style={{ height: 24, width: 1, background: 'var(--hairline)' }} />
          <div>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{allTags.length}</span>
            <span style={{ fontSize: 12, color: 'var(--steel)', marginLeft: 8, fontWeight: 500 }}>Active Topics</span>
          </div>
          {notes.length > 0 && (
            <>
              <div style={{ height: 24, width: 1, background: 'var(--hairline)' }} />
              <div style={{ fontSize: 12, color: 'var(--steel)' }}>
                Last synced <span style={{ color: 'var(--ink)', fontWeight: 600, marginLeft: 4 }}>{timeAgo(notes[0].created_at)}</span>
              </div>
            </>
          )}
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 320, flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--steel)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memories..."
              className="input-base"
              style={{ paddingLeft: 36 }}
            />
          </div>

          {/* Tag filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '5px 12px', borderRadius: 999,
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  ...(activeTag === tag
                    ? { background: 'rgba(247,97,30,0.12)', color: 'var(--primary)', borderColor: 'rgba(247,97,30,0.3)' }
                    : { background: 'var(--canvas)', color: 'var(--slate)', borderColor: 'var(--hairline)' }),
                }}
              >
                {tag}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                style={{ fontSize: 11, color: 'var(--steel)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}
              >
                <X size={10} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={search || activeTag ? 'No matches found' : 'Memory bank empty'}
            description={search || activeTag ? 'Try adjusting your query or filters.' : "Start capturing your thoughts. Each memory expands your twin's intelligence."}
            action={
              !search && !activeTag && (
                <button onClick={() => setShowModal(true)} className="btn-primary">
                  <Plus size={14} /> Write your first memory
                </button>
              )
            }
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((note) => (
                <NoteCard key={note.id} note={note} onDelete={deleteNote} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Sunset stripe */}
        <div className="sunset-stripe" style={{ marginTop: 48, borderRadius: 4 }} />
      </div>

      {showModal && <AddNoteModal onClose={() => setShowModal(false)} onAdd={addNote} />}
    </div>
  );
}
