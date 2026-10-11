"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalystController = void 0;
const ScanRecord_1 = require("../models/ScanRecord");
const AnalystReview_1 = require("../models/AnalystReview");
const AuditLog_1 = require("../models/AuditLog");
class AnalystController {
    static async submitReview(req, res) {
        try {
            const { scanId, revisedRiskTier, isFalsePositive, notes, flaggedForRetraining } = req.body;
            if (!scanId || !revisedRiskTier || !notes) {
                return res.status(400).json({ message: 'scanId, revisedRiskTier, and notes are required' });
            }
            const scan = await ScanRecord_1.ScanRecord.findById(scanId);
            if (!scan) {
                return res.status(404).json({ message: 'Scan record not found' });
            }
            const review = await AnalystReview_1.AnalystReview.create({
                scanId: scan._id,
                analystId: req.user.id,
                revisedRiskTier,
                isFalsePositive: Boolean(isFalsePositive),
                notes,
                flaggedForRetraining: flaggedForRetraining !== undefined ? Boolean(flaggedForRetraining) : true,
            });
            // Update scan record status
            scan.reviewedByAnalyst = true;
            scan.analystReviewId = review._id;
            if (revisedRiskTier) {
                scan.riskTier = revisedRiskTier;
            }
            await scan.save();
            // Audit Log
            await AuditLog_1.AuditLog.create({
                actorId: req.user.id,
                actorEmail: req.user.email,
                action: 'ANALYST_REVIEW_SUBMITTED',
                targetResource: `ScanRecord:${scan._id}`,
                details: { revisedRiskTier, isFalsePositive, reviewId: review._id },
            });
            return res.status(201).json({
                message: 'Analyst review recorded successfully',
                review,
            });
        }
        catch (error) {
            return res.status(500).json({ message: `Failed to submit analyst review: ${error.message}` });
        }
    }
    static async getTriageQueue(req, res) {
        try {
            // Return high/critical unreviewed scans or recent scans for analyst triage
            const queue = await ScanRecord_1.ScanRecord.find({
                $or: [{ riskTier: { $in: ['HIGH', 'CRITICAL'] } }, { reviewedByAnalyst: false }],
            })
                .sort({ createdAt: -1 })
                .limit(50);
            return res.json({ queue });
        }
        catch (error) {
            return res.status(500).json({ message: `Failed to fetch triage queue: ${error.message}` });
        }
    }
}
exports.AnalystController = AnalystController;
