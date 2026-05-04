import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { LogIn, UserPlus, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { WolfIcon } from '../components/ui/WolfIcon';
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
      setError(err.response?.data?.detail || (isLogin ? 'Invalid credentials. Neural sync failed.' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Cinematic Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>

      {/* Subtle Dark Overlay — keep video visible */}
      <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-strong p-10 rounded-[40px] space-y-10 relative z-20 border border-white/10"
      >
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 ${isLogin ? 'bg-primary/10 border-primary/20 shadow-[0_0_40px_rgba(0,204,102,0.1)]' : 'bg-accent-teal/10 border-accent-teal/20 shadow-[0_0_40px_rgba(0,179,179,0.1)]'} rounded-3xl flex items-center justify-center mx-auto mb-6 border`}>
            <WolfIcon className={`w-10 h-10 ${isLogin ? 'text-primary' : 'text-accent-teal'}`} />
          </div>
          <h1 className="text-[32px] font-bold tracking-[-0.04em]">
            {isLogin ? (
              <>Welcome <span className="gradient-text">Back</span></>
            ) : (
              <>Neural <span className="gradient-text">Onboarding</span></>
            )}
          </h1>
          <p className="text-black text-[14px]">
            {isLogin ? 'Re-establish synchronization with your digital core.' : 'Initialize your digital consciousness stream.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-black ml-1">Entity Identifier</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-black/40 border border-[#00CC6610] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm placeholder:text-muted-foreground/20 font-medium"
                placeholder="Your Full Name"
                required={!isLogin}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-black ml-1">Coordinate Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-black/40 border border-[#00CC6610] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm placeholder:text-muted-foreground/20 font-medium"
              placeholder="operator@selftwin.ai"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-black ml-1">Access Protocol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-black/40 border border-[#00CC6610] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm placeholder:text-muted-foreground/20 font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className={`text-[12px] font-medium text-center py-3 rounded-xl border ${error.includes('successful') ? 'text-primary bg-primary/5 border-primary/10' : 'text-destructive bg-destructive/5 border-destructive/10'}`}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`group w-full py-4 rounded-[22px] ${isLogin ? 'bg-primary hover:bg-primary/90' : 'bg-accent-teal hover:bg-accent-teal/90'} text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl active-click`}
          >
            {loading ? (
              <CustomSpinner className="w-5 h-5" />
            ) : (
              <>
                {isLogin ? (
                  <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                ) : (
                  <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                <span>{isLogin ? 'Initialize Core' : 'Begin Incarnation'}</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[13px] text-muted-foreground font-medium pt-4 bg-white/[0.02] -mx-10 -mb-10 p-6 rounded-b-[40px] border-t border-white/[0.03]">
          {isLogin ? (
            <>
              New operator?{' '}
              <button type="button" onClick={() => { setIsLogin(false); setError(''); }} className="text-primary hover:text-primary-glow font-bold ml-1 transition-colors inline-flex items-center gap-1 group">
                Register Segment <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          ) : (
            <>
              Already integrated?{' '}
              <button type="button" onClick={() => { setIsLogin(true); setError(''); }} className="text-accent-teal hover:text-accent-teal-glow font-bold ml-1 transition-colors inline-flex items-center gap-1 group">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> Sign In
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;

