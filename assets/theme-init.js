/* Arranque mínimo de tema y modo discreto para páginas secundarias.
 *
 * Vive en un archivo externo (no inline) porque la CSP del sitio no permite
 * scripts en línea. Se carga solo en legal.html y 404.html: index.html ya
 * gestiona el tema desde assets/app.js.
 *
 * Decisión de privacidad: lee preferencias del propio dispositivo y no envía
 * nada. Si localStorage está bloqueado, se queda con el tema del sistema. */
(() => {
  "use strict";
  try {
    const saved = window.localStorage.getItem("charco-theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = saved || (prefersDark ? "night" : "day");
    if (window.localStorage.getItem("charco-discreet") === "true") document.body.classList.add("is-discreet");
  } catch {
    /* modo privado del navegador: se usa el tema por defecto */
  }
})();
