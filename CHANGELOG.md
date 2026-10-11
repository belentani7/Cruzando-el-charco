# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added
- Sección **17 · IA con límites**: contrato visible de la IA local y remota, prompt master copiable y métricas reales del motor, traducida a los 11 idiomas.
- `PROMPT-MASTER.md`: contrato operativo para agentes (reglas duras, bucle de trabajo, gates y criterio editorial) aplicado sobre este mismo repositorio.
- Herramientas: `scripts/i18n-audit.mjs` (paridad de traducciones), `scripts/audit-all.mjs` (seis auditorías sin red) y `scripts/insert-locale-keys.mjs` (altas de claves en los 11 idiomas).
- Gates npm nuevos: `i18n:audit`, `dom:audit`, `agents:eval`, `agents:report`, `static:sync`, `dist:check` y `audit:full`; `npm test` ahora incluye traducciones, DOM funcional y agentes.
- Informe reproducible del motor local en `docs/reports/agent-eval.json`.
- Etiqueta `ES` automática para contenido canónico en español cuando el idioma activo no es español (directorio, rutas, cultura, glosario, herramientas y noticias).
- `data-i18n-alt`, `data-i18n-aria-label` y `data-i18n-title` como extensión aditiva del sistema de traducción.

### Fixed
- Traducciones fantasma: 126 claves nuevas por idioma y ~30 por idioma que heredaban español en silencio (incluida `status`, con la fecha congelada de agosto).
- Contraste AA: `.level-A` (8.9:1 día, 10:1 noche) y campos del estudio musical sobre paneles claros.
- `check-dist.mjs` resolvía rutas relativas contra `dist/` raíz y daba un falso positivo con `magic/`.
- `legal.html` cargaba un bloque inútil bajo su propia CSP.
- El auditor de navegador escribía a mano el número de recursos: ahora se deriva de `assets/content.js`.
- El detector de claims absolutos marcaba la palabra italiana `cura` y el anti-autoplay marcaba la etiqueta "sin reproducción automática".
- `scripts/check-site.mjs` no revisaba los módulos (`studio.js`, `health.js`, `tramites.js`, `ux.js`, `ai-engine.js`) ni las páginas secundarias.

### Changed
- `npm run serve` documenta el modo sin conexión; `sw.js` sube a `cruzando-el-charco-v4`.
- README y documentación alineados con el estado real: 72 recursos, auditoría del 2026-10-11 y rutas de verificación.

- Archivos de comunidad: código de conducta, cita, plantillas de issues y PR, Dependabot.
