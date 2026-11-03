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
const result = await page.evaluate(() => {
  const rect = (element) => {
    if (!element) return null;
    const box = element.getBoundingClientRect();
    return {
      left: Math.round(box.left),
      right: Math.round(box.right),
      width: Math.round(box.width),
    };
  };
  const aside = document.querySelector("aside");
  const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
  const content = aside?.querySelector(".px-6");
  const section = aside?.querySelector("section");
  const header = section?.querySelector("div");
  return {
    innerWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    aside: rect(aside),
    viewport: rect(viewport),
    content: rect(content),
    section: rect(section),
    header: rect(header),
    contentScrollWidth: content?.scrollWidth,
    contentClientWidth: content?.clientWidth,
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
