from .theme import *

def render_scene_5(t, img, draw):
    # SCHEMES & ADVISORY (40 - 48s)
    t_local = t - 40.0
    draw_header(draw, "Agricultural Advisory & Weather Alerts")
    
    draw.rounded_rectangle([120, 120, 920, 780], radius=24, fill=SURFACE, outline=LINE_COLOR, width=2)
    draw.text((160, 160), "🌦️ 5-Day Mandi Weather Forecast", font=font_head, fill=GOLD)
    draw.text((160, 210), "Open-Meteo Satellite Sync · Lucknow Mandi", font=font_sub, fill=TEXT_MUTED)
    
    draw.rounded_rectangle([160, 260, 880, 420], radius=18, fill=SURFACE2, outline=GREEN, width=2)
    draw.text((200, 290), "🌤️ 28°C", font=font_huge, fill=TEXT_WHITE)
    draw.text((200, 370), "Partly Cloudy · 0% Rain Probability Today", font=font_card_title, fill=GREEN)
    
    draw.rounded_rectangle([160, 450, 880, 580], radius=16, fill=(30, 45, 35), outline=GREEN)
    draw.text((190, 480), "✅ Safe Transit Recommendation:", font=font_card_title, fill=GREEN)
    draw.text((190, 525), "Skies look safe for next 3 days. Excellent transport conditions.", font=font_card_body, fill=TEXT_WHITE)
    
    draw.rounded_rectangle([160, 610, 880, 730], radius=16, fill=SURFACE2, outline=LINE_COLOR)
    draw.text((190, 635), "💡 Crop Advisory Tip:", font=font_card_title, fill=GOLD)
    draw.text((190, 675), "Ensure wheat grain moisture is under 12% before bagging.", font=font_card_body, fill=TEXT_WHITE)

    draw.rounded_rectangle([960, 120, 1800, 780], radius=24, fill=SURFACE, outline=LINE_COLOR, width=2)
    draw.text((1000, 160), "🏛️ Integrated Government Schemes", font=font_head, fill=GREEN)
    draw.text((1000, 210), "Direct Benefit Transfer & Financial Protection", font=font_sub, fill=TEXT_MUTED)
    
    schemes = [
        ("💰 PM-Kisan Samman Nidhi", "Direct income support of ₹6,000/year deposited to bank accounts via DBT."),
        ("🛡️ Pradhan Mantri Fasal Bima", "Comprehensive crop insurance protection against unseasonal weather events."),
        ("💳 Kisan Credit Card (KCC)", "Concessional institutional credit for crop inputs and farm machinery."),
        ("⚡ Solar Pump Subsidy (PM-KUSUM)", "Up to 60% financial assistance for solar agriculture pump installation.")
    ]
    
    for s_idx, (stitle, sdesc) in enumerate(schemes):
        sy = 270 + s_idx * 115
        draw.rounded_rectangle([1000, sy, 1760, sy + 100], radius=16, fill=SURFACE2, outline=LINE_COLOR)
        draw.text((1030, sy + 18), stitle, font=font_card_title, fill=GOLD)
        draw.text((1030, sy + 55), sdesc, font=font_card_body, fill=TEXT_WHITE)

    draw_callout_pills(draw, [("Advisory", "green"), ("Government Schemes", "gold"), ("Useful Information", "green")], t_local)
    
    if 0.4 <= t_local < 4.0:
        draw_subtitle_bar(draw, "Farmer: 'And I can access farming guidance and government schemes in one place.'")
    elif 4.0 <= t_local <= 8.0:
        draw_subtitle_bar(draw, "Narrator: 5-day weather alerts and financial guidance protect farmer investments.")

