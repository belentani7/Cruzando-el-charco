/* Motor de orientación local de Cruzando el Charco (v2).
 *
 * QUÉ ES
 * Un clasificador de intenciones determinista, auditable y sin red. Se ejecuta
 * entero en el navegador: nadie ve la pregunta, no hay latencia de proveedor y
 * el resultado es reproducible (misma pregunta, misma respuesta).
 *
 * POR QUÉ NO ES UN LLM EN EL CLIENTE
 * Porque la audiencia está en situación irregular, consulta sobre asilo, salud
 * y violencia, y no podemos permitirnos respuestas inventadas, claves expuestas
 * en el bundle ni dependencia de red. El LLM opcional vive en worker/ (servidor),
 * y este motor es siempre el respaldo y la capa de seguridad previa.
 *
 * REGLAS DE DISEÑO
 * 1. Seguridad primero: crisis, violencia y urgencia médica se resuelven ANTES
 *    de cualquier puntuación de intención, en 11 idiomas.
 * 2. Nunca diagnosticar, nunca concluir elegibilidad jurídica, nunca prometer
 *    plazos ni resultados. Siempre citar fuente y derivar a persona/servicio.
 * 3. Si la confianza es baja, se pregunta y se ofrecen recursos; no se improvisa.
 * 4. Toda cita debe existir en assets/content.js: la evaluación (scripts/eval-agents.mjs)
 *    falla si una fuente citada no resuelve a un recurso real.
 */
