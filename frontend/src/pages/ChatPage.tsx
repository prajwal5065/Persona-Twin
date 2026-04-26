import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chat.store';
import { Send, User, Bot, Trash2, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export function ChatPage() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, loading, clearChat } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] max-w-4xl mx-auto space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chat with <span className="gradient-text">Twin</span></h1>
          <p className="text-muted-foreground text-sm">Experience your thoughts reflected back.</p>
        </div>
        <button
          onClick={clearChat}
          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
          title="Clear session"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 glass rounded-2xl p-4 overflow-y-auto space-y-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-3 max-w-[80%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                msg.role === 'user' ? "bg-primary" : "bg-white/10 border border-white/10"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-purple-400" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-white/5 border border-white/10 rounded-tl-none ring-1 ring-white/5"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}

        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-center flex-col justify-center items-center opacity-40 space-y-4">
            <MessageSquare className="w-12 h-12" />
            <p className="text-sm font-medium">How are we feeling today?</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full pl-6 pr-14 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50"
          disabled={!input.trim() || loading}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
