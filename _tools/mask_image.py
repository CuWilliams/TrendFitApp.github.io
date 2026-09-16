#!/usr/bin/env python3
"""Frost the Apple Maps tile in a still.

    python3 _tools/mask_image.py images/route-carousel.png /tmp/frosted.png

A palette-mode PNG is written back as one, so a treated tile still drops into the
site at the size the rest of the images/ folder is quantised to.
"""
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mapmask


def main(src, out):
    img = Image.open(src)
    was_palette = img.mode == "P"

    treated, box = mapmask.obscure(img.convert("RGB"))
    if box is None:
        sys.exit(f"no map tile found in {src} — nothing written")

    if was_palette and out.lower().endswith(".png"):
        treated = treated.quantize(colors=256, method=Image.MEDIANCUT,
                                   dither=Image.NONE)
    treated.save(out, optimize=True)
    print(f"{os.path.basename(src)} {img.size} {img.mode} -> tile {box}, "
          f"{os.path.getsize(out) // 1024} KB")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
