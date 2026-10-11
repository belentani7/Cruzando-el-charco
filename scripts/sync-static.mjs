#!/usr/bin/env node
/*
 * sync-static.mjs — mantiene el contenido crítico visible SIN JavaScript.
 *
 * Por qué existe: el PRD exige que urgencias y ruta de llegada se lean aunque
 * el navegador no ejecute JS (dato agotado, navegador antiguo, lector de
 * pantalla estricto). Ese HTML debe existir en index.html, pero no puede
 * convertirse en una segunda fuente de verdad.
 *
 * La solución: assets/content.js sigue siendo la fuente única y este script
 * genera el bloque estático entre marcadores. En CI se ejecuta sin --write:
 * si alguien edita content.js y olvida regenerar, el check falla.
 *
 * Uso:
 *   node scripts/sync-static.mjs            # verifica (CI)
 *   node scripts/sync-static.mjs --write    # regenera index.html
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const write = process.argv.includes("--write");

globalThis.window = {};
await import(pathToFileURL(join(root, "assets", "content.js")).href);
const content = globalThis.window.CHARCO_CONTENT;

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const safeUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:", "tel:"].includes(url.protocol) ? url.href : "#";
  } catch { return "#"; }
};

const emergencyMarkup = [
  "<!-- GENERATED:emergency-grid · scripts/sync-static.mjs · no editar a mano -->",
  ...content.emergencies.map((item) => [
    '        <article class="emergency-card">',
    `          <h3>${escapeHtml(item.title)}</h3>`,
    `          <p>${escapeHtml(item.detail)}</p>`,
    `          <a class="phone" href="tel:${escapeHtml(item.phone)}" aria-label="Llamar ${escapeHtml(item.label).replaceAll(" ", "&nbsp;")}">${escapeHtml(item.label).replaceAll(" ", "&nbsp;")}</a>`,
    `          <a class="source-link" href="${escapeHtml(safeUrl(item.source))}" target="_blank" rel="noopener noreferrer">Abrir fuente</a>`,
    "        </article>"
  ].join("\n")),
  "        <!-- /GENERATED:emergency-grid -->"
].join("\n");

const routeMarkup = [
  "<!-- GENERATED:route-list · scripts/sync-static.mjs · no editar a mano -->",
  ...content.routes.map((item) => [
    '        <li class="route-step">',
    `          <time>${escapeHtml(item.time)}</time>`,
    `          <h3>${escapeHtml(item.title)}</h3>`,
    `          <p>${escapeHtml(item.text)}</p>`,
    "        </li>"
  ].join("\n")),
  "      <!-- /GENERATED:route-list -->"
].join("\n");

const indexPath = join(root, "index.html");
let html = await readFile(indexPath, "utf8");

const replaceBlock = (source, name, markup) => {
  const start = `<!-- GENERATED:${name} · scripts/sync-static.mjs · no editar a mano -->`;
  const end = `<!-- /GENERATED:${name} -->`;
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end);
  if (startIndex === -1 || endIndex === -1) throw new Error(`Marcadores ${name} no encontrados en index.html`);
  const before = source.slice(0, startIndex);
  const after = source.slice(endIndex + end.length);
  const body = markup.split("\n").slice(1, -1).join("\n");
  return `${before}${start}\n${body}\n      ${end}${after}`;
};

const next = replaceBlock(replaceBlock(html, "emergency-grid", emergencyMarkup), "route-list", routeMarkup);

if (next === html) {
  console.log(`STATIC_SYNC_OK emergencias=${content.emergencies.length} rutas=${content.routes.length}`);
} else if (write) {
  await writeFile(indexPath, next, "utf8");
  console.log(`STATIC_SYNC_WRITTEN emergencias=${content.emergencies.length} rutas=${content.routes.length}`);
} else {
  console.error("STATIC_SYNC_DRIFT: el bloque estático de index.html no coincide con assets/content.js");
  console.error("Ejecuta: node scripts/sync-static.mjs --write");
  process.exitCode = 1;
}
