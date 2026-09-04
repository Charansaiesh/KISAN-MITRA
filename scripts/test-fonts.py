from PIL import Image, ImageDraw, ImageFont
import os

fonts_dir = "C:/Windows/Fonts"
font_names = ["segoeui.ttf", "segoeuib.ttf", "arial.ttf", "arialbd.ttf", "calibri.ttf"]
available = [f for f in font_names if os.path.exists(os.path.join(fonts_dir, f))]
print("Available fonts:", available)
