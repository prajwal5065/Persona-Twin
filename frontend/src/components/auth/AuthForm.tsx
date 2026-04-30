import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login: form-urlencoded
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const response = await axios.post(`${API_BASE_URL}/auth/login`, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        localStorage.setItem('token', response.data.access_token);
        if (onSuccess) onSuccess();
      } else {
        // Register: JSON
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
          email,
          password
        });
        
        // Auto-login after register if it returns a token
        if (response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
          if (onSuccess) onSuccess();
        } else {
          setIsLogin(true);
          setError('Account created! Please login.');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md"
    >
      <div className="glass-strong p-8 md:p-10 rounded-[2rem] border-[#00CC66]/20 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00CC66]/5 blur-3xl -mr-12 -mt-12" />
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00CC66]/10 mb-4 border border-[#00CC66]/20">
            <ShieldCheck className="w-6 h-6 text-[#00CC66]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join the Evolution'}
          </h2>
          <p className="text-white/40 text-sm font-light">
            {isLogin 
              ? 'Synchronize with your digital neural twin.' 
              : 'Begin your recursive personality synthesis.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#00CC66] transition-colors" />
              <input
                type="email"
                placeholder="Secure Endpoint (Email)"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00CC66]/50 focus:bg-white/[0.08] transition-all mono text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#00CC66] transition-colors" />
              <input
                type="password"
                placeholder="Access Key (Password)"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00CC66]/50 focus:bg-white/[0.08] transition-all mono text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#00CC66] text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#00E673] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,204,102,0.2)]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Access System' : 'Create Identity'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-white/40 text-xs hover:text-[#00CC66] transition-colors mono tracking-wider"
          >
            {isLogin 
              ? "New here? [ INITIALIZE_REGISTRATION ]" 
              : "Already synced? [ RETURN_TO_AUTH ]"}
          </button>
        </div>

        {/* Bottom decorative bar */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00CC66]/30 to-transparent" />
      </div>
    </motion.div>
  );
};
