from fastapi import APIRouter, UploadFile, File
import shutil
import os
from models.audio_model import predict_audio
from utils.risk import calculate_risk
import logging
import asyncio
import tempfile
from fastapi import HTTPException

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_AUDIO_FORMATS = {".wav", ".mp3", ".flac", ".ogg", ".m4a"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
INFERENCE_TIMEOUT_SECONDS = 45

@router.post("/analyze-audio")
async def analyze_audio(audio: UploadFile = File(...)):
    """
    Analyze audio file for emotion detection.
    
    Args:
        audio: Audio file to analyze (wav, mp3, flac, ogg, m4a)
        
    Returns:
        JSON with emotion, confidence, and risk assessment
    """
    file_path = None
    try:
        if not audio.filename:
            raise HTTPException(status_code=400, detail="Missing audio filename")

        # Validate file extension
        file_ext = os.path.splitext(audio.filename)[1].lower()
        if file_ext not in ALLOWED_AUDIO_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file format. Allowed formats: {', '.join(sorted(ALLOWED_AUDIO_FORMATS))}"
            )
        
        # Create unique temp file and stream upload to avoid loading the whole payload in memory.
        os.makedirs("temp", exist_ok=True)
        with tempfile.NamedTemporaryFile(
            dir="temp",
            suffix=file_ext,
            delete=False
        ) as tmp:
            file_path = tmp.name

        total_size = 0
        with open(file_path, "wb") as buffer:
            while True:
                chunk = await audio.read(1024 * 1024)
                if not chunk:
                    break
                total_size += len(chunk)
                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB"
                    )
                buffer.write(chunk)
        
        # Run heavy inference in a worker thread and enforce a timeout.
        try:
            result = await asyncio.wait_for(
                asyncio.to_thread(predict_audio, file_path),
                timeout=INFERENCE_TIMEOUT_SECONDS,
            )
        except asyncio.TimeoutError as exc:
            raise HTTPException(
                status_code=504,
                detail="Audio processing timed out. Try a shorter clip and retry."
            ) from exc
        
        # Calculate risk level
        risk_level = calculate_risk(result["emotion"])
        
        # Clean up
        os.remove(file_path)
        
        return {
            "emotion": result["emotion"],
            "confidence": result["confidence"],
            "risk_level": risk_level,
            "source": "audio"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing audio: {e}")
        raise HTTPException(status_code=500, detail="Error processing audio") from e
    finally:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        await audio.close()