import puppeteer from "puppeteer-core";

const url = process.argv[2] || "http://localhost:3001";
const out = process.argv[3] || "screenshot.png";
const width = Number(process.argv[4] || 1440);
const height = Number(process.argv[5] || 900);

const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox", "--font-render-hinting=none"],
});

const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
page.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warning") {
    console.log(`[console.${message.type()}]`, message.text());
  }
});
page.on("pageerror", (error) => console.error("[pageerror]", error.message));

await page.goto(url, { waitUntil: "networkidle0" });
await page.evaluate(async () => {
  await document.fonts.ready;
});
await new Promise((resolve) => setTimeout(resolve, 500));
await page.screenshot({ path: out });
console.log("saved", out);
await browser.close();
