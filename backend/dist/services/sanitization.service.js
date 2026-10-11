"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizationService = void 0;
class SanitizationService {
    /**
     * Sanitizes sensitive government IDs, PII, and direct financial credentials
     * using zero-trust regex replacement.
     */
    static sanitize(text) {
        if (!text) {
            return { redactedText: '', hasRedactions: false, redactedTypes: [] };
        }
        let sanitized = text;
        const redactedTypes = new Set();
        // 1. Payment Cards (13 to 19 digits with space or hyphen separators) - Run first to prevent partial 12-digit collisions
        const cardRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{1,7}\b|\b\d{13,19}\b/g;
        if (cardRegex.test(sanitized)) {
            cardRegex.lastIndex = 0;
            sanitized = sanitized.replace(cardRegex, '[REDACTED_CARD]');
            redactedTypes.add('FINANCIAL_CARD');
        }
        // 2. Indian Aadhaar Number (12 digits, optional space/hyphen separator, negative lookahead for 13+ digits)
        const aadhaarRegex = /\b[2-9]\d{3}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b(?!\s?\d)/g;
        if (aadhaarRegex.test(sanitized)) {
            aadhaarRegex.lastIndex = 0;
            sanitized = sanitized.replace(aadhaarRegex, '[REDACTED_AADHAAR]');
            redactedTypes.add('AADHAAR');
        }
        // 3. Indian PAN Card (5 uppercase letters, 4 digits, 1 uppercase letter: e.g. ABCDE1234F)
        const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
        if (panRegex.test(sanitized)) {
            panRegex.lastIndex = 0;
            sanitized = sanitized.replace(panRegex, '[REDACTED_PAN]');
            redactedTypes.add('PAN');
        }
        // 4. Korean Resident Registration Number (RRN) (6 digits - 1 to 4 + 6 digits: e.g. 950101-1234567)
        const rrnRegex = /\b\d{6}-[1-4]\d{6}\b/g;
        if (rrnRegex.test(sanitized)) {
            rrnRegex.lastIndex = 0;
            sanitized = sanitized.replace(rrnRegex, '[REDACTED_KOREAN_RRN]');
            redactedTypes.add('KOREAN_RRN');
        }
        // 5. Japanese MyNumber (12 numeric digits)
        const myNumberRegex = /\b(?:MyNumber|my\s?number|マイナンバー)?\s?:?\s?(\d{12})\b(?!\s?\d)/gi;
        if (myNumberRegex.test(sanitized)) {
            myNumberRegex.lastIndex = 0;
            sanitized = sanitized.replace(myNumberRegex, (match) => {
                return match.includes('MyNumber') || match.includes('my number') || match.includes('マイナンバー')
                    ? match.replace(/\d{12}/, '[REDACTED_MYNUMBER]')
                    : '[REDACTED_MYNUMBER]';
            });
            redactedTypes.add('MYNUMBER');
        }
        // 6. IBAN / International Bank Account Numbers
        const ibanRegex = /\b[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}\b/g;
        if (ibanRegex.test(sanitized)) {
            ibanRegex.lastIndex = 0;
            sanitized = sanitized.replace(ibanRegex, '[REDACTED_IBAN]');
            redactedTypes.add('BANK_IBAN');
        }
        return {
            redactedText: sanitized,
            hasRedactions: redactedTypes.size > 0,
            redactedTypes: Array.from(redactedTypes),
        };
    }
}
exports.SanitizationService = SanitizationService;
