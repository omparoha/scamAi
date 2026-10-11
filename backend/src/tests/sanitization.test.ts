import { SanitizationService } from '../services/sanitization.service';

function runSanitizationTests() {
  console.log('=== RUNNING ZERO-TRUST PRIVACY SANITIZATION TESTS ===');

  const testCases = [
    {
      input: 'My Aadhaar number is 4928 1029 4819 for verification.',
      expectedCategory: 'AADHAAR',
    },
    {
      input: 'My PAN card is ABCDE1234F.',
      expectedCategory: 'PAN',
    },
    {
      input: 'Korean RRN: 950101-1234567',
      expectedCategory: 'KOREAN_RRN',
    },
    {
      input: 'My credit card is 4532 0123 4567 8901',
      expectedCategory: 'FINANCIAL_CARD',
    },
  ];

  let passed = 0;
  for (const tc of testCases) {
    const result = SanitizationService.sanitize(tc.input);
    const hasCategory = result.redactedTypes.includes(tc.expectedCategory);
    const isRedacted = result.redactedText.includes('[REDACTED_');

    if (hasCategory && isRedacted) {
      console.log(`[PASS] ${tc.expectedCategory} Redacting verified (${result.redactedText}).`);
      passed++;
    } else {
      console.error(`[FAIL] ${tc.expectedCategory} Result:`, result);
    }
  }

  console.log(`\nSanitization Test Summary: ${passed}/${testCases.length} Passed.\n`);
  if (passed !== testCases.length) process.exit(1);
}

runSanitizationTests();
