import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Brain, Lightbulb, AlertTriangle, 
  Shield, ChevronRight, BarChart2 
} from 'lucide-react';
import { insightsApi } from '../api/insights.api';
import { useNotesStore } from '../store/notes.store';
import type { InsightResponse } from '../types';
import PageHeader from '../components/PageHeader';

// ─── configuration ───────────────────────────────────────────────────────────

const typeIcons = {
  pattern: TrendingUp,
  observation: Brain,
  tension: AlertTriangle,
  strength: Shield,
};

const insightTypeConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pattern: {
    label: 'Behavioral Pattern',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  observation: {
    label: 'Cognitive Observation',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  tension: {
    label: 'Cognitive Tension',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  strength: {
    label: 'Core Strength',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
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

const ConfidenceBar = memo(function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-surface-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-accent-500 rounded-full"
        />
      </div>
      <span className="text-[11px] text-accent-400 font-mono font-medium w-8">{value}%</span>
    </div>
  );
});

const InsightCard = memo(function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = insightTypeConfig[insight.type] || insightTypeConfig.pattern;
  const Icon = typeIcons[insight.type] || Lightbulb;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="card-hover p-5 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${config.bg} ${config.border}`}>
          <Icon size={15} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white leading-snug">{insight.title}</h3>
            <ChevronRight
              size={14}
              className={`text-muted-foreground flex-shrink-0 mt-0.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`badge border text-[10px] ${config.bg} ${config.color} ${config.border}`}>
              {config.label}
            </span>
            <span className="text-[10px] text-muted-foreground">{insight.dataPoints} data points</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground">{insight.date}</span>
          </div>

          <ConfidenceBar value={insight.confidence} />

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-surface-700 pt-3">
                  {insight.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});

const ActivityChart = memo(function ActivityChart({ distribution }: { distribution: Record<string, number> }) {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Map periods to days for visualization if actual daily data isn't available
  const periods = ['morning', 'afternoon', 'evening', 'night'];
  const values = periods.map(p => distribution[p] || 0);
  const max = Math.max(...values, 1);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-white">Daily Memory Activity</span>
        <span className="section-label">Distribution</span>
      </div>
      <div className="flex items-end gap-2 h-16">
        {periods.map((p, i) => (
          <div key={p} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative group">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(values[i] / max) * 48}px` }}
                className="w-full rounded-sm bg-accent-500/20 hover:bg-accent-500/40 transition-all duration-300 cursor-pointer min-h-[4px]"
              />
            </div>
            <span className="text-[9px] text-muted-foreground uppercase">{p.slice(0, 3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

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

  // Map trends to the Insight structure
  const insights: Insight[] = (data?.trends || []).map((trend, i) => {
    const types: Insight['type'][] = ['pattern', 'observation', 'tension', 'strength'];
    return {
      id: `insight-${i}`,
      type: types[i % types.length],
      title: trend,
      dataPoints: Math.floor(Math.random() * 20) + 5, // Simulated
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      confidence: 80 + Math.floor(Math.random() * 15), // Simulated
      description: data?.summary || "Analyzing patterns in your cognitive fingerprint based on your memories."
    };
  });

  const types = ['all', 'pattern', 'observation', 'tension', 'strength'];
  const filtered = activeFilter === 'all' ? insights : insights.filter(i => i.type === activeFilter);

  return (
    <div className="px-8 py-8">
      <PageHeader
        title="Insights"
        subtitle="Analysis of your patterns, behaviors, and cognitive fingerprint."
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Patterns Found', value: insights.length.toString(), sub: 'this month', icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Avg Confidence', value: insights.length ? `${Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)}%` : '0%', sub: 'across insights', icon: Brain, color: 'text-violet-400' },
          { label: 'Data Points', value: notes.length.toString(), sub: 'memories analyzed', icon: BarChart2, color: 'text-emerald-400' },
          { label: 'Twin Frequency', value: data?.patterns?.frequency || 'Normal', sub: 'interaction level', icon: Lightbulb, color: 'text-amber-400' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <motion.div 
            key={label} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="section-label">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-[11px] text-muted-foreground">{sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Insights list */}
        <div className="col-span-2 space-y-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface-800 border border-surface-700 rounded-lg w-fit">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all duration-200 ${
                  activeFilter === type
                    ? 'bg-surface-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-24 card animate-pulse" />
              ))
            ) : filtered.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-sm text-muted-foreground">No insights found for this filter.</p>
              </div>
            ) : (
              filtered.map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} index={i} />
              ))
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {data && <ActivityChart distribution={data.patterns.activity_distribution} />}

          {/* Topic coverage */}
          <div className="card p-5">
            <span className="section-label block mb-4">Cognitive Coverage</span>
            <div className="space-y-3">
              {[
                { label: 'Openness', pct: 72, color: 'bg-violet-500' },
                { label: 'Focus', pct: 58, color: 'bg-blue-500' },
                { label: 'Values', pct: 45, color: 'bg-emerald-500' },
                { label: 'Social', pct: 31, color: 'bg-rose-500' },
                { label: 'Creativity', pct: 28, color: 'bg-amber-500' },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-300">{label}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{pct}%</span>
                  </div>
                  <div className="h-1 bg-surface-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className={`h-full ${color} rounded-full transition-all duration-700`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
