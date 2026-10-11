"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanRecord = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ScanRecordSchema = new mongoose_1.Schema({
    submitterId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'AnalystReview',
    },
}, {
    timestamps: true,
});
exports.ScanRecord = mongoose_1.default.model('ScanRecord', ScanRecordSchema);
