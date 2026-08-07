import { readFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
globalThis.window = {};
await import(pathToFileURL(join(root, "assets", "content.js")));
const content = globalThis.window.CHARCO_CONTENT;
const files = ["index.html", "legal.html"];
const fileText = (await Promise.all(files.map((file) => readFile(join(root, file), "utf8")))).join("\n");
const fromFiles = [...fileText.matchAll(/href="(https:\/\/[^"<>]+)"/g)].map((match) => match[1]);
const fromData = [
  ...content.emergencies.map((item) => item.source),
  ...content.resources.map((item) => item.url),
  ...content.culture.map((item) => item.url)
];
const urls = [...new Set([...fromFiles, ...fromData])].sort();
const accepted = new Set([401, 403, 405, 406, 418, 429]);
const manuallyVerifiedDomains = new Set(["proteccion-asilo.interior.gob.es", "www.sitgesanytime.com"]);

async function check(url) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "CruzandoElCharco-LinkAudit/1.0", accept: "text/html,application/xhtml+xml,application/json;q=0.8,*/*;q=0.5" },
      signal: AbortSignal.timeout(20000)
    });
    return { url, status: response.status, ok: response.status < 400 || accepted.has(response.status) };
  } catch (error) {
    const hostname = new URL(url).hostname;
    return { url, status: manuallyVerifiedDomains.has(hostname) ? "MANUAL" : "ERR", ok: manuallyVerifiedDomains.has(hostname), error: error.message };
  }
}

const results = [];
for (let index = 0; index < urls.length; index += 6) results.push(...await Promise.all(urls.slice(index, index + 6).map(check)));
const failures = results.filter((result) => !result.ok);
console.log(`LINK_AUDIT checked=${results.length} accepted=${results.length - failures.length} failures=${failures.length}`);
failures.forEach((result) => console.log(`${result.status}\t${result.url}\t${result.error || ""}`));
if (failures.length) process.exitCode = 1;
