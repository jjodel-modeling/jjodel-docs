// Screenshots for Tutorial 2 after the ChenNotation restyle (rounded entities, stadium attributes,
// diamond relationships with both labels centered, fills instead of borders).
// Runs against a local Jjodel in offline mode (http://localhost:3000, JJ_URL to change it), seeded from
// <PILL_DIR>/storage.json like record-tutorial-05.mjs. The three views of ChenNotation are rewritten in
// place through the LModelElement proxy so that the offline copy matches the viewpoint on beta, and the
// attributes renamed for tutorial 5 (id2, name2, id3) get their tutorial names back for the pictures.
// Nothing is saved: the seeded profile is discarded when the browser closes.
// Usage: PILL_DIR=$PWD/work node shots-tutorial-02.mjs
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
let helpers = fs.readFileSync(new URL('./helpers.js', import.meta.url).pathname, 'utf8').replace("return 'helpers loaded';", '');
await (new Function('page', 'sleep', 'return (async()=>{' + helpers + '})()'))(page, sleep);
const H = globalThis.H;
fs.mkdirSync(OUT, {recursive:true});
const shot = async f => { await sleep(300); await page.screenshot({path: OUT + '/' + f}); console.log('SHOT', f); };
const css = async () => { await page.addStyleTag({content:'.wm-backdrop,.notification-widget,.donation-banner,.advanced-mode-tutorial-overlay,.jj-toast-container,[class*=quick-tip]{display:none!important} .react-flow__minimap{pointer-events:none!important}'}).catch(()=>0); };
const hideSim = async () => { await page.evaluate(()=>{ for (const e of document.querySelectorAll('button, div')) { if (e.childElementCount<=3 && /^\s*Simulation\s*$/.test(e.textContent||'') && e.getBoundingClientRect().width>0 && e.getBoundingClientRect().width<220) { let t=e; while (t.parentElement && /^\s*Simulation\s*$/.test(t.parentElement.textContent||'')) t=t.parentElement; t.style.display='none'; } } }).catch(()=>0); };
const vp = async name => { await page.locator('[title="Select viewpoint"]:visible').click(); await sleep(700); await page.locator('.toolbar-viewpoint-menu :text("'+name+'")').click(); await sleep(1500); };
const mode = async name => { const t = page.locator('button, [role=tab], span', {hasText: new RegExp('^'+name+'$')}).filter({visible:true}).first(); await t.click(); await sleep(900); await css(); };
const nodeOf = re => page.locator('.react-flow__node').filter({hasText: re}).first();
const moveTo = async (re, x, y) => { const n = nodeOf(re); const b0 = await n.boundingBox(); if (!b0) { console.log('NO NODE', String(re)); return; }
  const tries = [[b0.x+b0.width/2, b0.y+8], [b0.x+8, b0.y+b0.height/2], [b0.x+b0.width-8, b0.y+b0.height-8]];
  for (const [sx, sy] of tries) { await page.mouse.move(sx, sy); await sleep(120); await page.mouse.down(); await page.mouse.move(sx+10, sy+10, {steps:4}); await page.mouse.move(x+(sx-b0.x), y+(sy-b0.y), {steps:14}); await sleep(80); await page.mouse.up(); await sleep(350);
    const b1 = await n.boundingBox(); if (b1 && (Math.abs(b1.x-b0.x)>15 || Math.abs(b1.y-b0.y)>15)) return; }
  console.log('MOVE FAILED', String(re)); };

// ---- open the project
await page.goto(JJ_URL + '/#/allProjects', {waitUntil:'commit'});
const cardName = page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first();
await cardName.waitFor({state:'visible', timeout:90000}); await sleep(800);
await cardName.locator('.gallery-card__name, [class*=name]').first().click().catch(async()=>{ await cardName.click(); });
await page.locator('.list-card__name', {hasText:/^People$/}).first().waitFor({state:'visible', timeout:90000}); await sleep(1500); await css();

// ---- restyle the views, restore the attribute names, lay the Chen diagram out (in memory only)
// Store coordinates: the canvas at 100% renders a vertex at twice its stored x/y and at its stored w/h.
const POS = {hasRole:[125,15,180,90], shares:[300,15,180,90], Role:[15,125,200,44], Person:[160,125,200,44], Car:[305,125,200,44],
  id2:[15,205,105,44], name2:[75,205,105,44], age:[150,205,105,44], surname:[210,205,105,44], name:[270,205,105,44], id3:[310,205,105,44], manufacturer:[370,205,105,44]};
