# ADR-003 — Service worker cache-first para uso sin conexión
Fecha: 2026-09-25 · Estado: aceptado

## Contexto
El usuario puede quedarse sin datos móviles; las urgencias y recursos deben seguir accesibles. Alternativas: sin SW (solo caché HTTP), SW cache-first, SW network-first.

## Decisión
Service worker **cache-first** para assets y páginas: la primera visita instala la caché completa; las visitas posteriores funcionan sin conexión. Las noticias se actualizan en segundo plano sin invalidar la caché base.

## Consecuencias
- Positivas: offline real garantizado (FR-005), carga instantánea en repetidas, resistencia a cortes de red.
- Negativas (asumidas): contenido puede quedar desfasado hasta la próxima actualización del SW; requiere cuidado con versionado de caché para no servir mezclas obsoletas.
- Reversible si: se detecta que los usuarios reciben contenido obsoleto de forma sistemática → migrar a stale-while-revalidate solo para `data/news.json`.
