import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare, FileText, BarChart2, Zap,
  ArrowRight, TrendingUp, Brain, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useNotesStore } from '../store/notes.store';
import { useChatStore } from '../store/chat.store';
import { insightsApi } from '../api/insights.api';
import type { InsightResponse } from '../types';
import ProgressRing from '../components/ProgressRing';

// Import background image
import dashboardBg from '../assets/dashboard-bg.png';

// ─── helpers ────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** OCEAN average → "profile completion %" */
function profileCompletion(profile: Record<string, number> | null): number {
  if (!profile) return 0;
  const keys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  const avg = keys.reduce((s, k) => s + (profile[k] ?? 0), 0) / keys.length;
  return Math.round(avg * 100);
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, to, color = 'text-accent-400', delay = 0,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; to: string; color?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: delay / 1000, ease: 'easeOut' }}
    >
      <Link
        to={to}
        className="backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 p-5 rounded-2xl block group shadow-2xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center">
            <Icon size={15} className={color} />
          </div>
          <ArrowRight
            size={13}
            className="text-muted group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200"
          />
        </div>
        <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
        <div className="text-xs font-medium text-slate-300">{label}</div>
        {sub && <div className="text-[11px] text-slate-400/80 mt-0.5">{sub}</div>}
      </Link>
    </motion.div>
  );
}

function RecentNote({ note }: { note: { id: number; content: string; created_at: string } }) {
  // Notes have no title — use first line / first 60 chars as title
  const firstLine = note.content.split('\n')[0].slice(0, 60);
  const body = note.content.slice(firstLine.length).trim().slice(0, 80);
  return (
    <Link
      to="/notes"
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
    >
      <FileText size={13} className="text-muted mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white transition-colors">
          {firstLine}
        </div>
        {body && (
          <div className="text-[11px] text-muted truncate mt-0.5">{body}…</div>
        )}
      </div>
      <span className="text-[10px] text-muted flex-shrink-0 mt-0.5">
        {timeAgo(note.created_at)}
      </span>
    </Link>
  );
}

// Trend strings from InsightResponse.trends → chip display
const TREND_COLORS = [
  { border: 'border-blue-500/30',   bg: 'bg-blue-500/10',   color: 'text-blue-300',   label: 'Pattern' },
  { border: 'border-violet-500/30', bg: 'bg-violet-500/10', color: 'text-violet-300', label: 'Behavior' },
  { border: 'border-emerald-500/30',bg: 'bg-emerald-500/10',color: 'text-emerald-300',label: 'Growth' },
];

