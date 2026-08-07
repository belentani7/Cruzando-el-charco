import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const required = [
  "index.html", "legal.html", "404.html", "manifest.webmanifest", "sw.js", "README.md", "CREDITS.md",
  "assets/styles.css", "assets/content.js", "assets/app.js", "assets/config.js", "data/news.json",
  "assets/vendor/gsap.min.js", "assets/vendor/ScrollTrigger.min.js", "assets/vendor/CustomEase.min.js", "assets/vendor/lenis.min.js",
  "assets/images/barcelona-pride.jpg", "assets/images/sitges-pride.jpg"
];
const errors = [];
for (const path of required) {
  try { await readFile(join(root, path)); } catch { errors.push(`Missing ${path}`); }
}

const html = await readFile(join(root, "index.html"), "utf8");
const js = await readFile(join(root, "assets", "app.js"), "utf8");
const dataJs = await readFile(join(root, "assets", "content.js"), "utf8");
const configJs = await readFile(join(root, "assets", "config.js"), "utf8");
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
  [/news\.yml/, `News workflow missing; found ${workflowFiles.join(", ")}`]
];
const combined = `${html}\n${js}\n${dataJs}\n${configJs}\n${workflowFiles.join("\n")}`;
checks.forEach(([pattern, message]) => { if (!pattern.test(combined)) errors.push(message); });

if (/<audio[^>]+autoplay|autoplay/i.test(html)) errors.push("Autoplay is forbidden");
if (/sk-[A-Za-z0-9_-]{20,}|gsk_[A-Za-z0-9]{20,}|GROQ_API_KEY\s*=\s*[^$\s]/.test(combined)) errors.push("Possible committed secret");
if (/100% (?:privad|segur)|garantizad[oa]|cura\b/i.test(combined)) errors.push("Absolute safety/health claim detected");
if ((html.match(/<section\b/g) || []).length < 10) errors.push("Fewer than 10 content sections");
if ((dataJs.match(/title:/g) || []).length < 40) errors.push("Content catalogue unexpectedly thin");

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
