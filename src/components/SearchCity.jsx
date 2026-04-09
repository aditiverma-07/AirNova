import { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { indianCities } from '../data/cities';

export const SearchCity = ({ onSearch, isSearching, defaultCityName }) => {
  const [query, setQuery] = useState(defaultCityName || '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const filteredCities = indianCities.filter(c => 
    c.city.toLowerCase().includes(query.toLowerCase()) || 
    c.state.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8); // Limit to 8 results for the dropdown

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cityObj) => {
    setQuery(`${cityObj.city}, ${cityObj.state}`);
    setIsOpen(false);
    onSearch(cityObj);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query) return;
    // Attempt to find exact or closest match
    let match = indianCities.find(c => `${c.city}, ${c.state}`.toLowerCase() === query.toLowerCase());
    if (!match && filteredCities.length > 0) {
      match = filteredCities[0];
    }
    
    if (match) {
      handleSelect(match);
    } else {
      // If no match found in our mock list, we just send a generic object
      onSearch({ city: query.split(',')[0].trim(), state: 'India' });
      setIsOpen(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="max-w-xl mx-auto w-full relative group z-50 text-left"
      ref={containerRef}
    >
      <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl group-hover:bg-accent/30 transition-all duration-500"></div>
      
      <form onSubmit={handleSubmit} className="relative glass-card rounded-full flex items-center p-2 pr-4 overflow-hidden border-accent/30 focus-within:border-accent">
        <div className="pl-4">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-accent transition-colors" />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search Indian city..." 
          className="w-full bg-transparent border-none outline-none px-4 py-3 text-white placeholder:text-slate-400 font-medium"
        />
        <button 
          type="submit"
          disabled={isSearching}
          className="bg-accent text-brand-navy px-6 py-2.5 rounded-full font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSearching ? <span className="animate-pulse">Analyzing</span> : 'Analyze'}
        </button>
      </form>

      <AnimatePresence>
        {isOpen && query.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 right-0 mt-3 glass-card bg-brand-navy/95 rounded-2xl overflow-hidden shadow-2xl border-slate-700/50 max-h-64 overflow-y-auto custom-scrollbar"
          >
            {filteredCities.length > 0 ? (
              filteredCities.map((c, idx) => (
                <li 
                  key={idx}
                  onClick={() => handleSelect(c)}
                  className="px-5 py-3 hover:bg-slate-800/80 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-accent/70" />
                  <div>
                    <div className="text-slate-200 font-medium">{c.city}</div>
                    <div className="text-slate-400 text-xs">{c.state}</div>
                  </div>
                </li>
              ))
            ) : (
               <li className="px-5 py-4 text-slate-400 text-sm text-center">No cities found. Type to search anyway.</li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
