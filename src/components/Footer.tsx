import Link from "next/link";

const footerLinks = [
  {
    title: "Navegación",
    links: [
      { href: "/guia", label: "Guía de Apoyo" },
      { href: "/barcelona", label: "Barcelona" },
      { href: "/articulos", label: "Artículos" },
      { href: "/recursos", label: "Recursos" },
      { href: "/actividades", label: "Actividades" },
    ],
  },
  {
    title: "Emergencias",
    links: [
      { href: "tel:112", label: "112 — Emergencias" },
      { href: "tel:024", label: "024 — Salud Mental" },
      { href: "tel:016", label: "016 — Violencia de Género" },
    ],
  },
  {
    title: "Comunidad",
    links: [
      { href: "https://www.lambdainfo.org", label: "Casal Lambda", external: true },
      { href: "https://www.cear.es", label: "CEAR", external: true },
      { href: "https://www.checkpointbcn.org", label: "BCN Checkpoint", external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-20">
      <div className="rainbow-bar h-1 w-full" />

      <div className="bg-card/80 backdrop-blur-sm border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="font-display font-bold text-sm text-foreground mb-4 uppercase tracking-wider">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
                      >
                        {link.label}
                        {link.external && (
                          <span className="ml-1 text-xs">↗</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2026 Cruzando el Charco. Hecho con amor para la comunidad migrante LGBT+.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              <Link href="/" className="hover:text-neon-cyan transition-colors">
                puente-y-apoyo.lovable.app
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
