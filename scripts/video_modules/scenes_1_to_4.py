from .theme import *

def render_scene_1(t, img, draw):
    # THE FARMER'S PROBLEM (0 - 12s)
    draw_header(draw, "The Agricultural Challenge")
    if t < 6.0:
        for y in range(80, HEIGHT):
            ratio = (y - 80) / (HEIGHT - 80)
            r = int(35 * (1-ratio) + 20 * ratio)
            g = int(25 * (1-ratio) + 30 * ratio)
            b = int(15 * (1-ratio) + 20 * ratio)
            draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))
            
        draw.ellipse([WIDTH//2 - 250, 150, WIDTH//2 + 250, 650], fill=(60, 45, 25))
        draw.rounded_rectangle([WIDTH//2 - 240, 280, WIDTH//2 + 240, 720], radius=24, fill=SURFACE, outline=LINE_COLOR, width=2)
        draw.text((WIDTH//2 - 200, 320), "🌾 Field Ready for Harvest", font=font_card_title, fill=GOLD)
        draw.text((WIDTH//2 - 200, 370), "Crop: High Quality Sharbati Wheat", font=font_sub, fill=TEXT_WHITE)
        draw.text((WIDTH//2 - 200, 410), "Quantity: 45 Quintals", font=font_sub, fill=TEXT_WHITE)
        draw.text((WIDTH//2 - 200, 450), "Location: Central Mandi Belt, UP", font=font_sub, fill=TEXT_MUTED)
        
        draw.rounded_rectangle([WIDTH//2 - 200, 510, WIDTH//2 + 200, 670], radius=16, fill=SURFACE2, outline=(120, 60, 60), width=2)
        draw.text((WIDTH//2 - 175, 535), "⚠️ The Traditional Mandi Hurdle:", font=font_pill, fill=RED_ACCENT)
        draw.text((WIDTH//2 - 175, 580), "• Uncertain waiting times at procurement gates", font=font_card_body, fill=TEXT_WHITE)
        draw.text((WIDTH//2 - 175, 615), "• Risk of harvest damage from sudden rain", font=font_card_body, fill=TEXT_MUTED)
    else:
        draw.rounded_rectangle([WIDTH//2 - 400, 160, WIDTH//2 + 400, 760], radius=24, fill=SURFACE, outline=RED_ACCENT, width=2)
        draw.text((WIDTH//2 - 360, 200), "🏢 Traditional APMC Mandi Bottlenecks", font=font_head, fill=RED_ACCENT)
        
        p_items = [
            ("🚛 1. Long Physical Queues", "Tractors queue for 8-14 hours under open sun before entry gate."),
            ("📝 2. Manual Paperwork", "Multiple duplicate forms, manual token books, ledger delays."),
            ("⏳ 3. Zero Live Transparency", "Farmers have no way to know gate rush before leaving home."),
            ("🌧️ 4. Weather Vulnerability", "Uncovered transport risks transit grain spoilage during rain.")
        ]
        for idx, (head, desc) in enumerate(p_items):
            bx = WIDTH//2 - 360 + (idx % 2) * 370
            by = 280 + (idx // 2) * 210
            draw.rounded_rectangle([bx, by, bx + 350, by + 180], radius=16, fill=SURFACE2, outline=LINE_COLOR)
            draw.text((bx + 20, by + 20), head, font=font_card_title, fill=GOLD)
            draw.text((bx + 20, by + 70), desc[:35], font=font_card_body, fill=TEXT_WHITE)
            draw.text((bx + 20, by + 100), desc[35:70], font=font_card_body, fill=TEXT_WHITE)
            draw.text((bx + 20, by + 130), desc[70:], font=font_card_body, fill=TEXT_MUTED)

    draw_callout_pills(draw, [("Long Queues", "red"), ("Paperwork", "red"), ("Delays", "red")], t)
    
    if 0.4 <= t < 5.4:
        draw_subtitle_bar(draw, "Narrator: Meet Rajesh, an Indian farmer who has just harvested his crop...")
    elif 5.4 <= t < 8.7:
        draw_subtitle_bar(draw, "Farmer: 'My crop is ready, but selling it at the mandi can take a lot of time.'")
    elif 8.7 <= t <= 12.0:
        draw_subtitle_bar(draw, "Narrator: Long queues, manual paperwork, and delays cost farmers valuable days.")

def render_scene_2(t, img, draw):
    # DISCOVERING KISANMITRA (12 - 20s)
    t_local = t - 12.0
    draw_header(draw, "Discovery & Solution")
    
    draw.rounded_rectangle([180, 150, 680, 780], radius=36, fill=(18, 24, 20), outline=GREEN, width=4)
    draw.rounded_rectangle([205, 175, 655, 755], radius=24, fill=(11, 15, 13))
    draw.rounded_rectangle([205, 175, 655, 245], radius=24, fill=SURFACE2)
    draw.text((230, 195), "🌾 KisanMitra Portal", font=font_card_title, fill=GREEN)
    
    draw.text((230, 270), "Digital India Initiative", font=font_badge, fill=GOLD)
    draw.text((230, 305), "Zero Queues. Zero Confusion.", font=font_card_title, fill=TEXT_WHITE)
    draw.text((230, 350), "Smart Tokens · Live AGMARKNET", font=font_card_body, fill=TEXT_MUTED)
    
    draw.rounded_rectangle([230, 410, 630, 480], radius=16, fill=GREEN_DARK)
    draw.text((260, 430), "🚜 Book Smart Token", font=font_card_title, fill=TEXT_WHITE)
    
    draw.rounded_rectangle([230, 505, 630, 575], radius=16, fill=SURFACE2, outline=LINE_COLOR)
    draw.text((260, 525), "📈 Check Live Mandi Prices", font=font_card_title, fill=GOLD)
    
    draw.rounded_rectangle([230, 600, 630, 670], radius=16, fill=SURFACE2, outline=LINE_COLOR)
    draw.text((260, 620), "👥 Community Marketplace", font=font_card_title, fill=TEXT_WHITE)

    draw.rounded_rectangle([750, 200, 1750, 720], radius=24, fill=SURFACE, outline=LINE_COLOR, width=2)
    draw.text((800, 250), "🤝 Peer Recommendation in Village", font=font_title, fill=GOLD)
    
    draw.rounded_rectangle([800, 330, 1700, 490], radius=20, fill=SURFACE2, outline=GREEN, width=2)
    draw.text((830, 360), "“Try KisanMitra. You can book the process online", font=font_head, fill=TEXT_WHITE)
    draw.text((830, 415), " and track it from your phone.”", font=font_head, fill=GREEN)
    
    draw.text((800, 530), "Key Platform Capabilities:", font=font_card_title, fill=TEXT_MUTED)
    draw.text((800, 580), "✔ Book official mandi slot from home in 2 minutes", font=font_card_body, fill=TEXT_WHITE)
    draw.text((800, 620), "✔ Live status tracker with instant digital token receipt", font=font_card_body, fill=TEXT_WHITE)
    draw.text((800, 660), "✔ Pan-India 70+ Mandi weather forecast & AGMARKNET rates", font=font_card_body, fill=TEXT_WHITE)

    draw_callout_pills(draw, [("Discover KisanMitra", "green"), ("Digital Access", "gold")], t_local)
    
    if 0.3 <= t_local < 3.2:
        draw_subtitle_bar(draw, "Narrator: While discussing his dilemma, Rajesh learns about a digital solution.")
    elif 3.2 <= t_local <= 8.0:
        draw_subtitle_bar(draw, "Peer Farmer: 'Try KisanMitra. You can book the process online and track it from your phone.'")

def render_scene_3(t, img, draw):
    # ONLINE BOOKING & DIGITAL TOKEN (20 - 32s)
    t_local = t - 20.0
    draw_header(draw, "Online Token Booking (Farmer Portal)")
    
    if t_local < 6.0:
        draw.rounded_rectangle([150, 120, 1770, 780], radius=24, fill=SURFACE, outline=LINE_COLOR, width=2)
        draw.text((200, 160), "📝 Smart Token Registration Form", font=font_head, fill=GREEN)
        draw.text((200, 210), "Fill details to receive official procurement slot & token slip", font=font_sub, fill=TEXT_MUTED)
        
        fields = [
            ("Farmer's Full Name *", "Ram Yadav", 280, 370),
            ("Mobile Number *", "+91 98765 43210", 390, 480),
            ("Select Crop *", "🌾 Wheat (Sharbati)", 500, 590),
            ("Quantity (Quintal) *", "45 quintal", 280, 370, 1000),
            ("District / Mandi *", "Lucknow Mandi", 390, 480, 1000),
            ("Aadhaar Verification *", "XXXXXXXX8924 (Verified ✓)", 500, 590, 1000)
        ]
        
        for item in fields:
            label, val, y1, y2 = item[0], item[1], item[2], item[3]
            x1 = item[4] if len(item) > 4 else 200
            x2 = x1 + 720
            draw.text((x1, y1), label, font=font_badge, fill=TEXT_MUTED)
            draw.rounded_rectangle([x1, y1 + 30, x2, y2], radius=12, fill=SURFACE2, outline=GREEN if t_local > 1.5 else LINE_COLOR)
            draw.text((x1 + 20, y1 + 45), val, font=font_card_title, fill=TEXT_WHITE)
            
        btn_glow = GREEN if t_local > 4.5 else GREEN_DARK
        draw.rounded_rectangle([200, 650, 1720, 730], radius=20, fill=btn_glow)
        draw.text((820, 675), "✅ Issue Token — with Instant PDF Slip", font=font_card_title, fill=(11, 15, 13))
    else:
        draw.rounded_rectangle([400, 140, 1520, 780], radius=28, fill=SURFACE, outline=GREEN, width=3)
        draw.text((910, 180), "🎉", font=font_title, fill=GOLD)
        draw.text((740, 250), "Booking Confirmed Successfully!", font=font_title, fill=GREEN)
        draw.text((640, 315), "Farmer: Ram Yadav · Crop: Wheat (45 quintal) · Mandi: Lucknow Mandi", font=font_sub, fill=TEXT_MUTED)
        
        draw.rounded_rectangle([600, 380, 1320, 500], radius=20, fill=SURFACE2, outline=GOLD, width=3)
        draw.text((640, 400), "OFFICIAL SMART TOKEN ID", font=font_badge, fill=GOLD)
        draw.text((640, 435), "KM20251004", font=font_huge, fill=TEXT_WHITE)
        
        draw.rounded_rectangle([520, 550, 990, 630], radius=18, fill=GREEN)
        draw.text((550, 575), "📄 Download Token Slip (PDF)", font=font_card_title, fill=(11, 15, 13))
        
        draw.rounded_rectangle([1030, 550, 1400, 630], radius=18, fill=SURFACE2, outline=LINE_COLOR)
        draw.text((1060, 575), "🔍 Track Status Live", font=font_card_title, fill=GOLD)
        
        draw.text((620, 690), "✔ Token slip securely retained in device storage & database", font=font_card_body, fill=TEXT_MUTED)

    draw_callout_pills(draw, [("Online Booking ✓", "green"), ("Digital Token ✓", "gold")], t_local)
    
    if 0.4 <= t_local < 6.0:
        draw_subtitle_bar(draw, "Narrator: Rajesh opens KisanMitra, fills in crop details, and submits his booking.")
    elif 6.0 <= t_local < 8.8:
        draw_subtitle_bar(draw, "Farmer: 'That was simple. My booking is completed online.'")
    elif 8.8 <= t_local <= 12.0:
        draw_subtitle_bar(draw, "Narrator: An official digital token KM20251004 is generated with a downloadable receipt.")

def render_scene_4(t, img, draw):
    # MANDI MARKET PRICES (32 - 40s)
    t_local = t - 32.0
    draw_header(draw, "Live AGMARKNET Market Prices")
    
    draw.rounded_rectangle([120, 120, 1800, 780], radius=24, fill=SURFACE, outline=LINE_COLOR, width=2)
    draw.text((160, 150), "📈 Today's Real APMC Mandi Prices & Official MSP Floor", font=font_head, fill=GOLD)
    draw.text((160, 200), "Live data synchronized from AGMARKNET Government of India Database", font=font_sub, fill=TEXT_MUTED)
    
    draw.rounded_rectangle([160, 250, 1760, 330], radius=16, fill=SURFACE2, outline=GREEN, width=2)
    draw.text((200, 275), "🌾 Selected Crop: Wheat (Rabi 2024-25)", font=font_card_title, fill=TEXT_WHITE)
    draw.text((1150, 275), "Government Guaranteed MSP: ₹2,425 / quintal", font=font_card_title, fill=GREEN)
    
    headers = ["Mandi Name", "District / State", "Min Price (₹)", "Max Price (₹)", "Modal Price (₹ / quintal)"]
    hx_pos = [180, 580, 960, 1240, 1500]
    
    draw.line([160, 360, 1760, 360], fill=LINE_COLOR, width=2)
    for i, h in enumerate(headers):
        draw.text((hx_pos[i], 375), h, font=font_badge, fill=TEXT_MUTED)
    draw.line([160, 410, 1760, 410], fill=LINE_COLOR, width=2)
    
    rows = [
        ("Lucknow APMC Mandi", "Lucknow, Uttar Pradesh", "₹2,380", "₹2,540", "₹2,460 ★ (Above MSP)"),
        ("Kanpur Main Mandi", "Kanpur, Uttar Pradesh", "₹2,400", "₹2,520", "₹2,450"),
        ("Ludhiana Grain Market", "Ludhiana, Punjab", "₹2,425", "₹2,600", "₹2,490"),
        ("Karnal Procurement Mandi", "Karnal, Haryana", "₹2,425", "₹2,580", "₹2,480"),
        ("Patna Central Mandi", "Patna, Bihar", "₹2,350", "₹2,440", "₹2,425")
    ]
    
    for r_idx, r in enumerate(rows):
        ry = 430 + r_idx * 60
        if r_idx == 0:
            draw.rounded_rectangle([160, ry - 8, 1760, ry + 42], radius=10, fill=(30, 50, 38))
        
        draw.text((hx_pos[0], ry), r[0], font=font_card_title, fill=TEXT_WHITE)
        draw.text((hx_pos[1], ry + 2), r[1], font=font_card_body, fill=TEXT_MUTED)
        draw.text((hx_pos[2], ry), r[2], font=font_card_title, fill=TEXT_WHITE)
        draw.text((hx_pos[3], ry), r[3], font=font_card_title, fill=TEXT_WHITE)
        draw.text((hx_pos[4], ry), r[4], font=font_card_title, fill=GREEN if r_idx == 0 else GOLD)

    draw_callout_pills(draw, [("Mandi Prices", "gold"), ("Compare Before You Sell", "green")], t_local)
    
    if 0.4 <= t_local < 3.5:
        draw_subtitle_bar(draw, "Farmer: 'I can also check mandi prices before making my decision.'")
    elif 3.5 <= t_local <= 8.0:
        draw_subtitle_bar(draw, "Narrator: Live AGMARKNET prices and MSP floor rates help compare before selling.")