def render_scene_6(t, img, draw):
    # TRACKING THE PROCESS (48 - 60s)
    t_local = t - 48.0
    draw_header(draw, "Live Process Tracking (Farmer Portal)")
    
    draw.rounded_rectangle([200, 120, 1720, 780], radius=24, fill=SURFACE, outline=LINE_COLOR, width=2)
    draw.text((260, 160), "🔍 Live Procurement Status Tracker", font=font_head, fill=GREEN)
    draw.text((260, 210), "Token: KM20251004 · Farmer: Ram Yadav · Mandi: Lucknow Mandi", font=font_sub, fill=TEXT_MUTED)
    
    prog_pct = min(60, int(20 + t_local * 4))
    draw.text((260, 280), f"Overall Progress: {prog_pct}%", font=font_card_title, fill=GOLD)
    
    draw.rounded_rectangle([260, 320, 1660, 350], radius=15, fill=SURFACE2)
    bar_w = int((1660 - 260) * (prog_pct / 100))
    draw.rounded_rectangle([260, 320, 260 + bar_w, 350], radius=15, fill=GREEN)
    
    steps = [
        ("Step 1: Registration Received", "Online booking completed and verified in database.", True),
        ("Step 2: Identity Verified", "Aadhaar and land records matched via automated backend check.", True),
        ("Step 3: Deposit at Mandi", "Assigned Express Slot: Lucknow Mandi (Oct 10, Gate 2).", prog_pct >= 50),
        ("Step 4: Quality Check", "Automatic moisture analysis and quality certification.", False),
        ("Step 5: Direct DBT Payment", "Bank transfer credited within 72 hours of gate weighment.", False)
    ]
    
    for s_idx, (stitle, sdesc, s_done) in enumerate(steps):
        sy = 390 + s_idx * 72
        icon = "✔" if s_done else "⏳" if s_idx == 2 else "○"
        icon_col = GREEN if s_done else GOLD if s_idx == 2 else TEXT_MUTED
        box_bg = (30, 48, 36) if s_done else SURFACE2
        draw.rounded_rectangle([260, sy, 1660, sy + 60], radius=12, fill=box_bg, outline=GREEN if s_done else LINE_COLOR)
        draw.text((290, sy + 15), icon, font=font_card_title, fill=icon_col)
        draw.text((330, sy + 15), stitle, font=font_card_title, fill=TEXT_WHITE)
        draw.text((850, sy + 18), sdesc, font=font_card_body, fill=TEXT_MUTED)
        draw.text((1520, sy + 15), "DONE" if s_done else "IN PROGRESS" if s_idx == 2 else "PENDING", font=font_badge, fill=icon_col)

    draw_callout_pills(draw, [("Track Your Process", "green"), ("Clear Status Updates", "gold")], t_local)
    
    if 0.4 <= t_local < 5.0:
        draw_subtitle_bar(draw, "Narrator: On procurement day, Rajesh tracks every stage in real time.")
    elif 5.0 <= t_local < 8.2:
        draw_subtitle_bar(draw, "Farmer: 'Now I can track every step without making repeated visits.'")
    elif 8.2 <= t_local <= 12.0:
        draw_subtitle_bar(draw, "Narrator: Clear milestone tracking provides peace of mind with zero queues.")

