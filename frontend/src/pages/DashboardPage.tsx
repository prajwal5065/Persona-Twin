import { useEffect, useState } from 'react';
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function profileCompletion(profile: Record<string, number> | null): number {
  if (!profile) return 0;
  const keys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  const avg = keys.reduce((s, k) => s + (profile[k] ?? 0), 0) / keys.length;
  return Math.round(avg * 100);
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, to, accentColor = 'var(--primary)', delay = 0, style,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; to: string; accentColor?: string; delay?: number; style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: delay / 1000, ease: 'easeOut' }}
    >
      <Link
        to={to}
        className="card-hover block group"
        style={style}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(247,97,30,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(247,97,30,0.12)',
          }}>
            <Icon size={16} style={{ color: accentColor }} />
          </div>
          <ArrowRight size={13} style={{ color: 'var(--muted-text)', marginTop: 2, transition: 'color 150ms, transform 150ms' }} />
        </div>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 400,
          fontSize: (style?.fontSize as string) || '28px',
          color: 'var(--ink)',
          marginBottom: 4,
          lineHeight: 1.1,
        }}>
          {value}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--slate)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--steel)', marginTop: 2 }}>{sub}</div>}
      </Link>
    </motion.div>
  );
}

const TREND_CONFIGS = [
  { border: 'rgba(59,130,246,0.25)', bg: 'rgba(59,130,246,0.06)', color: '#3b82f6', label: 'Pattern' },
  { border: 'rgba(139,92,246,0.25)', bg: 'rgba(139,92,246,0.06)', color: '#8b5cf6', label: 'Behavior' },
  { border: 'rgba(247,97,30,0.25)',  bg: 'rgba(247,97,30,0.06)',  color: 'var(--primary)', label: 'Insight' },
];

