"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resources } from "@/data/resources";
import { ExternalLink, Phone, BookOpen } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const resourceGroups = [
  { category: "Emergencias", icon: "🚨", color: "#ff9c3e" },
  { category: "Asociaciones", icon: "🏳️‍🌈", color: "#ff61b7" },
  { category: "Asesoría legal", icon: "⚖️", color: "#00e1ec" },
  { category: "Salud sexual", icon: "🏥", color: "#af61f8" },
  { category: "Comunidad", icon: "💜", color: "#52d0b3" },
  { category: "Vivienda", icon: "🏠", color: "#ffc060" },
  { category: "Trabajo", icon: "💼", color: "#af61f8" },
  { category: "Formación", icon: "📚", color: "#00e1ec" },
];

export default function RecursosPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".rec-header", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      ScrollTrigger.batch(".rec-card", {
        start: "top 85%",
        onEnter: (batch) =>
          gsap.from(batch, {
            y: 30,
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
      <div className="mx-auto max-w-5xl">
        <div className="rec-header text-center mb-16">
          <span className="inline-flex items-center gap-2 glass-mag px-4 py-2 rounded-full text-xs font-mono text-neon-magenta uppercase tracking-wider mb-6">
            <BookOpen className="w-3 h-3" /> Recursos
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Recursos <span className="neon-text">verificados</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Asociaciones, servicios y herramientas reales. Actualizados y comprobados.
          </p>
        </div>

        {/* Emergency numbers */}
        <div className="glass-mag rounded-2xl p-6 mb-12 border border-destructive/30">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            🚨 Números de emergencia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { num: "112", label: "Emergencias Europeo", desc: "Policía, ambulancia, bomberos" },
              { num: "024", label: "Salud Mental 24h", desc: "Línea de la Vida, gratuita y confidencial" },
              { num: "016", label: "Violencia de Género", desc: "Atención a víctimas de violencia" },
            ].map((e) => (
              <a
                key={e.num}
                href={`tel:${e.num}`}
                className="glass rounded-xl p-4 text-center card-lift group"
              >
                <Phone className="w-6 h-6 text-destructive mx-auto mb-2" />
                <div className="font-display text-2xl font-bold text-foreground group-hover:text-neon-cyan transition-colors">
                  {e.num}
                </div>
                <div className="text-sm font-bold text-muted-foreground">{e.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{e.desc}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Resource groups */}
        {resourceGroups.map((group) => {
          const groupResources = resources.filter((r) => r.category === group.category);
          if (groupResources.length === 0) return null;

          return (
            <div key={group.category} className="mb-12">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-2xl">{group.icon}</span>
                {group.category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groupResources.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target={r.url.startsWith("http") ? "_blank" : undefined}
                    rel={r.url.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="rec-card glass rounded-xl p-5 card-lift group flex items-start gap-4"
                  >
                    <span className="text-3xl flex-shrink-0">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-foreground group-hover:text-neon-cyan transition-colors flex items-center gap-1.5">
                        {r.title}
                        {r.url.startsWith("http") && (
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
