"""Rebuild the captioned 4:5 feed still. Argv: <payoff frame png> <output jpg>."""
import os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
SRC, OUT = sys.argv[1], sys.argv[2]

def load_font(size, bold=False):
    for p in ("/System/Library/Fonts/SFNS.ttf",
              "/System/Library/Fonts/Avenir Next.ttc",
              "/System/Library/Fonts/Helvetica.ttc"):
        if os.path.exists(p):
            try:
                f = ImageFont.truetype(p, size)
                if bold and hasattr(f, "set_variation_by_axes"):
                    try: f.set_variation_by_axes([700])
                    except Exception: pass
                return f
            except Exception:
                continue
    return ImageFont.load_default()

def backdrop(W, H, box):
    bg = Image.new("RGB", (W, H), (16, 20, 26))
    glow = Image.new("L", (W // 4, H // 4), 0)
    gd = ImageDraw.Draw(glow)
    cx, cy = W // 8, int(H * 0.30) // 4
    for i in range(30, 0, -1):
        rr = (max(W, H) / 18) * i / 30 * 4
        gd.ellipse([cx - rr * 1.6, cy - rr, cx + rr * 1.6, cy + rr],
                   fill=int(40 * (1 - i / 30) ** 1.5))
    glow = glow.filter(ImageFilter.GaussianBlur(26)).resize((W, H), Image.LANCZOS)
    bg = Image.composite(Image.blend(bg, Image.new("RGB", (W, H), (255, 140, 0)), 0.55), bg, glow)
    x0, y0, x1, y1 = box
    vig = Image.new("L", (W, H), 0)
    ImageDraw.Draw(vig).rounded_rectangle([x0 - 80, y0 - 80, x1 + 80, y1 + 80], radius=130, fill=95)
    vig = vig.filter(ImageFilter.GaussianBlur(75))
    return Image.composite(Image.new("RGB", (W, H), (8, 10, 14)), bg,
                           Image.eval(vig, lambda v: 255 - v))

def rounded(img, radius):
    S = 4
    m = Image.new("L", (img.width * S, img.height * S), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, img.width * S - 1, img.height * S - 1],
                                        radius=radius * S, fill=255)
    out = img.convert("RGBA"); out.putalpha(m.resize(img.size, Image.LANCZOS))
    return out

src = Image.open(SRC).convert("RGB")

# The screen is 1:2.17 — at 4:5 only part of the story fits. Start at the map image's
# own top edge (872) so no text is sliced, and let the month labels go.
CW, CH = 1080, 1350
PLW, PLH, PX, PY = 900, 1080, 90, 44
crop_h = int(1170 * PLH / PLW)                       # 1404 -> 872..2276, keeps every data point
plate = rounded(src.crop((0, 872, 1170, 872 + crop_h)).resize((PLW, PLH), Image.LANCZOS), 32)

feed = backdrop(CW, CH, (PX, PY, PX + PLW, PY + PLH))
feed.paste(plate, (PX, PY), plate)

d = ImageDraw.Draw(feed)
title, sub = load_font(44, bold=True), load_font(29)
base = PY + PLH + 48
d.text((PX + 14, base), "14.2 km loop, run 6 times", font=title, fill=(238, 241, 246))
d.text((PX + 14, base + 56), "Pace trending down. The green line is the whole point.",
       font=sub, fill=(152, 161, 174))
# brand tick, tying the still to the reel's accent
d.rounded_rectangle([PX - 4, base + 6, PX + 2, base + 94], radius=3, fill=(255, 140, 0))

feed.save(OUT, quality=93, subsampling=0)
print("4:5", feed.size, os.path.getsize(OUT) // 1024, "KB")
