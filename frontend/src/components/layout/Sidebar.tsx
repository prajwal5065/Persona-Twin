import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, StickyNote, BarChart2, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '../../lib/utils';
import { WolfIcon } from '../ui/WolfIcon';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
  { id: 'notes', label: 'Notes', icon: StickyNote, path: '/notes' },
  { id: 'insights', label: 'Insights', icon: BarChart2, path: '/insights' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-[240px] bg-black/60 backdrop-blur-xl border-r border-[#00CC6610] p-4 fixed left-0 top-0 z-50">
        <div className="flex items-center gap-3 px-3 py-6 mb-8 group overflow-hidden">
          <WolfIcon className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(0,204,102,0.4)] transition-transform duration-300 group-hover:scale-110" />
          <h1 className="text-xl font-semibold tracking-[-0.03em] text-foreground leading-none">
            Self<span className="text-primary">Twin</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                   "relative flex items-center h-[44px] gap-3 px-3 rounded-lg transition-all duration-200 group overflow-hidden",
                  isActive 
                    ? "text-white bg-[#00CC6610] border-l-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                )}
              >
                <item.icon className={cn(
                  "w-[18px] h-[18px] stroke-[1.5]",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="font-medium text-[14px] leading-none">{item.label}</span>
                <div className={cn(
                  "absolute bottom-0 left-0 h-[1px] bg-primary transition-all duration-300",
                  isActive ? "w-0" : "w-0 group-hover:w-full"
                )} />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/[0.03] space-y-4">
          <div className="px-3">
            <p className="text-[12px] text-muted-foreground truncate font-mono">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center h-[44px] gap-3 px-3 rounded-lg transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10 group"
          >
            <LogOut className="w-[18px] h-[18px] stroke-[1.5] group-hover:translate-x-0.5 transition-transform" />
            <span className="font-medium text-[14px]">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass backdrop-blur-2xl border-t border-[#00CC6615] flex items-center justify-around px-4 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-6 h-6 stroke-[1.5]" />
            </Link>
          );
        })}
      </nav>

      {/* Spacer for desktop layout since sidebar is fixed */}
      <div className="hidden md:block w-[240px] flex-shrink-0" />
    </>
  );
}
