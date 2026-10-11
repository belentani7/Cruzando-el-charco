#!/usr/bin/env node
/**
 * insert-locale-keys.mjs — utilidad de mantenimiento para el catálogo i18n.
 *
 * Añade o actualiza claves de traducción en los 11 bloques de `assets/content.js`
 * sin tocar el resto del archivo. Existe porque las claves nuevas deben llegar a
 * todos los idiomas a la vez y la paridad la verifica `npm run i18n:audit`.
 *
 * Uso:
 *   node scripts/insert-locale-keys.mjs ruta.json          # aplicación real
 *   node scripts/insert-locale-keys.mjs ruta.json --dry    # solo comprobar
 *
 * Formato del JSON: { "clave": { "es": "…", "ca": "…", … } } con los 11 idiomas.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const [, , file, ...flags] = process.argv;
const dry = flags.includes("--dry");
if (!file) {
  console.error("Uso: node scripts/insert-locale-keys.mjs <claves.json> [--dry]");
  process.exit(1);
}

const LOCALES = ["es", "ca", "en", "it", "fr", "de", "pt", "zh", "ur", "ar", "fi"];
const table = JSON.parse(await readFile(file, "utf8"));
const target = join(root, "assets", "content.js");
const original = await readFile(target, "utf8");

const problems = [];
for (const [key, values] of Object.entries(table)) {
  for (const locale of LOCALES) {
    const value = values[locale];
    if (typeof value !== "string" || !value.trim()) problems.push(`${key}: falta ${locale}`);
  }
  const unknown = Object.keys(values).filter((locale) => !LOCALES.includes(locale));
  if (unknown.length) problems.push(`${key}: idiomas desconocidos ${unknown.join(", ")}`);
}
if (problems.length) {
  console.error("Locale keys rejected:\n" + problems.join("\n"));
  process.exit(1);
}

const sandbox = { console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(original, sandbox);
const existing = sandbox.CHARCO_CONTENT.messages.es;

let source = original;
const marks = LOCALES.map((locale) => {
  const pattern = locale === "es"
    ? /^  const es = \{/m
    : new RegExp("^    " + locale + ": locale\\(", "m");
  const match = pattern.exec(source);
  if (!match) throw new Error(`No se encontró el bloque del idioma ${locale}`);
  return { locale, start: match.index };
});
const blocks = {};
marks.forEach(({ locale, start }, index) => {
  const end = index + 1 < marks.length ? marks[index + 1].start : source.indexOf("\n  };", start);
  blocks[locale] = { start, end, text: source.slice(start, end) };
});

const escape = (value) => value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
let added = 0;
let updated = 0;

for (const locale of LOCALES) {
  const block = blocks[locale];
  const additions = [];
  for (const [key, values] of Object.entries(table)) {
    const value = values[locale];
    const existingPair = new RegExp("(\\b" + key + ": )\"([^\"]*)\"");
    if (existingPair.test(block.text)) {
      const before = block.text;
      block.text = block.text.replace(existingPair, (_match, prefix) => prefix + '"' + escape(value) + '"');
      if (block.text !== before) updated += 1;
    } else {
      additions.push(`${key}: "${escape(value)}"`);
    }
  }
  if (additions.length) {
    const closing = locale === "es" ? "\n  };" : "\n    })";
    const index = block.text.lastIndexOf(closing);
    if (index === -1) throw new Error(`Bloque ${locale} sin cierre esperado`);
    const indent = locale === "es" ? "    " : "      ";
    const lines = [];
    for (let position = 0; position < additions.length; position += 3) {
      lines.push(indent + additions.slice(position, position + 3).join(", "));
    }
    const prefix = block.text.slice(0, index).replace(/[\s,]+$/, "");
    block.text = prefix + ",\n" + lines.join(",\n") + block.text.slice(index);
    added += additions.length;
  }
}

for (const block of Object.values(blocks).sort((a, b) => b.start - a.start)) {
  source = source.slice(0, block.start) + block.text + source.slice(block.end);
}

const check = { console };
check.window = check;
check.globalThis = check;
vm.createContext(check);
vm.runInContext(source, check);
const esKeys = Object.keys(check.CHARCO_CONTENT.messages.es);
const missing = LOCALES.filter((locale) => esKeys.some((key) => !(key in check.CHARCO_CONTENT.messages[locale])));

console.log(
  `${dry ? "DRY RUN · " : ""}inserted=${added} updated=${updated} keys=${esKeys.length} `
  + `collisions=${Object.keys(table).filter((key) => key in existing).length} parity=${missing.length ? missing.join(",") : "OK"}`
);
if (missing.length) process.exit(1);
if (!dry) await writeFile(target, source);