function InsightChip({ text, index }: { text: string; index: number }) {
  const cfg = TREND_COLORS[index % TREND_COLORS.length];
  return (
    <Link
      to="/insights"
      className={`flex items-start gap-2.5 p-3 rounded-xl border backdrop-blur-sm ${cfg.border} ${cfg.bg} hover:bg-opacity-20 transition-all`}
    >
      <TrendingUp size={12} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
      <div>
        <div className="text-xs font-medium text-slate-100 leading-snug">{text}</div>
        <div className={`text-[10px] mt-0.5 ${cfg.color}`}>{cfg.label}</div>
      </div>
    </Link>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { notes, fetchNotes } = useNotesStore();
  const messages = useChatStore((s) => s.messages);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => { fetchNotes(); }, [fetchNotes]);
  useEffect(() => {
    insightsApi.getInsights().then((r) => setInsights(r.data)).catch(() => {});
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const memoryCount = notes.length;
  const trendCount = insights?.trends?.length ?? 0;
  const profile = user?.personality_profile as unknown as Record<string, number> | null ?? null;
  const profilePct = profileCompletion(profile);

  // OCEAN sub-scores for rings (default 0 if no profile yet)
  const patternsPct = insights?.trends?.length
    ? Math.min(Math.round((insights.trends.length / 5) * 100), 100)
    : 0;
  const valuesPct = profile
    ? Math.round(((profile.agreeableness ?? 0) + (profile.conscientiousness ?? 0)) / 2 * 100)
    : 0;

  // Last assistant message for the "twin says" card
  const lastTwinMsg = [...messages].reverse().find((m) => m.role === 'assistant');
  const recentNotes = notes.slice(0, 3);
  const recentTrends = (insights?.trends ?? []).slice(0, 2);

  return (
    <div className="relative min-h-screen">
      {/* Cinematic Nature Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img 
          src={dashboardBg} 
          alt="Dashboard Background" 
          className="w-full h-full object-cover scale-105" // Slight scale for a bit of room
        />
        {/* Deep Overlay for content readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 px-8 py-8 max-w-[1100px]">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mb-10"
        >
          <div className="text-sm font-medium text-emerald-400 mb-1 opacity-80">{getGreeting()}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-lg leading-relaxed">
            {memoryCount === 0
              ? 'Add your first memory to start training your twin.'
              : `Your twin has been processing your last ${memoryCount} ${memoryCount === 1 ? 'memory' : 'memories'}.`}
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={FileText} label="Memories"    value={memoryCount}  sub="thoughts stored"   to="/notes"    delay={0} />
          <StatCard icon={BarChart2} label="Insights"   value={trendCount}   sub="patterns found"    to="/insights" color="text-violet-300" delay={60} />
          <StatCard icon={Zap}       label="Simulations" value={0}            sub="decisions run"     to="/insights" color="text-amber-300"  delay={120} />
          <StatCard icon={Brain}     label="Twin Profile" value={`${profilePct}%`} sub="complete"    to="/profile"  color="text-emerald-300" delay={180} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Twin message card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.24, ease: 'easeOut' }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl border-l-4 border-l-emerald-500 shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <Brain size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-white tracking-wide">Digital Twin</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 text-[10px] font-bold uppercase tracking-wider">
                      {messages.length > 0 ? 'online' : 'syncing'}
                    </span>
                  </div>
                  {lastTwinMsg ? (
                    <>
                      <p className="text-sm text-slate-200 leading-relaxed italic opacity-90">"{lastTwinMsg.content.slice(0, 220)}{lastTwinMsg.content.length > 220 ? '…' : ''}"</p>
                      <Link
                        to="/chat"
                        className="inline-flex items-center gap-2 mt-5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
                      >
                        Resume Sync <ArrowRight size={12} />
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-300 leading-relaxed opacity-80">
                        {memoryCount === 0
                          ? "I'm ready to learn from you. Add some memories to begin the alignment process."
                          : `Alignment is at ${profilePct}%. I have indexed ${memoryCount} memories. Let's explore your data.`}
                      </p>
                      <Link
                        to="/chat"
                        className="inline-flex items-center gap-2 mt-5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
                      >
                        Initialize Chat <ArrowRight size={12} />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recent memories */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3, ease: 'easeOut' }}
              className="backdrop-blur-lg bg-black/20 border border-white/5 p-6 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-80">Recent Memories</h3>
                <Link
                  to="/notes"
                  className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1.5"
                >
                  History <ArrowRight size={10} />
                </Link>
              </div>
              {recentNotes.length === 0 ? (
                <div className="text-center py-10">
                  <FileText size={24} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-xs text-slate-500 font-medium tracking-wide">No memories indexed yet.</p>
                  <button
                    onClick={() => navigate('/notes')}
                    className="mt-4 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
                  >
                    Create First Memory →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentNotes.map((note) => <RecentNote key={note.id} note={note} />)}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right panel */}
          <div className="space-y-6">

            {/* Twin completion rings */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
              className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl"
            >
              <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-80">Alignment Progress</h3>
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-4">
                  <ProgressRing value={profilePct}  size={56} strokeWidth={4} color="#3b82f6" label="Core"  />
                  <ProgressRing value={patternsPct} size={56} strokeWidth={4} color="#8b5cf6" label="Logic" />
                  <ProgressRing value={valuesPct}   size={56} strokeWidth={4} color="#10b981" label="Ethics"   />
                </div>
                <Link to="/profile" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ArrowRight size={14} className="text-white" />
                </Link>
              </div>
            </motion.div>

            {/* Latest insights */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.28, ease: 'easeOut' }}
              className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest opacity-80">Cognitive Insights</h3>
                </div>
              </div>
              {recentTrends.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium py-2">
                  Generating insights from data...
                </p>
              ) : (
                <div className="space-y-3">
                  {recentTrends.map((trend, i) => (
                    <InsightChip key={i} text={trend} index={i} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick action */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.36, ease: 'easeOut' }}
            >
              <Link
                to="/chat"
                className="block backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center group rounded-3xl hover:bg-emerald-500/20 transition-all duration-300"
              >
                <MessageSquare
                  size={20}
                  className="text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                />
                <div className="text-sm font-bold text-white mb-1 tracking-wide">Talk to your Twin</div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest opacity-80">
                  {memoryCount > 0 ? `${memoryCount} memories indexed` : 'Start alignment'}
                </div>
              </Link>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
