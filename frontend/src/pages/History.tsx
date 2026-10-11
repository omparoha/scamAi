import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ScanRecordItem } from '../types/scan';
import { History as HistoryIcon, Shield, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [scans, setScans] = useState<ScanRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/scans/history');
        setScans(res.data.scans || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load scan history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-blue-500" />
            Threat Detection Audit History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Historical log of processed scans with sanitized payloads and normalized risk scores.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm font-mono animate-pulse">
          Loading audit records from MongoDB...
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>{error}</span>
        </div>
      ) : scans.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-500 space-y-2">
          <Shield className="w-10 h-10 mx-auto text-slate-700" />
          <p className="text-sm font-medium">No historical scan records found</p>
          <p className="text-xs text-slate-600">Run a scan on the threat scanner page to populate this audit trail.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Payload (Sanitized)</th>
                  <th className="px-6 py-4">Normalized Score</th>
                  <th className="px-6 py-4">Risk Tier</th>
                  <th className="px-6 py-4">Redactions</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scans.map((scan) => (
                  <tr key={scan._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-blue-400">
                      {scan.scanType}
                    </td>
                    <td className="px-6 py-4 max-w-md truncate font-mono text-xs text-slate-300">
                      {scan.rawInputRedacted}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">
                      {scan.normalizedScore} / 100
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTierBadge(scan.riskTier)}`}>
                        {scan.riskTier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {scan.sanitizationApplied ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                          {scan.redactedCategories.join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
