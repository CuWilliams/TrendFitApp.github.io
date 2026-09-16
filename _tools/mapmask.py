"""Obscure the Apple Maps tile wherever it appears in a TrendFit frame.

The tile is found per frame rather than hard-coded, because the screen scrolls
itself mid-clip (a single-frame cut at 12.983s in the group take). Detection is a
row profile of colour saturation: the map is the only thing in the UI that fills
most of a row with colour, and a low saturation threshold is essential — Apple
Maps renders built-up areas in near-white, so a "saturated green or blue" test
truncates the tile wherever a town sits and merges bands wherever it does not.

Only the vertical position varies; the tile's 996x642 size and x-offset are fixed
by the app's layout, so a detected row run is snapped to that canonical geometry.
That avoids leaving an unblurred rim where anti-aliasing softens the edges.

The Apple attribution is re-drawn over the treated ground from a canonical alpha
template, so it stays crisp with no original map pixels surviving beneath it.
"""
import os

import numpy as np
from PIL import Image, ImageFilter, ImageDraw

# Canonical geometry, measured on the 1170-wide capture. Other captures of the
# same screen (the carousel still is 1206 wide) are the same layout at a different
# scale, so every constant below is multiplied by frame_width / REF_W.
REF_W = 1170
TILE_X0, TILE_X1, TILE_H = 84, 1083, 642
TILE_W = TILE_X1 - TILE_X0
CORNER_R = 24
SAT, ROW_COVER = 0.12, 0.15
FULL_CARD = range(600, 685)

def _sat_mask(a):
    """a: float HxWx3 in 0..1 -> bool mask of pixels carrying real colour."""
    mx = a.max(-1); mn = a.min(-1)
    return np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0) > SAT

def _longest_run(hits, gap=2):
    idx = np.where(hits)[0]
    if len(idx) == 0:
        return None
    runs, start, prev = [], idx[0], idx[0]
    for i in idx[1:]:
        if i - prev > gap + 1:
            runs.append((start, prev)); start = i
        prev = i
    runs.append((start, prev))
    return max(runs, key=lambda r: r[1] - r[0])

def map_bbox(arr):
    """arr: HxWx3 uint8. Returns (x0,y0,x1,y1) of the map tile, or None."""
    H, W = arr.shape[0], arr.shape[1]
    s = W / REF_W
    x0b, x1b, tile_h = round(TILE_X0*s), round(TILE_X1*s), round(TILE_H*s)
    band = arr[:, x0b:x1b].astype(np.float32) / 255.0
    run = _longest_run(_sat_mask(band).mean(axis=1) > ROW_COVER, gap=8)
    if run is None:
        return None
    y0, y1 = int(run[0]), int(run[1]) + 1
    if (y1 - y0) < 120*s:
        return None
    if round((y1 - y0)/s) in FULL_CARD:
        # Grow to the canonical height from BOTH edges, never just the top: a row
        # of map that is mostly built-up white can fall under the coverage
        # threshold, and anchoring on that edge leaves a strip of map unblurred.
        y0, y1 = min(y0, y1 - tile_h), max(y1, y0 + tile_h)
        y0, y1 = max(0, y0), min(H, y1)
    return (x0b, y0, x1b, y1)

# The attribution's offset inside the tile, measured on the 996x642 card. Width 152,
# height 52 — the same size as attribution.png, which is drawn into it.
LOGO_OFF = (30, -76, 182, -24)

# The wordmark is identical in every frame, so it is not lifted per-frame any more:
# a per-frame lift keys on "darker than the local background", and a road casing or a
# route line crossing the box satisfies that just as well as glyph ink does. One did,
# and got re-drawn sharp over the frosted ground. attribution.png is the per-pixel
# median of that lift across all 1028 full-card frames of the original take — the
# glyphs survive a median, transient map detail does not. Re-derive it only from a
# fresh take, with _tools/derive_attribution.py.
_TEMPLATE = None

def _template():
    global _TEMPLATE
    if _TEMPLATE is None:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "attribution.png")
        _TEMPLATE = Image.open(path).convert("L")
    return _TEMPLATE

def _logo_alpha(tile, s=1.0):
    x0, y0, x1, y1 = [round(v*s) for v in LOGO_OFF]
    box = (x0, tile.height + y0, x1, tile.height + y1)
    alpha = _template().resize((box[2] - box[0], box[3] - box[1]), Image.LANCZOS)
    return box, alpha

def _corner_mask(size, s=1.0):
    m = Image.new("L", (size[0]*4, size[1]*4), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0]*4-1, size[1]*4-1],
                                        radius=round(CORNER_R*s)*4, fill=255)
    return m.resize(size, Image.LANCZOS)

def treat(tile, radius=48, wash=0.22, desat=0.25, logo=True):
    s = tile.width / TILE_W
    a = np.asarray(tile.filter(ImageFilter.GaussianBlur(radius*s)), np.float32)
    if wash:  a = a*(1-wash) + 255.0*wash
    if desat: a = a*(1-desat) + a.mean(axis=2, keepdims=True)*desat
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if logo and round(tile.height/s) in FULL_CARD:
        lb, alpha = _logo_alpha(tile, s)
        ink = Image.new("RGB", (lb[2]-lb[0], lb[3]-lb[1]), (58,58,64))
        reg = out.crop(lb); reg.paste(ink, (0,0), alpha); out.paste(reg, lb[:2])
    # Blurring the bounding box would square off the tile's rounded corners.
    out.paste(tile, (0, 0), Image.eval(_corner_mask(tile.size, s), lambda v: 255 - v))
    return out

def obscure(img, **kw):
    """Frost the map tile in a PIL RGB image. Returns (image, bbox_or_None)."""
    box = map_bbox(np.asarray(img))
    if box is None:
        return img, None
    out = img.copy()
    out.paste(treat(img.crop(box), **kw), box[:2])
    return out, box
