// Probe 3: the instance form of the Data Manager in build 3154, Basic and Advanced, looking for the
// control that adds a contained attribute to an entity.
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
const dumpForm = async tag => page.evaluate((tag)=>{
  const heads = [...document.querySelectorAll('*')].filter(e=>e.childElementCount===0 && /^(PROPERTIES|ATTRIBUTES|OWNEDATTRIBUTES)$/i.test(e.textContent.trim()));
  const form = heads.length ? heads[0].closest('div[class]:not([class=""])') : null;
  let root = form; for (let i=0;i<6 && root && root.parentElement; i++) root = root.parentElement;
  const scope = root || document.body;
  return {tag, heads: heads.map(h=>h.textContent.trim()),
    text: (scope.innerText||'').slice(0, 1200),
    clickables: [...scope.querySelectorAll('button, [role=button], [class*=add], [class*=Add]')].filter(e=>e.offsetParent)
      .map(e=>({t:(e.textContent||'').trim().slice(0,40), cls:String(e.className).slice(0,80), title:e.getAttribute('title')||''})).slice(0,40)};
}, tag);

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

// select the existing Role entity (it already has attributes, so the section must exist)
await page.locator('.instance-manager__row', {hasText:'Entity'}).first().click(); await sleep(1000);
const role = page.locator('table tbody tr').filter({has: page.locator('.instance-manager__td-name', {hasText:/^Role$/})}).first();
await role.locator('td').nth(1).click(); await sleep(1500);
out.basic = await dumpForm('Role/basic');
await page.screenshot({path: SP + '/probe2-role-basic.png'});

// the form's own Advanced toggle: the last visible "Advanced" button on the page
const adv = page.locator('button:has-text("Advanced")').filter({visible:true});
out.advCount = await adv.count();
await adv.last().click().catch(e=>{ out.advErr = String(e).slice(0,120); }); await sleep(1200);
out.advanced = await dumpForm('Role/advanced');
await page.screenshot({path: SP + '/probe2-role-advanced.png'});

// scroll the form to the bottom, in case the section is simply below the fold
await page.evaluate(()=>{ const h=[...document.querySelectorAll('*')].find(e=>e.childElementCount===0 && /^ATTRIBUTES$/i.test(e.textContent.trim()));
  if(h){ let s=h.parentElement; while(s && s.scrollHeight<=s.clientHeight && s.parentElement) s=s.parentElement; if(s) s.scrollTop = s.scrollHeight; } });
await sleep(900);
out.scrolled = await dumpForm('Role/scrolled');
await page.screenshot({path: SP + '/probe2-role-scrolled.png'});
fs.writeFileSync(SP + '/probe-dm2.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out).slice(0, 3000));
await b.close();
