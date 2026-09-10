// Probe: how to remove the ChenNotation viewpoint from the offline copy before recording tutorial 2.
import { chromium } from 'playwright';
import fs from 'fs';
const SP = process.env.PILL_DIR || process.cwd();
const storage = JSON.parse(fs.readFileSync(SP + '/storage.json', 'utf8'));
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1440, height:900}});
await ctx.addInitScript((st)=>{ try { if (!localStorage.getItem('offline')) { for (const [k,v] of Object.entries(st)) localStorage.setItem(k,v); } } catch(e){} }, storage);
const page = await ctx.newPage(); page.on('dialog', d=>d.accept());
const sleep = ms => page.waitForTimeout(ms);
await page.goto('http://localhost:3000/#/allProjects', {waitUntil:'commit'});
const card = page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first();
await card.waitFor({state:'visible', timeout:90000}); await sleep(800);
await card.locator('.gallery-card__name, [class*=name]').first().click().catch(async()=>{ await card.click(); });
await page.locator('.list-card__name', {hasText:/^People$/}).first().waitFor({state:'visible', timeout:90000}); await sleep(2000);
await page.addStyleTag({content:'.wm-backdrop,.notification-widget,.donation-banner,.jj-toast-container{display:none!important}'}).catch(()=>0);

const out = {};
// 1. what the sidebar row offers on hover
const row = page.locator('*', {hasText:/^ChenNotation$/}).last();
out.rowCount = await page.locator(':text-is("ChenNotation")').count();
const sidebarRow = page.locator(':text-is("ChenNotation")').first();
await sidebarRow.hover().catch(()=>0); await sleep(700);
out.afterHover = await page.evaluate(()=>{ const el=[...document.querySelectorAll('*')].find(e=>e.textContent.trim()==='ChenNotation' && e.childElementCount===0);
  if(!el) return 'no el'; let p=el; for(let i=0;i<4 && p.parentElement;i++) p=p.parentElement;
  return {cls:p.className, html:p.innerHTML.slice(0,600)}; });
// 2. right click
await sidebarRow.click({button:'right'}).catch(()=>0); await sleep(800);
out.contextMenu = await page.evaluate(()=>[...document.querySelectorAll('[class*=context-menu] *, [role=menu] *')].map(e=>e.textContent.trim()).filter(t=>t && t.length<40).slice(0,20));
await page.keyboard.press('Escape'); await sleep(400);
// 3. what the L proxy offers
out.api = await page.evaluate(()=>{
  const il = store.getState().idlookup;
  const vp = Object.values(il).find(o=>o&&o.className==='DViewPoint'&&o.name==='ChenNotation');
  const proj = Object.values(il).find(o=>o&&o.className==='DProject');
  const res = {vpId: vp && vp.id, projKeys: proj ? Object.keys(proj).filter(k=>/view/i.test(k)) : null,
    projViewpoints: proj && proj.viewpoints, vpKeys: vp ? Object.keys(vp) : null};
  try { const l = LModelElement.fromPointer(vp.id); res.lProto = Object.getOwnPropertyNames(Object.getPrototypeOf(l)).filter(k=>/del|remove/i.test(k)); } catch(e) { res.lErr = String(e).slice(0,120); }
  try { res.jjactions = Object.values(jjactions).map(a=>typeof a==='function'?a.name:String(a)).slice(0,20); } catch(e) {}
  return res;
});
fs.writeFileSync(SP + '/probe-vp.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out).slice(0, 2500));
await b.close();