window.CHARCO_AI = (() => {
  "use strict";

  const content = window.CHARCO_CONTENT;
  if (!content) return Object.freeze({ answer: () => null, unavailable: true });

  const VERSION = "2.0.0";

  /* ---------------------------------------------------------------- idiomas */

  const LANGUAGES = ["es", "ca", "en", "it", "fr", "de", "pt", "zh", "ur", "ar", "fi"];
  const RTL = ["ar", "ur"];

  // Detección de idioma por script + palabras vacías frecuentes. No pretende ser
  // un detector académico: solo decide si conviene responder en otro idioma.
  const SCRIPT_HINTS = [
    [/[\u0600-\u06ff]/, "ar"],
    [/[\u4e00-\u9fff]/, "zh"]
  ];
  const STOPWORDS = {
    ca: ["vull", "necessito", "què", "com", "on", "puc", "però", "tinc", "aigua", "feina", "ajuda"],
    en: ["i need", "how", "where", "can", "help", "the", "what", "doctor", "work", "paper"],
    it: ["ho bisogno", "come", "dove", "posso", "aiuto", "lavoro", "salute", "casa"],
    fr: ["j'ai besoin", "comment", "où", "puis", "aide", "travail", "santé", "logement"],
    de: ["ich brauche", "wie", "wo", "kann", "hilfe", "arbeit", "gesundheit", "wohnung"],
    pt: ["preciso", "como", "onde", "posso", "ajuda", "trabalho", "saúde", "casa"],
    fi: ["tarvitsen", "miten", "missä", "voinko", "apua", "työ", "terveys", "asunto"],
    ur: ["مجھے", "کیسے", "کہاں", "مدد", "کام", "صحت"],
    ar: ["أحتاج", "كيف", "أين", "مساعدة", "عمل", "صحة"],
    es: ["necesito", "cómo", "dónde", "puedo", "ayuda", "trabajo", "salud", "papeles"]
  };

  const detectLanguage = (text) => {
    if (!text) return "es";
    for (const [pattern, language] of SCRIPT_HINTS) {
      if (pattern.test(text)) return language === "ar" && /[\u0679\u0688\u06be\u06af\u06ba\u067e\u0686]/.test(text) ? "ur" : language;
    }
    const lower = ` ${text.toLocaleLowerCase()} `;
    let best = "es";
    let score = 0;
    Object.entries(STOPWORDS).forEach(([language, words]) => {
      const hits = words.filter((word) => lower.includes(` ${word} `) || lower.includes(`${word} `)).length;
      if (hits > score) { score = hits; best = language; }
    });
    return score >= 1 ? best : "es";
  };

  /* --------------------------------------------------------------- seguridad */

  // Frases críticas en los 11 idiomas. El orden importa: crisis > violencia >
  // urgencia sanitaria > exposición al VIH.
  const CRISIS = [
    /suicid|matar(me|te)?\b|me quiero morir|acabar con (mi vida|todo)|hacerme daño|no quiero vivir|autolesi/i,
    /suïcid|matar-me|fer-me mal|no vull viure|vull morir/i,
    /kill myself|suicide|end my life|self.?harm|want to die/i,
    /suicid|ammazzarmi|farmi del male|voglio morire|non voglio pi(u|ù) vivere/i,
    /suicid|me tuer|me faire du mal|je veux mourir|en finir/i,
    /suizid|selbstmord|umbringen|mir etwas antun|will nicht mehr leben/i,
    /suic[ií]d|me matar|me machucar|quero morrer|n(a|ã)o quero viver/i,
    /自杀|不想活|伤害自己|结束生命/,
    /خودکشی|خود کو نقصان|جینا نہیں چاہتا|مرنا چاہتا/,
    /انتحار|إيذاء نفسي|أريد أن أموت|لا أريد أن أعيش/,
    /itsemurha|tappaa itseni|en halua el(ä|a)ä|vahingoittaa itse/iu
  ];
  const VIOLENCE = [
    /agresi|agred|violencia|amenaz|pegaron|me han pegado|golpe|maltrat|abus(o|ar)|violaci|acoso|insult|escup|odio|miedo por ser (gay|lesbiana|trans)/i,
    /agressi|viol(è|e)ncia|amenaç|m'han pegat|abus|violaci|assetjament/i,
    /attack|assault|violence|threat|abuse|rape|harass|hate/i,
    /aggression|violenza|minacc|abuso|stupro|molestie/i,
    /agression|violence|menace|abus|viol|harc(è|e)lement/i,
    /angriff|gewalt|drohung|missbrauch|vergewaltigung|bel(ä|a)stigung/i,
    /agress|viol(ê|e)ncia|amea(ç|c)|abuso|estupro|ass[ée]dio/i,
    /袭击|暴力|威胁|虐待|强奸|骚扰/,
    /حملہ|تشدد|دھمکی|زیادتی|جنسی زیادتی/,
    /اعتداء|عنف|تهديد|إساءة|اغتصاب|تحرش/,
    /hy(ö|o)kk(ä|a)ys|v(ä|a)kivalta|uhkaus|hyv(ä|a)ksik(ä|a)yt(ö|o)|raiskaus/i
  ];
  const MEDICAL_EMERGENCY = [
    /dolor (en el )?pecho|no puedo respirar|me falta el aire|sangrado|estoy desmay|desmayad|inconsciente|convulsi|fiebre muy alta|urgencia (vital|medica|médica)|emergencia (vital|medica|médica)|hemorragia/i,
    /dolor (al )?pit|no puc respirar|sagnat|desmai|inconscient|convulsi/i,
    /chest pain|can'?t breathe|bleeding|unconscious|seizure|emergency/i,
    /dolore al petto|non riesco a respirare|sanguin|svenut|convuls/i,
    /douleur (à|a) la poitrine|je n'arrive pas (à|a) respirer|saignement|(é|e)vanoui/i,
    /brustschmerz|kann nicht atmen|blutung|bewusstlos|krampf/i,
    /dor no peito|n(ã|a)o consigo respirar|sangramento|desmai|convuls/i,
    /胸痛|无法呼吸|出血|昏迷|抽搐|急救/,
    /سینے میں درد|سانس نہیں|خون بہہ|بے ہوش/,
    /ألم في الصدر|لا أستطيع التنفس|نزيف|فقدان الوعي/,
    /rintakipu|en pysty hengitt(ä|a)m(ä|a)än|verenvuoto|tajuton/i
  ];
  const PEP_URGENCY = [
    /pep\b|profilaxis|post.?exposici|sin preservativo|condón roto|preservativo roto|me han violado|sexo sin cond(ó|o)n/i,
    /pep\b|profilaxi|sense preservatiu|preservatiu trencat/i,
    /pep\b|post.?exposure|condom broke|unprotected sex|bareback/i,
    /pep\b|profilassi|preservativo rotto|rapporti non protetti/i,
    /pep\b|prophylaxie|pr(é|e)servatif (a|à) craqu|rapport non prot(é|e)g(é|e)/i,
    /pep\b|postexposition|kondom gerissen|ungesch(ü|u)tzter/i,
    /pep\b|preservativo roto|sexo sem preservativo/i,
    /pep|阻断|无保护性行为|安全套破裂/,
    /پی ای پی|بغیر حفاظتی تعلق|کنڈوم ٹوٹ/,
    /الوقاية بعد التعرض|علاقة غير محمية|تمزق الواقي/,
    /pep|j(ä|a)lkiehk(ä|a)isy|kondomi rikk/i
  ];

  const matchAny = (patterns, text) => patterns.some((pattern) => pattern.test(text));

  const SAFETY = {
    crisis: {
      kind: "crisis",
      reply: {
        es: "Si existe riesgo inmediato de hacerte daño, llama al 112 ahora. Para atención a la conducta suicida en España está el 024, gratuito y disponible 24 horas. No te quedes a solas: busca una persona, una entidad o un espacio seguro y díselo con tus palabras. Esta guía no atiende emergencias.",
        ca: "Si hi ha risc immediat de fer-te mal, truca ara al 112. Per a l'atenció a la conducta suïcida hi ha el 024, gratuït i 24 hores. No et quedis sol/a: busca una persona, una entitat o un espai segur i explica-ho amb les teves paraules. Aquesta guia no atén emergències.",
        en: "If there is an immediate risk of harming yourself, call 112 now. For suicidal thoughts in Spain, call 024, free and available 24 hours. Do not stay alone: find a person, an organisation or a safe space and say it in your own words. This guide does not handle emergencies."
      },
      phone: "112",
      secondaryPhone: "024",
      sources: ["024 · Atención a la conducta suicida", "Centre LGTBI de Barcelona"]
    },
    violence: {
      kind: "violence",
      reply: {
        es: "Primero la seguridad: si hay peligro ahora, llama al 112 y aléjate del lugar si puedes hacerlo sin arriesgar más. Después, y sin ponerte en riesgo, anota fecha, hora, lugar, testigos y guarda copia de cualquier prueba. Puedes registrar el incidente con el Observatori contra l'LGTBI-fòbia o la Oficina por la No Discriminación, y pedir acompañamiento al Centre LGTBI. No tienes que denunciar para recibir apoyo.",
        ca: "Primer la seguretat: si hi ha perill ara, truca al 112 i allunya't del lloc si pots fer-ho sense arriscar més. Després, i sense posar-te en risc, anota data, hora, lloc, testimonis i guarda còpia de qualsevol prova. Pots registrar l'incident amb l'Observatori contra l'LGTBI-fòbia o l'Oficina per la No Discriminació, i demanar acompanyament al Centre LGTBI. No cal denunciar per rebre suport.",
        en: "Safety first: if there is danger right now, call 112 and move away if you can do so without further risk. Afterwards, without putting yourself at risk, note date, time, place and witnesses, and keep copies of any evidence. You can report the incident to the Observatori contra l'LGTBI-fòbia or the Office for Non-Discrimination, and ask the Centre LGTBI for support. You do not need to file a police report to receive help."
      },
      phone: "112",
      secondaryPhone: "028",
      sources: ["Observatori Contra l'LGTBI-fòbia", "Oficina por la No Discriminación", "Centre LGTBI de Barcelona", "028 · Servicio Arcoíris"]
    },
    medical: {
      kind: "medical-emergency",
      reply: {
        es: "Eso puede ser una urgencia médica: llama al 112 (emergencia vital) o al 061 (orientación sanitaria 24 h) y sigue las instrucciones del personal sanitario. No conduzcas tú. No puedo valorar síntomas ni decirte si es grave.",
        ca: "Això pot ser una urgència mèdica: truca al 112 (emergència vital) o al 061 (orientació sanitària 24 h) i segueix les instruccions del personal sanitari. No condueixis tu. No puc valorar símptomes ni dir-te si és greu.",
        en: "This may be a medical emergency: call 112 (life-threatening) or 061 (24 h health advice) and follow the instructions of the health staff. Do not drive yourself. I cannot assess symptoms or tell you how serious it is."
      },
      phone: "112",
      secondaryPhone: "061",
      sources: ["061 Salut Respon"]
    },
    pep: {
      kind: "pep-window",
      reply: {
        es: "La PEP es un tratamiento de emergencia que solo valora un servicio sanitario y que funciona mejor cuanto antes se inicia, habitualmente dentro de las primeras 72 horas. Actúa hoy: llama al 061 o acude a urgencias hospitalarias y di que consultas por una posible exposición al VIH. Añade la hora exacta en el reloj PEP de esta página para ordenar el tiempo. No es un diagnóstico ni una receta.",
        ca: "La PEP és un tractament d'emergència que només valora un servei sanitari i que funciona millor com abans s'inicia, normalment dins de les primeres 72 hores. Actua avui: truca al 061 o vés a urgències hospitalàries i digues que consultes per una possible exposició al VIH. Afegeix l'hora exacta al rellotge PEP d'aquesta pàgina per ordenar el temps. No és un diagnòstic ni una recepta.",
        en: "PEP is an emergency treatment that only a health service can assess, and it works better the sooner it starts, usually within the first 72 hours. Act today: call 061 or go to hospital emergency care and say you are asking about a possible HIV exposure. Add the exact time to the PEP clock on this page to order your timeline. This is not a diagnosis or a prescription."
      },
      phone: "061",
      secondaryPhone: null,
      sources: ["PrEP gratuita en Catalunya", "BCN Checkpoint", "Stop Sida", "061 Salut Respon"]
    }
  };

  /* --------------------------------------------------------------- léxico IA */

  // Cada intención suma puntos por términos presentes. Los términos largos pesan
  // más (son más específicos): "homologación" no debe competir con "papel".
  const INTENTS = [
    /* --- orientación jurídica ------------------------------------------- */
    { agent: "legal", id: "asilo", weight: 1, strong: ["asilo", "refugio", "proteccion internacional"], terms: ["asilo", "refugio", "refugiado", "proteccion internacional", "persecucion", "homofobia en mi pais", "me persiguen", "asylum", "refugee", "asil", "asile", "refugi"],
      answers: {
        es: ["Ordena el caso antes de firmar nada: 1) pide cita o acude a SAIER, CEAR o ACATHI para una primera orientación gratuita; 2) prepara una cronología con fechas y hechos (qué pasó, cuándo, quién lo supo); 3) reúne documentos, mensajes y cualquier prueba, siempre con copia; 4) no pagues a intermediarios por citas públicas y no firmes documentos que no entiendas.", "El teléfono oficial de Protección Internacional es 910 006 910. Si ya has presentado la solicitud, conserva el resguardo: es tu prueba de estancia."],
        ca: ["Ordena el cas abans de signar res: 1) demana cita o vés a SAIER, CEAR o ACATHI per una primera orientació gratuïta; 2) prepara una cronologia amb dates i fets; 3) reuneix documents i proves, sempre amb còpia; 4) no paguis intermediaris per cites públiques."],
        en: ["Get the case in order before signing anything: 1) book or walk into SAIER, CEAR or ACATHI for free first-line guidance; 2) build a timeline with dates and facts; 3) gather documents and evidence, always keep copies; 4) never pay intermediaries for public appointments."]
      },
      sources: ["Protección internacional · Ministerio del Interior", "CEAR Catalunya", "ACATHI", "SAIER"] },

    { agent: "legal", id: "arraigo", weight: 1, strong: ["arraigo"], terms: ["arraigo", "regularizar", "regularizacion", "residencia", "permiso de residencia", "tarjeta", "mi situacion", "sin papeles", "irregular", "residence", "regularisation", "aufenthalt"],
      answers: {
        es: ["El arraigo exige acreditar tiempo de permanencia y circunstancias concretas, y las modalidades cambian. Ruta prudente: 1) cuenta con documentos cuánto tiempo llevas aquí (empadronamiento, citas médicas, compras, contratos); 2) pide orientación en SAIER o en el Punt d'Informació d'Arrelament; 3) pregunta por el informe de esfuerzo de integración y por los plazos reales de tu caso; 4) presenta con copia y guarda todos los resguardos."],
        ca: ["L'arrelament exigeix acreditar temps de permanència i circumstàncies concretes, i les modalitats canvien. Ruta prudent: 1) compta amb documents quant de temps fa que ets aquí; 2) demana orientació a SAIER o al Punt d'Informació d'Arrelament; 3) pregunta per l'informe d'esforç d'integració; 4) presenta amb còpia i guarda els resguards."],
        en: ["Arraigo requires proving time of stay and specific circumstances, and the categories change. Careful route: 1) count documented time here (padró, medical visits, receipts, contracts); 2) ask SAIER or the Punt d'Informació d'Arrelament; 3) ask about the integration report and real deadlines for your case; 4) file with copies and keep every receipt."]
      },
      sources: ["Punt d'Informació d'Arrelament", "SAIER", "Portal de inmigración · Ministerio de Inclusión"] },

    { agent: "legal", id: "empadronamiento", weight: 1, strong: ["empadron", "padron", "padro municipal"], terms: ["empadron", "padron", "hoja de empadronamiento", "registro en el ayuntamiento", "darme de alta", "register address"],
      answers: {
        es: ["Empadronarse es un derecho y no depende de tu situación administrativa. 1) Pide cita en el ayuntamiento del municipio donde vives de verdad (Barcelona: 010 o cita online). 2) Lleva identificación si la tienes y algún documento del domicilio (contrato, recibo, carta del titular, testimonio). 3) Si vives en una habitación, pregunta por el procedimiento para habitaciones y viviendas compartidas. 4) Guarda la hoja: la usarás para salud, escuela y casi todos los trámites."],
        ca: ["Empadronar-se és un dret i no depèn de la teva situació administrativa. 1) Demana cita a l'ajuntament on vius de veritat. 2) Porta identificació si en tens i algun document del domicili. 3) Si vius en una habitació, pregunta pel procediment corresponent. 4) Guarda el full: el faràs servir per salut, escola i gairebé tots els tràmits."],
        en: ["Registering your address (padrón) is a right and does not depend on your immigration status. 1) Book an appointment with the town hall where you really live. 2) Bring ID if you have it and some proof of address. 3) If you rent a room, ask about the shared-housing procedure. 4) Keep the certificate: you will need it for health, school and almost every procedure."]
      },
      sources: ["Sitges · serveis municipals", "SAIER", "Vivienda · Ayuntamiento de Barcelona"] },

    { agent: "legal", id: "nie", weight: 1, strong: ["nie", "tie"], terms: ["nie", "tie", "tarjeta de identidad", "cita previa policia", "extranjeria", "huellas", "renovar la tarjeta", "documentacion"],
      answers: {
        es: ["El NIE identifica, la TIE acredita la autorización: no son lo mismo y caducan. 1) Mira requisitos y tasas en el canal oficial (Policía Nacional / portal de inmigración). 2) La cita se pide solo en canales oficiales: nadie puede venderte una cita pública. 3) Renovar con tiempo evita perder derechos: si está a punto de caducar, consulta primero la vía de renovación. 4) Guarda copia de todo lo presentado y apunta el número de expediente."],
        ca: ["El NIE identifica, la TIE acredita l'autorització: no són el mateix i caduquen. 1) Consulta requisits i taxes al canal oficial. 2) La cita només es demana en canals oficials. 3) Renovar amb temps evita perdre drets. 4) Guarda còpia de tot i apunta el número d'expedient."],
        en: ["The NIE identifies you, the TIE proves your authorisation: they are different and they expire. 1) Check requirements and fees on official channels. 2) Appointments only through official channels: nobody can sell you a public appointment. 3) Renew early to protect your rights. 4) Keep copies and note your file number."]
      },
      sources: ["Policía Nacional · Extranjería (NIE y TIE)", "Portal de inmigración · Ministerio de Inclusión", "SAIER"] },

    { agent: "legal", id: "discriminacion", weight: 1, terms: ["discriminacion", "no me alquilan", "me rechazan", "me echan por ser", "homofobia", "transfobia", "delito de odio", "denunciar", "discrimination", "hate crime", "diskriminierung"],
      answers: {
        es: ["La orientación sexual, la identidad de género y el origen no son motivos válidos para negarte un servicio, un alquiler o un empleo. 1) Anota fecha, lugar, persona o empresa y testigos. 2) Si hay peligro, 112; si ya pasó, puedes llamar al 028 (gratuito, 24 h) y registrar el caso con la Oficina por la No Discriminación u Observatori contra l'LGTBI-fòbia. 3) Guarda mensajes y capturas sin difundir datos de terceros. 4) Puedes pedir apoyo de entidades antes de decidir si denuncias."],
        ca: ["L'orientació sexual, la identitat de gènere i l'origen no són motius vàlids per negar-te un servei, un lloguer o una feina. 1) Anota data, lloc, persona o empresa i testimonis. 2) Si hi ha perill, 112; si ja ha passat, pots trucar al 028 i registrar el cas. 3) Guarda missatges i captures. 4) Pots demanar suport d'entitats abans de decidir si denuncies."],
        en: ["Sexual orientation, gender identity and origin are never valid reasons to deny you a service, a rental or a job. 1) Write down date, place, person or company and witnesses. 2) If there is danger, 112; if it already happened, call 028 (free, 24 h) and register the case. 3) Keep messages and screenshots without sharing third-party data. 4) Ask organisations for support before deciding whether to report."]
      },
      sources: ["Oficina por la No Discriminación", "Observatori Contra l'LGTBI-fòbia", "028 · Servicio Arcoíris", "Centre LGTBI de Barcelona"] },

    /* --- salud ----------------------------------------------------------- */
    { agent: "health", id: "cap", weight: 1, strong: ["cap", "medico de familia", "tarjeta sanitaria"], terms: ["cap", "medico de familia", "tarjeta sanitaria", "ambulatorio", "cita medica", "centro de salud", "doctor", "metge", "sin documentacion sanitaria", "tengo derecho a medico"],
      answers: {
        es: ["Ruta para entrar al sistema sanitario público: 1) pide cita en el CAP de tu zona (lleva empadronamiento e identificación si la tienes); 2) si no tienes permiso de residencia, pregunta por la documentación que cada centro pide para atención primaria; la atención de urgencia y a menores no depende del permiso; 3) usa La Meva Salut para citas y recetas; 4) si te rechazan sin explicación clara, pide por escrito el motivo y consulta con una entidad: no es normal."],
        ca: ["Ruta per entrar al sistema sanitari públic: 1) demana cita al CAP de la teva zona; 2) si no tens permís de residència, pregunta quina documentació demana cada centre per a atenció primària; l'atenció d'urgència i a menors no depèn del permís; 3) fes servir La Meva Salut per a cites i receptes; 4) si et rebutgen sense motiu clar, demana'l per escrit."],
        en: ["How to enter the public health system: 1) book an appointment at the CAP for your area; 2) if you have no residence permit, ask which documents that centre requires for primary care — emergency care and care for minors do not depend on a permit; 3) use La Meva Salut for appointments and prescriptions; 4) if you are refused without a clear reason, ask for it in writing."]
      },
      sources: ["Canal Salut", "La Meva Salut", "061 Salut Respon", "Agència de Salut Pública de Barcelona"] },

    { agent: "health", id: "its", weight: 1, strong: ["prueba", "vih", "its"], terms: ["prueba", "its", "vih", "sida", "sifilis", "hepatitis", "clamidia", "gonorrea", "hacerme la prueba", "sti", "hiv", "test"],
      answers: {
        es: ["Pruebas sin juicios: 1) BCN Checkpoint y Stop Sida hacen pruebas comunitarias de VIH e ITS, gratuitas o a precio social; Gais Positius hace pruebas rápidas de VIH, sífilis y hepatitis C; 2) tu CAP también diagnostica y trata, con confidencialidad; 3) frecuencia razonable: cada 3-6 meses si tienes varias parejas o prácticas de riesgo, y al menos una vez al año; 4) un resultado positivo tiene tratamiento gratuito y seguimiento; preguntar nunca estropea nada."],
        ca: ["Proves sense judicis: 1) BCN Checkpoint i Stop Sida fan proves comunitàries de VIH i ITS; Gais Positius fa proves ràpides de VIH, sífilis i hepatitis C; 2) el teu CAP també diagnostica i tracta amb confidencialitat; 3) cada 3-6 mesos si tens diverses parelles; 4) un resultat positiu té tractament gratuït i seguiment."],
        en: ["Judgement-free testing: 1) BCN Checkpoint and Stop Sida run community HIV/STI testing; Gais Positius offers rapid HIV, syphilis and hepatitis C tests; 2) your CAP also diagnoses and treats, confidentially; 3) every 3-6 months if you have several partners; 4) a positive result means free treatment and follow-up."]
      },
      sources: ["BCN Checkpoint", "Stop Sida", "Gais Positius", "Canal Salut"] },

    { agent: "health", id: "prep", weight: 1, terms: ["prep", "profilaxis preexposicion", "prEP", "pastilla preventiva", "prevention pill"],
      answers: {
        es: ["La PrEP es prevención continuada frente al VIH, gratuita en Catalunya, y se prescribe desde los 16 años en unidades de VIH-ITS y en dispositivos comunitarios. 1) Pide información en BCN Checkpoint o en el circuito público; 2) incluye analíticas periódicas de seguimiento; 3) no sustituye al preservativo si quieres prevenir otras ITS; 4) si lo que necesitas es PEP por una exposición reciente, eso es urgente: llama al 061 hoy."],
        ca: ["La PrEP és prevenció continuada davant el VIH, gratuïta a Catalunya, i es prescriu des dels 16 anys a unitats de VIH-ITS i dispositius comunitaris. 1) Demana informació a BCN Checkpoint o al circuit públic; 2) inclou analítiques periòdiques; 3) no substitueix el preservatiu per a altres ITS; 4) si necessites PEP, és urgent: truca avui al 061."],
        en: ["PrEP is ongoing HIV prevention, free in Catalonia, prescribed from age 16 at HIV-STI units and community services. 1) Ask BCN Checkpoint or the public circuit; 2) it includes regular blood tests; 3) it does not replace condoms for other STIs; 4) if you need PEP after a recent exposure, that is urgent: call 061 today."]
      },
      sources: ["PrEP gratuita en Catalunya", "BCN Checkpoint", "Canal Salut"] },

    { agent: "health", id: "trans", weight: 1, terms: ["trans", "transgenero", "hormonas", "testosterona", "estrogenos", "transicion", "cambio de nombre", "no binario", "hrt"],
      answers: {
        es: ["Atención trans en el sistema público catalán: 1) el circuito pasa por el programa Trànsit y sus unidades de referencia; 2) el Centre LGTBI de Barcelona informa, acompaña y ayuda con el cambio de nombre y documentación; 3) si ya empezaste hormonas por tu cuenta, dilo sin miedo: el objetivo es acompañar y hacer analíticas, no juzgar; 4) la medicación sin seguimiento es el riesgo real. Guarda copia de todo lo que pidas."],
        ca: ["Atenció trans al sistema públic català: 1) el circuit passa pel programa Trànsit; 2) el Centre LGTBI informa i acompanya, també amb el canvi de nom i documentació; 3) si ja has començat hormones pel teu compte, digues-ho sense por; 4) la medicació sense seguiment és el risc real."],
        en: ["Trans healthcare in the Catalan public system: 1) the circuit runs through the Trànsit programme; 2) the Centre LGTBI provides information and support, including name and document changes; 3) if you already started hormones on your own, say so without fear; 4) unmonitored medication is the real risk."]
      },
      sources: ["Trànsit", "Centre LGTBI de Barcelona", "Canal Salut"] },

    { agent: "health", id: "mental", weight: 1, terms: ["ansiedad", "depresion", "no puedo dormir", "insomnio", "tristeza", "soledad", "duelo", "panico", "estres", "mental", "psicologo", "therapist", "anxiety"],
      answers: {
        es: ["Lo que sientes tiene nombre y tiene salida: 1) el Centre LGTBI ofrece apoyo psicológico gratuito con perspectiva LGTBIQ+; 2) tu CAP puede derivar a salud mental pública; 3) Telèfon de l'Esperança y el 024 escuchan cuando no hay cita cerca; 4) el duelo migratorio y el aislamiento mejoran con acompañamiento y red, no con fuerza de voluntad. Si aparece ideación suicida, 024 o 112."],
        ca: ["El que sents té nom i té sortida: 1) el Centre LGTBI ofereix suport psicològic gratuït; 2) el teu CAP pot derivar a salut mental pública; 3) Telèfon de l'Esperança i el 024 escolten quan no hi ha cita a prop; 4) el dol migratori i l'aïllament milloren amb acompanyament. Si apareix ideació suïcida, 024 o 112."],
        en: ["What you feel has a name and a way through: 1) the Centre LGTBI offers free psychological support with an LGBTQ+ perspective; 2) your CAP can refer you to public mental health; 3) Telèfon de l'Esperança and 024 listen when no appointment is near; 4) migration grief and isolation improve with support and community. If suicidal thoughts appear, 024 or 112."]
      },
      sources: ["Centre LGTBI de Barcelona", "Salut Mental Catalunya", "Telèfon de l'Esperança", "024 · Atención a la conducta suicida"] },

    { agent: "health", id: "chems", weight: 1, terms: ["chemsex", "drogas", "cristal", "ghb", "mephedrona", "fiesta y sexo", "reduccion de daños", "sobredosis", "no puedo parar"],
      answers: {
        es: ["Hablar de esto no te convierte en un problema: 1) hidrátate, dosifica con información de fuentes fiables y no mezcles depresores con estimulantes; 2) avisa a alguien de confianza de dónde estás si vas a consumir; 3) si hay pérdida de conciencia, convulsiones o confusión, 112; 4) existen servicios de reducción de daños y entidades comunitarias con asesoramiento sin moralina, además de programas específicos de chemsex en la red LGTBIQ+."],
        ca: ["Parlar-ne no et converteix en un problema: 1) hidrata't, dosifica amb informació fiable i no barregis depressors amb estimulants; 2) avisa algú de confiança; 3) si hi ha pèrdua de consciència o convulsions, 112; 4) hi ha serveis de reducció de danys i entitats comunitàries amb assessorament sense moralina."],
        en: ["Talking about this does not make you a problem: 1) hydrate, dose with reliable information and do not mix depressants with stimulants; 2) tell someone you trust where you are; 3) if there is loss of consciousness, seizures or confusion, call 112; 4) harm-reduction services and community organisations offer advice without moralising."]
      },
      sources: ["Agència de Salut Pública de Barcelona", "Stop Sida", "BCN Checkpoint"] },

    /* --- guía de ciudad --------------------------------------------------- */
    { agent: "guide", id: "sitges", weight: 1, strong: ["sitges"], terms: ["sitges", "playa", "platja", "home mort", "cau ferrat", "tren a sitges", "sitges pride"],
      answers: {
        es: ["Plan Sitges con vuelta garantizada: 1) tren de Rodalies desde Passeig de Gràcia o Sants, unos 40 minutos; 2) paseo de Sant Sebastià y casco antiguo para empezar; 3) Museu Maricel y Cau Ferrat si te apetece cultura junto al mar; 4) Home Mort tiene acceso exigente y no cuenta con socorrismo: agua, calzado y hora de vuelta; 5) la agenda comunitaria la lleva Colors Sitges Link."],
        ca: ["Pla Sitges amb tornada garantida: 1) tren de Rodalies des de Passeig de Gràcia o Sants, uns 40 minuts; 2) passeig de Sant Sebastià i centre històric; 3) Museu Maricel i Cau Ferrat; 4) l'Home Mort té accés exigent i no té socorrisme; 5) l'agenda comunitària la porta Colors Sitges Link."],
        en: ["Sitges plan with a guaranteed way back: 1) Rodalies train from Passeig de Gràcia or Sants, about 40 minutes; 2) Sant Sebastià promenade and old town first; 3) Museu Maricel and Cau Ferrat for culture by the sea; 4) Home Mort has a demanding access and no lifeguard: water, shoes and a return time; 5) the community agenda is run by Colors Sitges Link."]
      },
      sources: ["Sitges · guía oficial LGTBIQ+", "Museu Maricel + Cau Ferrat", "Rodalies / Cercanías Renfe", "Colors Sitges Link", "Platja de l'Home Mort"] },

    { agent: "guide", id: "barrio", weight: 1, terms: ["gaixample", "sant antoni", "donde ir", "barrio", "zona gay", "ambiente", "que hacer", "lugar", "neighborhood"],
      answers: {
        es: ["Barcelona no se reduce a una calle: 1) Sant Antoni y el Centre LGTBI son la puerta institucional y comunitaria; 2) el Gaixample es una capa más de la ciudad, no su mapa entero; 3) la agenda oficial municipal y el mapa comunitario BCN LGBT sirven para elegir espacio según ambiente, precio y accesibilidad; 4) verifica apertura y normas en el canal oficial del local antes de ir."],
        ca: ["Barcelona no es redueix a un carrer: 1) Sant Antoni i el Centre LGTBI són la porta institucional i comunitària; 2) el Gaixample és una capa més de la ciutat; 3) l'agenda municipal i el mapa comunitari BCN LGBT ajuden a triar; 4) verifica obertura i normes abans d'anar."],
        en: ["Barcelona is not one street: 1) Sant Antoni and the Centre LGTBI are the institutional and community gateway; 2) the Gaixample is one layer of the city, not the whole map; 3) the municipal agenda and the BCN LGBT community map help you choose by vibe, price and access; 4) check opening and rules on the venue's official channel."]
      },
      sources: ["Barcelona LGTBI · agenda oficial", "Centre LGTBI de Barcelona", "BCN LGBT · mapa comunitario", "Gaixample a pie"] },

    { agent: "guide", id: "gratis", weight: 1, terms: ["gratis", "sin dinero", "no tengo dinero", "barato", "poco presupuesto", "free", "cheap", "económico"],
      answers: {
        es: ["Planes que no cuestan dinero: 1) fondo LGTBI de la Biblioteca Francesca Bonnemaison y de la Sagrada Família; 2) Biblio Digital y eFilm para préstamo legal de cine y libros; 3) agenda municipal LGTBI, exposiciones y CCCB en franjas gratuitas; 4) playas urbanas, Collserola y paseo marítimo; 5) el Estudio Charco de esta página genera música en tu propio dispositivo."],
        ca: ["Plans que no costen diners: 1) fons LGTBI de la Bonnemaison i de la Sagrada Família; 2) Biblio Digital i eFilm per a préstec legal; 3) agenda municipal LGTBI i franges gratuïtes del CCCB; 4) platges urbanes i Collserola; 5) l'Estudi Charco genera música al teu dispositiu."],
        en: ["Plans that cost nothing: 1) the LGTBI collection at Bonnemaison and Sagrada Família libraries; 2) Biblio Digital and eFilm for legal loans; 3) the municipal LGTBI agenda and free CCCB slots; 4) urban beaches and Collserola; 5) the Studio on this page generates music on your device."]
      },
      sources: ["Biblioteca Francesca Bonnemaison", "Biblio Digital + eFilm", "Barcelona LGTBI · agenda oficial", "CCCB · Centre de Cultura Contemporània"] },

    { agent: "guide", id: "noche", weight: 1, terms: ["noche", "fiesta", "bar", "discoteca", "club", "ligar", "salir de noche", "after", "nightlife", "balada"],
      answers: {
        es: ["Salir con plan B: 1) elige el local en la agenda oficial o el mapa comunitario y comprueba si es +18; 2) antes de entrar: precio claro, bebida que no dejes sin vigilancia, batería y persona que sepa dónde estás; 3) acuerda la vuelta antes de salir: metro de fin de semana, bus nocturno, tren con último horario o taxi oficial; 4) consentimiento claro o nada, y si algo no cuadra, pide ayuda al personal."],
        ca: ["Sortir amb pla B: 1) tria el local a l'agenda oficial o al mapa comunitari i comprova si és +18; 2) abans d'entrar: preu clar, beguda vigilada, bateria i algú que sàpiga on ets; 3) acorda la tornada abans de sortir; 4) consentiment clar o res."],
        en: ["Going out with a plan B: 1) pick the venue from the official agenda or community map and check if it is 18+; 2) before entering: clear prices, watch your drink, charge your phone and tell someone where you are; 3) agree the way home before you go out; 4) clear consent or nothing at all."]
      },
      sources: ["BCN LGBT · mapa comunitario", "Barcelona LGTBI · agenda oficial", "TMB · metro y bus", "Rodalies / Cercanías Renfe"] },

    /* --- trabajo ---------------------------------------------------------- */
    { agent: "work", id: "empleo", weight: 1, strong: ["trabajo", "empleo", "curriculum", "feina"], terms: ["trabajo", "empleo", "buscar trabajo", "curriculum", "cv", "entrevista", "job", "arbeit", "trabalho", "feina"],
      answers: {
        es: ["Plan corto de empleo: 1) inscríbete en el SOC (y en Barcelona Activa si vives en la ciudad); 2) CV de una página, claro y honesto, con datos verificables y sin foto si no la piden; 3) apunta a dos sectores y no a veinte ofertas; 4) pregunta siempre por contrato, jornada y salario por escrito; 5) si te discriminan por origen u orientación, puedes asesorarte en CCOO o UGT."],
        ca: ["Pla curt de feina: 1) inscriu-te al SOC (i a Barcelona Activa si vius a la ciutat); 2) CV d'una pàgina; 3) apunta't a dos sectors; 4) pregunta sempre per contracte, jornada i salari per escrit; 5) si et discriminen, assessora't a CCOO o UGT."],
        en: ["Short job plan: 1) register with the SOC (and Barcelona Activa if you live in the city); 2) one-page CV, clear and honest; 3) focus on two sectors, not twenty listings; 4) always ask for contract, hours and salary in writing; 5) if you face discrimination, get advice from CCOO or UGT."]
      },
      sources: ["SOC", "Barcelona Activa", "CCOO Catalunya", "UGT Catalunya"] },

    { agent: "work", id: "derechos", weight: 1, terms: ["no me pagan", "no me paga", "no me han pagado", "me deben", "me debe dinero", "sin contrato", "no tengo contrato", "horas extra", "horas sin pagar", "explotacion", "despedido", "me han despedido", "inspeccion de trabajo", "denunciar a mi jefe", "mi jefe", "nomina", "salario", "salary", "unpaid", "wage theft"],
      answers: {
        es: ["Tus derechos laborales no dependen de tu situación administrativa. 1) Reúne pruebas: horarios, mensajes, transferencias, nombres de compañeros; 2) la Inspección de Trabajo puede actuar de oficio y no sanciona a la persona trabajadora por su situación; 3) en CCOO o UGT tienes asesoría laboral gratuita; 4) si hay amenazas o violencia, 112 y después acompañamiento jurídico."],
        ca: ["Els teus drets laborals no depenen de la teva situació administrativa. 1) Reuneix proves: horaris, missatges, transferències, noms de companys; 2) la Inspecció de Treball pot actuar d'ofici; 3) a CCOO o UGT tens assessoria laboral gratuïta; 4) si hi ha amenaces, 112."],
        en: ["Your labour rights do not depend on your immigration status. 1) Gather evidence: hours, messages, transfers, colleagues' names; 2) the Labour Inspectorate can act on its own initiative; 3) CCOO and UGT offer free labour advice; 4) if there are threats or violence, call 112."]
      },
      sources: ["Inspecció de Treball de Catalunya", "CCOO Catalunya", "UGT Catalunya", "SOC"] },

    { agent: "work", id: "homologacion", weight: 1, terms: ["homolog", "titulo", "diploma", "equivalencia", "estudios", "universidad", "degree"],
      answers: {
        es: ["Homologar un título es un trámite con tiempos largos: 1) comprueba primero en el canal oficial si tu profesión es regulada y qué vía te corresponde (homologación o equivalencia); 2) pide presupuesto y plazos por escrito si contratas gestoría, y compara con hacerlo tú; 3) mientras llega, pregunta por el reconocimiento profesional y por formación puente; 4) guarda copia compulsada de tu título antes de enviar el original."],
        ca: ["Homologar un títol és un tràmit amb temps llargs: 1) comprova al canal oficial si la teva professió és regulada i quina via et correspon; 2) demana pressupost i terminis per escrit si contractes gestoria; 3) pregunta per formació pont; 4) guarda còpia abans d'enviar l'original."],
        en: ["Recognising a degree takes time: 1) check on official channels whether your profession is regulated and which route applies; 2) if you hire an agency, get a written quote and deadline; 3) ask about bridging training; 4) keep a copy of your diploma before sending the original."]
      },
      sources: ["Portal de inmigración · Ministerio de Inclusión", "SOC", "Barcelona Activa"] },

    { agent: "work", id: "catalan", weight: 1, terms: ["catalan", "idioma", "curso de idiomas", "aprender catalan", "language course", "sprache", "lingua"],
      answers: {
        es: ["Aprender catalán cambia el acceso a empleo y trato diario: 1) cursos por niveles y certificados oficiales en el CPNL; 2) Voluntariat per la llengua da diez horas de conversación con una persona voluntaria; 3) las bibliotecas tienen materiales y clubes de lectura; 4) no hace falta ser perfecto para empezar a usarlo."],
        ca: ["Aprendre català canvia l'accés a la feina i al tracte diari: 1) cursos per nivells i certificats oficials al CPNL; 2) Voluntariat per la llengua dona deu hores de conversa; 3) les biblioteques tenen materials i clubs de lectura; 4) no cal ser perfecte per començar."],
        en: ["Learning Catalan changes your access to jobs and daily life: 1) level courses and official certificates at the CPNL; 2) Voluntariat per la llengua gives ten hours of conversation with a volunteer; 3) libraries have materials and reading clubs; 4) you do not need to be perfect to start."]
      },
      sources: ["CPNL · cursos de català", "Voluntariat per la llengua", "Biblio Digital + eFilm"] },

    /* --- bienestar -------------------------------------------------------- */
    { agent: "wellbeing", id: "soledad", weight: 1, terms: ["solo", "soledad", "no conozco a nadie", "amigos", "familia lejos", "nostalgia", "lonely", "alone", "einsam"],
      answers: {
        es: ["Llegar solo a una ciudad es duro y es temporal si construyes red: 1) un club deportivo o cultural (Panteres Grogues) da comunidad sin depender de la noche; 2) el Centre LGTBI tiene grupos y actividades gratuitas; 3) una entidad de tu barrio o tu idioma puede ser el primer contacto humano; 4) el duelo migratorio se lleva mejor contándolo: si te pesa demasiado, busca apoyo psicológico."],
        ca: ["Arribar sol a una ciutat és dur i és temporal si construeixes xarxa: 1) un club esportiu o cultural dona comunitat; 2) el Centre LGTBI té grups i activitats gratuïtes; 3) una entitat del teu barri pot ser el primer contacte humà; 4) el dol migratori es porta millor explicant-lo."],
        en: ["Arriving alone is hard, and it is temporary if you build a network: 1) a sports or cultural club (Panteres Grogues) gives community beyond nightlife; 2) the Centre LGTBI runs free groups and activities; 3) a local organisation can be your first human contact; 4) migration grief is easier when you talk about it."]
      },
      sources: ["Centre LGTBI de Barcelona", "Panteres Grogues", "Casal Lambda", "Voluntariat per la llengua"] },

    { agent: "wellbeing", id: "sueño", weight: 1, terms: ["no duermo", "insomnio", "cansado", "ansiedad por la noche", "sleep", "can't sleep", "schlafen"],
      answers: {
        es: ["Dormir mal multiplica todo lo demás: 1) rutina de bajada de luces y pantallas 45 minutos antes; 2) evita cafeína después de las 16 h y alcohol como somnífero; 3) un paisaje sonoro lento del Estudio Charco puede acompañar la respiración 4-4-4-4; 4) si el insomnio dura semanas o viene con ansiedad intensa, coméntalo en el CAP o con apoyo psicológico."],
        ca: ["Dormir mal multiplica tot el demás: 1) rutina de baixada de llums; 2) evita cafeïna després de les 16 h i l'alcohol com a somnífer; 3) un paisatge sonor lent de l'Estudi Charco pot acompanyar la respiració; 4) si dura setmanes, comenta-ho al CAP."],
        en: ["Poor sleep multiplies everything else: 1) wind down lights and screens 45 minutes earlier; 2) avoid caffeine after 4 pm and alcohol as a sleeping aid; 3) a slow soundscape from the Studio can accompany 4-4-4-4 breathing; 4) if it lasts weeks or comes with intense anxiety, talk to your CAP."]
      },
      sources: ["061 Salut Respon", "Salut Mental Catalunya", "Centre LGTBI de Barcelona"] },

    { agent: "wellbeing", id: "comunidad", weight: 1, terms: ["comunidad", "grupo", "conocer gente", "voluntariado", "community", "gruppo", "gemeinschaft"],
      answers: {
        es: ["Tejido comunitario para engancharte: 1) Casal Lambda tiene grupos, centro de documentación y actividades culturales; 2) el Centre LGTBI publica agenda de grupos y talleres; 3) Colors Sitges Link es la referencia en Sitges; 4) el voluntariado y los clubes deportivos crean lazos más sólidos que una noche suelta."],
        ca: ["Teixit comunitari per enganxar-te: 1) Casal Lambda té grups i activitats; 2) el Centre LGTBI publica agenda de grups i tallers; 3) Colors Sitges Link és la referència a Sitges; 4) el voluntariat i els clubs esportius creen llaços més sòlids."],
        en: ["Community fabric to join: 1) Casal Lambda has groups, a documentation centre and cultural activities; 2) the Centre LGTBI publishes groups and workshops; 3) Colors Sitges Link is the reference in Sitges; 4) volunteering and sports clubs build stronger bonds than a single night out."]
      },
      sources: ["Casal Lambda", "Centre LGTBI de Barcelona", "Colors Sitges Link", "Panteres Grogues"] },

    /* --- cultura ---------------------------------------------------------- */
    { agent: "culture", id: "cine", weight: 1, terms: ["pelicula", "peli", "pelis", "cine", "film", "ver una peli", "documental", "movie", "documentary", "serie", "recomiendame algo"],
      answers: {
        es: ["Cine con acceso legal y mirada crítica: 1) préstamo digital con eFilm y RTVE Play (colección Orgullo); 2) la Filmoteca de Catalunya programa ciclos con entradas baratas; 3) el festival de Sitges concentra cine fantástico; 4) si no sabes por dónde empezar, 'Te estoy amando locamente' y '20.000 especies de abejas' están en catálogos de préstamo."],
        ca: ["Cinema amb accés legal: 1) préstec digital amb eFilm i RTVE Play; 2) la Filmoteca programa cicles amb entrades barates; 3) el festival de Sitges concentra cinema fantàstic; 4) '20.000 espècies d'abelles' és als catàlegs de préstec."],
        en: ["Cinema with legal access and a critical eye: 1) digital loans via eFilm and RTVE Play; 2) the Filmoteca programmes seasons with cheap tickets; 3) Sitges Film Festival concentrates fantastic cinema; 4) '20,000 Species of Bees' is in library catalogues."]
      },
      sources: ["Biblio Digital + eFilm", "RTVE Play · Cine Orgullo", "Filmoteca de Catalunya", "Sitges Film Festival"] },

    { agent: "culture", id: "libros", weight: 1, terms: ["libro", "leer", "novela", "ensayo", "book", "read", "buch", "livro"],
      answers: {
        es: ["Lecturas con acceso legal: 1) fondos LGTBI de la Bonnemaison y de la Sagrada Família, con carné de biblioteca; 2) Biblio Digital para ebook y audiolibro; 3) 'Stone Butch Blues' tiene edición gratuita autorizada por la autora; 4) Camila Sosa Villada y Paul B. Preciado están en los catálogos municipales."],
        ca: ["Lectures amb accés legal: 1) fons LGTBI de la Bonnemaison i la Sagrada Família; 2) Biblio Digital per a ebook i audiollibre; 3) 'Stone Butch Blues' té edició gratuïta autoritzada; 4) Sosa Villada i Preciado són als catàlegs municipals."],
        en: ["Reads with legal access: 1) the LGTBI collections at Bonnemaison and Sagrada Família, with a library card; 2) Biblio Digital for ebooks and audiobooks; 3) 'Stone Butch Blues' has an authorised free edition; 4) Sosa Villada and Preciado are in municipal catalogues."]
      },
      sources: ["Biblioteca Francesca Bonnemaison", "Biblioteca Sagrada Família", "Biblio Digital + eFilm", "Stone Butch Blues · Leslie Feinberg"] },

    { agent: "culture", id: "musica", weight: 1, strong: ["musica", "radio", "podcast"], terms: ["musica", "radio", "podcast", "concierto", "escuchar", "music", "radio station", "musik"],
      answers: {
        es: ["Música y radio, hoy mismo: 1) el Estudio Charco de esta página genera paisajes sonoros en tu dispositivo, sin streaming ni cuentas; 2) Ràdio 4 'Plurals i singulars' tiene archivo de diversidad sexual y de género; 3) Dublab Barcelona emite música experimental y comunitaria; 4) Catalunya Ràdio e iCat son públicas y gratuitas por FM y web."],
        ca: ["Música i ràdio, avui mateix: 1) l'Estudi Charco genera paisatges sonors al teu dispositiu; 2) 'Plurals i singulars' de Ràdio 4 té arxiu de diversitat; 3) Dublab Barcelona emet música comunitària; 4) Catalunya Ràdio i iCat són públiques i gratuïtes."],
        en: ["Music and radio, today: 1) the Studio on this page generates soundscapes on your device; 2) Ràdio 4's 'Plurals i singulars' archives gender and sexual diversity; 3) Dublab Barcelona broadcasts community and experimental music; 4) Catalunya Ràdio and iCat are public and free."]
      },
      sources: ["Plurals i singulars · Ràdio 4", "Charco Studio (aquí mismo)", "Catalunya Ràdio · iCat"] },

    { agent: "culture", id: "deporte", weight: 1, terms: ["deporte", "gimnasio", "correr", "futbol", "nadar", "sport", "running", "volleyball", "esport"],
      answers: {
        es: ["Deporte como red: 1) Panteres Grogues es el club deportivo y cultural LGTBI+ de Barcelona, con actividades para distintos niveles; 2) las playas urbanas y Collserola permiten entrenar gratis; 3) el deporte de equipo es una de las formas más rápidas de crear amistad estable; 4) si vienes de una lesión o de años sin moverte, empieza con sesiones cortas y constancia."],
        ca: ["Esport com a xarxa: 1) Panteres Grogues és el club esportiu i cultural LGTBI+ de Barcelona; 2) les platges urbanes i Collserola permeten entrenar gratis; 3) l'esport d'equip crea amistat estable; 4) comença amb sessions curtes i constància."],
        en: ["Sport as a network: 1) Panteres Grogues is Barcelona's LGBTQ+ sports and cultural club; 2) urban beaches and Collserola let you train for free; 3) team sport builds lasting friendship fast; 4) start with short, consistent sessions."]
      },
      sources: ["Panteres Grogues", "Agència de Salut Pública de Barcelona"] },

    /* --- dinero y vida diaria (legal/guide) ------------------------------- */
    { agent: "legal", id: "vivienda", weight: 1, strong: ["vivienda", "alquiler", "desahucio", "habitacion"], terms: ["vivienda", "alquiler", "habitacion", "desahucio", "me echan de casa", "fianza", "estafa de alquiler", "rent", "housing", "miete"],
      answers: {
        es: ["Sin pagar antes de ver: 1) visita la vivienda o pide videollamada con portal incluido y nunca transfieras a una cuenta extranjera o a nombre de otra persona; 2) exige contrato por escrito con duración, renta, suministros y quien figura; 3) la fianza legal es una mensual en vivienda habitual y dos en amueblada: pide recibo de todo; 4) si hay riesgo de desahucio, las oficinas de vivienda y servicios sociales pueden mediar antes de que llegue el problema."],
        ca: ["Sense pagar abans de veure: 1) visita l'habitatge o fes videotrucada amb portal inclòs; 2) exigeix contracte per escrit; 3) la fiança legal és una mensual (dues si està moblat); 4) si hi ha risc de desnonament, les oficines d'habitatge poden mediar."],
        en: ["Never pay before seeing: 1) visit the flat or ask for a video call including the building entrance; never transfer to a foreign account; 2) insist on a written contract with duration, rent, utilities and names; 3) the legal deposit is one month (two if furnished): always ask for receipts; 4) if eviction is a risk, housing offices and social services can mediate early."]
      },
      sources: ["Vivienda · Ayuntamiento de Barcelona", "Fundació Arrels", "Sitges · serveis municipals", "SAIER"] },

    { agent: "guide", id: "transporte", weight: 1, strong: ["metro", "bus", "tren", "aeropuerto", "bicing", "tmb", "rodalies", "transport"], terms: ["metro", "bus", "tren", "aeropuerto", "como llegar", "bicing", "tmb", "transport", "airport", "zug"],
      answers: {
        es: ["Moverse sin sorpresas: 1) consulta en ATM qué título integrado te conviene antes de comprar (metro, bus, FGC, tranvía y Rodalies); 2) el Aerobús conecta el aeropuerto con el centro y funciona de madrugada; 3) para Sitges usa Rodalies y apunta el último tren de vuelta; 4) revisa ascensores y obras en la web del operador si llevas carro, silla o maletas."],
        ca: ["Moure's sense sorpreses: 1) consulta a ATM quin títol integrat et convé; 2) l'Aerobús connecta l'aeroport amb el centre; 3) per a Sitges, Rodalies i apunta l'últim tren; 4) revisa ascensors i obres al web de l'operador."],
        en: ["Getting around without surprises: 1) check with ATM which integrated ticket suits you before buying; 2) the Aerobús links the airport with the centre and runs overnight; 3) for Sitges use Rodalies and note the last train back; 4) check lifts and works on the operator's site if you carry a pram, wheelchair or luggage."]
      },
      sources: ["ATM · tarifas integradas", "TMB · metro y bus", "Aerobús", "Rodalies / Cercanías Renfe", "Bicing"] }
  ];

  // Índice de recursos por título para resolver citas y por palabra clave para
  // recuperar fichas relacionadas (RAG ligero, sin red).
  const byTitle = new Map(content.resources.map((item) => [item.title, item]));
  const NORMALIZE = (value) => String(value)
    .toLocaleLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokenize = (value) => NORMALIZE(value).split(" ").filter((token) => token.length > 2);
  const STOP = new Set(["para", "como", "donde", "puedo", "quiero", "tengo", "esta", "este", "esto", "sobre", "pero", "porque", "the", "and", "how", "where", "que", "les", "los", "las", "una", "uno", "con", "sin", "del", "mis", "meus", "por"]);
  const keywords = (value) => tokenize(value).filter((token) => !STOP.has(token));

  /* --------------------------------------------------------------- respuesta */

  const normalizeLanguage = (value) => (LANGUAGES.includes(value) ? value : "es");

  const pickText = (map, language) => {
    if (map[language]) return { text: map[language], exact: true };
    return { text: map.es, exact: false };
  };

  const resolveSources = (titles) => titles
    .map((title) => byTitle.get(title))
    .filter(Boolean)
    .slice(0, 4)
    .map((item) => ({ title: item.title, url: item.url, level: item.level, phone: item.phone || null }));

  // Recupera fichas del directorio que comparten vocabulario con la pregunta.
  const relatedResources = (question, limit = 3) => {
    const tokens = keywords(question);
    if (!tokens.length) return [];
    return content.resources
      .map((item) => {
        const haystack = keywords(`${item.title} ${item.summary} ${item.category} ${item.address || ""}`);
        let score = 0;
        tokens.forEach((token) => {
          if (haystack.some((candidate) => sharesPrefix(candidate, token))) score += 2;
        });
        if (item.discreet) score -= 2;
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => ({ title: entry.item.title, url: entry.item.url, level: entry.item.level, phone: entry.item.phone || null }));
  };

  // Coincidencia tolerante: prefijo común desde 4 letras, para que "peli"
  // encuentre "película" y "papel" encuentre "papeles" sin abrir falsos positivos.
  const sharesPrefix = (a, b) => {
    if (a === b) return true;
    const min = 4;
    if (a.length < min || b.length < min) return false;
    return a.startsWith(b) || b.startsWith(a);
  };
  // Una palabra suelta se compara por token (nunca por subcadena: "cap" no debe
  // activarse con "capital"). Una expresión de varias palabras sí puede aparecer
  // dentro del texto.
  const termScore = (normalized, tokens, term) => {
    const normalizedTerm = NORMALIZE(term);
    if (!normalizedTerm) return 0;
    const parts = normalizedTerm.split(" ");
    if (parts.length === 1) {
      return tokens.some((token) => sharesPrefix(token, normalizedTerm)) ? 1.6 : 0;
    }
    if (normalized.includes(normalizedTerm)) return 3;
    return parts.reduce((sum, part) => (tokens.some((token) => sharesPrefix(token, part)) ? sum + 0.6 : sum), 0);
  };

  // Términos "ancla": identifican la intención sin discusión (empadronar, asilo,
  // metro, alquiler...). Pesar más evita que una consulta clara caiga en otra
  // intención solo porque compartía vocabulario genérico.
  const strongScore = (normalized, tokens, term) => {
    const normalizedTerm = NORMALIZE(term);
    if (!normalizedTerm) return 0;
    if (normalizedTerm.includes(" ")) return normalized.includes(normalizedTerm) ? 4 : 0;
    return tokens.some((token) => sharesPrefix(token, normalizedTerm)) ? 4 : 0;
  };

  const scoreIntents = (text) => {
    const normalized = NORMALIZE(text);
    const tokens = keywords(text);
    return INTENTS.map((intent) => {
      const score = intent.terms.reduce((sum, term) => sum + termScore(normalized, tokens, term), 0)
        + (intent.strong || []).reduce((sum, term) => sum + strongScore(normalized, tokens, term), 0);
      return { intent, score };
    }).sort((a, b) => b.score - a.score);
  };

  const composeAnswer = (intent, language, question) => {
    const answerSet = intent.answers[language] || intent.answers.es;
    const exact = Boolean(intent.answers[language]);
    const paragraphs = answerSet.join(" ");
    const citations = resolveSources(intent.sources);
    const related = relatedResources(question).filter((item) => !citations.some((citation) => citation.url === item.url));
    const fallbackNote = language !== "es" && !exact
      ? " Respondo en español para no darte información inexacta en tu idioma; una entidad puede ayudarte a traducirla."
      : "";
    const confidence = exact ? "alta" : "media";
    return {
      kind: "answer",
      text: `${paragraphs}${fallbackNote}`,
      sources: [...citations, ...related].slice(0, 5),
      confidence,
      intent: intent.id,
      agent: intent.agent,
      language,
      exactLanguage: exact
    };
  };

  const answer = (agentId, question, languageHint) => {
    const text = String(question || "").trim();
    if (text.length < 2) {
      return { kind: "empty", text: "", sources: [], confidence: "baja" };
    }
    const language = normalizeLanguage(languageHint);

    // 1. Capa de seguridad: gana siempre, en cualquier idioma.
    const safetyOrder = [
      [CRISIS, "crisis"],
      [MEDICAL_EMERGENCY, "medical"],
      [VIOLENCE, "violence"],
      [PEP_URGENCY, "pep"]
    ];
    for (const [patterns, key] of safetyOrder) {
      if (matchAny(patterns, text)) {
        const route = SAFETY[key];
        const picked = pickText(route.reply, language);
        return {
          kind: route.kind,
          text: picked.text,
          sources: resolveSources(route.sources),
          phone: route.phone,
          secondaryPhone: route.secondaryPhone,
          confidence: "alta",
          intent: key,
          agent: agentId,
          language,
          exactLanguage: picked.exact,
          safety: true
        };
      }
    }

    // 2. Intenciones puntuadas, con preferencia por el agente elegido.
    const ranked = scoreIntents(text);
    const sameAgent = ranked.filter((entry) => entry.intent.agent === agentId);
    const best = [sameAgent[0], ranked[0]].filter(Boolean).sort((a, b) => b.score - a.score)[0];
    const threshold = 1.5;
    if (!best || best.score < threshold) {
      const related = relatedResources(text, 3);
      return {
        kind: "clarify",
        text: related.length
          ? `No tengo una respuesta fiable para eso todavía, y prefiero no inventarla. Puedo orientarte con estas fichas del directorio y, si es un tema legal o sanitario, la respuesta segura está en la fuente oficial o en una entidad. ¿Quieres afinar la pregunta con zona, plazo o tipo de trámite?`
          : `No tengo una respuesta fiable para eso y no voy a improvisarla. Prueba con palabras como papeles, asilo, salud, trabajo, vivienda, Sitges, cultura o música, o consulta el directorio: todas las fichas llevan fuente y fecha.`,
        sources: related,
        confidence: "baja",
        intent: "unknown",
        agent: agentId,
        language
      };
    }
    return composeAnswer(best.intent, language, text);
  };

  /* Resumen sin lenguaje natural, para depuración y evaluación. */
  const classify = (question) => {
    const ranked = scoreIntents(question);
    return {
      top: ranked.slice(0, 3).map(({ intent, score }) => ({ id: intent.id, agent: intent.agent, score: Number(score.toFixed(2)) })),
      safety: {
        crisis: matchAny(CRISIS, question),
        medical: matchAny(MEDICAL_EMERGENCY, question),
        violence: matchAny(VIOLENCE, question),
        pep: matchAny(PEP_URGENCY, question)
      },
      language: detectLanguage(question)
    };
  };

  return Object.freeze({
    version: VERSION,
    languages: LANGUAGES,
    rtl: RTL,
    detectLanguage,
    classify,
    answer,
    intents: INTENTS.map((intent) => ({ id: intent.id, agent: intent.agent })),
    related: relatedResources
  });
})();
