// Screenshot for Tutorial 3 (the grown model in Chen notation) after the ChenNotation restyle.
// Runs against a local Jjodel in offline mode (http://localhost:3000, JJ_URL to change it), seeded from
// <PILL_DIR>/storage.json like shots-tutorial-02.mjs. It applies the restyled views, grows the People
// model through the Data Manager exactly as the tutorial does (Department, Project, Address with their
// attributes, worksIn, leads and livesAt, isKey on the four keys), then renders the result with
// ChenNotation and frames the region the caption describes.
// Nothing is saved: the seeded profile is discarded when the browser closes.
// Usage: PILL_DIR=$PWD/work OUT_DIR=$PWD/work/shots03 node shots-tutorial-03.mjs
import { chromium } from 'playwright';
import fs from 'fs';
const SP = process.env.PILL_DIR || process.cwd();
const JJ_URL = process.env.JJ_URL || 'http://localhost:3000';
const OUT = process.env.OUT_DIR || SP + '/shots';
const storage = JSON.parse(fs.readFileSync(SP + '/storage.json', 'utf8'));
const W = 1440, Hh = 900;

const IR = {
  EntityView: {irVersion:'ir-1.2', kind:'vertex', metaclasses:['Entity'], priority:0, exclusive:true, label:'EntityView',
    shape:{form:'rounded', labels:[{position:'center', source:{from:'intrinsic', prop:'name'}}], border:{color:'#334155', width:0, style:'solid'}, padding:'large', fill:'#dbf7c5'},
    fieldCompartments:[]},
  AttributeView: {irVersion:'ir-1.2', kind:'vertex', metaclasses:['Attribute'], priority:0, exclusive:true, label:'AttributeView',
    shape:{form:'stadium', labels:[{position:'center', source:{from:'intrinsic', prop:'name'}}], border:{color:'#334155', width:0, style:'solid'},
      fill:{when:{op:'eq', left:'$isKey.value', right:{kind:'boolean', value:true}}, then:'#8dccf7', else:'#e5f9ff'}, badges:[{icon:'', position:'tl', visible:false}]},
    fieldCompartments:[], resizable:true},
  RelationshipView: {irVersion:'ir-1.2', kind:'vertex', metaclasses:['Relationship'], priority:0, exclusive:true, label:'RelationshipView',
    shape:{form:'diamond', labels:[{position:'center', source:{from:'intrinsic', prop:'name'}}, {position:'center', source:{from:'path', expr:'$cardinality.value'}}], border:{color:'#334155', width:0, style:'solid'}, padding:'small', fill:'#f2f8c4'},
    fieldCompartments:[], resizable:false},
};
const RENAMES = {id2:'id', name2:'name', id3:'id'};

