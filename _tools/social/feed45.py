"""Rebuild the 4:5 feed video. Argv: <frosted master> <output>.

The 1170x1462 crop at y=872 exploits the app scrolling itself: before the cut the
frame holds the carousel, title and map; after it, the map and the green pace chart.
"""
import subprocess, sys
SRC, OUT = sys.argv[1], sys.argv[2]

# (start, end, speed) -- only freezedetect-confirmed dead beats accelerate
SEGS = [(6.83,13.00,1.0),(13.00,14.05,1.6),(14.05,15.60,1.0),(15.60,17.20,2.2),(17.20,18.10,1.0)]
dur = sum((e-s)/sp for s,e,sp in SEGS)
n = len(SEGS)

parts = [f"[0:v]crop=1170:1462:0:872,split={n}" + "".join(f"[s{i}]" for i in range(n))]
for i,(s,e,sp) in enumerate(SEGS):
    parts.append(f"[s{i}]trim=start={s}:end={e},setpts=(PTS-STARTPTS)/{sp}[v{i}]")
parts.append("".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[cat]")
parts.append(f"[cat]fps=30,scale=1080:1350:flags=lanczos,format=yuv420p,"
             f"fade=t=in:st=0:d=0.30,fade=t=out:st={dur-0.42:.3f}:d=0.42[vout]")
fg = ";".join(parts)

cmd = ["ffmpeg","-v","error","-y","-i",SRC,
       "-f","lavfi","-t",f"{dur:.3f}","-i","anullsrc=channel_layout=stereo:sample_rate=44100",
       "-filter_complex",fg,"-map","[vout]","-map","1:a",
       "-t",f"{dur:.3f}","-c:v","libx264","-crf","21","-preset","medium",
       "-pix_fmt","yuv420p","-r","30","-c:a","aac","-b:a","96k",
       "-movflags","+faststart",OUT]
print(f"duration {dur:.3f}s")
subprocess.run(cmd, check=True, timeout=300)
