// Video pill recorder for Tutorial 4 (Populating a Model with the Data Manager).
// Same machinery as record-tutorial-01.mjs, plus fast-forward intervals (ffStart/ffEnd) that compose.py
// plays k times faster: the repetitive creations are shown, not skipped, without stretching the pill.
// The title card is composed afterwards (compose.py title.png 10.4): the in-page overlay does not survive
// the navigation from the dashboard to the model, so the first seconds of the raw recording are covered.
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
const vp = async name => { await page.locator('[title="Select viewpoint"]:visible').click(); await sleep(700); await page.locator('.toolbar-viewpoint-menu :text("'+name+'")').hover(); await sleep(350); await page.locator('.toolbar-viewpoint-menu :text("'+name+'")').click(); };
const fclick = async loc => { await loc.click({force:true, noWaitAfter:true}); };
const fset = async (feature, value) => { const el = page.locator('#instance-manager-draft-'+feature); const tag = await el.evaluate(e=>e.tagName); if (tag==='SELECT') await el.selectOption({label:value}); else await el.fill(value); await sleep(120); };
const fcreate = async () => { await fclick(page.locator('.instance-manager__draft-foot button:has-text("Create")')); await sleep(900); };
const fattr = async (entity, an, at) => { await fclick(page.locator('.instance-manager__row', {hasText:'Entity'}).first()); await sleep(500); const r = H.dm.row(entity); await fclick(r.locator('.instance-manager__td-name')); await sleep(500); await fclick(page.locator('button:has-text("Add Attribute")').first()); await sleep(500); await fset('type', at); await fset('name', an); await fcreate(); };
const fentity = async (name, attrs) => { await fclick(page.locator('.instance-manager__row', {hasText:'Entity'}).first()); await sleep(700); await fclick(page.locator('button:has-text("New Entity")')); await sleep(500); await fset('name', name); await fcreate(); for (const [an, at] of attrs) await fattr(name, an, at); };
const newRel = async (name, left, right, card) => { await page.locator('button:has-text("New Relationship")').click(); await sleep(900); await H.dm.set('cardinality', card); await H.dm.set('left', left); await H.dm.set('right', right); await H.dm.set('name', name); await H.dm.create(); };

// ---- intro: title card as overlay while the app loads
startSeg('intro');
const TITLE = `<div id="__title" style="pointer-events:none;position:fixed;inset:0;z-index:2147483600;background:#334155;color:#f8fafc;font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center">
<div style="text-align:center"><img src="data:image/png;base64,${fs.readFileSync(LOGO).toString('base64')}" style="width:260px;margin-bottom:34px" alt="Jjodel"/><div style="font-size:20px;letter-spacing:.2em;color:#7dd3fc;margin-bottom:18px">TUTORIAL 4</div>
<div style="font-size:56px;font-weight:700;line-height:1.15">Populating a Model<br/>with the Data Manager</div>
<div style="font-size:22px;color:#cbd5e1;margin-top:30px">Entities, attributes and relationships from a table, no canvas needed</div></div></div>`;
await page.setContent(`<html><body style="margin:0">${TITLE}</body></html>`);
await sleep(2500); deadStart();
await page.goto('https://beta.jjodel.io/#/allProjects', {waitUntil:'commit'});
await page.evaluate((t)=>{ const add=()=>{ if(document.body){ document.body.insertAdjacentHTML('beforeend', t); } else setTimeout(add,5); }; add(); }, TITLE).catch(()=>0);
await page.waitForLoadState('load'); await page.evaluate((t)=>{ if(!document.getElementById('__title')) document.body.insertAdjacentHTML('beforeend', t); }, TITLE);
// open the project and the model behind the title card
await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().waitFor({state:'visible', timeout:90000}); await sleep(500);
await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().locator('.gallery-card__name, [class*=name]').first().click().catch(async()=>{ await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().click(); });
await page.locator('.list-card__name', {hasText:/^People$/}).first().waitFor({state:'visible', timeout:90000}); await sleep(400);
await page.locator('.list-card__name', {hasText:/^People$/}).first().click();
await page.locator('[title="Select viewpoint"]:visible').waitFor({state:'visible', timeout:90000}); await sleep(1000); deadEnd();
await endSeg(0.2);
await page.evaluate(()=>{ const t=document.getElementById('__title'); if(t){ t.style.transition='opacity .5s'; t.style.opacity='0'; setTimeout(()=>t.remove(), 550);} }); await sleep(700);

// ---- s1: open the Data Manager
startSeg('s1');
await sleep(1500);
await vp('Data manager');
await loadWait(page.locator('.instance-manager__row').first(), 1500);
await waitUntil(segStart + 12.5);
await H.dm.metaclass('Entity'); await sleep(800);
await endSeg();

