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

For tutorials 2 and 3 the last step takes the title frame and the second at which it fades out (the start of the first narrated step, read from `timeline.json`):

```
node poster-tutorial-03.mjs
python3 compose.py work tutorial-03-data-manager.mp4 title-tutorial-03.png 10.4
```

`REUSE_CUT=1` skips the cutting pass when `work/cut.mp4` is already there, which saves minutes when only the title or the narration changes.

The recorder waits for each narration to finish before moving to the next step, so a longer sentence gives the viewer more time on that step. Waits for the app to load (dashboard, project opening) are logged as dead intervals and `compose.py` cuts them out; segment start times in `timeline.json` are already expressed on the cut timeline. The tutorial 1 recorder creates a project named `ERDLanguage` and saves it with Ctrl+S at the end: delete any project with that name first, otherwise the app appends a suffix to the new one. The tutorial 3 recorder expects that project as left by tutorial 2 (metamodel `ERD`, model `People` with three entities and two relationships, viewpoint `ChenNotation`) and saves the grown model; to record again, restore the model first.

The recording machine matters. On two vCPUs the app renders at about 15 frames per second and every Playwright click costs close to a second, which is why the tutorial 3 recorder uses forced clicks and fast-forward for the repetitive part. A faster machine shortens the raw recording but does not change the edited result, since the segment starts follow the narration.

## Files

- `helpers.js`: Playwright helpers for the metamodel and model editors (drag classifiers, drop members, connect anchors and pick the edge type, set fields, select edges). Selectors follow the 3.0 beta interface and need checking after UI changes.
- `record-tutorial-01.mjs`: the recorder for tutorial 1; copy it for the next pill and change the segments.
- `record-tutorial-02.mjs`: the recorder for tutorial 2 (Chen notation in the View Designer); expects the project as left by tutorial 1, with no viewpoint.
- `record-tutorial-03.mjs`: the recorder for tutorial 3 (Data Manager). It adds fast-forward intervals: `ffStart(k)` / `ffEnd()` around a repetitive stretch make `compose.py` keep one frame in `k`, so the stretch plays `k` times faster while the narration timeline stays aligned. Its title card is added by `compose.py` (see below) because the in-page overlay is lost when the app navigates from the dashboard to a model.
- `narration/*.json`: narration segments, one entry per step.
- `tts.py`, `compose.py`: synthesis, cutting and final assembly.
- `poster-tutorial-01.mjs`, `poster-tutorial-02.mjs`, `poster-tutorial-03.mjs`: render the title card as the `poster` image of the `<video>` element; the tutorial 2 and 3 scripts also write `title-tutorial-0N.png`, the frame that `compose.py` overlays on the first seconds.

## Known limits

- The proxy of the recording environment may not let Chromium negotiate TLS directly. The recorder routes every request through Playwright's `route.fetch`, which uses Node's network stack, so it works behind such proxies.
