import { validateUrlSsrf } from '../utils/ssrf';

async function runSsrfTests() {
  console.log('=== RUNNING ANTI-SSRF IMMUNITY TESTS ===');

  const testCases = [
    { url: 'http://127.0.0.1/admin', expectedSafe: false, label: 'Loopback IPv4' },
    { url: 'http://localhost/secret', expectedSafe: false, label: 'Localhost domain' },
    { url: 'http://192.168.1.1/router', expectedSafe: false, label: 'Private Class C IPv4' },
    { url: 'http://10.0.0.1/internal', expectedSafe: false, label: 'Private Class A IPv4' },
    { url: 'http://172.16.0.1/imds', expectedSafe: false, label: 'Private Class B IPv4' },
    { url: 'http://169.254.169.254/latest/meta-data/', expectedSafe: false, label: 'AWS Cloud Metadata Target' },
    { url: 'https://example.com', expectedSafe: true, label: 'Public Legitimate Domain' },
  ];

  let passed = 0;
  for (const tc of testCases) {
    const result = await validateUrlSsrf(tc.url);
    const success = result.isSafe === tc.expectedSafe;
    if (success) {
      console.log(`[PASS] ${tc.label} (${tc.url}) => safe: ${result.isSafe}`);
      passed++;
    } else {
      console.error(`[FAIL] ${tc.label} (${tc.url}) => expected safe: ${tc.expectedSafe}, got: ${result.isSafe} (${result.reason})`);
    }
  }

  console.log(`\nSSRF Test Summary: ${passed}/${testCases.length} Passed.\n`);
  if (passed !== testCases.length) process.exit(1);
}

runSsrfTests();
