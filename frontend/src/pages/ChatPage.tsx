import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Info } from 'lucide-react';
import { useChatStore } from '../store/chat.store';
import { useAuthStore } from '../store/auth.store';
import { useNotesStore } from '../store/notes.store';
import TypingIndicator from '../components/TypingIndicator';

// ─── conversation starters shown until user has sent a few messages ───────────
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
      className={`flex items-end gap-3 ${isTwin ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      {isTwin ? (
        <div className="w-7 h-7 rounded-full bg-accent-500/20 border border-accent-500/30 flex items-center justify-center flex-shrink-0 mb-0.5">
          <span className="text-[9px] font-bold text-accent-400">T</span>
        </div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center flex-shrink-0 mb-0.5">
          <span className="text-[9px] font-bold text-slate-300">{userInitials}</span>
        </div>
      )}

      {/* Bubble */}
      <div className="max-w-[68%] group">
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isTwin
            ? 'bg-surface-800 border border-surface-700 text-slate-200 rounded-bl-sm'
            : 'bg-accent-500 text-white rounded-br-sm'
        }`}>
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
  // Track which message indices are "new" for entrance animation
  const [newCount, setNewCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Derive user initials (up to 2 chars)
  const initials = (
    user?.full_name
      ? user.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2)
      : user?.email?.charAt(0) ?? 'U'
  ).toUpperCase();

  // Auto-scroll on new messages or typing indicator
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewCount(messages.length);
  }, [messages, thinking]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    sendMessage(text);
    // Auto-resize reset
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
    <div className="flex flex-col h-[calc(100vh-52px)]">

      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-surface-700 bg-surface-900/50 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Twin avatar with online dot */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-accent-500/20 border border-accent-500/30 flex items-center justify-center">
              <span className="text-xs font-bold text-accent-400">T</span>
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-surface-900" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Your Twin</div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {thinking
                ? 'Thinking…'
                : memoryCount > 0
                  ? `Active — ${memoryCount} ${memoryCount === 1 ? 'memory' : 'memories'} loaded`
                  : 'Active — add memories to enrich responses'}
            </div>
          </div>
        </div>
        <button
          onClick={() => {}}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white border border-transparent hover:border-surface-600 px-3 py-1.5 rounded-lg transition-all duration-150"
        >
          <Info size={13} />
          Memory context
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scroll-smooth">

        {/* Empty state */}
        {messages.length === 0 && !thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mb-4">
              <Sparkles size={22} className="text-accent-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">Start a conversation</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
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

      {/* ── Suggestions (shown when conversation just started) ── */}
      <AnimatePresence>
        {messages.length <= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="px-6 pb-3 flex gap-2 flex-wrap"
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-[11px] text-muted-foreground border border-surface-600 hover:border-accent-500/40 hover:text-accent-400 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-accent-500/5"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <div className="px-6 py-4 border-t border-surface-700 bg-surface-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-end gap-3 bg-surface-800 border border-surface-600 focus-within:border-accent-500/60 rounded-xl px-4 py-3 transition-all duration-200">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Talk to your twin…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-muted-foreground/40 resize-none outline-none leading-relaxed overflow-auto"
            style={{ minHeight: '1.5rem', maxHeight: '8rem' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg bg-accent-500 hover:bg-accent-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-150 flex-shrink-0 active:scale-90"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground/50 text-center">
          Your Twin uses your memories to respond. Everything is private.
        </p>
      </div>
    </div>
  );
}
