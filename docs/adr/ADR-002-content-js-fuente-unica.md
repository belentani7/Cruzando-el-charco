# ADR-002 — `assets/content.js` como fuente única de verdad
Fecha: 2026-09-25 · Estado: aceptado

## Contexto
Los datos de recursos y las traducciones necesitan un único lugar de edición. Alternativas: duplicar textos en HTML + JS (riesgo de desincronización) o JSON externo con fetch (rompe urgencias sin JS y offline inicial).

## Decisión
Todo el contenido de recursos y textos i18n vive en `assets/content.js`. El HTML no duplica datos; los textos estáticos de urgencias sí viven en el HTML (requisito FR-002) y `content.js` los referencia para i18n.

## Consecuencias
- Positivas: una sola edición por cambio, traducciones centralizadas, diffs de PR limpios, el test de estructura valida coherencia.
- Negativas (asumidas): ficheros JS grandes a medida que crecen idiomas; requiere disciplina para no hardcodear textos en HTML nuevo.
- Reversible si: el tamaño de `content.js` degrade el rendimiento inicial (mitigación prevista: split por idioma bajo demanda).
