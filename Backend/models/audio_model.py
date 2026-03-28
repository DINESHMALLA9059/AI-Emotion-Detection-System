import torch
import librosa
import numpy as np
import logging
from pathlib import Path
from models.audio_cnn import AudioCNN

logger = logging.getLogger(__name__)

# Set device to GPU if available, otherwise CPU
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Resolve model path relative to this file's location
MODEL_PATH = Path(__file__).parent.parent / "saved_models" / "audio_model.pth"

model = None
labels = ["happy", "sad", "angry"]


def _load_model():
    """Lazy-load the audio model with error handling."""
    global model
    if model is not None:
        return model

    try:
        m = AudioCNN()
        # Load model and move to device
        state_dict = torch.load(str(MODEL_PATH), map_location=device)
        m.load_state_dict(state_dict)
        m = m.to(device)
        m.eval()
        model = m
        logger.info(f"Audio model loaded from {MODEL_PATH} on device: {device}")
        return model
    except Exception as e:
        logger.error(f"Failed to load audio model from {MODEL_PATH}: {e}")
        raise RuntimeError(f"Audio model not available: {e}")


def _safe_mfcc_resize(mfcc, target_shape=(40, 40)):
    """Resize MFCC to target shape by truncating or zero-padding along time axis.

    This avoids np.resize which can repeat data and cause unexpected features.
    """
    n_mfcc, t = mfcc.shape
    target_n, target_t = target_shape

    # Ensure n_mfcc dimension matches target_n by truncating or padding
    if n_mfcc >= target_n:
        mfcc_n = mfcc[:target_n, :]
    else:
        pad_n = np.zeros((target_n - n_mfcc, t))
        mfcc_n = np.vstack([mfcc, pad_n])

    # Now handle time axis
    if mfcc_n.shape[1] >= target_t:
        mfcc_t = mfcc_n[:, :target_t]
    else:
        pad_t = np.zeros((target_n, target_t - mfcc_n.shape[1]))
        mfcc_t = np.hstack([mfcc_n, pad_t])

    return mfcc_t


def extract(file):
    try:
        y, sr = librosa.load(file, duration=3)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        # Normalize to match training preprocessing
        mfcc = (mfcc - np.mean(mfcc)) / (np.std(mfcc) + 1e-6)
        mfcc = _safe_mfcc_resize(mfcc, (40, 40))
        return mfcc
    except Exception as e:
        logger.error(f"Error extracting MFCC from {file}: {e}")
        raise


def predict_audio(file_path):
    m = _load_model()
    features = extract(file_path)

    features = np.expand_dims(features, axis=0)
    features = np.expand_dims(features, axis=0)

    tensor = torch.tensor(features, dtype=torch.float32).to(device)

    with torch.no_grad():
        output = m(tensor)
        # Convert logits to probabilities
        probs = torch.softmax(output, dim=1).cpu().numpy()[0]
        pred = int(np.argmax(probs))
        confidence = float(probs[pred])

    logger.info(f"Predicted for {file_path}: index={pred}, label={labels[pred]}, probs={probs}")

    return {
        "emotion": labels[pred],
        "confidence": confidence
    }