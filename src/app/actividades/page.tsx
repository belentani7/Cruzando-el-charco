"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { events } from "@/data/events";
import { Calendar, MapPin, Tag } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isPast(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export default function ActividadesPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".act-header", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      ScrollTrigger.batch(".event-card", {
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
    });
    return () => ctx.revert();
  }, []);

  const upcomingEvents = events.filter((e) => !isPast(e.date));
  const pastEvents = events.filter((e) => isPast(e.date));

  return (
    <div ref={pageRef} className="pt-24 pb-20 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="act-header text-center mb-16">
          <span className="inline-flex items-center gap-2 glass-mag px-4 py-2 rounded-full text-xs font-mono text-neon-magenta uppercase tracking-wider mb-6">
            <Calendar className="w-3 h-3" /> Actividades
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Eventos y <span className="neon-text">actividades</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Talleres, fiestas, formación y más. Conecta con tu comunidad.
          </p>
        </div>

        {/* Upcoming */}
        {upcomingEvents.length > 0 && (
          <div className="mb-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse" />
              Próximos eventos
            </h2>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="event-card glass rounded-xl p-6 card-lift"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="glass-mag rounded-lg px-4 py-3 text-center min-w-[80px]">
                        <div className="font-display text-2xl font-bold text-neon-cyan">
                          {new Date(event.date).getDate()}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {new Date(event.date).toLocaleDateString("es-ES", { month: "short" })}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-foreground mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1 chip text-[10px] py-0.5 px-2">
                          <Tag className="w-2.5 h-2.5" />
                          {event.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past */}
        {pastEvents.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-muted-foreground mb-6">
              Eventos anteriores
            </h2>
            <div className="space-y-3 opacity-60">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="event-card glass rounded-xl p-5"
                >
                  <h3 className="font-display font-bold text-foreground mb-1">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(event.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
