# ANÁLISIS PROFUNDO — CÓMO CONSTRUIR CRUZANDO EL CHARCO DE LA MEJOR FORMA

## Para quién es esto (el público real)

**Perfil psicográfico del usuario:**
- Hombres LGBT+ migrantes (20-45 años), principalmente de Latinoamérica y Asia
- En situación irregular en España (sin papeles o en proceso)
- Baja escolarización (muchos sin estudios formales completos)
- Acceso SOLO desde móviles viejos/rotos (pantallas pequeñas, batería limitada, datos limitados)
- En estado de hipervigilancia constante (miedo a ser descubierto, deportado, atacado)
- Duelo migratorio activo (tristeza, soledad, vergüenza heredada)
- Homofobia interiorizada (muchos vienen de contextos donde ser LGBT+ era peligroso)
- Barrera lingüística real (no entienden español técnico ni inglés)
- Sin red de apoyo local (lejos de familia, de amigos, de lo conocido)

**Lo que NO es este usuario:**
- NO es un usuario tech-savvy
- NO tiene paciencia para interfaces complejas
- NO busca "diseño bonito" — busca SEGURIDAD
- NO confía en websites fácilmente (ha sido estafado antes)
- NO tiene tiempo para leer párrafos largos

---

## HALLAZGOS DE INVESTIGACIÓN (7 dimensiones)

### 1. TRAUMA-INFORMED DESIGN (Diseño Informado por Trauma)

**Fuente principal:** Airbnb.org COVID-19 response (Annie Wu, UX Lead), UXPA Magazine, ResearchGate

**Principios clave:**
- **Control al usuario:** Nunca forzar decisiones. Dar "Guardar y salir", "Saltar este paso". El usuario en crisis necesita sentir que controla su experiencia.
- **Sin presión silenciosa:** No pre-seleccionar opciones. El usuario elige activamente qué hacer.
- **Lenguaje de dignidad:** "Review" → "Feedback". "Wheelchair bound" → "Wheelchair user". "Escape" → "Exit Site". Las palabras importan. Evitar cualquier término que pueda sonar paternalista o retraumatizante.
- **Mínima distracción visual:** En crisis, los elementos decorativos son ruido. Información en viñetas/bullets, no en párrafos densos.
- **Honrar la agencia:** El usuario decide cuándo, cómo y cuánto consumir. No hay "debes leer esto" o "paso obligatorio".

**Aplicación a CruzandoElCharco:**
- El hero NO debe decir "Necesitas ayuda" (implica debilidad). Debe decir "Has cruzado el charco. No estás solo." (validación, no patologización).
- Los agentes IA NO deben abrir con "¿Cómo te sientes?" (presión emocional). Deben abrir con "¿En qué te puedo ayudar?" (control al usuario).
- NUNCA usar "emergency" o "urgencia" como label principal. Usar "📞 Ayuda YA" (acción concreta, sin dramatismo).

---

### 2. QUICK EXIT BUTTON (Botón de Salida Rápida)

**Fuentes:** GOV.UK Design System, Oomph Inc., NSW Design System, Research ACM

**Patrón oficial (GOV.UK):**
- Botón visible en TODAS las páginas, siempre en misma posición
- Redirige a Google.com (sitio neutral, no genera sospecha)
- Limpiar contenido ANTES de redirigir (overlay de carga)
- Atajo de teclado: Shift x3 veces para activar
- Página de interrupción: explicar al usuario qué hace el botón en su PRIMERA visita
- Página de seguridad: consejos de browsing seguro (borrar historial, modo privado)
- NO usar la palabra "escape" (retraumatizante). Usar "Salir" o "Exit"

**Investigación ACM (2022):**
- Los usuarios NO entienden "Quick Exit" ni "Escape" — necesitan "Salir del sitio" con ícono de link externo
- El botón debe ser visible pero no dominante (no quitar foco del contenido principal)
- En testing, el 100% de usuarios entendieron "Exit Site" con ícono externo

