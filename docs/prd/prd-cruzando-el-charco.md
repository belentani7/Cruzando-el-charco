# PRD — Cruzando el Charco
Fecha: 2026-09-25 · Estado: Approved · Autor: auditoría belentani7 (NOIACORE)

## 1. Problema
Las personas LGTBIQ+ migrantes que llegan a Barcelona y Sitges no encuentran, en un solo lugar y en su idioma, información verificada sobre urgencias, papeles, salud, vivienda, trabajo y comunidad. La información está dispersa, caduca, y a veces consultarla supone riesgo (necesidad de salida rápida sin rastro).

## 2. Usuarios objetivo
- **Primario**: persona LGTBIQ+ migrante recién llegada o en tránsito en Barcelona/Sitges, con móvil de gama baja, datos limitados y posible situación administrativa irregular.
- **Secundario**: orientador/a voluntario, ONG y red de apoyo que acompaña y comparte el recurso.
- **Terciario**: visitante/residente LGTBIQ+ que busca cultura, ocio y comunidad.

## 3. Features (MoSCoW)
| ID | Feature | MoSCoW |
|---|---|---|
| F1 | Directorio de 32+ recursos verificados (derechos, extranjería, salud, vivienda, trabajo, juventud, comunidad, cultura) | Must |
| F2 | Urgencias visibles sin JavaScript (teléfonos y rutas) | Must |
| F3 | Navegación crítica en 11 idiomas (es, ca, en, it, fr, de, pt, zh, ur, ar, fi) con soporte RTL | Must |
| F4 | Salida rápida sin rastro + modo discreción | Must |
| F5 | PWA con consulta sin conexión tras la primera visita | Must |
| F6 | Generador privado de planes (sin GPS, sin cuenta, sin formulario remoto) | Must |
| F7 | Modo día/noche persistente y lectura en voz alta | Should |
| F8 | Noticias RSS acumulativas con histórico preservado | Should |
| F9 | Radio visual tipo circuito (sin autoplay, tras acción del usuario) | Could |
| F10 | Orientadores locales con límites explícitos + backend IA privado opcional | Could |
| F11 | Sistema de expansión a nuevas ciudades (ver docs/EXPANSION-STRATEGY.md) | Won't (esta versión) |

## 4. Criterios de aceptación (GWT)
### F2 — Urgencias sin JS
- Given un navegador con JavaScript desactivado / When se abre index.html / Then los teléfonos y rutas de urgencia son legibles y clicable el `tel:`.
- Given el usuario pulsa el enlace de urgencia / When no hay conexión / Then la información ya estaba en el HTML inicial.

### F3 — Multiidioma
- Given un usuario con idioma árabe / When selecciona `ar` / Then la interfaz crítica muestra `dir="rtl"` y textos traducidos.
- Given un idioma sin traducción de una ficha larga / When se muestra la ficha / Then aparece en español canónico con aviso visible de idioma.

### F4 — Salida rápida
- Given el usuario en cualquier página / When activa la salida rápida / Then se navega a una URL neutra y no quedan datos de sesión visibles.
- Given usuario con lector de pantalla / When activa salida rápida / Then el control es accesible por teclado y anunciado.

### F5 — PWA offline
- Given primera visita completada / When se pierde la conexión / Then el sitio carga desde el service worker.
- Given actualización de contenido / When hay nueva versión / Then el SW actualiza sin romper la caché existente.

### F6 — Generador de planes
- Given el usuario selecciona necesidades (papeles, salud, vivienda) / When genera el plan / Then el plan se construye localmente sin peticiones de red y muestra solo recursos relevantes.
- Given usuario con GPS denegado / When usa el generador / Then ninguna función depende de la ubicación.

### F8 — Noticias RSS
- Given el job de noticias corre / When hay entradas nuevas y duplicadas / Then se deduplican, se actualizan y el histórico se conserva.

## 5. Métricas de éxito
- Tiempo hasta primer recurso útil: **< 60 segundos** desde la apertura.
- Disponibilidad offline de urgencias: **100%** de visitas repetidas sin conexión.
- Cobertura de navegación crítica traducida: **11/11 idiomas**.
- Cero incidentes de privacidad (analítica/rastreo): **0**.

## 6. Out of scope (explícito)
- Sin cuentas, sin registro, sin base de datos de usuarios.
- Sin geolocalización ni GPS.
- Sin IA expuesta en el navegador (backend IA solo opcional y privado, claves fuera de git).
- Expansión a otras ciudades: documento de estrategia, no implementación en esta versión.
