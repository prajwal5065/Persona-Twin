import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { insightsApi } from '../api/insights.api';
import type { InsightResponse, SimulationResponse } from '../types';
import { BarChart2, Lightbulb, Zap, HelpCircle, Loader2, Play } from 'lucide-react';

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
    try {
      const res = await insightsApi.simulate(scenario);
      setSimulation(res.data);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in text-foreground">
      <header>
        <h1 className="text-3xl font-bold">Insights & Predictions</h1>
        <p className="text-muted-foreground">Behavioral patterns and predictive modeling.</p>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center glass rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-6">
            <div className="glass p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <BarChart2 className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold">Activity Patterns</h2>
              </div>
              
              <div className="space-y-4">
                {insights && typeof insights.patterns !== 'string' ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Most active during:</span>
                      <span className="font-bold text-blue-400">{insights.patterns.most_active_period}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 h-24 items-end">
                      {Object.entries(insights.patterns.activity_distribution).map(([period, count]) => (
                        <div key={period} className="flex flex-col items-center gap-2 h-full justify-end">
                          <div 
                            className="bg-blue-500/20 w-full rounded-t-lg transition-all duration-1000"
                            style={{ height: `${(count / Math.max(...Object.values(insights.patterns.activity_distribution)) * 100) || 0}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground truncate w-full text-center">{period}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground italic text-sm">More memories needed for patterns.</p>
                )}
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold">AI Observations</h2>
              </div>
              <div className="prose prose-invert max-w-none text-sm text-muted-foreground leading-relaxed">
                {insights?.summary.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="glass p-6 rounded-2xl border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Predictive Simulation</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Input a hypothetical scenario to see how your digital twin would decide.
              </p>
              
              <form onSubmit={handleSimulate} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="e.g., Should I quit my stable job to start a coffee shop in Bali?"
                    className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm resize-none"
                  />
                  <HelpCircle className="absolute right-4 top-3 w-5 h-5 opacity-20" />
                </div>
                <button
                  type="submit"
                  disabled={!scenario.trim() || simLoading}
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {simLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  Run Simulation
                </button>
              </form>

              {simulation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-0.5 rounded bg-primary/10">Prediction</span>
                    <h3 className="font-bold">{simulation.predicted_decision}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "{simulation.reasoning}"
                  </p>
                </motion.div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
