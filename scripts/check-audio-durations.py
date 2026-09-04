import subprocess
import json
import os
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

def get_duration(file_path):
    cmd = [ffmpeg_exe, "-i", file_path]
    result = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in result.stderr.split("\n"):
        if "Duration:" in line:
            time_str = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = time_str.split(":")
            return float(h)*3600 + float(m)*60 + float(s)
    return 0.0

audios = [
    "s1_farmer", "s2_peer", "s3_farmer", "s4_farmer",
    "s5_farmer", "s6_farmer", "s7_narrator", "s8_farmer", "s9_farmer"
]

print("--- Audio Durations ---")
for a in audios:
    p = f"video_assets/audio/{a}.mp3"
    d = get_duration(p)
    print(f"{a}: {d:.2f} seconds")
