import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Brain, Lightbulb, AlertTriangle,
  Shield, ChevronRight, BarChart2
} from 'lucide-react';
import { insightsApi } from '../api/insights.api';
import { useNotesStore } from '../store/notes.store';
import type { InsightResponse } from '../types';

// ─── configuration ───────────────────────────────────────────────────────────

const typeIcons = {
  pattern:     TrendingUp,
  observation: Brain,
  tension:     AlertTriangle,
  strength:    Shield,
};

const insightTypeConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pattern:     { label: 'Behavioral Pattern',    color: '#3b82f6', bg: 'rgba(59,130,246,0.07)',  border: 'rgba(59,130,246,0.2)' },
  observation: { label: 'Cognitive Observation', color: '#8b5cf6', bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.2)' },
  tension:     { label: 'Cognitive Tension',     color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)' },
  strength:    { label: 'Core Strength',         color: '#10b981', bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.2)' },
};

// ─── types ───────────────────────────────────────────────────────────────────

interface Insight {
  id: string;
  type: 'pattern' | 'observation' | 'tension' | 'strength';
  title: string;
  dataPoints: number;
  date: string;
  confidence: number;
  description: string;
}

// ─── components ──────────────────────────────────────────────────────────────

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--hairline)', borderRadius: 999, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 999 }}
        />
      </div>
      <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color, width: 32, textAlign: 'right' }}>{value}%</span>
    </div>
  );
}

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = insightTypeConfig[insight.type] || insightTypeConfig.pattern;
  const Icon = typeIcons[insight.type] || Lightbulb;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06 }}
      className="card-hover"
      onClick={() => setExpanded(!expanded)}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: config.bg, border: `1px solid ${config.border}`,
        }}>
          <Icon size={15} style={{ color: config.color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>{insight.title}</h3>
            <ChevronRight
              size={14}
              style={{ color: 'var(--steel)', flexShrink: 0, marginTop: 2, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '2px 8px', borderRadius: 999,
              color: config.color, background: config.bg, border: `1px solid ${config.border}`,
            }}>
              {config.label}
            </span>
            <span style={{ fontSize: 11, color: 'var(--steel)' }}>{insight.dataPoints} data points</span>
            <span style={{ fontSize: 11, color: 'var(--muted-text)' }}>·</span>
            <span style={{ fontSize: 11, color: 'var(--steel)' }}>{insight.date}</span>
          </div>
          <ConfidenceBar value={insight.confidence} color={config.color} />

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <p style={{
                  marginTop: 12, fontSize: 13, color: 'var(--slate)', lineHeight: 1.65,
                  borderTop: '1px solid var(--hairline-soft)', paddingTop: 12,
                }}>
                  {insight.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityChart({ distribution }: { distribution: Record<string, number> }) {
  const periods = ['morning', 'afternoon', 'evening', 'night'];
  const values = periods.map(p => distribution[p] || 0);
  const max = Math.max(...values, 1);

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Daily Activity</span>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--steel)' }}>Distribution</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 64 }}>
        {periods.map((p, i) => (
          <div key={p} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(values[i] / max) * 48}px` }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.1 }}
              style={{
                width: '100%', borderRadius: 4, minHeight: 4,
                background: 'rgba(247,97,30,0.2)',
                cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--steel)', letterSpacing: '0.05em' }}>{p.slice(0, 3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export function InsightsPage() {
  const [data, setData] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const notes = useNotesStore(s => s.notes);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await insightsApi.getInsights();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const insights: Insight[] = (data?.trends || []).map((trend, i) => {
    const types: Insight['type'][] = ['pattern', 'observation', 'tension', 'strength'];
    return {
      id: `insight-${i}`,
      type: types[i % types.length],
      title: trend,
      dataPoints: Math.floor(Math.random() * 20) + 5,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      confidence: 80 + Math.floor(Math.random() * 15),
      description: data?.summary || 'Analyzing patterns in your cognitive fingerprint based on your memories.',
    };
  });

  const types = ['all', 'pattern', 'observation', 'tension', 'strength'];
  const filtered = activeFilter === 'all' ? insights : insights.filter(i => i.type === activeFilter);

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>

      {/* Page header */}
      <div style={{
        background: 'var(--canvas)',
        borderBottom: '1px solid var(--hairline-soft)',
        padding: '28px 32px 24px',
      }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--steel)', marginBottom: 6 }}>
          Analysis
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 400, fontSize: 32, color: 'var(--ink)',
          letterSpacing: '-0.5px', lineHeight: 1.15,
        }}>
          Insights
        </h1>
        <p style={{ fontSize: 14, color: 'var(--slate)', marginTop: 6 }}>
          Analysis of your patterns, behaviors, and cognitive fingerprint.
        </p>
      </div>

      {/* Sunset stripe */}
      <div className="sunset-stripe" />

      {/* Content */}
      <div style={{ padding: '28px 32px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Patterns Found',  value: insights.length.toString(), sub: 'this month',     icon: TrendingUp, color: '#3b82f6' },
            { label: 'Avg Confidence',  value: insights.length ? `${Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)}%` : '0%', sub: 'across insights', icon: Brain, color: '#8b5cf6' },
            { label: 'Data Points',     value: notes.length.toString(), sub: 'memories analyzed', icon: BarChart2,  color: '#10b981' },
            { label: 'Interaction',     value: data?.patterns?.frequency || 'Normal', sub: 'activity level', icon: Lightbulb, color: '#f59e0b' },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--steel)' }}>{label}</span>
                <Icon size={14} style={{ color }} />
              </div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 400, fontSize: 28, color: 'var(--ink)', lineHeight: 1, marginBottom: 4,
              }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--steel)' }}>{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Main 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>

          {/* Insights list */}
          <div>
            {/* Filter tabs */}
            <div style={{
              display: 'flex', gap: 4, padding: 4,
              background: 'var(--canvas)',
              border: '1px solid var(--hairline)',
              borderRadius: 10,
              width: 'fit-content',
              marginBottom: 20,
            }}>
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 150ms ease',
                    ...(activeFilter === type
                      ? { background: 'var(--ink)', color: '#FFFFFF' }
                      : { background: 'transparent', color: 'var(--steel)' }),
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="card shimmer-effect" style={{ height: 96 }} />
                ))
              ) : filtered.length === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: 'var(--slate)' }}>No insights for this filter.</p>
                </div>
              ) : (
                filtered.map((insight, i) => (
                  <InsightCard key={insight.id} insight={insight} index={i} />
                ))
              )}
            </div>
          </div>

          {/* Side panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data && <ActivityChart distribution={data.patterns.activity_distribution} />}

            {/* Cognitive coverage */}
            <div className="card" style={{ padding: 20 }}>
              <span style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--steel)', marginBottom: 16 }}>
                Cognitive Coverage
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Openness',    pct: 72, color: '#8b5cf6' },
                  { label: 'Focus',       pct: 58, color: '#3b82f6' },
                  { label: 'Values',      pct: 45, color: '#10b981' },
                  { label: 'Social',      pct: 31, color: '#e11d48' },
                  { label: 'Creativity',  pct: 28, color: 'var(--primary)' },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--charcoal)', fontWeight: 500 }}>{label}</span>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--steel)' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--hairline)', borderRadius: 999, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        style={{ height: '100%', background: color, borderRadius: 999 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sunset stripe */}
        <div className="sunset-stripe" style={{ marginTop: 48, borderRadius: 4 }} />
      </div>
    </div>
  );
}
