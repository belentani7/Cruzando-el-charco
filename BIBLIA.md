# BIBLIA.md — Cruzando el Charco

> Doctrina del producto. Repositorio del ecosistema belentani7.

## Visión
Guía comunitaria, multilingüe y accesible para personas LGTBIQ+ migrantes, visitantes y residentes de Barcelona y Sitges: apoyo, salud, derechos, cultura, ocio y comunidad, sin cuenta, sin rastreo y con fuentes visibles.

## Misión
Ofrecer información práctica y recursos verificados (72 recursos, 11 idiomas) de forma accesible (WCAG 2.1 AA), sin analítica ni cookies, con modo día/noche, salida rápida y PWA para consulta sin conexión.

## Stack tecnológico
- HTML/CSS/JS estático (GitHub Pages, PWA con service worker sw.js)
- `assets/content.js` (fuente única de recursos), `assets/app.js` (interfaz, filtros, orientadores locales)
- i18n: es, ca, en, it, fr, de, pt, zh, ur, ar, fi (ar/ur con dir="rtl")
- `scripts/update-news.mjs` (archivo RSS acumulativo)

## Tokens CANON (Belentani)
- (Cruzando el Charco mantiene su propia paleta accesible; theme-color #082b3a)

## Reglas de desarrollo
- Regla dura: nunca romper el frontend estático existente (index.html, assets/app.js, assets/content.js).
- Gobernanza: AGENTS.md, .gitleaks.toml, CODEOWNERS, SECURITY.md, CODE_OF_CONDUCT.md, CHANGELOG.md, CONTRIBUTING.md, CREDITS.md, CONTENT-LICENSE.md.
- No commitear secretos. Ejecutar gitleaks antes de cada push.
- Convenciones de commit: feat:, fix:, docs:, chore:, refactor:, test:, ci:, perf:, style:.
- CODEOWNERS: `@belentani7` revisión requerida.

## Impeccable (diseño frontend)
- Anti-patrones prohibidos: gradient text, side-stripe borders, eyebrow en cada sección, marcadores 01-09, hero heading > 6rem.
- focus-visible visible, touch targets >= 44px, lang y viewport presentes.
- Estados vacío, error y carga diseñados.
- Contraste body >= 4.5:1, línea 65-75ch, letter-spacing >= -0.04em.
- z-index semántico, nunca 999/9999.
- prefers-reduced-motion y prefers-color-scheme respetados.

## Convenciones de commit
`type(scope): summary` — feat, fix, docs, chore, refactor, test, perf, style.

## Seguridad
- Secret scanning con gitleaks (reglas personalizadas del ecosistema Belentani).
- Sin analítica, sin cookies no esenciales, sin geolocalización, CSP restrictiva.
- Claves como secretos del Worker, nunca en git ni JavaScript público.
- Signed commits requeridos.
