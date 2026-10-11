export type ScanType = 'TEXT' | 'URL' | 'EMAIL' | 'FILE_OCR';
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ISignalIndicator {
  signal: string;
  impact: number;
  category?: string;
}

export interface IScoreBreakdown {
  mlScore: number;
  urlScore: number;
  heuristicScore: number;
  reputationScore: number;
  llmScore: number;
}

export interface ScanResult {
  scanId: string;
  sanitization?: {
    applied: boolean;
    categories: string[];
    redactedInput?: string;
  };
  extractedTextRedacted?: string;
  resolvedIp?: string;
  normalizedScore: number;
  riskTier: RiskTier;
  breakdown: IScoreBreakdown;
  indicators: ISignalIndicator[];
  mitigationSteps: string[];
  createdAt: string;
}

export interface ScanRecordItem {
  _id: string;
  scanType: ScanType;
  rawInputRedacted: string;
  sanitizationApplied: boolean;
  redactedCategories: string[];
  normalizedScore: number;
  riskTier: RiskTier;
  mlClassificationLabel: string;
  breakdown: IScoreBreakdown;
  indicators: ISignalIndicator[];
  mitigationSteps: string[];
  reviewedByAnalyst: boolean;
  createdAt: string;
}
