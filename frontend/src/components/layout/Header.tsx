import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useNotesStore } from '../../store/notes.store';
import { useChatStore } from '../../store/chat.store';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard',  subtitle: 'Overview'   },
  '/':          { title: 'Dashboard',  subtitle: 'Overview'   },
  '/chat':      { title: 'Chat',       subtitle: 'Your twin'  },
  '/notes':     { title: 'Memories',   subtitle: 'Knowledge base' },
  '/insights':  { title: 'Insights',   subtitle: 'Behavioral analysis' },
  '/profile':   { title: 'Profile',    subtitle: 'Personality model' },
};

export function Header() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const notes = useNotesStore((state) => state.notes);
  const isThinking = useChatStore((state) => state.loading);

  const meta = pageMeta[location.pathname] ?? pageMeta['/dashboard'];
  const initial = (user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase();

  return (
    <div style={{
      height: '52px',
      background: 'var(--app-bg)',
      borderBottom: '1px solid var(--app-border)',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      gap: '16px',
    }}>
      {/* Left: page breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--app-text)', letterSpacing: '-0.01em', lineHeight: 1 }}>
          {meta.title}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--app-faint)', lineHeight: 1 }}>
          {meta.subtitle}
        </span>
      </div>

      {/* Right: twin status + memory pill + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Thinking indicator */}
        {isThinking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--app-accent)', fontWeight: 500 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--app-accent)', animation: 'twin-pulse 1.2s ease infinite' }} />
            Thinking…
            <style>{`@keyframes twin-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
          </div>
        )}

        {/* Memory count pill */}
        {notes.length > 0 && (
          <div style={{
            fontSize: '11px', fontWeight: 500,
            color: 'var(--app-muted)',
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            borderRadius: '20px',
            padding: '3px 10px',
            lineHeight: 1.5,
          }}>
            {notes.length} {notes.length === 1 ? 'memory' : 'memories'}
          </div>
        )}

        {/* Avatar */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--app-accent-dim)',
          border: '1px solid var(--app-border2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 600, color: 'var(--app-accent)',
          flexShrink: 0, cursor: 'default',
          title: user?.email,
        } as React.CSSProperties}>
          {initial}
        </div>

      </div>
    </div>
  );
}
