
Reglas para agentes y personas que trabajen en este repositorio.

## Propósito del proyecto

Guía comunitaria multiidioma y accesible para personas LGTBIQ+ migrantes en Barcelona y Sitges. Ofrece información práctica, cultura, apoyo y recursos verificados, sin cuenta, sin rastreo y con fuentes visibles.

## Regla dura

**Nunca romper el frontend estático existente.** No se deben alterar de forma incompatible:

- `index.html`
- `assets/app.js`
- `assets/content.js`

Cualquier cambio debe ser aditivo o compatible hacia atrás. Si un cambio puede romper el render, los filtros, el i18n o la accesibilidad, se debe justificar y probar antes de fusionar.

## Fuente de verdad del contenido

El contenido de recursos vive en `assets/content.js` y es la **fuente de verdad**. No duplicar datos de recursos en otros archivos ni en el HTML. Las fichas extensas conservan el español canónico hasta revisión humana.

## Seguridad

- Sin analítica.
- Sin cookies no esenciales.
- Sin geolocalización.
- Sin secretos en git (claves, tokens, endpoints privados).
- CSP restrictiva: no añadir orígenes, scripts inline ni `unsafe-eval` sin justificación explícita.
- La salida rápida no debe dejar rastro en el historial del navegador más allá de lo que permite la plataforma.

## Accesibilidad

- WCAG 2.1 AA obligatoria.
- Mantener navegación por teclado, foco visible, contraste suficiente, textos alternativos y etiquetas ARIA correctas.
- Respetar `prefers-reduced-motion` y `prefers-color-scheme`.
- Todo texto nuevo debe ser traducible mediante `data-i18n` o `data-i18n-placeholder`.

## Idiomas críticos

`es`, `ca`, `en`, `it`, `fr`, `de`, `pt`, `zh`, `ur`, `ar`, `fi`.

Los idiomas RTL (`ar`, `ur`) deben mantener `dir="rtl"` correcto. La interfaz crítica debe estar traducida; las fichas largas pueden permanecer en español canónico.

## Comandos

```bash
npm test
npm run news:update
python -m http.server 8080
```

## Commits

Usar commits convencionales: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`, `perf:`, `style:`.

## CI

La integración continua debe seguir en verde. No fusionar cambios que rompan tests, lint o validaciones de accesibilidad.
