import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chat.store';
import { Send, User, Trash2, Brain } from 'lucide-react';
import { cn } from '../lib/utils';
import { WolfIcon } from '../components/ui/WolfIcon';

export function ChatPage() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, loading, clearChat } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-bold tracking-[-0.03em]">Neural <span className="gradient-text">Dialogue</span></h1>
          <p className="text-muted-foreground text-[14px]">Refining your digital essence through conversation.</p>
        </div>
        <button
          onClick={clearChat}
          className="p-2.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all active-click"
          title="Clear consciousness stream"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 glass rounded-[32px] p-6 overflow-y-auto space-y-8 scrollbar-hide scroll-smooth relative"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={cn(
                "flex items-start gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group relative",
                msg.role === 'user' ? "bg-primary emerald-glow" : "bg-black/40 border border-[#00CC6630]"
              )}>
                {msg.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <WolfIcon className="w-6 h-6 text-primary scale-90 group-hover:scale-100 transition-transform" />
                )}
                {msg.role === 'assistant' && (
                  <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-full z-[-1]" />
                )}
              </div>
              <div className={cn(
                "p-5 rounded-[24px] text-[14px] leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-gradient-to-br from-[#00CC66]/80 to-[#00B3B3]/60 text-white rounded-tr-sm" 
                  : "glass text-foreground rounded-tl-sm border-[#00CC6620]"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#00CC6630] flex items-center justify-center">
              <WolfIcon className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div className="flex gap-1.5 p-4 glass rounded-2xl rounded-tl-sm">
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}

        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col justify-center items-center opacity-20 space-y-6 py-20">
            <div className="p-8 rounded-full bg-primary/5 relative">
              <Brain className="w-24 h-24 text-primary" strokeWidth={1} />
              <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full" />
            </div>
            <p className="text-[14px] font-medium tracking-wide uppercase">Initiate consciousness stream</p>
          </div>
        )}
      </div>

      <form 
        onSubmit={handleSend} 
        className="relative group transition-all"
      >
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Transmit thoughts to your digital twin..."
          className="w-full pl-6 pr-16 py-5 rounded-[24px] bg-black/40 border border-[#00CC6620] focus:border-[#00CC6660] focus:ring-0 focus:shadow-[0_0_20px_rgba(0,204,102,0.05),0_0_0_1px_rgba(0,204,102,0.3)] outline-none transition-all placeholder:text-muted-foreground/30 text-[14px] leading-relaxed resize-none overflow-hidden"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 active-click group/btn shadow-[0_0_20px_rgba(0,204,102,0.2)] hover:scale(1.05)"
          disabled={!input.trim() || loading}
        >
          <Send className="w-5 h-5 transition-transform group-hover/btn:rotate-[15deg]" />
        </button>
      </form>
    </div>
  );
}