def render_scene_7(t, img, draw):
    # ADMIN DASHBOARD & BACKEND SYNCHRONIZATION (60 - 70s)
    t_local = t - 60.0
    draw_header(draw, "Procurement Officer Control Center")
    
    stats = [
        ("Total Tokens", "142", GOLD),
        ("Paid & Completed ✅", "89", GREEN),
        ("In Process ⏳", "45", GOLD),
        ("New Registrations", "8", RED_ACCENT)
    ]
    
    for idx, (lbl, val, col) in enumerate(stats):
        bx = 120 + idx * 420
        draw.rounded_rectangle([bx, 110, bx + 390, 220], radius=18, fill=SURFACE, outline=LINE_COLOR, width=2)
        draw.text((bx + 25, 130), val, font=font_title, fill=col)
        draw.text((bx + 25, 180), lbl, font=font_card_body, fill=TEXT_MUTED)
        
    draw.rounded_rectangle([120, 250, 1800, 600], radius=20, fill=SURFACE, outline=LINE_COLOR, width=2)
    draw.text((160, 275), "📋 Live Procurement Queue — Officer Verification Panel", font=font_head, fill=TEXT_WHITE)
    
    t_headers = ["Token ID", "Farmer Name", "Crop / Quantity", "Assigned Mandi", "Current Step", "Action"]
    tx_pos = [160, 420, 760, 1100, 1400, 1630]
    
    draw.line([140, 320, 1780, 320], fill=LINE_COLOR, width=2)
    for i, h in enumerate(t_headers):
        draw.text((tx_pos[i], 335), h, font=font_badge, fill=TEXT_MUTED)
    draw.line([140, 370, 1780, 370], fill=LINE_COLOR, width=2)
    
    t_rows = [
        ("KM20251004", "Ram Yadav", "Wheat · 45 quintal", "Lucknow Mandi", "Deposit at Mandi (60%)", "▶ Advance Step"),
        ("KM2024001", "Sumitra Devi", "Mustard · 30 quintal", "Jaipur Mandi", "Payment Approved (100%)", "✔ Verified"),
        ("KM2024002", "Mohan Patel", "Paddy · 60 quintal", "Patna Mandi", "Identity Verified (40%)", "▶ Advance Step")
    ]
    
    for r_idx, r in enumerate(t_rows):
        ry = 390 + r_idx * 65
        if r_idx == 0:
            draw.rounded_rectangle([140, ry - 6, 1780, ry + 48], radius=10, fill=(35, 55, 42), outline=GREEN)
            
        draw.text((tx_pos[0], ry), r[0], font=font_card_title, fill=GREEN if r_idx == 0 else GOLD)
        draw.text((tx_pos[1], ry), r[1], font=font_card_title, fill=TEXT_WHITE)
        draw.text((tx_pos[2], ry), r[2], font=font_card_body, fill=TEXT_MUTED)
        draw.text((tx_pos[3], ry), r[3], font=font_card_body, fill=TEXT_WHITE)
        draw.text((tx_pos[4], ry), r[4], font=font_card_body, fill=GOLD if r_idx == 0 else TEXT_MUTED)
        
        btn_col = GREEN if r_idx == 0 else SURFACE2
        draw.rounded_rectangle([tx_pos[5] - 10, ry - 2, tx_pos[5] + 130, ry + 36], radius=12, fill=btn_col)
        draw.text((tx_pos[5] + 5, ry + 5), r[5], font=font_badge, fill=(11, 15, 13) if r_idx == 0 else TEXT_MUTED)

    draw.rounded_rectangle([120, 625, 1800, 780], radius=18, fill=SURFACE2, outline=GREEN, width=2)
    draw.text((150, 645), "⚡ Full-Stack Real-Time Architecture Flow:", font=font_card_title, fill=GOLD)
    
    flow_steps = [
        "1. Farmer Portal",
        "➔",
        "2. Node.js + Express",
        "➔",
        "3. Supabase DB",
        "➔",
        "4. Admin Dashboard",
        "➔",
        "5. Live Sync to Farmer"
    ]
    fx = 150
    for fs_item in flow_steps:
        is_arrow = fs_item == "➔"
        col = GOLD if is_arrow else GREEN if "Farmer" in fs_item else TEXT_WHITE
        f_font = font_title if is_arrow else font_card_title
        draw.text((fx, 700 if not is_arrow else 690), fs_item, font=f_font, fill=col)
        fx += 70 if is_arrow else 220

    draw_callout_pills(draw, [("Digital Processing", "green"), ("Admin Verification", "gold"), ("Backend Synchronization", "green")], t_local)
    
    if 0.4 <= t_local < 5.0:
        draw_subtitle_bar(draw, "Narrator: At the Mandi, officers review the booking in the Admin Dashboard.")
    elif 5.0 <= t_local <= 10.0:
        draw_subtitle_bar(draw, "Narrator: With backend synchronization, updates reflect instantly on farmer screens.")

