import os
import io
import joblib
from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from pipeline.heuristics import evaluate_url_heuristics, evaluate_text_heuristics
from inference.ocr_extractor import extract_text_from_image_bytes
from training.train import train_and_save_model

app = FastAPI(
    title="ScamShield AI - ML Detection Service",
    description="Python FastAPI engine for scam text classification, URL heuristics, and OCR extraction",
    version="1.0.0"
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "scam_classifier.joblib")
model_artifacts: Optional[Dict[str, Any]] = None

@app.on_event("startup")
def load_or_train_model():
    global model_artifacts
    if not os.path.exists(MODEL_PATH):
        print("[*] Model file not found. Initiating seed model training...")
        train_and_save_model(MODEL_PATH)

    print(f"[*] Loading model from {MODEL_PATH}...")
    try:
        model_artifacts = joblib.load(MODEL_PATH)
        print("[+] ML Model loaded successfully into memory.")
    except Exception as e:
        print(f"[!] Error loading model: {e}")
        # Fallback inline initialization
        train_and_save_model(MODEL_PATH)
        model_artifacts = joblib.load(MODEL_PATH)

class TextPredictionRequest(BaseModel):
    text: str = Field(..., example="URGENT: Pay $50 registration fee via Telegram t.me/scam to claim your remote job!")

class UrlPredictionRequest(BaseModel):
    url: str = Field(..., example="http://chase-secure-login-update.top")

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "ScamShield AI ML Service",
        "model_loaded": model_artifacts is not None
    }

@app.post("/predict/text")
def predict_text(request: TextPredictionRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text payload cannot be empty")

    # 1. Heuristic signals
    heuristics_result = evaluate_text_heuristics(text)

    # 2. ML Model Prediction
    ml_probability = 0.5
    classification_label = "SUSPICIOUS"
    if model_artifacts and 'pipeline' in model_artifacts:
        pipeline = model_artifacts['pipeline']
        probs = pipeline.predict_proba([text])[0]
        ml_probability = float(probs[1]) # Probability of class 1 (SCAM)
        if ml_probability > 0.7:
            classification_label = "CRITICAL_SCAM"
        elif ml_probability > 0.4:
            classification_label = "SUSPECTED_SCAM"
        else:
            classification_label = "LEGITIMATE"

    # ML Score (0 to 100 scale)
    ml_score = round(ml_probability * 100, 2)

    return {
        "ml_score": ml_score,
        "ml_probability": ml_probability,
        "classification_label": classification_label,
        "text_heuristic_score": heuristics_result['text_heuristic_score'],
        "indicators": heuristics_result['indicators']
    }

@app.post("/predict/url")
def predict_url(request: UrlPredictionRequest):
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL payload cannot be empty")

    heuristics = evaluate_url_heuristics(url)
    return {
        "url_score": heuristics['url_heuristic_score'],
        "hostname": heuristics['hostname'],
        "entropy": heuristics['entropy'],
        "indicators": heuristics['indicators']
    }

@app.post("/predict/ocr")
async def predict_ocr(file: UploadFile = File(...)):
    # Validate MIME type (magic numbers / contentType)
    allowed_mimes = ["image/jpeg", "image/png", "image/webp", "image/bmp"]
    if file.content_type not in allowed_mimes:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}. Allowed: JPEG, PNG, WEBP, BMP")

    # Read bytes without persisting raw image artifact to disk (privacy constraint)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum 5MB limit")

    extracted_text = extract_text_from_image_bytes(contents)

    # Route extracted text to text prediction engine
    text_pred = predict_text(TextPredictionRequest(text=extracted_text))

    return {
        "extracted_text": extracted_text,
        "prediction": text_pred
    }
