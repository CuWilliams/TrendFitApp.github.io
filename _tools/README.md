# `_tools/` — map obscuring and social cuts

Mac-side scripts that post-process the walkthrough takes. Nothing here is served:
the site has no `_config.yml`, so GitHub Pages runs Jekyll with its defaults, and a
directory whose name starts with `_` is not copied into the built site. If a
`.nojekyll` file or a static-deploy workflow is ever added, that stops being true.

Requires `python3` with `numpy` and `Pillow`, plus `ffmpeg` / `ffprobe` on `PATH`.

## Why this exists

The TrendFitGroup take is recorded from a seeded Simulator, but the routes are the
maintainer's own — so the Apple Maps tile carried real street names, place names and
a route line ending at a residential address. The treatment frosts the tile and
leaves everything else alone.

**48px Gaussian blur, a 0.22 white wash, 0.25 desaturation.** At that radius nothing
survives: no labels, no street grid, not the coastline silhouette. Route outlines,
selector chips and the pace chart are untouched — they carry no location.

The Apple Maps mark is re-drawn over the treated ground from `attribution.png`, a
canonical alpha template, so it stays sharp with no original map pixels beneath it.
That is what keeps Apple's attribution requirement satisfied while the map is gone.

## The scripts

| Script | Does |
|---|---|
| `mapmask.py` | The module. Finds the tile, treats it, restores the Apple mark. |
| `attribution.png` | The Apple Maps wordmark as an alpha template, at reference scale. |
| `derive_attribution.py` | Re-derives that template. Only needed if the app's attribution changes. |
| `mask_video.py` | Frosts every frame of a take. |
| `mask_image.py` | Frosts a still; preserves palette mode. |
| `check_detail.py` | Verifies nothing survived. Run it before shipping. |
| `social/` | The Instagram cuts, derived from an already-frosted master. |

```bash
python3 _tools/mask_video.py <fresh take>.mp4 /tmp/frosted.mp4
python3 _tools/check_detail.py <fresh take>.mp4 /tmp/frosted.mp4
cp /tmp/frosted.mp4 media/trendfitgroup.mp4

python3 _tools/mask_image.py <fresh still>.png /tmp/frosted.png
cp /tmp/frosted.png images/route-carousel.png
```

**Run these on a fresh take from the app repo, never on the file already in
`media/`.** The committed copies are treated; frosting them again double-blurs.
Re-recording is `Tools/Demo/record.sh` and `stills.sh` in `TrendFitApp_App` — see
"Screenshots and videos come from the app repo" in `CLAUDE.md`.

## How the tile is found

Per frame, by a row profile of colour saturation, not by fixed coordinates — the
screen scrolls itself mid-clip (a single-frame cut at 12.98s in the group take), so
the tile sits at two different y positions and moves between them.

Three things about the detector are load-bearing:

- **The saturation threshold is low (0.12).** Apple Maps renders built-up areas in
  near-white, so a "saturated green or blue" test truncates the tile wherever a town
  sits and merges bands wherever it does not. Both failures were observed.
- **A detected run is snapped to the canonical 999×642 geometry, growing from
  *both* edges.** A row of map that is mostly built-up white can fall under the
  coverage threshold; anchoring on that edge leaves a strip unblurred. One frame at
  t=9.28 did exactly that before the rule was added.
- **Constants scale by frame width.** They were measured on the 1170-wide capture;
  `images/route-carousel.png` is a 1206-wide capture of the same layout.

## Why the wordmark is a template, not a per-frame lift

The first pass lifted the glyphs off each tile by the rule "darker than the local
blurred background". A road casing or a route line crossing the box satisfies that
rule exactly as well as glyph ink does, so map geometry got re-drawn **sharp** over
the frosted ground — on 70 of the take's 1028 full-card frames, and visibly in the
shipped reel. Tightening the box (x=182, between the wordmark at 177 and the "Legal"
link at 208) and the ink gate (`lum < 140`) reduced it to a stray tick but never
removed it, because the leaking pixels are inside the wordmark's own footprint.

`attribution.png` is that same lift taken as a **per-pixel median across all 1028
full-card frames**. The wordmark sits in the same place in every one of them and
survives a median; transient map detail does not. Every frame now gets an identical,
map-free wordmark, scaled by tile width.

Re-derive it only if the app's attribution moves or changes size:

```bash
python3 _tools/derive_attribution.py <fresh take>.mp4 _tools/attribution.png
```

## Verifying

`check_detail.py` makes two measurements, because the tile has two regimes. On the
2026-09-15 run over all 1285 frames of `trendfitgroup.mp4`:

```
original mean gradient inside tile: 6.02
frosted worst-frame gradient:       0.245
frames above 1.5:                   0
frames with stray ink in the strip: 0
```

The second measurement exists because the first one cannot see the failure above.
The gradient check **excludes** the attribution strip — that strip is sharp on
purpose — so a leak *into* the strip was invisible to it, and shipped. The strip now
gets its own test: every ink pixel there must fall inside the template's footprint.
Run against the pre-fix master it reports 70 bad frames and exits 1, which is how
the fix was confirmed rather than assumed.

`mask_video.py` also prints a census of detected boxes. Every frame should land on a
999×642 box except one contiguous run of `None` at the head of the clip — frames
0–256, the Welcome screen, which has no map on it yet. A `None` anywhere else is a
missed tile, not a map-free frame.

## `social/`

Instagram cuts, all derived from an **already-frosted** master so the treatment is
applied once. `bg.png` and `mask.png` are the 9:16 backdrop and its rounded-corner
phone mask; `reel.py` needs both.

```bash
python3 _tools/social/reel.py    /tmp/frosted.mp4 /tmp/reel.mp4     # 1080x1920, 13.5s
python3 _tools/social/feed45.py  /tmp/frosted.mp4 /tmp/feed.mp4     # 1080x1350, 10.0s
ffmpeg -ss 13.4 -i /tmp/frosted.mp4 -frames:v 1 -y /tmp/payoff.png
python3 _tools/social/still45.py /tmp/payoff.png  /tmp/feed.jpg     # 1080x1350
```

Instagram's **feed accepts 4:5 through 16:9 only** — a 9:16 upload is rejected
outright, which is why there are two video cuts. The 9:16 belongs on the Reels tab
or a Story. Both carry a silent audio track because a genuinely silent clip gets
throttled; add a real track in Instagram's editor before posting.

Both cuts speed up only the frozen beats — the welcome hold, the "Loading map…"
wait, the two chart dwells. Everything that actually moves plays at 1x.
