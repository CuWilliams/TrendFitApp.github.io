#!/usr/bin/env python3
"""Frost the Apple Maps tile in every frame of a walkthrough take.

    python3 _tools/mask_video.py media/trendfitgroup.mp4 /tmp/frosted.mp4

Decodes to raw RGB, runs each frame through mapmask, and re-encodes. The map is a
static snapshot between scrolls, so identical tiles are treated once and reused —
which is what keeps a 1285-frame take to about 90 seconds rather than ten minutes.
"""
import collections
import hashlib
import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mapmask

RADIUS, WASH, DESAT = 48, 0.22, 0.25


def probe(path):
    """Width, height and frame rate of the first video stream."""
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,r_frame_rate",
         "-of", "json", path],
        capture_output=True, text=True, check=True).stdout
    s = json.loads(out)["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    return int(s["width"]), int(s["height"]), float(num) / float(den)


def main(src, out):
    w, h, fps = probe(src)
    frame_bytes = w * h * 3

    dec = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE)
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{w}x{h}", "-r", str(fps), "-i", "-", "-an",
         "-c:v", "libx264", "-profile:v", "high", "-crf", "20", "-preset", "slow",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
        stdin=subprocess.PIPE)

    cache, seen, n = {}, collections.Counter(), 0
    while True:
        raw = dec.stdout.read(frame_bytes)
        if len(raw) < frame_bytes:
            break
        arr = np.frombuffer(raw, np.uint8).reshape(h, w, 3)
        box = mapmask.map_bbox(arr)
        seen[box] += 1
        n += 1
        if box is None:
            enc.stdin.write(raw)
            continue
        x0, y0, x1, y1 = box
        tile = Image.fromarray(arr[y0:y1, x0:x1])
        key = (x1 - x0, y1 - y0, hashlib.blake2b(
            np.asarray(tile.resize((60, 40), Image.BILINEAR)).tobytes(),
            digest_size=16).digest())
        done = cache.get(key)
        if done is None:
            done = np.asarray(mapmask.treat(tile, radius=RADIUS, wash=WASH, desat=DESAT))
            cache[key] = done
        frame = arr.copy()
        frame[y0:y1, x0:x1] = done
        enc.stdin.write(frame.tobytes())

    enc.stdin.close()
    enc.wait()
    dec.wait()

    print(f"{n} frames, {len(cache)} distinct tiles treated")
    for box, count in seen.most_common():
        print(f"  {str(box):34} x{count}")
    # A None run that is not one contiguous block at the head of the clip means the
    # detector missed a tile somewhere — check it before shipping the result.
    if seen[None]:
        print(f"  ({seen[None]} frames carry no map — expected only the opening "
              f"Welcome screen; verify with the checks in README.md)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
