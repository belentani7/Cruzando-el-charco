#!/usr/bin/env node
/**
 * serve.mjs — servidor estático local sin dependencias ni red.
 *
 * Existe para comprobar el sitio como se publica (service worker, módulos,
 * fetch de noticias) sin depender de `npx serve` ni de instalar nada.
 *
 * Uso:
 *   node scripts/serve.mjs [puerto] [host]
 *   node scripts/serve.mjs 8080 0.0.0.0
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const port = Number(process.argv[2] || process.env.PORT || 8080);
const host = process.argv[3] || process.env.HOST || "127.0.0.1";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".woff2": "font/woff2"
};

const server = createServer(async (request, response) => {
  const started = Date.now();
  try {
    const requested = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
    const path = normalize(join(root, relative));
    if (!path.startsWith(root + sep) && path !== root) throw new Error("fuera del proyecto");
    const info = await stat(path);
    const file = info.isDirectory() ? join(path, "index.html") : path;
    const body = await readFile(file);
    response.writeHead(200, {
      "content-type": types[extname(file).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-store",
      "service-worker-allowed": "/"
    });
    response.end(body);
  } catch (error) {
    const notFound = await readFile(join(root, "404.html")).catch(() => Buffer.from("Not found"));
    response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    response.end(notFound);
  } finally {
    if (process.env.SERVE_LOG !== "quiet") {
      console.log(`${response.statusCode} ${request.method} ${request.url} · ${Date.now() - started}ms`);
    }
  }
});

server.listen(port, host, () => {
  console.log(`Cruzando el Charco en http://${host}:${port} · raíz ${root}`);
});
