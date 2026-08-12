"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BookOpen,
  Languages,
  MapPin,
  MessageCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import { personaList } from "@/lib/personas";
import { articles } from "@/data/articles";
import { resources } from "@/data/resources";
import { events } from "@/data/events";
import { languages } from "@/data/languages";

gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);
CustomEase.create("charco-reveal", "0.16, 1, 0.3, 1");
CustomEase.create("charco-float", "0.45, 0, 0.55, 1");

const validationPhrases = [
  "Tu existencia es válida",
  "Mereces amor y respeto",
  "No estás solo/a",
  "Tu voz importa",
  "Cada paso cuenta",
];

const focusCards = [
  {
    title: "Papeles",
    description: "Empadronamiento, asilo, arraigo y pasos iniciales con lenguaje sencillo.",
  },
  {
    title: "Salud",
    description: "TSI, PrEP, PEP, salud mental y acceso real al sistema sanitario.",
  },
  {
    title: "Comunidad",
    description: "Espacios seguros, apoyo emocional, cultura y redes cercanas.",
  },
  {
    title: "Vivienda y trabajo",
    description: "Habitar, buscar empleo, evitar estafas y conocer derechos básicos.",
  },
];

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const heroTl = gsap.timeline({ defaults: { ease: "charco-reveal" } });

      heroTl
        .from(".hero-badge", { y: 20, opacity: 0, duration: 0.6 })
        .from(".hero-title", { y: 40, opacity: 0, duration: 0.8 }, "-=0.3")
        .from(".hero-subtitle", { y: 30, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-cta", { scale: 0.9, opacity: 0, duration: 0.5 }, "-=0.3")
        .from(".hero-image", { x: 60, opacity: 0, duration: 1 }, "-=0.5")
        .from(".hero-langs .lang-bubble", {
          y: 20,
          opacity: 0,
          stagger: 0.15,
          duration: 0.5,
        }, "-=0.6");

    gsap.utils.toArray<HTMLElement>(".validation-phrase").forEach((el, i) => {
      gsap.fromTo(el,
        { y: 0 },
        {
          y: -8,
          duration: 2 + i * 0.3,
          ease: "charco-float",
          repeat: -1,
          yoyo: true,
          delay: i * 0.4,
        }
      );
    });

      // Agent cards batch reveal
      ScrollTrigger.batch(".agent-card", {
        start: "top 85%",
        onEnter: (batch) =>
          gsap.from(batch, {
            y: 40,
            opacity: 0,
            stagger: 0.08,
            duration: 0.6,
            ease: "charco-reveal",
          }),
        once: true,
      });

      gsap.from(".articles-header", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: ".articles-header",
          start: "top 80%",
          once: true,
        },
      });

      ScrollTrigger.batch(".article-card", {
        start: "top 85%",
        onEnter: (batch) =>
          gsap.from(batch, {
            y: 30,
            opacity: 0,
            stagger: 0.06,
            duration: 0.5,
            ease: "charco-reveal",
          }),
        once: true,
      });

      gsap.from(".exit-section", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: ".exit-section",
          start: "top 80%",
          once: true,
        },
      });

      ScrollTrigger.batch(".focus-card", {
        start: "top 85%",
        onEnter: (batch) =>
          gsap.from(batch, {
            y: 24,
            opacity: 0,
            stagger: 0.08,
            duration: 0.5,
            ease: "charco-reveal",
          }),
        once: true,
      });
  }, { scope: pageRef });

  return (
    <div ref={pageRef} className="relative">
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center px-4 pt-20">
        <div className="mx-auto max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <div className="hero-badge inline-flex items-center gap-2 glass-mag px-4 py-2 rounded-full text-xs font-mono text-neon-magenta uppercase tracking-wider">
                <Shield className="w-3 h-3" />
                Sin cuenta · Sin juicio · Salida rápida
              </div>

              <h1 className="hero-title font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-foreground">No vienes de </span>
                <span className="neon-text-magenta">allá</span>
                <br />
                <span className="text-foreground">o de </span>
                <span className="neon-text">aquí.</span>
                <br />
                <span className="text-foreground">Vienes de </span>
                <span className="neon-text-magenta">donde pudiste</span>
                <br />
                <span className="neon-text">empezar.</span>
              </h1>

              <p className="hero-subtitle text-muted-foreground text-lg max-w-lg leading-relaxed">
                Portal comunitario para personas migrantes LGBT+ en Barcelona y L&apos;Hospitalet.
                Trámites, salud, vivienda, comunidad y guías IA orientativas en tu idioma.
              </p>

              <div className="hero-cta flex flex-wrap gap-4">
                <Link
                  href="/guia"
                  className="inline-flex items-center gap-2 bg-neon-cyan text-background px-6 py-3 rounded-xl font-display font-bold text-sm hover:scale-105 transition-transform"
                >
                  <MessageCircle className="w-4 h-4" />
                  Abrir la guía de extranjería
                </Link>
                <Link
                  href="/articulos"
                  className="inline-flex items-center gap-2 glass px-6 py-3 rounded-xl font-display font-bold text-sm text-foreground hover:scale-105 transition-transform"
                >
                  <BookOpen className="w-4 h-4" />
                  Explorar artículos
                </Link>
                <Link
                  href="/recursos"
                  className="inline-flex items-center gap-2 glass px-6 py-3 rounded-xl font-display font-bold text-sm text-foreground hover:scale-105 transition-transform"
                >
                  <MapPin className="w-4 h-4" />
                  Recursos cercanos
                </Link>
              </div>
            </div>

            {/* Right: Image + Language bubbles */}
            <div className="relative hero-image">
              <div className="relative rounded-2xl overflow-hidden neon-border">
                <Image
                  src="/hero-community.png"
                  alt="Comunidad diversa"
                  width={1024}
                  height={1024}
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="w-full h-auto object-cover aspect-square"
                />
              </div>

              {/* Language bubbles */}
              <div className="hero-langs absolute -bottom-4 -left-4 flex flex-col gap-2">
                {languages.slice(0, 5).map((language) => (
                  <div
                    key={language.code}
                    className="lang-bubble glass-mag px-3 py-1.5 rounded-full text-xs font-mono text-neon-magenta"
                  >
                    {language.flag} {language.welcome}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Synth sun decoration */}
        <div className="synth-sun absolute top-1/4 right-0 opacity-20 -z-10" aria-hidden="true" />
      </section>

      {/* ── Validation Phrases ── */}
      <section className="py-16 px-4 overflow-hidden">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
            <Languages className="w-4 h-4 text-neon-cyan" />
            32 idiomas de entrada y apoyo
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {validationPhrases.map((phrase, i) => (
              <span
                key={phrase}
                className="validation-phrase glass-mag px-5 py-2.5 rounded-full text-sm font-display text-neon-magenta"
              >
                {phrase}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Focus Cards ── */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {focusCards.map((card) => (
              <article key={card.title} className="focus-card glass rounded-2xl p-5 card-lift">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-neon-cyan" />
                  <h2 className="font-display font-bold text-lg text-foreground">{card.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agent Grid ── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              <span className="neon-text">14 guías</span> orientativas
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada uno especializado en un área de tu vida. Hablan tu idioma, conocen tu realidad
              y derivan cuando hace falta salir del chat.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {personaList.map((persona) => (
              <Link
                key={persona.id}
                href={`/chat/${persona.id}`}
                className="agent-card glass rounded-xl p-4 card-lift group text-center"
              >
                <div className="text-3xl mb-2">{persona.emoji}</div>
                <h3 className="font-display font-bold text-sm text-foreground group-hover:text-neon-cyan transition-colors">
                  {persona.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {persona.role}
                </p>
              <div
                className="w-full h-0.5 mt-3 rounded-full opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: persona.color }}
              />
            </Link>
          ))}
          </div>
        </div>
      </section>

      {/* ── Resources + Events ── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Recursos verificados
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Enlaces y teléfonos que reducen fricción en el día a día.
                </p>
              </div>
              <Link href="/recursos" className="flex items-center gap-1 text-sm text-neon-cyan hover:underline">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.slice(0, 6).map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target={resource.url.startsWith("http") ? "_blank" : undefined}
                  rel={resource.url.startsWith("http") ? "noreferrer" : undefined}
                  className="glass rounded-xl p-4 card-lift block"
                >
                  <div className="text-xl mb-2">{resource.icon}</div>
                  <h3 className="font-display font-bold text-foreground">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{resource.description}</p>
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Agenda útil
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Formación, cultura y apoyo comunitario.
                </p>
              </div>
              <Link href="/actividades" className="flex items-center gap-1 text-sm text-neon-cyan hover:underline">
                Ver todo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {events.slice(0, 5).map((event) => (
                <article key={event.id} className="glass rounded-xl p-4 card-lift">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h3 className="font-display font-bold text-foreground">{event.title}</h3>
                    <span className="text-xs font-mono text-neon-cyan">{event.category}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                    <span>{event.date}</span>
                    <span>{event.location}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest Articles ── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="articles-header flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Artículos recientes
              </h2>
            <p className="text-muted-foreground text-sm mt-1">
                Información práctica, empática y fácil de leer
              </p>
            </div>
            <Link
              href="/articulos"
              className="flex items-center gap-1 text-sm text-neon-cyan hover:underline"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.slice(0, 6).map((article) => (
              <Link
                key={article.slug}
                href={`/articulos/${article.slug}`}
                className="article-card glass rounded-xl p-5 card-lift group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: article.categoryColor }}
                  />
                  <span className="text-xs font-mono text-muted-foreground uppercase">
                    {article.category}
                  </span>
                </div>
                <h3 className="font-display font-bold text-foreground group-hover:text-neon-cyan transition-colors mb-1">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.description}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span>⏱ {article.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Exit CTA ── */}
      <section className="exit-section py-20 px-4">
        <div className="mx-auto max-w-2xl text-center glass rounded-2xl p-10">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Salida rápida
          </h2>
          <p className="text-muted-foreground mb-6">
            Si no estás seguro/a de estar en un lugar seguro, presiona el botón o haz clic 3 veces seguidas en Shift.
            Se limpiará la sesión y saldrás a una página neutra.
          </p>
          <button
            onClick={() => {
              try { localStorage.clear(); sessionStorage.clear(); } catch {}
              window.location.href = "https://www.google.com";
            }}
            className="emergency-btn relative text-base px-8 py-4"
          >
            🚨 Salir ahora
          </button>
        </div>
      </section>
    </div>
  );
}
