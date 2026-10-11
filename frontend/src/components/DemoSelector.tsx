import React from 'react';
import { DEMO_SCENARIOS, DemoScenario } from '../services/demoData';
import { Sparkles, PlayCircle } from 'lucide-react';

interface DemoSelectorProps {
  onSelectScenario: (scenario: DemoScenario) => void;
}

export const DemoSelector: React.FC<DemoSelectorProps> = ({ onSelectScenario }) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-900/40 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs uppercase font-bold text-blue-400 tracking-wider">
            Interactive One-Click Demo Scenarios
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Select a preset threat vector to simulate scan</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {DEMO_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario)}
            className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/20 text-left transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-300">
                  {scenario.title}
                </span>
                <PlayCircle className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                {scenario.description}
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-mono text-slate-400">{scenario.type}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {scenario.category}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
