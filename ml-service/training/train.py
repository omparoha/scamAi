import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Expanded synthetic training dataset representing real-world threat vectors
SEED_DATA = [
    # --- JOB SCAMS ---
    {"text": "URGENT HIRING: Remote Assistant position! Earn $500 daily. Pay $50 registration fee to get starter kit via Telegram t.me/recruiter_job", "label": "JOB_SCAM", "is_scam": 1},
    {"text": "Congratulations! You are selected for online data entry job. Pay $99 training fee via Zelle to receive company laptop.", "label": "JOB_SCAM", "is_scam": 1},
    {"text": "Part-time job opportunity: Earn $3000/week rating products online. Must deposit 100 USDT initial account fee.", "label": "JOB_SCAM", "is_scam": 1},
    {"text": "HR Department: Your application was accepted! Contact hiring manager on WhatsApp wa.me/1234567 to pay background check fee.", "label": "JOB_SCAM", "is_scam": 1},
    {"text": "Immediate job opening: Work 30 minutes a day from home. Guaranteed daily payout in Bitcoin. Send $35 for credentials.", "label": "JOB_SCAM", "is_scam": 1},

    # --- BANK PHISHING ---
    {"text": "CHASE BANK ALERT: Your debit card has been suspended due to suspicious activity. Verify credentials immediately at http://chase-secure-login-update.top", "label": "BANK_PHISHING", "is_scam": 1},
    {"text": "Wells Fargo Notice: Unauthorized transaction of $849.99 detected. If this was not you, log in at http://192.168.1.50/wellsfargo/restore", "label": "BANK_PHISHING", "is_scam": 1},
    {"text": "SECURITY WARNING: Your online banking account will be deactivated within 24h. Click http://bank-update-verification.club to unlock.", "label": "BANK_PHISHING", "is_scam": 1},
    {"text": "PayPal: Account limited due to failed login attempt. Confirm your password and SSN at http://paypal-verify-user.xyz", "label": "BANK_PHISHING", "is_scam": 1},
    {"text": "Bank of America: Urgent security update required for online access. Confirm OTP at http://boa-passcode-reset.info", "label": "BANK_PHISHING", "is_scam": 1},

    # --- PACKAGE DELIVERY FRAUD ---
    {"text": "USPS Notice: Your parcel delivery was suspended due to incorrect address. Pay $1.99 redelivery fee at http://usps-redelivery-tracking.icu", "label": "DELIVERY_SCAM", "is_scam": 1},
    {"text": "FedEx: Package #94821 could not be delivered. Update delivery address and confirm details at http://fedex-parcel-update.work", "label": "DELIVERY_SCAM", "is_scam": 1},
    {"text": "DHL Express: Shipment on hold at warehouse. Pay customs clearance fee immediately via link http://dhl-customs-pay.top", "label": "DELIVERY_SCAM", "is_scam": 1},
    {"text": "Amazon Order Alert: Failed item shipment #3094. Click http://amz-shipment-resolver.xyz to update payment method.", "label": "DELIVERY_SCAM", "is_scam": 1},

    # --- LOTTERY / INVESTMENT / TECH SUPPORT ---
    {"text": "CLAIM YOUR WINNINGS: You won $1,000,000 in international lottery! Send $200 processing fee to claim prize.", "label": "LOTTERY_SCAM", "is_scam": 1},
    {"text": "Crypto Investment Opportunity: Double your money in 24 hours! Guaranteed 200% ROI. Deposit BTC to address now.", "label": "INVESTMENT_SCAM", "is_scam": 1},
    {"text": "MICROSOFT TECH SUPPORT: Virus detected on your computer! Call 1-800-FAKE-NUM immediately to prevent total disk erasure.", "label": "TECH_SUPPORT_SCAM", "is_scam": 1},

    # --- LEGITIMATE MESSAGES ---
    {"text": "Hi Alex, thank you for applying to the Senior Software Engineer position at Google. We reviewed your resume and would like to schedule a 45-minute technical interview via Google Meet.", "label": "LEGITIMATE", "is_scam": 0},
    {"text": "Your Amazon package with tracking #9482019482 has been delivered to your front porch. View order status on Amazon official app.", "label": "LEGITIMATE", "is_scam": 0},
    {"text": "Security Alert: New sign-in to your GitHub account from Chrome on Windows. If this was you, no action is needed.", "label": "LEGITIMATE", "is_scam": 0},
    {"text": "Dear team, sprint review meeting is scheduled for tomorrow at 10 AM EST. Please update your Jira tickets.", "label": "LEGITIMATE", "is_scam": 0},
    {"text": "Your monthly utility bill of $74.50 is ready. Log in to your electric portal at https://myutility.com to view details.", "label": "LEGITIMATE", "is_scam": 0},
    {"text": "Hi Mom, I am leaving work now and will be home by 6 PM. Let me know if you need anything from the grocery store.", "label": "LEGITIMATE", "is_scam": 0},
    {"text": "Your appointment with Dr. Smith is confirmed for Thursday at 3:00 PM. Reply 1 to confirm or 2 to reschedule.", "label": "LEGITIMATE", "is_scam": 0},
    {"text": "Thank you for shopping at Target. Here is your digital receipt for transaction #48291.", "label": "LEGITIMATE", "is_scam": 0},
]

def train_and_save_model(model_output_path: str = None):
    if model_output_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_dir = os.path.join(base_dir, "models")
        os.makedirs(model_dir, exist_ok=True)
        model_output_path = os.path.join(model_dir, "scam_classifier.joblib")

    df = pd.DataFrame(SEED_DATA)

    # Scikit-learn Pipeline with TF-IDF Vectorizer and Logistic Regression
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            lowercase=True,
            sublinear_tf=True
        )),
        ('classifier', LogisticRegression(C=2.0, max_iter=500, random_state=42))
    ])

    print(f"[*] Training TF-IDF + LogisticRegression model on {len(df)} seed samples...")
    pipeline.fit(df['text'], df['is_scam'])

    # Evaluate on training data
    preds = pipeline.predict(df['text'])
    probs = pipeline.predict_proba(df['text'])[:, 1]
    acc = accuracy_score(df['is_scam'], preds)
    print(f"[+] Model Training Accuracy: {acc * 100:.2f}%")

    joblib.dump({
        'pipeline': pipeline,
        'labels_map': {0: 'LEGITIMATE', 1: 'SCAM_SUSPECTED'}
    }, model_output_path)
    print(f"[+] Serialized model successfully saved to: {model_output_path}")
    return model_output_path

if __name__ == '__main__':
    train_and_save_model()
