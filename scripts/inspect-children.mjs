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
// Add a callout so the editor panel is populated.
await page.evaluate(() => {
  const button = [...document.querySelectorAll("button")].find(
    (item) => item.getAttribute("aria-label") === "Callouts",
  );
  button?.click();
});
await new Promise((resolve) => setTimeout(resolve, 300));
await page.evaluate(() => {
  const button = [...document.querySelectorAll("button")].find((item) =>
    (item.textContent || "").trim().includes("Add callout"),
  );
  button?.click();
});
await new Promise((resolve) => setTimeout(resolve, 400));

const result = await page.evaluate(() => {
  const aside = document.querySelector("aside");
  const section = [...(aside?.querySelectorAll("section") || [])].find(
    (item) => (item.textContent || "").includes("Selected callout"),
  );
  const rect = (element) => {
    if (!element) return null;
    const box = element.getBoundingClientRect();
    return {
      tag: element.tagName,
      cls: (element.className || "").toString().slice(0, 80),
      left: Math.round(box.left),
      right: Math.round(box.right),
      width: Math.round(box.width),
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    };
  };
  return {
    section: rect(section),
    header: rect(section?.querySelector(":scope > div")),
    action: rect(section?.querySelector(":scope > div > :last-child")),
    inputs: [...(section?.querySelectorAll("input, textarea, button") || [])].map(
      rect,
    ),
    sliders: [...(section?.querySelectorAll('[data-slot="slider"]') || [])].map(
      rect,
    ),
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
