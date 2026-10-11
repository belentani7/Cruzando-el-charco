import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/*
 * build-pages.mjs — copia al directorio dist/ exactamente lo que se publica.
 *
 * Motivo de la lista blanca: el repositorio también contiene material editorial
 * y de investigación que no debe llegar a producción. Cada entrada nueva debe
 * justificarse aquí.
 *
 * Se incluyen los documentos que la propia web enlaza desde el pie (README,
 * CREDITS, SECURITY): antes quedaban fuera del despliegue y sus enlaces daban
 * 404 en GitHub Pages.
 */
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const destination = join(root, "dist");
const files = [
  "index.html",
  "legal.html",
  "404.html",
  "ecosistema.html",
  "manifest.webmanifest",
  "robots.txt",
  ".nojekyll",
  "sw.js",
  "assets",
  "data",
  "open-data",
  "magic",
  "README.md",
  "PROMPT-MASTER.md",
  "AGENTS.md",
  "CREDITS.md",
  "SECURITY.md",
  "LICENSE",
  "CONTENT-LICENSE.md"
];

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
for (const file of files) await cp(join(root, file), join(destination, file), { recursive: true });
console.log(`BUILD_OK output=${destination} entries=${files.length}`);
