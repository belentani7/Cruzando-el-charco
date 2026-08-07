# Seguridad

## Informar de un problema

No publiques datos personales, claves o expedientes en un Issue. Si el repositorio habilita Security Advisories, utiliza **Security > Report a vulnerability**. Si no existe canal privado, abre un Issue sin detalles explotables solicitando contacto seguro.

## Datos y secretos

- Este repositorio público no debe contener `.env`, `.dev.vars`, claves API, cookies de sesión ni exportaciones de conversaciones.
- Rota inmediatamente cualquier secreto publicado, aunque se elimine después: puede permanecer en el historial Git.
- El agente IA funciona localmente por defecto. El backend opcional recibe solo la pregunta tras consentimiento y debe usar secretos del proveedor de despliegue.

## Modelo de amenazas resumido

- **Filtración de claves:** mitigada manteniendo proveedores fuera del navegador y excluyendo archivos de entorno.
- **Inyección de contenido RSS:** títulos y descripciones se insertan con `textContent`; las URL se validan por protocolo.
- **Dependencias comprometidas:** scripts de runtime se alojan localmente; Dependabot revisa acciones; el sitio no carga código desde CDN.
- **Abuso de IA:** límite de origen, longitud, tiempo, catálogo de agentes y rate limiting de plataforma fijado en 30 peticiones por minuto y ubicación.
- **Privacidad física:** salida rápida, contenido +18 oculto y ausencia de ubicación; se explica que el historial del navegador no se borra.
- **Clickjacking:** la CSP bloquea marcos creados por la propia página. GitHub Pages no permite definir una cabecera `frame-ancestors` personalizada; un despliegue con dominio y cabeceras propias debe añadir `Content-Security-Policy: frame-ancestors 'none'`.

## Versiones soportadas

Solo la rama `main` publicada recibe actualizaciones de seguridad.
