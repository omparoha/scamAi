import math
import re
from typing import List, Dict, Any

SUSPICIOUS_TLDS = {
    'top', 'xyz', 'club', 'work', 'gq', 'cf', 'fit', 'kim', 'racing',
    'win', 'icu', 'vip', 'monster', 'buzz', 'cn', 'tk', 'ml', 'ga'
}

TARGET_BRAND_KEYWORDS = [
    'paypal', 'bank', 'secure', 'apple', 'microsoft', 'amazon', 'netflix',
    'google', 'binance', 'coinbase', 'wellsfargo', 'chase', 'usps', 'fedex', 'dhl'
]

def calculate_shannon_entropy(text: str) -> float:
    """Computes Shannon entropy of a string to detect randomized/dga domain names."""
    if not text:
        return 0.0
    entropy = 0.0
    text_len = len(text)
    char_counts: Dict[str, int] = {}
    for char in text:
        char_counts[char] = char_counts.get(char, 0) + 1
    for count in char_counts.values():
        p = count / text_len
        entropy -= p * math.log2(p)
    return round(entropy, 4)

def evaluate_url_heuristics(url: str) -> Dict[str, Any]:
    indicators = []
    score = 0.0

    clean_url = url.strip().lower()
    
    # 1. Punycode check
    if 'xn--' in clean_url:
        indicators.append({'signal': 'Punycode internationalized domain (IDN homograph vulnerability risk)', 'impact': 35})
        score += 35

    # 2. IP in URL
    ip_pattern = r'https?://(?:\d{1,3}\.){3}\d{1,3}'
    if re.search(ip_pattern, clean_url):
        indicators.append({'signal': 'Numeric IP address used instead of domain name', 'impact': 40})
        score += 40

    # Extract hostname
    host_match = re.search(r'https?://([^/:\?#]+)', clean_url)
    hostname = host_match.group(1) if host_match else clean_url.split('/')[0]

    # 3. Suspicious TLD
    tld = hostname.split('.')[-1] if '.' in hostname else ''
    if tld in SUSPICIOUS_TLDS:
        indicators.append({'signal': f'High-risk TLD detected (.{tld})', 'impact': 25})
        score += 25

    # 4. Subdomain depth check
    domain_parts = hostname.split('.')
    if len(domain_parts) > 3:
        indicators.append({'signal': f'Excessive subdomain depth ({len(domain_parts) - 2} levels)', 'impact': 20})
        score += 20

    # 5. Shannon entropy of main domain name
    main_domain = domain_parts[-2] if len(domain_parts) >= 2 else hostname
    entropy = calculate_shannon_entropy(main_domain)
    if entropy > 3.8 and len(main_domain) > 10:
        indicators.append({'signal': f'High domain randomness/entropy ({entropy})', 'impact': 20})
        score += 20

    # 6. Brand spoofing / keyword target in domain
    for brand in TARGET_BRAND_KEYWORDS:
        if brand in main_domain and not main_domain.startswith(f"{brand}."):
            # e.g., paypal-secure-login.com
            indicators.append({'signal': f'Brand keyword spoofing in domain name ({brand})', 'impact': 35})
            score += 35
            break

    # 7. Excessive hyphenation or special characters
    hyphen_count = main_domain.count('-')
    if hyphen_count >= 2:
        indicators.append({'signal': f'Multiple hyphens in domain name ({hyphen_count})', 'impact': 15})
        score += 15

    return {
        'url_heuristic_score': min(100.0, score),
        'indicators': indicators,
        'entropy': entropy,
        'hostname': hostname
    }

def evaluate_text_heuristics(text: str) -> Dict[str, Any]:
    indicators = []
    score = 0.0

    lower_text = text.lower()

    # 1. Telegram / WhatsApp redirect links (Job & Financial Scam Indicator)
    if re.search(r'(t\.me\/|wa\.me\/|telegram|whatsapp group|contact recruiter on whatsapp)', lower_text):
        indicators.append({'signal': 'Off-platform messenger redirect (Telegram/WhatsApp)', 'impact': 30})
        score += 30

    # 2. Advance Fee Request (Upfront registration/training fee)
    if re.search(r'(registration fee|training fee|refundable deposit|processing fee|pay \$?\d+ before starting|equipment fee)', lower_text):
        indicators.append({'signal': 'Upfront registration or deposit fee requested', 'impact': 40})
        score += 40

    # 3. Unrealistic Salary / Income Anomalies
    if re.search(r'(\$\d{3,4}\/day|\$\d{2,4}\s?per day|earn \$\d+ daily|guaranteed daily payout|work 1 hour)', lower_text):
        indicators.append({'signal': 'Unrealistically high guaranteed daily earnings promised', 'impact': 30})
        score += 30

    # 4. Untraceable Payment Methods (Crypto, USDT, Gift Cards)
    if re.search(r'(usdt|crypto|bitcoin|gift card|apple card|steam card|zelle|wire transfer)', lower_text):
        indicators.append({'signal': 'Untraceable or non-standard payment method requested', 'impact': 35})
        score += 35

    # 5. Phishing Urgency / Account Threat
    if re.search(r'(account (suspended|locked|deactivated)|unauthorized transaction|urgent action required|verify within 24 hours|click here to restore)', lower_text):
        indicators.append({'signal': 'Coercive urgency or account suspension threat', 'impact': 35})
        score += 35

    # 6. Credential Harvesting Keywords
    if re.search(r'(enter your passwork|confirm ssn|social security|pin number|banking credentials|verify otp)', lower_text):
        indicators.append({'signal': 'Direct request for sensitive credentials/OTP', 'impact': 45})
        score += 45

    return {
        'text_heuristic_score': min(100.0, score),
        'indicators': indicators
    }
