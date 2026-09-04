import numpy as np
import wave
import subprocess
import imageio_ffmpeg
import os

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

SAMPLE_RATE = 44100
TOTAL_DURATION = 90.0 # 90 seconds
total_samples = int(TOTAL_DURATION * SAMPLE_RATE)

# 1. Synthesize Warm Background Acoustic Harmony
t = np.linspace(0, TOTAL_DURATION, total_samples, endpoint=False)
music = np.zeros(total_samples)

chords = [
    (0.0, 12.0, [146.83, 220.0, 293.66, 369.99, 440.0]),
    (12.0, 20.0, [196.0, 246.94, 293.66, 392.0]),
    (20.0, 32.0, [220.0, 277.18, 329.63, 440.0]),
    (32.0, 40.0, [146.83, 220.0, 293.66, 369.99]),
    (40.0, 48.0, [196.0, 246.94, 293.66, 392.0]),
    (48.0, 60.0, [164.81, 196.0, 246.94, 329.63]),
    (60.0, 70.0, [220.0, 277.18, 329.63, 440.0]),
    (70.0, 84.0, [196.0, 246.94, 293.66, 392.0]),
    (84.0, 90.0, [146.83, 220.0, 293.66, 440.0, 587.33])
]

for start_t, end_t, freqs in chords:
    s_idx = int(start_t * SAMPLE_RATE)
    e_idx = int(end_t * SAMPLE_RATE)
    dur = end_t - start_t
    sub_t = np.linspace(0, dur, e_idx - s_idx, endpoint=False)
    envelope = np.exp(-sub_t * 0.25) * 0.3 + 0.7
    fade_in = np.minimum(1.0, sub_t / 0.4)
    fade_out = np.minimum(1.0, (dur - sub_t) / 0.4)
    env = envelope * fade_in * fade_out
    sub_sig = np.zeros(e_idx - s_idx)
    for f in freqs:
        sub_sig += np.sin(2 * np.pi * f * sub_t) * 0.14
        sub_sig += np.sin(2 * np.pi * (f * 2) * sub_t) * 0.05
    music[s_idx:e_idx] += sub_sig * env * 0.06

# 2. Place All 22 Voice Segments
voice_track = np.zeros(total_samples)

voice_timings = [
    # Scene 1: 0 - 12s
    ("s1_nar1", 0.4),
    ("s1_dlg", 5.5),
    ("s1_nar2", 8.8),
    
    # Scene 2: 12 - 20s
    ("s2_nar1", 12.3),
    ("s2_dlg", 15.2),
    
    # Scene 3: 20 - 32s
    ("s3_nar1", 20.4),
    ("s3_dlg", 26.2),
    ("s3_nar2", 28.8),
    
    # Scene 4: 32 - 40s
    ("s4_dlg", 32.4),
    ("s4_nar1", 35.5),
    
    # Scene 5: 40 - 48s
    ("s5_dlg", 40.4),
    ("s5_nar1", 44.2),
    
    # Scene 6: 48 - 60s
    ("s6_nar1", 48.4),
    ("s6_dlg", 53.4),
    ("s6_nar2", 56.5),
    
    # Scene 7: 60 - 70s
    ("s7_nar1", 60.4),
    ("s7_nar2", 65.2),
    
    # Scene 8: 70 - 84s
    ("s8_nar1", 70.4),
    ("s8_dlg", 75.0),
    ("s8_nar2", 79.2),
    
    # Scene 9: 84 - 90s
    ("s9_nar1", 83.8),
    ("s9_dlg", 86.8)
]

for tag, start_time in voice_timings:
    mp3_path = f"video_assets/audio_v2/{tag}.mp3"
    wav_path = f"video_assets/audio_v2/{tag}.wav"
    cmd = [ffmpeg_exe, "-y", "-i", mp3_path, "-ar", "44100", "-ac", "1", wav_path]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    with wave.open(wav_path, "rb") as wf:
        n_frames = wf.getnframes()
        v_bytes = wf.readframes(n_frames)
        v_data = np.frombuffer(v_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        s_idx = int(start_time * SAMPLE_RATE)
        e_idx = min(s_idx + len(v_data), total_samples)
        voice_track[s_idx:e_idx] += v_data[:e_idx - s_idx] * 0.95

# 3. Master Mix with Ducking
voice_energy = np.abs(voice_track)
kernel_size = int(SAMPLE_RATE * 0.2)
kernel = np.ones(kernel_size) / kernel_size
smoothed_energy = np.convolve(voice_energy, kernel, mode="same")
ducking = np.clip(1.0 - smoothed_energy * 2.5, 0.15, 1.0)

master = voice_track + (music * ducking)

max_amp = np.max(np.abs(master))
if max_amp > 0.95:
    master = master * (0.95 / max_amp)

master_int16 = (master * 32767.0).astype(np.int16)
stereo_master = np.column_stack((master_int16, master_int16))

out_master_path = "video_assets/audio_v2/master_full_soundtrack.wav"
with wave.open(out_master_path, "wb") as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(stereo_master.tobytes())

print(f"Master full audio generated: {out_master_path} ({TOTAL_DURATION}s)")
