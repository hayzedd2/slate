import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(process.argv[2] || "http://localhost:3001", {
  waitUntil: "networkidle0",
});
await page.evaluate(() => {
  document.querySelector('button[aria-label="Toggle background"]')?.click();
});
await new Promise((r) => setTimeout(r, 300));
const result = await page.evaluate(() => {
  const canvas = document.querySelector("svg[data-slate-canvas]");
  const wrapper = canvas?.parentElement;
  const cs = wrapper ? getComputedStyle(wrapper) : null;
  return {
    wrapperClass: wrapper?.className,
    bgColor: cs?.backgroundColor,
    bgImage: cs?.backgroundImage,
    bgSize: cs?.backgroundSize,
    htmlClass: document.documentElement.className,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