// ---- s2: New Entity Department
startSeg('s2');
await sleep(600);
await page.locator('button:has-text("New Entity")').click(); await sleep(1200);
await waitUntil(segStart + 6.5);
await H.dm.set('name','Department'); await sleep(400);
await shot('t4-new-entity.png');
await H.dm.create(); await sleep(600);
await endSeg();

// ---- s3: attributes + two more entities
startSeg('s3');
await page.locator('button:has-text("Add Attribute")').first().click(); await sleep(1100);
await waitUntil(segStart + 5.5);
await H.dm.set('type','Integer'); await H.dm.set('name','id'); await shot('t4-new-attribute.png'); await H.dm.create();
await sleep(300); ffStart(8);
await fattr('Department','name','String');
await fentity('Project', [['code','String'],['title','String'],['active','Boolean']]);
await fentity('Address', [['street','String'],['city','String'],['zip','String']]);
await fclick(page.locator('.instance-manager__row', {hasText:'Entity'}).first()); await sleep(1500); ffEnd();
await endSeg(0.5);

// ---- s4: read the Person row
startSeg('s4');
await H.dm.row('Person').locator('.instance-manager__td-name').click(); await sleep(2500);
await page.locator('.instance-manager__table-scroll').evaluate(e=>{ e.style.scrollBehavior='smooth'; e.scrollTop = e.scrollHeight; }); await sleep(2000);
await shot('t4-entity-table.png');
await endSeg();

// ---- s5: relationships
startSeg('s5');
await H.dm.metaclass('Relationship'); await sleep(500);
await page.locator('button:has-text("New Relationship")').click(); await sleep(900); await H.dm.set('cardinality','ManyToOne'); await H.dm.set('left','Person'); await H.dm.set('right','Department'); await H.dm.set('name','worksIn'); await sleep(300);
ffStart(6); await H.dm.create();
await newRel('leads','Person','Project','OneToMany');
await newRel('livesAt','Person','Address','OneToOne');
await sleep(500); ffEnd();
await endSeg(0.5);

// ---- s6: multi-edit isKey
startSeg('s6');
await H.dm.metaclass('Attribute'); await sleep(600); ffStart(2);
for (const t of ['id','code']) { const rows = page.locator('table tbody tr[title="'+t+'"]'); const n = await rows.count(); for (let i=0;i<n;i++){ await rows.nth(i).locator('input[type=checkbox]').click({noWaitAfter:true}); await sleep(250); } }
await sleep(800); ffEnd();
await waitUntil(segStart + 8.5);
await page.locator('.instance-manager__tri-btn', {hasText:/^on$/}).click(); await sleep(700);
await shot('t4-multi-edit.png');
await page.locator('.instance-manager__multi-actions button:has-text("Apply to")').click(); await sleep(1200);
await endSeg();

// ---- s7: delete preview
startSeg('s7');
await H.dm.metaclass('Entity'); await sleep(500);
await H.dm.row('Address').hover(); await sleep(700);
await H.dm.row('Address').locator('.instance-manager__trash').click(); await sleep(1200);
await shot('t4-delete-dialog.png');
await waitUntil(segStart + 10.5);
await page.locator('.instance-manager__del-foot button:has-text("Cancel")').click(); await sleep(500);
await endSeg();

// ---- outro: save, back to the canvas
startSeg('outro');
await page.keyboard.press('Control+S'); await sleep(1200);
deadStart();
await page.locator('.appbar-tab__name', {hasText:/^People$/}).click(); await sleep(2500);
await page.addStyleTag({content:'.react-flow__minimap{pointer-events:none!important}'}).catch(()=>0);
const vpText = await page.locator('[title="Select viewpoint"]:visible').innerText().catch(()=>'');
deadEnd();
if (!/Chen/.test(vpText)) await vp('ChenNotation');
await sleep(600);
deadStart(); await page.locator('[title="Auto layout"]:visible').click(); await sleep(2500); deadEnd(); await sleep(1000);
await shot('t4-chen-grown.png');
await page.keyboard.press('Control+S'); await sleep(1500);
await endSeg(1.0);

const total = now();
fs.writeFileSync(SP+'/timeline.json', JSON.stringify({timeline, total, cuts, ffs, editedTotal: enow()}, null, 1));
const vpath = await page.video().path();
await ctx.close(); await b.close();
fs.renameSync(vpath, SP+'/raw/tutorial1.webm');
try { fs.unlinkSync(await p1video.path()); } catch(e){}
console.log('DONE', total.toFixed(1), 's edited', enow().toFixed(1));
