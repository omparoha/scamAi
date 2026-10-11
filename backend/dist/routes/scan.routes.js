"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const scan_controller_1 = require("../controllers/scan.controller");
const auth_1 = require("../middleware/auth");
const ssrf_guard_1 = require("../middleware/ssrf.guard");
const upload = (0, multer_1.default)({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    storage: multer_1.default.memoryStorage(), // Memory buffer storage - no permanent raw image storage
});
const router = (0, express_1.Router)();
router.post('/text', auth_1.authenticateJwt, scan_controller_1.ScanController.scanText);
router.post('/url', auth_1.authenticateJwt, ssrf_guard_1.ssrfGuardMiddleware, scan_controller_1.ScanController.scanUrl);
router.post('/ocr', auth_1.authenticateJwt, upload.single('file'), scan_controller_1.ScanController.scanOcrFile);
router.get('/history', auth_1.authenticateJwt, scan_controller_1.ScanController.getScanHistory);
router.get('/:id', auth_1.authenticateJwt, scan_controller_1.ScanController.getScanById);
exports.default = router;
