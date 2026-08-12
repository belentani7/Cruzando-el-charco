"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Shield } from "lucide-react";

const navLinks = [
  { href: "/guia", label: "Guía" },
  { href: "/barcelona", label: "Barcelona" },
  { href: "/articulos", label: "Artículos" },
  { href: "/recursos", label: "Recursos" },
  { href: "/actividades", label: "Actividades" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleQuickExit = useCallback(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = "https://www.google.com";
  }, []);

  useEffect(() => {
    let shiftCount = 0;
    let lastShiftTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        const now = Date.now();
        if (now - lastShiftTime < 1000) {
          shiftCount++;
          if (shiftCount >= 3) {
            handleQuickExit();
          }
        } else {
          shiftCount = 1;
        }
        lastShiftTime = now;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleQuickExit]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <nav className="mx-auto flex items-center justify-between px-4 py-3 max-w-7xl">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg text-foreground">
          <span className="neon-text text-xl">⚡</span>
          <span className="hidden sm:inline">Cruzando el Charco</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-neon-cyan ${
                pathname === link.href ? "text-neon-cyan" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickExit}
            className="emergency-btn"
            aria-label="Salida rápida"
          >
            <Shield className="w-4 h-4 inline mr-1" />
            <span className="hidden sm:inline">Salir</span>
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            aria-label="Menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-border/50 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-3 text-sm font-medium border-b border-border/30 transition-colors hover:text-neon-cyan ${
                pathname === link.href ? "text-neon-cyan" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