def render_scene_8(t, img, draw):
    # COMMUNITY PORTAL (70 - 84s)
    t_local = t - 70.0
    draw_header(draw, "Community Marketplace & Discussion")
    
    tabs = ["🌐 All Posts", "🌾 Crop Advisory", "📈 Market Trends", "🚜 Equipment for Hire", "🚚 Transport Logistics"]
    for i, tab in enumerate(tabs):
        tx = 120 + i * 335
        is_active = i == 1
        draw.rounded_rectangle([tx, 110, tx + 315, 165], radius=18, fill=GREEN_DARK if is_active else SURFACE, outline=GREEN if is_active else LINE_COLOR)
        draw.text((tx + 25, 125), tab, font=font_card_title, fill=TEXT_WHITE if is_active else TEXT_MUTED)
        
    draw.rounded_rectangle([120, 190, 1100, 780], radius=24, fill=SURFACE, outline=LINE_COLOR, width=2)
    draw.text((160, 225), "💬 Featured Farmer Discussion", font=font_head, fill=GOLD)
    
    draw.rounded_rectangle([160, 280, 1060, 440], radius=18, fill=SURFACE2, outline=(80, 100, 85), width=2)
    draw.text((190, 305), "👤 Harpreet Singh · Ludhiana · 2 hours ago", font=font_badge, fill=TEXT_MUTED)
    draw.text((190, 340), "“How can I protect my wheat crop during unexpected rain?”", font=font_card_title, fill=TEXT_WHITE)
    draw.text((190, 385), "Category: Crop Advisory · Tag: Weather Preparedness", font=font_card_body, fill=GOLD)
    
    draw.rounded_rectangle([160, 465, 1060, 600], radius=18, fill=(28, 44, 34), outline=GREEN, width=2)
    draw.text((190, 485), "💬 Balwinder (Farmer & FPO Lead) · 45 mins ago", font=font_badge, fill=GREEN)
    draw.text((190, 520), "“Cover tarpaulin is mandatory during transit. Ensure wheat moisture", font=font_card_title, fill=TEXT_WHITE)
    draw.text((190, 555), "remains below 12% before depositing at the APMC gate.”", font=font_card_title, fill=TEXT_WHITE)
    
    draw.rounded_rectangle([160, 625, 1060, 750], radius=18, fill=SURFACE2, outline=LINE_COLOR)
    draw.text((190, 645), "💬 Rameshwar · Jaipur · 10 mins ago", font=font_badge, fill=TEXT_MUTED)
    draw.text((190, 680), "“Checked KisanMitra weather map—rains are clearing by Thursday morning.”", font=font_card_title, fill=TEXT_WHITE)

    draw.rounded_rectangle([1140, 190, 1800, 780], radius=24, fill=SURFACE, outline=LINE_COLOR, width=2)
    draw.text((1180, 225), "🛒 Direct Farmer-to-Farmer Marketplace", font=font_head, fill=GREEN)
    
    listings = [
        ("🟢 SELLING · Crops", "40 quintal tomato — fresh harvest", "Karuppasamy · Coimbatore", "₹1,800 / quintal"),
        ("🚜 HIRE · Equipment", "Tractor with rotavator for hire", "Muthu · Erode", "₹900 / hour"),
        ("🚚 LOGISTICS · Transport", "10-wheel lorry available for mandi trips", "Bala Transport · Salem", "₹35 / km")
    ]
    
    for l_idx, (tag, ltitle, lmeta, lprice) in enumerate(listings):
        ly = 280 + l_idx * 160
        draw.rounded_rectangle([1180, ly, 1760, ly + 140], radius=18, fill=SURFACE2, outline=LINE_COLOR)
        draw.text((1210, ly + 18), tag, font=font_badge, fill=GREEN if "SELLING" in tag else GOLD)
        draw.text((1210, ly + 48), ltitle, font=font_card_title, fill=TEXT_WHITE)
        draw.text((1210, ly + 82), lmeta, font=font_card_body, fill=TEXT_MUTED)
        draw.text((1560, ly + 80), lprice, font=font_card_title, fill=GREEN)

    draw_callout_pills(draw, [("Connect", "green"), ("Ask", "gold"), ("Share", "green"), ("Learn", "gold")], t_local)
    
    if 0.4 <= t_local < 4.8:
        draw_subtitle_bar(draw, "Narrator: The Community Portal connects farmers nationwide for discussions and trade.")
    elif 4.8 <= t_local < 9.0:
        draw_subtitle_bar(draw, "Farmer: 'I can also connect with other farmers, ask questions, and share what I learn.'")
    elif 9.0 <= t_local <= 14.0:
        draw_subtitle_bar(draw, "Narrator: From crop protection to equipment hire, the community empowers every farmer.")

