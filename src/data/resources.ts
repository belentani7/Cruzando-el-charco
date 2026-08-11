export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  icon: string;
}

export const resources: Resource[] = [
  {
    id: "casal-lambda",
    title: "Casal Lambda",
    description: "Asociación LGBT+ en Barcelona. Atención jurídica, psicológica y cultural.",
    url: "https://www.lambdainfo.org",
    category: "Asociaciones",
    icon: "🏳️‍🌈",
  },
  {
    id: "amic-ugt",
    title: "AMIC-UGT",
    description: "Asesoría jurídica para personas migrantes. Extranjería, laboral y derechos.",
    url: "https://www.ugt.es",
    category: "Asesoría legal",
    icon: "⚖️",
  },
  {
    id: "bcn-checkpoint",
    title: "BCN Checkpoint",
    description: "Centro de salud sexual para hombres que tienen sexo con hombres. PrEP, ITS.",
    url: "https://www.checkpointbcn.org",
    category: "Salud sexual",
    icon: "🏥",
  },
  {
    id: "cear",
    title: "CEAR",
    description: "Comisión Española de Ayuda al Refugiado. Asilo, acogida y asesoría jurídica.",
    url: "https://www.cear.es",
    category: "Asesoría legal",
    icon: "🏠",
  },
  {
    id: "stop-dolors",
    title: "Stop Dolors",
    description: "Red de apoyo a personas trans en L'Hospitalet. Grupos de ayuda mutua.",
    url: "#",
    category: "Comunidad",
    icon: "💜",
  },
  {
    id: "cooperativa-ondakutxa",
    title: "Ondakutxa",
    description: "Cooperativa de vivienda social en Barcelona. Alquiler asequible y comunitario.",
    url: "#",
    category: "Vivienda",
    icon: "🏠",
  },
  {
    id: "emergencia-112",
    title: "Emergencias 112",
    description: "Número de emergencias europeo. Policía, ambulancia, bomberos.",
    url: "tel:112",
    category: "Emergencias",
    icon: "🚨",
  },
  {
    id: "salud-mental-024",
    title: "Línea de la Vida 024",
    description: "Atención en crisis emocional, suicidio y salud mental 24h, gratis y confidencial.",
    url: "tel:024",
    category: "Emergencias",
    icon: "🧠",
  },
  {
    id: "trabajo-sin-fronteras",
    title: "Trabajo sin Fronteras",
    description: "Asesoría laboral para personas migrantes. Derechos, denuncias, formación.",
    url: "#",
    category: "Trabajo",
    icon: "💼",
  },
  {
    id: "fundacion-vicente-ferrer",
    title: "Fundación Vicente Ferrer",
    description: "Programas de integración, formación y empleo en Cataluña.",
    url: "https://www.vicenteferrer.org",
    category: "Formación",
    icon: "📚",
  },
];
