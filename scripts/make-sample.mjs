import fs from "node:fs";
import puppeteer from "puppeteer-core";

const out =
  process.argv[2] ||
  "/private/var/folders/w1/b0gtpxdx7jd3flhc7v2d8v2m0000gn/T/opencode/sample-shot.png";

const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox", "--font-render-hinting=none"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 750, deviceScaleFactor: 2 });

await page.setContent(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #ffffff; color: #17171a; }
  .nav { height: 62px; display: flex; align-items: center; gap: 22px; padding: 0 34px; border-bottom: 1px solid #eeece8; }
  .brand { font-weight: 700; font-size: 18px; letter-spacing: -0.04em; margin-right: auto; }
  .nav a { font-size: 12px; color: #6f6f68; text-decoration: none; }
  .cta { background: #17171a; color: white; border: 0; padding: 9px 15px; font-size: 12px; border-radius: 4px; }
  .hero { text-align: center; padding: 64px 120px 36px; }
  .eyebrow { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #8b8b83; }
  h1 { font-size: 48px; line-height: 1.05; letter-spacing: -0.045em; margin: 14px auto 16px; max-width: 680px; font-weight: 600; }
  .sub { max-width: 520px; margin: 0 auto; color: #74746c; font-size: 14px; line-height: 1.65; }
  .actions { display: flex; justify-content: center; gap: 10px; margin-top: 22px; }
  .ghost { background: white; color: #17171a; border: 1px solid #e3e0d9; padding: 9px 15px; font-size: 12px; border-radius: 4px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 24px 80px 60px; }
  .card { border: 1px solid #eeece8; background: #fcfbf9; padding: 18px; border-radius: 6px; }
  .thumb { height: 100px; border-radius: 4px; margin-bottom: 14px; }
  .t1 { background: linear-gradient(135deg,#d1fae5,#a7f3d0); }
  .t2 { background: linear-gradient(135deg,#ede9fe,#ddd6fe); }
  .t3 { background: linear-gradient(135deg,#ffedd5,#fed7aa); }
  .card h3 { margin: 0 0 6px; font-size: 14px; letter-spacing: -0.02em; }
  .card p { margin: 0; font-size: 12px; line-height: 1.6; color: #7c7c74; }
  .row { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; font-size: 11px; color: #8b8b83; }
  .pill { border: 1px solid #e6e2da; border-radius: 999px; padding: 3px 8px; }
</style>
</head>
<body>
  <div class="nav">
    <div class="brand">northstar</div>
    <a>Product</a><a>Pricing</a><a>Docs</a><a>Changelog</a>
    <button class="cta">Start free</button>
  </div>
  <div class="hero">
    <div class="eyebrow">Answers, not assumptions</div>
    <h1>Start with answers, not assumptions.</h1>
    <p class="sub">Northstar turns scattered customer feedback into a clear product direction, so your team can decide with confidence instead of guessing.</p>
    <div class="actions"><button class="cta">Book a demo</button><button class="ghost">See how it works</button></div>
  </div>
  <div class="grid">
    <div class="card"><div class="thumb t1"></div><h3>Signal, not noise</h3><p>Cluster every conversation automatically and surface the themes that actually matter.</p><div class="row"><span>12 sources</span><span class="pill">Live</span></div></div>
    <div class="card"><div class="thumb t2"></div><h3>Shared context</h3><p>Give design, product and engineering one living picture of what customers need.</p><div class="row"><span>4 teams</span><span class="pill">Synced</span></div></div>
    <div class="card"><div class="thumb t3"></div><h3>Decisions, faster</h3><p>Turn evidence into a roadmap your whole company can rally behind.</p><div class="row"><span>This week</span><span class="pill">Ready</span></div></div>
  </div>
</body>
</html>`);

await page.screenshot({ path: out, type: "png" });
await browser.close();
console.log("saved", out, fs.statSync(out).size);