const b = await chromium.launch({...(process.env.CHROME ? {executablePath: process.env.CHROME} : {})});
const ctx = await b.newContext({viewport:{width:W, height:Hh}});
await ctx.addInitScript((st) => { try { if (!localStorage.getItem('offline')) { for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v); } } catch (e) {} }, storage);
const page = await ctx.newPage();
page.on('dialog', d => d.accept());
const sleep = ms => page.waitForTimeout(ms);
let helpers = fs.readFileSync(new URL('./helpers.js', import.meta.url).pathname.replace(/^\//,'/'), 'utf8').replace("return 'helpers loaded';", '');
await (new Function('page', 'sleep', 'return (async()=>{' + helpers + '})()'))(page, sleep);
const H = globalThis.H;
fs.mkdirSync(OUT, {recursive:true});
const shot = async f => { await sleep(300); await page.screenshot({path: OUT + '/' + f}); console.log('SHOT', f); };
const closeModal = async () => { for (const sel of ['.wm-modal button:has-text("Close")', '.wm-modal [class*=close]', 'button:has-text("Close")']) { const b = page.locator(sel).first(); if (await b.isVisible().catch(()=>false)) { await b.click().catch(()=>0); await sleep(600); return true; } } return false; };
const css = async () => { await page.addStyleTag({content:'.wm-modal,.wm-backdrop,.notification-widget,.donation-banner,.advanced-mode-tutorial-overlay,.jj-toast-container,[class*=quick-tip]{display:none!important} .react-flow__minimap{pointer-events:none!important}'}).catch(()=>0); };
const hideSim = async () => { await page.evaluate(()=>{ for (const e of document.querySelectorAll('button, div')) { if (e.childElementCount<=3 && /^\s*Simulation\s*$/.test(e.textContent||'') && e.getBoundingClientRect().width>0 && e.getBoundingClientRect().width<220) { let t=e; while (t.parentElement && /^\s*Simulation\s*$/.test(t.parentElement.textContent||'')) t=t.parentElement; t.style.display='none'; } } }).catch(()=>0); };
const vp = async name => { await page.locator('[title="Select viewpoint"]:visible').click(); await sleep(700); await page.locator('.toolbar-viewpoint-menu :text("'+name+'")').click(); await sleep(1500); };
const zoomPct = async () => { const t = await page.locator('.toolbar, [class*=toolbar]').first().textContent().catch(()=>''); const m = /(\d+)%/.exec(t || ''); return m ? parseInt(m[1]) : 100; };

// ---- open the project
await page.goto(JJ_URL + '/#/allProjects', {waitUntil:'commit'});
const cardName = page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first();
await cardName.waitFor({state:'visible', timeout:90000}); await sleep(800);
await cardName.locator('.gallery-card__name, [class*=name]').first().click().catch(async()=>{ await cardName.click(); });
await page.locator('.list-card__name', {hasText:/^People$/}).first().waitFor({state:'visible', timeout:90000}); await sleep(1500); await closeModal(); await css();

// ---- restyle the views and give the project its tutorial name (in memory only)
const applied = await page.evaluate(({IR}) => {
  const il = store.getState().idlookup; const out = {views:[]};
  const proj = Object.values(il).find(o=>o&&o.className==='DProject');
  if (proj && proj.name !== 'ERDLanguage') { try { LModelElement.fromPointer(proj.id).name = 'ERDLanguage'; } catch(e) { out.projErr = String(e); } }
  for (const o of Object.values(il)) {
    if (o && o.className === 'DViewElement' && IR[o.name]) { LModelElement.fromPointer(o.id).ir = IR[o.name]; out.views.push(o.name); }
  }
  return out;
}, {IR});
console.log('APPLIED', JSON.stringify(applied));
await sleep(800);

// ---- open the model, then the Data Manager
await page.locator('.list-card__name', {hasText:/^People$/}).first().click();
await page.locator('[title="Select viewpoint"]:visible').waitFor({state:'visible', timeout:90000}); await sleep(2500); await css();
await vp('Data manager'); await sleep(2500); await closeModal(); await css(); await hideSim();
await shot('probe-dm-open.png');

// Data Manager, build 3154: the instance form has its own Basic/Advanced toggle and the ownedAttributes
// section with "Add Attribute" only exists in Advanced, so the helpers of helpers.js stop short here.
const formAdvanced = async () => {
  // the instance form has its own Basic/Advanced toggle, in the lower half of the viewport;
  // the top bar has one too, so pick by position rather than by name
  const btns = page.locator('button:has-text("Advanced")');
  const n = await btns.count();
  for (let i = 0; i < n; i++) { const bb = await btns.nth(i).boundingBox().catch(()=>null);
    if (bb && bb.y > 400) { await btns.nth(i).click().catch(()=>0); await sleep(900); return true; } }
  return false;
};
const mclass = async name => { await page.locator('.instance-manager__row', {hasText: name}).first().click(); await sleep(900); };
const pickRow = async name => { const r = page.locator('table tbody tr').filter({has: page.locator('.instance-manager__td-name', {hasText: new RegExp('^'+name+'$')})}).first();
  await r.locator('td').nth(1).click(); await sleep(1200); return r; };
const addAttr = async (entity, an, at) => {
  // build 3154: with the instance form in Advanced, the containment ownedAttributes sits under the
  // References section and the control reads "add target" (the tutorial text still says "Add Attribute")
  await mclass('Entity'); await pickRow(entity);
  let add = page.locator('button:has-text("Add Attribute"), button:has-text("add target")').first();
  if (!(await add.isVisible().catch(()=>false))) await formAdvanced();
  if (!(await add.isVisible().catch(()=>false))) {
    const refs = page.locator('button:has-text("References")').first();
    if (await refs.isVisible().catch(()=>false)) { await refs.click().catch(()=>0); await sleep(700); }
  }
  add = page.locator('button:has-text("Add Attribute"), button:has-text("add target")').first();
  if (!(await add.isVisible().catch(()=>false))) {
    const low = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent && b.getBoundingClientRect().y>400).map(b=>b.textContent.trim().slice(0,30)).filter(Boolean));
    console.log('NO ADD BUTTON, lower-half buttons:', JSON.stringify(low));
    await page.screenshot({path: OUT + '/probe-no-add.png'});
    throw new Error('Add Attribute not reachable');
  }
  await add.click(); await sleep(1200);
  const dlg = await page.evaluate(()=>{ const d=document.querySelector('.instance-manager__draft, [class*=draft], [role=dialog]');
    return d ? {cls:String(d.className).slice(0,60), text:(d.innerText||'').slice(0,300), fields:[...d.querySelectorAll('input,select')].map(e=>e.id||e.name||e.tagName)} : 'no dialog'; });
  console.log('DIALOG', JSON.stringify(dlg).slice(0,500));
  await H.dm.set('type', at); await H.dm.set('name', an); await H.dm.create();
};
const newEntity = async (name, attrs) => {
  await mclass('Entity');
  await page.locator('button:has-text("New Entity")').click(); await sleep(1000);
  await H.dm.set('name', name); await H.dm.create();
  for (const [an, at] of attrs) await addAttr(name, an, at);
  console.log('ENTITY', name, 'done');
};

