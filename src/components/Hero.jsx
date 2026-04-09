import { motion } from 'framer-motion';
import { SearchCity } from './SearchCity';

export const Hero = ({ onSearch, isSearching }) => {
  return (
    <div className="relative pt-20 pb-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Background Animated Particles (simplified css based) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
         <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-accent/20 text-accent text-sm font-medium mb-4"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          Real-Time AQI Monitoring
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight"
        >
          Intelligent <span className="neon-text">Health</span> Advisory
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto"
        >
          Discover real-time air quality metrics powered by AI to protect yourself and your loved ones from invisible threats.
        </motion.p>

        <div className="pt-8">
          <SearchCity onSearch={onSearch} isSearching={isSearching} defaultCityName="Indore, Madhya Pradesh" />
        </div>
      </div>
    </div>
  );
};
