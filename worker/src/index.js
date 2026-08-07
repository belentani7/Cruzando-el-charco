const AGENTS = Object.freeze({
  legal: "Orientador jurídico de primera línea. Ordena hechos y dirige a fuentes oficiales o profesionales. No concluyas elegibilidad, plazos o resultados sin fuente. Nunca te presentes como abogado.",
  health: "Navegador sanitario. Explica rutas públicas y comunitarias sin diagnosticar, prescribir ni pedir historia clínica. Urgencia vital: 112; orientación sanitaria en Catalunya: 061.",
  guide: "Guía de Barcelona y Sitges. Propón rutas realistas según presupuesto, horario, accesibilidad y transporte. Indica que horarios y negocios deben verificarse.",
  work: "Orientador de empleo y formación. Da próximos pasos verificables; no prometas contratación ni regularización.",
  wellbeing: "Orientador de bienestar con escucha breve y derivación humana. No hagas terapia. Riesgo suicida: 024; peligro inmediato: 112.",
  culture: "Curador cultural LGTBIQ+ crítico y alegre. Recomienda acceso legal, bibliotecas y fuentes oficiales; evita estereotipos y piratería."
});
const LANGUAGES = new Set(["es", "ca", "en", "it", "fr", "de", "pt", "zh", "ur", "ar", "fi"]);

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer"
    }
  });
}

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
    if (!AGENTS[agent] || message.length < 2 || message.length > 800) return json({ error: "Invalid request" }, 400, allowedOrigin);

    const crisis = /suicid|matarme|hacerme daño|no quiero vivir|immediate danger|kill myself/i.test(message);
    if (crisis) return json({ reply: "Si existe riesgo inmediato, llama al 112. Para atención a conducta suicida en España, 024. Busca una persona o lugar seguro ahora; esta herramienta no gestiona emergencias." }, 200, allowedOrigin);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    try {
      const provider = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: { authorization: `Bearer ${env.GROQ_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_completion_tokens: 650,
          messages: [
            { role: "system", content: `Responde en ${language}. ${AGENTS[agent]} Proyecto informativo para personas LGTBIQ+ migrantes en Barcelona y Sitges. Protege privacidad, distingue hechos de sugerencias y termina decisiones críticas con la fuente competente. No pidas ni repitas datos identificativos.` },
            { role: "user", content: message }
          ]
        })
      });
      if (!provider.ok) return json({ error: "Provider unavailable" }, 502, allowedOrigin);
      const data = await provider.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (typeof reply !== "string" || !reply.trim()) return json({ error: "Empty provider response" }, 502, allowedOrigin);
      return json({ reply: reply.slice(0, 4000) }, 200, allowedOrigin);
    } catch {
      return json({ error: "Provider timeout" }, 504, allowedOrigin);
    } finally {
      clearTimeout(timeout);
    }
  }
};
