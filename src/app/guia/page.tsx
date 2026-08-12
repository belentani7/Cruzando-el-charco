"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { personaList } from "@/lib/personas";
import { BookOpen, MessageCircle, ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const faqItems = [
  {
    q: "¿Necesito papeles para usar esta guía?",
    a: "No. Esta guía es para ti sin importar tu situación legal. Nadie te va a preguntar por tus documentos.",
  },
  {
    q: "¿Es confidencial?",
    a: "Sí. No guardamos ningún dato tuyo. No hay registro, no hay historial, no hay rastro.",
  },
  {
    q: "¿Puedo usarlo en mi idioma?",
    a: "Sí. Los agentes de IA hablan español, inglés, árabe, francés, chino y más idiomas.",
  },
  {
    q: "¿Qué pasa si estoy en peligro?",
    a: "Presiona el botón de salida rápida (esquina inferior derecha). Borra todo y te lleva a Google. Si necesitas ayuda inmediata, llama al 112.",
  },
  {
    q: "¿Los consejos son de profesionales reales?",
    a: "Los agentes de IA están entrenados con información real de profesionales, pero no sustituyen una consulta presencial. Te orientan y te derivan.",
  },
];

export default function GuiaPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".guia-header", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      ScrollTrigger.batch(".guia-step", {
        start: "top 85%",
        onEnter: (batch) =>
          gsap.from(batch, {
            y: 30,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: "power2.out",
          }),
      });

      ScrollTrigger.batch(".guia-agent", {
        start: "top 85%",
        onEnter: (batch) =>
          gsap.from(batch, {
            y: 20,
            opacity: 0,
            stagger: 0.06,
            duration: 0.5,
            ease: "power2.out",
          }),
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="pt-24 pb-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="guia-header text-center mb-16">
          <span className="inline-flex items-center gap-2 glass-mag px-4 py-2 rounded-full text-xs font-mono text-neon-magenta uppercase tracking-wider mb-6">
            📖 Guía de Apoyo
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Tu guía para <span className="neon-text">empezar</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Paso a paso, sin prisa, sin juicio. Cada sección es un paso adelante.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-20">
          {[
            {
              step: "01",
              title: "Habla con un profesional de IA",
              desc: "Elige un agente según lo que necesites. Abogada, psicóloga, médico, o simplemente un amigo que ya pasó por esto.",
              icon: MessageCircle,
              color: "#00e1ec",
            },
            {
              step: "02",
              title: "Explora los artículos",
              desc: "Información clara sobre trámites, salud, derechos y vida en Barcelona. Sin terminología legal complicada.",
              icon: BookOpen,
              color: "#ff61b7",
            },
            {
              step: "03",
              title: "Conecta con la comunidad",
              desc: "Asociaciones, eventos, espacios seguros. No estás solo/a. Hay personas que te esperan.",
              icon: ArrowRight,
              color: "#af61f8",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="guia-step glass rounded-xl p-6 flex gap-5 items-start"
            >
              <div
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-lg"
                style={{ backgroundColor: `${item.color}20`, color: item.color }}
              >
                {item.step}
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Agent selection */}
        <div className="mb-20">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
            ¿Quién te puede ayudar?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {personaList.map((p) => (
              <Link
                key={p.id}
                href={`/chat/${p.id}`}
                className="guia-agent glass rounded-xl p-4 card-lift text-center group"
              >
                <div className="text-2xl mb-1">{p.emoji}</div>
                <h3 className="font-display font-bold text-sm group-hover:text-neon-cyan transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{p.role}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
            Preguntas frecuentes
          </h2>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <details key={i} className="glass rounded-xl group">
                <summary className="p-5 cursor-pointer font-display font-bold text-foreground hover:text-neon-cyan transition-colors list-none flex items-center justify-between">
                  {item.q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
