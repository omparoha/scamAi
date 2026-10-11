import React from 'react';
import { ShieldCheck, ShieldAlert, ExternalLink, ArrowRight } from 'lucide-react';
import { RiskTier } from '../types/scan';

interface ActionPanelProps {
  mitigationSteps: string[];
  riskTier: RiskTier;
  urlHost?: string;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ mitigationSteps, riskTier, urlHost }) => {
  const isHighRisk = riskTier === 'HIGH' || riskTier === 'CRITICAL';

  return (
    <div
      className={`p-5 rounded-xl border ${
        isHighRisk
          ? 'bg-red-950/20 border-red-900/40 text-red-100'
          : 'bg-slate-900/60 border-slate-800 text-slate-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {isHighRisk ? (
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        )}
        <h3 className="font-semibold text-base">Recommended Mitigation & Incident Actions</h3>
      </div>

      <ul className="space-y-2 mb-4">
        {mitigationSteps.map((step, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
            <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>{step}</span>
          </li>
        ))}
      </ul>

      {urlHost && (
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Target Host: <strong className="text-slate-200 font-mono">{urlHost}</strong></span>
          <a
            href={`https://lookup.icann.org/en/lookup?q=${encodeURIComponent(urlHost)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 hover:underline"
          >
            Verify Domain via ICANN Lookup
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
