import asyncio
import edge_tts
import os

os.makedirs("video_assets/audio", exist_ok=True)

VOICE_FARMER = "en-IN-PrabhatNeural"
VOICE_PEER = "en-IN-PrabhatNeural"

dialogues = [
    # Scene 1 (0-12s)
    ("s1_farmer", VOICE_FARMER, "-5%", "+0Hz", "My crop is ready, but selling it at the mandi can take a lot of time."),
    # Scene 2 (12-20s)
    ("s2_peer", VOICE_PEER, "+0%", "+5Hz", "Try KisanMitra. You can book the process online and track it from your phone."),
    # Scene 3 (20-32s)
    ("s3_farmer", VOICE_FARMER, "-2%", "+0Hz", "That was simple. My booking is completed online."),
    # Scene 4 (32-40s)
    ("s4_farmer", VOICE_FARMER, "-2%", "+0Hz", "I can also check mandi prices before making my decision."),
    # Scene 5 (40-48s)
    ("s5_farmer", VOICE_FARMER, "-2%", "+0Hz", "And I can access farming guidance and government scheme information in one place."),
    # Scene 6 (48-60s)
    ("s6_farmer", VOICE_FARMER, "-2%", "+0Hz", "Now I can track every step without making repeated visits."),
    # Scene 7 (60-70s)
    ("s7_narrator", VOICE_FARMER, "-2%", "+2Hz", "The procurement officer verifies the booking on the admin dashboard and updates the status in real time."),
    # Scene 8 (70-84s)
    ("s8_farmer", VOICE_FARMER, "-2%", "+0Hz", "I can also connect with other farmers, ask questions, and share what I learn."),
    # Scene 9 (84-90s)
    ("s9_farmer", VOICE_FARMER, "-2%", "+0Hz", "With KisanMitra, I can book, track, and stay connected—all from one platform.")
]

async def generate_all():
    for tag, voice, rate, pitch, text in dialogues:
        out_path = f"video_assets/audio/{tag}.mp3"
        print(f"Generating {tag}: '{text}'...")
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        await communicate.save(out_path)
        print(f"Saved {out_path}")

asyncio.run(generate_all())
