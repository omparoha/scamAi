import mongoose, { Schema, Document } from 'mongoose';

export type ScanType = 'TEXT' | 'URL' | 'EMAIL' | 'FILE_OCR';
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ISignalIndicator {
  signal: string;
  impact: number; // e.g. +20, +30
  category?: string;
}

export interface IScoreBreakdown {
  mlScore: number;
  urlScore: number;
  heuristicScore: number;
  reputationScore: number;
  llmScore: number;
}

export interface IScanRecord extends Document {
  submitterId?: mongoose.Types.ObjectId;
  scanType: ScanType;
  rawInputRedacted: string;
  sanitizationApplied: boolean;
  redactedCategories: string[];
  normalizedScore: number; // 0 to 100
  riskTier: RiskTier;
  mlClassificationLabel: string;
  mlProbability: number;
  breakdown: IScoreBreakdown;
  indicators: ISignalIndicator[];
  mitigationSteps: string[];
  reviewedByAnalyst: boolean;
  analystReviewId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ScanRecordSchema: Schema = new Schema(
  {
    submitterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: false,
    },
    scanType: {
      type: String,
      enum: ['TEXT', 'URL', 'EMAIL', 'FILE_OCR'],
      required: true,
      index: true,
    },
    rawInputRedacted: {
      type: String,
      required: true,
    },
    sanitizationApplied: {
      type: Boolean,
      default: false,
    },
    redactedCategories: {
      type: [String],
      default: [],
    },
    normalizedScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    riskTier: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      index: true,
    },
    mlClassificationLabel: {
      type: String,
      default: 'SUSPICIOUS',
    },
    mlProbability: {
      type: Number,
      default: 0,
    },
    breakdown: {
      mlScore: { type: Number, default: 0 },
      urlScore: { type: Number, default: 0 },
      heuristicScore: { type: Number, default: 0 },
      reputationScore: { type: Number, default: 0 },
      llmScore: { type: Number, default: 0 },
    },
    indicators: [
      {
        signal: { type: String, required: true },
        impact: { type: Number, required: true },
        category: { type: String },
      },
    ],
    mitigationSteps: {
      type: [String],
      default: [],
    },
    reviewedByAnalyst: {
      type: Boolean,
      default: false,
      index: true,
    },
    analystReviewId: {
      type: Schema.Types.ObjectId,
      ref: 'AnalystReview',
    },
  },
  {
    timestamps: true,
  }
);

export const ScanRecord = mongoose.model<IScanRecord>('ScanRecord', ScanRecordSchema);
