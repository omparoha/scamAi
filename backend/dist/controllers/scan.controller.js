"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanController = void 0;
const sanitization_service_1 = require("../services/sanitization.service");
const ml_client_1 = require("../services/ml.client");
const scoring_service_1 = require("../services/scoring.service");
const ScanRecord_1 = require("../models/ScanRecord");
const ssrf_1 = require("../utils/ssrf");
class ScanController {
    static async scanText(req, res) {
        try {
            const { text, scanType } = req.body;
            if (!text || typeof text !== 'string') {
                return res.status(400).json({ message: 'Valid text payload is required' });
            }
            // 1. Zero-Trust Privacy Sanitization (Redact Aadhaar, PAN, RRN, MyNumber, Financial Cards)
            const sanitization = sanitization_service_1.SanitizationService.sanitize(text);
            // 2. Query ML Service
            const mlResponse = await ml_client_1.MlServiceClient.predictText(sanitization.redactedText);
            // 3. Compute Risk Score via Aggregator Engine
            const scoringResult = scoring_service_1.ScoringEngine.calculateRisk({
                mlScore: mlResponse.ml_score,
                heuristicScore: mlResponse.text_heuristic_score,
                indicators: mlResponse.indicators,
            });
            const effectiveScanType = scanType === 'EMAIL' ? 'EMAIL' : 'TEXT';
            // 4. Persist to MongoDB (Only sanitized redacted text, never raw PII)
            const scanRecord = await ScanRecord_1.ScanRecord.create({
                submitterId: req.user?.id,
                scanType: effectiveScanType,
                rawInputRedacted: sanitization.redactedText,
                sanitizationApplied: sanitization.hasRedactions,
                redactedCategories: sanitization.redactedTypes,
                normalizedScore: scoringResult.normalizedScore,
                riskTier: scoringResult.riskTier,
                mlClassificationLabel: mlResponse.classification_label,
                mlProbability: mlResponse.ml_probability,
                breakdown: scoringResult.breakdown,
                indicators: scoringResult.indicators,
                mitigationSteps: scoringResult.mitigationSteps,
            });
            return res.status(201).json({
                scanId: scanRecord._id,
                sanitization: {
                    applied: sanitization.hasRedactions,
                    categories: sanitization.redactedTypes,
                    redactedInput: sanitization.redactedText,
                },
                normalizedScore: scoringResult.normalizedScore,
                riskTier: scoringResult.riskTier,
                breakdown: scoringResult.breakdown,
                indicators: scoringResult.indicators,
                mitigationSteps: scoringResult.mitigationSteps,
                createdAt: scanRecord.createdAt,
            });
        }
        catch (error) {
            return res.status(500).json({ message: `Scan text failed: ${error.message}` });
        }
    }
    static async scanUrl(req, res) {
        try {
            const { url } = req.body;
            if (!url || typeof url !== 'string') {
                return res.status(400).json({ message: 'Valid URL parameter is required' });
            }
            // 1. SSRF Pre-flight validation check
            const ssrfCheck = await (0, ssrf_1.validateUrlSsrf)(url);
            if (!ssrfCheck.isSafe) {
                return res.status(400).json({
                    error: 'SECURITY_SSRF_PROHIBITED',
                    message: `Anti-SSRF Protection Triggered: ${ssrfCheck.reason}`,
                    resolvedIp: ssrfCheck.resolvedIp,
                });
            }
            // 2. Query ML Service URL extractor
            const urlMlResponse = await ml_client_1.MlServiceClient.predictUrl(url);
            // 3. Compute Risk Score via Aggregator Engine
            const scoringResult = scoring_service_1.ScoringEngine.calculateRisk({
                urlScore: urlMlResponse.url_score,
                heuristicScore: urlMlResponse.url_score,
                indicators: urlMlResponse.indicators,
            });
            // 4. Persist Scan Record
            const scanRecord = await ScanRecord_1.ScanRecord.create({
                submitterId: req.user?.id,
                scanType: 'URL',
                rawInputRedacted: url,
                sanitizationApplied: false,
                redactedCategories: [],
                normalizedScore: scoringResult.normalizedScore,
                riskTier: scoringResult.riskTier,
                mlClassificationLabel: scoringResult.riskTier === 'CRITICAL' || scoringResult.riskTier === 'HIGH' ? 'PHISHING_URL' : 'SAFE_URL',
                mlProbability: urlMlResponse.url_score / 100,
                breakdown: scoringResult.breakdown,
                indicators: scoringResult.indicators,
                mitigationSteps: scoringResult.mitigationSteps,
            });
            return res.status(201).json({
                scanId: scanRecord._id,
                url: url,
                resolvedIp: ssrfCheck.resolvedIp,
                normalizedScore: scoringResult.normalizedScore,
                riskTier: scoringResult.riskTier,
                breakdown: scoringResult.breakdown,
                indicators: scoringResult.indicators,
                mitigationSteps: scoringResult.mitigationSteps,
                createdAt: scanRecord.createdAt,
            });
        }
        catch (error) {
            return res.status(500).json({ message: `Scan URL failed: ${error.message}` });
        }
    }
    static async scanOcrFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Screenshot file upload is required' });
            }
            // Validate MIME type & file size (max 5MB)
            const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
            if (!allowedMimes.includes(req.file.mimetype)) {
                return res.status(400).json({ message: `Unsupported image MIME type: ${req.file.mimetype}` });
            }
            if (req.file.size > 5 * 1024 * 1024) {
                return res.status(400).json({ message: 'File size exceeds maximum 5MB limit' });
            }
            // 1. Process buffer with OCR ML Engine (Raw image buffer is NOT permanently saved to disk)
            const ocrResponse = await ml_client_1.MlServiceClient.predictOcr(req.file.buffer, req.file.mimetype);
            // 2. Sanitize extracted OCR text
            const sanitization = sanitization_service_1.SanitizationService.sanitize(ocrResponse.extracted_text);
            // 3. Compute Risk Aggregation
            const scoringResult = scoring_service_1.ScoringEngine.calculateRisk({
                mlScore: ocrResponse.prediction.ml_score,
                heuristicScore: ocrResponse.prediction.text_heuristic_score,
                indicators: ocrResponse.prediction.indicators,
            });
            // 4. Persist record with sanitized OCR text only
            const scanRecord = await ScanRecord_1.ScanRecord.create({
                submitterId: req.user?.id,
                scanType: 'FILE_OCR',
                rawInputRedacted: sanitization.redactedText,
                sanitizationApplied: sanitization.hasRedactions,
                redactedCategories: sanitization.redactedTypes,
                normalizedScore: scoringResult.normalizedScore,
                riskTier: scoringResult.riskTier,
                mlClassificationLabel: ocrResponse.prediction.classification_label,
                mlProbability: ocrResponse.prediction.ml_probability,
                breakdown: scoringResult.breakdown,
                indicators: scoringResult.indicators,
                mitigationSteps: scoringResult.mitigationSteps,
            });
            return res.status(201).json({
                scanId: scanRecord._id,
                extractedTextRedacted: sanitization.redactedText,
                sanitization: {
                    applied: sanitization.hasRedactions,
                    categories: sanitization.redactedTypes,
                },
                normalizedScore: scoringResult.normalizedScore,
                riskTier: scoringResult.riskTier,
                breakdown: scoringResult.breakdown,
                indicators: scoringResult.indicators,
                mitigationSteps: scoringResult.mitigationSteps,
                createdAt: scanRecord.createdAt,
            });
        }
        catch (error) {
            return res.status(500).json({ message: `OCR screenshot scan failed: ${error.message}` });
        }
    }
    static async getScanHistory(req, res) {
        try {
            const query = req.user ? { submitterId: req.user.id } : {};
            const scans = await ScanRecord_1.ScanRecord.find(query).sort({ createdAt: -1 }).limit(50);
            return res.json({ scans });
        }
        catch (error) {
            return res.status(500).json({ message: `Failed to fetch scan history: ${error.message}` });
        }
    }
    static async getScanById(req, res) {
        try {
            const scan = await ScanRecord_1.ScanRecord.findById(req.params.id);
            if (!scan) {
                return res.status(404).json({ message: 'Scan record not found' });
            }
            return res.json({ scan });
        }
        catch (error) {
            return res.status(500).json({ message: `Failed to fetch scan: ${error.message}` });
        }
    }
}
exports.ScanController = ScanController;
