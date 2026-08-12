import { NextResponse } from "next/server";
import { z } from "zod";
import { personas } from "@/lib/personas";

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  personaId: z.string().min(1).max(50),
});

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (limit.count >= 20) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Espera un minuto." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos." },
        { status: 400 }
      );
    }

    const { message, personaId } = parsed.data;
    const persona = personas[personaId];

    if (!persona) {
      return NextResponse.json({ error: "Agente no encontrado." }, { status: 404 });
    }

    const apiKey = process.env.AI_API_KEY;
    const apiBase = process.env.AI_API_BASE || "https://api.deepseek.com";
    const model = process.env.AI_MODEL || "deepseek-chat";

    if (!apiKey) {
      return NextResponse.json(
        {
          reply: getFallbackResponse(message),
        },
        { status: 200 }
      );
    }

    const response = await fetch(`${apiBase}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: persona.systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { reply: getFallbackResponse(message) },
        { status: 200 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || getFallbackResponse(message);

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: "Error de conexión. Por favor, intenta de nuevo o contacta directamente con un profesional." },
      { status: 200 }
    );
  }
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("ayuda") || lower.includes("necesito") || lower.includes("urgente")) {
    return "Entiendo que necesitas ayuda. Si estás en peligro inmediato, llama al 112. Si necesitas apoyo emocional, la Línea de la Vida 024 está disponible 24 horas. ¿Puedes contarme más sobre lo que necesitas?";
  }

  if (lower.includes("trámite") || lower.includes("nie") || lower.includes("papeles")) {
    return "Para trámites de extranjería, lo primero es empadronarte en tu ayuntamiento. Después puedes solicitar la tarjeta sanitaria (TSI). Para el NIE o la regularización, te recomiendo contactar con una asociación como AMIC-UGT o CEAR que ofrecen asesoría gratuita.";
  }

  if (lower.includes("salud") || lower.includes("médico") || lower.includes("doctor")) {
    return "Para atención sanitaria, con la tarjeta sanitaria (TSI) puedes ir a tu Centro de Atención Primaria (CAP). Si aún no la tienes, acude a servicios sociales del ayuntamiento para que te orienten. En emergencias, llama al 112.";
  }

  if (lower.includes("vivienda") || lower.includes("alquiler") || lower.includes("piso")) {
    return "Buscar vivienda sin papeles es difícil pero hay opciones. Plataformas como Idealista, Milanuncios y grupos de Facebook tienen habitaciones. Asociaciones como la Cooperativa Ondakutxa ofrecen vivienda social. Ten cuidado con las estafas.";
  }

  return "Gracias por tu mensaje. Aunque no puedo darte una respuesta personalizada ahora, recuerda que no estás solo/a. Puedes contactar con asociaciones como Casal Lambda (asesoría LGBT+) o AMIC-UGT (asesoría legal gratuita) para obtener ayuda profesional y personalizada.";
}
