from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
import wave
from dotenv import load_dotenv

from routes.audio_routes import router as audio_router
from models import audio_model
import tempfile


def _create_silent_wav(path: str, duration_seconds: float = 0.5, sample_rate: int = 22050) -> None:
    """Create a tiny valid PCM WAV file for model warmup."""
    frame_count = max(1, int(duration_seconds * sample_rate))
    silent_pcm = b"\x00\x00" * frame_count  # 16-bit mono silence
    with wave.open(path, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(silent_pcm)

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get configuration from environment
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Initialize FastAPI app
app = FastAPI(
    title="AI Emotion Detection API",
    description="Analyzes audio to detect emotional states and assess mental health risk",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for now)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(audio_router, prefix="/api", tags=["Audio Analysis"])


@app.on_event("startup")
async def preload_model():
    """Preload ML model to avoid long first-request delays."""
    try:
        audio_model._load_model()
        # Warm up the full inference stack once so first user request does not pay init cost.
        warmup_enabled = os.getenv("MODEL_WARMUP", "true").lower() == "true"
        if warmup_enabled:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                warmup_path = tmp.name
            try:
                _create_silent_wav(warmup_path)
                audio_model.predict_audio(warmup_path, allow_silent=True)
                logger.info("Completed audio inference warmup")
            finally:
                if os.path.exists(warmup_path):
                    os.remove(warmup_path)
        logger.info("Preloaded audio model on startup")
    except Exception as e:
        logger.error(f"Failed to preload audio model: {e}")

@app.get("/")
def home():
    """Home endpoint with API information"""
    return {
        "message": "AI Emotion Detection API",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
        "endpoints": {
            "audio": "/api/analyze-audio"
        },
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "environment": ENVIRONMENT}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)