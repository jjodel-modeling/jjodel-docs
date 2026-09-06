// Video pill recorder for Tutorial 5 (ER to a relational schema with JjTL).
// Same machinery as record-tutorial-04.mjs, but it runs against a local Jjodel in offline mode
// (http://localhost:3000, JJ_URL to change it): no login page, the project comes from a localStorage
// snapshot. Put the keys exported from a browser where the ERDLanguage project exists (at least
// `offline`, `user` and `projects`) in <PILL_DIR>/storage.json; the recorder seeds them into a fresh
// profile before the first navigation. Expects the project as left by tutorial 4 plus the `Relational`
// metamodel and an empty transformation `ER_to_Relational` (header only, ERD -> Relational), and no
// target model yet. The transformation editor is driven through the Monaco API so that auto-closing
// braces do not garble the typed rules.
// Usage: PILL_DIR=$PWD/work node record-tutorial-05.mjs   (see README.md in this folder)
import { chromium } from 'playwright';
import fs from 'fs';
const SP = process.env.PILL_DIR || process.cwd();
const URL = process.env.JJ_URL || 'http://localhost:3000';
const segs = JSON.parse(fs.readFileSync(SP+'/narration.json','utf8'));
const seg = id => segs.find(s=>s.id===id);
const storage = JSON.parse(fs.readFileSync(SP+'/storage.json','utf8'));
const W=1440, Hh=900;

