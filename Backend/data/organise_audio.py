import os
import shutil

# since Actor folders are inside data/
source_path = "."   # current folder (data/)
target_path = "audio"

emotion_map = {
    "03": "happy",
    "04": "sad",
    "05": "angry"
}

for folder in os.listdir(source_path):
    if folder.startswith("Actor"):
        actor_path = os.path.join(source_path, folder)

        for file in os.listdir(actor_path):
            if file.endswith(".wav"):
                parts = file.split("-")
                emotion_code = parts[2]

                if emotion_code in emotion_map:
                    emotion = emotion_map[emotion_code]

                    dest_folder = os.path.join(target_path, emotion)
                    os.makedirs(dest_folder, exist_ok=True)

                    shutil.copy(
                        os.path.join(actor_path, file),
                        os.path.join(dest_folder, file)
                    )

print("✅ All audio sorted into happy/sad/angry folders!")