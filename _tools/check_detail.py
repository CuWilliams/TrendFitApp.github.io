#!/usr/bin/env python3
"""Verify a frosted take retains no map detail.

    python3 _tools/check_detail.py <original take> <frosted take>

Finds the tile in the ORIGINAL (where it is still detectable) and measures mean
image gradient at the same box in the FROSTED copy. This is deliberately not the
same measurement the mask itself uses: the mask decides where to blur, this asks
whether anything survived.

Two measurements, because the tile has two regimes. The gradient check excludes the
attribution strip, which is re-drawn sharp on purpose. The strip then gets its own
check: every ink pixel there must fall inside the template's footprint, because the
template is the only thing allowed to be sharp. Excluding the strip from *both* is
what let a route line leak into a shipped cut — it was re-drawn crisp, and nothing
was looking at it.

A clean run puts the frosted worst case an order of magnitude under the original,
with zero stray ink.
"""
import subprocess
import sys
import os

import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mapmask
from mask_video import probe

THRESHOLD = 1.5
ATTRIBUTION_ROWS = 90
INK = 140          # a pixel this dark inside the strip is ink, not frosted ground
OUTSIDE = 40       # template alpha at or below this is "not part of a glyph"


def reader(path, frame_bytes):
    p = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE)
    return p, frame_bytes


def is_full_card(box):
    """Only a full card carries the attribution, so only it gets the strip treatment."""
    s = (box[2] - box[0]) / mapmask.TILE_W
    return round((box[3] - box[1]) / s) in mapmask.FULL_CARD


def gradient(frame, box):
    x0, y0, x1, y1 = box
    tile = frame[y0:y1, x0:x1].astype(np.float32).mean(-1)
    if is_full_card(box):
        tile = tile[:-ATTRIBUTION_ROWS]
    return np.abs(np.diff(tile, axis=0)).mean() + np.abs(np.diff(tile, axis=1)).mean()


def stray_ink(frame, box):
    """Ink pixels in the attribution strip that the template does not account for."""
    x0, y0, x1, y1 = box
    s = (x1 - x0) / mapmask.TILE_W
    lx0, ly0, lx1, ly1 = [round(v * s) for v in mapmask.LOGO_OFF]
    strip = frame[y1 + ly0:y1 + ly1, x0 + lx0:x0 + lx1].astype(np.float32).mean(-1)
    tpl = np.asarray(mapmask._template().resize(
        (strip.shape[1], strip.shape[0]), Image.LANCZOS), np.float32)
    # Dilate the footprint by a pixel so LANCZOS ringing at a glyph edge is not a leak.
    grown = np.asarray(Image.fromarray((tpl > OUTSIDE).astype(np.uint8) * 255).filter(
        ImageFilter.MaxFilter(3)), np.float32)
    return int(((strip < INK) & (grown <= OUTSIDE)).sum())


def main(original, frosted):
    w, h, _ = probe(original)
    fb = w * h * 3
    a, _ = reader(original, fb)
    b, _ = reader(frosted, fb)

    n, bad, worst, ref = 0, 0, (0.0, None), []
    ink, ink_worst = 0, (0, None)
    while True:
        ra, rb = a.stdout.read(fb), b.stdout.read(fb)
        if len(ra) < fb or len(rb) < fb:
            break
        fa = np.frombuffer(ra, np.uint8).reshape(h, w, 3)
        box = mapmask.map_bbox(fa)
        if box is not None:
            ref.append(gradient(fa, box))
            fb_ = np.frombuffer(rb, np.uint8).reshape(h, w, 3)
            g = gradient(fb_, box)
            if g > worst[0]:
                worst = (g, (n, box))
            if g > THRESHOLD:
                bad += 1
            if is_full_card(box):
                k = stray_ink(fb_, box)
                if k > ink_worst[0]:
                    ink_worst = (k, n)
                if k:
                    ink += 1
        n += 1
    a.wait()
    b.wait()

    print(f"{n} frames")
    print(f"original mean gradient inside tile: {np.mean(ref):.2f}")
    print(f"frosted worst-frame gradient:       {worst[0]:.3f}  at frame {worst[1]}")
    print(f"frames above {THRESHOLD}:                   {bad}")
    print(f"frames with stray ink in the strip: {ink}  "
          f"(worst {ink_worst[0]} px at frame {ink_worst[1]})")
    return 1 if (bad or ink) else 0


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    sys.exit(main(sys.argv[1], sys.argv[2]))
