import os
import sys
import librosa
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from pathlib import Path
from sklearn.model_selection import train_test_split
from torch.utils.data import TensorDataset, DataLoader

# Add parent directory for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from models.audio_cnn import AudioCNN

# -----------------------------
# DEVICE SETUP
# -----------------------------
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

# -----------------------------
# DATA STORAGE
# -----------------------------
X, y = [], []

label_map = {"happy": 0, "sad": 1, "angry": 2}

# -----------------------------
# FEATURE EXTRACTION
# -----------------------------
def extract(file):
    try:
        y_audio, sr = librosa.load(file, duration=3)

        mfcc = librosa.feature.mfcc(y=y_audio, sr=sr, n_mfcc=40)

        # ✅ NORMALIZATION (IMPORTANT)
        mfcc = (mfcc - np.mean(mfcc)) / (np.std(mfcc) + 1e-6)

        # Resize to (40,40)
        if mfcc.shape[1] < 40:
            pad_width = 40 - mfcc.shape[1]
            mfcc = np.pad(mfcc, ((0, 0), (0, pad_width)))
        else:
            mfcc = mfcc[:, :40]

        return mfcc

    except Exception as e:
        print(f"Error: {file} → {e}")
        return None

# -----------------------------
# LOAD DATA
# -----------------------------
current_dir = Path(__file__).parent
data_path = current_dir.parent / "data" / "audio"

if not data_path.exists():
    raise Exception(f"Dataset not found at {data_path}")

for label in sorted(os.listdir(data_path)):
    label_path = data_path / label

    if label_path.is_dir():
        for file in os.listdir(label_path):
            file_path = label_path / file

            if file_path.suffix == ".wav":
                features = extract(str(file_path))

                if features is not None:
                    X.append(features)
                    y.append(label_map[label])

# Convert to numpy
X = np.array(X)
y = np.array(y)

print(f"Total samples: {len(X)}")

# -----------------------------
# TRAIN / TEST SPLIT (on numpy arrays)
# -----------------------------
X_train_np, X_test_np, y_train_np, y_test_np = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# -----------------------------
# SIMPLE DATA AUGMENTATION (time-shift + small noise)
# -----------------------------
def augment_mfcc(mfcc):
    mf = mfcc.copy()
    # time shift (roll) up to 10% of time axis
    max_shift = max(1, int(0.1 * mf.shape[1]))
    shift = np.random.randint(-max_shift, max_shift + 1)
    mf = np.roll(mf, shift, axis=1)
    # additive gaussian noise proportional to signal std
    noise = np.random.randn(*mf.shape) * (0.005 * (np.std(mf) + 1e-8))
    mf = mf + noise
    return mf

# Duplicate each training sample once with augmentation to increase robustness
augmented_X = []
augmented_y = []
for i in range(len(X_train_np)):
    augmented_X.append(X_train_np[i])
    augmented_y.append(y_train_np[i])
    augmented_X.append(augment_mfcc(X_train_np[i]))
    augmented_y.append(y_train_np[i])

X_train_np = np.array(augmented_X)
y_train_np = np.array(augmented_y)

# For test/validation keep original samples
X_test_np = np.array(X_test_np)
y_test_np = np.array(y_test_np)

# Add channel dim
X_train_np = np.expand_dims(X_train_np, axis=1)
X_test_np = np.expand_dims(X_test_np, axis=1)

# Convert to tensors
X_train = torch.tensor(X_train_np, dtype=torch.float32)
X_test = torch.tensor(X_test_np, dtype=torch.float32)
y_train = torch.tensor(y_train_np, dtype=torch.long)
y_test = torch.tensor(y_test_np, dtype=torch.long)

# -----------------------------
# DATALOADER
# -----------------------------
train_dataset = TensorDataset(X_train, y_train)
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

# -----------------------------
# MODEL
# -----------------------------
model = AudioCNN().to(device)

# -----------------------------
# CLASS WEIGHTS (to handle bias)
# -----------------------------
from collections import Counter
counts = Counter(y)
class_counts = [counts[i] for i in range(len(counts))]
total = float(sum(class_counts))
class_weights = [total / (c + 1e-6) for c in class_counts]
class_weights = torch.tensor(class_weights, dtype=torch.float32).to(device)

criterion = nn.CrossEntropyLoss(weight=class_weights)
optimizer = optim.Adam(model.parameters(), lr=0.001)
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.5)

# -----------------------------
# TRAINING LOOP
# -----------------------------
epochs = 40

print("\n🚀 Training started...")

# prepare validation loader
val_dataset = TensorDataset(X_test, y_test)
val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False)

best_val_acc = 0.0
best_path = save_dir = current_dir.parent / "saved_models" / "best_audio_model.pth"

for epoch in range(epochs):
    model.train()
    total_loss = 0

    for batch_X, batch_y in train_loader:
        batch_X = batch_X.to(device)
        batch_y = batch_y.to(device)

        optimizer.zero_grad()

        outputs = model(batch_X)
        loss = criterion(outputs, batch_y)

        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    # validation
    model.eval()
    correct = 0
    total_val = 0
    with torch.no_grad():
        for vX, vy in val_loader:
            vX = vX.to(device)
            vy = vy.to(device)
            out = model(vX)
            _, preds = torch.max(out, 1)
            correct += (preds == vy).sum().item()
            total_val += vy.size(0)

    val_acc = correct / total_val if total_val else 0
    print(f"Epoch {epoch+1}/{epochs}, Train Loss: {total_loss:.4f}, Val Acc: {val_acc:.4f}")

    # save best
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        save_dir = current_dir.parent / "saved_models"
        save_dir.mkdir(exist_ok=True)
        torch.save(model.state_dict(), str(best_path))

    scheduler.step()

# -----------------------------
# EVALUATION
# -----------------------------
model.eval()
with torch.no_grad():
    X_test = X_test.to(device)
    y_test = y_test.to(device)

    outputs = model(X_test)
    _, preds = torch.max(outputs, 1)

    accuracy = (preds == y_test).float().mean()
    print(f"\n✅ Test Accuracy: {accuracy:.4f}")

# -----------------------------
# SAVE MODEL
# -----------------------------
save_dir = current_dir.parent / "saved_models"
save_dir.mkdir(exist_ok=True)

model_path = save_dir / "audio_model.pth"
torch.save(model.state_dict(), str(model_path))

print(f"\n💾 Model saved at: {model_path}")