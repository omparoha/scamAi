"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringEngine = void 0;
class ScoringEngine {
    /**
     * Calculates normalized risk R in [0, 100] using configurable weighted aggregation:
     * R = w_ml*S_ml + w_url*S_url + w_heur*S_heur + w_rep*S_rep + w_llm*S_llm
     */
    static calculateRisk(inputs) {
        // Default weights specified in requirements:
        let w_ml = 0.40;
        let w_url = 0.25;
        let w_heur = 0.20;
        let w_rep = 0.10;
        let w_llm = 0.05;
        const S_ml = inputs.mlScore ?? 0;
        const S_url = inputs.urlScore ?? 0;
        const S_heur = inputs.heuristicScore ?? 0;
        const S_rep = inputs.reputationScore ?? 0;
        const S_llm = inputs.llmScore ?? 0;
        // Check availability of optional external provider scores
        const hasRep = inputs.reputationScore !== undefined;
        const hasLlm = inputs.llmScore !== undefined;
        if (!hasRep || !hasLlm) {
            // Dynamic fallback re-weighting when optional external APIs are absent
            let activeWeightSum = w_ml + w_url + w_heur;
            if (hasRep)
                activeWeightSum += w_rep;
            if (hasLlm)
                activeWeightSum += w_llm;
            // Re-normalize active weights so sum equals 1.0
            w_ml = w_ml / activeWeightSum;
            w_url = w_url / activeWeightSum;
            w_heur = w_heur / activeWeightSum;
            if (hasRep)
                w_rep = w_rep / activeWeightSum;
            else
                w_rep = 0;
            if (hasLlm)
                w_llm = w_llm / activeWeightSum;
            else
                w_llm = 0;
        }
        const rawR = (w_ml * S_ml) + (w_url * S_url) + (w_heur * S_heur) + (w_rep * S_rep) + (w_llm * S_llm);
        const normalizedScore = Math.min(100, Math.max(0, Math.round(rawR)));
        // Risk Tier Mapping
        let riskTier = 'LOW';
        if (normalizedScore >= 80) {
            riskTier = 'CRITICAL';
        }
        else if (normalizedScore >= 60) {
            riskTier = 'HIGH';
        }
        else if (normalizedScore >= 30) {
            riskTier = 'MEDIUM';
        }
        else {
            riskTier = 'LOW';
        }
        const indicators = inputs.indicators || [];
        // Contextual Action Mitigation Steps
        const mitigationSteps = this.generateMitigationSteps(riskTier, indicators);
        return {
            normalizedScore,
            riskTier,
            breakdown: {
                mlScore: Math.round(S_ml),
                urlScore: Math.round(S_url),
                heuristicScore: Math.round(S_heur),
                reputationScore: Math.round(S_rep),
                llmScore: Math.round(S_llm),
            },
            indicators,
            mitigationSteps,
        };
    }
    static generateMitigationSteps(riskTier, indicators) {
        const steps = [];
        if (riskTier === 'CRITICAL' || riskTier === 'HIGH') {
            steps.push('DO NOT click any embedded links or open attachments in this message.');
            steps.push('DO NOT transfer money, pay upfront fees, or share credit card details.');
            steps.push('DO NOT provide sensitive credentials, passwords, or One-Time Passwords (OTPs).');
        }
        const hasTelegram = indicators.some((i) => i.signal.includes('Telegram') || i.signal.includes('WhatsApp'));
        if (hasTelegram) {
            steps.push('Legitimate recruiters or banks never request official communication solely via personal messaging apps like Telegram or WhatsApp.');
        }
        const hasFee = indicators.some((i) => i.signal.includes('fee') || i.signal.includes('deposit'));
        if (hasFee) {
            steps.push('Genuine employers provide equipment and training for free. Demanding an upfront registration or training fee is a major red flag.');
        }
        const hasUrgency = indicators.some((i) => i.signal.includes('urgency') || i.signal.includes('suspended'));
        if (hasUrgency) {
            steps.push('Contact the institution directly using an official phone number or website bookmark—never use the contact info inside this message.');
        }
        if (steps.length === 0) {
            steps.push('Maintain standard security vigilance. Ensure URLs match known official corporate domains.');
        }
        return steps;
    }
}
exports.ScoringEngine = ScoringEngine;
