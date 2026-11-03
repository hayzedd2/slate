import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const url = process.argv[2] || "http://localhost:3001";
const outDir =
  process.argv[3] ||
  "/private/var/folders/w1/b0gtpxdx7jd3flhc7v2d8v2m0000gn/T/opencode/slate-export";

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

const clickText = async (text) => {
  const clicked = await page.evaluate((label) => {
    const buttons = [...document.querySelectorAll("button")];
    const button = buttons.find((item) =>
      (item.textContent || "").trim().includes(label),
    );
    if (!button) return false;
    button.click();
    return true;
  }, text);
  if (!clicked) throw new Error(`Button not found: ${text}`);
};

await clickText("Export");
await new Promise((resolve) => setTimeout(resolve, 500));
await page.screenshot({ path: path.join(outDir, "dialog.png") });

await clickText("Download");

let result = "";
for (let attempt = 0; attempt < 40; attempt += 1) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  result = await page.evaluate(() => document.body.innerText);
  if (/Exported|failed|Could not|error/i.test(result)) break;
}

console.log("STATUS TEXT:", result.split("\n").filter(Boolean).slice(-6).join(" | "));
console.log("FILES:", fs.readdirSync(outDir));

await page.screenshot({ path: path.join(outDir, "after.png") });
await browser.close();
