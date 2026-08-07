const CACHE = "cruzando-el-charco-v1";
const CORE = [
  "./", "index.html", "legal.html", "404.html", "manifest.webmanifest", "assets/icon.svg",
  "assets/styles.css", "assets/config.js", "assets/content.js", "assets/app.js", "data/news.json",
  "assets/vendor/gsap.min.js", "assets/vendor/ScrollTrigger.min.js", "assets/vendor/CustomEase.min.js", "assets/vendor/lenis.min.js",
  "assets/images/barcelona-pride.jpg", "assets/images/sitges-pride.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.url.endsWith("data/news.json")) {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
