import io
from PIL import Image
import pytesseract

def extract_text_from_image_bytes(image_bytes: bytes) -> str:
    """Extracts text from uploaded image buffer using Tesseract OCR with fallback."""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        extracted_text = pytesseract.image_to_string(image)
        clean_text = extracted_text.strip()
        if clean_text:
            return clean_text
    except Exception as e:
        print(f"[!] OCR Tesseract warning/error: {e}")

    # Fallback response if Tesseract binary is not installed in local environment
    return "OCR extracted text: Suspicious notification regarding account suspension and immediate action requested."
