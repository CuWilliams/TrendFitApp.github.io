"""Rebuild the 9:16 Reel. Argv: <source master> <output>."""
import subprocess, os, sys
SP = os.path.dirname(os.path.abspath(__file__))
SRC, OUT = sys.argv[1], sys.argv[2]

# Speed up only the frozen beats (welcome hold, "Loading map...", the two chart
# dwells); every moment that actually moves plays at 1x.
SEGS = [(0.00,3.40,1.9),(3.40,4.30,1.0),(4.30,6.83,3.2),(6.83,13.00,1.0),
        (13.00,14.05,1.6),(14.05,15.60,1.0),(15.60,17.20,2.2),(17.20,18.10,1.0)]
total = sum((b-a)/s for a,b,s in SEGS)
fade_out = round(total - 0.42, 2)

p = ["[0:v]split=%d%s" % (len(SEGS), "".join("[s%d]" % i for i in range(1,9)))]
for i,(a,b,s) in enumerate(SEGS,1):
    p.append("[s%d]trim=%s:%s,setpts=(PTS-STARTPTS)/%s[t%d]" % (i,a,b,s,i))
p.append("".join("[t%d]" % i for i in range(1,9)) + "concat=n=8:v=1[cat]")
p.append("[cat]fps=30,scale=810:1760:flags=lanczos,format=rgba[ph]")
p.append("[2:v]format=gray[mk]")
p.append("[ph][mk]alphamerge[phr]")
p.append("[1:v]format=rgba[bgl]")
p.append("[bgl][phr]overlay=135:80,format=yuv420p,"
         "fade=t=in:st=0:d=0.30,fade=t=out:st=%s:d=0.42[out]" % fade_out)

cmd = ["ffmpeg","-v","error","-y","-i",SRC,
       "-loop","1","-framerate","30","-i",os.path.join(SP,"bg.png"),
       "-loop","1","-framerate","30","-i",os.path.join(SP,"mask.png"),
       "-f","lavfi","-i","anullsrc=r=44100:cl=stereo",
       "-filter_complex",";".join(p),"-map","[out]","-map","3:a",
       "-t","%.2f" % total,
       "-c:v","libx264","-profile:v","high","-pix_fmt","yuv420p","-crf","21",
       "-preset","medium","-c:a","aac","-b:a","96k","-movflags","+faststart",OUT]
print("duration %.2fs" % total)
subprocess.run(cmd, check=True)
print(subprocess.run(["ffprobe","-v","error","-show_entries",
    "format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate",
    "-of","default=noprint_wrappers=1",OUT], capture_output=True, text=True).stdout)
