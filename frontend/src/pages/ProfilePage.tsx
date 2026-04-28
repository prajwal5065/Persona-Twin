import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Sparkles, Battery, BatteryLow, RefreshCw, User2 } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useNotesStore } from '../store/notes.store';
import { profileApi } from '../api/profile.api';
import PageHeader from '../components/PageHeader';
import ProgressRing from '../components/ProgressRing';
import type { PersonalityProfile } from '../types';

// ─── configuration ───────────────────────────────────────────────────────────

const OCEAN_CONFIG = [
  { key: 'openness', label: 'Openness', color: '#3b82f6', shortDesc: 'Highly imaginative and intellectually curious' },
  { key: 'conscientiousness', label: 'Conscientiousness', color: '#8b5cf6', shortDesc: 'Deliberate and quality-focused' },
  { key: 'extraversion', label: 'Extraversion', color: '#f59e0b', shortDesc: 'Prefers depth over breadth in social settings' },
  { key: 'agreeableness', label: 'Agreeableness', color: '#10b981', shortDesc: 'Collaborative with strong principles' },
  { key: 'neuroticism', label: 'Neuroticism', color: '#ef4444', shortDesc: 'Emotionally resilient and stable' },
] as const;

// ─── sub-components ──────────────────────────────────────────────────────────

function OceanBar({ config, value, index }: { config: any; value: number; index: number }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const intensity =
    value >= 80 ? 'High' :
    value >= 60 ? 'Moderate-High' :
    value >= 40 ? 'Moderate' :
    value >= 20 ? 'Moderate-Low' : 'Low';

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <span className="text-sm font-medium text-slate-200">{config.label}</span>
          <span className="text-[11px] text-muted-foreground ml-2 opacity-60 font-mono uppercase tracking-widest">{intensity}</span>
        </div>
        <span className="text-sm font-mono font-semibold" style={{ color: config.color }}>{value}</span>
      </div>
      <div className="h-2 bg-surface-700 rounded-full overflow-hidden mb-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: animated ? `${value}%` : '0%' }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: config.color }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 leading-relaxed">
        {config.shortDesc}
      </p>
    </div>
  );
}

function TagPill({ text, variant = 'default' }: { text: string; variant?: 'default' | 'accent' | 'green' | 'red' }) {
  const variants = {
    default: 'bg-surface-700 text-slate-300 border-surface-600',
    accent: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
    green: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    red: 'bg-red-400/10 text-red-400 border-red-400/20',
  };
  return (
    <span className={`badge border text-[11px] py-1 ${variants[variant]}`}>{text}</span>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const { notes, fetchNotes } = useNotesStore();
  const [profile, setProfile] = useState<PersonalityProfile | null>(user?.personality_profile || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
    if (!profile) fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await profileApi.getPersonality();
      setProfile(res.data);
    } catch {
      // Profile might not exist yet
    } finally {
      setLoading(false);
    }
  };

  // Helper to derive values if missing from backend
  const coreValues = profile?.coreValues || ['Autonomy', 'Innovation', 'Growth', 'Security'];
  const cognitiveStyle = profile?.cognitiveStyle || ['Analytical', 'Recursive', 'Pattern-Oriented'];
  const energyProfile = profile?.energyProfile || {
    sources: ['Deep Work', 'Abstract Logic', 'Solitude'],
    drains: ['Surface Interaction', 'Redundancy', 'Cognitive Noise']
  };

  const completion = user?.full_name ? 85 : 45; // Simulated logic
  const joinedDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  const initials = (user?.full_name?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase();

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Digital Identity"
          subtitle="Your personality, values, and cognitive fingerprint — assembled from your memories."
        />
        <button
          onClick={fetchProfile}
          disabled={loading}
          className="btn-ghost"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Sync Identity</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Identity card + OCEAN */}
        <div className="lg:col-span-2 space-y-5">
          {/* Summary card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div 
                className="w-20 h-20 bg-accent-500 shadow-2xl flex items-center justify-center flex-shrink-0 text-white text-3xl font-bold"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              >
                {initials}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{user?.full_name || 'Neural Operator'}</h2>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1.5">
                      <Sparkles size={12} className="text-accent-400" />
                      <span className="text-[11px] font-bold text-accent-400 uppercase tracking-widest">Twin active since {joinedDate}</span>
                    </div>
                  </div>
                  <button className="btn-ghost text-xs">
                    <Edit3 size={13} />
                    Refine Identity
                  </button>
                </div>
                <p className="mt-6 text-sm text-muted-foreground leading-relaxed font-medium">
                  {profile?.summary || "Your digital twin is currently synthesizing your behavioral patterns. Establish more memories to complete the neural mapping."}
                </p>
              </div>
            </div>
          </motion.div>

          {/* OCEAN traits */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">OCEAN Personality Profile</h3>
              <span className="section-label">Big Five Model</span>
            </div>
            <div className="space-y-6">
              {OCEAN_CONFIG.map((config, i) => (
                <OceanBar
                  key={config.key}
                  config={config}
                  value={profile?.[config.key as keyof PersonalityProfile] as number || 0}
                  index={i}
                />
              ))}
            </div>
          </motion.div>

          {/* Cognitive style */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-8"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Cognitive Style</h3>
            <p className="text-sm text-muted-foreground mb-4 font-medium">How your twin processes and interprets data:</p>
            <div className="flex flex-wrap gap-2.5">
              {cognitiveStyle.map(s => (
                <TagPill key={s} text={s} variant="accent" />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          {/* Completion */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Profile Completion</h3>
            <div className="flex flex-col items-center py-4">
              <div className="relative">
                <ProgressRing value={completion} size={110} strokeWidth={6} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white tracking-tighter">{completion}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed font-medium">
                Deepen synchronization by establishing more core memories.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              {[
                { label: 'Memories stored', val: `${notes.length}`, done: notes.length > 5 },
                { label: 'Insights generated', val: profile ? 'Verified' : 'Pending', done: !!profile },
                { label: 'Decisions simulated', val: '0', done: false },
                { label: 'Conflict patterns', val: 'Pending', done: false },
              ].map(({ label, val, done }) => (
                <div key={label} className="flex items-center justify-between text-[11px] uppercase tracking-wider font-bold">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${done ? 'bg-emerald-400 emerald-glow' : 'bg-surface-700'}`} />
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                  <span className={done ? 'text-slate-200' : 'text-muted-foreground/40'}>{val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Core values */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Core Values</h3>
            <div className="flex flex-wrap gap-2">
              {coreValues.map(v => <TagPill key={v} text={v} />)}
            </div>
          </motion.div>

          {/* Energy profile */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Energy Profile</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Battery size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Vitality Sources</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {energyProfile.sources.map(s => <TagPill key={s} text={s} variant="green" />)}
                </div>
              </div>
              <div className="h-px bg-surface-700/50" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BatteryLow size={14} className="text-red-400" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Cognitive Drains</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {energyProfile.drains.map(d => <TagPill key={d} text={d} variant="red" />)}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
