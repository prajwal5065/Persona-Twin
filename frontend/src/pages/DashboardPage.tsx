import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth.store';
import { useNotesStore } from '../store/notes.store';
import { StickyNote, MessageSquare, BrainCode, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { notes, fetchNotes } = useNotesStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const stats = [
    { label: 'Total Memories', value: notes.length, icon: StickyNote, color: 'text-blue-400' },
    { label: 'Chat Sessions', value: '12', icon: MessageSquare, color: 'text-purple-400' },
    { label: 'Persona Clarity', value: '85%', icon: BrainCode, color: 'text-pink-400' },
    { label: 'Growth Trend', value: '+12%', icon: TrendingUp, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back, <span className="gradient-text">{user?.full_name || 'Twin'}</span>
        </h1>
        <p className="text-muted-foreground mt-2">Your digital twin is synchronized and ready.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl space-y-4"
          >
            <div className={`p-3 rounded-xl bg-white/5 w-fit ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Memories</h2>
            <Link to="/notes" className="text-primary text-sm font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {notes.slice(0, 3).map((note) => (
              <div key={note.id} className="glass p-4 rounded-xl border-l-4 border-primary/50">
                <p className="text-sm line-clamp-2">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-12 glass rounded-xl border-dashed border-2 border-white/5">
                <p className="text-muted-foreground italic">No memories yet. Start by adding a note!</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl h-fit">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/chat" className="flex items-center gap-3 p-3 rounded-xl bg-primary hover:bg-primary/90 transition-all font-medium text-white">
              <MessageSquare className="w-5 h-5" />
              <span>Talk to Twin</span>
            </Link>
            <Link to="/notes" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-medium text-foreground">
              <StickyNote className="w-5 h-5" />
              <span>Record a Memory</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