function InsightChip({ text, index }: { text: string; index: number }) {
  const cfg = TREND_CONFIGS[index % TREND_CONFIGS.length];
  return (
    <Link
      to="/insights"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 14px',
        borderRadius: 8,
        border: `1px solid ${cfg.border}`,
        background: cfg.bg,
        textDecoration: 'none',
        transition: 'background 150ms ease',
      }}
    >
      <TrendingUp size={12} style={{ color: cfg.color, marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.4 }}>{text}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: cfg.color, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</div>
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
  const [insightsLoading, setInsightsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchNotes(); }, [fetchNotes]);
  useEffect(() => {
    insightsApi.getInsights()
      .then((r) => { setInsights(r.data); setInsightsLoading(false); })
      .catch(() => { setInsightsLoading(false); });
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const memoryCount = notes.length;
  const trendCount = insights?.trends?.length ?? 0;
  const profile = user?.personality_profile as unknown as Record<string, number> | null ?? null;
  const profilePct = profileCompletion(profile);
  const lastTwinMsg = [...messages].reverse().find((m) => m.role === 'assistant');
  const recentNotes = notes.slice(0, 3);
  const recentTrends = (insights?.trends ?? []).slice(0, 2);

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>

      {/* Sunset hero greeting band */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FDF0CC 0%, #F9C87A 40%, #F07B22 75%, #D94F10 100%)',
          padding: '48px 32px 44px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
          top: -150, right: -80, pointerEvents: 'none',
        }} />
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ position: 'relative', zIndex: 10, maxWidth: 1100 }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
            {getGreeting()}
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 400,
              fontSize: 'clamp(28px,4vw,42px)',
              lineHeight: 1.1,
              color: 'white',
              letterSpacing: '-0.5px',
              marginBottom: 10,
            }}
          >
            Welcome back, {firstName}.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', maxWidth: 480, lineHeight: 1.55 }}>
            {memoryCount === 0
              ? 'Add your first memory to start training your twin.'
              : `Your twin has processed ${memoryCount} ${memoryCount === 1 ? 'memory' : 'memories'}.`}
          </p>
        </motion.div>
        {/* Sunset stripe */}
        <div className="sunset-stripe" style={{ position: 'absolute', bottom: 0, left: 0 }} />
      </div>

      {/* Main content */}
      <div style={{ padding: '32px', maxWidth: 1100 }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icon={FileText}  label="Memories"    value={memoryCount} sub="thoughts stored" to="/notes"    delay={0}   />
          <StatCard icon={BarChart2} label="Insights"    value={trendCount}  sub="patterns found"  to="/insights" delay={60}  accentColor="#8b5cf6" />
          <StatCard icon={Zap}       label="Simulations" value={0}           sub="decisions run"   to="/insights" delay={120} accentColor="#f59e0b" />
          {(() => {
            const profileStatus = user?.personality_profile
              ? 'Complete'
              : memoryCount >= 10
                ? 'Ready'
                : `${memoryCount}/10`;
            const profileSub = user?.personality_profile
              ? 'personality mapped'
              : memoryCount >= 10
                ? 'tap to run analysis'
                : 'memories needed';
            return (
              <StatCard
                icon={Brain}
                label="Twin Profile"
                value={profileStatus}
                sub={profileSub}
                to="/profile"
                delay={180}
                accentColor="#10b981"
                style={{ fontSize: profileStatus.length > 8 ? '20px' : '28px' }}
              />
            );
          })()}
        </div>

        {/* 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

          {/* Left: main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Twin message card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.22, ease: 'easeOut' }}
              className="card"
              style={{ borderLeft: '3px solid var(--primary)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(247,97,30,0.1)',
                  border: '1px solid rgba(247,97,30,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Brain size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Digital Twin</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                      padding: '2px 8px', borderRadius: 999,
                      background: 'rgba(247,97,30,0.1)', color: 'var(--primary)',
                      border: '1px solid rgba(247,97,30,0.2)',
                    }}>
                      {messages.length > 0 ? 'online' : 'ready'}
                    </span>
                  </div>
                  {lastTwinMsg ? (
                    <>
                      <p style={{ fontSize: 14, color: 'var(--charcoal)', lineHeight: 1.6, fontStyle: 'italic' }}>
                        "{lastTwinMsg.content.slice(0, 220)}{lastTwinMsg.content.length > 220 ? '…' : ''}"
                      </p>
                      <button
                        onClick={() => navigate('/chat')}
                        style={{
                          marginTop: 16, background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--primary)', fontSize: 13, fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 4, padding: 0,
                        }}
                      >
                        Continue chat <ArrowRight size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6 }}>
                        {memoryCount === 0
                          ? "I'm ready to learn from you. Add some memories to begin the alignment process."
                          : `Alignment is at ${profilePct}%. I have indexed ${memoryCount} memories. Let's explore your data.`}
                      </p>
                      <button
                        onClick={() => navigate('/chat')}
                        style={{
                          marginTop: 16, background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--primary)', fontSize: 13, fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 4, padding: 0,
                        }}
                      >
                        Start chatting <ArrowRight size={13} />
                      </button>
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
              className="card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recent Memories</h3>
                <Link to="/notes" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View all <ArrowRight size={11} />
                </Link>
              </div>

              {recentNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <FileText size={24} style={{ color: 'var(--muted-text)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, color: 'var(--steel)' }}>No memories yet.</p>
                  <button
                    onClick={() => navigate('/notes')}
                    className="btn-primary"
                    style={{ marginTop: 16, fontSize: 13 }}
                  >
                    Add First Memory
                  </button>
                </div>
              ) : (
                <div>
                  {recentNotes.map((note, index) => (
                    <div
                      key={note.id}
                      style={{
                        padding: '12px 0',
                        borderBottom: index < recentNotes.length - 1 ? '1px solid var(--hairline-soft)' : 'none',
                      }}
                    >
                      <p style={{ fontSize: 14, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.5, margin: 0 }}>
                        {note.content}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--steel)', marginTop: 3 }}>
                        {formatRelativeTime(note.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Profile or alignment */}
            {!user?.personality_profile ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="card-cream"
                style={{ cursor: 'pointer', padding: 24 }}
                onClick={() => navigate('/profile')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <User size={16} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Complete Your Profile</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.55 }}>
                  Run a personality analysis to unlock alignment tracking.
                </p>
                <button className="btn-primary" style={{ marginTop: 16, fontSize: 13, padding: '8px 16px' }}>
                  Analyze Now
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="card"
                style={{ padding: 24 }}
              >
                <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--steel)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
                  Alignment Progress
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Core Memory', val: (profile?.openness ?? 0) * 100 },
                    { label: 'Reasoning', val: (profile?.conscientiousness ?? 0) * 100 },
                    { label: 'Ethics', val: (profile?.agreeableness ?? 0) * 100 },
                  ].map((row, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: 'var(--slate)' }}>{row.label}</span>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--steel)' }}>{Math.round(row.val)}%</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--hairline)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${row.val}%`, height: '100%', background: 'var(--primary)', borderRadius: 999, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Insights */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.28 }}
              className="card"
              style={{ padding: 24 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Sparkles size={15} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--steel)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Cognitive Insights
                </h3>
              </div>
              {insightsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
                  {[100, 80, 60].map((w, i) => (
                    <div key={i} className="shimmer-effect" style={{ height: 12, width: `${w}%`, borderRadius: 4 }} />
                  ))}
                </div>
              ) : recentTrends.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Sparkles size={20} style={{ color: 'var(--muted-text)', margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ fontSize: 13, color: 'var(--slate)' }}>Add more memories to generate insights.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentTrends.map((trend, i) => (
                    <InsightChip key={i} text={trend} index={i} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <Link
                to="/chat"
                style={{
                  display: 'block',
                  background: 'var(--primary)',
                  borderRadius: 12,
                  padding: '20px 24px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  transition: 'background 150ms ease, transform 150ms ease',
                }}
              >
                <MessageSquare size={20} style={{ color: 'white', margin: '0 auto 10px', display: 'block' }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>Talk to your Twin</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {memoryCount > 0 ? `${memoryCount} memories indexed` : 'Start alignment'}
                </div>
              </Link>
            </motion.div>

          </div>
        </div>

        {/* Sunset stripe footer */}
        <div className="sunset-stripe" style={{ marginTop: 48, borderRadius: 4 }} />
      </div>
    </div>
  );
}
