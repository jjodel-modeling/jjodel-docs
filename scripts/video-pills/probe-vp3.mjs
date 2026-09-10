// Probe 4: does the interface offer a way to delete a viewpoint (tree row actions, context menu)?
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
await page.locator('.list-card__name', {hasText:/^ERD$/}).first().waitFor({state:'visible', timeout:90000}); await sleep(1200);
await page.addStyleTag({content:'.wm-backdrop,.notification-widget,.donation-banner,.jj-toast-container{display:none!important}'}).catch(()=>0);
await page.locator('.list-card__name', {hasText:/^ERD$/}).first().click(); await sleep(3000);

const row = page.locator('.tree-row__content').filter({hasText:/^ChenNotation$/}).first();
out.rowCount = await row.count();
await row.hover().catch(()=>0); await sleep(800);
out.actionsOnHover = await page.evaluate(()=>{ const el=[...document.querySelectorAll('.tree-row__name')].find(e=>e.textContent.trim()==='ChenNotation');
  if(!el) return 'no row'; const r = el.closest('.tree-row') || el.parentElement;
  return {html: r.outerHTML.slice(0,900), actions: [...r.querySelectorAll('button, [class*=action]')].map(a=>({cls:String(a.className).slice(0,60), title:a.getAttribute('title')||'', t:a.textContent.trim().slice(0,20)}))}; });
await page.screenshot({path: SP + '/probe-vp3-hover.png'});
await row.click({button:'right'}).catch(()=>0); await sleep(900);
out.contextMenu = await page.evaluate(()=>[...document.querySelectorAll('.context-menu__item, [class*=context-menu] [class*=item], [role=menuitem]')].filter(e=>e.offsetParent).map(e=>e.textContent.trim().slice(0,40)));
await page.screenshot({path: SP + '/probe-vp3-context.png'});
// also: select it and see what the properties panel offers
await page.keyboard.press('Escape'); await sleep(300);
await row.click().catch(()=>0); await sleep(1200);
out.panelButtons = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent && b.getBoundingClientRect().x>1000).map(b=>({t:b.textContent.trim().slice(0,30), title:b.getAttribute('title')||''})).slice(0,30));
await page.screenshot({path: SP + '/probe-vp3-selected.png'});
fs.writeFileSync(SP + '/probe-vp3.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out).slice(0, 2500));
await b.close();
