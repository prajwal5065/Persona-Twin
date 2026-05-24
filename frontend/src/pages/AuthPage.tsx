import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { LogIn, UserPlus, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { CustomSpinner } from '../components/ui/CustomSpinner';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const res = await authApi.login({ username: email, password });
        setAuth(res.data.user, res.data.access_token);
        navigate('/dashboard');
      } else {
        await authApi.register({ email, password, full_name: fullName });
        setIsLogin(true);
        setError('Registration successful. Please log in.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || (isLogin ? 'Invalid credentials.' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: 'linear-gradient(135deg, #F5E8C0 0%, #F9C87A 30%, #F07B22 62%, #D94F10 100%)',
      }}
    >
      {/* Left hero panel */}
      <div className="hidden lg:flex flex-col justify-between flex-1 p-16 relative overflow-hidden">
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute', width: 480, height: 480,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            top: -120, right: -120,
          }}
        />
        <div
          style={{
            position: 'absolute', width: 300, height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            bottom: 60, left: -60,
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            style={{
              width: 36, height: 36,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="10" height="14" rx="2" stroke="white" strokeWidth="1.5" fill="none"/>
              <rect x="8" y="5" width="10" height="14" rx="2" stroke="white" strokeWidth="1.5" fill="rgba(0,0,0,0.15)"/>
              <path d="M8 9h5.5a2 2 0 010 4H8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 16, color: 'white', letterSpacing: '-0.02em' }}>
            PersonaTwin
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
            Your Digital Twin
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 400,
              fontSize: 52,
              lineHeight: 1.1,
              letterSpacing: '-0.5px',
              color: 'white',
              marginBottom: 24,
            }}
          >
            Your mind,<br />
            always available.
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: 380 }}>
            Train a recursive AI model on your memories, values, and thinking patterns. Your twin reflects, responds, and evolves with you.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 40, marginTop: 48 }}>
            {[
              { value: '100%', label: 'Private' },
              { value: 'RAG', label: 'Powered' },
              { value: 'OCEAN', label: 'Personality' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 400, color: 'white', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom micro */}
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500, position: 'relative', zIndex: 10 }}>
          © 2025 PersonaTwin — All memories encrypted.
        </p>
      </div>

      {/* Right: auth form panel */}
      <div
        className="flex items-center justify-center w-full lg:w-auto"
        style={{ padding: '40px 24px', minWidth: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            background: 'var(--cream)',
            border: '1px solid var(--beige-deep)',
            borderRadius: 16,
            padding: '40px 36px',
            width: '100%',
            maxWidth: 420,
            boxShadow: 'rgba(0,0,0,0.14) 0px 16px 48px -8px',
          }}
        >
          {/* Form header */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--steel)', marginBottom: 8 }}>
              {isLogin ? 'Welcome back' : 'Create account'}
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 400,
                fontSize: 32,
                lineHeight: 1.15,
                letterSpacing: '-0.5px',
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              {isLogin ? 'Sign in to your twin.' : 'Start your twin.'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate)', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-base"
                  placeholder="Your full name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate)', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate)', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: 'center',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid',
                  ...(error.includes('successful')
                    ? { color: '#166534', background: '#f0fdf4', borderColor: '#bbf7d0' }
                    : { color: '#991b1b', background: '#fef2f2', borderColor: '#fecaca' }),
                }}
              >
                {error}
              </p>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-dark"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, height: 46 }}
            >
              {loading ? (
                <CustomSpinner className="w-4 h-4" />
              ) : (
                <>
                  {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: '1px solid var(--beige-deep)',
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--slate)',
            }}
          >
            {isLogin ? (
              <>
                New here?{' '}
                <button
                  id="switch-to-register"
                  type="button"
                  onClick={() => { setIsLogin(false); setError(''); }}
                  style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  Create an account <ArrowRight className="w-3 h-3" />
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  id="switch-to-login"
                  type="button"
                  onClick={() => { setIsLogin(true); setError(''); }}
                  style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <ArrowLeft className="w-3 h-3" /> Sign in
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
