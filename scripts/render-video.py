import os
import sys
import subprocess
from PIL import Image, ImageDraw
import imageio_ffmpeg
from video_modules.theme import WIDTH, HEIGHT, FPS, TOTAL_FRAMES, BG_DARK
from video_modules.scenes_1_to_4 import render_scene_1, render_scene_2, render_scene_3, render_scene_4
from video_modules.scenes_5_to_9 import render_scene_5, render_scene_6, render_scene_7, render_scene_8, render_scene_9

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
video_output_path = "kisanmitra_demo_presentation.mp4"
audio_input_path = "video_assets/audio_v2/master_full_soundtrack.wav"

print(f"Starting Video Rendering ({TOTAL_FRAMES} frames @ {FPS}fps, 1080p, 90.0s)...")

ffmpeg_cmd = [
    ffmpeg_exe,
    "-y",
    "-f", "rawvideo",
    "-vcodec", "rawvideo",
    "-s", f"{WIDTH}x{HEIGHT}",
    "-pix_fmt", "rgb24",
    "-r", str(FPS),
    "-i", "-",
    "-i", audio_input_path,
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    video_output_path
]

process = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

for frame_idx in range(TOTAL_FRAMES):
    t = frame_idx / FPS
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_DARK)
    draw = ImageDraw.Draw(img)
    
    if t < 12.0:
        render_scene_1(t, img, draw)
    elif t < 20.0:
        render_scene_2(t, img, draw)
    elif t < 32.0:
        render_scene_3(t, img, draw)
    elif t < 40.0:
        render_scene_4(t, img, draw)
    elif t < 48.0:
        render_scene_5(t, img, draw)
    elif t < 60.0:
        render_scene_6(t, img, draw)
    elif t < 70.0:
        render_scene_7(t, img, draw)
    elif t < 84.0:
        render_scene_8(t, img, draw)
    else:
        render_scene_9(t, img, draw)
        
    process.stdin.write(img.tobytes())
    
    if frame_idx % 300 == 0 or frame_idx == TOTAL_FRAMES - 1:
        pct = (frame_idx / TOTAL_FRAMES) * 100
        print(f"Progress: frame {frame_idx}/{TOTAL_FRAMES} ({pct:.1f}%) - Video time: {t:.1f}s")

process.stdin.close()
process.wait()

print(f"Video successfully generated: {video_output_path}")
