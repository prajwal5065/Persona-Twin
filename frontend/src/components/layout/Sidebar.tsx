import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, StickyNote, BarChart2, User, LogOut, Brain, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useNotesStore } from '../../store/notes.store';
import { useChatStore } from '../../store/chat.store';
import { cn } from '../../lib/utils';

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',  icon: Home,          path: '/dashboard' },
  { id: 'chat',       label: 'Chat',       icon: MessageSquare,  path: '/chat' },
  { id: 'notes',      label: 'Memories',   icon: StickyNote,     path: '/notes' },
  { id: 'simulation', label: 'Simulate',   icon: Zap,            path: '/simulation' },
  { id: 'insights',   label: 'Insights',   icon: BarChart2,      path: '/insights' },
  { id: 'profile',    label: 'Profile',    icon: User,           path: '/profile' },
];

/** Orange badge counter */
function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span style={{
      marginLeft: 'auto',
      fontSize: '10px',
      fontWeight: 600,
      background: 'var(--primary)',
      color: '#fff',
      borderRadius: 'var(--radius-full)',
      padding: '1px 7px',
      lineHeight: '16px',
      minWidth: '18px',
      textAlign: 'center',
      flexShrink: 0,
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

/** Twin status widget */
function TwinStatus({ memoryCount, isThinking }: { memoryCount: number; isThinking: boolean }) {
  const status = isThinking
    ? { label: 'Thinking',  color: 'var(--primary)' }
    : memoryCount === 0
      ? { label: 'Idle',     color: 'var(--muted-text)' }
      : memoryCount < 5
        ? { label: 'Learning', color: '#3b82f6' }
        : { label: 'Active',   color: '#10b981' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 12px',
      background: 'rgba(247,97,30,0.06)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid rgba(247,97,30,0.12)',
      marginBottom: 8,
    }}>
      <Brain size={13} style={{ color: status.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>
          Twin is {status.label}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--steel)', marginTop: 3, lineHeight: 1 }}>
          {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'} indexed
        </div>
      </div>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: status.color, flexShrink: 0,
      }} />
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const notes = useNotesStore((state) => state.notes);
  const chatLoading = useChatStore((state) => state.loading);
  const chatMessages = useChatStore((state) => state.messages);

  const memoryCount = notes.length;
  const unreadChat = chatMessages.filter(m => m.role === 'assistant').length;

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    return location.pathname === path;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col h-screen w-[240px] fixed left-0 top-0 z-50"
        style={{
          background: 'var(--cream-soft)',
          borderRight: '1px solid var(--beige-deep)',
          padding: '0 12px',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          height: 64,
          padding: '0 4px',
          borderBottom: '1px solid var(--beige-deep)',
          marginBottom: 20,
        }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: 6,
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="10" height="14" rx="2" stroke="white" strokeWidth="1.5" fill="none"/>
              <rect x="8" y="5" width="10" height="14" rx="2" stroke="white" strokeWidth="1.5" fill="rgba(0,0,0,0.2)"/>
              <path d="M8 9h5.5a2 2 0 010 4H8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}>
            PersonaTwin
          </h1>
        </div>

        {/* Twin state widget */}
        <div style={{ marginBottom: 8 }}>
          <TwinStatus memoryCount={memoryCount} isThinking={chatLoading} />
        </div>

        {/* Section label */}
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--steel)', padding: '0 4px', marginBottom: 6 }}>
          Navigation
        </p>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            const badge = item.id === 'notes' ? memoryCount : item.id === 'chat' ? unreadChat : 0;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn('nav-item', active && 'active')}
              >
                <item.icon
                  size={16}
                  style={{
                    flexShrink: 0,
                    color: active ? 'var(--primary)' : 'var(--steel)',
                  }}
                />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                {badge > 0 && !active && <Badge count={badge} />}
                {active && (
                  <span style={{
                    width: 3, height: 14,
                    background: 'var(--primary)',
                    borderRadius: 2,
                    flexShrink: 0,
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 12,
          borderTop: '1px solid var(--beige-deep)',
          paddingBottom: 12,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {/* Sunset stripe mini */}
          <div className="sunset-stripe" style={{ marginBottom: 12, borderRadius: 4 }} />

          <div style={{ padding: '0 4px 4px' }}>
            <p style={{ fontSize: 11, color: 'var(--steel)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            style={{
              display: 'flex', width: '100%', alignItems: 'center', height: 40, gap: 10,
              padding: '0 12px', borderRadius: 8,
              color: 'var(--steel)',
              background: 'none', border: '1px solid transparent',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              transition: 'color 150ms ease, background 150ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#dc2626';
              (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.06)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--steel)';
              (e.currentTarget as HTMLElement).style.background = 'none';
            }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-4 z-50"
        style={{
          background: 'var(--cream-soft)',
          borderTop: '1px solid var(--beige-deep)',
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              style={{
                padding: 8,
                borderRadius: 8,
                color: active ? 'var(--primary)' : 'var(--steel)',
                background: active ? 'rgba(247,97,30,0.08)' : 'transparent',
                transition: 'color 150ms ease, background 150ms ease',
              }}
            >
              <item.icon size={22} style={{ display: 'block' }} />
            </Link>
          );
        })}
      </nav>

      {/* Desktop spacer */}
      <div className="hidden md:block w-[240px] flex-shrink-0" />
    </>
  );
}
