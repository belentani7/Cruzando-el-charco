#!/usr/bin/env node
/**
 * audit-all.mjs — orquestador de auditorías locales.
 *
 * Ejecuta de una vez todo lo que se puede verificar sin red ni navegador:
 * estructura y seguridad, i18n, HTML, DOM funcional, agentes y build/dist.
 * El audit de navegador (axe + Playwright) se ejecuta aparte porque necesita
 * Chromium: `npm run browser:audit`.
 *
 * Uso:
 *   node scripts/audit-all.mjs             # resumen legible
 *   node scripts/audit-all.mjs --json      # salida para máquinas
 *   node scripts/audit-all.mjs --with-dist # incluye build + check-dist
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = new Set(process.argv.slice(2));
const asJson = args.has("--json");

const steps = [
  { name: "estructura y seguridad", command: ["node", "scripts/check-site.mjs"], id: "check" },
  { name: "sincronía de datos estáticos", command: ["node", "scripts/sync-static.mjs"], id: "static" },
  { name: "traducciones y paridad", command: ["node", "scripts/i18n-audit.mjs"], id: "i18n" },
  { name: "HTML válido", command: ["npx", "--no-install", "html-validate", "index.html", "legal.html", "404.html"], id: "html" },
  { name: "DOM funcional (jsdom)", command: ["node", "scripts/dom-audit.mjs"], id: "dom" },
  { name: "agentes locales y seguridad", command: ["node", "scripts/eval-agents.mjs"], id: "agents" }
];
if (args.has("--with-dist")) {
  steps.push({ name: "build de publicación", command: ["node", "scripts/build-pages.mjs"], id: "build" });
  steps.push({ name: "integridad de dist", command: ["node", "scripts/check-dist.mjs"], id: "dist" });
}

const runStep = (step) => new Promise((resolve) => {
  const child = spawn(step.command[0], step.command.slice(1), { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  child.on("close", (code) => resolve({ ...step, code, output: output.trim() }));
  child.on("error", (error) => resolve({ ...step, code: 1, output: error.message }));
});

const results = [];
for (const step of steps) {
  const result = await runStep(step);
  results.push(result);
  if (!asJson) {
    const mark = result.code === 0 ? "ok  " : "FAIL";
    const last = result.output.split("\n").filter(Boolean).pop() || "(sin salida)";
    console.log(`${mark} ${result.name} · ${last}`);
  }
  if (result.code !== 0 && step.id === "check") break;
}

const failed = results.filter((result) => result.code !== 0);
const summary = {
  generatedAt: new Date().toISOString(),
  steps: results.map(({ id, name, code, output }) => ({ id, name, code, summary: output.split("\n").filter(Boolean).pop() || "" })),
  failed: failed.map((result) => result.id)
};

if (asJson) console.log(JSON.stringify(summary, null, 2));
console.log(
  failed.length
    ? `AUDIT_ALL_FAILED failed=${failed.map((result) => result.id).join(",")}`
    : `AUDIT_ALL_OK steps=${results.length}`
);
process.exit(failed.length ? 1 : 0);
