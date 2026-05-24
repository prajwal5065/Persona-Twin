import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}
    >
      {/* Twin avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'rgba(247,97,30,0.10)',
        border: '1px solid rgba(247,97,30,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginBottom: 2,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>T</span>
      </div>
      {/* Dot bubble */}
      <div style={{
        padding: '10px 14px',
        background: 'var(--canvas)',
        border: '1px solid var(--hairline-soft)',
        borderRadius: '12px 12px 12px 3px',
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {['-0.3s', '-0.15s', '0s'].map((delay, i) => (
          <span
            key={i}
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'rgba(247,97,30,0.5)',
              display: 'inline-block',
              animation: `bounce 1.2s ${delay} infinite`,
            }}
          />
        ))}
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-5px); }
          }
        `}</style>
      </div>
    </motion.div>
  );
}
