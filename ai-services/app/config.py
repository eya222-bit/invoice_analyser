from dotenv import load_dotenv
import os

load_dotenv()

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

API_KEY = os.getenv("API_KEY")
OCR_LANGUAGES = os.getenv(
    "OCR_LANGUAGES",
    "eng+fra+ara"
)