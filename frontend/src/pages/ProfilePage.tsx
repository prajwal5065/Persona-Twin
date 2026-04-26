import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuthStore } from '../store/auth.store';
import { profileApi } from '../api/profile.api';
import type { PersonalityProfile } from '../types';
import { Brain, Shield, Rocket, Heart, Activity, Sparkles, Fingerprint } from 'lucide-react';
import { CustomSpinner } from '../components/ui/CustomSpinner';

const traitDescriptions: Record<string, string> = {
  openness: "The tendency to appreciate new art, ideas, and unconventional values.",
  conscientiousness: "The tendency to be self-disciplined, dutiful, and aiming for achievement.",
  extraversion: "Level of engagement with the external world and enthusiasm for social interaction.",
  agreeableness: "The tendency to be compassionate and cooperative rather than suspicious and antagonistic.",
  neuroticism: "The tendency to experience emotional instability and psychological stress."
};

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<PersonalityProfile | null>(user?.personality_profile || null);
  const [loading, setLoading] = useState(false);
  const { scrollY } = useScroll();
  const summaryY = useTransform(scrollY, [0, 500], [0, 50]);

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

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, []);

  const oceanData = [
    { key: 'openness', label: 'Openness', icon: Rocket, progress: profile?.openness },
    { key: 'conscientiousness', label: 'Conscientiousness', icon: Shield, progress: profile?.conscientiousness },
    { key: 'extraversion', label: 'Extraversion', icon: Activity, progress: profile?.extraversion },
    { key: 'agreeableness', label: 'Agreeableness', icon: Heart, progress: profile?.agreeableness },
    { key: 'neuroticism', label: 'Neuroticism', icon: Brain, progress: profile?.neuroticism },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <header className="flex flex-col md:flex-row items-center gap-10 glass p-10 rounded-[40px] relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Hexagon Avatar */}
        <div 
          className="relative w-32 h-32 flex items-center justify-center bg-gradient-to-br from-[#00CC66] to-[#00B3B3] shadow-2xl emerald-glow animate-pulse"
          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
        >
          <span className="text-4xl font-semibold text-white tracking-widest">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
          </span>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4 relative z-10">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
               <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary">Neural Core Verified</span>
               <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full text-muted-foreground">Level 12 Consciousness</span>
            </div>
            <h1 className="text-[40px] font-bold tracking-[-0.04em] leading-tight text-foreground">{user?.full_name}</h1>
            <p className="text-muted-foreground font-mono text-sm opacity-60 tracking-tight">{user?.email}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* OCEAN Traits */}
        <section className="glass p-10 rounded-[40px] space-y-10 order-2 lg:order-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary stroke-[1.5]" />
               </div>
               <h2 className="text-[20px] font-semibold tracking-[-0.01em]">Cognitive Dimensions</h2>
            </div>
            <button 
              onClick={fetchProfile}
              className="p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground transition-all active-click"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-8">
            {oceanData.map((item, i) => (
              <div key={item.key} className="space-y-4 group relative">
                <div className="flex justify-between items-center text-[12px] uppercase tracking-wider font-semibold">
                  <div className="flex items-center gap-2.5 text-muted-foreground group-hover:text-primary transition-colors">
                    <item.icon className="w-4 h-4 stroke-[1.5]" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono text-foreground">{(item.progress ? item.progress * 100 : 0).toFixed(0)}%</span>
                </div>
                
                {/* Custom Tooltip on Hover */}
                <div className="absolute -top-12 left-0 right-0 bg-primary/95 text-white text-[11px] p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 text-center shadow-xl translate-y-2 group-hover:translate-y-0">
                  {traitDescriptions[item.key]}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-primary/95" />
                </div>

                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/[0.03]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.progress || 0) * 100}%` }}
                    transition={{ duration: 1.5, delay: 0.2 + i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                    className="h-full bg-gradient-to-r from-primary to-accent-teal rounded-full emerald-glow"
                  />
                </div>
              </div>
            ))}
          </div>
          
          {loading && (
            <div className="flex justify-center py-6">
              <CustomSpinner className="w-6 h-6" />
            </div>
          )}
        </section>

        {/* Summary Card with Parallax */}
        <section className="space-y-10 order-1 lg:order-2">
          <motion.div 
            style={{ y: summaryY }}
            className="glass-strong p-10 rounded-[40px] space-y-8 relative overflow-hidden"
          >
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center">
                <Fingerprint className="w-5 h-5 text-accent-teal stroke-[1.5]" />
               </div>
               <h2 className="text-[20px] font-semibold tracking-[-0.01em]">Unified Essence</h2>
            </div>
            
            {profile ? (
              <p className="text-[18px] text-foreground/80 leading-[1.7] font-medium tracking-tight relative z-10 first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                {profile.summary}
              </p>
            ) : (
              <div className="py-20 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto border border-primary/10 relative">
                   <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
                  <Sparkles className="w-8 h-8 text-primary/40 relative z-10" />
                </div>
                <p className="text-[13px] text-muted-foreground uppercase font-semibold tracking-widest">Neural data insufficient for synthesis</p>
                <div className="pt-4">
                  <div className="h-1.5 w-32 bg-white/5 rounded-full mx-auto overflow-hidden">
                    <motion.div 
                      animate={{ x: [-128, 128] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="h-full w-full bg-primary/20"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-8 border-t border-white/[0.03] grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-black/40 border border-[#00CC6610] text-center">
                 <div className="text-xl font-bold mono">2.4k</div>
                 <div className="text-[10px] text-muted-foreground uppercase mt-1">Interactions</div>
              </div>
              <div className="p-4 rounded-3xl bg-black/40 border border-[#00CC6610] text-center">
                 <div className="text-xl font-bold mono text-emerald-400">92%</div>
                 <div className="text-[10px] text-muted-foreground uppercase mt-1">Consistency</div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
