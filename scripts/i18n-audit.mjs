/**
 * Auditoría de traducciones.
 *
 * Comprueba, sin red y sin navegador:
 *  1. Paridad exacta de claves entre los 11 idiomas y el español.
 *  2. Que cada clave `data-i18n*` usada en HTML/JS exista en todos los idiomas.
 *  3. Que ninguna cadena larga se quede en español por descuido (lista blanca de
 *     marcas y cognados legítimos, p. ej. "Música" en portugués).
 *  4. Que las claves nuevas de los módulos (salud, música, trámites, UX) existan
 *     y no estén vacías.
 *
 * Uso: node scripts/i18n-audit.mjs [--json] [--verbose]
 */
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = new Set(process.argv.slice(2));
const json = args.has("--json");
const verbose = args.has("--verbose");

const LOCALES = ["es", "ca", "en", "it", "fr", "de", "pt", "zh", "ur", "ar", "fi"];
const RTL = ["ar", "ur"];

/** Cadenas iguales al español que son legítimas: marcas, cognados y nombres propios. */
const ALLOWED_IDENTICAL = new Map([
  ["radioTitle", "nombre propio de la emisora, se mantiene igual en varios idiomas"],
  ["levelB", "'Comunitaria' es cognado válido en italiano"],
  ["shareCard", "'Compartir' es válido en catalán y portugués"],
  ["paletteResources", "'Recursos' es válido en catalán y portugués"],
  ["moodExport", "'Exportar JSON' es válido en catalán y portugués"],
  ["print", "'Imprimir' es válido en portugués y catalán"],
  ["copyCard", "'Copiar ficha' es válido en portugués"],
  ["planCount", "'fichas guardadas' es válido en portugués"],
  ["costAsk", "'Consultar' es válido en catalán, portugués e italiano"],
  ["planMood6", "'Aventura' es válido en catalán, portugués e italiano"],
  ["cityBcnLink", "'Agenda oficial' es válido en catalán, portugués e italiano"],
  ["sec03", "el rótulo de sección 'VIDA REAL' coincide en catalán y portugués"],
  ["sec04", "el rótulo 'MAPA HUMANO' coincide en portugués"],
  ["sec07", "el rótulo 'RADAR CULTURAL' coincide en catalán y portugués"],
  ["discreet", "'Modo discreto' coincide en portugués"],
  ["aiBadgeRemote", "'Remoto opcional' es válido en portugués"],
  ["aiCopy", "'Copiar prompt' es válido en portugués"]
]);

const MIN_LENGTH_TO_CHECK = 8;

const sandbox = { console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
const contentSource = await readFile(join(root, "assets", "content.js"), "utf8");
vm.runInContext(contentSource, sandbox);
const messages = sandbox.CHARCO_CONTENT.messages;

const errors = [];
const warnings = [];
const stats = { keys: 0, locales: LOCALES.length, identicalAllowed: 0 };

/* 1. Paridad de claves ---------------------------------------------------- */
const esKeys = Object.keys(messages.es).sort();
stats.keys = esKeys.length;
if (esKeys.length < 150) errors.push(`El catálogo español parece incompleto: ${esKeys.length} claves`);
for (const locale of LOCALES) {
  const table = messages[locale];
  if (!table) { errors.push(`Falta el idioma ${locale}`); continue; }
  const keys = Object.keys(table).sort();
  const missing = esKeys.filter((key) => !(key in table));
  const extra = keys.filter((key) => !(key in messages.es));
  if (missing.length) errors.push(`${locale}: faltan ${missing.length} claves (${missing.slice(0, 6).join(", ")}…)`);
  if (extra.length) errors.push(`${locale}: ${extra.length} claves desconocidas (${extra.slice(0, 6).join(", ")}…)`);
  for (const key of keys) {
    const value = table[key];
    if (typeof value !== "string" || !value.trim()) errors.push(`${locale}.${key}: valor vacío`);
  }
}

/* 2. Claves usadas en el marcado y en los scripts -------------------------- */
const htmlFiles = (await readdir(root)).filter((name) => name.endsWith(".html"));
const jsFiles = (await readdir(join(root, "assets"))).filter((name) => name.endsWith(".js"));
const attrPattern = /data-i18n(?:-placeholder|-alt|-aria-label|-title)?="([A-Za-z][A-Za-z0-9]*)"/g;
const usedKeys = new Map();
const sources = [
  ...htmlFiles.map((name) => join(root, name)),
  ...jsFiles.map((name) => join(root, "assets", name))
];
for (const file of sources) {
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(attrPattern)) {
    const key = match[1];
    usedKeys.set(key, (usedKeys.get(key) || 0) + 1);
  }
}
for (const key of [...usedKeys.keys()].sort()) {
  if (key in messages.es) continue;
  errors.push(`La interfaz usa data-i18n="${key}" y no existe en el catálogo español`);
}
for (const locale of LOCALES) {
  const missing = [...usedKeys.keys()].filter((key) => key in messages.es && !(key in messages[locale]));
  if (missing.length) errors.push(`${locale}: faltan ${missing.length} claves usadas en la interfaz (${missing.slice(0, 6).join(", ")}…)`);
}

/* 3. Cadenas largas sin traducir ------------------------------------------ */
const identicalReport = [];
for (const locale of LOCALES.filter((code) => code !== "es")) {
  for (const key of esKeys) {
    const source = messages.es[key];
    if (typeof source !== "string" || source.length < MIN_LENGTH_TO_CHECK) continue;
    if (messages[locale][key] !== source) continue;
    if (ALLOWED_IDENTICAL.has(key)) { stats.identicalAllowed += 1; continue; }
    identicalReport.push(`${locale}.${key} = ${JSON.stringify(source.slice(0, 48))}`);
  }
}
if (identicalReport.length) {
  errors.push(`${identicalReport.length} cadenas siguen en español sin justificar`);
  if (verbose) identicalReport.forEach((line) => warnings.push(line));
}

/* 4. Dirección de escritura ------------------------------------------------ */
for (const locale of RTL) {
  if (!messages[locale]) continue;
  const dirSetting = /\["ar", "ur"\]\.includes\(language\) \? "rtl" : "ltr"/.test(
    await readFile(join(root, "assets", "app.js"), "utf8")
  );
  if (!dirSetting) errors.push("app.js ya no marca dir=rtl para árabe y urdu");
  break;
}

/* Salida ------------------------------------------------------------------ */
const payload = {
  generatedAt: new Date().toISOString().slice(0, 10),
  locales: LOCALES,
  keys: stats.keys,
  uiKeys: usedKeys.size,
  identicalAllowed: stats.identicalAllowed,
  errors,
  warnings
};
if (json) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  if (verbose && warnings.length) warnings.forEach((line) => console.log(`· ${line}`));
  console.log(
    `i18n locales=${LOCALES.length} keys=${stats.keys} ui_keys=${usedKeys.size} `
    + `cognados_ok=${stats.identicalAllowed} errores=${errors.length}`
  );
}
if (errors.length) {
  if (!json) errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
if (!json) console.log("I18N_AUDIT_OK");
