import subprocess
import imageio_ffmpeg
import numpy as np
import wave

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

# Check master soundtrack
with wave.open("video_assets/audio/master_soundtrack.wav", "rb") as wf:
    n_frames = wf.getnframes()
    sr = wf.getframerate()
    ch = wf.getnchannels()
    frames = wf.readframes(n_frames)
    data = np.frombuffer(frames, dtype=np.int16)
    print(f"Master WAV: {n_frames} frames, {sr}Hz, {ch} channels, Max Amplitude: {np.max(np.abs(data))}, Non-zero count: {np.count_nonzero(data)}")

# Inspect individual scene audio files
import glob
for mp3 in glob.glob("video_assets/audio/*.mp3"):
    cmd = [ffmpeg_exe, "-i", mp3]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in res.stderr.split("\n"):
        if "Duration:" in line:
            print(f"{mp3}: {line.strip()}")
