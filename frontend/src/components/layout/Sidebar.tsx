import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, StickyNote, BarChart2, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '../../lib/utils';

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

  return (
    <div className="flex flex-col h-screen w-64 glass border-r border-white/5 p-4 transition-all duration-300">
      <div className="flex items-center gap-2 px-2 py-4 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-bold">P</span>
        </div>
        <h1 className="text-xl font-bold gradient-text">Persona Twin</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-muted-foreground hover:text-foreground",
                isActive && "bg-primary/10 text-primary hover:text-primary"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-auto"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
}
