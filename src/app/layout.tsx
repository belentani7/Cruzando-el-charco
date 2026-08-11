import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: {
    default: "Cruzando el Charco — Apoyo para Personas Migrantes LGBT+",
    template: "%s — Cruzando el Charco",
  },
  description:
    "Guía integral, segura y confidencial para personas migrantes LGTBI+ en Barcelona y L'Hospitalet. Salud, trámites, arraigo y apoyo comunitario sin juicio.",
  authors: [{ name: "Cruzando el Charco" }],
  creator: "Cruzando el Charco",
  metadataBase: new URL("https://puente-y-apoyo.lovable.app"),
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Cruzando el Charco",
    title: "Cruzando el Charco — Apoyo para Personas Migrantes LGBT+",
    description:
      "Guía integral, segura y confidencial para personas migrantes LGTBI+ en Barcelona y L'Hospitalet.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Cruzando el Charco",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cruzando el Charco",
    description:
      "Guía integral, segura y confidencial para personas migrantes LGTBI+.",
    images: ["/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://puente-y-apoyo.lovable.app",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080619",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="lenis">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Cruzando el Charco",
              url: "https://puente-y-apoyo.lovable.app",
              description:
                "Guía integral, segura y confidencial para personas migrantes LGTBI+ en Barcelona y L'Hospitalet.",
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "112",
                contactType: "emergency",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SmoothScroll>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-neon-cyan focus:text-background focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
          >
            Saltar al contenido principal
          </a>

          <Header />

          <div className="synth-grid" aria-hidden="true" />
          <div className="orb orb-a" aria-hidden="true" />
          <div className="orb orb-b" aria-hidden="true" />
          <div className="orb orb-c" aria-hidden="true" />

          <main id="main" className="relative z-10">
            {children}
          </main>

          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
