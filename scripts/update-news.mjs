// Archives relevant items from selected community RSS feeds. Existing entries are never deleted.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(root, "data", "news.json");
const sources = [
  { name: "ACATHI", url: "https://acathi.org/feed/", trust: 5 },
  { name: "Stop Sida", url: "https://stopsida.org/feed/", trust: 5 },
  { name: "Colors Sitges Link", url: "https://colorssitgeslink.org/feed/", trust: 5 }
];
const positive = ["lgtbi", "lgbti", "lgbtq", "migr", "refugi", "salud", "vih", "sida", "trans", "sitges", "barcelona", "derech", "comunidad", "cultura", "orgullo", "pride", "asil", "violencia", "discrimin"];
const negative = ["casino", "apuestas", "crypto", "préstamo rápido", "prestamo rapido"];

function decode(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/\s+/g, " ").trim();
}

function field(block, names) {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match) return decode(match[1]);
  }
  return "";
}

function canonicalUrl(value) {
  try {
    const url = new URL(value);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) => url.searchParams.delete(key));
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function scoreItem(item, trust) {
  const text = `${item.title} ${item.description}`.toLocaleLowerCase("es");
  const relevance = positive.reduce((score, keyword) => score + Number(text.includes(keyword)), 0);
  const spam = negative.reduce((score, keyword) => score + Number(text.includes(keyword)) * 8, 0);
  const ageDays = Math.max(0, (Date.now() - Date.parse(item.date)) / 86400000) || 3650;
  const freshness = ageDays < 14 ? 4 : ageDays < 60 ? 3 : ageDays < 180 ? 2 : ageDays < 730 ? 1 : 0;
  return trust + relevance * 2 + freshness - spam;
}

function parseFeed(xml, source) {
  const blocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || xml.match(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi) || [];
  return blocks.map((block) => {
    let url = field(block, ["link", "guid"]);
    const href = block.match(/<link[^>]+href=["']([^"']+)["']/i);
    if (href) url = href[1];
    const dateRaw = field(block, ["pubDate", "published", "updated", "dc:date"]);
    const parsedDate = Date.parse(dateRaw);
    const item = {
      source: source.name,
      title: field(block, ["title"]).slice(0, 220),
      description: field(block, ["description", "summary", "content:encoded"]).slice(0, 600),
      url: canonicalUrl(url),
      date: Number.isNaN(parsedDate) ? new Date().toISOString().slice(0, 10) : new Date(parsedDate).toISOString().slice(0, 10),
      discovered: new Date().toISOString()
    };
    item.score = scoreItem(item, source.trust);
    item.id = createHash("sha256").update(`${item.source}|${item.url || item.title}`).digest("hex").slice(0, 20);
    return item;
  }).filter((item) => item.title && item.url && item.score >= 5);
}

async function fetchFeed(source) {
  const response = await fetch(source.url, {
    headers: { "user-agent": "CruzandoElCharco-NewsArchive/1.0 (+public GitHub project)", accept: "application/rss+xml, application/xml, text/xml" },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error(`${source.name}: HTTP ${response.status}`);
  return parseFeed(await response.text(), source);
}

const previous = JSON.parse(await readFile(outputPath, "utf8"));
const results = await Promise.allSettled(sources.map(fetchFeed));
const fetched = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
const failures = results.flatMap((result, index) => result.status === "rejected" ? [`${sources[index].name}: ${result.reason.message}`] : []);
const byId = new Map((previous.items || []).map((item) => [item.id, item]));
fetched.forEach((item) => byId.set(item.id, { ...byId.get(item.id), ...item }));
const items = [...byId.values()].sort((a, b) => b.date.localeCompare(a.date) || b.score - a.score || a.title.localeCompare(b.title));
const archive = {
  schemaVersion: 1,
  updated: new Date().toISOString(),
  total: items.length,
  sources: sources.map((source) => source.name),
  failures,
  items
};
await writeFile(outputPath, `${JSON.stringify(archive, null, 2)}\n`, "utf8");
console.log(`NEWS_OK fetched=${fetched.length} archived=${items.length} failures=${failures.length}`);
if (failures.length) console.log(failures.join("\n"));