const applied = await page.evaluate(({IR, RENAMES, POS}) => {
  const s = store.getState(); const il = s.idlookup; const out = {views:[], renamed:[], moved:[]};
  const people = Object.values(il).find(o=>o&&o.className==='DModel'&&o.name==='People');
  const chen = Object.values(il).find(o=>o&&o.className==='DViewPoint'&&o.name==='ChenNotation');
  const proj = Object.values(il).find(o=>o&&o.className==='DProject');
  if (proj && proj.name !== 'ERDLanguage') { try { LModelElement.fromPointer(proj.id).name = 'ERDLanguage'; } catch(e) { out.projErr = String(e); } }
  for (const o of Object.values(il)) {
    if (!o) continue;
    if (o.className === 'DViewElement' && IR[o.name]) { LModelElement.fromPointer(o.id).ir = IR[o.name]; out.views.push(o.name); }
  }
  localStorage.setItem('jjodel.viewport.' + people.id + '.' + chen.id, JSON.stringify({x:20, y:40, zoom:1}));
  out.vpKey = 'jjodel.viewport.' + people.id + '.' + chen.id;
  return out;
}, {IR, RENAMES, POS});
console.log('APPLIED', JSON.stringify(applied));
await sleep(1000);

// ---- the model in Chen notation (Basic mode)
await page.locator('.list-card__name', {hasText:/^People$/}).first().click();
await page.locator('[title="Select viewpoint"]:visible').waitFor({state:'visible', timeout:90000}); await sleep(2500); await css();
await page.locator('[title^="Basic"]').click().catch(()=>0); await sleep(800); await css();
await vp('ChenNotation'); await sleep(2500); await hideSim();
await page.locator('[title="Reset zoom to 100%"]:visible').click().catch(()=>0); await sleep(1200);
// positions and names go in after the viewpoint is active: opening a viewpoint runs its own layout first
const placed = await page.evaluate(({RENAMES, POS}) => {
  const il = store.getState().idlookup; const out = {moved:[], renamed:[]};
  const people = Object.values(il).find(o=>o&&o.className==='DModel'&&o.name==='People');
  for (const o of Object.values(il)) {
    if (o && o.className === 'DVertex' && o.graph === people.id + '_graph5') { const obj = il[o.model]; const p = obj && POS[obj.name]; if (p) { const l = LModelElement.fromPointer(o.id); l.x = p[0]; l.y = p[1]; l.w = p[2]; l.h = p[3]; out.moved.push(obj.name); } }
  }
  for (const o of Object.values(il)) {
    if (o && o.className === 'DObject' && RENAMES[o.name]) { const target = RENAMES[o.name]; const before = o.name; const l = LModelElement.fromPointer(o.id); try { l.name = target; } catch(e) {}
      // the ER metamodel also has NamedElement.name as a feature: align its value too
      const vals = (o.features||[]).map(f=>il[f]).filter(v=>v&&v.className==='DValue');
      const info = vals.map(v=>({id:v.id, inst:v.instanceof, values:v.values}));
      for (const v of vals) { const feat = il[v.instanceof]; if (feat && feat.name === 'name') { try { LModelElement.fromPointer(v.id).values = [target]; } catch(e) { out.renamed.push('valERR ' + String(e).slice(0,80)); } } }
      out.renamed.push(before + '->' + target + ' ' + JSON.stringify(info)); }
  }
  return out;
}, {RENAMES, POS});
console.log('PLACED', JSON.stringify(placed)); await sleep(1500);
// switch the viewpoint away and back so that every node re-renders from the store
await vp('Abstract syntax'); await sleep(1500); await vp('ChenNotation'); await sleep(2000); await css(); await hideSim();
// Positions written to the store are not picked up by the canvas and the pane does not pan on drag, so the
// nodes are dragged into place at a low zoom (where they all fit on screen) around the viewport centre, and
// "Reset zoom to 100%" then scales the picture about that same centre. Duplicates (two "id", two "name")
// are told apart by their x order after auto layout.
await page.locator('[title="Hide panel"]:visible').click().catch(()=>0); await sleep(800);
await page.locator('[title="Auto layout"]:visible').click().catch(()=>0); await sleep(2000); await css(); await hideSim();
await page.locator('[title="Zoom out"]:visible').click(); await sleep(600); await page.locator('[title="Zoom out"]:visible').click(); await sleep(800);
const zoomPct = async () => { const t = await page.locator('.toolbar, [class*=toolbar]').first().textContent().catch(()=>''); const m = /(\d+)%/.exec(t || ''); return m ? parseInt(m[1]) : 50; };
const z = await zoomPct(); const k = z / 100; console.log('ZOOM', z);
const pane = await page.locator('.react-flow__pane').first().boundingBox();
const C = {x: pane.x + pane.width/2, y: pane.y + pane.height/2};
// layout at 100%, top-left corners relative to the viewport centre (entities and attributes are 200 px wide)
const LAYOUT = [['hasRole',0,-280,-360], ['shares',0,120,-360], ['Role',0,-520,-150], ['Person',0,-180,-150], ['Car',0,160,-150],
  ['id',0,-560,60], ['name',0,-440,140], ['age',0,-320,60], ['surname',0,-200,140], ['name',1,-80,60], ['id',1,160,60], ['manufacturer',0,280,140]];
