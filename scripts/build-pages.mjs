import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const destination = join(root, "dist");
const files = ["index.html", "legal.html", "404.html", "manifest.webmanifest", "robots.txt", ".nojekyll", "sw.js", "assets", "data"];

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
for (const file of files) await cp(join(root, file), join(destination, file), { recursive: true });
console.log(`BUILD_OK output=${destination} entries=${files.length}`);
