import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  children?: React.ReactNode;
  showDefaultContent?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ children, showDefaultContent = true }) => {
  return (
    <section
      className="relative w-full overflow-hidden flex items-center"
      style={{
        minHeight: '88vh',
        background: 'linear-gradient(135deg, #FBF0CC 0%, #F9C87A 28%, #F07B22 58%, #D94F10 100%)',
      }}
    >
      {/* Decorative background circles */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)', top: -180, right: -120, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)', bottom: -100, left: 80, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)', top: '40%', right: '15%', pointerEvents: 'none',
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-16 py-24">
        {showDefaultContent && !children ? (
          <div style={{ maxWidth: 680 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              {/* Eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: 24,
                }}
              >
                Neural Synthesis Core v2.0
              </motion.p>

              {/* Hero display */}
              <h1
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 400,
                  fontSize: 'clamp(48px, 7vw, 84px)',
                  lineHeight: 1.05,
                  letterSpacing: '-1.5px',
                  color: 'white',
                  marginBottom: 28,
                }}
              >
                Your Digital Twin,{' '}
                <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.88)' }}>Evolved.</em>
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.55,
                  color: 'rgba(255,255,255,0.78)',
                  maxWidth: 520,
                  marginBottom: 40,
                }}
              >
                Forge a recursive AI echo of your personality. Secure, autonomous, and designed to synchronize with your cognitive patterns in real-time.
              </p>

              {/* CTA row */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
              >
                <button
                  id="hero-cta-primary"
                  className="btn-dark"
                  style={{ fontSize: 14, padding: '12px 24px' }}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  id="hero-cta-secondary"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    border: '1px solid rgba(255,255,255,0.25)',
                    cursor: 'pointer',
                    transition: 'background 150ms ease',
                  }}
                >
                  Learn More
                </button>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Sunset stripe at bottom */}
      <div className="sunset-stripe" style={{ position: 'absolute', bottom: 0, left: 0 }} />
    </section>
  );
};
