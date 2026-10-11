import React from 'react';
import { RiskTier } from '../types/scan';

interface RiskGaugeProps {
  score: number; // 0 to 100
  tier: RiskTier;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, tier, size = 180 }) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    switch (tier) {
      case 'CRITICAL':
        return { stroke: '#EF4444', text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      case 'HIGH':
        return { stroke: '#F97316', text: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
      case 'MEDIUM':
        return { stroke: '#F59E0B', text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      case 'LOW':
      default:
        return { stroke: '#10B981', text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    }
  };

  const theme = getColor();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1F2937"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold font-mono tracking-tight ${theme.text}`}>
            {score}
          </span>
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider mt-0.5">
            / 100 Risk
          </span>
        </div>
      </div>

      <div className={`mt-3 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${theme.bg} ${theme.text} ${theme.border}`}>
        {tier} THREAT TIER
      </div>
    </div>
  );
};
