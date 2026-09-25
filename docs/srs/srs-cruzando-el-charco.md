# SRS — Cruzando el Charco
Fecha: 2026-09-25 · Estado: Approved · Traza a: PRD prd-cruzando-el-charco.md

## Requisitos funcionales

| ID | Requisito | Traza PRD | Prioridad |
|---|---|---|---|
| FR-001 | El sistema muestra el directorio de recursos filtrable por categoría (derechos, extranjería, salud, vivienda, trabajo, juventud, comunidad, cultura, ocio) desde `assets/content.js`. | F1 | Must |
| FR-002 | El sistema renderiza urgencias (teléfonos, rutas) en HTML estático sin requerir JavaScript. | F2 | Must |
| FR-003 | El sistema permite cambiar el idioma de la navegación crítica entre 11 idiomas y aplica `dir="rtl"` para ar/ur. | F3 | Must |
| FR-004 | El sistema ofrece salida rápida por teclado y táctil que navega a URL neutra. | F4 | Must |
| FR-005 | El service worker cachea los assets y permite uso sin conexión en visitas posteriores. | F5 | Must |
| FR-006 | El generador de planes construye el resultado íntegramente en el cliente sin peticiones de red ni almacenamiento remoto. | F6 | Must |
| FR-007 | El sistema mantiene preferencia de tema día/noche persistente entre visitas. | F7 | Should |
| FR-008 | El sistema ofrece lectura en voz alta del contenido principal vía Web Speech API cuando el navegador la soporta. | F7 | Should |
| FR-009 | El script `scripts/update-news.mjs` deduplica y acumula entradas RSS preservando el histórico en `data/news.json`. | F8 | Should |
| FR-010 | La radio visual solo inicia reproducción tras acción explícita del usuario. | F9 | Could |
| FR-011 | Los orientadores locales declaran límites explícitos y el backend IA opcional nunca expone claves al navegador. | F10 | Could |

## Requisitos no funcionales

| ID | Requisito | Métrica | Traza |
|---|---|---|---|
| NFR-001 | Accesibilidad WCAG 2.1 AA en todo el sitio. | auditoría axe-core sin errores críticos | F1-F6 |
| NFR-002 | Privacidad: sin analítica, cookies no esenciales, geolocalización ni fuentes remotas. | 0 peticiones a terceros de rastreo | F4, F6 |
| NFR-003 | Rendimiento en móvil de gama baja. | carga inicial utilizable < 3s en 3G | F1, F2 |
| NFR-004 | Seguridad de enlaces externos. | 100% enlaces externos con `noopener noreferrer` | F1 |
| NFR-005 | CSP restrictiva mantenida. | sin orígenes nuevos sin justificación | todos |
| NFR-006 | Calidad automática. | CI verde (Quality workflow) en cada PR | todos |

## Trazabilidad
`PRD → FR/NFR → tests (npm test, CI Quality) → verificación`. Todo cambio de contenido actualiza `assets/content.js` como única fuente y debe pasar la suite antes de merge.
