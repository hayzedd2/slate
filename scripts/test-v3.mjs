import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const url = process.argv[2] || "http://localhost:3001";
const sample =
  process.argv[3] ||
  "/private/var/folders/w1/b0gtpxdx7jd3flhc7v2d8v2m0000gn/T/opencode/sample-shot.png";
const outDir =
  process.argv[4] ||
  "/private/var/folders/w1/b0gtpxdx7jd3flhc7v2d8v2m0000gn/T/opencode/slate-v3";

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox", "--font-render-hinting=none"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
page.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warning") {
    console.log(`[console.${message.type()}]`, message.text());
  }
});
page.on("pageerror", (error) => console.error("[pageerror]", error.message));

const client = await page.createCDPSession();
await client.send("Page.setDownloadBehavior", {
  behavior: "allow",
  downloadPath: outDir,
});

await page.goto(url, { waitUntil: "networkidle0" });
await page.evaluate(async () => {
  await document.fonts.ready;
});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clickText = async (text, selector = "button") => {
  const clicked = await page.evaluate(
    (needle, sel) => {
      const target = [...document.querySelectorAll(sel)].find((item) =>
        (item.textContent || "").trim().includes(needle),
      );
      target?.click();
      return Boolean(target);
    },
    text,
    selector,
  );
  if (!clicked) console.log(`[miss] clickText ${text}`);
  return clicked;
};

const clickTitle = async (title) => {
  const clicked = await page.evaluate((needle) => {
    const target = [...document.querySelectorAll("button")].find(
      (item) => item.getAttribute("title") === needle,
    );
    target?.click();
    return Boolean(target);
  }, title);
  if (!clicked) console.log(`[miss] clickTitle ${title}`);
  return clicked;
};

// Upload the sample screenshot.
const imageInput = await page.evaluateHandle(() =>
  [...document.querySelectorAll('input[type="file"]')].find((input) =>
    (input.getAttribute("accept") || "").includes("image/"),
  ),
);
await imageInput.asElement().uploadFile(sample);
await wait(1200);
await page.screenshot({ path: path.join(outDir, "1-uploaded.png") });

// Open the inspector.
await clickText("Customize");
await wait(400);
await page.screenshot({ path: path.join(outDir, "2-inspector.png") });

// Add a callout from the dock.
await page.evaluate(() => {
  document
    .querySelector('button[aria-label="Add a callout"]')
    ?.click();
});
await wait(600);
await page.screenshot({ path: path.join(outDir, "3-callout.png") });

// Open the look picker and apply Mint.
await clickText("Sand");
await wait(400);
await page.screenshot({ path: path.join(outDir, "4-looks.png") });
await page.evaluate(() => {
  const target = [...document.querySelectorAll("button")].find(
    (item) => (item.textContent || "").trim() === "Mint",
  );
  target?.click();
});
await wait(500);
await page.keyboard.press("Escape");
await wait(300);
await page.screenshot({ path: path.join(outDir, "5-mint.png") });

// Set 64px padding.
await clickTitle("64px padding");
await wait(300);

// Toggle the background off.
await page.evaluate(() => {
  document
    .querySelector('button[aria-label="Toggle background"]')
    ?.click();
});
await wait(500);
await page.screenshot({ path: path.join(outDir, "6-transparent.png") });

// Turn it back on.
await page.evaluate(() => {
  document
    .querySelector('button[aria-label="Toggle background"]')
    ?.click();
});
await wait(400);

// Export a 2x PNG.
await clickText("Export");
await wait(400);
await page.screenshot({ path: path.join(outDir, "7-export.png") });
await page.evaluate(() => {
  const target = [...document.querySelectorAll("button")].find(
    (item) => (item.textContent || "").trim() === "Download",
  );
  target?.click();
});

let status = "";
for (let attempt = 0; attempt < 60; attempt += 1) {
  await wait(500);
  status = await page.evaluate(() => document.body.innerText);
  if (/Exported|failed|Could not|error/i.test(status)) break;
}
console.log(
  "STATUS:",
  status.split("\n").filter(Boolean).slice(-6).join(" | "),
);
console.log("FILES:", fs.readdirSync(outDir));
await browser.close();