**Aplicación a CruzandoElCharco:**
- Botón flotante fijo: "Salir" con ícono de link externo → redirige a Google
- En primera visita: modal breve explicando "Este botón te saca de la web al instante"
- Limpiar localStorage ANTES del redirect (no dejar rastro de actividad)
- Atajo: Shift x3 para activar (para usuarios en situaciones de riesgo)

---

### 3. AI CHATBOT SAFETY (Seguridad de Agentes IA)

**Fuentes:** Stanford HAI (2026), Brown University (2025), APA Health Advisory, PMC/NIH

**Datos alarmantes:**
- Los chatbots IA fallan en ~20% de situaciones de crisis (vs 7% en humanos)
- "Deceptive empathy": frases como "Te entiendo" crean falsa conexión — el usuario olvida que es una máquina
- Muchos chatbots refuerzan creencias falsas del usuario
- Sesgos de género, cultura y religión documentados

**Marco de seguridad obligatorio (WHO 2024 + APA 2025):**
1. **Declaración explícita:** "Soy un agente de IA, no un profesional. Puedo equivocarme."
2. **Límites claros:** No diagnosticar, no prescribir, no dar consejo legal específico
3. **Detección de crisis:** Si el usuario menciona suicidio, autolesión, violencia → redirigir INMEDIATAMENTE a 024 (atención emocional) o 112 (emergencias)
4. **Sin PII:** Nunca pedir nombre completo, DIRECCIÓN, número de documento
5. **Scope estricto:** Solo información del portal. No inventar datos.
6. **Referencia humana SIEMPRE:** "Para situaciones de riesgo, contacta al 112 o al 024"

**Aplicación a CruzandoElCharco:**
- Cada agente tiene un system prompt con reglas inviolables
- Banner visible arriba del chat: "Agente IA · Puede cometer errores · En emergencia: 112"
- Logro de crisis automatizado: si se detectan palabras clave de riesgo → modal con números de emergencia
- NUNCA guardar conversaciones con datos personales identificables
- Conversaciones en localStorage (no en servidor) para privacidad

---

### 4. COGNITIVE LOAD REDUCTION (Reducción de Carga Cognitiva)

**Fuentes:** NN/g, Laws of UX, Hick's Law, Miller's Law, Research papers

**Leyes aplicables:**
- **Hick's Law:** Menos opciones = decisiones más rápidas. El menú NO puede tener 15 categorías visibles. Máximo 5-7 items principales.
- **Miller's Law:** La memoria de trabajo maneja ~7 items. Chunkear información en grupos pequeños.
- **Fitts's Law:** Targets grandes = más fáciles de tocar. Mínimo 44px en mobile.
- **Gestalt:** Agrupar visualmente elementos relacionados. Usar proximidad y similitud.

**Principios para baja escolarización:**
- **Iconos universales:** WhatsApp (contacto), mapa (ubicación), balanza (legal), corazón (salud), casa (vivienda). NO confiar en texto solo.
- **Audio obligatorio:** speechSynthesis en TODOS los artículos. El usuario puede ESCUCHAR en vez de leer.
- **Máximo 2 clics** para llegar a cualquier contenido clave.
- **Navegación de un solo nivel:** Sin submenús desplegables. Todo visible.
- **Mobile-first absoluto:** 90%+ accede desde móviles viejos con pantallas pequeñas.

**Aplicación a CruzandoElCharco:**
- Home: hero + 5-6 chips de categorías principales + botón de agente favorito
- NUNCA más de 6 elementos visibles sin scroll
- Cada sección: título claro + 3-5 bullets + botón "Escuchar" + enlace a recurso
- Touch targets mínimos: 48px (no 44px, dar margen extra)
- Font size mínimo: 16px en mobile (evitar zoom automático en iOS)

---

### 5. VISUAL TRUST DESIGN (Diseño que Genera Confianza)

