"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import { personas, type Persona } from "@/lib/personas";
import { ArrowLeft, Send, Shield } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const params = useParams();
  const agenteId = params?.agente as string;
  const persona: Persona | undefined = personas[agenteId];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (persona) {
      setMessages([
        {
          role: "assistant",
          content: `Hola, soy ${persona.name}. ${persona.description}. ¿En qué puedo ayudarte hoy?`,
        },
      ]);
    }
  }, [persona]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".chat-container", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });
    });
    return () => ctx.revert();
  }, []);

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
          systemPrompt: persona.systemPrompt,
        }),
      });

      const data = await res.json();

      if (data.reply) {
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
    <div className="chat-container pt-20 pb-4 px-4 flex flex-col h-screen max-w-3xl mx-auto">
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
      </div>

      {/* Quick exit warning */}
      <div className="glass-mag rounded-lg px-4 py-2 mb-4 flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
        <Shield className="w-3.5 h-3.5 text-destructive" />
        <span>
          Presiona <kbd className="font-mono bg-secondary px-1.5 py-0.5 rounded text-foreground">Shift×3</kbd> para salida rápida en cualquier momento.
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
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

      {/* Input */}
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
            className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/50 min-h-[40px] max-h-[120px] py-1"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-neon-cyan text-background disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-1.5 px-1">
          IA orientativa, no sustituye asesoría profesional. En emergencias: 112.
        </p>
      </div>
    </div>
  );
}
