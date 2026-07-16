// Generates src/content/docs/changelog.md from the git history of the docs content.
// Runs as npm prebuild/predev hook. No external dependencies.
//
// Design notes:
// - Commit messages are NOT used (mixed languages, noisy). Each entry lists the
//   pages added, updated, or removed on a given day, with title and link.
// - The output file is gitignored: it is a build artifact, not a source file.
// - The script never fails the build: on any git error it writes a stub page.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = 'src/content/docs';
const OUTPUT = join(ROOT, CONTENT_DIR, 'changelog.md');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(isoDay) {
  const [y, m, d] = isoDay.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function isContentPage(path) {
  if (!path || !path.startsWith(`${CONTENT_DIR}/`)) return false;
  if (!/\.(md|mdx)$/.test(path)) return false;
  if (path === `${CONTENT_DIR}/changelog.md`) return false;
  return true;
}

// src/content/docs/user-guide/console.md -> user-guide/console
// src/content/docs/index.mdx -> '' (site landing)
function toSlug(path) {
  return path
    .slice(CONTENT_DIR.length + 1)
    .replace(/\.(md|mdx)$/, '')
    .replace(/(^|\/)index$/, '');
}

// Relative link from the /changelog/ route.
function toLink(slug) {
  return slug ? `../${slug}/` : '../';
}

function prettify(slug) {
  const last = slug.split('/').pop() || 'Home';
  return last
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const titleCache = new Map();
function pageTitle(path, slug) {
  if (titleCache.has(path)) return titleCache.get(path);
  let title = '';
  const abs = join(ROOT, path);
  if (existsSync(abs)) {
    const head = readFileSync(abs, 'utf8').slice(0, 2000);
    const fm = head.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (fm) {
      const m = fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
      if (m) title = m[1];
    }
  }
  if (!title) title = slug === '' ? 'Home' : prettify(slug);
  titleCache.set(path, title);
  return title;
}

function collectHistory() {
  const raw = execFileSync(
    'git',
    [
      'log',
      '--no-merges',
      '-M',
      '--date=format:%Y-%m-%d',
      '--pretty=format:@%H|%ad',
      '--name-status',
      '--',
      CONTENT_DIR,
    ],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );

  // day -> pagePath -> Set of statuses
  const days = new Map();
  let day = null;
  for (const line of raw.split('\n')) {
    if (line.startsWith('@')) {
      day = line.split('|')[1];
      continue;
    }
    if (!line.trim() || !day) continue;
    const parts = line.split('\t');
    const status = parts[0][0]; // M, A, D, R, C
    let path = parts[1];
    if (status === 'R' || status === 'C') path = parts[2]; // renamed/copied: use new path
    if (!isContentPage(path)) continue;
    if (!days.has(day)) days.set(day, new Map());
    const pages = days.get(day);
    if (!pages.has(path)) pages.set(path, new Set());
    pages.get(path).add(status === 'C' ? 'A' : status);
  }
  return days;
}

function render(days) {
  const out = [];
  out.push('---');
  out.push('title: Docs Changelog');
  out.push('description: Chronological log of documentation changes, generated from the git history of this site.');
  out.push('lastUpdated: false');
  out.push('---');
  out.push('');
  out.push('This page is generated automatically at build time from the git history of the documentation repository. Each entry lists the pages added, updated, or removed on that day. Newest changes first.');
  out.push('');

  const sortedDays = [...days.keys()].sort().reverse();
  for (const day of sortedDays) {
    const pages = days.get(day);
    const added = [];
    const updated = [];
    const removed = [];
    for (const [path, statuses] of pages) {
      const slug = toSlug(path);
      const entry = { title: pageTitle(path, slug), slug, exists: existsSync(join(ROOT, path)) };
      // Priority: a page created that day is "Added" even if also modified later the same day.
      // Paths that no longer exist are shown only when the page was deleted for good;
      // stale paths of later-renamed pages are dropped (their current path tells the story).
      if (statuses.has('D') && !entry.exists) removed.push(entry);
      else if (!entry.exists) continue;
      else if (statuses.has('A')) added.push(entry);
      else updated.push(entry);
    }
    if (!added.length && !updated.length && !removed.length) continue;

    const byTitle = (a, b) => a.title.localeCompare(b.title);
    const link = (e) => (e.exists ? `[${e.title}](${toLink(e.slug)})` : e.title);

    out.push(`## ${formatDate(day)}`);
    out.push('');
    const isGenesis = day === sortedDays[sortedDays.length - 1];
    if (isGenesis && added.length >= 10) {
      out.push(`- **Added:** initial version of the documentation site, ${added.length} pages.`);
    } else if (added.length) {
      out.push(`- **Added:** ${added.sort(byTitle).map(link).join(', ')}`);
    }
    if (updated.length) out.push(`- **Updated:** ${updated.sort(byTitle).map(link).join(', ')}`);
    if (removed.length) out.push(`- **Removed:** ${removed.sort(byTitle).map((e) => e.title).join(', ')}`);
    out.push('');
  }
  return out.join('\n');
}

let content;
try {
  content = render(collectHistory());
} catch (err) {
  console.warn(`[changelog] git history unavailable (${err.message}); writing stub page.`);
  content = [
    '---',
    'title: Docs Changelog',
    'description: Chronological log of documentation changes.',
    'lastUpdated: false',
    '---',
    '',
    'The changelog is generated from the git history at build time. History was not available in this build environment.',
    '',
  ].join('\n');
}

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, content, 'utf8');
console.log(`[changelog] wrote ${OUTPUT}`);
