#!/usr/bin/env python3
"""Re-derive attribution.png from a fresh take.

    python3 _tools/derive_attribution.py <fresh take>.mp4 _tools/attribution.png

Only needed when the app's attribution changes — a new position, a new size, a
different rendering of the wordmark. The checked-in template covers the current
layout; running this against the same take reproduces it.

The lift below is the *original* per-frame technique: glyph ink is darker than the
local blurred background. On its own it is not safe, because a road casing or a
route line crossing the box is darker than its background too, and one leaked
through into a shipped cut. Taking the per-pixel median across every full-card
frame is what makes it safe — the wordmark is in the same place in all of them,
transient map detail is not.
"""
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mapmask
from mask_video import probe


def lift(tile, s=1.0):
    """The per-frame lift, before the median makes it trustworthy."""
    x0, y0, x1, y1 = [round(v * s) for v in mapmask.LOGO_OFF]
    patch = tile.crop((x0, tile.height + y0, x1, tile.height + y1)).convert("L")
    lum = np.asarray(patch, np.float32)
    bg = np.asarray(patch.filter(ImageFilter.GaussianBlur(14 * s)), np.float32)
    a = np.clip((bg - lum) / 46.0, 0, 1) ** 0.85
    a *= (lum < 140)
    return (a * 255).astype(np.uint8)


def main(src, out):
    w, h, _ = probe(src)
    fb = w * h * 3
    dec = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE)

    stack, n = [], 0
    while True:
        raw = dec.stdout.read(fb)
        if len(raw) < fb:
            break
        arr = np.frombuffer(raw, np.uint8).reshape(h, w, 3)
        box = mapmask.map_bbox(arr)
        if box is not None:
            x0, y0, x1, y1 = box
            tile = Image.fromarray(arr[y0:y1, x0:x1])
            # Reference scale only — resampling a scaled lift would blur the median.
            if tile.width == mapmask.TILE_W and tile.height in mapmask.FULL_CARD:
                stack.append(lift(tile))
        n += 1
    dec.wait()

    if len(stack) < 50:
        sys.exit(f"only {len(stack)} full-card frames at reference scale — too few "
                 f"to median; the median is what removes the map detail")
    med = np.median(np.stack(stack), axis=0).astype(np.uint8)
    Image.fromarray(med).save(out)
    print(f"{n} frames, {len(stack)} full-card tiles -> {out} {med.shape[1]}x{med.shape[0]}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
