# Informe de Auditoría: Cruzando-el-charco

Fecha: 2026-08-27
Stack detectado: JavaScript vanilla (ESM, sin framework), HTML/CSS estáticos, GitHub Pages, GitHub Actions, Node 22+ (scripts de calidad), Cloudflare Worker opcional (JavaScript)
Commits analizados: 1 (clone shallow) — rama `main`, repo no fork, activo
Veredicto: sano

## Lo mejor del repo

1. **Postura de seguridad excepcional para un sitio estático**: CSP restrictiva (`default-src 'self'`, sin `unsafe-inline`, `frame-src 'none'`), sin CDN de runtime (todo el vendor es local), `noopener noreferrer` en enlaces externos, salida rápida y +18 oculto por defecto. Estas decisiones están documentadas en `README.md` y `SECURITY.md`.
2. **Calidad automatizada real y desplegada**: 3 workflows con acciones actuales (`checkout@v7`, `setup-node@v7`, `configure-pages@v6`), tests de estructura, validación HTML, auditoría de accesibilidad (axe) en desktop y móvil, y verificación de enlaces. `npm run check`, `build`, `browser:audit` pasan localmente sin errores.
3. **Accesibilidad y multilingüismo cuidados**: 11 idiomas (incluidos zh, ur, ar con RTL), `prefers-reduced-motion`, lectura en voz alta, y el *browser-audit* exige 0 violaciones axe serias/críticas.
4. **Respaldo de datos sin pérdida**: el archivo RSS (`data/news.json`) se deduplica por hash y **nunca elimina entradas previas**; el worker de noticias corre 2 veces al día y conserva histórico.
5. **Diseño seguro del backend opcional de IA**: el Worker limita origen exacto, método, tamaño (~4 KB), agentes, idiomas, timeout (18 s) y rate limit (30/min); las claves son secretos del proveedor, nunca del navegador. Escaneo completo del repo: **0 secretos reales** (patrones sk-, gsk_, AKIA, ghp_, claves privadas, passwords, .env etc.).

## Hallazgos CRÍTICOS

- Ninguno. No se detectaron secretos reales, y las dependencias (`npm audit --omit=dev` y completa) reportan 0 vulnerabilidades.

## Hallazgos ALTOS

- **404.html cargaba animación desde CDNs de terceros sin SRI y con script inline, sin CSP** (en el head no había `Content-Security-Policy`). Contradecía el modelo de seguridad declarado ("scripts de animación alojados en el repositorio", "el sitio no carga código desde CDN") y permitía ejecución de código de terceros (censJS, unpkg/JSDelivr) en una página que GitHub sirve para *cualquier* ruta inexistente. **Corregido**: se eliminaron los 4 `<script>` externos y el script inline; la 404 ahora es estática, sin JS, con CSP propia e igual de segura que `index.html`/`legal.html`. Verificado con `npm run html:validate` y `npm run check` (exit 0).

## Hallazgos MEDIOS

- **Número de tarjetas fijo en la prueba `browser-audit`**: se esperan 29/32 recursos en `scripts/browser-audit.mjs:47,58`. Si el directorio crece o cambia de categoría sin actualizar el test, el pipeline `Quality` fallará en falso. Es una dependencia frágil entre contenido y test (mantenible, no urgente).
- **`news.yml` hace auto-commit a `main`** (`.github/workflows/news.yml:30-39`) sin `npm test` completo (solo `check` + `html:validate`). El bot automatiza actualizaciones de contenido en la rama publicada; si algún feed inyectara HTML, el script limpia con `stripMarkup`/textContent y `safeUrl`, por lo que el riesgo es bajo, pero conviene decidir conscientemente esta política de rama.
- **Worker: la tasa y las cabeceras CORS**: se añadió `Vary: Origin` (ya aplicado). El limitador `AGENT_RATE_LIMIT` tiene `namespace_id: 42017` fijo en `wrangler.jsonc:12` — único por cuenta de Cloudflare (RFC: `wrangler.json fairly`).
- **README y docs están al día** (no se tocaron): incluye instalar, ejecutar, publicar y despliegue seguro del worker.

## Añadido por el auditor

- Commit `a9501c7` (security): 404.html sin CDN, sin script inline, con CSP. 2 líneas netas.
- Commit `5ea013b` (security): `Vary: Origin` en cabeceras CORS del Worker. +1 línea.
- Ambos en rama `agent/auditoria-2026-08-27`. No se modificaron workflows, README, LICENSE ni contenido.

## Próximos pasos recomendados

1. Decidir si `news.yml` debe rodar `npm test` completo (o un gate de smoke) antes del auto-commit a `main`, o mover el auto-commit a un PR.
2. Hacer *parametrizable* la expectativa de tarjetas en `browser-audit.mjs` (por ejemplo, derivándola de `content.resources`) para evitar roturas por crecimiento del directorio.
3. Si se despliega fuera de GitHub Pages, definir `frame-ancestors 'none'` vía cabecera HTTP (ya anotado en SECURITY.md:20).
4. Revisar manualmente el `namespace_id` 42017 del rate limit la primera vez que se use en una cuenta distinta (documentado en `worker/README.md`).

## No tocado (pero anotado)

- `magic/` contiene un plugin de opencode y demos (shader/sfx/immersive) que abren un HTML local; no se considera malware (solo lanza `start`/`open`/`xdg-open` sobre un archivo del repo) y queda fuera de la publicación. Anotado para revisión por el propietario.
- `.gitignore` ya cubre `.env*`, `.dev.vars`, `dist`, `test-results` etc. No requiere cambios.
- `data/news.json` se regenera cada 12 h; no se modificó.
- No se ejecutó `npm run news:update` (red + mutación del archivo de datos): se considera parte del flujo propio del repo y no de la auditoría.

## Correcto / verificado

- `npm audit` (prod y dev): 0 vulnerabilidades.
- `npm run check`, `npm run html:validate`, `npm run build`, `npm run browser:audit`: OK locales (Playwright con Edge).
- Escaneo de secretos en todo el árbol (excluido `assets/vendor`): sin coincidencias.
- Workflows usan versiones actuales de las acciones; sin `pull_request_target`; permisos mínimos por job.
- El sitio no contiene `eval`/`Function`/`document.write`/`innerHTML` sobre entrada de usuario (solo un caso de `innerHTML` para el fallback WebGL en `magic/shader.html`, fuera de la web).