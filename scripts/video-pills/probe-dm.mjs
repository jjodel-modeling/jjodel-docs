// Probe: the Data Manager selectors of build 3154 (creating an entity, then adding an attribute to it).
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
const buttons = async () => page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()).filter(t=>t&&t.length<40));

await page.goto('http://localhost:3000/#/allProjects', {waitUntil:'commit'});
const card = page.locator('.gallery-card').filter({hasText:/ERDLanguage/}).first();
await card.waitFor({state:'visible', timeout:90000}); await sleep(800);
await card.locator('.gallery-card__name, [class*=name]').first().click().catch(async()=>{ await card.click(); });
await page.locator('.list-card__name', {hasText:/^People$/}).first().waitFor({state:'visible', timeout:90000}); await sleep(1500);
await page.addStyleTag({content:'.wm-backdrop,.notification-widget,.donation-banner,.jj-toast-container{display:none!important}'}).catch(()=>0);
await page.locator('.list-card__name', {hasText:/^People$/}).first().click();
await page.locator('[title="Select viewpoint"]:visible').waitFor({timeout:90000}); await sleep(2500);
await page.locator('[title="Select viewpoint"]:visible').click(); await sleep(700);
await page.locator('.toolbar-viewpoint-menu :text("Data manager")').click(); await sleep(2500);

// 1. create an entity
await page.locator('.instance-manager__row', {hasText:'Entity'}).first().click(); await sleep(900);
out.buttonsOnEntityTable = await buttons();
await page.locator('button:has-text("New Entity")').click(); await sleep(1200);
await page.locator('#instance-manager-draft-name').fill('Department'); await sleep(300);
await page.locator('.instance-manager__draft-foot button:has-text("Create")').click(); await sleep(1800);
out.buttonsAfterCreate = await buttons();
out.formAfterCreate = await page.evaluate(()=>{ const f=document.querySelector('.instance-manager__form, [class*=form]');
  return f ? {cls:f.className, text:f.innerText.slice(0,500)} : 'no form'; });
await page.screenshot({path: SP + '/probe-dm-after-create.png'});

// 2. select the row again from scratch and see what appears
await page.locator('.instance-manager__row', {hasText:'Entity'}).first().click(); await sleep(1000);
const row = page.locator('table tbody tr').filter({has: page.locator('.instance-manager__td-name', {hasText:/^Department$/})}).first();
out.rowFound = await row.count();
out.rowCells = await row.evaluate(e=>[...e.querySelectorAll('td')].map(td=>({cls:td.className, t:td.innerText.trim().slice(0,20)}))).catch(e=>String(e));
await row.locator('td').nth(1).click(); await sleep(1500);
out.buttonsAfterRowClick = await buttons();
out.sectionsAfterRowClick = await page.evaluate(()=>[...document.querySelectorAll('[class*=section], [class*=Section], h3, h4, legend')].filter(e=>e.offsetParent).map(e=>e.textContent.trim().slice(0,50)).slice(0,25));
await page.screenshot({path: SP + '/probe-dm-row-selected.png'});
// 3. try the expander chevron on the row
const chev = row.locator('td').last().locator('button, svg').first();
await chev.click().catch(()=>0); await sleep(1200);
out.buttonsAfterChevron = await buttons();
await page.screenshot({path: SP + '/probe-dm-chevron.png'});
fs.writeFileSync(SP + '/probe-dm.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out).slice(0, 3000));
await b.close();
