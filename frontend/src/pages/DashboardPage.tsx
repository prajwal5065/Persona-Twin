import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth.store';
import { useNotesStore } from '../store/notes.store';
import { StickyNote, MessageSquare, BrainCog, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import wolfHero from '../assets/wolf_hero.png';

const CountUp = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return <>{count}</>;
};

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { notes, fetchNotes } = useNotesStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const stats = [
    { label: 'Total Memories', value: notes.length, icon: StickyNote, color: 'text-primary' },
    { label: 'Chat Sessions', value: 12, icon: MessageSquare, color: 'text-accent-teal' },
    { label: 'Persona Clarity', value: 85, suffix: '%', icon: BrainCog, color: 'text-primary' },
    { label: 'Growth Trend', value: 12, prefix: '+', suffix: '%', icon: TrendingUp, color: 'text-accent-teal' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] font-bold tracking-[-0.03em] leading-tight">
          Welcome back, <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'Twin'}</span>
        </h1>
        <p className="text-muted-foreground text-[14px]">Your digital consciousness is synchronized and learning.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass p-6 rounded-2xl space-y-6 hover-lift relative overflow-hidden group"
          >
            <div className={`p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] w-fit ${stat.color}`}>
              <stat.icon className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-3xl font-bold mono">
                {stat.prefix}<CountUp end={stat.value} />{stat.suffix}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Recent Memories */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold tracking-[-0.01em]">Recent Memories</h2>
            <Link to="/notes" className="text-primary text-[13px] font-medium hover:underline flex items-center gap-1 group">
              View all base <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.slice(0, 4).map((note, i) => (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="glass p-5 rounded-2xl space-y-3 hover-lift border-l-2 border-primary/20 hover:border-primary/40"
              >
                <p className="text-[14px] leading-relaxed line-clamp-3 text-muted-foreground group-hover:text-foreground">
                  {note.content}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.03]">
                   <span className="text-[10px] font-mono text-primary/60">ID:{note.id.toString().substring(0, 6)}</span>
                   <span className="text-[10px] font-mono text-muted-foreground/40">{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
            {notes.length === 0 && (
              <div className="col-span-full py-16 dashed-trace flex flex-col items-center justify-center text-center space-y-4">
                <StickyNote className="w-8 h-8 text-muted-foreground/20" />
                <p className="text-muted-foreground italic text-sm">Your neural network is empty. Record a thought.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Hero Graphic */}
        <div className="lg:col-span-4 self-start">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -8, 0]
            }}
            transition={{ 
              opacity: { duration: 0.8 },
              scale: { duration: 0.8 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full opacity-30 animate-pulse" />
            <img 
              src={wolfHero} 
              alt="Digital Twin Core" 
              loading="lazy"
              className="w-full aspect-square object-cover rounded-2xl emerald-glow border border-[#00CC6615] relative z-10 grayscale hover:grayscale-0 transition-all duration-700" 
              style={{ willChange: 'transform' }}
            />
             <div className="mt-8 glass p-6 rounded-2xl relative z-10">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <BrainCog className="w-4 h-4 text-primary" />
                Core Status: Active
              </h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Persona synthesis is running at 98.4% efficiency. All neural nodes available for interaction.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
