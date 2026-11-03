import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const url = process.argv[2] || "http://localhost:3001";
const sample =
  process.argv[3] ||
  "/private/var/folders/w1/b0gtpxdx7jd3flhc7v2d8v2m0000gn/T/opencode/sample-shot.png";
const outDir =
  process.argv[4] ||
  "/private/var/folders/w1/b0gtpxdx7jd3flhc7v2d8v2m0000gn/T/opencode/slate-v2";

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

// Upload the sample screenshot through the first image input.
const inputs = await page.$$('input[type="file"]');
const imageInput = await page.evaluateHandle(() => {
  return [...document.querySelectorAll('input[type="file"]')].find((input) =>
    (input.getAttribute("accept") || "").includes("image/"),
  );
});
await imageInput.asElement().uploadFile(sample);
await wait(1200);
await page.screenshot({ path: path.join(outDir, "1-uploaded.png") });

// Open the callouts panel and add a note.
await page.evaluate(() => {
  const button = [...document.querySelectorAll("button")].find(
    (item) => item.getAttribute("aria-label") === "Callouts",
  );
  button?.click();
});
await wait(300);
await page.evaluate(() => {
  const button = [...document.querySelectorAll("button")].find((item) =>
    (item.textContent || "").trim().includes("Add callout"),
  );
  button?.click();
});
await wait(500);
await page.screenshot({ path: path.join(outDir, "2-callout.png") });

// Open the Looks dialog.
await page.evaluate(() => {
  const button = [...document.querySelectorAll("button")].find((item) =>
    (item.textContent || "").trim().includes("Looks"),
  );
  button?.click();
});
await wait(400);
await page.screenshot({ path: path.join(outDir, "3-looks.png") });

// Apply the Mint look and close the dialog.
await page.evaluate(() => {
  const button = [...document.querySelectorAll("button")].find((item) =>
    (item.textContent || "").trim().startsWith("Mint"),
  );
  button?.click();
});
await wait(400);
await page.evaluate(() => {
  const button = [...document.querySelectorAll("button")].find(
    (item) => (item.textContent || "").trim() === "Done",
  );
  button?.click();
});
await wait(500);
await page.screenshot({ path: path.join(outDir, "4-mint.png") });

// Export a 2x PNG.
await page.evaluate(() => {
  const button = [...document.querySelectorAll("button")].find((item) =>
    (item.textContent || "").trim().includes("Export"),
  );
  button?.click();
});
await wait(400);
await page.evaluate(() => {
  const button = [...document.querySelectorAll("button")].find(
    (item) => (item.textContent || "").trim() === "Download",
  );
  button?.click();
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
