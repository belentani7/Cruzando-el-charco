# Cruzando el Charco

Guía comunitaria, multilingüe y accesible para personas LGTBIQ+ migrantes, visitantes y residentes de Barcelona y Sitges.
Última auditoría local: 13 de agosto de 2026.

## Qué contiene

- Teléfonos y rutas de urgencia visibles sin JavaScript.
- 32 recursos revisados de derechos, extranjería, salud, vivienda, trabajo, juventud, comunidad, cultura y ocio.
- 11 idiomas de navegación crítica: español, catalán, inglés, italiano, francés, alemán, portugués, chino, urdu, árabe y finés.
- Modo día/noche persistente, lectura en voz alta, salida rápida y soporte de movimiento reducido.
- Generador privado de planes, sin GPS, cuenta ni formulario remoto.
- Radio visual tipo circuito sin reproducción automática; la señal ambiente solo arranca tras acción del usuario.
- Seis orientadores locales con límites explícitos y backend IA privado opcional.
- Noticias RSS acumulativas: las entradas se deduplican y actualizan, pero el archivo conserva el histórico.
- PWA para consulta sin conexión después de la primera visita.

## Arquitectura

La publicación es estática y funciona en GitHub Pages. `assets/content.js` concentra textos y directorio; `assets/app.js` contiene la interfaz, filtros y orientadores locales; `scripts/update-news.mjs` mantiene el archivo RSS; `worker/` documenta la integración IA opcional sin exponer claves al navegador.

Los chats, TAR, HTML de investigación y el antiguo repositorio no forman parte de esta carpeta publicable. Esa separación evita subir material interno y material sensible que ya no debe mezclarse con el sitio público.

## Ejecutar y verificar

```powershell
npm test
python -m http.server 8080
```

Abre `http://127.0.0.1:8080`. No abras `index.html` con doble clic si quieres comprobar service worker, noticias y modo sin conexión.

Actualizar noticias manualmente:

```powershell
npm run news:update
npm test
```

## Publicar en GitHub Pages

1. Crea un repositorio vacío.
2. Ejecuta dentro de esta carpeta:

```powershell
git init -b main
git add .
git commit -m "feat: launch Cruzando el Charco community guide"
git remote add origin URL_DE_TU_REPOSITORIO
git push -u origin main
```

3. En GitHub: **Settings > Pages > Source > GitHub Actions**.
4. La acción `Quality` valida estructura, seguridad editorial y enlaces; `Deploy GitHub Pages` publica tras superar los controles; `Update community news archive` corre dos veces al día y conserva el histórico.

## Decisiones de seguridad

- Sin analítica, anuncios, cookies no esenciales, geolocalización, formularios de identidad ni fuentes remotas.
- Content Security Policy restrictiva y scripts de animación alojados en el repositorio.
- Enlaces externos aislados con `noopener noreferrer`.
- La versión local de los agentes no envía preguntas.
- Las claves se guardan como secretos del Worker, nunca en GitHub o JavaScript público.
- El frontend público puede leerse: minificarlo no lo protege. La protección real usa licencia, historial Git, secretos fuera del cliente y lógica sensible en servidor.

## Criterio editorial

Las fuentes oficiales y los prestadores directos tienen prioridad. Un recurso muestra la fecha de revisión, pero el usuario debe confirmar horarios, precio, acceso y condiciones. Los contenidos +18 permanecen ocultos hasta activarlos. Películas y libros enlazan catálogos, préstamo o distribución legal.

Documentación de mantenimiento:

- [Revisión del corpus original](docs/SOURCE-REVIEW.md)
- [Estado real de traducciones](docs/TRANSLATION-STATUS.md)
- [Estrategia de ampliación](docs/EXPANSION-STRATEGY.md)
- [Lista de lanzamiento](docs/LAUNCH-CHECKLIST.md)

## Autoría

Concepto y dirección: Pedro Belentani · @belentani · NOIACORE.com · ejecutor de ideas.

Código: MIT. Texto editorial original: CC BY 4.0. Fotografías y marcas: licencias de sus titulares; consulta [CREDITS.md](CREDITS.md).
