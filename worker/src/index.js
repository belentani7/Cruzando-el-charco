// Worker del agente de Cruzando el Charco (Cloudflare Workers).
//
// CONTEXTO: esta web la usa gente migrante recien llegada, a menudo en situacion
// administrativa irregular. Le preguntan al agente por papeles, salud, trabajo o
// vivienda. Son temas donde una respuesta equivocada tiene consecuencias reales:
// una deportacion, una denuncia, un tratamiento que no correspondia.
//
// Por eso cada agente tiene instrucciones explicitas de lo que NO debe hacer.
// No son adornos: son el limite del sistema.

// Cada agente declara su papel Y sus limites en el mismo texto.
// Al escribir uno nuevo, la regla es: di que es, y di que no es.
const AGENTS = Object.freeze({
  // "Nunca te presentes como abogado" y "no concluyas elegibilidad": el agente
  // orienta y deriva, pero jamas sustituye a un profesional del derecho.
  legal: "Orientador jurídico de primera línea. Ordena hechos y dirige a fuentes oficiales o profesionales. No concluyas elegibilidad, plazos o resultados sin fuente. Nunca te presentes como abogado.",
  // "Sin diagnosticar ni pedir historia clínica": protege datos de salud (art. 9 RGPD)
  // y evita que alguien confunda una orientacion con un diagnostico.
  // Los telefonos van en el propio prompt para que la derivacion sea inmediata.
  health: "Navegador sanitario. Explica rutas públicas y comunitarias sin diagnosticar, prescribir ni pedir historia clínica. Urgencia vital: 112; orientación sanitaria en Catalunya: 061.",
  guide: "Guía de Barcelona y Sitges. Propón rutas realistas según presupuesto, horario, accesibilidad y transporte. Indica que horarios y negocios deben verificarse.",
  // "No prometas contratación ni regularización": lo mas danino que puede hacer
  // este agente es crear una expectativa falsa sobre conseguir papeles o empleo.
  work: "Orientador de empleo y formación. Da próximos pasos verificables; no prometas contratación ni regularización.",
  // Salud mental con derivacion humana obligatoria. 024 es el telefono
  // de prevencion del suicidio en Espana; 112 emergencias.
  // "No hagas terapia" evita que el agente finja una capacidad que no tiene.
  wellbeing: "Orientador de bienestar con escucha breve y derivación humana. No hagas terapia. Riesgo suicida: 024; peligro inmediato: 112.",
  // "Evita pirateria": recomienda acceso legal, coherente con el publico del sitio.
  culture: "Curador cultural LGTBIQ+ crítico y alegre. Recomienda acceso legal, bibliotecas y fuentes oficiales; evita estereotipos y piratería."
});

// Idiomas soportados. Se validan contra esta lista antes de procesar la peticion.
// Incluye arabe, urdu y chino porque son las lenguas de buena parte del publico
// real de la web, no por completar una lista.
const LANGUAGES = new Set(["es", "ca", "en", "it", "fr", "de", "pt", "zh", "ur", "ar", "fi"]);

// Respuesta JSON con cabeceras de seguridad en cada salida.
// no-store: nada de esto debe quedar en cache, son conversaciones personales.
// nosniff y referrer-policy: reducir superficie ante un navegador comprometido.
function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      vary: "Origin",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer"
    }
  });
}
// El Worker expone un unico manejador. Cloudflare llama a fetch en cada peticion.
export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "";
    if (!allowedOrigin || origin !== allowedOrigin) return json({ error: "Origin not allowed" }, 403, allowedOrigin || "null");
    if (request.method === "OPTIONS") return json({}, 204, allowedOrigin);
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, allowedOrigin);
    if (!env.GROQ_API_KEY) return json({ error: "Provider not configured" }, 503, allowedOrigin);
    const rate = await env.AGENT_RATE_LIMIT.limit({ key: "agents" });
    if (!rate.success) return json({ error: "Rate limit exceeded" }, 429, allowedOrigin);
    if (Number(request.headers.get("content-length") || 0) > 4000) return json({ error: "Request too large" }, 413, allowedOrigin);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, allowedOrigin); }
    const agent = typeof body.agent === "string" ? body.agent : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const language = LANGUAGES.has(body.language) ? body.language : "es";
    // Validacion estricta antes de gastar una llamada al modelo:
    // el agente debe existir, y el mensaje tener entre 2 y 800 caracteres.
    // El limite superior corta tanto el abuso como el envio accidental de
    // textos largos que podrian contener datos personales sin querer.
    if (!AGENTS[agent] || message.length < 2 || message.length > 800) return json({ error: "Invalid request" }, 400, allowedOrigin);

    // DETECTOR DE CRISIS. Se comprueba ANTES de llamar al modelo, a proposito:
    // si alguien escribe que quiere hacerse dano, la respuesta no puede depender
    // de la latencia de una API externa ni de que el modelo improvise.
    // Devuelve telefonos reales y una instruccion concreta, sin rodeos.
    // Nota: el 024 es el telefono espanol de prevencion del suicidio.
    const crisis = /suicid|matarme|hacerme daño|no quiero vivir|immediate danger|kill myself/i.test(message);
    if (crisis) return json({ reply: "Si existe riesgo inmediato, llama al 112. Para atención a conducta suicida en España, 024. Busca una persona o lugar seguro ahora; esta herramienta no gestiona emergencias." }, 200, allowedOrigin);

    // Tope de 18 segundos. Sin esto, una API lenta dejaria al usuario mirando
    // una pantalla cargando sin saber si funciona. Mejor un error claro.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    try {
      const provider = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        // La clave vive en el secreto del Worker, nunca en el navegador.
        headers: { authorization: `Bearer ${env.GROQ_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          // 650 tokens: suficiente para una orientacion breve, corto para que
          // nadie reciba un muro de texto en un movil con mala conexion.
          max_completion_tokens: 650,
          messages: [
            // El prompt de sistema combina el papel del agente con reglas comunes:
            // responder en el idioma del usuario, proteger la privacidad, distinguir
            // hechos de sugerencias, y NO pedir datos identificativos.
            // Esa ultima regla es deliberada: la web no debe recoger papeles ni nombres.
            { role: "system", content: `Responde en ${language}. ${AGENTS[agent]} Proyecto informativo para personas LGTBIQ+ migrantes en Barcelona y Sitges. Protege privacidad, distingue hechos de sugerencias y termina decisiones críticas con la fuente competente. No pidas ni repitas datos identificativos.` },
            { role: "user", content: message }
          ]
        })
      });
      if (!provider.ok) return json({ error: "Provider unavailable" }, 502, allowedOrigin);
      const data = await provider.json();
      const reply = data?.choices?.[0]?.message?.content;
      // Comprobar que la respuesta es texto de verdad, no un objeto vacio.
      if (typeof reply !== "string" || !reply.trim()) return json({ error: "Empty provider response" }, 502, allowedOrigin);
      // Recorte final de seguridad por si el proveedor ignora el limite.
      return json({ reply: reply.slice(0, 4000) }, 200, allowedOrigin);
    } catch {
      // Aqui cae el timeout de 18s y cualquier fallo de red.
      return json({ error: "Provider timeout" }, 504, allowedOrigin);
    } finally {
      clearTimeout(timeout);
    }
  }
};
