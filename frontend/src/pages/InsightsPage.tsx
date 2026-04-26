import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { insightsApi } from '../api/insights.api';
import type { InsightResponse, SimulationResponse } from '../types';
import { BarChart2, Lightbulb, Zap, HelpCircle, Play } from 'lucide-react';
import { CustomSpinner } from '../components/ui/CustomSpinner';
import owlInsights from '../assets/owl_insights.png';
import { cn } from '../lib/utils';

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [text]);
  return <>{displayedText}</>;
};

export function InsightsPage() {
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState('');
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await insightsApi.getInsights();
      setInsights(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario.trim() || simLoading) return;
    
    setSimLoading(true);
    setSimulation(null);
    try {
      const res = await insightsApi.simulate(scenario);
      setSimulation(res.data);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="space-y-2">
        <h1 className="text-[32px] font-bold tracking-[-0.03em]">Predictive <span className="gradient-text">Analytics</span></h1>
        <p className="text-muted-foreground text-[14px]">Behavioral modeling and future-state simulations based on core memories.</p>
      </header>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center glass rounded-[32px] space-y-6">
          <CustomSpinner className="w-12 h-12" />
          <p className="text-[12px] font-mono text-primary animate-pulse">Synchronizing cognitive patterns...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Patterns & Chart */}
          <section className="lg:col-span-7 space-y-8">
            <div className="glass p-8 rounded-[32px] space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-accent-teal stroke-[1.5]" />
                  </div>
                  <h2 className="text-[20px] font-semibold tracking-[-0.01em]">Temporal Activity</h2>
                </div>
                {insights && typeof insights.patterns !== 'string' && (
                  <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest bg-white/[0.03] px-3 py-1 rounded-lg">
                    {insights.patterns.most_active_period} Intensity
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                {insights && typeof insights.patterns !== 'string' ? (
                  <div className="grid grid-cols-4 gap-4 h-48 items-end px-4">
                    {Object.entries(insights.patterns.activity_distribution).map(([period, count], i) => (
                      <div key={period} className="flex flex-col items-center h-full justify-end group">
                        <div className="relative w-full flex flex-col justify-end h-full">
                           <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${(count / Math.max(...Object.values(insights.patterns.activity_distribution)) * 100) || 5}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className={cn(
                              "w-full rounded-t-xl transition-all duration-500 relative",
                              i % 2 === 0 ? "bg-gradient-to-t from-primary/20 to-primary/40 group-hover:to-primary/60" : "bg-gradient-to-t from-accent-teal/20 to-accent-teal/40 group-hover:to-accent-teal/60"
                            )}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-white">
                              {count}
                            </div>
                          </motion.div>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground mt-4 uppercase group-hover:text-primary transition-colors">{period}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 dashed-trace flex items-center justify-center text-muted-foreground italic text-sm">
                    Incomplete behavioral set.
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-8 rounded-[32px] relative overflow-hidden group">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-primary stroke-[1.5]" />
                </div>
                <h2 className="text-[20px] font-semibold tracking-[-0.01em]">AI Observations</h2>
              </div>
              
              <motion.img 
                src={owlInsights} 
                className="absolute right-4 top-4 w-32 object-contain opacity-20 pointer-events-none group-hover:scale-110 group-hover:opacity-40 transition-all duration-700"
                style={{ willChange: 'transform' }}
              />

              <div className="space-y-4 relative z-10">
                {insights?.summary.split('\n').map((line, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                    <p className="text-[14px] leading-relaxed text-muted-foreground hover:text-foreground transition-colors font-medium">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column: Simulation */}
          <section className="lg:col-span-5 space-y-8">
            <div className="glass-strong p-8 rounded-[32px] border-primary/20 space-y-8 sticky top-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary stroke-[1.5]" />
                  </div>
                  <h2 className="text-[20px] font-semibold tracking-[-0.01em]">Decision Projection</h2>
                </div>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  Apply your digital twin's cognitive model to unprecedented scenarios. Predict potential behavioral outcomes.
                </p>
              </div>
              
              <form onSubmit={handleSimulate} className="space-y-6">
                <div className="relative group">
                  <textarea
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="e.g., If I were offered a role at a fast-growing startup with a lower salary but high equity, would I take it?"
                    className="w-full h-40 p-5 rounded-2xl bg-black/40 border border-[#00CC6610] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm text-foreground resize-none font-medium placeholder:text-muted-foreground/20"
                  />
                  <HelpCircle className="absolute bottom-4 right-4 w-4 h-4 text-white/5 group-hover:text-primary/20 transition-colors" />
                </div>
                
                <button
                  type="submit"
                  disabled={!scenario.trim() || simLoading}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 emerald-glow active-click"
                >
                  {simLoading ? (
                    <div className="flex items-center gap-3">
                      <CustomSpinner className="w-5 h-5" />
                      <span>Computing Reality...</span>
                    </div>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Run Simulation</span>
                    </>
                  )}
                </button>
              </form>

              <AnimatePresence>
                {simulation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-[24px] bg-primary/5 border border-primary/10 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-mono text-primary mb-1">Predicted Outcome</div>
                        <h3 className="font-bold text-[16px]"><TypewriterText text={simulation.predicted_decision} /></h3>
                      </div>
                    </div>
                    <div className="pl-4 border-l-2 border-primary/20">
                      <p className="text-[13px] text-muted-foreground italic leading-relaxed">
                        Reasoning: {simulation.reasoning}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
