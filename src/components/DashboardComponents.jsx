import { motion } from 'framer-motion';
import { ShieldAlert, Activity, HeartPulse, Leaf } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const getCategoryColor = (category) => {
  switch((category || '').toLowerCase()) {
    case 'good': return '#22c55e'; // Green
    case 'satisfactory': return '#86efac'; // Light Green
    case 'moderate': return '#facc15'; // Yellow
    case 'poor': return '#f97316'; // Orange
    case 'very poor': return '#ef4444'; // Red
    case 'severe': return '#9f1239'; // Maroon
    default: return '#00f0ff'; // Default Accent
  }
};


export const AQIGauge = ({ value, color = '#00f0ff' }) => {
  // Simplified gauge using PieChart
  const data = [
    { name: 'AQI', value: value },
    { name: 'Remaining', value: 500 - value > 0 ? 500 - value : 0 }
  ];
  const COLORS = [color, '#1e293b']; // accent and dark

  return (
    <div className="h-48 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-0 left-0 right-0 text-center pb-2">
        <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">{value}</span>
      </div>
    </div>
  );
};

export const AQICard = ({ data }) => {
  const color = getCategoryColor(data.category);
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-200">Air Quality Index</h2>
          <p className="text-sm text-slate-400">{data.city}, {data.state} • Live</p>
        </div>
        <div 
           className="px-3 py-1 rounded-full font-bold text-sm border"
           style={{ backgroundColor: `${color}20`, color: color, borderColor: `${color}50` }}
        >
          {data.category}
        </div>
      </div>
      
      <AQIGauge value={data.aqi} color={color} />
    </motion.div>
  );
};

export const PollutantsChart = ({ pollutants }) => {
  const data = Object.entries(pollutants).map(([key, value]) => ({
    name: key.toUpperCase(),
    value: value
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6 h-full"
    >
      <h2 className="text-xl font-bold text-slate-200 mb-6">Pollutants Breakdown</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
            <XAxis type="number" stroke="#475569" />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
            />
            <Bar dataKey="value" fill="#00f0ff" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export const HealthAdvisoryCard = ({ advisory }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6 neon-border relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-accent/20 text-accent">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white shadow-sm">AI Health Advisory</h2>
      </div>
      <p className="text-slate-300 leading-relaxed font-medium">
        {advisory}
      </p>
    </motion.div>
  );
};

export const RiskGroupCard = ({ groups }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
        <HeartPulse className="w-5 h-5 text-rose-400" />
        High Risk Groups
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {groups && groups.map((group, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/50 hover:border-rose-400/50 transition-colors">
            <span className="text-sm font-medium text-slate-300">{group.name || group}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const PrecautionCard = ({ precautions }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-emerald-400" />
        Recommended Precautions
      </h3>
      <ul className="space-y-3 mt-4">
        {precautions.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
             <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
             <span className="text-slate-300 text-sm leading-tight">{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export const ActivitySuggestion = ({ activity }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-amber-400" />
        Outdoor Activity
      </h3>
      <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 text-amber-200 font-medium text-sm">
        {activity}
      </div>
    </motion.div>
  );
};
