import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalystReview extends Document {
  scanId: mongoose.Types.ObjectId;
  analystId: mongoose.Types.ObjectId;
  revisedRiskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isFalsePositive: boolean;
  notes: string;
  flaggedForRetraining: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnalystReviewSchema: Schema = new Schema(
  {
    scanId: {
      type: Schema.Types.ObjectId,
      ref: 'ScanRecord',
      required: true,
      index: true,
    },
    analystId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    revisedRiskTier: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    isFalsePositive: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      required: true,
    },
    flaggedForRetraining: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AnalystReview = mongoose.model<IAnalystReview>('AnalystReview', AnalystReviewSchema);
