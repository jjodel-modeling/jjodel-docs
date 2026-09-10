// Probe 5: how does build 3154 create a contained Attribute for an Entity in the Data Manager?
// Tries the "New Attribute" button of the Attribute table and dumps the draft dialog.
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
const closeModal = async () => { for (const sel of ['.wm-modal button:has-text("Close")','button:has-text("Close")']) { const b2=page.locator(sel).first(); if (await b2.isVisible().catch(()=>false)) { await b2.click().catch(()=>0); await sleep(500); return; } } };
const css = async () => page.addStyleTag({content:'.wm-modal,.wm-backdrop,.notification-widget,.donation-banner,.jj-toast-container{display:none!important}'}).catch(()=>0);
const draft = async () => page.evaluate(()=>{ const d=document.querySelector('.instance-manager__draft');
  if (!d) return 'no draft'; return {text:(d.innerText||'').slice(0,400), fields:[...d.querySelectorAll('input,select')].map(e=>({id:e.id,tag:e.tagName,type:e.type||'',opts:e.tagName==='SELECT'?[...e.options].map(o=>o.label).slice(0,8):undefined}))}; });

await page.goto('http://localhost:3000/#/allProjects', {waitUntil:'commit'});
const card = page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first();
await card.waitFor({state:'visible', timeout:90000}); await sleep(800);
await card.locator('.gallery-card__name, [class*=name]').first().click().catch(async()=>{ await card.click(); });
await page.locator('.list-card__name', {hasText:/^People$/}).first().waitFor({state:'visible', timeout:90000}); await sleep(1500); await closeModal(); await css();
await page.locator('.list-card__name', {hasText:/^People$/}).first().click();
await page.locator('[title="Select viewpoint"]:visible').waitFor({timeout:90000}); await sleep(2500); await closeModal(); await css();
await page.locator('[title="Select viewpoint"]:visible').click(); await sleep(700);
await page.locator('.toolbar-viewpoint-menu :text("Data manager")').click(); await sleep(2500); await closeModal(); await css();

// A. New Attribute from the Attribute table, with nothing selected
await page.locator('.instance-manager__row', {hasText:'Attribute'}).first().click(); await sleep(900);
await page.locator('button:has-text("New Attribute")').first().click(); await sleep(1200);
out.newAttributeNoSelection = await draft();
await page.screenshot({path: SP + '/probe3-new-attr-plain.png'});
await page.locator('.instance-manager__draft-foot button:has-text("Cancel")').first().click().catch(()=>0); await sleep(600);

// B. select an Entity first, then New Attribute from the Attribute table
await page.locator('.instance-manager__row', {hasText:'Entity'}).first().click(); await sleep(900);
const role = page.locator('table tbody tr').filter({has: page.locator('.instance-manager__td-name', {hasText:/^Role$/})}).first();
await role.locator('td').nth(1).click(); await sleep(1200);
out.entitySelected = true;
// the outline on the left: does hovering an entity offer a plus?
out.outline = await page.evaluate(()=>{ const el=[...document.querySelectorAll('*')].find(e=>e.childElementCount===0 && e.textContent.trim()==='Role' && e.closest('[class*=outline]'));
  if(!el) return 'no outline row'; const r=el.closest('[class*=row], li, div'); return {cls:String(r.className).slice(0,60), html:r.outerHTML.slice(0,500)}; });
await page.locator('.instance-manager__row', {hasText:'Attribute'}).first().click(); await sleep(900);
await page.locator('button:has-text("New Attribute")').first().click(); await sleep(1200);
out.newAttributeAfterEntity = await draft();
await page.screenshot({path: SP + '/probe3-new-attr-after-entity.png'});
fs.writeFileSync(SP + '/probe-dm3.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out).slice(0, 2500));
await b.close();
