import { Wind } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <Wind className="w-8 h-8 text-accent" />
        <span className="font-bold text-2xl tracking-tighter">
          Air<span className="text-accent">Nova</span>
        </span>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button className="px-6 py-2 rounded-full glass-card hover:bg-glass-border transition-colors text-sm font-medium">
          Dashboard
        </button>
      </motion.div>
    </nav>
  );
};
