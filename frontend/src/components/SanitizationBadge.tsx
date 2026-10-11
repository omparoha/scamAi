import React from 'react';
import { Lock, EyeOff } from 'lucide-react';

interface SanitizationBadgeProps {
  categories: string[];
}

export const SanitizationBadge: React.FC<SanitizationBadgeProps> = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
        <div>
          <span className="font-semibold">Zero-Trust Privacy Sanitization Active:</span> Raw PII redacted before logging or database persistence.
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {categories.map((cat) => (
          <span
            key={cat}
            className="px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700/50 text-[10px] font-mono font-bold tracking-wider"
          >
            <EyeOff className="w-3 h-3 inline mr-1" />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
};
