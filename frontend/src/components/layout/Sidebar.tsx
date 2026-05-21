import { Link, useLocation } from 'react-router-dom';
import { memo } from 'react';
import { Home, MessageSquare, StickyNote, BarChart2, User, LogOut, Brain, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useNotesStore } from '../../store/notes.store';
import { useChatStore } from '../../store/chat.store';
import { cn } from '../../lib/utils';
import { WolfIcon } from '../ui/WolfIcon';

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',  icon: Home,          path: '/dashboard' },
  { id: 'chat',       label: 'Chat',       icon: MessageSquare,  path: '/chat' },
  { id: 'notes',      label: 'Memories',   icon: StickyNote,     path: '/notes' },
  { id: 'simulation', label: 'Simulate',   icon: Zap,            path: '/simulation' },
  { id: 'insights',   label: 'Insights',   icon: BarChart2,      path: '/insights' },
  { id: 'profile',    label: 'Profile',    icon: User,           path: '/profile' },
];

/** Small dot-badge for nav items */
function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span style={{
      marginLeft: 'auto',
      fontSize: '10px', fontWeight: 600,
      background: 'var(--app-accent)',
      color: '#fff',
      borderRadius: '9px',
      padding: '1px 6px',
      lineHeight: '16px',
      minWidth: '18px',
      textAlign: 'center',
      flexShrink: 0,
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

/** Twin status pill — shows learning state based on memory count */
const TwinStatus = memo(function TwinStatus({ memoryCount, isThinking }: { memoryCount: number; isThinking: boolean }) {
  const status = isThinking
    ? { label: 'Thinking',  color: '#f59e0b', pulse: true }
    : memoryCount === 0
      ? { label: 'Idle',     color: 'var(--app-faint)', pulse: false }
      : memoryCount < 5
        ? { label: 'Learning',color: '#3b82f6', pulse: true }
        : { label: 'Active',  color: '#10b981', pulse: false };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.025)',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.06)',
      marginBottom: '8px',
    }}>
      <Brain size={13} style={{ color: status.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1 }}>
          Twin is {status.label}
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '3px', lineHeight: 1 }}>
          {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'} indexed
        </div>
      </div>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: status.color, flexShrink: 0,
        animation: status.pulse ? 'twin-pulse 2s ease infinite' : 'none',
      }} />
      <style>{`
        @keyframes twin-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
});

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
      <aside className="hidden md:flex flex-col h-screen w-[240px] bg-black/60 backdrop-blur-xl border-r border-[#00CC6610] p-4 fixed left-0 top-0 z-50">
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          height: '56px',
          padding: '0 16px',
          borderBottom: '1px solid var(--app-border)',
          marginBottom: '24px'
        }} className="group overflow-hidden">
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="10" height="14" rx="2" stroke="var(--app-accent)" strokeWidth="1.5" fill="none"/>
              <rect x="8" y="5" width="10" height="14" rx="2" stroke="var(--app-accent)" strokeWidth="1.5" fill="var(--app-bg)" fillOpacity="0.8"/>
              <path d="M8 9h5.5a2 2 0 010 4H8" stroke="var(--app-accent)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--app-text)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            whiteSpace: 'nowrap'
          }}>
            PersonaTwin
          </h1>
        </div>

        {/* Twin state widget */}
        <div className="px-0 mb-4">
          <TwinStatus memoryCount={memoryCount} isThinking={chatLoading} />
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const badge = item.id === 'notes' ? memoryCount : item.id === 'chat' ? unreadChat : 0;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  'relative flex items-center h-[40px] gap-3 px-3 rounded-lg transition-all duration-150 group overflow-hidden',
                  active
                    ? 'text-white bg-[#00CC6610] border border-[#00CC6622]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent'
                )}
              >
                <item.icon className={cn(
                  'w-[16px] h-[16px] stroke-[1.6] flex-shrink-0',
                  active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )} />
                <span className="font-medium text-[13px] leading-none flex-1 truncate">{item.label}</span>
                {badge > 0 && !active && <Badge count={badge} />}
                {active && (
                  <span style={{ width: '3px', height: '14px', background: 'var(--primary, #00CC66)', borderRadius: '2px', flexShrink: 0 }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/[0.04] space-y-1">
          <div className="px-3 py-2">
            <p className="text-[11px] text-muted-foreground truncate font-mono opacity-60">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center h-[40px] gap-3 px-3 rounded-lg transition-all duration-150 text-muted-foreground hover:text-red-400 hover:bg-red-400/8 group border border-transparent"
          >
            <LogOut className="w-[16px] h-[16px] stroke-[1.6] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            <span className="font-medium text-[13px]">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass backdrop-blur-2xl border-t border-[#00CC6615] flex items-center justify-around px-4 z-50">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                'p-2 rounded-xl transition-all duration-150',
                active ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-6 h-6 stroke-[1.5]" />
            </Link>
          );
        })}
      </nav>

      {/* Desktop spacer */}
      <div className="hidden md:block w-[240px] flex-shrink-0" />
    </>
  );
}
