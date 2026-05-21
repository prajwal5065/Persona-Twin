import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import wolfHero from '../../assets/wolf_hero.webp';

interface HeroProps {
  children?: React.ReactNode;
  showDefaultContent?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ children, showDefaultContent = true }) => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        poster={wolfHero}
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
      >
        <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d150e] via-transparent to-[#0d150e]/80 z-10" />
      <div className="absolute inset-0 bg-black/20 z-10" />

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 flex items-center justify-center">
        {showDefaultContent && !children ? (
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center gap-6"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="px-4 py-1.5 rounded-full border border-[#00CC66]/30 bg-[#00CC66]/10 backdrop-blur-md flex items-center gap-2 mb-4"
              >
                <Sparkles className="w-4 h-4 text-[#00CC66]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#00CC66] mono">
                  Neural Synthesis Core v2.0
                </span>
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-white leading-[1.1]">
                Your Digital Twin, <br />
                <span className="gradient-text">Evolved.</span>
              </h1>

              {/* Subheading */}
              <p className="max-w-2xl text-lg md:text-xl text-white/60 leading-relaxed font-light">
                Forge a recursive neural echo of your personality. Secure, autonomous, and 
                designed to synchronize with your cognitive patterns in real-time.
              </p>

              {/* Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 mt-8"
              >
                <button className="px-8 py-4 bg-[#00CC66] text-black font-bold text-sm uppercase tracking-widest hover:bg-[#00E673] transition-all flex items-center gap-2 group border-none shadow-[0_0_30px_rgba(0,204,102,0.3)]">
                  Initialize Synthesis
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 glass text-white font-bold text-sm uppercase tracking-widest hover:bg-white/5 transition-all border-[#00CC66]/20">
                  Technical Documentation
                </button>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Bottom Technical Indicator */}
      <div className="absolute bottom-10 left-10 z-20 hidden lg:block">
        <div className="flex items-center gap-4 text-[10px] text-white/30 mono uppercase tracking-widest">
          <div className="w-12 h-[1px] bg-[#00CC66]/30" />
          <span>System Status: Uplink Active</span>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 z-20 hidden lg:block">
        <div className="flex items-center gap-4 text-[10px] text-white/30 mono uppercase tracking-widest">
          <span>Lat: 37.7749 / Long: -122.4194</span>
          <div className="w-12 h-[1px] bg-[#00CC66]/30" />
        </div>
      </div>

      {/* Decorative Scanner Line */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00CC66]/10 to-transparent z-10 pointer-events-none"
      />
    </section>
  );
};
