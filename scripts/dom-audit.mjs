#!/usr/bin/env node
/*
 * dom-audit.mjs — auditoría funcional sin navegador (jsdom).
 *
 * Por qué existe: browser-audit.mjs necesita Chromium. Este script permite
 * verificar en cualquier máquina (y en CI de forma rápida) que la capa
 * funcional sigue viva: fallback sin JavaScript, directorio, idiomas, salud,
 * sonido, trámites, buscador, plan privado y agentes con citas.
 *
 * Uso:
 *   node scripts/dom-audit.mjs            # resumen
 *   node scripts/dom-audit.mjs --verbose  # detalle de cada comprobación
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const verbose = process.argv.includes("--verbose");
const html = await readFile(join(root, "index.html"), "utf8");

globalThis.window = {};
await import(pathToFileURL(join(root, "assets", "content.js")).href);
const content = globalThis.window.CHARCO_CONTENT;

const failures = [];
const checks = [];
const check = (condition, label, detail = "") => {
  checks.push({ label, ok: Boolean(condition), detail });
  if (!condition) failures.push(`${label}${detail ? ` · ${detail}` : ""}`);
  if (verbose) console.log(`${condition ? "ok  " : "FAIL"} ${label}${detail ? ` · ${detail}` : ""}`);
  return Boolean(condition);
};

// jsdom no implementa canvas ni algunas APIs de navegador: se silencian esos
// avisos porque el objetivo es auditar la lógica, no el motor de render.
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", () => {});
virtualConsole.on("error", () => {});
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://charco.test/", virtualConsole });
const { window } = dom;

/* --------------------------------------------------------------- stubs ---- */
const noop = () => {};
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: noop,
  removeEventListener: noop,
  addListener: noop,
  removeListener: noop,
  dispatchEvent: () => false
});
window.Element.prototype.scrollIntoView = function scrollIntoView() { this.dataset.scrolled = "true"; };
window.print = noop;
window.URL.createObjectURL = () => "blob:charco-local";
window.URL.revokeObjectURL = noop;
Object.defineProperty(window.navigator, "clipboard", { value: { writeText: async () => {} }, configurable: true });
window.fetch = async (url) => ({
  ok: true,
  status: 200,
  json: async () => (String(url).includes("news.json") ? { total: 1, updated: "2026-10-11", items: [{ source: "Test", date: "2026-10-11", title: "Titular", description: "Descripción", url: "https://example.org/a" }] } : {})
});

// Fake de Web Audio: comprueba que el grafo se construye sin errores reales.
class FakeParam {
  constructor(value = 0) { this.value = value; }
  setValueAtTime() { return this; }
  linearRampToValueAtTime(value) { this.value = value; return this; }
  exponentialRampToValueAtTime() { return this; }
  cancelScheduledValues() { return this; }
  setTargetAtTime() { return this; }
}
class FakeNode {
  constructor(context) { this.context = context; this.gain = new FakeParam(1); this.frequency = new FakeParam(440); this.detune = new FakeParam(0); this.Q = new FakeParam(1); this.threshold = new FakeParam(0); this.knee = new FakeParam(0); this.ratio = new FakeParam(1); this.attack = new FakeParam(0); this.release = new FakeParam(0); }
  connect(target) { return target; }
  disconnect() {}
  start() {}
  stop() {}
  async startRendering() { return { numberOfChannels: 2, length: 44100 * 2, sampleRate: 44100, getChannelData: () => new Float32Array(0) }; }
}
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.state = "running"; this.sampleRate = 44100; this.destination = new FakeNode(this); }
  createGain() { return new FakeNode(this); }
  createOscillator() { return new FakeNode(this); }
  createBiquadFilter() { return new FakeNode(this); }
  createDynamicsCompressor() { return new FakeNode(this); }
  createConvolver() { return new FakeNode(this); }
  createBufferSource() { return new FakeNode(this); }
  createAnalyser() { const node = new FakeNode(this); node.fftSize = 512; node.frequencyBinCount = 256; node.getByteFrequencyData = () => {}; return node; }
  createBuffer(channels, length) { return { numberOfChannels: channels, length, sampleRate: 44100, getChannelData: () => new Float32Array(length) }; }
  close() { this.state = "closed"; return Promise.resolve(); }
}
window.AudioContext = FakeAudioContext;
window.OfflineAudioContext = FakeAudioContext;

