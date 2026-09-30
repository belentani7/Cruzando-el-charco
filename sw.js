// Service Worker de Cruzando el Charco.
//
// POR QUE EXISTE ESTE ARCHIVO:
// La persona que abre esta web puede estar recien llegada, sin datos moviles,
// buscando informacion sobre papeles, vivienda o salud. Si la conexion falla
// justo entonces, la web no puede desaparecer. Por eso todo el contenido
// critico se guarda en el dispositivo la primera vez que se visita.
//
// El resultado: funciona sin cobertura, en el metro, o con los datos agotados.

// Sube esta version al cambiar CORE. Un nombre distinto hace que el navegador
// instale el cache nuevo y borre el viejo (ver el evento activate).
const CACHE = "cruzando-el-charco-v1";

// Todo lo que debe estar disponible sin conexion.
// Al anadir un archivo critico, anadelo aqui o no estara offline.
const CORE = [
  "./", "index.html", "legal.html", "404.html", "manifest.webmanifest", "assets/icon.svg",
  "assets/styles.css", "assets/config.js", "assets/content.js", "assets/app.js", "data/news.json",
  "assets/vendor/gsap.min.js", "assets/vendor/ScrollTrigger.min.js", "assets/vendor/CustomEase.min.js", "assets/vendor/lenis.min.js",
  "assets/images/barcelona-pride.jpg", "assets/images/sitges-pride.jpg"
];

// INSTALL: descarga todo lo critico ANTES de activarse.
// skipWaiting() evita que el usuario tenga que cerrar y reabrir la pestana:
// para alguien que busca ayuda urgente, pedirle que reinicie el navegador
// no es aceptable.
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

// ACTIVATE: borra los caches de versiones anteriores.
// Sin esto, cada despliegue dejaria copias viejas ocupando espacio en el movil.
// clients.claim() hace que la pestana ya abierta use esta version sin recargar.
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  // Solo interceptamos GET del propio sitio. Las peticiones a otros dominios
  // (por ejemplo la API del agente) deben pasar intactas a la red.
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

  // NOTICIAS: red primero, cache como respaldo.
  // Se eligio asi porque una noticia desactualizada sobre tramites o plazos
  // puede llevar a alguien a actuar con informacion erronea. Mejor intentar
  // siempre lo ultimo y caer al cache solo si de verdad no hay conexion.
  if (event.request.url.endsWith("data/news.json")) {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request)));
    return;
  }

  // TODO LO DEMAS: cache primero, red despues.
  // Es lo contrario que las noticias, y a proposito: el diseno, los estilos y
  // los textos cambian poco, y servir desde cache hace la web instantanea en un
  // movil modesto. Lo que no este cacheado se pide a la red y se guarda.
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
