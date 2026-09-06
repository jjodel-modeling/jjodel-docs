// Video pill recorder for Tutorial 4 (Working with Jjodie).
// Same machinery as record-tutorial-02.mjs. Needs OPENAI_KEY in the env file next to JJ_EMAIL/JJ_PASS: the recorder
// pastes it into Settings (the field is a password input, so the recording shows dots). Provider answers are
// non-deterministic; the failing script of step 3 (class named like the metamodel) reproduced on every take.
// Expects the ERDLanguage project without a Library metamodel; the recording browser has no documentation stored.
// Usage: see README.md in this folder.
import { chromium } from 'playwright';
import fs from 'fs';
const SP = process.env.PILL_DIR || process.cwd();   // working dir: narration.json and wavs, raw/, shots/
const ENV_FILE = process.env.PILL_ENV || SP + '/.env.jjodel';   // JJ_EMAIL=... JJ_PASS=... OPENAI_KEY=... (never commit)
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
const type = async (loc, text, delay=28) => { await loc.click(); await loc.pressSequentially(text, {delay}); };
const openJjodie = async () => { const m = page.locator('.jodie-minimized'); if (await m.count()) { await m.click(); await sleep(1200); } };
const waitAnswer = async (prevRuns) => { deadStart(); await page.waitForFunction((n)=>document.querySelectorAll('.jodie-messages button').length > n && ![...document.querySelectorAll('.jodie-messages *')].some(e=>/Thinking|Generating/.test(e.textContent) && e.children.length==0), prevRuns, {timeout:120000}).catch(()=>0); await sleep(1500); deadEnd(); };
const closeOverlays = async () => { for (let i=0;i<4;i++){ const b = page.locator('.exec-error-overlay .exec-error-btn--primary'); if (!(await b.count())) break; await b.first().click(); await sleep(900); } };
const runCount = async () => page.locator('.jodie-messages button', {hasText:/^Run$/}).count();

// ---- intro: title card composed afterwards; open the project behind it
startSeg('intro');
await page.goto('https://beta.jjodel.io/#/allProjects', {waitUntil:'commit'}); deadStart();
await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().waitFor({state:'visible', timeout:90000}); await sleep(500);
await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().locator('.gallery-card__name, [class*=name]').first().click().catch(async()=>{ await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().click(); });
await page.locator('.list-card__name', {hasText:/^People$/}).first().waitFor({state:'visible', timeout:90000}); await sleep(1500); await css(); deadEnd();
await endSeg(0.3);

// ---- s1: provider
startSeg('s1');
await openJjodie(); await sleep(800);
await page.locator('.jodie-send-btn').hover(); await sleep(500); await page.locator('.jodie-send-btn').click();
await sleep(1200);
await page.locator(':text-is("Set up")').nth(1).click(); await sleep(1000);
const key = page.locator('input[type=password]:visible').first(); await key.click(); await key.fill(env.OPENAI_KEY); await sleep(600);
await shot('t4j-provider.png');
await page.locator('button:has-text("Test Connection")').click(); deadStart(); await sleep(6000); deadEnd(); await sleep(1500);
await page.keyboard.press('Escape'); await sleep(600);
await endSeg();

// ---- s2: Library metamodel from a sentence
startSeg('s2');
await page.locator('.jodie-close-btn').click().catch(()=>0); await sleep(300);
await page.locator('.psb-new', {hasText:/New metamodel/}).click(); deadStart(); await page.locator('.palette-item').first().waitFor({timeout:60000}); await sleep(1500); await css(); deadEnd();
const mmName = (await page.locator('.tree-row__name').allInnerTexts()).find(t=>/^metamodel_/.test(t));
await page.locator('.tree-row__name', {hasText: new RegExp('^'+mmName+'$')}).first().click(); await sleep(600); if ((await H.panelName())===mmName) await H.setField('Name','Library');
await openJjodie();
const inp = page.locator('.jodie-input');
await type(inp, 'Create a metamodel for a library: a Library that contains Books and Members; a Book has a title, an isbn and a year; a Member has a name and a memberId; a Loan links one Member to one Book and has a dueDate. Use containment where it makes sense.', 18);
await page.locator('.jodie-send-btn').click();
await waitAnswer(0);
await page.locator('.jodie-messages').evaluate(e=>{ e.scrollTop = e.scrollHeight/3; }); await sleep(800);
await shot('t4j-answer.png');
await endSeg();

// ---- s3: run, fail, fix
startSeg('s3');
await page.locator('.jodie-messages button', {hasText:/^Run$/}).first().click(); await sleep(1200);
await page.locator('.jodie-messages button', {hasText:/^Run$/}).first().click(); deadStart(); await page.locator('.exec-error-overlay').waitFor({timeout:120000}).catch(()=>0); await sleep(500); deadEnd(); await sleep(2500);
await shot('t4j-script-error.png');
await closeOverlays();
await page.locator('.jodie-close-btn').click(); await sleep(400);
await page.locator('.tree-row__name', {hasText:/^Library$/}).last().click(); await sleep(700);
if ((await H.panelName())==='Library') await H.setField('Name','Catalogue');
await openJjodie();
await type(inp, "The script stopped at line 22: Cannot create containment/composition in package 'Library'. The metamodel has the same name as the class. I renamed the class to Catalogue; give me only the commands that are still missing.", 18);
await page.locator('.jodie-send-btn').click();
await waitAnswer(await page.locator('.jodie-messages button').count());
await page.locator('.jodie-messages button', {hasText:/^Run$/}).last().click(); await sleep(1000);
await page.locator('.jodie-messages button', {hasText:/^Run$/}).last().click(); deadStart(); await page.locator('.exec-error-overlay').waitFor({timeout:120000}).catch(()=>0); await sleep(300); deadEnd(); await sleep(1200);
await closeOverlays();
await page.locator('.jodie-close-btn').click(); await sleep(400);
await page.locator('[title="Auto layout"]:visible').click(); await sleep(2500);
await shot('t4j-library-metamodel.png');
await page.keyboard.press('Control+S'); await sleep(800);
await endSeg();

