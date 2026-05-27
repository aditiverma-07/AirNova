import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { SearchCity } from './components/SearchCity';
import { fetchAQIData } from './services/api';
import { Loader2, AlertCircle } from 'lucide-react';

function App() {

  const [isSearching, setIsSearching] = useState(true); // default to true for initial mount loading
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch default city on page load
    handleSearch('Indore');
  }, []);

  const handleSearch = async (city) => {
    if (!city) return;
    setIsSearching(true);
    setError(null);
    try {
      const result = await fetchAQIData(city);
      if (!result || result.error) {
         setError(result?.error || 'No data available for this city.');
         setData(null);
      } else {
         setData(result);
      }
    } catch (err) {
      console.error("Error fetching AQI data", err);
      setError(err.message || 'Unable to fetch live AQI currently');
      setData(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-accent/30 flex flex-col items-center">
      <Navbar />
      
      {isSearching && !data && !error && (
         <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
            <p className="text-slate-400">Analyzing Air Quality...</p>
         </div>
      )}

      {error && !isSearching && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
           <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
           <h2 className="text-2xl font-bold text-slate-200 mb-2">Retrieval Failed</h2>
           <p className="text-slate-400 max-w-md mx-auto mb-8">{error}</p>
           <SearchCity onSearch={handleSearch} isSearching={isSearching} defaultCityName="Indore" />
        </div>
      )}

      {!data && !isSearching && !error && (
        <Hero onSearch={handleSearch} isSearching={isSearching} />
      )}
      
      {data && !error && (
         <div className="w-full animate-in fade-in duration-700">
           {/* Minified Hero variation when data is present */}
           <div className="pt-10 pb-12 px-6 flex flex-col items-center justify-center text-center">
             <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
                Air<span className="text-accent">Nova</span> Advisory
             </h1>
             <div className="w-full max-w-xl relative">
               <SearchCity 
                 onSearch={handleSearch} 
                 isSearching={isSearching} 
                 defaultCityName={`${data.city}, ${data.state}`} 
               />
               {isSearching && (
                 <div className="absolute top-full left-0 right-0 mt-4 flex justify-center">
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-full border border-slate-700 backdrop-blur-sm">
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      <span className="text-sm font-medium text-slate-300">Updating data...</span>
                   </div>
                 </div>
               )}
             </div>
           </div>
           
           <Dashboard data={data} />
         </div>
      )}
    </div>
  );
}

export default App;
