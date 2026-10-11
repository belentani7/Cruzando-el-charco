#!/usr/bin/env node
/*
 * check-dist.mjs — verifica el artefacto que se publica en GitHub Pages.
 *
 * Comprueba lo que los tests de origen no ven:
 *  1. que todo enlace y asset local referenciado exista dentro de dist/;
 *  2. que no se cuele ningún origen remoto (privacidad y CSP);
 *  3. que la lista CORE del service worker exista en dist (offline real);
 *  4. que index.html conserve su CSP y el bloque sin JavaScript.
 *
 * Uso: node scripts/build-pages.mjs && node scripts/check-dist.mjs
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const failures = [];

const exists = async (path) => {
  try { await stat(path); return true; } catch { return false; }
};

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
};

if (!(await exists(dist))) {
  console.error("DIST_MISSING: ejecuta antes npm run build");
  process.exit(1);
}

const files = await walk(dist);
const htmlFiles = files.filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relative = file.slice(dist.length + 1);
  const references = [
    ...[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]),
    ...[...html.matchAll(/content="[^"]*url=([^"]+)"/g)].map((match) => match[1])
  ];
  for (const reference of references) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(reference)) {
      if (/^https?:\/\//.test(reference)) {
        // El sitio solo puede enlazar fuera, nunca cargar recursos remotos.
        if (/(?:src)="http/.test(html) || /<link[^>]+href="http/.test(html)) {
          failures.push(`${relative}: carga un recurso remoto (${reference})`);
        }
      }
      continue;
    }
    const [path] = reference.split("#");
    if (!path) continue;
    // Los enlaces relativos se resuelven contra la carpeta del propio archivo.
    const target = normalize(join(dirname(file), path));
    if (!(await exists(target))) failures.push(`${relative}: enlace interno roto → ${reference}`);
  }
}

const sw = await readFile(join(dist, "sw.js"), "utf8");
const core = [...sw.matchAll(/"([^"]+)"/g)].map((match) => match[1]).filter((value) => /\.(js|css|json|html|webmanifest|svg|jpg|png)$/.test(value) || value === "./");
for (const entry of core) {
  const path = entry === "./" ? join(dist, "index.html") : join(dist, entry);
  if (!(await exists(path))) failures.push(`sw.js: CORE apunta a un archivo que no está en dist → ${entry}`);
}

const index = await readFile(join(dist, "index.html"), "utf8");
if (!/Content-Security-Policy/.test(index)) failures.push("index.html sin CSP en dist");
if (!/GENERATED:emergency-grid/.test(index)) failures.push("index.html sin fallback estático de urgencias");
if (/<script src="http/.test(index)) failures.push("index.html carga scripts remotos");

const pages = await readFile(join(dist, "index.html"), "utf8");
for (const doc of ["README.md", "CREDITS.md", "SECURITY.md"]) {
  if (pages.includes(`"${doc}"`) && !(await exists(join(dist, doc)))) failures.push(`el pie enlaza ${doc} y no está en dist`);
}

if (failures.length) {
  console.error(`DIST_CHECK_FAILED count=${failures.length}`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`DIST_CHECK_OK html=${htmlFiles.length} sw_core=${core.length} files=${files.length}`);
