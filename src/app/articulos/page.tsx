"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { articles, categories, type Article } from "@/data/articles";
import { Clock, ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ArticulosPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = activeCategory
    ? articles.filter((a) => {
        const cat = categories.find((c) => c.id === activeCategory);
        return cat && a.category === cat.label;
      })
    : articles;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".art-header", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      ScrollTrigger.batch(".art-chip", {
        start: "top 90%",
        onEnter: (batch) =>
          gsap.from(batch, { y: 10, opacity: 0, stagger: 0.04, duration: 0.4 }),
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".art-card");
    gsap.from(cards, {
      y: 30,
      opacity: 0,
      stagger: 0.05,
      duration: 0.5,
      ease: "power2.out",
      clearProps: "all",
    });
  }, [activeCategory]);

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="art-header text-center mb-10">
          <span className="inline-flex items-center gap-2 glass-mag px-4 py-2 rounded-full text-xs font-mono text-neon-magenta uppercase tracking-wider mb-6">
            📚 Artículos
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Información <span className="neon-text">sin rodeos</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {articles.length} artículos prácticos. Elige una categoría o explora todo.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`art-chip chip ${!activeCategory ? "chip-active" : ""}`}
          >
            Todos ({articles.length})
          </button>
          {categories.map((cat) => {
            const count = articles.filter((a) => a.category === cat.label).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`art-chip chip ${activeCategory === cat.id ? "chip-active" : ""}`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block mr-1"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((article) => (
            <Link
              key={article.slug}
              href={`/articulos/${article.slug}`}
              className="art-card glass rounded-xl p-5 card-lift group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: article.categoryColor }}
                />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  {article.category}
                </span>
              </div>
              <h2 className="font-display font-bold text-lg text-foreground group-hover:text-neon-cyan transition-colors mb-2">
                {article.title}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {article.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </div>
                <span className="flex items-center gap-1 text-xs text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                  Leer <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No hay artículos en esta categoría aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}
