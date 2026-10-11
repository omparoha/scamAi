import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ScanRecord } from '../models/ScanRecord';
import { AnalystReview } from '../models/AnalystReview';
import { AuditLog } from '../models/AuditLog';

export class AnalystController {
  public static async submitReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { scanId, revisedRiskTier, isFalsePositive, notes, flaggedForRetraining } = req.body;

      if (!scanId || !revisedRiskTier || !notes) {
        return res.status(400).json({ message: 'scanId, revisedRiskTier, and notes are required' });
      }

      const scan = await ScanRecord.findById(scanId);
      if (!scan) {
        return res.status(404).json({ message: 'Scan record not found' });
      }

      const review = await AnalystReview.create({
        scanId: scan._id,
        analystId: req.user!.id,
        revisedRiskTier,
        isFalsePositive: Boolean(isFalsePositive),
        notes,
        flaggedForRetraining: flaggedForRetraining !== undefined ? Boolean(flaggedForRetraining) : true,
      });

      // Update scan record status
      scan.reviewedByAnalyst = true;
      scan.analystReviewId = review._id as any;
      if (revisedRiskTier) {
        scan.riskTier = revisedRiskTier;
      }
      await scan.save();

      // Audit Log
      await AuditLog.create({
        actorId: req.user!.id as any,
        actorEmail: req.user!.email,
        action: 'ANALYST_REVIEW_SUBMITTED',
        targetResource: `ScanRecord:${scan._id}`,
        details: { revisedRiskTier, isFalsePositive, reviewId: review._id },
      });

      return res.status(201).json({
        message: 'Analyst review recorded successfully',
        review,
      });
    } catch (error: any) {
      return res.status(500).json({ message: `Failed to submit analyst review: ${error.message}` });
    }
  }

  public static async getTriageQueue(req: AuthenticatedRequest, res: Response) {
    try {
      // Return high/critical unreviewed scans or recent scans for analyst triage
      const queue = await ScanRecord.find({
        $or: [{ riskTier: { $in: ['HIGH', 'CRITICAL'] } }, { reviewedByAnalyst: false }],
      })
        .sort({ createdAt: -1 })
        .limit(50);

      return res.json({ queue });
    } catch (error: any) {
      return res.status(500).json({ message: `Failed to fetch triage queue: ${error.message}` });
    }
  }
}
