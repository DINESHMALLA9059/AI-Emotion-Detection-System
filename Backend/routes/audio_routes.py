from fastapi import APIRouter, UploadFile, File
import shutil
import os
from models.audio_model import predict_audio
from utils.risk import calculate_risk
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_AUDIO_FORMATS = {".wav", ".mp3", ".flac", ".ogg", ".m4a"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

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
        # Validate file extension
        file_ext = os.path.splitext(audio.filename)[1].lower()
        if file_ext not in ALLOWED_AUDIO_FORMATS:
            return {
                "error": "Invalid file format",
                "details": f"Allowed formats: {', '.join(ALLOWED_AUDIO_FORMATS)}"
            }
        
        # Create temp directory
        os.makedirs("temp", exist_ok=True)
        file_path = f"temp/{audio.filename}"
        
        # Save file
        with open(file_path, "wb") as buffer:
            contents = await audio.read()
            
            # Validate file size
            if len(contents) > MAX_FILE_SIZE:
                return {
                    "error": "File too large",
                    "details": f"Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB"
                }
            
            buffer.write(contents)
        
        # Predict emotion
        result = predict_audio(file_path)
        
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
        
    except Exception as e:
        logger.error(f"Error analyzing audio: {e}")
        # Clean up on error
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        
        return {
            "error": "Error processing audio",
            "details": str(e)
        }