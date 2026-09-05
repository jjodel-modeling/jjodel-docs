# Video pills

Scripts that record the short videos embedded at the top of the tutorials. Each pill is a headless Chromium session driven by Playwright against beta.jjodel.io: the recorder performs the tutorial steps, records the screen, draws a synthetic cursor (headless video has none), and logs when each narrated segment starts. Narration is synthesized offline with Piper; ffmpeg mixes it in and burns the subtitles.

## Requirements

- Node 22 with `playwright` installed and a Chromium binary (`CHROME` points to it)
- Python 3 with `piper-tts` (`pip install piper-tts`) and a voice, for example `python3 -m piper.download_voices en_GB-cori-high`
- `ffmpeg` and `ffprobe` on the PATH, and the DejaVu Sans font for subtitles
- A Jjodel account. Put the credentials in a file that is never committed:

```
JJ_EMAIL=you@example.org
JJ_PASS=...
```

## Producing a pill

```
mkdir -p work && cp narration/tutorial-01.json work/narration.json
python3 tts.py work voices/en_GB-cori-high.onnx           # WAVs plus durations in narration.json
PILL_DIR=$PWD/work PILL_ENV=$PWD/.env.jjodel CHROME=/path/to/chrome node record-tutorial-01.mjs
python3 compose.py work tutorial-01-er-metamodel.mp4
```

The recorder waits for each narration to finish before moving to the next step, so a longer sentence gives the viewer more time on that step. Waits for the app to load (dashboard, project opening) are logged as dead intervals and `compose.py` cuts them out; segment start times in `timeline.json` are already expressed on the cut timeline. The recorder creates a project named `ERDLanguage` and saves it with Ctrl+S at the end: delete any project with that name first, otherwise the app appends a suffix to the new one.

## Files

- `helpers.js`: Playwright helpers for the metamodel and model editors (drag classifiers, drop members, connect anchors and pick the edge type, set fields, select edges). Selectors follow the 3.0 beta interface and need checking after UI changes.
- `record-tutorial-01.mjs`: the recorder for tutorial 1; copy it for the next pill and change the segments.
- `narration/*.json`: narration segments, one entry per step.
- `tts.py`, `compose.py`: synthesis, cutting and final assembly.
- `poster-tutorial-01.mjs`: renders the title card as the `poster` image of the `<video>` element.

## Known limits

- The proxy of the recording environment may not let Chromium negotiate TLS directly. The recorder routes every request through Playwright's `route.fetch`, which uses Node's network stack, so it works behind such proxies.
