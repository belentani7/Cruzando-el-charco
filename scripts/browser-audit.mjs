import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = normalize(join(fileURLToPath(new URL(".", import.meta.url)), ".."));
const mime = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".md": "text/markdown; charset=utf-8"
};

const server = createServer(async (request, response) => {
  try {
    const requested = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
    const path = normalize(join(root, relative));
    if (!path.startsWith(root)) throw new Error("Invalid path");
    const body = await readFile(path);
    response.writeHead(200, { "content-type": mime[extname(path)] || "application/octet-stream", "cache-control": "no-store" });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});
await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));

const chromiumPath = process.env.CHROMIUM_PATH ?? (process.platform === "linux" ? "/usr/bin/chromium" : undefined);
const launchOptions = chromiumPath
  ? { executablePath: chromiumPath, headless: true }
  : process.platform === "win32"
    ? { channel: "msedge", headless: true }
    : { headless: true };
const browser = await chromium.launch(launchOptions);
const errors = [];

async function auditPage(viewport, screenshotName) {
  const context = await browser.newContext({ viewport, colorScheme: "light", reducedMotion: "no-preference" });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.waitForSelector("#resource-grid .resource-card");

  const initialCards = await page.locator("#resource-grid .resource-card").count();
  if (initialCards !== 29) errors.push(`expected 29 non-adult resources, received ${initialCards}`);
  if (await page.locator("#radio-toggle").getAttribute("aria-pressed") !== "false") errors.push("radio started active");

  await page.locator("#theme-toggle").click();
  if (await page.locator("html").getAttribute("data-theme") !== "night") errors.push("night mode did not activate");
  await page.locator("#language-select").selectOption("en");
  if (!(await page.locator("#hero-title").textContent()).includes("Arrive")) errors.push("English locale did not apply");
  await page.locator("#language-select").selectOption("ar");
  if (await page.locator("html").getAttribute("dir") !== "rtl") errors.push("Arabic locale did not activate RTL layout");
  await page.locator("#language-select").selectOption("en");
  await page.locator("#adult-filter").check();
  if (await page.locator("#resource-grid .resource-card").count() !== 32) errors.push("adult filter did not reveal three discreet resources");

  await page.locator("#plan-form button[type=submit]").click();
  if ((await page.locator("#plan-output h3").textContent()) === "Tu ruta aparecerá aquí") errors.push("plan generator did not run");
  await page.locator("#agent-question").fill("¿Dónde puedo pedir orientación sobre asilo?");
  await page.locator("#agent-form button").click();
  await page.waitForFunction(() => document.querySelectorAll("#chat-log .chat-message").length >= 3);

  await page.locator("#radio-toggle").click();
  if (await page.locator("#radio-toggle").getAttribute("aria-pressed") !== "true") errors.push("radio did not activate after user action");
  await page.locator("#radio-toggle").click();
  if (await page.locator("#radio-toggle").getAttribute("aria-pressed") !== "false") errors.push("radio did not stop");

  await page.addScriptTag({ url: "http://127.0.0.1:4173/node_modules/axe-core/axe.min.js" });
  const runAxe = () => page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] }
  }));
  const nightAxe = await runAxe();
  await page.locator("#theme-toggle").click();
  await page.waitForTimeout(350);
  const dayAxe = await runAxe();
  await page.locator("#theme-toggle").click();
  await page.waitForTimeout(350);
  const violations = [...nightAxe.violations, ...dayAxe.violations];
  const severe = violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  severe.forEach((violation) => {
    const samples = violation.nodes.slice(0, 50).map((node) => node.target.join(" ")).join(" | ");
    errors.push(`axe ${violation.id}: ${violation.nodes.length} node(s) · ${samples}`);
  });
  if (viewport.width < 500) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: join(root, "test-results", screenshotName), fullPage: false });
    await page.locator("#directorio").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(root, "test-results", "mobile-directory.png"), fullPage: false });
  } else {
    await page.screenshot({ path: join(root, "test-results", screenshotName), fullPage: true });
  }
  await context.close();
  return { violations: violations.length, severe: severe.length, ids: violations.map((violation) => violation.id) };
}

try {
  const desktop = await auditPage({ width: 1440, height: 1000 }, "desktop.png");
  const mobile = await auditPage({ width: 390, height: 844 }, "mobile.png");
  if (errors.length) {
    console.error(`BROWSER_AUDIT_FAILED count=${errors.length}`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log(`BROWSER_AUDIT_OK desktop_axe=${desktop.violations}/${desktop.severe} mobile_axe=${mobile.violations}/${mobile.severe} remaining=${[...new Set([...desktop.ids, ...mobile.ids])].join(",") || "none"}`);
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
