from PIL import Image, ImageDraw, ImageFont

WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_DURATION = 90.0
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)

FONT_REG = "C:/Windows/Fonts/segoeui.ttf"
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_ARIAL_BOLD = "C:/Windows/Fonts/arialbd.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

font_title = get_font(FONT_ARIAL_BOLD, 46)
font_head = get_font(FONT_BOLD, 36)
font_sub = get_font(FONT_REG, 24)
font_card_title = get_font(FONT_BOLD, 26)
font_card_body = get_font(FONT_REG, 20)
font_pill = get_font(FONT_BOLD, 22)
font_badge = get_font(FONT_BOLD, 18)
font_subtitles = get_font(FONT_BOLD, 26)
font_huge = get_font(FONT_ARIAL_BOLD, 64)

# Color Palette (Matches Real KisanMitra Website)
BG_DARK = (11, 15, 13)
SURFACE = (19, 26, 22)
SURFACE2 = (26, 36, 30)
LINE_COLOR = (38, 51, 43)
GREEN = (62, 207, 111)
GREEN_DARK = (30, 140, 70)
GOLD = (255, 196, 77)
TEXT_WHITE = (238, 245, 239)
TEXT_MUTED = (157, 179, 164)
RED_ACCENT = (255, 107, 107)

def draw_header(draw, title_suffix=""):
    draw.rectangle([0, 0, WIDTH, 80], fill=(15, 21, 17))
    draw.line([0, 80, WIDTH, 80], fill=LINE_COLOR, width=2)
    draw.rounded_rectangle([60, 18, 104, 62], radius=12, fill=GREEN_DARK)
    draw.text((70, 22), "🌾", font=font_sub, fill=(255, 255, 255))
    draw.text((120, 24), "KisanMitra", font=font_head, fill=TEXT_WHITE)
    if title_suffix:
        draw.text((340, 30), f"| {title_suffix}", font=font_sub, fill=TEXT_MUTED)
    draw.rounded_rectangle([WIDTH - 460, 22, WIDTH - 60, 58], radius=18, fill=SURFACE2, outline=LINE_COLOR)
    draw.ellipse([WIDTH - 440, 36, WIDTH - 428, 48], fill=GREEN)
    draw.text((WIDTH - 418, 27), "Digital India Initiative · 70+ Mandis", font=font_badge, fill=GREEN)

def draw_subtitle_bar(draw, text):
    if not text:
        return
    bbox = font_subtitles.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pad_x = 35
    pad_y = 14
    box_w = tw + pad_x * 2
    box_h = th + pad_y * 2
    x1 = (WIDTH - box_w) // 2
    y1 = HEIGHT - 110
    x2 = x1 + box_w
    y2 = y1 + box_h
    draw.rounded_rectangle([x1, y1, x2, y2], radius=20, fill=(10, 14, 12), outline=(50, 70, 55), width=2)
    draw.text((x1 + pad_x, y1 + pad_y - 2), text, font=font_subtitles, fill=TEXT_WHITE)

def draw_callout_pills(draw, pills, t_in_scene):
    start_y = 120
    for i, (ptext, ptype) in enumerate(pills):
        delay = i * 0.8
        if t_in_scene < delay:
            continue
        anim_prog = min(1.0, (t_in_scene - delay) / 0.5)
        offset_x = int((1.0 - anim_prog) * -400)
        bg_col = (40, 20, 20) if ptype == "red" else (20, 40, 28) if ptype == "green" else (40, 35, 20)
        border_col = RED_ACCENT if ptype == "red" else GREEN if ptype == "green" else GOLD
        txt_col = RED_ACCENT if ptype == "red" else GREEN if ptype == "green" else GOLD
        px1 = 80 + offset_x
        py1 = start_y + i * 65
        px2 = px1 + 340
        py2 = py1 + 50
        draw.rounded_rectangle([px1, py1, px2, py2], radius=16, fill=bg_col, outline=border_col, width=2)
        draw.text((px1 + 20, py1 + 12), ptext, font=font_pill, fill=txt_col)
