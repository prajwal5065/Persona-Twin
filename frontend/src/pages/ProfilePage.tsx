import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Sparkles, Battery, BatteryLow, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useNotesStore } from '../store/notes.store';
import { profileApi } from '../api/profile.api';
import ProgressRing from '../components/ProgressRing';
import type { PersonalityProfile } from '../types';

// ─── configuration ───────────────────────────────────────────────────────────

const OCEAN_CONFIG = [
  { key: 'openness',          label: 'Openness',          color: '#3b82f6', shortDesc: 'Highly imaginative and intellectually curious' },
  { key: 'conscientiousness', label: 'Conscientiousness', color: '#8b5cf6', shortDesc: 'Deliberate and quality-focused' },
  { key: 'extraversion',      label: 'Extraversion',      color: '#f59e0b', shortDesc: 'Prefers depth over breadth in social settings' },
  { key: 'agreeableness',     label: 'Agreeableness',     color: '#10b981', shortDesc: 'Collaborative with strong principles' },
  { key: 'neuroticism',       label: 'Neuroticism',       color: '#ef4444', shortDesc: 'Emotionally resilient and stable' },
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
    value >= 60 ? 'Moderate–High' :
    value >= 40 ? 'Moderate' :
    value >= 20 ? 'Moderate–Low' : 'Low';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--charcoal)' }}>{config.label}</span>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--steel)', marginLeft: 8 }}>{intensity}</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: config.color }}>{value}</span>
      </div>
      <div style={{ height: 6, background: 'var(--hairline)', borderRadius: 999, overflow: 'hidden', marginBottom: 4 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: animated ? `${value}%` : '0%' }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 999, background: config.color }}
        />
      </div>
      <p style={{ fontSize: 11, color: 'var(--steel)', lineHeight: 1.4 }}>{config.shortDesc}</p>
    </div>
  );
}

function TagPill({ text, variant = 'default' }: { text: string; variant?: 'default' | 'orange' | 'green' | 'red' }) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: 'var(--surface)', color: 'var(--slate)', border: '1px solid var(--hairline)' },
    orange:  { background: 'rgba(247,97,30,0.08)', color: 'var(--primary)', border: '1px solid rgba(247,97,30,0.2)' },
    green:   { background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' },
    red:     { background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 12, fontWeight: 500,
      padding: '4px 12px', borderRadius: 999,
      ...styles[variant],
    }}>
      {text}
    </span>
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

  const coreValues    = profile?.coreValues    || ['Autonomy', 'Innovation', 'Growth', 'Security'];
  const cognitiveStyle = profile?.cognitiveStyle || ['Analytical', 'Recursive', 'Pattern-Oriented'];
  const energyProfile  = profile?.energyProfile  || {
    sources: ['Deep Work', 'Abstract Logic', 'Solitude'],
    drains:  ['Surface Interaction', 'Redundancy', 'Cognitive Noise'],
  };

  const completion = user?.full_name ? 85 : 45;
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  const initials = (user?.full_name?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase();

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>

      {/* Page header */}
      <div style={{
        background: 'var(--canvas)',
        borderBottom: '1px solid var(--hairline-soft)',
        padding: '28px 32px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--steel)', marginBottom: 6 }}>
              Identity
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 400, fontSize: 32, color: 'var(--ink)',
              letterSpacing: '-0.5px', lineHeight: 1.15,
            }}>
              Digital Identity
            </h1>
            <p style={{ fontSize: 14, color: 'var(--slate)', marginTop: 6 }}>
              Your personality, values, and cognitive fingerprint — assembled from your memories.
            </p>
          </div>
          <button
            id="sync-identity-btn"
            onClick={fetchProfile}
            disabled={loading}
            className="btn-secondary"
            style={{ fontSize: 13 }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Sync Identity
          </button>
        </div>
      </div>

      {/* Sunset stripe */}
      <div className="sunset-stripe" />

      {/* Content */}
      <div style={{ padding: '28px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, maxWidth: 1100 }}>

          {/* Left: identity + OCEAN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Identity card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Hexagon avatar */}
                <div style={{
                  width: 72, height: 72,
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--sunshine-700) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  color: 'white', fontSize: 28, fontWeight: 700,
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                        {user?.full_name || 'Neural Operator'}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <Sparkles size={12} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)' }}>
                          Twin active since {joinedDate}
                        </span>
                      </div>
                    </div>
                    <button className="btn-ghost" style={{ fontSize: 12 }}>
                      <Edit3 size={12} />
                      Edit Profile
                    </button>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.65, marginTop: 16 }}>
                    {profile?.summary || 'Your digital twin is currently synthesizing your behavioral patterns. Establish more memories to complete the neural mapping.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* OCEAN profile */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  OCEAN Personality Profile
                </h3>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--steel)' }}>Big Five Model</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
              className="card"
            >
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
                Cognitive Style
              </h3>
              <p style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 14 }}>How your twin processes and interprets data:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {cognitiveStyle.map(s => <TagPill key={s} text={s} variant="orange" />)}
              </div>
            </motion.div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Profile completion */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-cream"
              style={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate)', marginBottom: 20 }}>
                Profile Completion
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 8 }}>
                <div style={{ position: 'relative' }}>
                  <ProgressRing value={completion} size={110} strokeWidth={6} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontWeight: 400, fontSize: 28, color: 'var(--ink)',
                    }}>{completion}%</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--slate)', textAlign: 'center', marginTop: 16, lineHeight: 1.55 }}>
                  Deepen synchronization by establishing more core memories.
                </p>
              </div>

              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--beige-deep)', paddingTop: 20 }}>
                {[
                  { label: 'Memories stored',   val: `${notes.length}`,     done: notes.length > 5 },
                  { label: 'Insights generated', val: profile ? 'Verified' : 'Pending', done: !!profile },
                  { label: 'Decisions simulated', val: '0',                  done: false },
                  { label: 'Conflict patterns',   val: 'Pending',           done: false },
                ].map(({ label, val, done }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: done ? 'var(--primary)' : 'var(--hairline)',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: done ? 'var(--ink)' : 'var(--muted-text)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Core values */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
              style={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate)', marginBottom: 14 }}>
                Core Values
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {coreValues.map(v => <TagPill key={v} text={v} />)}
              </div>
            </motion.div>

            {/* Energy profile */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
              style={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate)', marginBottom: 20 }}>
                Energy Profile
              </h3>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Battery size={13} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#10b981' }}>Vitality Sources</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {energyProfile.sources.map(s => <TagPill key={s} text={s} variant="green" />)}
                </div>

                <div style={{ height: 1, background: 'var(--hairline-soft)', marginBottom: 20 }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <BatteryLow size={13} style={{ color: '#ef4444' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ef4444' }}>Cognitive Drains</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {energyProfile.drains.map(d => <TagPill key={d} text={d} variant="red" />)}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sunset stripe */}
        <div className="sunset-stripe" style={{ marginTop: 48, borderRadius: 4 }} />
      </div>
    </div>
  );
}
