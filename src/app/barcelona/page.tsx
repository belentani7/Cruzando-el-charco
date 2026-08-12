"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { MapPin, Train, BookOpen } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const barrios = [
  {
    name: "El Raval",
    desc: "El barrio más diverso de Barcelona. Mezcla de culturas, comunidad LGBT+ visible, vida nocturna.",
    color: "#ff61b7",
    tags: ["Diversidad", "Cultura", "Noche"],
  },
  {
    name: "Eixample",
    desc: "El 'Gaixample' — epicentro LGBT+ de Barcelona. Bares, discotecas, asociaciones.",
    color: "#af61f8",
    tags: ["LGBT+", "Comercio", "Arquitectura"],
  },
  {
    name: "Gràcia",
    desc: "Barrio bohemio y alternativo. Fiestas mayores, ambiente relajado, comunidades creativas.",
    color: "#00e1ec",
    tags: ["Bohemio", "Fiestas", "Creativo"],
  },
  {
    name: "Poblenou",
    desc: "El antiguo barrio industrial renovado. Tech, arte, playas, ambiente joven.",
    color: "#52d0b3",
    tags: ["Tech", "Playa", "Joven"],
  },
  {
    name: "L'Hospitalet",
    desc: "La segunda ciudad de Cataluña. Diversa, accesible, con servicios sociales fuertes.",
    color: "#ffc060",
    tags: ["Diverso", "Accesible", "Servicios"],
  },
  {
    name: "Badalona",
    desc: "Costa, playas y precios más bajos. Conectado en 20 min en metro.",
    color: "#ff61b7",
    tags: ["Playa", "Económico", "Tranquilo"],
  },
];

const transportTips = [
  { title: "T-Casual", desc: "10 viajes en metro, bus y tram. ~11.35€. Válido para una persona.", icon: "🎫" },
  { title: "Metro", desc: "L1-L5-L9-L10. Funciona de 5am a midnight. Viernes hasta 2am, sábados 24h.", icon: "🚇" },
  { title: "Bus nocturno", desc: "NitBus N1-N17. De midnight a 5am. Misma tarjeta que el día.", icon: "🚌" },
  { title: "Bicing", desc: "Bicicleta pública. ~50€/año. Estaciones por toda la ciudad.", icon: "🚲" },
];

export default function BarcelonaPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".bcn-header", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      ScrollTrigger.batch(".barrio-card", {
        start: "top 85%",
        onEnter: (batch) =>
          gsap.from(batch, {
            y: 30,
            opacity: 0,
            stagger: 0.08,
            duration: 0.6,
            ease: "power2.out",
          }),
      });

      ScrollTrigger.batch(".transport-card", {
        start: "top 85%",
        onEnter: (batch) =>
          gsap.from(batch, {
            y: 20,
            opacity: 0,
            stagger: 0.1,
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
        <div className="bcn-header text-center mb-16">
          <span className="inline-flex items-center gap-2 glass-mag px-4 py-2 rounded-full text-xs font-mono text-neon-magenta uppercase tracking-wider mb-6">
            <MapPin className="w-3 h-3" /> Barcelona
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Barcelona <span className="neon-text">en capas</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            La ciudad real, no la postal. Dónde vive cada comunidad, qué barrio encaja contigo.
          </p>
        </div>

        {/* Barrios */}
        <div className="mb-20">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Los barrios
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {barrios.map((b) => (
              <div key={b.name} className="barrio-card glass rounded-xl p-5 card-lift">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: b.color }}
                  />
                  <h3 className="font-display font-bold text-foreground">{b.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{b.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {b.tags.map((tag) => (
                    <span key={tag} className="chip text-[10px] py-1 px-2">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transport */}
        <div className="mb-20">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Train className="w-6 h-6 text-neon-cyan" /> Transporte
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {transportTips.map((t) => (
              <div key={t.title} className="transport-card glass rounded-xl p-5">
                <div className="text-2xl mb-2">{t.icon}</div>
                <h3 className="font-display font-bold text-foreground mb-1">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center glass rounded-2xl p-10">
          <BookOpen className="w-10 h-10 text-neon-cyan mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            ¿Necesitas orientación personalizada?
          </h2>
          <p className="text-muted-foreground mb-6">
            Lucía conoce cada rincón de L&apos;Hospitalet. Pregúntale lo que necesites.
          </p>
          <Link
            href="/chat/guia"
            className="inline-flex items-center gap-2 bg-neon-cyan text-background px-6 py-3 rounded-xl font-display font-bold text-sm hover:scale-105 transition-transform"
          >
            Hablar con Lucía
          </Link>
        </div>
      </div>
    </div>
  );
}
