# Lista de lanzamiento

## Verificación automatizada (2026-10-11)

- [x] `npm run check`: estructura, CSP, sin autoplay, sin secretos y sin claims absolutos.
- [x] `npm run i18n:audit`: 333 claves con paridad exacta en 11 idiomas y 0 cadenas en
      español sin justificar.
- [x] `npm run html:validate`: 0 problemas en las tres páginas publicadas.
- [x] `npm run dom:audit`: 56 comprobaciones funcionales sin navegador.
- [x] `npm run agents:eval`: 48/48 casos, derivación a teléfonos reales en 11 idiomas.
- [x] `npm run browser:audit`: axe sin violaciones serias en día y noche, escritorio y móvil.
- [x] `npm run dist:check`: build con lista blanca y enlaces internos correctos.
- [ ] Sonda externa de enlaces: informativa (hosts oficiales que filtran robots); informe
      publicado en el resumen del job de CI.

## Código

- [x] Sitio aislado del corpus y de archivos de entorno antiguos.
- [x] Validación estructural propia.
- [x] HTML validado.
- [x] JavaScript comprobado por Node.
- [x] Pruebas funcionales en Edge de escritorio y móvil.
- [x] axe-core sin incidencias en día y noche.
- [x] Build de GitHub Pages con lista blanca de archivos.
- [x] Rutas principales respondieron HTTP 200 localmente.
- [x] Enlaces públicos auditados; Protección Internacional y Turismo de Sitges requieren verificación manual porque bloquean o interrumpen robots.
- [x] Dependencias auditadas sin vulnerabilidades conocidas por npm.

## Contenido

- [x] Teléfonos críticos enlazados a fuente.
- [x] Recursos con fecha de revisión.
- [x] Cultura enlazada a préstamo o acceso legal.
- [x] Fotografías con autor, fuente y licencia.
- [x] Contenido +18 oculto por defecto y descrito con discreción.
- [ ] Revisión humana completa de las diez traducciones no españolas.
- [ ] Revisión jurídica profesional del aviso legal antes de uso institucional o comercial.

## Publicación

- [x] Workflows de calidad, noticias y GitHub Pages.
- [x] Dependabot para GitHub Actions.
- [x] Política de seguridad y contribución.
- [ ] Repositorio remoto creado y URL configurada.
- [ ] GitHub Pages activado con origen GitHub Actions.
- [ ] Dominio propio, correo editorial y canal privado de seguridad definidos, si se desean.
- [ ] Backend IA desplegado solo después de configurar secretos, origen, rate limiting y aviso de proveedor.

## Operación

- Revisar el primer workflow de noticias y su commit automático.
- Revisar enlaces rotos antes de aceptar cada Pull Request.
- Hacer comprobación visual manual en iPhone Safari y Android Chrome reales.
- Registrar toda corrección sensible con fuente y fecha.