const nodes = page.locator('.react-flow__node'); const N = await nodes.count();
const boxes = async () => { const out = []; for (let i = 0; i < N; i++) { const n = nodes.nth(i); const b = await n.boundingBox(); if (b) out.push({i, t:(await n.textContent()).trim(), b}); } return out; };
const initial = await boxes();
console.log('BOXES', JSON.stringify(initial.map(o=>[o.i, o.t, Math.round(o.b.x), Math.round(o.b.y), Math.round(o.b.width)])));
// resolve every target to a node index once, from the initial layout, so later moves do not change the order
const plan = [];
for (const [text, kk, rx, ry] of LAYOUT) {
  const same = initial.filter(o => o.t === text || o.t.startsWith(text + 'OneToMany') || o.t.startsWith(text + 'ManyToMany')).sort((a,b)=>a.b.x-b.b.x);
  const o = same[kk]; if (!o) { console.log('NO NODE', text, kk); continue; } plan.push([o.i, text, rx, ry]);
}
for (const [i, text, rx, ry] of plan) {
  const b = await nodes.nth(i).boundingBox(); if (!b) { console.log('NO BOX', text); continue; }
  if (b.x < pane.x || b.y < pane.y) { console.log('OFFSCREEN', text, Math.round(b.x), Math.round(b.y)); continue; }
  const sx = b.x + b.width/2, sy = b.y + 4; const tx = C.x + rx*k + b.width/2, ty = C.y + ry*k + 4;
  await page.mouse.move(sx, sy); await sleep(100); await page.mouse.down(); await page.mouse.move(sx+6, sy+6, {steps:3}); await page.mouse.move(tx, ty, {steps:12}); await sleep(60); await page.mouse.up(); await sleep(250);
}
await page.keyboard.press('Escape'); await sleep(300);
await shot('probe-low.png');
// the zoom buttons scale about the flow origin; the wheel scales about the pointer, so zoom back in from the centre
await page.mouse.move(C.x, C.y);
await page.keyboard.down('Control');
for (let i = 0; i < 80; i++) { const zz = await zoomPct(); if (zz >= 95 && zz <= 105) break; await page.mouse.wheel(0, zz < 95 ? -8 : 8); await sleep(250); }
await page.keyboard.up('Control');
console.log('ZOOM2', await zoomPct());
await page.locator('[title="Reset zoom to 100%"]:visible').click().catch(()=>0); await sleep(1200);
await hideSim();
const names = await page.evaluate(()=>[...document.querySelectorAll('.react-flow__node')].map(n=>n.textContent.trim()+'@'+Math.round(n.getBoundingClientRect().x)+','+Math.round(n.getBoundingClientRect().y)));
console.log('NODES', JSON.stringify(names));
await shot('tutorial-02-chen-diagram.png');

// ---- the three views in the View Designer
await page.locator('[title="Show panel"]:visible').click().catch(()=>0); await sleep(600);
await page.locator('.appbar-tab__name', {hasText:/^ERD$/}).click().catch(async()=>{ await page.locator('.project-name').click(); await sleep(1500); await page.locator('.list-card__name', {hasText:/^ERD$/}).first().click(); });
await sleep(2500); await css(); await hideSim();
// RelationshipView: symbol editor, Text tab, two labels centered
await H.selectView('RelationshipView'); await H.vtab('Symbol'); await page.locator('button:has-text("Open symbol editor")').click(); await sleep(1200);
await page.locator('.symbol-editor-modal .symbol-editor-modal__tab', {hasText:/^Text$/}).click(); await sleep(800);
await page.locator('.symbol-editor-modal :text("Label #2")').first().scrollIntoViewIfNeeded().catch(()=>0); await sleep(500);
await shot('tutorial-02-relationship-labels.png');
await H.symbolClose(); await sleep(400);
// EntityView: symbol editor with the Base family and Rounded selected
await H.selectView('EntityView'); await H.vtab('Symbol'); await page.locator('button:has-text("Open symbol editor")').click(); await sleep(1200);
await shot('tutorial-02-symbol-editor-base-family.png');
await H.symbolClose(); await sleep(400);
// AttributeView: Advanced mode, Appearance tab with the conditional fill
await mode('Advanced'); await sleep(800); await hideSim();
await H.selectView('AttributeView'); await H.vtab('Symbol'); await page.locator('button:has-text("Open symbol editor")').click(); await sleep(1200);
await page.locator('.symbol-editor-modal .symbol-editor-modal__tab', {hasText:/^Appearance$/}).click().catch(()=>0); await sleep(800);
await shot('tutorial-02-fill-conditional.png');
await H.symbolClose();
await ctx.close(); await b.close();
console.log('DONE');
