import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { ScanRecord } from '../models/ScanRecord';
import { AnalystReview } from '../models/AnalystReview';
import { AuditLog } from '../models/AuditLog';

export class AdminController {
  public static async getTelemetry(req: AuthenticatedRequest, res: Response) {
    try {
      const totalScans = await ScanRecord.countDocuments();
      const totalUsers = await User.countDocuments();
      const totalReviews = await AnalystReview.countDocuments();

      const lowRiskCount = await ScanRecord.countDocuments({ riskTier: 'LOW' });
      const mediumRiskCount = await ScanRecord.countDocuments({ riskTier: 'MEDIUM' });
      const highRiskCount = await ScanRecord.countDocuments({ riskTier: 'HIGH' });
      const criticalRiskCount = await ScanRecord.countDocuments({ riskTier: 'CRITICAL' });

      const textScanCount = await ScanRecord.countDocuments({ scanType: 'TEXT' });
      const urlScanCount = await ScanRecord.countDocuments({ scanType: 'URL' });
      const ocrScanCount = await ScanRecord.countDocuments({ scanType: 'FILE_OCR' });
      const emailScanCount = await ScanRecord.countDocuments({ scanType: 'EMAIL' });

      const recentAuditLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(20);

      return res.json({
        telemetry: {
          totalScans,
          totalUsers,
          totalReviews,
          riskDistribution: {
            LOW: lowRiskCount,
            MEDIUM: mediumRiskCount,
            HIGH: highRiskCount,
            CRITICAL: criticalRiskCount,
          },
          scanTypeDistribution: {
            TEXT: textScanCount,
            URL: urlScanCount,
            FILE_OCR: ocrScanCount,
            EMAIL: emailScanCount,
          },
        },
        recentAuditLogs,
      });
    } catch (error: any) {
      return res.status(500).json({ message: `Failed to fetch telemetry: ${error.message}` });
    }
  }

  public static async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await User.find().select('-passwordHash -refreshTokens').sort({ createdAt: -1 });
      return res.json({ users });
    } catch (error: any) {
      return res.status(500).json({ message: `Failed to fetch users: ${error.message}` });
    }
  }

  public static async updateUserRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, role } = req.body;
      if (!userId || !['USER', 'SECURITY_ANALYST', 'ADMIN'].includes(role)) {
        return res.status(400).json({ message: 'Valid userId and role are required' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.role = role;
      await user.save();

      await AuditLog.create({
        actorId: req.user!.id as any,
        actorEmail: req.user!.email,
        action: 'USER_ROLE_UPDATED',
        targetResource: `User:${user._id}`,
        details: { newRole: role },
      });

      return res.json({ message: 'User role updated successfully', user });
    } catch (error: any) {
      return res.status(500).json({ message: `Failed to update user role: ${error.message}` });
    }
  }
}
