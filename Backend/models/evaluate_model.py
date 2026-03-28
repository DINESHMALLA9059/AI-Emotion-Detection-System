import os
from collections import defaultdict
from pathlib import Path
import sys

# ensure project parent added so `models` package is importable when running inside Backend
sys.path.insert(0, str(Path(__file__).parent.parent))

from models.audio_model import predict_audio


def evaluate(data_root):
    data_root = Path(data_root)
    classes = sorted([p.name for p in data_root.iterdir() if p.is_dir()])
    stats = {c: defaultdict(int) for c in classes}
    examples = []

    for true_label in classes:
        folder = data_root / true_label
        for f in folder.iterdir():
            if f.suffix.lower() != ".wav":
                continue
            try:
                out = predict_audio(str(f))
            except Exception as e:
                print(f"Error predicting {f}: {e}")
                continue

            pred = out.get("emotion")
            conf = out.get("confidence")
            stats[true_label][pred] += 1
            if true_label != pred and len(examples) < 30:
                examples.append((str(f), true_label, pred, conf))

    # Print confusion-like table
    print("\nClasses:", classes)
    print("\nPer-class breakdown:")
    for true_label in classes:
        total = sum(stats[true_label].values())
        print(f"\n{true_label}: total={total}")
        for pred, cnt in stats[true_label].items():
            pct = cnt / total * 100 if total else 0
            print(f"  -> {pred}: {cnt} ({pct:.1f}%)")

    # Overall accuracy
    correct = sum(stats[c].get(c, 0) for c in classes)
    total_all = sum(sum(stats[c].values()) for c in classes)
    acc = correct / total_all if total_all else 0
    print(f"\nOverall accuracy: {acc:.4f} ({correct}/{total_all})")

    if examples:
        print("\nSome misclassified examples:")
        for p, t, pr, conf in examples:
            print(f"{p} -> true={t} pred={pr} conf={conf:.3f}")


if __name__ == '__main__':
    root = Path(__file__).parent.parent / "data" / "audio"
    print(f"Evaluating data in: {root}")
    evaluate(root)
