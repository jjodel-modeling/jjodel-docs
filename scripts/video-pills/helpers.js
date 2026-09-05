// Playwright helpers for driving the Jjodel 3.0 editors (metamodel, model, View Designer, Data Manager).
// Evaluated with `page` and `sleep` in scope; installs globalThis.H. Selectors follow the beta UI of September 2026.
await page.addInitScript(()=>{ window.H_visibleEditor = ()=>[...document.querySelectorAll('.editor-v2__canvas')].find(c=>c.getBoundingClientRect().width>0) || document; });
await page.evaluate(()=>{ window.H_visibleEditor = ()=>[...document.querySelectorAll('.editor-v2__canvas')].find(c=>c.getBoundingClientRect().width>0) || document; });
globalThis.H = {
  canvas(){ return page.locator('.editor-v2__canvas:visible').first(); },
  field(label){ return page.locator('.properties-fields .jj-field').filter({has: page.locator('.jj-field-label', {hasText: new RegExp('^'+label)})}).first(); },
  async setField(label, value){ const inp = H.field(label).locator('input,select').first(); const tag = await inp.evaluate(e=>e.tagName); if(tag==='SELECT'){ await inp.selectOption({label:value}); } else { await inp.click({clickCount:3}); await inp.fill(value); await inp.press('Enter'); } await page.waitForTimeout(400); },
  async addClassifier(kind, x, y, name){ await page.locator('.palette-item').filter({has: page.locator('span', {hasText: new RegExp('^'+kind+'$')})}).dragTo(H.canvas(), {targetPosition:{x,y}}); await page.waitForTimeout(700); const node = H.canvas().locator('.react-flow__node').last(); await node.click(); for(let i=0;i<20;i++){ const v=await H.panelName(); if(v && /^New/.test(v)) break; await page.waitForTimeout(150);} await H.setField('Name', name); await page.waitForTimeout(400); return node; },
  node(name){ return H.canvas().locator('.react-flow__node').filter({has: page.locator('.mm-node__name:text-is("'+name+'"), input.mm-node__input[value="'+name+'"]')}).first(); },
  async dropMember(kind, nodeName){ const n = H.node(nodeName); await page.locator('.palette-item').filter({has: page.locator('span', {hasText: new RegExp('^'+kind+'$')})}).dragTo(n); await page.waitForTimeout(700); },
  async setMult(m){ await page.locator('.jj-mult__seg', {hasText: m.replace('*','\\*')}).first().click(); await page.waitForTimeout(300); },
  async selectMember(nodeName, memberName){ await H.node(nodeName).locator('text='+memberName).first().click(); await page.waitForTimeout(500); },
  async openType(){ const inp = H.field('Type').locator('input').first(); await inp.click(); await page.waitForTimeout(500); return inp; },
  async setType(t){ await H.openType(); await page.locator('[class*=option], li, [role=option]').filter({hasText: new RegExp('^'+t+'$')}).first().click(); await page.waitForTimeout(400); },
  async connect(srcName, dstName, edgeType, side='top'){
    const src=H.node(srcName), dst=H.node(dstName); const sb=await src.boundingBox(), db=await dst.boundingBox();
    await page.mouse.move(sb.x+sb.width/2, sb.y+sb.height/2); await page.waitForTimeout(200);
    const edge = side==='top' ? [sb.x+sb.width/2, sb.y+2] : side==='bottom' ? [sb.x+sb.width/2, sb.y+sb.height-2] : side==='right' ? [sb.x+sb.width-2, sb.y+sb.height/2] : [sb.x+2, sb.y+sb.height/2];
    await page.mouse.move(edge[0], edge[1], {steps:5}); await page.waitForTimeout(400);
    let h = src.locator('.react-flow__handle.source.mm-anchor--ghost-visible').first();
    if (!(await h.count())) h = src.locator('.react-flow__handle.source.mm-anchor--connected').first();
    const hb = await h.boundingBox();
    await page.mouse.move(hb.x+hb.width/2, hb.y+hb.height/2); await page.mouse.down();
    const cx=db.x+db.width/2, cy=db.y+db.height/2;
    // approach the destination border from OUTSIDE, on the side facing the source
    let out, tgt;
    if (sb.y > db.y+db.height) { out=[cx, db.y+db.height+40]; tgt=[cx, db.y+db.height-4]; }
    else if (sb.y+sb.height < db.y) { out=[cx, db.y-40]; tgt=[cx, db.y+4]; }
    else if (sb.x > db.x+db.width) { out=[db.x+db.width+40, cy]; tgt=[db.x+db.width-4, cy]; }
    else { out=[db.x-40, cy]; tgt=[db.x+4, cy]; }
    await page.mouse.move(out[0], out[1], {steps:12}); await page.waitForTimeout(250);
    await page.mouse.move(tgt[0], tgt[1], {steps:6}); await page.waitForTimeout(450);
    let vis = dst.locator('.react-flow__handle.target.mm-anchor--ghost-visible').first();
    if (!(await vis.count())) vis = dst.locator('.react-flow__handle.target.mm-anchor--connected').first();
    const vb = (await vis.count()) ? await vis.boundingBox() : null; if (vb) { await page.mouse.move(vb.x+vb.width/2, vb.y+vb.height/2, {steps:4}); await page.waitForTimeout(250); }
    await page.mouse.up(); await page.waitForTimeout(600);
    await page.locator('.edge-type-popup__label', {hasText: edgeType}).click(); await page.waitForTimeout(700);
  },
  async moveNode(name, x, y){ let n=H.node(name); if(!(await n.count())) n=H.inode(name); const b=await n.boundingBox(); const pane=await H.canvas().locator('.react-flow__pane').boundingBox(); await page.mouse.move(b.x+b.width/2, b.y+12); await page.mouse.down(); await page.mouse.move(pane.x+x, pane.y+y, {steps:12}); await page.mouse.up(); await page.waitForTimeout(500); },
  async selectTree(text){ const l = page.locator('.tree-feature__name, .tree-node__name, [class*=tree] span', {hasText: new RegExp('^'+text+'$')}).first(); await l.scrollIntoViewIfNeeded(); await l.click(); await page.waitForTimeout(600); },
  async selectEdge(name){
    const pt = await page.evaluate((name)=>{
      const lab = [...H_visibleEditor().querySelectorAll('.edge-label')].find(l=>{const i=l.querySelector('input'); return (i&&i.value===name) || l.textContent.trim()===name});
      if(!lab) return null; const r=lab.getBoundingClientRect(); const lc={x:r.x+r.width/2, y:r.y+r.height/2};
      let best=null;
      for (const p of H_visibleEditor().querySelectorAll('.react-flow__edge path')) { const len=p.getTotalLength(); if(!len) continue; const m=p.getScreenCTM();
        for (let t=0.05;t<=0.95;t+=0.05){ const sp=p.getPointAtLength(len*t).matrixTransform(m); const d=Math.hypot(sp.x-lc.x, sp.y-lc.y); if(!best||d<best.d) best={d, x:sp.x, y:sp.y}; } }
      return best; }, name);
    if(!pt) throw new Error('edge label not found '+name);
    await page.mouse.click(pt.x, pt.y); await page.waitForTimeout(600); return pt; },
  async selectNewestEdge(t=0.85){ const pt = await page.evaluate((t)=>{ const es=[...H_visibleEditor().querySelectorAll('.react-flow__edge')].sort((a,b)=>a.getAttribute('data-id').localeCompare(b.getAttribute('data-id'))); const g=es[es.length-1]; const p=[...g.querySelectorAll('path')].sort((a,b)=>b.getTotalLength()-a.getTotalLength())[0]; const len=p.getTotalLength(); const sp=p.getPointAtLength(len*t).matrixTransform(p.getScreenCTM()); return {x:sp.x,y:sp.y,id:g.getAttribute('data-id')}; }, t); await page.mouse.click(pt.x, pt.y); await page.waitForTimeout(600); return pt; },
  async panelName(){ return await page.evaluate(()=>{const i=document.querySelector('.properties-fields input'); return i?i.value:null}); },
  async select(name){ const n=H.node(name); await n.click(); for(let i=0;i<20;i++){ if((await H.panelName())===name) return; await page.waitForTimeout(150);} throw new Error('panel did not switch to '+name+' (is '+(await H.panelName())+')'); },
  inode(name){ return H.canvas().locator('.react-flow__node').filter({has: page.locator('.mm-node__header:has-text("'+name+'"), input.mm-node__input[value="'+name+'"]')}).first(); },
  async selectI(name){ const n=H.inode(name); await n.locator('.mm-node__header').first().click(); for(let i=0;i<20;i++){ const h=await page.evaluate(()=>document.querySelector('.properties-fields')?.previousElementSibling?.innerText||document.querySelector('[class*=properties]')?.innerText||''); if(h.includes(name)) return; await page.waitForTimeout(150);} },
  slot(name){ return page.locator('.properties-fields .jj-slot').filter({has: page.locator('.jj-slot-name', {hasText: new RegExp('^'+name+'$')})}).first(); },
  async setSlotText(name, value){ const inp=H.slot(name).locator('input').first(); await inp.click(); await inp.fill(value); await inp.press('Enter'); await page.waitForTimeout(500); },
  async setSlotSelect(name, optionLabel){ const sel=H.slot(name).locator('select').first(); await sel.selectOption({label: optionLabel}); await page.waitForTimeout(500); },
  async addRoot(cls, x, y){ await page.locator('.palette-item, [class*=palette]', {hasText: new RegExp('^'+cls+'$')}).first().dragTo(H.canvas(), {targetPosition:{x,y}}); await page.waitForTimeout(900); return H.canvas().locator('.react-flow__node').last(); },
  async addChild(parentName, menuText){ await H.inode(parentName).locator('.mm-node__header').first().click({button:'right'}); await page.waitForTimeout(500); await page.locator('.context-menu__item', {hasText: menuText}).click(); await page.waitForTimeout(900); return H.canvas().locator('.react-flow__node').last(); },
  async moveLast(x, y){ const n=H.canvas().locator('.react-flow__node').last(); const b=await n.boundingBox(); const pane=await H.canvas().boundingBox(); await page.mouse.move(b.x+12, b.y+b.height-8); await page.mouse.down(); await page.mouse.move(b.x+20, b.y+b.height, {steps:3}); await page.mouse.move(pane.x+x, pane.y+y, {steps:12}); await page.mouse.up(); await page.waitForTimeout(500); await n.locator('.mm-node__header').click(); await page.waitForTimeout(500); },
  vpanel(){ return page.locator('.view-editor-tab-bar').locator('..'); },
  async vtab(name){ await page.locator('.view-editor-tab', {hasText: new RegExp('^'+name+'$')}).click(); await page.waitForTimeout(700); },
  async irSelect(label, optionLabel){ const grp = H.vpanel().locator('.ir-structure-group__row, .ir-structure-group, .jj-field').filter({has: page.locator('label, .ir-structure-group__label, .jj-field-label', {hasText: new RegExp('^'+label+'$')})}).first(); const sel = grp.locator('select').first(); await sel.selectOption({label: optionLabel}); await page.waitForTimeout(500); },
  async irRadio(label, optText){ const row = H.vpanel().locator('.ir-structure-group__row').filter({has: page.locator('.ir-structure-group__label, label', {hasText: new RegExp('^'+label+'$')})}).first(); const b = row.locator('[role=radio]', {hasText: new RegExp('^'+optText+'$')}).first(); await b.scrollIntoViewIfNeeded(); await b.click(); await page.waitForTimeout(500); },
  async newView(vpName, viewName){ const row = page.locator('.tree-row__content').filter({hasText: new RegExp('^'+vpName+'$')}).first(); await row.scrollIntoViewIfNeeded(); await row.hover(); await page.waitForTimeout(300); await page.locator('.tree-row__action:visible').first().click(); await page.waitForTimeout(900); const inp = page.locator('.tree-row input:visible').first(); await inp.click({clickCount:3}); await inp.fill(viewName); await inp.press('Enter'); await page.waitForTimeout(800); const v = page.locator('.tree-row__name', {hasText: new RegExp('^'+viewName+'$')}).first(); await v.click(); await page.waitForTimeout(1000); },
  async viewApplyTo(optionLabel){ await page.keyboard.press('Escape'); const inp = H.vpanel().locator('.jj-select').nth(1).locator('input[role=combobox]'); await inp.click(); await page.waitForTimeout(500); await page.locator('[class*=-option]', {hasText: new RegExp('^'+optionLabel.replace('.','\\.')+'$')}).click(); await page.waitForTimeout(700); await page.keyboard.press('Escape'); },
  async enableIR(kind){ await page.locator('.view-editor-tab', {hasText:/^IR$/}).click(); await page.waitForTimeout(700); const sel = H.vpanel().locator('select').first(); await sel.selectOption({label: kind}); await page.waitForTimeout(300); await page.locator('button:has-text("Enable IR authoring")').click(); await page.waitForTimeout(1500); },
  async symbolPreset(group, presetName){ await H.vtab('Symbol'); await page.locator('button:has-text("Open symbol editor")').click(); await page.waitForTimeout(1000); const m = page.locator('.symbol-editor-modal'); const grp = m.locator('text='+group).first(); if (await grp.count()) { const expanded = await page.evaluate((g)=>{const e=[...document.querySelectorAll('.symbol-editor-modal *')].find(n=>n.childElementCount==0 && n.textContent.trim()===g); return e? e.closest('[class*=group], section, div').innerText.includes(presetName) : false}, group).catch(()=>false); if(!expanded) { await grp.click(); await page.waitForTimeout(400);} }
    const tile = m.locator('[class*=preset], [class*=tile], button').filter({hasText: new RegExp('^'+presetName+'$')}).first(); await tile.click(); await page.waitForTimeout(700); },
  async symbolLabel(position, prop){ const m = page.locator('.symbol-editor-modal'); await m.locator('.symbol-editor-modal__tab', {hasText:/^Text$/}).click(); await page.waitForTimeout(500); const sels = m.locator('select'); const n = await sels.count(); await sels.nth(n-3).selectOption({label: position}); await page.waitForTimeout(300); await sels.nth(n-1).selectOption({label: prop}); await page.waitForTimeout(500); },
  async symbolClose(){ await page.keyboard.press('Escape'); await page.waitForTimeout(500); if (await page.locator('.symbol-editor-modal').count()) { await page.locator('.symbol-editor-modal button:has-text("Close")').click(); await page.waitForTimeout(500);} },
  async removeCompartments(){ await H.vtab('Structure'); for (let i=0;i<5;i++){ const b = H.vpanel().locator('button[aria-label="Remove"]'); if(!(await b.count())) break; await b.first().click(); await page.waitForTimeout(500);} },
  async treeBack(){ const b = page.locator('.rail-focusbar__back'); if (await b.count()) { await b.click(); await page.waitForTimeout(500); } },
  async selectView(name){ await H.treeBack(); const v = page.locator('.tree-row__name', {hasText: new RegExp('^'+name+'$')}).first(); await v.scrollIntoViewIfNeeded(); await v.click(); await page.waitForTimeout(900); },
  dm: {
    async set(feature, value){ const el = page.locator('#instance-manager-draft-'+feature); const tag = await el.evaluate(e=>e.tagName); if (tag==='SELECT') await el.selectOption({label: value}); else { await el.click(); await el.fill(value); } await page.waitForTimeout(250); },
    async create(){ await page.locator('.instance-manager__draft-foot button:has-text("Create")').click(); await page.waitForTimeout(1200); },
    async metaclass(name){ await page.locator('.instance-manager__row', {hasText: name}).first().click(); await page.waitForTimeout(1000); },
    row(name){ return page.locator('table tbody tr').filter({has: page.locator('.instance-manager__td-name', {hasText: new RegExp('^'+name+'$')})}).first(); },
    async selectRow(name){ const r = H.dm.row(name); const on = await r.evaluate(e=>e.className.includes('selected')||!!e.querySelector('input:checked')); if(!on){ await r.locator('td').nth(1).click(); await page.waitForTimeout(800);} },
    async addAttribute(entity, an, at, key){ await H.dm.metaclass('Entity'); await H.dm.selectRow(entity); await page.locator('button:has-text("Add Attribute")').first().click(); await page.waitForTimeout(900); await H.dm.set('type', at); if (key) await H.dm.set('isKey','true'); await H.dm.set('name', an); await H.dm.create(); },
    async newEntity(name, attrs){ await H.dm.metaclass('Entity'); await page.locator('button:has-text("New Entity")').click(); await page.waitForTimeout(900); await H.dm.set('name', name); await H.dm.create(); for (const [an, at, key] of attrs) await H.dm.addAttribute(name, an, at, key); },
  },
  async shot(f){ await page.screenshot({path:f}); },
  status(){ return page.locator('.app-statusbar').first().innerText(); }
};
return 'helpers loaded';
