import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { WolfIcon } from '../components/ui/WolfIcon';
import { CustomSpinner } from '../components/ui/CustomSpinner';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authApi.register({ email, password, full_name: fullName });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Neural sequence disrupted. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-3" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-strong p-10 rounded-[40px] space-y-10 relative z-10 border-[#00CC6610]"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent-teal/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(0,179,179,0.1)] border border-accent-teal/20">
            <WolfIcon className="w-10 h-10 text-accent-teal" />
          </div>
          <h1 className="text-[32px] font-bold tracking-[-0.04em]">Neural <span className="gradient-text">Onboarding</span></h1>
          <p className="text-muted-foreground text-[14px]">Initialize your digital consciousness stream.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Entity Identifier</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-black/40 border border-[#00CC6610] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm placeholder:text-muted-foreground/20 font-medium"
              placeholder="Your Full Name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Coordinate Email</label>
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
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Protocol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-black/40 border border-[#00CC6610] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm placeholder:text-muted-foreground/20 font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-destructive text-[12px] font-medium text-center bg-destructive/5 py-3 rounded-xl border border-destructive/10">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="group w-full py-4 rounded-[22px] bg-primary hover:bg-primary/90 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-3 emerald-glow shadow-xl active-click"
          >
            {loading ? (
              <CustomSpinner className="w-5 h-5" />
            ) : (
              <>
                <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Begin Incarnation</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[13px] text-muted-foreground font-medium pt-4 bg-white/[0.02] -mx-10 -mb-10 p-6 rounded-b-[40px] border-t border-white/[0.03]">
          Already integrated?{' '}
          <Link to="/login" className="text-primary hover:text-primary-glow font-bold ml-1 transition-colors flex inline-flex items-center gap-1 group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
