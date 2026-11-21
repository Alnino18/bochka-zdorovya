import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_gradient_canvas(size, is_maskable=False):
    # Create super-sampled image (4x size for crisp antialiasing)
    w = size
    h = size
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Gradient Background
    cx, cy = w / 2, h / 2
    max_r = math.sqrt(w*w + h*h) / 2

    # Draw gradient background
    # Center slightly lighter emerald, corners deep forest emerald
    for y in range(h):
        for x in range(0, w, 4):  # step for speed on super-sampled grid
            dx = (x - cx) / w
            dy = (y - cy) / h
            dist = math.sqrt(dx*dx + dy*dy)
            
            # Color interpolation
            t = min(1.0, dist * 1.2)
            # Center: #0f766e (15, 118, 110)
            # Edge: #022c22 (2, 44, 34)
            r = int(15 * (1 - t) + 2 * t)
            g = int(118 * (1 - t) + 44 * t)
            b = int(110 * (1 - t) + 34 * t)
            draw.rectangle([x, y, x + 4, y + 1], fill=(r, g, b, 255))

    # Corner radius clipping if not maskable
    if not is_maskable:
        mask = Image.new("L", (w, h), 0)
        mask_draw = ImageDraw.Draw(mask)
        corner_r = int(w * 0.22)
        mask_draw.rounded_rectangle([0, 0, w, h], radius=corner_r, fill=255)
        img.putalpha(mask)

    return img

def render_icon_master(size=1024, is_maskable=False):
    img = create_gradient_canvas(size, is_maskable)
    draw = ImageDraw.Draw(img)

    scale = size / 512.0
    cx = size / 2.0
    cy = size / 2.0 + (10 * scale if not is_maskable else 0)

    # Ambient rings
    ring_r = 195 * scale
    draw.ellipse([cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r], outline=(45, 212, 191, 35), width=int(3 * scale))
    ring_inner = 175 * scale
    draw.ellipse([cx - ring_inner, cy - ring_inner, cx + ring_inner, cy + ring_inner], outline=(251, 191, 36, 40), width=int(2 * scale))

    # Draw Cedar Barrel Body
    # Barrel coordinates
    b_w = 170 * scale
    b_h = 220 * scale
    top_y = cy - b_h * 0.45
    bot_y = cy + b_h * 0.48

    # Wood Barrel base polygon/curve approximation
    barrel_points = []
    # Left edge bulging out
    steps = 20
    for i in range(steps + 1):
        t = i / steps
        y = top_y + t * (bot_y - top_y)
        # bulging out at middle
        bulge = math.sin(t * math.pi) * (26 * scale)
        x = cx - (b_w * 0.42 + bulge)
        barrel_points.append((x, y))

    # Bottom curve
    for i in range(steps + 1):
        t = i / steps
        x = (cx - b_w * 0.42) + t * (b_w * 0.84)
        y = bot_y + math.sin(t * math.pi) * (10 * scale)
        barrel_points.append((x, y))

    # Right edge bulging out
    for i in range(steps, -1, -1):
        t = i / steps
        y = top_y + t * (bot_y - top_y)
        bulge = math.sin(t * math.pi) * (26 * scale)
        x = cx + (b_w * 0.42 + bulge)
        barrel_points.append((x, y))

    # Top curve
    for i in range(steps, -1, -1):
        t = i / steps
        x = (cx - b_w * 0.42) + t * (b_w * 0.84)
        y = top_y + math.sin(t * math.pi) * (8 * scale)
        barrel_points.append((x, y))

    # Draw barrel shadow
    shadow_offset = int(14 * scale)
    shadow_points = [(p[0], p[1] + shadow_offset) for p in barrel_points]
    draw.polygon(shadow_points, fill=(1, 27, 21, 140))

    # Fill Barrel with Cedar Wood Tone
    draw.polygon(barrel_points, fill=(180, 83, 9, 255), outline=(69, 26, 3, 255))

    # Vertical Wood Staves (Planks)
    for stave_x_offset in [-b_w * 0.22, 0, b_w * 0.22]:
        stave_pts = []
        for i in range(steps + 1):
            t = i / steps
            y = top_y + t * (bot_y - top_y)
            bulge = math.sin(t * math.pi) * (stave_x_offset * 0.3)
            x = cx + stave_x_offset + bulge
            stave_pts.append((x, y))
        draw.line(stave_pts, fill=(69, 26, 3, 110), width=int(3 * scale))

    # Metallic Gold Hoops (Top and Bottom Bands)
    hoop_thickness = int(14 * scale)
    # Top Hoop
    hoop_top_y = cy - b_h * 0.20
    draw.line([cx - b_w * 0.50, hoop_top_y, cx + b_w * 0.50, hoop_top_y], fill=(251, 191, 36, 255), width=hoop_thickness)
    draw.line([cx - b_w * 0.48, hoop_top_y - hoop_thickness/4, cx + b_w * 0.48, hoop_top_y - hoop_thickness/4], fill=(254, 240, 138, 220), width=int(hoop_thickness/2))

    # Bottom Hoop
    hoop_bot_y = cy + b_h * 0.22
    draw.line([cx - b_w * 0.50, hoop_bot_y, cx + b_w * 0.50, hoop_bot_y], fill=(251, 191, 36, 255), width=hoop_thickness)
    draw.line([cx - b_w * 0.48, hoop_bot_y - hoop_thickness/4, cx + b_w * 0.48, hoop_bot_y - hoop_thickness/4], fill=(254, 240, 138, 220), width=int(hoop_thickness/2))

    # Rim Ellipse on Top
    rim_rx = b_w * 0.45
    rim_ry = 10 * scale
    draw.ellipse([cx - rim_rx, top_y - rim_ry, cx + rim_rx, top_y + rim_ry], fill=(146, 64, 14, 255), outline=(251, 191, 36, 255), width=int(2 * scale))

    # Rising Herbal Steam
    def draw_steam_curve(start_x, start_y, direction=1):
        pts = []
        for i in range(40):
            t = i / 39.0
            y = start_y - t * (85 * scale)
            x = start_x + math.sin(t * 3.5 * math.pi) * (14 * scale * direction)
            pts.append((x, y))
        draw.line(pts, fill=(204, 251, 241, 190), width=int(5 * scale))

    draw_steam_curve(cx, top_y - 2 * scale, 1)
    draw_steam_curve(cx - 30 * scale, top_y, -1)
    draw_steam_curve(cx + 30 * scale, top_y, 1)

    # Green Phyto / Herbal Leaf
    leaf_cx = cx + 8 * scale
    leaf_cy = top_y - 4 * scale
    leaf_pts = [
        (leaf_cx, leaf_cy),
        (leaf_cx + 25 * scale, leaf_cy - 28 * scale),
        (leaf_cx + 55 * scale, leaf_cy - 20 * scale),
        (leaf_cx + 40 * scale, leaf_cy + 10 * scale),
        (leaf_cx + 15 * scale, leaf_cy + 6 * scale)
    ]
    draw.polygon(leaf_pts, fill=(16, 185, 129, 255), outline=(5, 150, 105, 255))
    draw.line([(leaf_cx, leaf_cy), (leaf_cx + 52 * scale, leaf_cy - 18 * scale)], fill=(4, 120, 87, 255), width=int(2 * scale))

    return img

