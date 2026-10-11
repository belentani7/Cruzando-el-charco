import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const required = [
  "index.html", "legal.html", "404.html", "manifest.webmanifest", "sw.js", "README.md", "CREDITS.md",
  "PROMPT-MASTER.md", "AGENTS.md",
  "assets/styles.css", "assets/content.js", "assets/app.js", "assets/config.js", "data/news.json",
  "assets/vendor/gsap.min.js", "assets/vendor/ScrollTrigger.min.js", "assets/vendor/CustomEase.min.js", "assets/vendor/lenis.min.js",
  "assets/images/barcelona-pride.jpg", "assets/images/sitges-pride.jpg",
  "assets/ai-engine.js", "assets/studio.js", "assets/health.js", "assets/tramites.js", "assets/ux.js",
  "assets/theme-init.js", "ecosistema.html", "CONTENT-LICENSE.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md"
];
const errors = [];
for (const path of required) {
  try { await readFile(join(root, path)); } catch { errors.push(`Missing ${path}`); }
}

const html = await readFile(join(root, "index.html"), "utf8");
const js = await readFile(join(root, "assets", "app.js"), "utf8");
const dataJs = await readFile(join(root, "assets", "content.js"), "utf8");
const configJs = await readFile(join(root, "assets", "config.js"), "utf8");
const moduleJs = (await Promise.all(
  ["ai-engine.js", "studio.js", "health.js", "tramites.js", "ux.js", "theme-init.js"]
    .map((name) => readFile(join(root, "assets", name), "utf8"))
)).join("\n");
const workflowFiles = await readdir(join(root, ".github", "workflows"));
const checks = [
  [/<html lang="es"/, "Missing default language"],
  [/meta http-equiv="Content-Security-Policy"/, "Missing Content Security Policy"],
  [/id="quick-exit"/, "Missing quick exit"],
  [/id="theme-toggle"/, "Missing theme switch"],
  [/id="language-select"/, "Missing language selector"],
  [/prefers-reduced-motion/, "Missing reduced-motion handling"],
  [/ScrollTrigger/, "Missing ScrollTrigger integration"],
  [/window\.Lenis/, "Missing Lenis integration"],
  [/speechSynthesis/, "Missing text-to-speech"],
  [/agentApiUrl: ""/, "Agent API must default to local mode"],
  [/Object\.freeze/, "Content/config should be immutable"],
  [/zh: locale/, "Missing Chinese locale"],
  [/ur: locale/, "Missing Urdu locale"],
  [/ar: locale/, "Missing Arabic locale"],
  [/fi: locale/, "Missing Finnish locale"],
  [/news\.yml/, `News workflow missing; found ${workflowFiles.join(", ")}`],
  [/health-tools/, "Missing health tools mount"],
  [/studio-app/, "Missing music studio mount"],
  [/tramites-app/, "Missing procedures generator mount"],
  [/quick-find/, "Missing quick-find palette"],
  [/id="adult-filter"/, "Missing discreet/adult filter"],
  [/data-i18n-alt=/, "Images should expose translatable alt text"],
  [/data-i18n-aria-label=/, "Controls should expose translatable aria-labels"],
  [/meta: Object\.freeze\(/, "Content metadata should be published"],
  [/const t = \(key\)/, "Missing translation helper in app.js"],
  [/id="ai-prompt-text"/, "Missing master-prompt block in the AI section"],
  [/id="ai-copy"/, "Missing master-prompt copy control"]
];
const combined = `${html}\n${js}\n${dataJs}\n${configJs}\n${moduleJs}\n${workflowFiles.join("\n")}`;
checks.forEach(([pattern, message]) => { if (!pattern.test(combined)) errors.push(message); });

if (/<(?:audio|video)[^>]*\bautoplay\b|\.autoplay\s*=\s*true|autoplay:\s*true/i.test(combined)) errors.push("Autoplay is forbidden");
if (/sk-[A-Za-z0-9_-]{20,}|gsk_[A-Za-z0-9]{20,}|GROQ_API_KEY\s*=\s*[^$\s]/.test(combined)) errors.push("Possible committed secret");
// Solo se persiguen promesas absolutas de seguridad, salud o curación: "vuelta garantizada"
// o "cita garantizada" son compromisos operativos, no afirmaciones médicas ni de seguridad.
const absoluteClaims = [
  /100%\s*(?:privad|segur|an[oó]nimo)/i,
  /(?:seguridad|salud|privacidad|curaci[oó]n|curar|sana)\s+(?:totalmente\s+)?garantizad/i,
  /garantizad[oa]s?\s+(?:la\s+)?(?:seguridad|salud|privacidad|curaci[oó]n)/i,
  /\bcura\s+definitiva\b/i,
  /(?:te|se)\s+cura\b/i
];
if (absoluteClaims.some((pattern) => pattern.test(combined))) errors.push("Absolute safety/health claim detected");
if ((html.match(/<section\b/g) || []).length < 10) errors.push("Fewer than 10 content sections");
if ((dataJs.match(/title:/g) || []).length < 40) errors.push("Content catalogue unexpectedly thin");
if (!/skip.*quickExit/s.test(dataJs) || (dataJs.match(/^\s{4}[a-z][A-Za-z0-9]*:/gm) || []).length < 100) errors.push("Locale catalogue looks incomplete");
for (const page of ["legal.html", "404.html", "ecosistema.html"]) {
  const pageHtml = await readFile(join(root, page), "utf8");
  const remote = [...pageHtml.matchAll(/<(?:script|link|img)\b[^>]*?\b(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((url) => /^https?:\/\//i.test(url) && !/^https:\/\/github\.com/i.test(url));
  if (remote.length) errors.push(`${page} loads remote assets: ${remote.slice(0, 3).join(", ")}`);
  if (!/Content-Security-Policy/.test(pageHtml)) errors.push(`${page} has no CSP meta tag`);
}

try {
  const news = JSON.parse(await readFile(join(root, "data", "news.json"), "utf8"));
  if (!Array.isArray(news.items)) errors.push("News items is not an array");
  if (news.total !== news.items.length) errors.push("News total does not match archive length");
} catch (error) { errors.push(`Invalid news JSON: ${error.message}`); }

if (errors.length) {
  console.error(`CHECK_FAILED count=${errors.length}`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`CHECK_OK files=${required.length} sections=${(html.match(/<section\b/g) || []).length} locales=11`);
