// Video pill recorder for Tutorial 1 (Your First Language: An ER Metamodel).
// Drives the Jjodel web app in headless Chromium with Playwright, records the screen (webm), draws a
// synthetic cursor, marks loading waits as dead time, and writes timeline.json for compose.py.
// Usage: see README.md in this folder.
import { chromium } from 'playwright';
import fs from 'fs';
const SP = process.env.PILL_DIR || process.cwd();   // working dir: narration.json and wavs, raw/, shots/
const ENV_FILE = process.env.PILL_ENV || SP + '/.env.jjodel';   // JJ_EMAIL=... JJ_PASS=... (never commit)
const HELPERS = process.env.PILL_HELPERS || new URL('./helpers.js', import.meta.url).pathname;
const LOGO = new URL('../../src/assets/jjodel-logo-white.png', import.meta.url).pathname;
const env = Object.fromEntries(fs.readFileSync(ENV_FILE,'utf8').trim().split('\n').map(l=>l.split('=')));
const segs = JSON.parse(fs.readFileSync(SP+'/narration.json','utf8'));
const seg = id => segs.find(s=>s.id===id);
const W=1440, Hh=900;

const CURSOR_INIT = () => { const boot = () => { if(!document.head){ setTimeout(boot, 5); return; }
  const css = document.createElement('style');
  css.textContent = `.donation-banner,.notification-widget,.wm-backdrop,.advanced-mode-tutorial-overlay{display:none!important} .react-flow__minimap{pointer-events:none!important}
  #__cur{position:fixed;left:0;top:0;width:22px;height:30px;z-index:2147483647;pointer-events:none;transform:translate(-2px,-2px);transition:left .0s,top .0s}
  #__cur svg{filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}
  .__ring{position:fixed;width:12px;height:12px;border-radius:50%;border:3px solid #0ea5e9;z-index:2147483646;pointer-events:none;transform:translate(-50%,-50%);animation:__ring .55s ease-out forwards}
  @keyframes __ring{from{opacity:.9;width:12px;height:12px}to{opacity:0;width:46px;height:46px}}`;
  document.head.appendChild(css);
  const c = document.createElement('div'); c.id='__cur'; c.style.cssText='position:fixed;left:0;top:0;width:22px;height:30px;z-index:2147483647;pointer-events:none;transform:translate(-2px,-2px)';
  c.innerHTML = `<svg viewBox="0 0 22 30" width="22" height="30" style="pointer-events:none"><path style="pointer-events:none" d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 17 L20 17 Z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
  const attach = ()=>{ if(document.body && !document.getElementById('__cur')) document.body.appendChild(c); };
  attach(); new MutationObserver(attach).observe(document.documentElement,{childList:true});
  const upd = e => { if(e.clientX===0&&e.clientY===0) return; c.style.left=e.clientX+'px'; c.style.top=e.clientY+'px'; };
  for (const ev of ['mousemove','pointermove','dragover','drag']) window.addEventListener(ev, upd, true);
  window.addEventListener('mousedown', e=>{ const r=document.createElement('div'); r.className='__ring'; r.style.cssText='position:fixed;width:12px;height:12px;border-radius:50%;border:3px solid #0ea5e9;z-index:2147483646;pointer-events:none;transform:translate(-50%,-50%);animation:__ring .55s ease-out forwards'; r.style.left=e.clientX+'px'; r.style.top=e.clientY+'px'; document.body.appendChild(r); setTimeout(()=>r.remove(),700); }, true);
  }; boot();
};

const b = await chromium.launch({executablePath: process.env.CHROME});
const ctx = await b.newContext({viewport:{width:W,height:Hh}, ...(process.env.HTTPS_PROXY ? {proxy:{server: process.env.HTTPS_PROXY}} : {}), ignoreHTTPSErrors:true, recordVideo:{dir: SP+'/raw', size:{width:W,height:Hh}}});
await ctx.route('**/*', async route => { try { const r = await route.fetch(); await route.fulfill({response:r}); } catch(e){ await route.abort(); } });
await ctx.addInitScript(CURSOR_INIT);

// page 1: login (its video is discarded)
const p1 = await ctx.newPage();
await p1.goto('https://beta.jjodel.io', {waitUntil:'load'}); await p1.waitForTimeout(3000);
await p1.fill('input[placeholder="e-mail"]', env.JJ_EMAIL); await p1.fill('input[placeholder="password"]', env.JJ_PASS);
await p1.click('button:has-text("Login")'); await p1.waitForTimeout(8000);

await p1.waitForTimeout(500);
const p1video = p1.video();
await p1.close();

// page 2: the recording
const page = await ctx.newPage(); globalThis.page = page; globalThis.logs=[];
page.on('dialog', d=>d.accept());
const t0 = Date.now(); const timeline = []; const cuts = []; let deadTotal = 0;
const now = ()=> (Date.now()-t0)/1000;                 // real time in the raw recording
const enow = ()=> now() - deadTotal;                    // edited time (dead intervals removed)
let deadFrom = null;
const deadStart = ()=> { deadFrom = now(); };
const deadEnd = ()=> { if (deadFrom===null) return; const to = now(); if (to - deadFrom > 0.3) { cuts.push([deadFrom, to]); deadTotal += to - deadFrom; } deadFrom = null; };
// wait for a locator to be visible while marking the wait as dead time
const loadWait = async (loc, settle=800) => { deadStart(); await loc.waitFor({state:'visible', timeout:90000}); await sleep(settle); deadEnd(); };
const sleep = ms => page.waitForTimeout(ms);
const waitUntil = async t => { const d = t - enow(); if (d>0) await sleep(d*1000); };
let segStart = 0, segEnd = 0;
const startSeg = id => { const s = seg(id); segStart = enow(); segEnd = segStart + s.dur; timeline.push({id, start: segStart, dur: s.dur, text: s.text}); console.log('SEG', id, segStart.toFixed(1), 'real', now().toFixed(1)); };
const endSeg = async (pad=0.8) => { await waitUntil(segEnd + pad); };

// helpers (typing mode)
let helpers = fs.readFileSync(HELPERS,'utf8').replace("return 'helpers loaded';","");
helpers = helpers.replace("await inp.click({clickCount:3}); await inp.fill(value); await inp.press('Enter');", "await inp.click({clickCount:3}); await sleep(150); await inp.pressSequentially(value,{delay:55}); await sleep(200); await inp.press('Enter');");
helpers = helpers.replace("await page.locator('.edge-type-popup__label', {hasText: edgeType}).click();", "await sleep(500); if(globalThis.POPUP_SHOT){ await page.screenshot({path:globalThis.POPUP_SHOT}); globalThis.POPUP_SHOT=null; } await page.locator('.edge-type-popup__label', {hasText: edgeType}).hover(); await sleep(350); await page.locator('.edge-type-popup__label', {hasText: edgeType}).click();");
await (new Function('page','sleep','return (async()=>{'+helpers+'})()'))(page, sleep);
const H = globalThis.H;
const renameLiteral = async (enumName, idx, name) => { await H.node(enumName).locator('text=literal_'+idx).click(); for(let k=0;k<20;k++){ if((await H.panelName())==='literal_'+idx) break; await sleep(150);} await H.setField('Name', name); };
const selectMemberByText = async (nodeName, text) => { await H.node(nodeName).locator('.mm-field__name').filter({hasText: new RegExp('^'+text+'$')}).first().click(); for(let k=0;k<20;k++){ if((await H.panelName())===text) break; await sleep(150);} };

// ---- intro: title card as overlay while the app loads
startSeg('intro');
const TITLE = `<div id="__title" style="position:fixed;inset:0;z-index:2147483600;background:#334155;color:#f8fafc;font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center">
<div style="text-align:center"><img src="data:image/png;base64,${fs.readFileSync(LOGO).toString('base64')}" style="width:260px;margin-bottom:34px" alt="Jjodel"/><div style="font-size:20px;letter-spacing:.2em;color:#7dd3fc;margin-bottom:18px">TUTORIAL 1</div>
<div style="font-size:56px;font-weight:700;line-height:1.15">Your First Language:<br/>An ER Metamodel</div>
<div style="font-size:22px;color:#cbd5e1;margin-top:30px">Seven steps, from an empty project to a complete abstract syntax</div></div></div>`;
await page.setContent(`<html><body style="margin:0">${TITLE}</body></html>`);
await sleep(1500);
await page.goto('https://beta.jjodel.io/#/allProjects', {waitUntil:'commit'});
await page.evaluate((t)=>{ const add=()=>{ if(document.body){ document.body.insertAdjacentHTML('beforeend', t); } else setTimeout(add,5); }; add(); }, TITLE).catch(()=>0);
await page.waitForLoadState('load'); await page.evaluate((t)=>{ if(!document.getElementById('__title')) document.body.insertAdjacentHTML('beforeend', t); }, TITLE);
await sleep(5000);
await endSeg(0.2);
await page.evaluate(()=>{ const t=document.getElementById('__title'); if(t){ t.style.transition='opacity .5s'; t.style.opacity='0'; setTimeout(()=>t.remove(), 550);} }); await sleep(700);

// ---- s1: project + metamodel
startSeg('s1');
await page.locator('button.jj-btn--primary:has-text("New Project")').click(); await sleep(900);
const pn = page.locator('input[placeholder="My Metamodel Project"]'); await pn.click(); await pn.pressSequentially('ERDLanguage', {delay:60}); await sleep(400);
await page.click('button:has-text("Create Project")');
await loadWait(page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first());
await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().locator('.gallery-card__name, [class*=name]').first().click().catch(async()=>{ await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().click(); });
await loadWait(page.locator('button:has-text("Create Your First Metamodel")'));
await page.locator('button:has-text("Create Your First Metamodel")').click();
await loadWait(page.locator('.palette-item').first(), 1200);
await page.locator('.tree-row__name', {hasText:/^metamodel_1$/}).first().click(); await sleep(600);
if ((await H.panelName())==='metamodel_1') await H.setField('Name','ERD');
await sleep(300);
await endSeg();

// ---- s2: NamedElement
startSeg('s2');
await H.addClassifier('Abstract Class', 450, 160, 'NamedElement'); await sleep(400);
await H.dropMember('Attribute','NamedElement'); await sleep(300);
await selectMemberByText('NamedElement','attr_0'); await H.setField('Name','name'); await sleep(300); await H.setMult('[1..1]');
await endSeg();

// ---- s3: Entity + inheritance
startSeg('s3');
await H.addClassifier('Class', 450, 420, 'Entity'); await sleep(400);
globalThis.POPUP_SHOT = SP+'/shots/metamodel-edge-type-menu.png';
await H.connect('Entity','NamedElement','Inheritance','top');
await endSeg();

// ---- s4: Attribute + composition
startSeg('s4');
await H.addClassifier('Class', 770, 420, 'Attribute'); await sleep(300);
await H.connect('Attribute','NamedElement','Inheritance','top'); await sleep(300);
await H.connect('Entity','Attribute','Composition','right'); await sleep(300);
await H.selectNewestEdge(0.5); await H.setField('Name','ownedAttributes');
await endSeg();

// ---- s5: Type enum + type attribute
startSeg('s5');
await H.addClassifier('Enumeration', 560, 640, 'Type'); await sleep(200);
for (let i=0;i<3;i++) await H.dropMember('Literal','Type');
for (const [i,n] of ['String','Integer','Boolean'].entries()) await renameLiteral('Type', i, n);
await H.dropMember('Attribute','Attribute'); await selectMemberByText('Attribute','attr_0'); await H.setField('Name','type'); await H.setMult('[1..1]');
await H.openType(); await sleep(400); await page.locator('[class*=-option]', {hasText:/^Type$/}).click(); await sleep(400);
await endSeg();

// ---- s6: Relationship + left/right
startSeg('s6');
await H.addClassifier('Class', 130, 420, 'Relationship'); await sleep(300);
await H.connect('Relationship','NamedElement','Inheritance','top'); await sleep(300);
await H.connect('Relationship','Entity','Association','right'); await H.selectNewestEdge(0.9); await H.setField('Name','left'); await H.setMult('[1..1]');
await H.connect('Relationship','Entity','Association','right'); await H.selectNewestEdge(0.9); await H.setField('Name','right'); await H.setMult('[1..1]');
await endSeg();

// ---- s7: Cardinality
startSeg('s7');
await H.addClassifier('Enumeration', 330, 640, 'Cardinality'); await sleep(200);
for (let i=0;i<4;i++) await H.dropMember('Literal','Cardinality');
for (const [i,n] of ['OneToOne','OneToMany','ManyToOne','ManyToMany'].entries()) await renameLiteral('Cardinality', i, n);
await H.dropMember('Attribute','Relationship'); await selectMemberByText('Relationship','attr_0'); await H.setField('Name','cardinality'); await H.setMult('[1..1]');
await H.openType(); await sleep(400); await page.locator('[class*=-option]', {hasText:/^Cardinality$/}).click(); await sleep(600);
await page.mouse.click(700, 830); await sleep(500); await page.keyboard.press('Control+S'); await sleep(1500);
await page.screenshot({path: SP+'/shots/video-final-frame.png'});
await endSeg();

// ---- outro
startSeg('outro');
await endSeg(1.0);

const total = now();
fs.writeFileSync(SP+'/timeline.json', JSON.stringify({timeline, total, cuts, editedTotal: enow()}, null, 1));
const vpath = await page.video().path();
await ctx.close(); await b.close();
fs.renameSync(vpath, SP+'/raw/tutorial1.webm');
try { fs.unlinkSync(await p1video.path()); } catch(e){}
console.log('DONE', total.toFixed(1), 's');
