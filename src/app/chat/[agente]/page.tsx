"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { personas, type Persona } from "@/lib/personas";
import { ArrowLeft, Send, Shield, Trash2 } from "lucide-react";

gsap.registerPlugin(useGSAP, CustomEase);
CustomEase.create("charco-chat", "0.16, 1, 0.3, 1");

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickPrompts: Record<string, string[]> = {
  abogado: ["¿Qué pasos tiene el arraigo?", "¿Dónde encuentro asesoría gratuita?", "¿Qué documentos preparo?"],
  medico: ["¿Cómo solicito la TSI?", "¿Dónde está mi CAP?", "Necesito atención urgente"],
  psicologo: ["Necesito apoyo emocional", "¿Cómo pido cita en el CAP?", "¿Qué hago en una crisis?"],
  vivienda: ["¿Cómo detectar una estafa?", "¿Qué derechos tiene un inquilino?", "Busco una habitación"],
};

export default function ChatPage() {
  const params = useParams();
  const agenteId = params?.agente as string;
  const persona: Persona | undefined = personas[agenteId];

  const [messages, setMessages] = useState<Message[]>(() => persona ? [
    {
      role: "assistant",
      content: `Hola, soy ${persona.name}. ${persona.description}. ¿En qué puedo ayudarte hoy?`,
    },
  ] : []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useGSAP(() => {
      gsap.from(chatRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "charco-chat",
      });
  }, { scope: chatRef });

  const handleSend = async () => {
    if (!input.trim() || loading || !persona) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          personaId: persona.id,
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Lo siento, no pude procesar tu mensaje. Intenta de nuevo o contacta directamente con un profesional.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error de conexión. Por favor, intenta de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  if (!persona) {
    return (
      <div className="pt-24 pb-20 px-4 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground mb-4">
          Agente no encontrado
        </h1>
        <p className="text-muted-foreground mb-6">
          Este agente no existe. Elige uno de nuestra lista.
        </p>
        <Link
          href="/guia"
          className="inline-flex items-center gap-2 text-neon-cyan hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Ver agentes
        </Link>
      </div>
    );
  }

  return (
    <div ref={chatRef} className="chat-container pt-20 pb-4 px-4 flex flex-col h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="glass rounded-xl p-4 mb-4 flex items-center gap-3 flex-shrink-0">
        <Link
          href="/guia"
          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div className="text-3xl">{persona.emoji}</div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-foreground">{persona.name}</h1>
          <p className="text-xs text-muted-foreground truncate">{persona.role}</p>
        </div>
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: persona.color }}
        />
        <button
          type="button"
          onClick={() => setMessages([])}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          aria-label="Borrar conversación de esta sesión"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Quick exit warning */}
      <div className="glass-mag rounded-lg px-4 py-2 mb-4 flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
        <Shield className="w-3.5 h-3.5 text-destructive" />
        <span>
          Presiona <kbd className="font-mono bg-secondary px-1.5 py-0.5 rounded text-foreground">Shift×3</kbd> para salida rápida en cualquier momento.
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1" role="log" aria-live="polite" data-lenis-prevent>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-neon-cyan/15 text-foreground border border-neon-cyan/20"
                  : "glass text-foreground"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
                  <span>{persona.emoji}</span>
                  <span className="font-display font-bold">{persona.name}</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-xl px-4 py-3 text-sm">
              <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
                <span>{persona.emoji}</span>
                <span className="font-display font-bold">{persona.name}</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3" aria-label="Preguntas rápidas">
        {(quickPrompts[persona.id] ?? ["¿Por dónde empiezo?", "¿Qué recurso oficial necesito?", "Necesito ayuda hoy"]).map((prompt) => (
          <button
            type="button"
            key={prompt}
            onClick={() => setInput(prompt)}
            className="glass rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-neon-cyan transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="glass rounded-xl p-3 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Escribe tu mensaje para ${persona.name}...`}
            aria-label={`Mensaje para ${persona.name}`}
            className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/50 min-h-[40px] max-h-[120px] py-1"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            aria-label="Enviar mensaje"
            className="p-2 rounded-lg bg-neon-cyan text-background disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-1.5 px-1">
          Sesión temporal. No escribas datos identificativos. La IA orienta y no sustituye asesoría profesional. Emergencias: 112.
        </p>
      </div>
    </div>
  );
}
