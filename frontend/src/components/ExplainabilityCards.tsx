import React from 'react';
import { ISignalIndicator } from '../types/scan';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ExplainabilityCardsProps {
  indicators: ISignalIndicator[];
}

export const ExplainabilityCards: React.FC<ExplainabilityCardsProps> = ({ indicators }) => {
  if (!indicators || indicators.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>No malicious social engineering indicators or suspicious patterns detected.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
        <ShieldAlert className="w-4 h-4 text-amber-400" />
        Itemized Threat Breakdown & Explainability Signals
      </h4>
      <div className="grid grid-cols-1 gap-2">
        {indicators.map((ind, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <AlertTriangle
                className={`w-4 h-4 shrink-0 ${
                  ind.impact >= 30
                    ? 'text-red-400'
                    : ind.impact > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              />
              <span className="text-sm font-medium text-slate-200 truncate">{ind.signal}</span>
            </div>
            {ind.impact > 0 ? (
              <span className="shrink-0 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                +{ind.impact} Risk
              </span>
            ) : (
              <span className="shrink-0 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                0 Risk
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
