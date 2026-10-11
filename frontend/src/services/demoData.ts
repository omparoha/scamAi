import { ScanResult } from '../types/scan';

export interface DemoScenario {
  id: string;
  title: string;
  category: 'Job Scam' | 'Bank Phishing' | 'Delivery Scam' | 'Legitimate';
  type: 'TEXT' | 'URL' | 'FILE_OCR' | 'EMAIL';
  rawInput: string;
  description: string;
  presetResult: ScanResult;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-1',
    title: '1. Upfront Fee Job Scam',
    category: 'Job Scam',
    type: 'TEXT',
    description: 'Remote job offer promising $500/day with upfront $50 starter kit registration fee via Telegram.',
    rawInput: 'URGENT HIRING: Remote Data Entry Assistant! Earn $500 daily working 1 hour. Must pay $50 refundable registration fee via Telegram t.me/hiring_manager_job. Aadhaar ID: 4928 1029 4819',
    presetResult: {
      scanId: 'demo-scan-101',
      sanitization: {
        applied: true,
        categories: ['AADHAAR'],
        redactedInput: 'URGENT HIRING: Remote Data Entry Assistant! Earn $500 daily working 1 hour. Must pay $50 refundable registration fee via Telegram t.me/hiring_manager_job. Aadhaar ID: [REDACTED_AADHAAR]',
      },
      normalizedScore: 88,
      riskTier: 'CRITICAL',
      breakdown: {
        mlScore: 92,
        urlScore: 0,
        heuristicScore: 85,
        reputationScore: 0,
        llmScore: 0,
      },
      indicators: [
        { signal: 'Upfront registration fee requested ($50)', impact: 40, category: 'FINANCIAL' },
        { signal: 'Off-platform messenger redirect (Telegram t.me/)', impact: 30, category: 'CHANNEL' },
        { signal: 'Unrealistically high guaranteed daily earnings promised ($500/day)', impact: 30, category: 'PAYOUT' },
        { signal: 'Sensitive PII detected and auto-redacted', impact: 0, category: 'PRIVACY' },
      ],
      mitigationSteps: [
        'DO NOT click any embedded links or open attachments in this message.',
        'DO NOT transfer money, pay upfront fees, or share credit card details.',
        'Legitimate recruiters or banks never request official communication solely via personal messaging apps like Telegram or WhatsApp.',
        'Genuine employers provide equipment and training for free. Demanding an upfront registration or training fee is a major red flag.',
      ],
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'demo-2',
    title: '2. Bank Account Suspension Phishing',
    category: 'Bank Phishing',
    type: 'URL',
    description: 'Suspicious URL pretending to be Chase Bank login page on a high-risk `.top` domain.',
    rawInput: 'http://chase-secure-login-update.top/auth/verify',
    presetResult: {
      scanId: 'demo-scan-102',
      resolvedIp: '185.220.101.5',
      normalizedScore: 82,
      riskTier: 'CRITICAL',
      breakdown: {
        mlScore: 78,
        urlScore: 85,
        heuristicScore: 80,
        reputationScore: 0,
        llmScore: 0,
      },
      indicators: [
        { signal: 'Brand keyword spoofing in domain name (chase)', impact: 35, category: 'BRAND' },
        { signal: 'High-risk TLD detected (.top)', impact: 25, category: 'INFRASTRUCTURE' },
        { signal: 'Multiple hyphens in domain name (chase-secure-login-update)', impact: 15, category: 'DOMAIN' },
        { signal: 'High domain entropy / DGA randomness pattern', impact: 20, category: 'ANALYSIS' },
      ],
      mitigationSteps: [
        'DO NOT click any embedded links or open attachments in this message.',
        'DO NOT provide sensitive credentials, passwords, or One-Time Passwords (OTPs).',
        'Contact the institution directly using an official phone number or website bookmark—never use the contact info inside this message.',
      ],
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'demo-3',
    title: '3. Package Delivery Failure SMS',
    category: 'Delivery Scam',
    type: 'TEXT',
    description: 'SMS claiming package delivery failure requiring a $1.99 redelivery fee on a phishing site.',
    rawInput: 'USPS Alert: Your parcel shipment #94821 is on hold due to wrong house number. Update address & pay $1.99 fee at http://usps-redelivery-tracking.icu',
    presetResult: {
      scanId: 'demo-scan-103',
      sanitization: {
        applied: false,
        categories: [],
        redactedInput: 'USPS Alert: Your parcel shipment #94821 is on hold due to wrong house number. Update address & pay $1.99 fee at http://usps-redelivery-tracking.icu',
      },
      normalizedScore: 74,
      riskTier: 'HIGH',
      breakdown: {
        mlScore: 75,
        urlScore: 70,
        heuristicScore: 75,
        reputationScore: 0,
        llmScore: 0,
      },
      indicators: [
        { signal: 'Coercive urgency & delivery failure claim', impact: 30, category: 'SOCIAL_ENG' },
        { signal: 'Suspicious postal brand spoofing (usps)', impact: 30, category: 'BRAND' },
        { signal: 'High-risk TLD detected (.icu)', impact: 25, category: 'DOMAIN' },
      ],
      mitigationSteps: [
        'DO NOT click any embedded links or open attachments in this message.',
        'DO NOT transfer money, pay upfront fees, or share credit card details.',
        'Check shipment status directly on the official postal carrier app or website.',
      ],
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'demo-4',
    title: '4. Legitimate Internal Corporate Communication',
    category: 'Legitimate',
    type: 'EMAIL',
    description: 'Legitimate meeting invitation from corporate Google Workspace email.',
    rawInput: 'Hi Alex, thank you for applying to the Senior Architect position at Google. We reviewed your resume and would like to schedule a 45-minute technical interview via Google Meet next Tuesday at 10 AM EST.',
    presetResult: {
      scanId: 'demo-scan-104',
      sanitization: {
        applied: false,
        categories: [],
        redactedInput: 'Hi Alex, thank you for applying to the Senior Architect position at Google. We reviewed your resume and would like to schedule a 45-minute technical interview via Google Meet next Tuesday at 10 AM EST.',
      },
      normalizedScore: 8,
      riskTier: 'LOW',
      breakdown: {
        mlScore: 5,
        urlScore: 0,
        heuristicScore: 0,
        reputationScore: 0,
        llmScore: 0,
      },
      indicators: [
        { signal: 'Standard corporate communication pattern verified', impact: 0, category: 'BENIGN' },
        { signal: 'No coercive urgency or off-platform payment requests', impact: 0, category: 'BENIGN' },
      ],
      mitigationSteps: [
        'Maintain standard security vigilance. Ensure URLs match known official corporate domains.',
      ],
      createdAt: new Date().toISOString(),
    },
  },
];