def render_scene_9(t, img, draw):
    # COMPLETION & SHOWCASE OUTRO (84 - 90s)
    t_local = t - 84.0
    
    for y in range(HEIGHT):
        ratio = y / HEIGHT
        r = int(11 * (1-ratio) + 20 * ratio)
        g = int(25 * (1-ratio) + 40 * ratio)
        b = int(18 * (1-ratio) + 25 * ratio)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))
        
    if t_local < 3.0:
        draw_header(draw, "Procurement Completed")
        draw.rounded_rectangle([420, 180, 1500, 720], radius=32, fill=SURFACE, outline=GREEN, width=4)
        draw.text((910, 230), "✅", font=font_huge, fill=GREEN)
        draw.text((680, 330), "Process Completed Successfully!", font=font_title, fill=GREEN)
        draw.text((650, 400), "Token KM20251004 · Ram Yadav · 45 Quintal Wheat", font=font_card_title, fill=TEXT_WHITE)
        draw.text((620, 450), "Payment Approved & Direct DBT Disbursed to Bank Account", font=font_head, fill=GOLD)
        
        draw.rounded_rectangle([600, 530, 1320, 630], radius=20, fill=SURFACE2, outline=GREEN)
        draw.text((650, 565), "🎉 Zero Queues · Zero Middlemen · 100% Digital", font=font_card_title, fill=TEXT_WHITE)
        
        draw_subtitle_bar(draw, "Narrator: The procurement process is completed smoothly with direct bank disbursement.")
    else:
        draw.text((WIDTH//2 - 250, 160), "🌾 KISANMITRA", font=font_huge, fill=GREEN)
        draw.text((WIDTH//2 - 420, 260), "Smart Farming. Easy Booking. Faster Process.", font=font_title, fill=TEXT_WHITE)
        
        draw.rounded_rectangle([250, 360, 1670, 460], radius=24, fill=SURFACE2, outline=GOLD, width=2)
        draw.text((310, 395), "Book  •  Track  •  Check Prices  •  Get Advisory  •  Connect", font=font_title, fill=GOLD)
        
        caps = [
            ("🚜 Smart Token Booking", "Schedule exact mandi slot before leaving home."),
            ("📈 Live AGMARKNET Data", "Real-time market rates and MSP floor protection."),
            ("🔍 End-to-End Tracking", "Full visibility from registration to bank DBT."),
            ("👥 Farmer Community", "Direct marketplace, advisory & mutual assistance.")
        ]
        
        for c_idx, (ctitle, cdesc) in enumerate(caps):
            cx = 250 + (c_idx % 2) * 730
            cy = 500 + (c_idx // 2) * 125
            draw.rounded_rectangle([cx, cy, cx + 690, cy + 105], radius=16, fill=SURFACE, outline=LINE_COLOR)
            draw.text((cx + 25, cy + 18), ctitle, font=font_card_title, fill=GREEN)
            draw.text((cx + 25, cy + 58), cdesc, font=font_card_body, fill=TEXT_MUTED)
            
        draw.text((WIDTH//2 - 380, 770), "Built for India's Farmers · Smart India Hackathon Demonstration", font=font_card_body, fill=TEXT_MUTED)
        
        draw_subtitle_bar(draw, "Farmer: 'With KisanMitra, I can book, track, and stay connected—all from one platform.'")
