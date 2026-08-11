"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getArticleBySlug, articles, categories } from "@/data/articles";
import { ArrowLeft, Clock, Tag, Volume2, Share2 } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const articleContent: Record<string, string[]> = {
  "tu-voz-importa": [
    "Tu voz importa. No es un slogan vacío — es una verdad que mucha gente no ha escuchado lo suficiente.",
    "Cuando migras, especialmente siendo LGBT+, a menudo sientes que tu voz no cuenta. Que nadie quiere escuchar tu historia. Que tu experiencia no es válida.",
    "Pero aquí estás. Leyendo esto. Buscando ayuda. Eso ya es un acto de valentía.",
    "Existen personas y organizaciones que quieren escucharte. Que necesitan tu perspectiva. Que valoran tu existencia tal como eres.",
    "No tienes que tener todas las respuestas. No tienes que ser perfecto/a. Solo tienes que ser tú.",
  ],
  "barcelona-en-7-capas": [
    "Barcelona no es solo la Sagrada Familia y la Rambla. Es una ciudad de barrios, cada uno con su propia personalidad.",
    "El Raval es el barrio más diverso de Barcelona. Aquí conviven más de 100 nacionalidades. Es caótico, vibrante, y auténtico.",
    "El Eixample, especialmente la zona del Gaixample, es el epicentro de la vida LGBT+ de la ciudad. Bares, discotecas, asociaciones.",
    "Gràcia tiene un ambiente bohemio y alternativo. Sus fiestas mayores son legendarias. Es un lugar donde la comunidad se conoce.",
    "L'Hospitalet de Llobregat, la segunda ciudad de Cataluña, es diversa, accesible, y tiene servicios sociales fuertes.",
    "Badalona ofrece playas y precios más bajos, con conexión en 20 minutos en metro desde el centro de Barcelona.",
    "El catalán importa más de lo que crees. Aprenderlo te abre puertas laborales y sociales que el castellano solo no abre.",
    "Cada barrio tiene su propia red de apoyo. No tienes que ir al centro para encontrar ayuda. La ayuda está cerca de ti.",
  ],
};

const defaultContent = [
  "Este artículo está siendo preparado con información actualizada y verificada.",
  "Mientras tanto, puedes consultar nuestros otros artículos o hablar con uno de nuestros agentes de IA para obtener orientación personalizada.",
  "Recuerda: no estás solo/a. Hay una comunidad completa aquí para ti.",
];

export default function ArticuloSlugPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const article = getArticleBySlug(slug);
  const contentRef = useRef<HTMLDivElement>(null);

  const content = articleContent[slug] || defaultContent;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".article-hero", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".article-body p", {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.3,
      });
    });
    return () => ctx.revert();
  }, [slug]);

  if (!article) {
    return (
      <div className="pt-24 pb-20 px-4 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground mb-4">
          Artículo no encontrado
        </h1>
        <p className="text-muted-foreground mb-6">
          El artículo que buscas no existe o ha sido movido.
        </p>
        <Link
          href="/articulos"
          className="inline-flex items-center gap-2 text-neon-cyan hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a artículos
        </Link>
      </div>
    );
  }

  const relatedArticles = articles
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          href="/articulos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-neon-cyan transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a artículos
        </Link>

        {/* Article hero */}
        <div className="article-hero mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: article.categoryColor }}
            />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {article.category}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {article.title}
          </h1>

          <p className="text-lg text-muted-foreground mb-6">
            {article.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {article.readTime} de lectura
            </span>
            <button className="flex items-center gap-1.5 hover:text-neon-cyan transition-colors">
              <Volume2 className="w-4 h-4" /> Escuchar
            </button>
            <button className="flex items-center gap-1.5 hover:text-neon-cyan transition-colors">
              <Share2 className="w-4 h-4" /> Compartir
            </button>
          </div>
        </div>

        {/* Article body */}
        <div ref={contentRef} className="article-content mb-16">
          {content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-12">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 chip text-xs"
            >
              <Tag className="w-3 h-3" /> {tag}
            </span>
          ))}
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              Artículos relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/articulos/${a.slug}`}
                  className="glass rounded-xl p-4 card-lift group"
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: a.categoryColor }}
                  />
                  <h3 className="font-display font-bold text-sm mt-2 group-hover:text-neon-cyan transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {a.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
