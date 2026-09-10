// Probe 2: remove the ChenNotation viewpoint from the offline copy, so tutorial 2 can be recorded again.
import { chromium } from 'playwright';
import fs from 'fs';
const SP = process.env.PILL_DIR || process.cwd();
const storage = JSON.parse(fs.readFileSync(SP + '/storage.json', 'utf8'));
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1440, height:900}});
await ctx.addInitScript((st)=>{ try { if (!localStorage.getItem('offline')) { for (const [k,v] of Object.entries(st)) localStorage.setItem(k,v); } } catch(e){} }, storage);
const page = await ctx.newPage(); page.on('dialog', d=>d.accept());
const sleep = ms => page.waitForTimeout(ms);
const out = {};
await page.goto('http://localhost:3000/#/allProjects', {waitUntil:'commit'});
const card = page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first();
await card.waitFor({state:'visible', timeout:90000}); await sleep(800);
await card.locator('.gallery-card__name, [class*=name]').first().click().catch(async()=>{ await card.click(); });
await page.locator('.list-card__name', {hasText:/^People$/}).first().waitFor({state:'visible', timeout:90000}); await sleep(2000);
await page.addStyleTag({content:'.wm-backdrop,.notification-widget,.donation-banner,.jj-toast-container{display:none!important}'}).catch(()=>0);

// A. the project sidebar row for the viewpoint: what shows on hover
const vprow = page.locator('.leftbar :text-is("ChenNotation")').first();
out.rowExists = await vprow.count();
await vprow.hover().catch(()=>0); await sleep(800);
out.hoverActions = await page.evaluate(()=>{ const el=[...document.querySelectorAll('*')].find(e=>e.textContent.trim()==='ChenNotation'&&e.childElementCount===0);
  if(!el) return 'none'; const row = el.closest('[class*=item], [class*=row], li, a') || el.parentElement;
  return {rowCls:row.className, html:row.outerHTML.slice(0,700)}; });
await page.screenshot({path: SP + '/probe-vp-hover.png'});

// B. the store route: drop it from the project's viewpoints
out.store = await page.evaluate(()=>{
  const il = store.getState().idlookup;
  const proj = Object.values(il).find(o=>o&&o.className==='DProject');
  const vp = Object.values(il).find(o=>o&&o.className==='DViewPoint'&&o.name==='ChenNotation');
  const r = {before: (proj.viewpoints||[]).slice(), active: proj.activeViewpoint};
  try { const l = LModelElement.fromPointer(proj.id); l.viewpoints = []; r.afterL = (store.getState().idlookup[proj.id].viewpoints||[]).slice(); } catch(e) { r.lErr = String(e).slice(0,150); }
  if ((r.afterL||[]).length) { try { store.getState().idlookup[proj.id].viewpoints = []; r.afterRaw = (store.getState().idlookup[proj.id].viewpoints||[]).slice(); } catch(e) { r.rawErr = String(e).slice(0,150); } }
  return r;
});
await sleep(1500);
out.treeAfter = await page.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>e.childElementCount===0&&e.textContent.trim()==='ChenNotation').length);
await page.screenshot({path: SP + '/probe-vp-after-store.png'});

// C. does it survive a reopen of the project?
await page.locator(':text("All projects")').first().click().catch(()=>0); await sleep(2000);
await page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first().click().catch(()=>0); await sleep(2500);
out.treeAfterReopen = await page.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>e.childElementCount===0&&e.textContent.trim()==='ChenNotation').length);
await page.screenshot({path: SP + '/probe-vp-after-reopen.png'});
fs.writeFileSync(SP + '/probe-vp2.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out).slice(0, 2000));
await b.close();
