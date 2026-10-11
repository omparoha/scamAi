import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ScanRecordItem, RiskTier } from '../types/scan';
import { Eye, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export const AnalystTriage: React.FC = () => {
  const [queue, setQueue] = useState<ScanRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedScan, setSelectedScan] = useState<ScanRecordItem | null>(null);

  const [revisedTier, setRevisedTier] = useState<RiskTier>('HIGH');
  const [isFalsePositive, setIsFalsePositive] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/analyst/queue');
      setQueue(res.data.queue || []);
      if (res.data.queue && res.data.queue.length > 0) {
        setSelectedScan(res.data.queue[0]);
        setRevisedTier(res.data.queue[0].riskTier);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScan || !notes.trim()) return;

    try {
      await api.post('/analyst/reviews', {
        scanId: selectedScan._id,
        revisedRiskTier: revisedTier,
        isFalsePositive,
        notes: notes.trim(),
        flaggedForRetraining: true,
      });

      setSubmitStatus('Analyst review submitted & sample queued for ML retraining!');
      setTimeout(() => setSubmitStatus(null), 4000);
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Review submission failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold uppercase mb-1">
            <Eye className="w-3.5 h-3.5" /> Security Operations Center (SOC)
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Human-in-the-Loop Analyst Review Console
          </h1>
        </div>
        <button
          onClick={fetchQueue}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:text-white flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-sm">Loading SOC Triage Queue...</div>
      ) : queue.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-500 space-y-2">
          <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500" />
          <p className="text-sm font-semibold text-slate-300">Triage Queue Clear!</p>
          <p className="text-xs text-slate-500">No unreviewed high-risk scan threats pending manual analyst audit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scan List */}
          <div className="lg:col-span-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Scans ({queue.length})
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {queue.map((scan) => (
                <button
                  key={scan._id}
                  onClick={() => {
                    setSelectedScan(scan);
                    setRevisedTier(scan.riskTier);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selectedScan?._id === scan._id
                      ? 'bg-slate-800/90 border-blue-500'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-blue-400 font-bold">{scan.scanType}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      scan.riskTier === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {scan.riskTier} ({scan.normalizedScore})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 font-mono">{scan.rawInputRedacted}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Review Details & Action Form */}
          <div className="lg:col-span-7 space-y-6">
            {selectedScan && (
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Sanitized Payload Inspection
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedScan.rawInputRedacted}
                  </div>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Analyst Classification Override & Feedback
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Revise Risk Tier</label>
                      <select
                        value={revisedTier}
                        onChange={(e) => setRevisedTier(e.target.value as RiskTier)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-bold"
                      >
                        <option value="LOW">LOW (Legitimate)</option>
                        <option value="MEDIUM">MEDIUM (Review)</option>
                        <option value="HIGH">HIGH (Phishing)</option>
                        <option value="CRITICAL">CRITICAL (Financial Fraud)</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={isFalsePositive}
                          onChange={(e) => setIsFalsePositive(e.target.checked)}
                          className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
                        />
                        <span>Flag as False Positive</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Analyst Notes & Retraining Justification</label>
                    <textarea
                      rows={3}
                      required
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Explain analyst decision for model feedback loop..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs resize-none"
                    />
                  </div>

                  {submitStatus && (
                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{submitStatus}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
                  >
                    Submit SOC Analyst Review
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