const CURSOR_INIT = () => { const boot = () => { if(!document.head){ setTimeout(boot, 5); return; }
  const css = document.createElement('style');
  css.textContent = `.donation-banner,.notification-widget,.wm-backdrop,.advanced-mode-tutorial-overlay,.jj-toast-container,[class*=quick-tip],.jodie-minimized{display:none!important} .react-flow__minimap{pointer-events:none!important}
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

const b = await chromium.launch({...(process.env.CHROME ? {executablePath: process.env.CHROME} : {})});
const ctx = await b.newContext({viewport:{width:W,height:Hh}, recordVideo:{dir: SP+'/raw', size:{width:W,height:Hh}}});
await ctx.addInitScript((st) => { try { if (!localStorage.getItem('offline')) { for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v); } } catch (e) {} }, storage);
await ctx.addInitScript(CURSOR_INIT);

const page = await ctx.newPage();
page.on('dialog', d=>d.accept());
const logs = []; const logWaiters = [];
page.on('console', m => { const t = m.text(); logs.push(t); for (const w of logWaiters.splice(0)) { if (w.re.test(t)) w.res(t); else logWaiters.push(w); } });
const waitLog = (re, timeout=60000) => new Promise(res => { const w = {re, res}; logWaiters.push(w); setTimeout(()=>{ const i=logWaiters.indexOf(w); if(i>=0){ logWaiters.splice(i,1); res(null);} }, timeout); });

const t0 = Date.now(); const timeline = []; const cuts = []; let deadTotal = 0;
const now = ()=> (Date.now()-t0)/1000;
const enow = ()=> now() - deadTotal;
let deadFrom = null;
const deadStart = ()=> { deadFrom = now(); };
const deadEnd = ()=> { if (deadFrom===null) return; const to = now(); if (to - deadFrom > 0.3) { cuts.push([deadFrom, to]); deadTotal += to - deadFrom; } deadFrom = null; };
const ffs = [];
const sleep = ms => page.waitForTimeout(ms);
const waitUntil = async t => { const d = t - enow(); if (d>0) await sleep(d*1000); };
let segStart = 0, segEnd = 0;
const startSeg = id => { const s = seg(id); segStart = enow(); segEnd = segStart + s.dur; timeline.push({id, start: segStart, dur: s.dur, text: s.text}); console.log('SEG', id, segStart.toFixed(1), 'real', now().toFixed(1)); };
const endSeg = async (pad=0.8) => { await waitUntil(segEnd + pad); };

fs.mkdirSync(SP+'/shots', {recursive:true});
const shot = async f => { await page.evaluate(()=>{ const c=document.getElementById('__cur'); if(c) c.style.display='none'; }); await sleep(120); await page.screenshot({path: SP+'/shots/'+f}); await page.evaluate(()=>{ const c=document.getElementById('__cur'); if(c) c.style.display=''; }); };
const hideSim = async () => { await page.evaluate(()=>{ for (const e of document.querySelectorAll('button, div')) { if (e.childElementCount<=3 && /^\s*Simulation\s*$/.test(e.textContent||'') && e.getBoundingClientRect().width>0 && e.getBoundingClientRect().width<220) { let t=e; while (t.parentElement && /^\s*Simulation\s*$/.test(t.parentElement.textContent||'')) t=t.parentElement; t.style.display='none'; } } }).catch(()=>0); };
const nodeOf = re => page.locator('.react-flow__node').filter({hasText: re}).first();
const moveTo = async (re, x, y) => { const n = nodeOf(re); const b0 = await n.boundingBox(); if (!b0) return;
  const tries = [[b0.x+b0.width-24, b0.y+14], [b0.x+36, b0.y+b0.height-14], [b0.x+b0.width/2, b0.y+14]];
  for (const [sx, sy] of tries) { await page.mouse.move(sx, sy); await sleep(150); await page.mouse.down(); await page.mouse.move(sx+12, sy+12, {steps:4}); await sleep(80); await page.mouse.move(x+(sx-b0.x)-b0.width/2, y+(sy-b0.y)-14, {steps:14}); await sleep(80); await page.mouse.up(); await sleep(400);
    const b1 = await n.boundingBox(); if (b1 && (Math.abs(b1.x-b0.x)>20 || Math.abs(b1.y-b0.y)>20)) return; }
  console.log('MOVE FAILED', String(re)); };
const arrange = async (rows) => { for (const [re, x, y] of rows) await moveTo(re, x, y); };
const hover = async loc => { await loc.hover(); await sleep(350); };
const click = async loc => { await hover(loc); await loc.click(); };
const card = name => page.locator('.list-card__name', {hasText: new RegExp('^'+name+'$')}).first();
const tab = name => page.locator('.appbar-tab__name', {hasText: new RegExp('^'+name+'$')}).first();
const projectTab = () => page.locator('.project-name').first();
// Types into the transformation editor through the Monaco model, character by character.
const typeCode = async (text, delay=14) => {
  await page.locator('.monaco-editor').first().click({position:{x:300,y:120}});
  await page.evaluate(async ([txt, d]) => { const ed = window.monaco.editor.getEditors()[0]; const m = ed.getModel();
    for (const ch of txt) { const end = m.getFullModelRange().getEndPosition(); ed.executeEdits('rec', [{range: new window.monaco.Range(end.lineNumber, end.column, end.lineNumber, end.column), text: ch}]); const p = m.getFullModelRange().getEndPosition(); ed.setPosition(p); ed.revealPosition(p); await new Promise(r=>setTimeout(r, d)); } }, [text, delay]);
};
const setCode = async text => { await page.evaluate((txt) => { const ed = window.monaco.editor.getEditors()[0]; const m = ed.getModel(); ed.executeEdits('rec', [{range: m.getFullModelRange(), text: txt}]); }, text); };
const execute = async (outputName) => {
  await click(page.locator('.jjtl-toolbar-btn[title^="Execute Transformation"]')); await sleep(1200);
  await page.locator('#source-model').selectOption({label:'People'}); await sleep(700);
  if (outputName) { const inp = page.locator('#output-model-name'); await inp.click({clickCount:3}); await sleep(200); await inp.pressSequentially(outputName, {delay:60}); await sleep(500); }
  return page.locator('.btn-execute');
};
const HEADER = 'transformation ER_to_Relational\n\nfrom ERD\nto   Relational\n';
const RULE1_OPEN = '\nEntity -> Table {\n    name := name\n';
const RULE1_COLUMNS = '\n    -> columns {\n        forall a in ownedAttributes -> Column {\n            name := a.name\n            type := a.type : String=VARCHAR, Integer=INTEGER, Boolean=BOOLEAN\n            isPrimaryKey := a.isKey\n        }\n    }\n';
const RULE2 = '\nRelationship -> ForeignKey {\n    name := name\n    source := left\n    target := right\n}\n';

// ---- intro: title card composed afterwards; open the project behind it
startSeg('intro');
await page.goto(URL+'/#/allProjects', {waitUntil:'commit'}); deadStart();
await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().waitFor({state:'visible', timeout:90000}); await sleep(600);
await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().click();
await card('People').waitFor({state:'visible', timeout:90000}); await sleep(800);
const title = page.locator('.project-header-compact__title'); if (await title.count()) { await title.click(); await sleep(400); const ti = page.locator('input.project-header-compact__title-input').first(); if (await ti.count()) { await ti.fill('ERDLanguage'); await ti.press('Enter'); await sleep(600); } }
const basic = page.locator('.appbar-mode-switch__opt', {hasText:/^Basic$/}); if (await basic.count()) { await basic.click(); await sleep(500); }
await sleep(700); deadEnd();
await endSeg(0.3);

// ---- s1: the Relational metamodel
startSeg('s1');
await click(card('Relational')); deadStart(); await page.locator('.react-flow__node:visible').first().waitFor({timeout:90000}); await sleep(1500); await hideSim(); await sleep(500); deadEnd();
await hover(page.locator('.react-flow__node').filter({hasText:/^Column/}).first());
await sleep(1500);
await shot('t5-relational-metamodel.png');
await endSeg();

// ---- s2: the transformation, first rule, first execution
startSeg('s2');
await click(projectTab()); deadStart(); await card('ER_to_Relational').waitFor({timeout:60000}); await sleep(800); deadEnd();
await click(card('ER_to_Relational')); deadStart(); await page.waitForFunction(()=>window.monaco && window.monaco.editor.getEditors().length>0, null, {timeout:90000}); await sleep(1200); await hideSim(); await sleep(300); deadEnd();
await setCode(HEADER);
await typeCode(RULE1_OPEN + '}\n');
await sleep(600);
await click(page.locator('.jjtl-toolbar-btn[title="Validate Transformation"]')); await sleep(1500);
const go1 = await execute(); await sleep(400);
await shot('t5-execute-dialog.png');
const done1 = waitLog(/Attribute setting complete/);
await click(go1); deadStart(); await done1; await page.waitForFunction(()=>document.querySelectorAll('.react-flow__node').length>=3, null, {timeout:60000}).catch(()=>0); await sleep(1200); await hideSim(); deadEnd();
await sleep(1500);
await endSeg();

// ---- s3: columns
startSeg('s3');
await click(tab('ER_to_Relational')); await sleep(1200);
await setCode(HEADER + RULE1_OPEN);
await typeCode(RULE1_COLUMNS + '}\n');
await sleep(800);
const go2 = await execute();
const done2 = waitLog(/Nested attribute setting complete/);
await click(go2); deadStart(); await done2; await sleep(1500); await hideSim(); deadEnd();
await sleep(800);
await shot('t5-tables.png');
await click(page.locator('[title="Select viewpoint"]:visible').first()); await sleep(700);
await click(page.locator('.toolbar-viewpoint-menu :text("Data manager")').first()); deadStart(); await page.locator('.instance-manager__row').first().waitFor({timeout:30000}).catch(()=>0); await sleep(800); deadEnd();
await click(page.locator('.instance-manager__row', {hasText:/Column/}).first()); await sleep(1800);
await shot('t5-columns.png');
await endSeg();

// ---- s4: foreign keys
startSeg('s4');
await click(tab('ER_to_Relational')); await sleep(1200);
await typeCode(RULE2);
await sleep(600);
const go3 = await execute('PeopleSchema');
const done3 = waitLog(/Nested attribute setting complete/);
await click(go3); deadStart(); await done3; await sleep(1500); await hideSim(); deadEnd();
await arrange([[/^hasRole/, 470, 540], [/^shares/, 800, 540]]); await sleep(600);
const fk = nodeOf(/^hasRole/);
if (await fk.count()) { await click(fk.locator('.mm-node__header').first()); await sleep(1200); }
await shot('t5-foreign-keys.png');
await endSeg();

// ---- s5: trace and output, save
startSeg('s5');
await click(tab('ER_to_Relational')); await sleep(1000); await hideSim(); await sleep(500);
await shot('t5-editor-overview.png');
await click(page.locator('.jjtl-dev-env-bottom-tab', {hasText:/Trace/})); await sleep(1200);
// pull the bottom panel up so that the trace entries fit
{ const bb = await page.locator('.jjtl-dev-env-bottom').boundingBox(); if (bb) { await page.mouse.move(bb.x+bb.width/2, bb.y+1); await sleep(200); await page.mouse.down(); await page.mouse.move(bb.x+bb.width/2, bb.y-250, {steps:12}); await page.mouse.up(); await sleep(800); } }
const first = page.locator('.jjtl-dev-env-bottom').locator('text=/Entity -> Table/').first();
if (await first.count()) { await click(first).catch(()=>0); await sleep(1500); }
await shot('t5-trace.png');
await click(page.locator('.jjtl-dev-env-bottom-tab', {hasText:/Output/})); await sleep(2000);
await shot('t5-output.png');
await endSeg(1.0);
deadStart(); await page.keyboard.press('Control+S'); await sleep(3000); deadEnd();

const total = now();
fs.writeFileSync(SP+'/timeline.json', JSON.stringify({timeline, total, cuts, ffs, editedTotal: enow()}, null, 1));
fs.writeFileSync(SP+'/console.log', logs.join('\n'));
const vpath = await page.video().path();
await ctx.close(); await b.close();
fs.renameSync(vpath, SP+'/raw/tutorial1.webm');
console.log('DONE', total.toFixed(1), 's edited', enow().toFixed(1));
