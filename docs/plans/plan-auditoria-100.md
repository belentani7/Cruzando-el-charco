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