// ---- grow the model exactly as the tutorial does, through the maintained Data Manager helpers
await newEntity('Department', [['id','Integer'], ['name','String']]);
await newEntity('Project', [['code','String'], ['title','String'], ['active','Boolean']]);
await newEntity('Address', [['street','String'], ['city','String'], ['zip','String']]);
await mclass('Relationship');
for (const [name, left, right, card] of [['worksIn','Person','Department','ManyToOne'], ['leads','Person','Project','OneToMany'], ['livesAt','Person','Address','OneToOne']]) {
  await page.locator('button:has-text("New Relationship")').click(); await sleep(900);
  await H.dm.set('cardinality', card); await H.dm.set('left', left); await H.dm.set('right', right); await H.dm.set('name', name);
  await H.dm.create();
}
// the keys: the three id rows plus code, set in one multi-edit as the tutorial does
await mclass('Attribute'); await sleep(600);
for (const t of ['id', 'code']) { const rows = page.locator('table tbody tr[title="' + t + '"]'); const n = await rows.count();
  for (let i = 0; i < n; i++) { await rows.nth(i).locator('input[type=checkbox]').click({noWaitAfter:true}); await sleep(250); } }
await sleep(800);
await page.locator('.instance-manager__tri-btn', {hasText:/^on$/}).click(); await sleep(700);
await page.locator('.instance-manager__multi-actions button:has-text("Apply to")').click(); await sleep(1500);
const counts = await page.evaluate(()=>{ const il = store.getState().idlookup;
  const n = c => Object.values(il).filter(o=>o&&o.className==='DObject'&&(il[o.instanceof]||{}).name===c).length;
  return {Entity:n('Entity'), Attribute:n('Attribute'), Relationship:n('Relationship')}; });
console.log('COUNTS', JSON.stringify(counts));
await shot('probe-dm-grown.png');

// ---- rename the tutorial-5 leftovers, then back to the canvas
await page.evaluate(({RENAMES}) => {
  const il = store.getState().idlookup;
  for (const o of Object.values(il)) {
    if (o && o.className === 'DObject' && RENAMES[o.name]) { const target = RENAMES[o.name]; const l = LModelElement.fromPointer(o.id);
      try { l.name = target; } catch(e) {}
      for (const f of (o.features || [])) { const v = il[f]; if (!v || v.className !== 'DValue') continue; const feat = il[v.instanceof];
        if (feat && feat.name === 'name') { try { LModelElement.fromPointer(v.id).values = [target]; } catch(e) {} } } }
  }
}, {RENAMES});
await sleep(800);

await page.locator('.appbar-tab__name', {hasText:/^People$/}).first().click(); await sleep(2500); await css(); await hideSim();
await vp('ChenNotation'); await sleep(2500); await css(); await hideSim();
await page.locator('[title="Hide panel"]:visible').click().catch(()=>0); await sleep(700);
await page.locator('[title="Auto layout"]:visible').click().catch(()=>0); await sleep(3500); await css(); await hideSim();
await page.locator('[title="Fit view"]:visible').click().catch(()=>0); await sleep(1500);
await shot('probe-grown-fit.png');
console.log('ZOOM', await zoomPct());
const nodes = await page.evaluate(()=>[...document.querySelectorAll('.react-flow__node')].map(n=>n.textContent.trim()+'@'+Math.round(n.getBoundingClientRect().x)+','+Math.round(n.getBoundingClientRect().y)));
console.log('NODES', JSON.stringify(nodes));
await ctx.close(); await b.close();
console.log('DONE');