def main():
    out_dir = r"c:\Users\18aln\Downloads\БочкаЗдоровя\public\icons"
    dist_dir = r"c:\Users\18aln\Downloads\БочкаЗдоровя\dist\icons"
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(dist_dir, exist_ok=True)

    print("Generating Master 1024x1024 icons...")
    master_icon = render_icon_master(1024, is_maskable=False)
    master_maskable = render_icon_master(1024, is_maskable=True)

    # Downsample to 512x512
    icon_512 = master_icon.resize((512, 512), Image.Resampling.LANCZOS)
    maskable_512 = master_maskable.resize((512, 512), Image.Resampling.LANCZOS)

    # Downsample to 192x192
    icon_192 = master_icon.resize((192, 192), Image.Resampling.LANCZOS)
    maskable_192 = master_maskable.resize((192, 192), Image.Resampling.LANCZOS)

    # Save to public/icons
    icon_512.save(os.path.join(out_dir, "icon-512.png"), "PNG", optimize=True)
    maskable_512.save(os.path.join(out_dir, "icon-maskable-512.png"), "PNG", optimize=True)
    icon_192.save(os.path.join(out_dir, "icon-192.png"), "PNG", optimize=True)
    maskable_192.save(os.path.join(out_dir, "icon-maskable-192.png"), "PNG", optimize=True)

    # Save to dist/icons as well
    icon_512.save(os.path.join(dist_dir, "icon-512.png"), "PNG", optimize=True)
    maskable_512.save(os.path.join(dist_dir, "icon-maskable-512.png"), "PNG", optimize=True)
    icon_192.save(os.path.join(dist_dir, "icon-192.png"), "PNG", optimize=True)
    maskable_192.save(os.path.join(dist_dir, "icon-maskable-192.png"), "PNG", optimize=True)

    # Generate Favicon (.ico)
    fav_icon = master_icon.resize((64, 64), Image.Resampling.LANCZOS)
    fav_path = r"c:\Users\18aln\Downloads\БочкаЗдоровя\public\favicon.ico"
    dist_fav = r"c:\Users\18aln\Downloads\БочкаЗдоровя\dist\favicon.ico"
    fav_icon.save(fav_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    fav_icon.save(dist_fav, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    print("Successfully generated all modern icons and favicon!")

if __name__ == "__main__":
    main()
