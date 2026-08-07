# Backend opcional de agentes

El sitio funciona sin este backend mediante respuestas locales. GitHub Pages no puede proteger claves: la llamada al proveedor se ejecuta en un Cloudflare Worker separado.

## Despliegue seguro

1. Crea un Worker en una cuenta propia y carga `src/index.js` junto con la configuración de `wrangler.jsonc` desde el panel de Cloudflare.
2. Si prefieres la CLI, utiliza la versión actual de Wrangler solo después de revisar su auditoría de dependencias. La versión 4.119.0 comprobada el 7 de agosto de 2026 arrastraba una vulnerabilidad alta transitiva de `undici`, por lo que no se fija ni se instala en este repositorio.
3. Guarda secretos sin escribirlos en archivos:
   - `npx wrangler secret put GROQ_API_KEY`
   - `npx wrangler secret put ALLOWED_ORIGIN` y escribe el origen exacto de GitHub Pages, sin barra final.
4. Despliega desde el panel o con una versión de Wrangler que ya haya corregido la alerta.
5. Copia la URL terminada en `/` dentro de `assets/config.js` como `agentApiUrl`.

El navegador solicita consentimiento la primera vez que envía una pregunta. El Worker limita origen, método, tamaño, agentes, idiomas, tiempo, longitud y 30 peticiones por minuto y ubicación de Cloudflare. Si el identificador `42017` ya existe en tu cuenta, sustitúyelo por otro entero único. Antes de producción, completa el aviso de privacidad con proveedor y conservación.
