# open-data

Contenido educativo generado desde APIs abiertas verificadas (sin credenciales).

- `index.html` — portal de referencia con los temas completos y sus fuentes.
- `topics.json` — manifiesto: temas, fuentes usadas, estado de cada llamada.
- `data/<tema>.json` — datos crudos por tema, listos para renderizar.

Orden de idiomas del ecosistema: **PT > ES > EN > CA**.

Las fuentes y licencias de cada dato estan en `topics.json`. Revisa la licencia
concreta antes de uso comercial. Regeneracion: `python enrich_portals.py <portal>`
en el proyecto `edu-open-data`.