// ---- s4: Explain this
startSeg('s4');
await page.locator('.project-name').click(); deadStart(); await sleep(1500);
await page.locator('.list-card__name', {hasText:/^People$/}).first().click({force:true});
await page.locator('.react-flow__node:visible').first().waitFor({timeout:90000}); await sleep(2500); await css(); deadEnd();
const vpText = await page.locator('[title="Select viewpoint"]:visible').innerText().catch(()=>'');
if (!/Chen/.test(vpText)) { await page.locator('[title="Select viewpoint"]:visible').click(); await sleep(600); await page.locator('.toolbar-viewpoint-menu :text("ChenNotation")').click(); await sleep(2000); }
deadStart(); await page.locator('[title="Auto layout"]:visible').click(); await sleep(2500); deadEnd();
await page.locator('.react-flow__node').filter({hasText:/^Person$/}).first().click({button:'right'}); await sleep(1200);
await page.locator(':text-is("Explain this")').first().hover(); await sleep(400); await page.locator(':text-is("Explain this")').first().click();
deadStart(); await page.waitForFunction(()=>{ const t=document.querySelector('.explain-modal-text'); return t && t.textContent.length>300; }, null, {timeout:120000}).catch(()=>0); await sleep(6000); deadEnd(); await sleep(1500);
await shot('t4j-explain.png');
await endSeg();
await page.locator('.explain-modal-close').click(); await sleep(400);

// ---- s5: documentation
startSeg('s5');
await page.locator('.project-name').click(); deadStart(); await sleep(1500); await css(); deadEnd();
const gen = page.locator('button:has-text("Generate")').first(); await gen.scrollIntoViewIfNeeded(); await sleep(600); await gen.click(); deadStart(); await sleep(3500); deadEnd(); await sleep(800);
await page.locator('.provider-btn:visible').first().click(); await sleep(900);
await page.locator('.provider-option', {hasText:/^GPT-4o$/}).first().click(); await sleep(800);
await page.locator('button:has-text("Regenerate")').first().click(); await sleep(1200);
await page.locator('button:has-text("Regenerate")').last().click();
deadStart(); await page.waitForFunction(()=>/Generation Complete/.test(document.body.innerText), null, {timeout:180000}).catch(()=>0); await sleep(800); deadEnd(); await sleep(1500);
await page.locator('.progress-modal-overlay button:has-text("Close")').click(); await sleep(1500);
await shot('t4j-documentation.png');
await endSeg();

// ---- s6: protect a paragraph, regenerate
startSeg('s6');
await page.locator('button[title="Edit documentation"]').click(); await sleep(1500);
await page.evaluate(()=>{ const m = window.monaco.editor.getModels().find(m=>/# ERDLanguage Documentation/.test(m.getValue())); let v = m.getValue(); const marker='### ■ Entity'; const i=v.indexOf(marker); const j=v.indexOf('\n\n', i+marker.length)+2; const para='@protected\nIn this tutorial path an Entity is a concept of the ER notation itself, not of a business domain: Person, Role and Car are entities of the People model.\n@end\n\n'; m.setValue(v.slice(0,j)+para+v.slice(j)); const ed = window.monaco.editor.getEditors().find(e=>e.getModel()===m); if(ed){ const line = v.slice(0,j).split('\n').length; ed.revealLineInCenter(line+1); ed.setPosition({lineNumber: line+1, column: 1}); } });
await sleep(2000);
await shot('t4j-protected-edit.png');
await page.locator('button:has-text("Save")').last().click(); await sleep(1500);
await page.locator('button:has-text("Regenerate")').first().click(); await sleep(1000);
await page.locator('button:has-text("Regenerate")').last().click();
deadStart(); await page.waitForFunction(()=>/Generation Complete/.test(document.body.innerText), null, {timeout:180000}).catch(()=>0); await sleep(500); deadEnd(); await sleep(800);
await page.locator('.progress-modal-overlay button:has-text("Close")').click(); await sleep(1000);
await page.evaluate(()=>{ const el=[...document.querySelectorAll('*')].find(e=>e.children.length==0 && /In this tutorial path an Entity/.test(e.textContent)); if(el) el.scrollIntoView({block:'center'}); }); await sleep(1500);
await shot('t4j-protected-kept.png');
await endSeg();

// ---- outro
startSeg('outro');
await openJjodie(); await sleep(500);
await type(page.locator('.jodie-input'), '/help', 60); await page.locator('.jodie-send-btn').click(); await sleep(2500);
await shot('t4j-help.png');
await endSeg(1.0);
deadStart(); await page.keyboard.press('Control+S'); await sleep(4000); deadEnd();

const total = now();
fs.writeFileSync(SP+'/timeline.json', JSON.stringify({timeline, total, cuts, ffs, editedTotal: enow()}, null, 1));
const vpath = await page.video().path();
await ctx.close(); await b.close();
fs.renameSync(vpath, SP+'/raw/tutorial1.webm');
try { fs.unlinkSync(await p1video.path()); } catch(e){}
console.log('DONE', total.toFixed(1), 's edited', enow().toFixed(1));
