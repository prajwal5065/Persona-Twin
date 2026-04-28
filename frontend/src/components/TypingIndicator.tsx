import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex items-end gap-3"
    >
      {/* Twin avatar */}
      <div className="w-7 h-7 rounded-full bg-accent-500/20 border border-accent-500/30 flex items-center justify-center flex-shrink-0 mb-0.5">
        <span className="text-[9px] font-bold text-accent-400">T</span>
      </div>
      {/* Dot bubble */}
      <div className="px-4 py-3 bg-surface-800 border border-surface-700 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-400/70 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent-400/70 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent-400/70 animate-bounce" />
      </div>
    </motion.div>
  );
}