**Fuentes:** WCAG 2.0/2.1, WebAIM, research on dark themes, UXPlanet

**El problema del synthwave/neon:**
- Colores saturados en fondos oscuros CAUSAN fatiga visual (oxhoz, 2024)
- Neon puro (#39FF14) sobre negro (#0D0F14) genera "halo effect" — el texto parece vibrar
- WCAG AA requiere 4.5:1 contrast ratio para texto normal, 3:1 para texto grande
- El verde neón (#39FF14) sobre negro tiene ~12:1 (excelente), pero el rosa neón (#FF2D95) sobre negro tiene ~4.5:1 (límite)
- NO confiar solo en color para transmitir información (daltonismo)

**Solución: Diseño synthwave FUNCIONAL, no decorativo:**
- Fondos oscuros suaves (#110A1B, no negro puro #000000)
- Neón como ACENTO decorativo (borders, glows sutiles), NO como color de texto principal
- Texto principal: blanco roto (#E8E6F0) con suficiente contraste
- Colores neón para: badges interactivos, botones CTA, íconos de categoría
- NUNCA usar neón para: texto de cuerpo, advertencias legales, información crítica
- Gradientes sutiles, no gradientes agresivos

**Elementos de confianza:**
- "Portal comunitario informativo · Creado por personas migrantes"
- "Verifica siempre horarios y disponibilidad en la fuente original"
- Sello de "Última revisión: [fecha]" en cada artículo
- Sin pop-ups de cookies invasivos
- Sin trackers visibles
- Sin publicidad
- HTTPS visible
- Sin registro requerido (confianza inmediata)

**Aplicación a CruzandoElCharco:**
- Revisar TODOS los contrastes con WebAIM Contrast Checker
- Texto body: #E8E6F0 sobre #110A1B (ratio ~12:1 ✓)
- Neon verde: solo para badges y borders activos
- Neon rosa: solo para acentos hover y títulos destacados
- Neon cyan: solo para links y elementos interactivos
- Purple: solo para decoración de fondo (orbs, gradients)

---

### 6. PRIVACY-FIRST ARCHITECTURE (Arquitectura Orientada a Privacidad)

**Principios:**
- **Sin registro:** El usuario NUNCA crea cuenta. Ni email, ni contraseña, ni nombre.
- **LocalStorage, no servidor:** Las conversaciones con agentes IA se guardan SOLO en el dispositivo del usuario. Si borra el historial del navegador, desaparecen.
- **Sin cookies de tracking:** Solo cookies técnicas (necesarias para el funcionamiento).
- **Sin analytics invasivos:** No Google Analytics. Si se usa analytics, que sea privacy-respecting (Plausible, Umami).
- **Sin envío de datos personales:** Los agentes IA NO deben pedir ni almacenar NIE, nombre completo, dirección.
- **Exit que limpia:** Al usar el botón de salida rápida, borrar TODOS los datos locales ANTES de redirigir.

**Aplicación a CruzandoElCharco:**
- `localStorage` para: idioma preferido, conversaciones de chat, favoritos
- `sessionStorage` para: estado de sesión actual (se borra al cerrar pestaña)
- NUNCA: cookies de terceros, fingerprinting, analytics con IP
- `robots.txt` agresivo: bloquear crawlers de contenido sensible
- Meta tags: `robots: noindex` en páginas de chat individual

---

### 7. MULTI-LANGUAGE PARA BAJA ESCOLARIZACIÓN

**Fuentes:** Council of Europe LASLLIAM, UX Planet, research on low-literacy migrants

**El problema real:**
- "32 idiomas" suena bien, pero si el contenido está traducido con Google Translate, es INÚTIL
- Un migrante de Honduras no entiende el español de España técnico ("empadronamiento", "arraigo")
- Un migrante de Bangladesh no entiende inglés técnico ("asylum", "irregular status")

**Solución:**
- **Lenguaje plano OBLIGATORIO:** Sin jerga legal sin explicar. "Empadronamiento" → "Registro en el ayuntamiento (es gratis y no da papeles)"
- **Traducción humana o LLM revisada,** NUNCA Google Translate directo
- **Priorizar idiomas por población real:** Español, inglés, portugués, árabe, francés, chino mandarín, tagalog, hindi, urdu, quechua, guaraní
- **Audio en todos los idiomas:** speechSynthesis con voces nativas cuando sea posible
- **Iconos como anclaje visual:** El ícono de "casa" significa lo mismo en todos los idiomas

---

## REGLAS DE DISEÑO DEFINITIVAS

### Layout
1. Mobile-first absoluto (375px como base)
2. Contenedor máximo: 480px en mobile, 1200px en desktop
3. Padding: 20px en mobile, 32px en desktop
4. Espaciado entre secciones: 40px mobile, 80px desktop
5. Border-radius: 12px tarjetas, 8px botones, 9999px chips

### Tipografía
1. Chakra Petch: SOLO títulos H1, H2 (display)
2. Inter Tight: cuerpo de texto, párrafos, botones
3. JetBrains Mono: badges, categorías, texto técnico
4. Tamaño base: 16px (no 18px — evitar zoom en iOS)
5. H1: 32px mobile, 48px desktop
6. H2: 24px mobile, 32px desktop
7. Body: 16px mobile, 18px desktop
8. Line-height: 1.6 para cuerpo, 1.2 para títulos

### Colores (corregidos para contraste)
1. Fondo: #110A1B (no negro puro)
2. Tarjetas: #1A1528 con borde #2A2440
3. Texto principal: #E8E6F0 (ratio ~12:1 sobre fondo)
4. Texto secundario: #9B95B0 (ratio ~6:1 sobre fondo)
5. Neón verde (#39FF14): SOLO borders activos, badges, highlights
6. Hot pink (#FF2D95): SOLO acentos hover, títulos especiales
7. Electric cyan (#00F0FF): links, elementos interactivos
8. Purple (#C930FF): decoración de fondo, gradients sutiles

### Interacciones
1. Hover: translateY(-2px) + sombra sutil (no -4px — demasiado movimiento)
2. Transiciones: 200ms ease (no 300ms — más responsive)
3. Focus visible: outline 2px solid #39FF14 (para accesibilidad por teclado)
4. Touch targets: mínimo 48px
5. Sin animaciones automáticas que se repitan (epilepsia)
6. Respetar prefers-reduced-motion

### Seguridad
1. Quick exit en TODAS las páginas (fijo, bottom-right)
2. Shift x3 para activar quick exit
3. Modal de primera visita explicando el botón
4. Borrar localStorage al usar quick exit
5. Banner de disclaimer en chat IA
6. Números de emergencia siempre visibles (112, 024, 900 800 456)
7. Sin registro, sin cookies de tracking, sin analytics invasivos

---

## ESTRUCTURA DE RUTAS (definitiva)

```
/                    → Landing (hero validante, selección de idioma, botón entrar)
/guia                → Guía principal (búsqueda, chips, secciones, emergencias)
/barcelona           → Guía de barrios y vida en BCN
/articulos           → Hub de artículos (categorías, búsqueda, filtros)
/articulos/[slug]    → Artículo individual (TTS, compartir, volver)
/recursos            → Directorio filtrable de organizaciones
/actividades         → Agenda comunitaria (eventos, talleres)
/chat/[agente]       → Chat con agente IA específico
/api/chat            → API proxy para agentes IA (rate-limited)
```

---

## CONTENIDO MÍNIMO VIABLE (lo que NO puede faltar)

1. **Home:** Hero con mensaje validante + selección de idioma + acceso rápido a emergencias
2. **Guía:** 10+ secciones de contenido práctico (papeles, salud, vivienda, trabajo, etc.)
3. **Artículos:** 20+ artículos largos cubriendo las 8 categorías principales
4. **Recursos:** 100+ recursos verificados de organizaciones reales en BCN/L'H
5. **Agentes IA:** 14 agentes con personalidades y scope definidos
6. **Emergencia:** 112, 024, 900 800 456, 116 111 (menores) siempre visibles
7. **Quick exit:** En todas las páginas, funcional, testeado

---

## ANÁLISIS PSICOLÓGICO PROFUNDO

### Por qué el synthwave funciona (pero puede fallar)
- **Funciona:** La estética futurista/tecnológica transmite "esto es moderno, esto es seguro, esto no es una web de los años 2000". Para un usuario que viene de contextos de pobreza digital, una web bien diseñada transmite profesionalidad y confianza.
- **Puede fallar:** Si los colores neon son demasiado agresivos, el usuario puede sentir que es "una web de juego" o "una estafa". El balance entre synthwave y seriedad es CRÍTICO.
- **Solución:** Synthwave SUTIL. Orbs difusos, gradientes suaves, neon solo en acentos. El contenido debe ser lo protagonista, no el diseño.

### El miedo como factor de diseño
- El usuario tiene MIEDO real: de ser deportado, de ser atacado, de ser juzgado
- Cada elemento de la web debe transmitir: "Estás seguro aquí"
- El quick exit no es un feature — es una NECESIDAD DE SEGURIDAD
- Los números de emergencia no son decoración — son una LÍNEA DE VIDA
- El chat IA no es entretenimiento — es un PRIMER PASO para pedir ayuda real

### La vergüenza como barrera
- Muchos usuarios sienten vergüenza de su situación (irregularidad, pobreza, orientación sexual)
- El contenido NUNCA debe sonar paternalista ("pobrecito", "necesitas ayuda")
- Debe sonar empoderador ("tienes derechos", "mereces información", "no estás solo")
- Los agentes IA NO deben asumir que el usuario es víctima — puede ser alguien buscando información

### La soledad como motivador
- Muchos usuarios están solos (lejos de familia, sin amigos locales)
- El chat IA puede ser el primer "contacto humano" (aunque sea artificial)
- Pero DEBE ser honesto: "Soy un agente de IA" — no crear dependencia emocional falsa
- La sección de comunidades y actividades es CRÍTICA para romper el aislamiento

---

## CHECKLIST DE CONSTRUCCIÓN

### Fase 1: Fundamentos (antes de cualquier UI)
- [ ] Design system corregido (colores con contraste WCAG AA)
- [ ] Quick exit button funcional (GOV.UK pattern)
- [ ] Disclaimer de agentes IA visible
- [ ] Números de emergencia hardcodeados
- [ ] Sin registro, sin cookies de tracking
- [ ] localStorage para datos del usuario

### Fase 2: Contenido Core
- [ ] Home con hero validante
- [ ] Guía con 10+ secciones
- [ ] 20+ artículos escritos en lenguaje plano
- [ ] Directorio de 100+ recursos verificados
- [ ] 14 agentes IA con system prompts seguros

### Fase 3: Interacción
- [ ] Chat IA funcional (con disclaimer)
- [ ] TTS en todos los artículos
- [ ] Búsqueda funcional
- [ ] Filtros por categoría
- [ ] Selector de idioma (10+ idiomas principales)

### Fase 4: Seguridad y Accesibilidad
- [ ] Quick exit testeado (borra datos, redirige)
- [ ] Focus visible para navegación por teclado
- [ ] Touch targets 48px+
- [ ] Contraste verificado con WebAIM
- [ ] prefers-reduced-motion respetado
- [ ] robots.txt agresivo
- [ ] Meta tags de privacidad

### Fase 5: Pulido
- [ ] Performance: LCP < 2.5s en 3G
- [ ] Offline: contenido cacheado para uso sin datos
- [ ] PWA: instalable desde navegador
- [ ] Testing con usuarios reales (si es posible)
