import asyncio
import edge_tts
import os
import subprocess
import wave
import numpy as np
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
os.makedirs("video_assets/audio_v2", exist_ok=True)

VOICE_NARRATOR = "en-IN-PrabhatNeural"
VOICE_FARMER = "en-IN-PrabhatNeural"
VOICE_PEER = "en-IN-PrabhatNeural"

# Full continuous voice script for all 9 scenes
script_segments = [
    # Scene 1: 0 - 12s
    ("s1_nar1", VOICE_NARRATOR, "+0%", "+2Hz", 0.3, "Meet Rajesh, an Indian farmer who has just harvested his wheat crop. But selling his harvest at the mandi presents major challenges."),
    ("s1_dlg", VOICE_FARMER, "-3%", "-2Hz", 5.5, "My crop is ready, but selling it at the mandi can take a lot of time."),
    ("s1_nar2", VOICE_NARRATOR, "+0%", "+2Hz", 8.8, "Long queues, manual paperwork, and weather delays cost farmers valuable time."),
    
    # Scene 2: 12 - 20s
    ("s2_nar1", VOICE_NARRATOR, "+0%", "+2Hz", 12.3, "While discussing his dilemma in the village, Rajesh discovers a digital solution."),
    ("s2_dlg", VOICE_PEER, "+2%", "+4Hz", 15.2, "Try KisanMitra. You can book the process online and track it from your phone."),
    
    # Scene 3: 20 - 32s
    ("s3_nar1", VOICE_NARRATOR, "+0%", "+2Hz", 20.5, "Rajesh opens the KisanMitra website on his phone, enters his details, selects wheat, and submits his booking."),
    ("s3_dlg", VOICE_FARMER, "-3%", "-2Hz", 26.2, "That was simple. My booking is completed online."),
    ("s3_nar2", VOICE_NARRATOR, "+0%", "+2Hz", 28.8, "An official digital token is generated instantly, along with a printable receipt slip."),
    
    # Scene 4: 32 - 40s
    ("s4_dlg", VOICE_FARMER, "-3%", "-2Hz", 32.5, "I can also check mandi prices before making my decision."),
    ("s4_nar1", VOICE_NARRATOR, "+0%", "+2Hz", 35.5, "Live AGMARKNET prices and government guaranteed MSP floor rates help him compare before selling."),
    
    # Scene 5: 40 - 48s
    ("s5_dlg", VOICE_FARMER, "-3%", "-2Hz", 40.5, "And I can access farming guidance and government scheme information in one place."),
    ("s5_nar1", VOICE_NARRATOR, "+0%", "+2Hz", 44.2, "From 5-day weather alerts to PM-Kisan financial support, everything is available in one portal."),
    
    # Scene 6: 48 - 60s
    ("s6_nar1", VOICE_NARRATOR, "+0%", "+2Hz", 48.5, "On procurement day, Rajesh enters his token number to track every stage in real time."),
    ("s6_dlg", VOICE_FARMER, "-3%", "-2Hz", 53.5, "Now I can track every step without making repeated visits."),
    ("s6_nar2", VOICE_NARRATOR, "+0%", "+2Hz", 56.5, "Clear milestone tracking gives complete peace of mind with zero physical queueing."),
    
    # Scene 7: 60 - 70s
    ("s7_nar1", VOICE_NARRATOR, "+0%", "+2Hz", 60.5, "At the APMC Mandi, authorized officers review the booking in the KisanMitra Admin Dashboard."),
    ("s7_nar2", VOICE_NARRATOR, "+0%", "+2Hz", 65.2, "With backend synchronization, status updates reflect instantly on the farmer's screen."),
    
    # Scene 8: 70 - 84s
    ("s8_nar1", VOICE_NARRATOR, "+0%", "+2Hz", 70.5, "The Community Portal connects farmers nationwide for direct discussions and mutual support."),
    ("s8_dlg", VOICE_FARMER, "-3%", "-2Hz", 75.0, "I can also connect with other farmers, ask questions, and share what I learn."),
    ("s8_nar2", VOICE_NARRATOR, "+0%", "+2Hz", 79.2, "From crop protection advice to equipment hire, the community empowers every farmer."),
    
    # Scene 9: 84 - 90s
    ("s9_nar1", VOICE_NARRATOR, "+0%", "+2Hz", 83.8, "The procurement process is completed smoothly with direct bank disbursement."),
    ("s9_dlg", VOICE_FARMER, "-3%", "-2Hz", 87.0, "With KisanMitra, I can book, track, and stay connected—all from one platform.")
]

async def generate_audio_files():
    for tag, voice, rate, pitch, _, text in script_segments:
        mp3_p = f"video_assets/audio_v2/{tag}.mp3"
        print(f"Synthesizing {tag}...")
        comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        await comm.save(mp3_p)

asyncio.run(generate_audio_files())
print("All audio segments synthesized!")
