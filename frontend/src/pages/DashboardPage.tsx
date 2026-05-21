import { useEffect, useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare, FileText, BarChart2, Zap,
  ArrowRight, TrendingUp, Brain, Sparkles, User,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useNotesStore } from '../store/notes.store';
import { useChatStore } from '../store/chat.store';
import { insightsApi } from '../api/insights.api';
import type { InsightResponse } from '../types';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';

// Import background image
import dashboardBg from '../assets/dashboard-bg.webp';

// ─── helpers ────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  });
}

/** OCEAN average → "profile completion %" */
function profileCompletion(profile: Record<string, number> | null): number {
  if (!profile) return 0;
  const keys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  const avg = keys.reduce((s, k) => s + (profile[k] ?? 0), 0) / keys.length;
  return Math.round(avg * 100);
}

// ─── sub-components ──────────────────────────────────────────────────────────

const StatCard = memo(function StatCard({
  icon: Icon, label, value, sub, to, color = 'text-accent-400', delay = 0, style,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; to: string; color?: string; delay?: number; style?: React.CSSProperties;
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
        style={style}
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
        <div 
          className="font-bold text-white mb-0.5"
          style={{ fontSize: style?.fontSize || '24px' }}
        >
          {value}
        </div>
        <div className="text-xs font-medium text-slate-300">{label}</div>
        {sub && <div className="text-[11px] text-slate-400/80 mt-0.5">{sub}</div>}
      </Link>
    </motion.div>
  );
});


// Trend strings from InsightResponse.trends → chip display
const TREND_COLORS = [
  { border: 'border-blue-500/30',   bg: 'bg-blue-500/10',   color: 'text-blue-300',   label: 'Pattern' },
  { border: 'border-violet-500/30', bg: 'bg-violet-500/10', color: 'text-violet-300', label: 'Behavior' },
  { border: 'border-emerald-500/30',bg: 'bg-emerald-500/10',color: 'text-emerald-300',label: 'Growth' },
];

const InsightChip = memo(function InsightChip({ text, index }: { text: string; index: number }) {
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
});

// ─── main component ──────────────────────────────────────────────────────────

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const notes = useNotesStore((s) => s.notes);
  const fetchNotes = useNotesStore((s) => s.fetchNotes);
  const messages = useChatStore((s) => s.messages);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchNotes(); }, [fetchNotes]);
  useEffect(() => {
    insightsApi.getInsights()
      .then((r) => {
        setInsights(r.data);
        setInsightsLoading(false);
      })
      .catch(() => {
        setInsightsLoading(false);
      });
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
          fetchPriority="high"
          loading="eager"
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
          {(() => {
            const profileStatus = user?.personality_profile
              ? 'Complete'
              : memoryCount >= 10
                ? 'Ready to analyze'
                : `${memoryCount} / 10 memories`;
            
            const profileSub = user?.personality_profile
              ? 'personality mapped'
              : memoryCount >= 10
                ? 'tap to run analysis'
                : 'memories needed';

            const statusColor = profileStatus === 'Complete' 
              ? 'text-emerald-400' 
              : profileStatus === 'Ready to analyze' 
                ? 'text-primary' 
                : 'text-white';

            return (
              <StatCard 
                icon={Brain} 
                label="Twin Profile" 
                value={profileStatus} 
                sub={profileSub} 
                to="/profile" 
                color="text-emerald-300" 
                delay={180}
                style={{ 
                  cursor: profileSub === 'tap to run analysis' ? 'pointer' : undefined,
                  fontSize: profileStatus.length > 6 ? '18px' : '28px'
                }}
              />
            );
          })()}
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
                      <div className="mt-5">
                        <AppButton 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate('/chat')}
                          style={{ paddingLeft: 0, color: 'var(--app-accent)' }}
                        >
                          Continue chat <ArrowRight size={13} className="ml-1" />
                        </AppButton>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-300 leading-relaxed opacity-80">
                        {memoryCount === 0
                          ? "I'm ready to learn from you. Add some memories to begin the alignment process."
                          : `Alignment is at ${profilePct}%. I have indexed ${memoryCount} memories. Let's explore your data.`}
                      </p>
                      <div className="mt-5">
                        <AppButton 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate('/chat')}
                          style={{ paddingLeft: 0, color: 'var(--app-accent)' }}
                        >
                          Initialize Chat <ArrowRight size={13} className="ml-1" />
                        </AppButton>
                      </div>
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
                <div className="divide-y divide-white/5">
                  {recentNotes.map((note, index) => (
                    <div key={note.id} style={{
                      padding: '12px 0',
                      borderBottom: index < recentNotes.length - 1
                        ? '1px solid var(--app-border)' : 'none'
                    }}>
                      <p style={{
                        fontSize: '14px',
                        color: 'var(--app-text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.5',
                        margin: 0
                      }}>
                        {note.content}
                      </p>
                      <p style={{
                        fontSize: '11px',
                        color: 'var(--app-faint)',
                        marginTop: '3px',
                        fontFamily: 'monospace'
                      }}>
                        {formatRelativeTime(note.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right panel */}
          <div className="space-y-6">

            {!user?.personality_profile ? (
              <AppCard 
                padding="20px" 
                onClick={() => navigate('/profile')} 
                lift
                className="shadow-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-emerald-400" />
                  <h3 className="text-[14px] font-semibold text-white">Complete Your Profile</h3>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  Run a personality analysis to unlock alignment tracking.
                </p>
                <div className="mt-3">
                  <AppButton variant="primary" size="sm">Analyze Now</AppButton>
                </div>
              </AppCard>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
                className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl"
              >
                <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-80">Alignment Progress</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Core Memory', val: (profile?.openness ?? 0) * 100 },
                    { label: 'Reasoning', val: (profile?.conscientiousness ?? 0) * 100 },
                    { label: 'Ethics Profile', val: (profile?.agreeableness ?? 0) * 100 },
                  ].map((row, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-end">
                        <span className="text-[13px] text-slate-400">{row.label}</span>
                        <span className="text-[12px] font-mono text-slate-500">{Math.round(row.val)}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${row.val}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 + (i * 0.1) }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

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
              {insightsLoading ? (
                <div className="space-y-[10px] py-2">
                  <div className="shimmer-effect h-[12px] w-full rounded-[4px]" />
                  <div className="shimmer-effect h-[12px] w-[80%] rounded-[4px]" />
                  <div className="shimmer-effect h-[12px] w-[60%] rounded-[4px]" />
                </div>
              ) : recentTrends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Sparkles size={20} className="text-slate-500 opacity-40" />
                  <p className="text-[13px] text-slate-400 mt-2 font-medium">Add more memories to generate insights.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Insights appear after 5+ memories.</p>
                </div>
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
