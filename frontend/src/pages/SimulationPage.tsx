import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, Brain, RotateCcw, ChevronDown, ChevronUp, Sparkles, AlertCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { simulationApi } from '../api/simulation.api';
import type { SimulationResponse, ReasoningFactor as FactorType } from '../types';

const SCENARIOS = [
  "Should I quit my job and start a company?",
  "Is it the right time to move cities?",
  "Should I say yes to this collaboration?",
  "Is this relationship worth investing more in?",
];

function ReasoningFactor({ factor, index }: { factor: FactorType; index: number }) {
  const [open, setOpen] = useState(false);
  const color = factor.score >= 75 ? 'bg-emerald-500' : factor.score >= 50 ? 'bg-accent-500' : 'bg-amber-500';
  const textColor = factor.score >= 75 ? 'text-emerald-400' : factor.score >= 50 ? 'text-accent-400' : 'text-amber-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="card p-4 cursor-pointer group"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{factor.label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold ${textColor}`}>{factor.score}</span>
          {open ? <ChevronUp size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
        </div>
      </div>
      <div className="h-1 bg-surface-700 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${factor.score}%` }}
          transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-xs text-muted-foreground leading-relaxed mt-2 border-t border-surface-700/50 pt-3">
              {factor.note}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function SimulationPage() {
  const [scenario, setScenario] = useState('');
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    if (!scenario.trim() || scenario.length < 10) {
      setError('Scenario must be at least 10 characters.');
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const res = await simulationApi.simulate(scenario);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'The AI service encountered an error during synthesis.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setScenario('');
    setError(null);
  };

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <PageHeader
        title="Decision Simulation"
        subtitle="Describe a scenario. Your twin predicts your decision based on your values, patterns, and cognitive style."
      />

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div 
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-2xl"
          >
            {/* Input card */}
            <div className="card p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
                  <Brain size={20} className="text-accent-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Target Scenario</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Input a hypothetical or real decision point.</p>
                </div>
              </div>
              
              <textarea
                value={scenario}
                onChange={(e) => { setScenario(e.target.value); if (error) setError(null); }}
                placeholder="Should I move my career towards..."
                rows={5}
                className="input-base resize-none mb-6 text-lg leading-relaxed placeholder:opacity-30"
              />
              
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs mb-6 font-medium animate-fade-in bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <button
                onClick={runSimulation}
                disabled={!scenario.trim() || loading}
                className="btn-primary w-full py-4 justify-center disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Synthesizing Neural Path...
                  </>
                ) : (
                  <>
                    <Zap size={16} fill="currentColor" />
                    Establish Simulation
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Loading progress */}
            {loading && (
              <div className="card p-6 animate-fade-in bg-surface-900/50">
                <div className="space-y-4">
                  {[
                    'Querying cognitive foundation...', 
                    'Cross-referencing behavioral history...', 
                    'Weighing values alignment...', 
                    'Simulating potential outcomes...'
                  ].map((step, i) => (
                    <motion.div 
                      key={step} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.4 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse shadow-[0_0_8px_rgba(0,204,102,0.5)]" />
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {!loading && (
              <div className="space-y-3">
                <p className="section-label px-1">Common Neural Benchmarks</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SCENARIOS.map(s => (
                    <button
                      key={s}
                      onClick={() => setScenario(s)}
                      className="text-left px-5 py-4 rounded-xl border border-surface-700 hover:border-accent-500/40 text-xs font-medium text-muted-foreground hover:text-white transition-all duration-300 hover:bg-surface-800 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="line-clamp-1">{s}</span>
                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main result */}
            <div className="lg:col-span-2 space-y-6">
              {/* Verdict */}
              <div className="card p-8 border-l-4 border-l-accent-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Brain size={120} />
                </div>
                
                <div className="section-label mb-4">Neural Output / Prediction</div>
                <blockquote className="text-2xl font-bold text-white leading-tight mb-8">
                  "{result.predicted_decision}"
                </blockquote>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-accent-400 font-bold uppercase tracking-widest">Confidence Index</span>
                    <span className="font-mono text-white">{result.confidence}%</span>
                  </div>
                  <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-accent-500 rounded-full shadow-[0_0_15px_rgba(0,204,102,0.3)]"
                    />
                  </div>
                </div>
                
                <p className="mt-8 text-[11px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={12} className="text-accent-400" />
                  Synthesized from core memories and behavioral style mapping
                </p>
              </div>

              {/* Reasoning */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest px-1">Logic Decomposition</h3>
                <div className="grid grid-cols-1 gap-3">
                  {result.reasoning.map((f, i) => (
                    <ReasoningFactor key={f.label} factor={f} index={i} />
                  ))}
                </div>
              </div>
            </div>

            {/* Side panel */}
            <div className="space-y-6">
              {/* Alternatives */}
              <div className="card p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Neural Alternatives</h3>
                <div className="space-y-4">
                  {result.alternatives.map((alt, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="w-6 h-6 rounded-lg bg-surface-700 border border-surface-600 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:border-accent-500/40 transition-colors">
                        <span className="text-[10px] text-muted-foreground font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-slate-200 transition-colors">{alt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scenario used */}
              <div className="card p-6 bg-surface-900/40">
                <h3 className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-widest">Scenario Context</h3>
                <p className="text-sm text-slate-300 italic leading-relaxed">"{scenario}"</p>
              </div>

              <button 
                onClick={reset} 
                className="btn-secondary w-full py-4 justify-center border-accent-500/20 text-accent-400 hover:bg-accent-500/5"
              >
                <RotateCcw size={16} />
                Reset Simulation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ChevronRight = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const RefreshCw = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
);
