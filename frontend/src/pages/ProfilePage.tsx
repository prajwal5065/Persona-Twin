import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth.store';
import { profileApi } from '../api/profile.api';
import type { PersonalityProfile } from '../types';
import { User, Brain, Shield, Rocket, Heart, Activity, Loader2, Sparkles } from 'lucide-react';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<PersonalityProfile | null>(user?.personality_profile || null);
  const [loading, setLoading] = useState(false);

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
    { key: 'openness', label: 'Openness', icon: Rocket, color: 'text-blue-400', progress: profile?.openness },
    { key: 'conscientiousness', label: 'Conscientiousness', icon: Shield, color: 'text-green-400', progress: profile?.conscientiousness },
    { key: 'extraversion', label: 'Extraversion', icon: Activity, color: 'text-orange-400', progress: profile?.extraversion },
    { key: 'agreeableness', label: 'Agreeableness', icon: Heart, color: 'text-pink-400', progress: profile?.agreeableness },
    { key: 'neuroticism', label: 'Neuroticism', icon: Brain, color: 'text-red-400', progress: profile?.neuroticism },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header className="flex items-center gap-6 glass p-8 rounded-2xl">
        <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-primary/20">
          {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user?.full_name}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
          <div className="mt-4 flex gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-1 rounded text-muted-foreground">Digital Twin Active</span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-1 rounded text-primary">Pro Neural Plan</span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              OCEAN Profile
            </h2>
            <button 
              onClick={fetchProfile}
              className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground transition-all"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6">
            {oceanData.map((item, i) => (
              <div key={item.key} className="space-y-1">
                <div className="flex justify-between text-sm items-center mb-1">
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="font-bold">{(item.progress ? item.progress * 100 : 0).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.progress || 0) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full ${item.color.replace('text', 'bg')}`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {!profile && !loading && (
            <p className="text-xs text-center text-muted-foreground italic">
              Profile pending. Record more memories to generate insights.
            </p>
          )}
          {loading && (
            <div className="flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="glass p-8 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Persona Summary
          </h2>
          {profile ? (
            <p className="text-muted-foreground leading-relaxed italic">
              "{profile.summary}"
            </p>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-6 h-6 text-primary/40" />
              </div>
              <p className="text-sm text-muted-foreground">Continue journalizing to reveal your digital persona summary.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
