import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const url = process.argv[2] || "http://localhost:3001";
await browser.defaultBrowserContext().overridePermissions(url, [
  "clipboard-read",
  "clipboard-write",
]);
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
page.on("console", (m) => console.log(`[console.${m.type()}]`, m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(url, { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// upload
const input = await page.evaluateHandle(() =>
  [...document.querySelectorAll('input[type="file"]')].find((i) =>
    (i.getAttribute("accept") || "").includes("image/"),
  ),
);
await input.asElement().uploadFile(
  "/private/var/folders/w1/b0gtpxdx7jd3flhc7v2d8v2m0000gn/T/opencode/sample-shot.png",
);
await wait(1000);

await page.keyboard.down("Meta");
await page.keyboard.press("e");
await page.keyboard.up("Meta");
await wait(500);
console.log("dialog open:", await page.evaluate(() => document.body.innerText.includes("Export image")));
console.log("focused:", await page.evaluate(() => document.hasFocus()));

const clicked = await page.evaluate(() => {
  const target = [...document.querySelectorAll("button")].find(
    (item) => (item.textContent || "").trim() === "Copy PNG",
  );
  target?.click();
  return Boolean(target);
});
console.log("clicked copy:", clicked);

for (let i = 0; i < 20; i += 1) {
  await wait(500);
  const state = await page.evaluate(async () => {
    let clip = null;
    try {
      const items = await navigator.clipboard.read();
      clip = items.flatMap((item) => item.types);
    } catch (error) {
      clip = String(error);
    }
    return {
      text: document.body.innerText.slice(-300),
      clip,
    };
  });
  console.log(i, JSON.stringify(state));
  if (state.text.includes("copied") || state.text.includes("Clipboard") || state.text.includes("failed")) break;
}
await browser.close();
