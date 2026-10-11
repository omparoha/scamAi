"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scoring_service_1 = require("../services/scoring.service");
function runScoringTests() {
    console.log('=== RUNNING MATHEMATICAL RISK SCORING ENGINE TESTS ===');
    // Test 1: High Scam Risk calculation
    const highRisk = scoring_service_1.ScoringEngine.calculateRisk({
        mlScore: 90,
        urlScore: 85,
        heuristicScore: 80,
        indicators: [{ signal: 'Upfront fee', impact: 40 }],
    });
    console.log(`[TEST 1] High Scam Score: ${highRisk.normalizedScore} (Tier: ${highRisk.riskTier})`);
    if (highRisk.normalizedScore >= 80 && highRisk.riskTier === 'CRITICAL') {
        console.log('[PASS] High Scam Score correctly mapped to CRITICAL tier.');
    }
    else {
        console.error('[FAIL] High Scam Score tier mapping incorrect.');
        process.exit(1);
    }
    // Test 2: Low Legitimate Risk calculation
    const lowRisk = scoring_service_1.ScoringEngine.calculateRisk({
        mlScore: 5,
        urlScore: 0,
        heuristicScore: 0,
        indicators: [],
    });
    console.log(`[TEST 2] Low Legitimate Score: ${lowRisk.normalizedScore} (Tier: ${lowRisk.riskTier})`);
    if (lowRisk.normalizedScore < 30 && lowRisk.riskTier === 'LOW') {
        console.log('[PASS] Legitimate message score correctly mapped to LOW tier.');
    }
    else {
        console.error('[FAIL] Low Legitimate Score tier mapping incorrect.');
        process.exit(1);
    }
    console.log('\nRisk Scoring Engine Test Summary: All Passed.\n');
}
runScoringTests();
