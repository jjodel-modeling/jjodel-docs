# Prompt: seed jjodel-docs with the Claude Code settings a launched lane needs

Prompt-ID: P-2026-09-27-0030
Chat: C-2026-09-26-1702
Lane: fast (two files, one commit, no visual check; the first `lane-run` lane outside jjodel-frontend)
Status: eseguito 2026-09-27 · lane docs-harness · single commit

Worktree: `~/jjodel-docs`, branch `docs/2026-09-update`, a fresh session started by `lane-run` from `~/jjodel-release/frontend/scripts/lane-run.mjs`. Before anything else: `pwd` is `/Users/alfonso/jjodel-docs`, branch `docs/2026-09-update`, `git log -1` is the commit that adds this file (subject `docs: add prompt P-2026-09-27-0030, harness seed`), `git status` shows nothing but the three untracked files under `scripts/video-pills/` (a `node_modules` folder and two images, left alone). Otherwise stop with `Outcome: blocked`. Every reply opens with `[P-2026-09-27-0030 · session <id>]` and ends with an `Outcome:` line.

This repository has no `CLAUDE.md`, no hooks and no `.claude/settings.json`: a session launched here runs with the user defaults and nothing stops a `git push`, and on this repository a push to `main` publishes docs.jjodel.io through GitHub Actions. This lane gives the repository the minimum a launched lane needs, and nothing more.

## COSA

Create `.claude/settings.json` with: the model pin `claude-opus-5-5` and `effortLevel` `xhigh` (Alfonso, 2026-09-27: Opus 5.5 is the default for Claude Code, RC-16); `permissions.ask` with `Bash(git push*)` only (under `-p` an `ask` is a refusal, measured in RC-29, so a launched lane can never push; an interactive session is asked); `permissions.deny` with the whole-tree forms of the frontend's list: `Bash(git add .)`, `Bash(git add -A*)`, `Bash(git add --all*)`, `Bash(git add -u*)`, `Bash(git stash)`, `Bash(git stash *)`, `Bash(git reset --hard*)`, `Bash(git clean*)`, `Bash(git checkout -- .)`, `Bash(git checkout HEAD -- .)`, `Bash(git restore .)`, `Bash(git restore --staged .)`, `Bash(* --no-verify*)`, `Bash(rm -rf*)`, `Read(./.env)`, `Read(./.env.*)`; `cleanupPeriodDays` 3650; the `$schema` line of the frontend's file. No hooks: `bash-guard.mjs` depends on `lib.mjs` and on the frontend's docs-versus-code pathspec rule, which does not apply here; a hook layer for this repository is a later decision, not this lane's.

## DOVE

- `.claude/settings.json` (new).
- `docs/claude-code-log.md`: this lane's entry at the head, in the shape of the entries there (`**Prompt**`, `**File toccati**`, `**Esito**`, `**Nome del documento prompt**`, `**Nota**`), in English.
- This prompt file: the Status line.

Nothing else: no `CLAUDE.md`, no hook, no `.gitignore` change, no content page.

## COME

1. Read `/Users/alfonso/jjodel-release/.claude/settings.json` for the exact shape (read only, another tree: do not run git there).
2. Write the file; validate it with `node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))"`.
3. The log entry and the Status line: `eseguito 2026-09-27 · lane docs-harness · single commit` (the chat puts the sha in).
4. One commit, pathspec after `--`, files `.claude/settings.json`, `docs/claude-code-log.md`, `docs/prompts/claude_2026-09-27_0030_prompt_docs_harness_seed.md`, subject `chore(harness): Claude Code settings for launched lanes (P-2026-09-27-0030)`, body naming the pin, the ask and the deny list, `Model:` trailer.
5. Closing report: the sha, the JSON validation line, whether any permission was refused, then `Outcome: done`.

Never: `git push`, `git add .`, `-A`, `-u`, `--no-verify`, a content page, the `scripts/video-pills/` files, any other tree.
