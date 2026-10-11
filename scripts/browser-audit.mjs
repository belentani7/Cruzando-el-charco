import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { chromium } from "@playwright/test";

const root = normalize(join(fileURLToPath(new URL(".", import.meta.url)), ".."));

// Las cifras esperadas se derivan de la fuente de verdad (assets/content.js),
// no se escriben a mano: así la auditoría no envejece cuando crece el directorio.
const contentContext = { window: {} };
vm.createContext(contentContext);
vm.runInContext(await readFile(join(root, "assets", "content.js"), "utf8"), contentContext);
const RESOURCES = contentContext.window.CHARCO_CONTENT.resources;
const EXPECTED_VISIBLE = RESOURCES.filter((item) => !item.discreet).length;
const EXPECTED_WITH_ADULT = RESOURCES.length;
const EXPECTED_MAX = 200;
if (EXPECTED_VISIBLE < 10 || EXPECTED_WITH_ADULT < EXPECTED_VISIBLE || EXPECTED_WITH_ADULT > EXPECTED_MAX) {
  throw new Error(`content.js no parece razonable: visibles=${EXPECTED_VISIBLE} total=${EXPECTED_WITH_ADULT}`);
}

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
  if (initialCards !== EXPECTED_VISIBLE) errors.push(`expected ${EXPECTED_VISIBLE} non-adult resources, received ${initialCards}`);
  if (await page.locator("#radio-toggle").getAttribute("aria-pressed") !== "false") errors.push("radio started active");

  await page.locator("#theme-toggle").click();
  if (await page.locator("html").getAttribute("data-theme") !== "night") errors.push("night mode did not activate");
  await page.locator("#language-select").selectOption("en");
  if (!(await page.locator("#hero-title").textContent()).includes("Arrive")) errors.push("English locale did not apply");
  await page.locator("#language-select").selectOption("ar");
  if (await page.locator("html").getAttribute("dir") !== "rtl") errors.push("Arabic locale did not activate RTL layout");
  await page.locator("#language-select").selectOption("en");
  await page.locator("#adult-filter").check();
  const withAdult = await page.locator("#resource-grid .resource-card").count();
  if (withAdult !== EXPECTED_WITH_ADULT) errors.push(`adult filter did not reveal every discreet resource (${withAdult}/${EXPECTED_WITH_ADULT})`);

  await page.locator("#plan-form button[type=submit]").click();
  if ((await page.locator("#plan-output h3").textContent()) === "Tu ruta aparecerá aquí") errors.push("plan generator did not run");
  await page.locator("#agent-question").fill("¿Dónde puedo pedir orientación sobre asilo?");
  await page.locator("#agent-form button").click();
  await page.waitForFunction(() => document.querySelectorAll("#chat-log .chat-message").length >= 3);

  await page.locator("#radio-toggle").click();
  if (await page.locator("#radio-toggle").getAttribute("aria-pressed") !== "true") errors.push("radio did not activate after user action");
  await page.locator("#radio-toggle").click();
  if (await page.locator("#radio-toggle").getAttribute("aria-pressed") !== "false") errors.push("radio did not stop");

  // Herramientas locales: salud, estudio de sonido y generador de trámites.
  const healthButtons = await page.locator("#health-tools button").count();
  if (healthButtons < 3) errors.push(`health tools rendered only ${healthButtons} controls`);
  const studioToggle = page.locator("#studio-app [aria-pressed]").first();
  if ((await studioToggle.getAttribute("aria-pressed")) !== "false") errors.push("studio audio started without user action");
  await page.locator("#tramites-app select").first().selectOption({ index: 1 });
  await page.locator("#tramites-app select").nth(1).selectOption({ index: 1 });
  await page.locator("#tramites-app select").nth(2).selectOption({ index: 1 });
  await page.locator("#tramites-app button[type=submit], #tramites-app .button-primary").first().click();
  await page.waitForTimeout(300);
  const tramitesSteps = await page.locator("#tramites-app li").count();
  if (tramitesSteps < 3) errors.push(`tramites generator rendered ${tramitesSteps} steps`);
  // Contrato de IA visible: prompt publicado, copiable y traducido.
  const promptLength = (await page.locator("#ai-prompt-text").textContent() || "").trim().length;
  if (promptLength < 200) errors.push(`master prompt block looks empty (${promptLength} chars)`);
  if (!(await page.locator("#ai-copy").isVisible())) errors.push("master prompt copy control is not visible");
  if (!(await page.locator("#ai-prompt-text").textContent()).includes("PROMPT-MASTER.md")) errors.push("master prompt does not cite PROMPT-MASTER.md");
  const aiTitleEnglish = await page.locator("#ai-title").textContent();
  if (!aiTitleEnglish.includes("contract")) errors.push("AI section title did not follow the English locale");

  await page.keyboard.press("Control+k");
  await page.waitForTimeout(150);
  const paletteOpen = await page.locator("#quick-find").isVisible().catch(() => false);
  if (!paletteOpen) errors.push("quick find palette did not open with Control+K");
  await page.keyboard.press("Escape");

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
