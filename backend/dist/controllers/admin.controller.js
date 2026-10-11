"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const User_1 = require("../models/User");
const ScanRecord_1 = require("../models/ScanRecord");
const AnalystReview_1 = require("../models/AnalystReview");
const AuditLog_1 = require("../models/AuditLog");
class AdminController {
    static async getTelemetry(req, res) {
        try {
            const totalScans = await ScanRecord_1.ScanRecord.countDocuments();
            const totalUsers = await User_1.User.countDocuments();
            const totalReviews = await AnalystReview_1.AnalystReview.countDocuments();
            const lowRiskCount = await ScanRecord_1.ScanRecord.countDocuments({ riskTier: 'LOW' });
            const mediumRiskCount = await ScanRecord_1.ScanRecord.countDocuments({ riskTier: 'MEDIUM' });
            const highRiskCount = await ScanRecord_1.ScanRecord.countDocuments({ riskTier: 'HIGH' });
            const criticalRiskCount = await ScanRecord_1.ScanRecord.countDocuments({ riskTier: 'CRITICAL' });
            const textScanCount = await ScanRecord_1.ScanRecord.countDocuments({ scanType: 'TEXT' });
            const urlScanCount = await ScanRecord_1.ScanRecord.countDocuments({ scanType: 'URL' });
            const ocrScanCount = await ScanRecord_1.ScanRecord.countDocuments({ scanType: 'FILE_OCR' });
            const emailScanCount = await ScanRecord_1.ScanRecord.countDocuments({ scanType: 'EMAIL' });
            const recentAuditLogs = await AuditLog_1.AuditLog.find().sort({ createdAt: -1 }).limit(20);
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
        }
        catch (error) {
            return res.status(500).json({ message: `Failed to fetch telemetry: ${error.message}` });
        }
    }
    static async getUsers(req, res) {
        try {
            const users = await User_1.User.find().select('-passwordHash -refreshTokens').sort({ createdAt: -1 });
            return res.json({ users });
        }
        catch (error) {
            return res.status(500).json({ message: `Failed to fetch users: ${error.message}` });
        }
    }
    static async updateUserRole(req, res) {
        try {
            const { userId, role } = req.body;
            if (!userId || !['USER', 'SECURITY_ANALYST', 'ADMIN'].includes(role)) {
                return res.status(400).json({ message: 'Valid userId and role are required' });
            }
            const user = await User_1.User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            user.role = role;
            await user.save();
            await AuditLog_1.AuditLog.create({
                actorId: req.user.id,
                actorEmail: req.user.email,
                action: 'USER_ROLE_UPDATED',
                targetResource: `User:${user._id}`,
                details: { newRole: role },
            });
            return res.json({ message: 'User role updated successfully', user });
        }
        catch (error) {
            return res.status(500).json({ message: `Failed to update user role: ${error.message}` });
        }
    }
}
exports.AdminController = AdminController;
