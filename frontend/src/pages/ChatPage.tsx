import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Info } from 'lucide-react';
import { useChatStore } from '../store/chat.store';
import { useAuthStore } from '../store/auth.store';
import { useNotesStore } from '../store/notes.store';
import TypingIndicator from '../components/TypingIndicator';

// ─── conversation starters ────────────────────────────────────────────────────
const SUGGESTIONS = [
  'What patterns do you see in my recent thinking?',
  'Help me think through a difficult decision',
  'What have I been avoiding lately?',
  'Summarize my personality in one paragraph',
];

// ─── single message bubble ────────────────────────────────────────────────────
function ChatMessage({
  message,
  isNew,
  userInitials,
}: {
  message: { role: 'user' | 'assistant'; content: string };
  isNew: boolean;
  userInitials: string;
}) {
  const isTwin = message.role === 'assistant';

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexDirection: isTwin ? 'row' : 'row-reverse' }}
    >
      {/* Avatar */}
      {isTwin ? (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(247,97,30,0.1)',
          border: '1px solid rgba(247,97,30,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginBottom: 2,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>T</span>
        </div>
      ) : (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--cream)',
          border: '1px solid var(--beige-deep)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginBottom: 2,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate)' }}>{userInitials}</span>
        </div>
      )}

      {/* Bubble */}
      <div style={{ maxWidth: '68%' }}>
        <div style={{
          padding: '10px 14px',
          borderRadius: isTwin ? '12px 12px 12px 3px' : '12px 12px 3px 12px',
          fontSize: 14,
          lineHeight: 1.6,
          ...(isTwin
            ? { background: 'var(--canvas)', border: '1px solid var(--hairline-soft)', color: 'var(--charcoal)' }
            : { background: 'var(--primary)', color: 'white' }
          ),
        }}>
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export function ChatPage() {
  const { messages, thinking, loading, sendMessage } = useChatStore();
  const user = useAuthStore((s) => s.user);
  const notes = useNotesStore((s) => s.notes);

  const [input, setInput] = useState('');
  const [newCount, setNewCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const initials = (
    user?.full_name
      ? user.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2)
      : user?.email?.charAt(0) ?? 'U'
  ).toUpperCase();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewCount(messages.length);
  }, [messages, thinking]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    sendMessage(text);
    if (inputRef.current) inputRef.current.style.height = 'auto';
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 128)}px`;
    }
  };

  const memoryCount = notes.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)', background: 'var(--surface)' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '0 24px',
        height: 64,
        borderBottom: '1px solid var(--hairline-soft)',
        background: 'var(--canvas)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Twin avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(247,97,30,0.1)',
              border: '1px solid rgba(247,97,30,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>T</span>
            </div>
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 10, height: 10, borderRadius: '50%',
              background: '#10b981',
              border: '2px solid var(--canvas)',
            }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Your Twin</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#10b981' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              {thinking
                ? 'Thinking…'
                : memoryCount > 0
                  ? `Active — ${memoryCount} ${memoryCount === 1 ? 'memory' : 'memories'}`
                  : 'Active — add memories'}
            </div>
          </div>
        </div>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'var(--steel)',
            background: 'none', border: '1px solid var(--hairline)',
            padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            transition: 'color 150ms, border-color 150ms',
          }}
        >
          <Info size={13} />
          Memory context
        </button>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Empty state */}
        {messages.length === 0 && !thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', paddingBottom: 40 }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(247,97,30,0.08)',
              border: '1px solid rgba(247,97,30,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Sparkles size={22} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Start a conversation</h3>
            <p style={{ fontSize: 13, color: 'var(--slate)', maxWidth: 280, lineHeight: 1.55 }}>
              Your Twin has read all your memories and is ready to reflect with you.
            </p>
          </motion.div>
        )}

        {/* Message list */}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              message={msg}
              isNew={i >= newCount - 1}
              userInitials={initials}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {thinking && <TypingIndicator />}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── Suggestions ── */}
      <AnimatePresence>
        {messages.length <= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            style={{ padding: '0 24px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                style={{
                  fontSize: 11, color: 'var(--slate)',
                  border: '1px solid var(--hairline)',
                  background: 'var(--canvas)',
                  padding: '6px 12px', borderRadius: 999,
                  cursor: 'pointer',
                  transition: 'border-color 150ms, color 150ms',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(247,97,30,0.4)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--hairline)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--slate)';
                }}
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--hairline-soft)',
        background: 'var(--canvas)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          background: 'var(--surface)',
          border: '1px solid var(--hairline-strong)',
          borderRadius: 10,
          padding: '10px 14px',
          transition: 'border-color 150ms',
        }}
          onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'}
          onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--hairline-strong)'}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Talk to your twin…"
            rows={1}
            style={{
              flex: 1, background: 'transparent',
              fontSize: 14, color: 'var(--ink)',
              resize: 'none', outline: 'none',
              lineHeight: 1.55, minHeight: '1.5rem', maxHeight: '8rem',
              border: 'none', padding: 0,
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <button
            id="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: input.trim() && !loading ? 'var(--primary)' : 'var(--hairline)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 150ms ease',
            }}
          >
            <Send size={14} style={{ color: input.trim() && !loading ? 'white' : 'var(--muted-text)' }} />
          </button>
        </div>
        <p style={{ marginTop: 8, fontSize: 11, color: 'var(--steel)', textAlign: 'center' }}>
          Your Twin uses your memories to respond. Everything is private.
        </p>
      </div>

      {/* Sunset stripe at very bottom */}
      <div className="sunset-stripe" />
    </div>
  );
}
