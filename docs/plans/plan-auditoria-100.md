# Plan — Auditoría y documentación al 100% (Cruzando el Charco)
Fecha: 2026-09-25 · Estado: Approved · QA como fase final obligatoria

## Fase 1 — Inventario y brecha (completada)
- [x] Clonar repo en `USO/auditorias/` (solo lectura de lo existente).
- [x] Detectar docs existentes: README (80 líneas), docs/ (4 guías), magic/ai-instructions.md, CONTRIBUTING, LICENSE, CONTENT-LICENSE, CREDITS.
- [x] Detectar faltantes: AGENTS.md, .cursorrules, PRD, SRS, SDD, ADRs, Plan.

## Fase 2 — Reglas de agentes (completada)
- [x] AGENTS.md (generado con Aider/deepseek-chat, revisado: 58 líneas correctas).
- [x] .cursorrules (versión compacta).

## Fase 3 — Cadena documental (completada)
- [x] docs/prd/prd-cruzando-el-charco.md (MoSCoW F1–F11 + GWT + métricas + out-of-scope).
- [x] docs/srs/srs-cruzando-el-charco.md (FR-001…FR-011, NFR-001…NFR-006 trazados).
- [x] docs/design/design-cruzando-el-charco.md (arquitectura, flujos, riesgos).
- [x] docs/adr/ADR-001 (estático) · ADR-002 (content.js única fuente) · ADR-003 (SW offline).

## Fase 4 — Entrega (pendiente de ejecutar)
- [ ] Rama `docs/auditoria-100` con commit aditivo único: `docs: add AGENTS.md, .cursorrules and full doc chain (PRD/SRS/SDD/ADR/plan)`.
- [ ] Push a GitHub (sin tocar nada existente) y PR a main.
- [ ] Verificación: CI Quality verde sobre el PR.

## Fase 5 — QA (obligatoria antes de cerrar)
- [ ] Verificar que ningún archivo existente fue modificado (solo adiciones).
- [ ] Verificar que los docs no contradicen el comportamiento real (cruce con README y magic/ai-instructions.md).
- [ ] Marcar repo como ENTREGADO en `USO/REGISTRO.md` con fecha y commit.

## Definition of Done
Cadena documental completa · CI verde · commit aditivo fusionado · registro actualizado · cero eliminaciones.


## Fase 5 — Auditoría máxima aplicada (completada el 2026-10-11)

No es un informe: es trabajo verificado sobre el propio repositorio.

- [x] Traducción real de 126 claves nuevas × 11 idiomas y corrección de ~30 claves por
      idioma que heredaban español sin avisar (`assets/content.js`).
- [x] Interfaz completa etiquetada: `data-i18n`, `-placeholder`, `-alt`, `-aria-label`
      y `-title`; 99 ediciones aditivas en `index.html`.
- [x] Gate nuevo `npm run i18n:audit` (paridad, claves usadas y cognados justificados)
      y utilidad `scripts/insert-locale-keys.mjs` para altas simultáneas.
- [x] Orquestador `npm run audit:full` (`scripts/audit-all.mjs`) con seis verificaciones
      sin red; `npm test` amplía a DOM y agentes.
- [x] Auditoría de navegador con axe: 0 violaciones serias, día y noche, escritorio y
      móvil. Contrastes corregidos por medición (`.level-A` 8.9:1 día / 10:1 noche;
      campos del estudio musical adaptados al tema).
- [x] Sección 17 "IA con límites": contrato visible, prompt master copiable y métricas
      del motor local, traducida a los 11 idiomas.
- [x] `PROMPT-MASTER.md` publicado y aplicado sobre este mismo trabajo.
- [x] Bugs reales corregidos: rutas relativas de `check-dist.mjs`, bloque muerto de
      `legal.html` bajo su CSP, cifras de recursos escritas a mano en el audit.
- [x] Fallos silenciosos del checker de claims (bloqueaba `cura` en italiano) y del
      detector de autoplay (bloqueaba la etiqueta "sin reproducción automática").
- [ ] Pendiente: revisión humana de las traducciones nuevas y de las fichas canónicas.
