import React, { useState } from 'react';
import api from '../services/api';
import { ScanResult, ScanType } from '../types/scan';
import { DemoScenario } from '../services/demoData';
import { RiskGauge } from '../components/RiskGauge';
import { ExplainabilityCards } from '../components/ExplainabilityCards';
import { ActionPanel } from '../components/ActionPanel';
import { SanitizationBadge } from '../components/SanitizationBadge';
import { DemoSelector } from '../components/DemoSelector';
import { Shield, Link as LinkIcon, FileText, Upload, Mail, AlertCircle, Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [scanType, setScanType] = useState<ScanType>('TEXT');
  const [inputText, setInputText] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<ScanResult | null>(null);

  const handleSelectScenario = (scenario: DemoScenario) => {
    setErrorMessage(null);
    setScanType(scenario.type);
    if (scenario.type === 'URL') {
      setInputUrl(scenario.rawInput);
    } else {
      setInputText(scenario.rawInput);
    }
    setActiveResult(scenario.presetResult);
  };

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    setActiveResult(null);

    try {
      if (scanType === 'URL') {
        if (!inputUrl.trim()) {
          setErrorMessage('Please enter a target URL to evaluate');
          setIsLoading(false);
          return;
        }
        const res = await api.post('/scans/url', { url: inputUrl.trim() });
        setActiveResult(res.data);
      } else if (scanType === 'FILE_OCR') {
        if (!selectedFile) {
          setErrorMessage('Please upload a screenshot image file (Max 5MB)');
          setIsLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await api.post('/scans/ocr', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setActiveResult(res.data);
      } else {
        // TEXT or EMAIL
        if (!inputText.trim()) {
          setErrorMessage('Please enter suspicious message or email text');
          setIsLoading(false);
          return;
        }
        const res = await api.post('/scans/text', { text: inputText.trim(), scanType });
        setActiveResult(res.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Scan failed';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" /> AI/ML Social Engineering & Phishing Shield
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Evaluate Threat Risk in Real-Time
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Multi-layered risk engine evaluating text messages, job offers, suspicious links, and screenshot OCR buffers using deterministic rules and TF-IDF machine learning.
        </p>
      </div>

      {/* Interactive Demo Selector */}
      <DemoSelector onSelectScenario={handleSelectScenario} />

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scanner Input Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
            {/* Scanner Type Tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => { setScanType('TEXT'); setErrorMessage(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  scanType === 'TEXT'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Text / SMS
              </button>
              <button
                type="button"
                onClick={() => { setScanType('URL'); setErrorMessage(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  scanType === 'URL'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> URL Link
              </button>
              <button
                type="button"
                onClick={() => { setScanType('FILE_OCR'); setErrorMessage(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  scanType === 'FILE_OCR'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Screenshot OCR
              </button>
              <button
                type="button"
                onClick={() => { setScanType('EMAIL'); setErrorMessage(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  scanType === 'EMAIL'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Email Content
              </button>
            </div>

            <form onSubmit={handleRunScan} className="space-y-4">
              {scanType === 'URL' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Target URL Address (Anti-SSRF Protected)
                  </label>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://suspicious-login-update.top"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 font-mono transition"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Pre-flight DNS lookup automatically blocks loopback, RFC1918 private IPs, and cloud metadata targets.
                  </span>
                </div>
              ) : scanType === 'FILE_OCR' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Upload Screenshot (Max 5MB • JPG, PNG, WEBP)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Raw screenshot buffers are processed in-memory only and never permanently stored on disk.
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Message or Job Offer Content
                  </label>
                  <textarea
                    rows={6}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste suspicious SMS message, job offer, or email content here..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition resize-none font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Zero-Trust Privacy Sanitization automatically redacts Aadhaar, PAN, RRN, MyNumber, and financial card numbers.
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Threat Vector...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Execute ScamShield Analysis</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Threat Assessment Visualizer Output Panel */}
        <div className="lg:col-span-5 space-y-6">
          {activeResult ? (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
              <div className="text-center pb-4 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Threat Assessment Visualizer
                </h3>
                <RiskGauge score={activeResult.normalizedScore} tier={activeResult.riskTier} />
              </div>

              {/* Score Breakdown Bars */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Model Component Weights
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">ML Model (40%):</span>
                    <span className="font-mono font-bold text-blue-400">{activeResult.breakdown.mlScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">URL Metrics (25%):</span>
                    <span className="font-mono font-bold text-blue-400">{activeResult.breakdown.urlScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Heuristics (20%):</span>
                    <span className="font-mono font-bold text-blue-400">{activeResult.breakdown.heuristicScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Reputation (10%):</span>
                    <span className="font-mono font-bold text-slate-500">Fallback (0)</span>
                  </div>
                </div>
              </div>

              {/* Zero-Trust Redaction Badge */}
              {activeResult.sanitization && (
                <SanitizationBadge categories={activeResult.sanitization.categories} />
              )}

              {/* Explainability Signal Cards */}
              <ExplainabilityCards indicators={activeResult.indicators} />

              {/* Interactive Action Mitigation Panel */}
              <ActionPanel
                mitigationSteps={activeResult.mitigationSteps}
                riskTier={activeResult.riskTier}
                urlHost={activeResult.resolvedIp}
              />
            </div>
          ) : (
            <div className="h-full min-h-[380px] p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
              <Shield className="w-12 h-12 text-slate-700 stroke-1" />
              <div>
                <h3 className="text-sm font-semibold text-slate-400">Awaiting Threat Payload</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Select a demo scenario above or enter custom message content to generate animated risk visualizer.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
