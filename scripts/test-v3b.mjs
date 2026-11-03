import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer-core";
import { decodePng } from "./decode-png.mjs";

const url = process.argv[2] || "http://localhost:3001";
const sample =
  process.argv[3] ||
  "/private/var/folders/w1/b0gtpxdx7jd3flhc7v2d8v2m0000gn/T/opencode/sample-shot.png";
const outDir =
  process.argv[4] ||
  "/private/var/folders/w1/b0gtpxdx7jd3flhc7v2d8v2m0000gn/T/opencode/slate-v3b";

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox", "--font-render-hinting=none"],
});
const context = browser.defaultBrowserContext();
await context.overridePermissions(url, ["clipboard-read", "clipboard-write"]);

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
page.on("pageerror", (error) => console.error("[pageerror]", error.message));
page.on("console", (message) => {
  if (message.type() === "error") console.log("[console.error]", message.text());
});

const client = await page.createCDPSession();
await client.send("Page.setDownloadBehavior", {
  behavior: "allow",
  downloadPath: outDir,
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

await page.goto(url, { waitUntil: "networkidle0" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);

const clickExact = async (text, selector = "button") => {
  const ok = await page.evaluate(
    (needle, sel) => {
      const target = [...document.querySelectorAll(sel)].find(
        (item) => (item.textContent || "").trim() === needle,
      );
      target?.click();
      return Boolean(target);
    },
    text,
    selector,
  );
  if (!ok) console.log(`[miss] clickExact ${text}`);
  return ok;
};

const clickTitle = async (title) => {
  const ok = await page.evaluate((needle) => {
    const target = [...document.querySelectorAll("button")].find(
      (item) => item.getAttribute("title") === needle,
    );
    target?.click();
    return Boolean(target);
  }, title);
  if (!ok) console.log(`[miss] clickTitle ${title}`);
  return ok;
};

const waitForFile = async (extension, timeout = 20000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const files = fs
      .readdirSync(outDir)
      .filter((file) => file.endsWith(extension) && !file.endsWith(".crdownload"));
    if (files.length) return files[files.length - 1];
    await wait(250);
  }
  return null;
};

const readDoc = () =>
  page.evaluate(() => {
    const raw = localStorage.getItem("slate.project.v2");
    return raw ? JSON.parse(raw) : null;
  });

// Upload the sample.
const imageInput = await page.evaluateHandle(() =>
  [...document.querySelectorAll('input[type="file"]')].find((input) =>
    (input.getAttribute("accept") || "").includes("image/"),
  ),
);
await imageInput.asElement().uploadFile(sample);
await wait(1000);

// Padding 64, callout, background off.
await clickTitle("64px padding");
await page.evaluate(() => {
  document.querySelector('button[aria-label="Add a callout"]')?.click();
});
await wait(500);
await page.evaluate(() => {
  document.querySelector('button[aria-label="Toggle background"]')?.click();
});
await wait(1200);

let doc = await readDoc();
check("autosave keeps backgroundEnabled=false", doc?.backgroundEnabled === false, JSON.stringify(doc?.backgroundEnabled));
check("autosave keeps 64px padding", Math.round(doc.canvas.padding * 1000) === 64, String(doc.canvas.padding));
check("autosave keeps callout", doc.annotations.length === 1, String(doc.annotations.length));

const openExport = async () => {
  await page.keyboard.down("Meta");
  await page.keyboard.press("e");
  await page.keyboard.up("Meta");
  await wait(400);
};

// Transparent PNG at 1x.
await openExport();
await clickExact("1×");
await clickExact("PNG");
await clickExact("Download");
const png = await waitForFile(".png");
check("PNG download", Boolean(png), png ?? "no file");
await wait(600);
if (png) {
  const image = decodePng(path.join(outDir, png));
  const corner = image.pixel(40, 40);
  const center = image.pixel(Math.round(image.width / 2), Math.round(image.height / 2));
  check("transparent PNG keeps alpha", corner.a === 0, `alpha ${corner.a}`);
  check("transparent PNG keeps shot opaque", center.a === 255, `alpha ${center.a}`);
  check("PNG size at 1x", image.width === 1600 && image.height === 1000, `${image.width}x${image.height}`);
}

// JPG fills white.
await openExport();
await clickExact("1×");
await clickExact("JPG");
await clickExact("Download");
const jpg = await waitForFile(".jpg");
check("JPG download", Boolean(jpg), jpg ?? "no file");
await wait(600);
if (jpg) {
  const converted = path.join(outDir, "jpg-check.png");
  execFileSync("sips", ["-s", "format", "png", path.join(outDir, jpg), "--out", converted], {
    stdio: "ignore",
  });
  const image = decodePng(converted);
  const corner = image.pixel(40, 40);
  check(
    "JPG corner is white",
    corner.r > 245 && corner.g > 245 && corner.b > 245,
    `rgb ${corner.r},${corner.g},${corner.b}`,
  );
}

// WebP keeps transparency.
await openExport();
await clickExact("1×");
await clickExact("WebP");
await clickExact("Download");
const webp = await waitForFile(".webp");
check("WebP download", Boolean(webp), webp ?? "no file");
await wait(600);
if (webp) {
  const converted = path.join(outDir, "webp-check.png");
  execFileSync("sips", ["-s", "format", "png", path.join(outDir, webp), "--out", converted], {
    stdio: "ignore",
  });
  const image = decodePng(converted);
  const corner = image.pixel(40, 40);
  check("WebP keeps transparency", corner.a === 0, `alpha ${corner.a}`);
}

// SVG download.
await openExport();
await clickExact("1×");
await clickExact("SVG");
await clickExact("Download");
const svg = await waitForFile(".svg");
check("SVG download", Boolean(svg), svg ?? "no file");
await wait(600);
if (svg) {
  const text = fs.readFileSync(path.join(outDir, svg), "utf8");
  check("SVG has root svg element", text.includes("<svg"), `${text.length} bytes`);
  check("SVG has no backdrop when off", !text.includes("slate-backdrop"), "");
}

// Clipboard copy.
await openExport();
await clickExact("1×");
await clickExact("PNG");
await wait(200);
await page.evaluate(() => {
  const target = [...document.querySelectorAll("button")].find(
    (item) => (item.textContent || "").trim() === "Copy PNG",
  );
  target?.click();
});
let copied = false;
let clipboardTypes = "";
for (let attempt = 0; attempt < 40; attempt += 1) {
  await wait(250);
  const state = await page.evaluate(async () => {
    const text = document.body.innerText;
    try {
      const items = await navigator.clipboard.read();
      return {
        toast: text.includes("PNG copied to clipboard"),
        types: items.flatMap((item) => item.types),
      };
    } catch (error) {
      return { toast: text.includes("PNG copied to clipboard"), types: [], error: String(error) };
    }
  });
  clipboardTypes = state.types.join(",");
  if (state.toast || state.error) {
    copied = state.toast && state.types.includes("image/png");
    if (!copied && state.error) clipboardTypes = state.error;
    break;
  }
}
check("clipboard copy produces image/png", copied, clipboardTypes);

// Close dialog.
await page.keyboard.press("Escape");
await wait(400);

// Turn background back on, then save the project.
await page.evaluate(() => {
  document.querySelector('button[aria-label="Toggle background"]')?.click();
});
await wait(800);
const saveClicked = await clickExact("Save");
check("save button available", saveClicked, "");
const saved = await waitForFile(".slate.json");
check("project JSON download", Boolean(saved), saved ?? "no file");

// Change padding, then load the saved project.
await clickTitle("16px padding");
await wait(900);
doc = await readDoc();
check("padding changed before load", Math.round(doc.canvas.padding * 1000) === 16, String(doc.canvas.padding));

if (saved) {
  const jsonInput = await page.evaluateHandle(() =>
    [...document.querySelectorAll('input[type="file"]')].find((input) =>
      (input.getAttribute("accept") || "").includes("json"),
    ),
  );
  await jsonInput.asElement().uploadFile(path.join(outDir, saved));
  await wait(1200);
  doc = await readDoc();
  check("load restores 64px padding", Math.round(doc.canvas.padding * 1000) === 64, String(doc.canvas.padding));
  check("load restores backgroundEnabled", doc.backgroundEnabled === true, String(doc.backgroundEnabled));
  check("load restores callout", doc.annotations.length === 1, String(doc.annotations.length));
}

// Reload to confirm autosave restore.
await page.reload({ waitUntil: "networkidle0" });
await wait(1200);
const restored = await page.evaluate(() => {
  const raw = localStorage.getItem("slate.project.v2");
  const saved = raw ? JSON.parse(raw) : null;
  return {
    hasCanvas: Boolean(document.querySelector("svg[data-slate-canvas]")),
    hasImage: Boolean(document.querySelector("svg[data-slate-canvas] image")),
    shotSrc: Boolean(saved?.shot?.src),
    backgroundEnabled: saved?.backgroundEnabled,
    padding: saved?.canvas?.padding,
  };
});
check(
  "autosave restores on reload",
  restored.hasCanvas && restored.hasImage && restored.shotSrc,
  JSON.stringify(restored),
);

// Layout checks.
await page.evaluate(() => {
  const target = [...document.querySelectorAll("button")].find((item) =>
    (item.textContent || "").trim() === "Customize",
  );
  target?.click();
});
await wait(500);
await page.screenshot({ path: path.join(outDir, "layout-1440.png") });
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
await wait(700);
await page.screenshot({ path: path.join(outDir, "layout-1280.png") });
const overflow = await page.evaluate(() => ({
  bodyScroll: document.body.scrollWidth > window.innerWidth,
  inspectorScroll: (() => {
    const aside = document.querySelector("aside");
    return aside ? aside.scrollWidth > aside.clientWidth : null;
  })(),
}));
check("no horizontal overflow at 1280", overflow.bodyScroll === false, JSON.stringify(overflow));

await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 1 });
await wait(700);
await page.screenshot({ path: path.join(outDir, "layout-1024.png") });

console.log("\nSUMMARY");
const failed = results.filter((item) => !item.pass);
console.log(`${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log("FAILED:", failed.map((item) => item.name).join(" | "));
}
console.log("FILES:", fs.readdirSync(outDir));

await browser.close();
process.exit(failed.length ? 1 : 0);
