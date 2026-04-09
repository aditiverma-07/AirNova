import { motion } from 'framer-motion';
import { 
  AQICard, 
  PollutantsChart, 
  HealthAdvisoryCard, 
  RiskGroupCard, 
  PrecautionCard, 
  ActivitySuggestion 
} from './DashboardComponents';

export const Dashboard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto w-full px-6 pb-20 space-y-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column: AQI & Pollutants */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <AQICard data={data} />
          <PollutantsChart pollutants={data.pollutants} />
        </div>

        {/* Right Column: AI Advisory & Details */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <HealthAdvisoryCard advisory={data.health_advisory} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RiskGroupCard groups={data.risk_groups} />
            <div className="flex flex-col gap-8">
              <PrecautionCard precautions={data.precautions || []} />
              <ActivitySuggestion activity={data.activity_suggestion || data.activity} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
