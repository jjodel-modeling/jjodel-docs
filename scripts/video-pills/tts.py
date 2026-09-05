"""Synthesize one WAV per narration segment with Piper and store durations back in narration.json.
Usage: python3 tts.py <workdir> <voice.onnx>
  <workdir>/narration.json  list of {id, text}; gets a 'dur' field per segment
"""
import json, subprocess, sys
work, voice = sys.argv[1], sys.argv[2]
segs = json.load(open(f'{work}/narration.json'))
for s in segs:
    subprocess.run(['python3', '-m', 'piper', '-m', voice, '-f', f"{work}/{s['id']}.wav", '--sentence-silence', '0.35'],
                   input=s['text'].encode(), check=True, capture_output=True)
    s['dur'] = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f"{work}/{s['id']}.wav"]))
    print(s['id'], round(s['dur'], 1))
json.dump(segs, open(f'{work}/narration.json', 'w'), indent=1)
print('total', round(sum(s['dur'] for s in segs), 1), 's')
