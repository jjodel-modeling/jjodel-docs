// Video pill recorder for Tutorial 2 (Concrete Syntax: Chen Diagrams).
// Same machinery as record-tutorial-03.mjs: synthetic cursor, dead-time cuts, fast-forward intervals for the
// second and third view, title card composed afterwards (compose.py title.png <start of s1>).
// Expects the ERDLanguage project as left by tutorial 1 (metamodel ERD with isKey, model People, no viewpoint).
// Usage: see README.md in this folder.
import { chromium } from 'playwright';
import fs from 'fs';
const SP = process.env.PILL_DIR || process.cwd();   // working dir: narration.json and wavs, raw/, shots/
const ENV_FILE = process.env.PILL_ENV || SP + '/.env.jjodel';   // JJ_EMAIL=... JJ_PASS=... (never commit)
const HELPERS = process.env.PILL_HELPERS || new URL('./helpers.js', import.meta.url).pathname;
const env = Object.fromEntries(fs.readFileSync(ENV_FILE,'utf8').trim().split('\n').map(l=>l.split('=')));
const segs = JSON.parse(fs.readFileSync(SP+'/narration.json','utf8'));
const seg = id => segs.find(s=>s.id===id);
const W=1440, Hh=900;

const CURSOR_INIT = () => { const boot = () => { if(!document.head){ setTimeout(boot, 5); return; }
  const css = document.createElement('style');
  css.textContent = `.donation-banner,.notification-widget,.wm-backdrop,.advanced-mode-tutorial-overlay,.jj-toast-container{display:none!important} .react-flow__minimap{pointer-events:none!important}
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
const ffs = []; let ffFrom = null, ffK = 1;
const ffStart = k => { ffFrom = now(); ffK = k; };
const ffEnd = () => { if (ffFrom===null) return; const to = now(); ffs.push([ffFrom, to, ffK]); deadTotal += (to - ffFrom) * (1 - 1/ffK); ffFrom = null; };
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
helpers = helpers.replace("else { await el.click(); await el.fill(value); }", "else { await el.click(); await sleep(120); await el.pressSequentially(value,{delay:45}); }");
await (new Function('page','sleep','return (async()=>{'+helpers+'})()'))(page, sleep);
const H = globalThis.H;
const renameLiteral = async (enumName, idx, name) => { await H.node(enumName).locator('text=literal_'+idx).click(); for(let k=0;k<20;k++){ if((await H.panelName())==='literal_'+idx) break; await sleep(150);} await H.setField('Name', name); };
const selectMemberByText = async (nodeName, text) => { await H.node(nodeName).locator('.mm-field__name').filter({hasText: new RegExp('^'+text+'$')}).first().click(); for(let k=0;k<20;k++){ if((await H.panelName())===text) break; await sleep(150);} };



fs.mkdirSync(SP+'/shots', {recursive:true});
const shot = async f => { await page.evaluate(()=>{ const c=document.getElementById('__cur'); if(c) c.style.display='none'; }); await sleep(120); await page.screenshot({path: SP+'/shots/'+f}); await page.evaluate(()=>{ const c=document.getElementById('__cur'); if(c) c.style.display=''; }); };
const css = async () => { await page.addStyleTag({content:'.wm-backdrop,.notification-widget,.donation-banner,.advanced-mode-tutorial-overlay,.jj-toast-container{display:none!important} .react-flow__minimap{pointer-events:none!important}'}).catch(()=>0); };
const vp = async name => { await page.locator('[title="Select viewpoint"]:visible').click(); await sleep(700); await page.locator('.toolbar-viewpoint-menu :text("'+name+'")').hover(); await sleep(350); await page.locator('.toolbar-viewpoint-menu :text("'+name+'")').click(); };
const removeCompartment = async () => { await H.vtab('Structure'); const rm = H.vpanel().locator('button[aria-label="Remove"]').filter({visible:true}); while (await rm.count()) { await rm.first().hover(); await sleep(400); await rm.first().click(); await sleep(600); } };
const cardinalityLabel = async () => { const m = page.locator('.symbol-editor-modal'); await m.locator('button:has-text("Add label")').click(); await sleep(700); let sels = m.locator('select'); let n = await sels.count(); await sels.nth(n-2).selectOption({label:'Bottom'}); await sleep(500); await sels.nth(n-1).selectOption({label:'Feature path'}); await sleep(900); sels = m.locator('select'); n = await sels.count(); await sels.nth(n-2).selectOption({label:'cardinality : Cardinality'}); await sleep(700); };
const mkView = async (name, mc, preset, extra) => {
  await H.treeBack(); await H.newView('ChenNotation', name); await H.viewApplyTo(mc); await H.enableIR('Vertex (node)');
  await removeCompartment();
  await H.symbolPreset('DATA (ER)', preset); await H.symbolLabel('Center','name'); if (extra) await extra(); await H.symbolClose(); await sleep(400);
};

// ---- intro: title card (composed afterwards) while the project page loads
startSeg('intro');
await page.goto('https://beta.jjodel.io/#/allProjects', {waitUntil:'commit'}); deadStart();
await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().waitFor({state:'visible', timeout:90000}); await sleep(500);
await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().locator('.gallery-card__name, [class*=name]').first().click().catch(async()=>{ await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().click(); });
await page.locator('.list-card__name', {hasText:/^People$/}).first().waitFor({state:'visible', timeout:90000}); await sleep(1500); await css(); deadEnd();
await endSeg(0.3);

// ---- s1: create the viewpoint
startSeg('s1');
await sleep(800);
await page.locator('.psb-new', {hasText:/New viewpoint/}).hover(); await sleep(400);
await page.locator('.psb-new', {hasText:/New viewpoint/}).click(); await sleep(1200);
const vn = page.locator('#viewpoint-name'); await vn.click(); await vn.pressSequentially('ChenNotation', {delay:55}); await sleep(600);
await shot('t2-new-viewpoint-dialog.png');
await page.locator('button:has-text("Create Viewpoint")').click();
await loadWait(page.locator('.tree-row__name', {hasText:/^ChenNotation$/}).first(), 1500); await css();
await endSeg();

// ---- s2: EntityView, apply to, IR authoring
startSeg('s2');
await H.treeBack(); await H.newView('ChenNotation', 'EntityView'); await sleep(400);
await H.viewApplyTo('ERD.Entity'); await sleep(600);
await page.locator('.view-editor-tab', {hasText:/^IR$/}).click(); await sleep(900);
await shot('t2-ir-authoring.png');
const kind = H.vpanel().locator('select').first(); await kind.selectOption({label:'Vertex (node)'}); await sleep(500);
await page.locator('button:has-text("Enable IR authoring")').click(); await sleep(1800);
await endSeg();

// ---- s3: remove the compartment
startSeg('s3');
await H.vtab('Structure'); await sleep(1200);
await shot('t2-structure-tab.png');
await removeCompartment();
await endSeg();

// ---- s4: symbol and label
startSeg('s4');
await H.symbolPreset('DATA (ER)', 'Entity'); await sleep(800);
await shot('t2-symbol-editor-er-family.png');
await H.symbolLabel('Center','name'); await sleep(800);
await H.symbolClose(); await sleep(400);
await endSeg();

// ---- s5: look at the model
startSeg('s5');
await page.locator('.project-name').click(); deadStart(); await sleep(1500);
await page.locator('.list-card__name', {hasText:/^People$/}).first().click();
await page.locator('[title="Select viewpoint"]:visible').waitFor({state:'visible', timeout:90000}); await sleep(2500); await css(); deadEnd();
await vp('ChenNotation'); await sleep(2500);
await endSeg();

// ---- s6: AttributeView (fast)
startSeg('s6');
await page.locator('.appbar-tab__name', {hasText:/^ERD$/}).click(); deadStart(); await sleep(2500); await css(); deadEnd();
ffStart(3);
await mkView('AttributeView','ERD.Attribute','Attribute');
ffEnd();
await endSeg(0.5);

// ---- s7: RelationshipView with the cardinality label
startSeg('s7');
ffStart(3);
await H.treeBack(); await H.newView('ChenNotation', 'RelationshipView'); await H.viewApplyTo('ERD.Relationship'); await H.enableIR('Vertex (node)');
await removeCompartment();
await H.symbolPreset('DATA (ER)', 'Relationship'); await H.symbolLabel('Center','name');
ffEnd();
await cardinalityLabel(); await sleep(600);
await shot('t2-relationship-labels.png');
await H.symbolClose(); await sleep(300);
await endSeg(0.5);

// ---- outro: the model in Chen notation
startSeg('outro');
await page.locator('.appbar-tab__name', {hasText:/^People$/}).click(); deadStart();
await page.locator('.react-flow__node:visible').first().waitFor({state:'visible', timeout:90000});
await page.waitForFunction(()=>![...document.querySelectorAll('[class*=spinner],[class*=loading],[class*=Spinner]')].some(e=>e.offsetParent && e.getBoundingClientRect().width>0), null, {timeout:90000}).catch(()=>0);
await sleep(1200); await css(); deadEnd();
await sleep(600);
deadStart(); await page.locator('[title="Auto layout"]:visible').click(); await sleep(3000); deadEnd(); await sleep(1000);
await shot('t2-chen-diagram.png');
await endSeg(1.0);
deadStart(); await page.keyboard.press('Control+S'); await sleep(5000); deadEnd();

const total = now();
fs.writeFileSync(SP+'/timeline.json', JSON.stringify({timeline, total, cuts, ffs, editedTotal: enow()}, null, 1));
const vpath = await page.video().path();
await ctx.close(); await b.close();
fs.renameSync(vpath, SP+'/raw/tutorial1.webm');
try { fs.unlinkSync(await p1video.path()); } catch(e){}
console.log('DONE', total.toFixed(1), 's edited', enow().toFixed(1));