const run = async (file) => {
  const code = await readFile(join(root, file), "utf8");
  window.eval(code);
};
const wait = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));
const $ = (selector, parent = window.document) => parent.querySelector(selector);
const $$ = (selector, parent = window.document) => [...parent.querySelectorAll(selector)];

/* ------------------------------------------------- 1. fallback sin JS ---- */
const staticPhones = [...html.matchAll(/<a class="phone" href="tel:(\d+)"/g)].map((match) => match[1]);
check(html.includes("GENERATED:emergency-grid"), "index.html contiene el bloque estático generado");
check(staticPhones.length === content.emergencies.length, "fallback sin JS con todos los teléfonos", `${staticPhones.length}/${content.emergencies.length}`);
check(!/<script src="https?:/.test(html), "sin scripts remotos");
check(!/<link[^>]+href="https?:/.test(html), "sin hojas de estilo remotas");
check(/meta http-equiv="Content-Security-Policy"/.test(html), "CSP declarada en index.html");

/* ------------------------------------------------------- 2. ejecución ---- */
for (const file of ["assets/config.js", "assets/content.js", "assets/app.js", "assets/ai-engine.js", "assets/studio.js", "assets/health.js", "assets/tramites.js", "assets/ux.js"]) {
  try { await run(file); } catch (error) { check(false, `ejecutar ${file}`, error.message); }
}
await wait(50);

check($$("#emergency-grid .emergency-card").length === content.emergencies.length, "urgencias renderizadas", `${$$("#emergency-grid .emergency-card").length}`);
check($$("#route-list .route-step").length === content.routes.length, "ruta de llegada renderizada");
const expectedCards = content.resources.filter((item) => !item.discreet).length;
check($$("#resource-grid .resource-card").length === expectedCards, "directorio sin +18", `${$$("#resource-grid .resource-card").length}/${expectedCards}`);
check($$("#culture-list .culture-card").length === content.culture.length, "radar cultural renderizado");
check($$("#agent-tabs .agent-tab").length === content.agents.length, "mesa de orientación con seis voces");
check($$("#news-grid .news-card").length >= 1, "archivo de noticias leído");

/* --------------------------------------------------------- 3. idiomas ---- */
const select = $("#language-select");
select.value = "en";
select.dispatchEvent(new window.Event("change", { bubbles: true }));
check(window.document.documentElement.lang === "en", "cambio a inglés");
check($("#hero-title").textContent.includes("Arrive"), "título traducido en inglés");
select.value = "ar";
select.dispatchEvent(new window.Event("change", { bubbles: true }));
check(window.document.documentElement.dir === "rtl", "árabe activa RTL");
select.value = "fi";
select.dispatchEvent(new window.Event("change", { bubbles: true }));
check($$("[data-fallback='es']").length > 0, "contenido sin traducir marcado como ES");
select.value = "es";
select.dispatchEvent(new window.Event("change", { bubbles: true }));

/* ------------------------------------------------------- 4. directorio ---- */
$("#adult-filter").checked = true;
$("#adult-filter").dispatchEvent(new window.Event("input", { bubbles: true }));
check($$("#resource-grid .resource-card").length === content.resources.length, "filtro +18 muestra todo el directorio");
$("#adult-filter").checked = false;
$("#adult-filter").dispatchEvent(new window.Event("input", { bubbles: true }));
$("#directory-search").value = "sitges";
$("#directory-search").dispatchEvent(new window.Event("input", { bubbles: true }));
const sitgesCards = $$("#resource-grid .resource-card").length;
check(sitgesCards > 0 && sitgesCards < content.resources.length, "búsqueda por texto filtra", `${sitgesCards} resultados`);
$("#directory-search").value = "";
$("#directory-search").dispatchEvent(new window.Event("input", { bubbles: true }));
check($$("#resource-grid .resource-card .level-badge").length === expectedCards, "cada ficha muestra su nivel editorial");
check(Boolean($("#level-filter")), "filtro por nivel editorial disponible");

/* ------------------------------------------------------------ 5. salud -- */
check($$("#health-tools .chip-route").length === content.tools.healthRoutes.length, "rutas de salud montadas");
$("#health-tools .chip-route").click();
await wait();
const routeOutput = $("#health-tools .health-route-output").textContent;
check(/112|024|061/.test(routeOutput), "la ruta de salud deriva a un teléfono real");
check($$("#health-tools .health-steps li").length > 2, "la ruta muestra pasos concretos");
const prepButton = $$("#health-tools button").find((button) => button.textContent.includes("Marcar la hora"));
prepButton.click();
await wait();
check(Boolean(window.localStorage.getItem("charco-pep-start")), "reloj PEP guarda solo en local");
check(/h/.test($("#health-tools .health-readout").textContent), "reloj PEP muestra el tiempo transcurrido");
const reminderForm = $("#health-tools .health-tracker form");
$("#health-tools .health-tracker input[type='text']").value = "Prueba local";
reminderForm.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
await wait();
check(JSON.parse(window.localStorage.getItem("charco-reminders") || "[]").length === 1, "recordatorio privado guardado");
const moodForm = $("#health-tools .health-mood form");
moodForm.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
await wait();
check(JSON.parse(window.localStorage.getItem("charco-mood") || "[]").length === 1, "diario de ánimo guardado en local");

/* ----------------------------------------------------------- 6. música -- */
check($$("#studio-app .studio-field select option").length === content.tools.soundPresets.length, "paisajes sonoros disponibles");
const playButton = $("#studio-app button");
check(playButton.getAttribute("aria-pressed") === "false", "el audio no arranca solo");
playButton.click();
await wait();
check(window.CHARCO_STUDIO.isPlaying() === true, "reproduce tras acción explícita");
check(playButton.getAttribute("aria-pressed") === "true", "estado del botón coherente");
playButton.click();
await wait(40);
check(window.CHARCO_STUDIO.isPlaying() === false, "se puede parar");

/* ---------------------------------------------------------- 7. trámites -- */
const tramiteSelects = $$("#tramites-app select");
tramiteSelects[0].value = "sin-papeles";
tramiteSelects[1].value = "documentos";
tramiteSelects[2].value = "3-12";
$("#tramites-app form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
await wait();
const steps = $$("#tramites-app .tramites-step");
check(steps.length >= 6, "el generador produce una ruta ordenada", `${steps.length} pasos`);
const sourceLabels = $$("#tramites-app .tramites-source").map((node) => node.textContent.replace(/^[^:]*:\s*/, ""));
const resourceTitles = new Set(content.resources.map((item) => item.title));
check(sourceLabels.length >= 5 && sourceLabels.every((label) => resourceTitles.has(label)), "cada paso cita un recurso real del directorio", `${sourceLabels.length} fuentes`);
const firstCheck = $("#tramites-app .tramites-step input[type='checkbox']");
firstCheck.checked = true;
firstCheck.dispatchEvent(new window.Event("change", { bubbles: true }));
await wait();
check((JSON.parse(window.localStorage.getItem("charco-tramites") || "{}").done || []).length === 1, "progreso de trámites guardado en local");

/* ----------------------------------------------------------- 8. buscador */
window.CHARCO_UX.openPalette();
await wait();
const paletteInput = $("#quick-find input");
check(Boolean(paletteInput), "buscador rápido disponible");
check($("#quick-find").hidden === false, "el buscador se abre");
paletteInput.value = "asilo";
paletteInput.dispatchEvent(new window.Event("input", { bubbles: true }));
await wait();
check($$("#quick-find .palette-item").length > 0, "el buscador encuentra resultados", `${$$("#quick-find .palette-item").length}`);
paletteInput.value = "zzzz-no-existe";
paletteInput.dispatchEvent(new window.Event("input", { bubbles: true }));
await wait();
check($("#quick-find .palette-empty") !== null, "el buscador muestra estado vacío");

/* -------------------------------------------------------- 9. plan privado */
const addButton = $$("#resource-grid .resource-card .text-button").find((button) => button.textContent.includes("Añadir a mi plan"));
addButton.click();
await wait();
check(window.CHARCO_PLAN.count() === 1, "el plan privado guarda fichas en local");
check($$("#plan-drawer .plan-drawer-list li").length === 1, "el plan muestra lo guardado");
check(JSON.parse(window.localStorage.getItem("charco-plan") || "[]").length === 1, "el plan solo usa localStorage");

/* ------------------------------------------------------------ 10. agentes */
$("#agent-question").value = "¿Dónde pido asilo si me persiguen por ser gay?";
$("#agent-form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
await wait(80);
check($$("#chat-log .chat-message").length >= 3, "la conversación responde");
check($$("#chat-log .chat-sources .chat-source").length >= 1, "la respuesta cita fuentes");
check(($("#agent-mode")?.textContent || "").includes("local"), "se indica que el motor es local");
$("#agent-question").value = "No quiero vivir más";
$("#agent-form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
await wait(80);
check($("#chat-log").textContent.includes("112"), "la ruta de crisis aparece en el chat");
check($$("#chat-log .chat-safety").length >= 1, "aviso de seguridad visible");

/* --------------------------------------------------- 10 bis. contrato IA */
const promptText = ($("#ai-prompt-text")?.textContent || "").trim();
check(promptText.length > 200, "el prompt master está publicado en la página", `${promptText.length} caracteres`);
check(promptText.includes("AGENTS.md") && promptText.includes("PROMPT-MASTER.md"), "el prompt cita las reglas de desarrollo");
check(($("#ai-copy")?.textContent || "").length > 0, "existe control para copiar el prompt");
check($$("#ia .ai-card").length === 3, "las tres tarjetas del contrato de IA están presentes");
const aiKeys = ["aiTitle","aiText","aiLocalTitle","aiRemoteTitle","aiLimitsTitle","aiPromptTitle","aiCopy","aiMetrics"];
check(aiKeys.every((key) => typeof content.messages.en[key] === "string" && content.messages.en[key] !== content.messages.es[key]),
  "el contrato de IA está traducido (inglés)", aiKeys.filter((key) => !content.messages.en[key] || content.messages.en[key] === content.messages.es[key]).join(","));

/* ------------------------------------------------------- 11. accesibilidad */
const imagesWithoutAlt = $$("img").filter((image) => !image.hasAttribute("alt"));
check(imagesWithoutAlt.length === 0, "todas las imágenes tienen texto alternativo");
const namelessButtons = $$("button").filter((button) => !(button.textContent || "").trim() && !button.getAttribute("aria-label"));
check(namelessButtons.length === 0, "todos los botones tienen nombre accesible", namelessButtons.map((button) => button.id || button.className).join(","));
const ids = $$("[id]").map((node) => node.id);
check(ids.length === new Set(ids).size, "sin identificadores duplicados");
check($$("nav[aria-label], main, header, footer").length >= 4, "regiones principales presentes");
const externalWithoutRel = $$('a[target="_blank"]').filter((link) => !(link.getAttribute("rel") || "").includes("noopener"));
check(externalWithoutRel.length === 0, "enlaces externos aislados con noopener", `${externalWithoutRel.length} sin rel`);

/* ---------------------------------------------------------------- reporte */
console.log(`DOM_AUDIT checks=${checks.length} failed=${failures.length}`);
failures.forEach((failure) => console.log(`- ${failure}`));
window.close();
process.exit(failures.length ? 1 : 0);
