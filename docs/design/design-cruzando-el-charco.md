# SDD / Design Doc — Cruzando el Charco
Fecha: 2026-09-25 · Estado: Approved

## Arquitectura general
Sitio **100% estático** alojado en GitHub Pages, sin backend propio obligatorio.

```
index.html / 404.html / legal.html / ecosistema.html   ← páginas estáticas
assets/
  content.js      ← FUENTE ÚNICA de datos: recursos + textos i18n
  app.js          ← interfaz, filtros, orientadores, generador de planes
  config.js       ← configuración de runtime (sin secretos)
  styles.css      ← estilos (tema día/noche, reduced-motion)
  vendor/         ← gsap, ScrollTrigger, lenis, CustomEase (self-hosted)
data/news.json    ← archivo RSS acumulativo (regenerado por script)
scripts/update-news.mjs ← job de noticias (GitHub Actions 2×/día)
worker/           ← documentación backend IA opcional (claves fuera del repo)
magic/            ← capas experienciales: immersive, sfx, shader, lore, plugin
.github/workflows ← ci, quality, pages, news, dependabot
```

## Decisiones clave (ver ADRs)
- Estático sin servidor: máxima disponibilidad, coste cero, privacidad por diseño (ADR-001).
- Todo el contenido en un único `content.js`: una fuente de verdad, sin duplicación (ADR-002).
- Service worker manual de cache-first para offline real (ADR-003).

## Flujos críticos
1. **Llegada en crisis**: HTML estático → urgencias visibles → salida rápida accesible.
2. **Consulta offline**: primera visita (SW instala caché) → visitas sin conexión servidas del cache.
3. **Actualización de contenido**: PR modifica `content.js` → CI Quality valida → merge → Pages publica.

## Estrategia de verificación
- `npm test`: estructura, seguridad editorial y enlaces.
- Workflow Quality en cada PR: validación HTML (`htmlvalidate`), enlaces, checks de seguridad.
- Revisión manual de accesibilidad con teclado + lector de pantalla en cambios de UI.

## Límites y riesgos
- `content.js` crece con las traducciones → mantener estructura compacta y revisar tamaño en cada PR.
- Web Speech API no está en todos los navegadores → degradación silenciosa aceptable (FR-008).
- Backend IA opcional: si se activa, las claves viven solo en secretos del worker, jamás en git.
