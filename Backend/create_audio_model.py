"""
Quick script to create and save the audio model without dependencies
"""
import os
import sys
import pickle
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    import torch
    import torch.nn as nn
    
    # Import the AudioCNN model
    from models.audio_cnn import AudioCNN
    
    # Initialize model
    model = AudioCNN()
    
    # Create save directory
    save_dir = Path(__file__).parent / "saved_models"
    save_dir.mkdir(exist_ok=True)
    
    # Save model
    model_path = save_dir / "audio_model.pth"
    torch.save(model.state_dict(), str(model_path))
    
    print(f"✓ Audio model created successfully at {model_path}")
    print(f"  File size: {model_path.stat().st_size} bytes")
    
except ImportError as e:
    print(f"Warning: Could not import required modules: {e}")
    print("Model will be created after pip install completes.")
except Exception as e:
    print(f"Error creating model: {e}")
    sys.exit(1)
