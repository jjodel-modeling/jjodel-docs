// Renders the title card of tutorial 5: poster JPEG for the <video> element and title PNG for compose.py.
import { chromium } from 'playwright'; import fs from 'fs';
const logo = fs.readFileSync(new URL('../../src/assets/jjodel-logo-white.png', import.meta.url).pathname).toString('base64');
const b = await chromium.launch({...(process.env.CHROME ? {executablePath: process.env.CHROME} : {})}); const p = await b.newPage({viewport:{width:1440,height:900}});
await p.setContent(`<html><body style="margin:0"><div style="position:fixed;inset:0;background:#334155;color:#f8fafc;font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center">
<div style="text-align:center"><img src="data:image/png;base64,${logo}" style="width:260px;margin-bottom:34px"/><div style="font-size:20px;letter-spacing:.2em;color:#7dd3fc;margin-bottom:18px">TUTORIAL 5</div>
<div style="font-size:56px;font-weight:700;line-height:1.15">From ER to a Relational Schema</div>
<div style="font-size:22px;color:#cbd5e1;margin-top:30px">Two JjTL rules: tables with their columns, and foreign keys resolved through the trace</div>
<div style="margin-top:56px;width:84px;height:84px;border-radius:50%;background:rgba(255,255,255,.14);display:inline-flex;align-items:center;justify-content:center"><div style="width:0;height:0;border-left:30px solid #f8fafc;border-top:18px solid transparent;border-bottom:18px solid transparent;margin-left:8px"></div></div>
</div></div></body></html>`);
await p.screenshot({path:'tutorial-05-er-to-relational-poster.jpg', type:'jpeg', quality:85}); await p.evaluate(()=>{ const d=[...document.querySelectorAll('div')].pop().parentElement; d.remove(); }); await p.screenshot({path:'title-tutorial-05.png'}); await b.close();
