"""Cut the dead intervals, mix narration onto the recording and burn subtitles.
Usage: python3 compose.py <workdir> <output.mp4>
  needs <workdir>/raw/tutorial1.webm, <workdir>/timeline.json (from the recorder) and the segment WAVs.
  timeline.json carries segment starts in edited time and the list of [from, to] raw intervals to cut.
"""
import json, subprocess, sys
work, out = sys.argv[1], sys.argv[2]
data = json.load(open(f'{work}/timeline.json'))
tl, cuts = data['timeline'], data.get('cuts', [])
def ts(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace('.', ',')
srt, inputs, filt = [], [], []
for i, s in enumerate(tl):
    srt.append(f"{i+1}\n{ts(s['start']+0.3)} --> {ts(s['start']+s['dur']+0.6)}\n{s['text']}\n")
    inputs += ['-i', f"{work}/{s['id']}.wav"]
    filt.append(f"[{i+1}:a]adelay={int(s['start']*1000)}|{int(s['start']*1000)}[a{i+1}]")
open(f'{work}/subs.srt', 'w').write('\n'.join(srt))
n = len(tl)
# 1. constant frame rate intermediate with the dead intervals removed (video only; mixing audio in the
#    same pass makes ffmpeg's filter queue overflow, reported as "No space left on device")
keep = '*'.join(f"(1-between(t,{a:.3f},{b:.3f}))" for a, b in cuts) or '1'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{work}/raw/tutorial1.webm', '-vf', f"fps=30,select='{keep}',setpts=N/(30*TB)",
                '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', f'{work}/cut.mp4'], check=True)
# 2. narration and subtitles on the cut video
style = "FontName=DejaVu Sans,FontSize=7.5,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H90000000,BorderStyle=4,Outline=0,Shadow=0,MarginV=18,MarginL=40,MarginR=40,Alignment=2"
fc = ';'.join(filt) + ';' + ''.join(f'[a{i+1}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:dropout_transition=0,apad[aout]'
cmd = ['ffmpeg', '-v', 'error', '-y', '-i', f'{work}/cut.mp4', *inputs, '-filter_complex', fc, '-map', '0:v', '-map', '[aout]',
       '-vf', f"subtitles={work}/subs.srt:force_style='{style}'",
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30',
       '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', out]
subprocess.run(cmd, check=True)
print('written', out)
