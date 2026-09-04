import subprocess
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

# Extract audio from mp4 to check
cmd = [ffmpeg_exe, "-y", "-i", "kisanmitra_demo_presentation.mp4", "-af", "volumedetect", "-f", "null", "NUL"]
res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
for line in res.stderr.split("\n"):
    if "mean_volume" in line or "max_volume" in line or "Stream #0" in line:
        print(line)
