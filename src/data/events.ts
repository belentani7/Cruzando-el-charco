export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  url?: string;
  category: string;
}

export const events: Event[] = [
  {
    id: "pride-bcn-2026",
    title: "Orgullo Barcelona 2026",
    date: "2026-06-28",
    location: "Passeig de Gràcia, Barcelona",
    description: "Manifestació i festa per la diversitat. Tots els colors, tots els cossos.",
    category: "Fiesta",
  },
  {
    id: "taller-catala-gratuit",
    title: "Taller de Català Gratuït",
    date: "2026-09-15",
    location: "Centre Cívic, L'Hospitalet",
    description: "Curs de català per a persones immigrants. Nivell inicial i intermedi.",
    category: "Formación",
  },
  {
    id: "mercato-diverso",
    title: "Mercat del Divers",
    date: "2026-10-12",
    location: "Mercat de Sant Antoni, Barcelona",
    description: "Mercat de productes i artesania de col·lectius LGBT+. Música, food trucks i community.",
    category: "Fiesta",
  },
  {
    id: "jornada-derechos-migrantes",
    title: "Jornada de Drets de les Persones Migrants",
    date: "2026-11-20",
    location: "Universitat de Barcelona",
    description: "Jornada sobre drets, arraigo i integració. Ponències i tallers pràctics.",
    category: "Formación",
  },
  {
    id: "noche-de-los-museos",
    title: "Nit dels Museus",
    date: "2026-05-16",
    location: "Museus de Barcelona",
    description: "Entrada gratuïta a tots els museus de la ciutat. Una nit per gaudir de la cultura.",
    category: "Cultura",
  },
  {
    id: "taller-salud-sexual",
    title: "Taller de Salut Sexual",
    date: "2026-09-25",
    location: "Casal Lambda, Barcelona",
    description: "Taller obert sobre PrEP, PEP, consentiment i relacions saludables. Sense tabús.",
    category: "Salud",
  },
];
