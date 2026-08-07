/* Curated public-interest data. Names and links remain editable without changing UI code. */
window.CHARCO_CONTENT = (() => {
  const es = {
    skip: "Saltar al contenido", quickExit: "Salida rápida", language: "Idioma", theme: "Cambiar tema",
    listen: "Escuchar esta página", stop: "Detener lectura", menu: "Abrir menú", close: "Cerrar",
    eyebrow: "Barcelona + Sitges · guía LGTBIQ+ migrante", heroTitle: "Llegar. Orientarse. Encontrar tribu.",
    heroText: "Información práctica, cultura y apoyo para cruzar fronteras sin dejarte atrás. Sin cuenta, sin rastreo y con fuentes visibles.",
    startNow: "Necesito ayuda ahora", explore: "Explorar la guía", status: "Información revisada el 7 de agosto de 2026",
    emergencyTitle: "Si hay peligro, empieza aquí", emergencyText: "Tu seguridad va primero. Elige el canal adecuado y comparte solo lo necesario.",
    call: "Llamar", open: "Abrir fuente", verify: "Comprueba horario y condiciones antes de ir.",
    routeTitle: "Tu ruta de llegada", routeText: "Pasos cortos para las primeras 72 horas, el primer mes y después.",
    directoryTitle: "Directorio vivo", directoryText: "Servicios, comunidad, salud, cultura, ocio y vida cotidiana. Filtra sin entregar datos personales.",
    all: "Todo", search: "Buscar por nombre, necesidad o barrio", noResults: "No hay resultados con esos filtros.",
    funTitle: "¿Qué hacemos hoy?", funText: "Monta un plan según ánimo, presupuesto y momento. Nada de formularios eternos.",
    buildPlan: "Crear mi plan", anotherPlan: "Dame otro plan", cultureTitle: "Ver, leer, escuchar",
    cultureText: "Selección crítica y acceso legal: bibliotecas, préstamo digital, cine público y voces de la comunidad.",
    radioTitle: "Radio Circuito Charco", radioText: "Señales de cultura y comunidad. Tú decides cuándo suena.",
    radioOn: "Encender señal", radioOff: "Apagar señal", agentsTitle: "Mesa de orientación",
    agentsText: "Personalidades distintas, límites claros. El modo local usa esta guía; la IA externa solo funciona si el proyecto conecta un backend privado.",
    ask: "Escribe una pregunta", send: "Preguntar", newsTitle: "Noticias con memoria",
    newsText: "Las novedades se actualizan desde fuentes comunitarias; el archivo conserva lo publicado y muestra procedencia y fecha.",
    privacyTitle: "Privacidad práctica", privacyText: "La web no pide cuenta, ubicación, identidad ni historial médico. La salida rápida cambia de página, pero no borra el historial del navegador.",
    footer: "Una herramienta comunitaria, no una autoridad. Verifica decisiones legales, sanitarias y de seguridad con profesionales.",
    legal: "Aviso legal y privacidad", install: "Instalar guía", offline: "Disponible sin conexión tras la primera visita",
    translationNotice: "La interfaz crítica está traducida; las fichas extensas conservan el español canónico mientras esperan revisión humana."
  };

  const locale = (language, values) => ({ ...es, language, ...values });
  const messages = {
    es,
    ca: locale("Idioma", {
      quickExit: "Sortida ràpida", theme: "Canvia el tema", listen: "Escolta aquesta pàgina", stop: "Atura la lectura",
      eyebrow: "Barcelona + Sitges · guia LGTBIQ+ migrant", heroTitle: "Arribar. Orientar-se. Trobar tribu.",
      heroText: "Informació pràctica, cultura i suport per creuar fronteres sense deixar-te enrere. Sense compte, sense rastreig i amb fonts visibles.",
      startNow: "Necessito ajuda ara", explore: "Explora la guia", emergencyTitle: "Si hi ha perill, comença aquí",
      emergencyText: "La teva seguretat va primer. Tria el canal adequat i comparteix només el necessari.",
      routeTitle: "La teva ruta d'arribada", directoryTitle: "Directori viu", search: "Cerca per nom, necessitat o barri",
      funTitle: "Què fem avui?", buildPlan: "Crea el meu pla", cultureTitle: "Veure, llegir, escoltar",
      radioTitle: "Ràdio Circuit Charco", radioOn: "Encén el senyal", radioOff: "Apaga el senyal",
      agentsTitle: "Taula d'orientació", ask: "Escriu una pregunta", send: "Pregunta", newsTitle: "Notícies amb memòria",
      privacyTitle: "Privacitat pràctica", legal: "Avís legal i privacitat", translationNotice: "La interfície crítica està traduïda; les fitxes extenses mantenen el castellà canònic fins a la revisió humana."
    }),
    en: locale("Language", {
      quickExit: "Quick exit", theme: "Change theme", listen: "Listen to this page", stop: "Stop reading",
      eyebrow: "Barcelona + Sitges · LGBTQ+ migrant guide", heroTitle: "Arrive. Find your bearings. Find your people.",
      heroText: "Practical information, culture and support for crossing borders without leaving yourself behind. No account, no tracking, visible sources.",
      startNow: "I need help now", explore: "Explore the guide", status: "Information reviewed on 7 August 2026",
      emergencyTitle: "If you are in danger, start here", emergencyText: "Your safety comes first. Choose the right channel and share only what is needed.",
      routeTitle: "Your arrival route", routeText: "Short steps for the first 72 hours, first month and beyond.",
      directoryTitle: "Living directory", directoryText: "Services, community, health, culture, leisure and daily life. Filter without giving personal data.",
      search: "Search by name, need or neighbourhood", noResults: "No results match these filters.",
      funTitle: "What are we doing today?", funText: "Build a plan around your mood, budget and time. No endless forms.",
      buildPlan: "Build my plan", anotherPlan: "Give me another plan", cultureTitle: "Watch, read, listen",
      cultureText: "Critical selection and legal access: libraries, digital loans, public cinema and community voices.",
      radioTitle: "Radio Circuit Charco", radioText: "Culture and community signals. You decide when it plays.",
      radioOn: "Turn signal on", radioOff: "Turn signal off", agentsTitle: "Guidance desk", ask: "Write a question", send: "Ask",
      newsTitle: "News with a memory", privacyTitle: "Practical privacy", legal: "Legal notice and privacy", translationNotice: "Critical navigation is translated; long resource notes retain canonical Spanish pending human review."
    }),
    it: locale("Lingua", {
      quickExit: "Uscita rapida", theme: "Cambia tema", listen: "Ascolta la pagina", stop: "Ferma lettura",
      eyebrow: "Barcellona + Sitges · guida migrante LGBTQ+", heroTitle: "Arrivare. Orientarsi. Trovare la propria comunità.",
      heroText: "Informazioni pratiche, cultura e sostegno per attraversare i confini senza perdere te stessə. Nessun account, nessun tracciamento.",
      startNow: "Mi serve aiuto ora", explore: "Esplora la guida", emergencyTitle: "Se sei in pericolo, inizia qui",
      routeTitle: "Il tuo percorso di arrivo", directoryTitle: "Elenco vivo", search: "Cerca per nome, bisogno o quartiere",
      funTitle: "Che facciamo oggi?", buildPlan: "Crea il mio piano", cultureTitle: "Guardare, leggere, ascoltare",
      radioOn: "Accendi il segnale", radioOff: "Spegni il segnale", agentsTitle: "Tavolo di orientamento",
      ask: "Scrivi una domanda", send: "Chiedi", newsTitle: "Notizie con memoria", privacyTitle: "Privacy pratica", legal: "Note legali e privacy", translationNotice: "L'interfaccia critica è tradotta; le schede estese restano in spagnolo fino alla revisione umana."
    }),
    fr: locale("Langue", {
      quickExit: "Sortie rapide", theme: "Changer le thème", listen: "Écouter la page", stop: "Arrêter la lecture",
      eyebrow: "Barcelone + Sitges · guide migrant LGBTQ+", heroTitle: "Arriver. S'orienter. Trouver sa communauté.",
      heroText: "Informations pratiques, culture et soutien pour franchir les frontières sans s'oublier. Sans compte, sans suivi.",
      startNow: "J'ai besoin d'aide", explore: "Explorer le guide", emergencyTitle: "En cas de danger, commence ici",
      routeTitle: "Ton parcours d'arrivée", directoryTitle: "Annuaire vivant", search: "Chercher par nom, besoin ou quartier",
      funTitle: "On fait quoi aujourd'hui ?", buildPlan: "Créer mon programme", cultureTitle: "Voir, lire, écouter",
      radioOn: "Allumer le signal", radioOff: "Couper le signal", agentsTitle: "Table d'orientation",
      ask: "Écris une question", send: "Demander", newsTitle: "Actualités avec mémoire", privacyTitle: "Vie privée concrète", legal: "Mentions légales et confidentialité", translationNotice: "L'interface critique est traduite ; les fiches longues restent en espagnol avant révision humaine."
    }),
    de: locale("Sprache", {
      quickExit: "Schneller Ausgang", theme: "Design wechseln", listen: "Seite vorlesen", stop: "Vorlesen stoppen",
      eyebrow: "Barcelona + Sitges · LGBTQ+ Migrationsguide", heroTitle: "Ankommen. Orientieren. Menschen finden.",
      heroText: "Praktische Informationen, Kultur und Unterstützung beim Ankommen. Ohne Konto, ohne Tracking, mit sichtbaren Quellen.",
      startNow: "Ich brauche jetzt Hilfe", explore: "Guide entdecken", emergencyTitle: "Bei Gefahr hier beginnen",
      routeTitle: "Dein Ankunftsweg", directoryTitle: "Lebendiges Verzeichnis", search: "Nach Name, Bedarf oder Viertel suchen",
      funTitle: "Was machen wir heute?", buildPlan: "Meinen Plan erstellen", cultureTitle: "Sehen, lesen, hören",
      radioOn: "Signal einschalten", radioOff: "Signal ausschalten", agentsTitle: "Orientierungstisch",
      ask: "Frage schreiben", send: "Fragen", newsTitle: "Nachrichten mit Gedächtnis", privacyTitle: "Praktischer Datenschutz", legal: "Rechtliches und Datenschutz", translationNotice: "Die kritische Oberfläche ist übersetzt; ausführliche Einträge bleiben bis zur menschlichen Prüfung auf Spanisch."
    }),
    pt: locale("Idioma", {
      quickExit: "Saída rápida", theme: "Mudar tema", listen: "Ouvir esta página", stop: "Parar leitura",
      eyebrow: "Barcelona + Sitges · guia migrante LGBTQ+", heroTitle: "Chegar. Orientar-se. Encontrar a sua turma.",
      heroText: "Informação prática, cultura e apoio para atravessar fronteiras sem se deixar para trás. Sem conta, sem rastreamento.",
      startNow: "Preciso de ajuda agora", explore: "Explorar o guia", emergencyTitle: "Se houver perigo, comece aqui",
      routeTitle: "A sua rota de chegada", directoryTitle: "Diretório vivo", search: "Buscar por nome, necessidade ou bairro",
      funTitle: "O que vamos fazer hoje?", buildPlan: "Criar meu plano", cultureTitle: "Ver, ler, ouvir",
      radioOn: "Ligar sinal", radioOff: "Desligar sinal", agentsTitle: "Mesa de orientação",
      ask: "Escreva uma pergunta", send: "Perguntar", newsTitle: "Notícias com memória", privacyTitle: "Privacidade prática", legal: "Aviso legal e privacidade", translationNotice: "A interface crítica está traduzida; as fichas longas ficam em espanhol até revisão humana."
    }),
    zh: locale("语言", {
      quickExit: "快速离开", theme: "切换主题", listen: "朗读本页", stop: "停止朗读",
      eyebrow: "巴塞罗那 + 锡切斯 · LGBTQ+ 移民指南", heroTitle: "抵达。安顿。找到伙伴。",
      heroText: "跨越边界、开始新生活所需的实用信息、文化与支持。无需账户，不跟踪，并标明来源。",
      startNow: "我现在需要帮助", explore: "浏览指南", emergencyTitle: "如有危险，请从这里开始",
      routeTitle: "抵达路线", directoryTitle: "实时资源目录", search: "按名称、需求或街区搜索",
      funTitle: "今天做什么？", buildPlan: "生成计划", cultureTitle: "观看、阅读、收听",
      radioOn: "打开信号", radioOff: "关闭信号", agentsTitle: "咨询台", ask: "写下问题", send: "提问",
      newsTitle: "可追溯的新闻", privacyTitle: "实用隐私", legal: "法律声明与隐私", translationNotice: "关键界面已翻译；详细资源说明在人工审核前保留西班牙语版本。"
    }),
    ur: locale("زبان", {
      quickExit: "فوری اخراج", theme: "تھیم بدلیں", listen: "صفحہ سنیں", stop: "پڑھنا روکیں",
      eyebrow: "بارسلونا + سیتجس · LGBTQ+ مہاجر رہنما", heroTitle: "پہنچیں۔ راستہ پائیں۔ اپنی برادری تلاش کریں۔",
      heroText: "نئی زندگی کے لیے عملی معلومات، ثقافت اور مدد۔ اکاؤنٹ یا نگرانی کے بغیر، واضح ذرائع کے ساتھ۔",
      startNow: "مجھے ابھی مدد چاہیے", explore: "رہنما دیکھیں", emergencyTitle: "خطرے میں یہاں سے شروع کریں",
      routeTitle: "آمد کا راستہ", directoryTitle: "تازہ فہرست", search: "نام، ضرورت یا علاقے سے تلاش کریں",
      funTitle: "آج کیا کریں؟", buildPlan: "میرا منصوبہ بنائیں", cultureTitle: "دیکھیں، پڑھیں، سنیں",
      radioOn: "سگنل چلائیں", radioOff: "سگنل بند کریں", agentsTitle: "رہنمائی میز", ask: "سوال لکھیں", send: "پوچھیں",
      newsTitle: "محفوظ تاریخ کے ساتھ خبریں", privacyTitle: "عملی رازداری", legal: "قانونی اطلاع اور رازداری", translationNotice: "اہم انٹرفیس ترجمہ شدہ ہے؛ تفصیلی معلومات انسانی جائزے تک ہسپانوی میں رہتی ہیں۔"
    }),
    ar: locale("اللغة", {
      quickExit: "خروج سريع", theme: "تغيير المظهر", listen: "استمع إلى الصفحة", stop: "إيقاف القراءة",
      eyebrow: "برشلونة + سيتجيس · دليل مهاجري مجتمع الميم", heroTitle: "صِل. تعرّف إلى طريقك. جد مجتمعك.",
      heroText: "معلومات عملية وثقافة ودعم لبداية جديدة. بلا حساب أو تتبع، مع مصادر واضحة.",
      startNow: "أحتاج المساعدة الآن", explore: "استكشف الدليل", emergencyTitle: "عند الخطر ابدأ هنا",
      routeTitle: "مسار وصولك", directoryTitle: "دليل حي", search: "ابحث بالاسم أو الحاجة أو الحي",
      funTitle: "ماذا نفعل اليوم؟", buildPlan: "أنشئ خطتي", cultureTitle: "شاهد واقرأ واستمع",
      radioOn: "تشغيل الإشارة", radioOff: "إيقاف الإشارة", agentsTitle: "مكتب التوجيه", ask: "اكتب سؤالا", send: "اسأل",
      newsTitle: "أخبار بذاكرة", privacyTitle: "خصوصية عملية", legal: "إشعار قانوني وخصوصية", translationNotice: "تُرجمت الواجهة الأساسية؛ وتبقى التفاصيل المطولة بالإسبانية إلى حين المراجعة البشرية."
    }),
    fi: locale("Kieli", {
      quickExit: "Pikapoistuminen", theme: "Vaihda teemaa", listen: "Kuuntele sivu", stop: "Lopeta lukeminen",
      eyebrow: "Barcelona + Sitges · LGBTQ+ muuttajan opas", heroTitle: "Saavu. Suunnista. Löydä omat ihmisesi.",
      heroText: "Käytännön tietoa, kulttuuria ja tukea uuteen alkuun. Ei tiliä, ei seurantaa, lähteet näkyvissä.",
      startNow: "Tarvitsen apua nyt", explore: "Tutustu oppaaseen", emergencyTitle: "Aloita tästä vaaratilanteessa",
      routeTitle: "Saapumisreittisi", directoryTitle: "Elävä hakemisto", search: "Hae nimellä, tarpeella tai alueella",
      funTitle: "Mitä tänään tehtäisiin?", buildPlan: "Luo suunnitelmani", cultureTitle: "Katso, lue, kuuntele",
      radioOn: "Kytke signaali", radioOff: "Sammuta signaali", agentsTitle: "Neuvontapöytä", ask: "Kirjoita kysymys", send: "Kysy",
      newsTitle: "Muistava uutisvirta", privacyTitle: "Käytännön yksityisyys", legal: "Lakiteksti ja tietosuoja", translationNotice: "Kriittinen käyttöliittymä on käännetty; pitkät kuvaukset säilyvät espanjaksi ihmistarkistukseen asti."
    })
  };

  const emergencies = [
    { title: "Emergencias", detail: "Peligro inmediato, agresión o urgencia vital.", phone: "112", label: "112", source: "https://112.gencat.cat/ca/el-112/" },
    { title: "Salut Respon", detail: "Orientación sanitaria 24 horas; emergencia médica: 112.", phone: "061", label: "061", source: "https://sem.gencat.cat/ca/061-salut-respon/" },
    { title: "Línea 024", detail: "Atención a conducta suicida. Si el peligro es inmediato, llama al 112.", phone: "024", label: "024", source: "https://www.sanidad.gob.es/linea024/home.htm" },
    { title: "Centro LGTBI Barcelona", detail: "Acogida gratuita, apoyo psicológico, jurídico, extranjería, asilo y atención trans.", phone: "938805111", label: "93 880 51 11", source: "https://ajuntament.barcelona.cat/lgtbi/es/servicios/centro-lgtbi-de-barcelona" },
    { title: "Protección internacional", detail: "Información oficial en español, árabe, inglés y francés.", phone: "910006910", label: "910 006 910", source: "https://www.interior.gob.es/opencms/es/servicios-al-ciudadano/tramites-y-gestiones/oficina-de-asilo-y-refugio/" }
  ];

  const resources = [
    { title: "Centre LGTBI de Barcelona", category: "apoyo", area: "Barcelona", cost: "gratis", age: "todas", summary: "Acogida, asesoría jurídica y psicológica, extranjería, asilo, apoyo trans y actividades.", address: "Comte Borrell, 22", url: "https://ajuntament.barcelona.cat/lgtbi/es/servicios/centro-lgtbi-de-barcelona", verified: "2026-08-07" },
    { title: "ACATHI", category: "migracion", area: "Barcelona", cost: "gratis", age: "adultas", summary: "Entidad creada por y para personas migrantes y refugiadas LGTBIQ+: acompañamiento social, jurídico y comunitario.", url: "https://acathi.org/", verified: "2026-08-07" },
    { title: "SAIER", category: "migracion", area: "Barcelona", cost: "gratis", age: "todas", summary: "Servicio municipal para inmigrantes, emigrantes y refugiados: primera atención, extranjería, asilo, empleo y traducción.", phone: "931532800", url: "https://ajuntament.barcelona.cat/cita/saier", verified: "2026-08-07" },
    { title: "Oficina por la No Discriminación", category: "derechos", area: "Barcelona", cost: "gratis", age: "todas", summary: "Atiende vulneraciones de derechos por origen, orientación, identidad, religión y otros motivos.", address: "Ferran, 32", phone: "934132000", url: "https://ajuntament.barcelona.cat/oficina-no-discriminacio/es", verified: "2026-08-07" },
    { title: "Protección internacional · Ministerio del Interior", category: "migracion", area: "España", cost: "gratis", age: "todas", summary: "Procedimiento oficial de asilo, lugares de presentación, documentación e información por provincia.", phone: "910006910", url: "https://proteccion-asilo.interior.gob.es/es/proteccion-internacional/presentacion-de-la-solicitud/", verified: "2026-08-07" },
    { title: "Punt d'Informació d'Arrelament", category: "migracion", area: "Barcelona", cost: "gratis", age: "adultas", summary: "Consultas municipales sobre arraigo e informes de esfuerzo de integración; pide cita.", address: "Tarragona, 141–147", url: "https://ajuntament.barcelona.cat/centrescivics/es/detall/punt-d-informacio-d-arrelament-direccio-de-serveis-dimmigracio-i-refugi_99400442149.html", verified: "2026-08-07" },
    { title: "BCN Checkpoint", category: "salud", area: "Barcelona", cost: "consultar", age: "adultas", summary: "Centro comunitario de detección de VIH e ITS y salud sexual para hombres gais, bisexuales, otros HSH y mujeres trans.", url: "https://www.bcncheckpoint.com/", verified: "2026-08-07" },
    { title: "Stop Sida", category: "salud", area: "Barcelona", cost: "consultar", age: "adultas", summary: "Salud sexual comunitaria, pruebas, acompañamiento y reducción de daños desde una perspectiva LGTBIQ+.", url: "https://stopsida.org/", verified: "2026-08-07" },
    { title: "Trànsit", category: "salud", area: "Catalunya", cost: "publico", age: "todas", summary: "Atención sanitaria pública para personas trans; consulta acceso, derivación y puntos territoriales.", url: "https://catsalut.gencat.cat/ca/serveis-sanitaris/altres-serveis/model-atencio-salut-persones-trans/", verified: "2026-08-07" },
    { title: "061 Salut Respon", category: "salud", area: "Catalunya", cost: "publico", age: "todas", summary: "Orientación sanitaria 24/7. Para emergencia vital, llama al 112.", phone: "061", url: "https://sem.gencat.cat/ca/061-salut-respon/", verified: "2026-08-07" },
    { title: "Observatori Contra l'LGTBI-fòbia", category: "derechos", area: "Catalunya", cost: "gratis", age: "todas", summary: "Registro y acompañamiento ante incidentes discriminatorios y violencia LGTBI-fóbica.", url: "https://lobservatori.cat/", verified: "2026-08-07" },
    { title: "Casal Lambda", category: "comunidad", area: "Barcelona", cost: "mixto", age: "adultas", summary: "Entidad histórica con actividades culturales, grupos, centro de documentación y espacios de encuentro.", url: "https://lambda.cat/", verified: "2026-08-07" },
    { title: "Colors Sitges Link", category: "comunidad", area: "Sitges", cost: "mixto", age: "adultas", summary: "Asociación LGTBIQ+ de Sitges con actividades, acompañamiento y agenda comunitaria.", url: "https://colorssitgeslink.org/", verified: "2026-08-07" },
    { title: "Oficina Jove de Barcelona", category: "juventud", area: "Barcelona", cost: "gratis", age: "jovenes", summary: "Información juvenil sobre vivienda, empleo, estudios, movilidad y bienestar.", url: "https://www.joves.barcelona/", verified: "2026-08-07" },
    { title: "Aquí t'escoltem", category: "juventud", area: "Barcelona", cost: "gratis", age: "jovenes", summary: "Escucha y acompañamiento emocional confidencial para jóvenes de 12 a 20 años en distintos barrios.", url: "https://www.barcelona.cat/en/what-to-do-in-bcn/parks-and-gardens/servei-aqui-t-escoltem-horta-guinardo-espai-jove-boca-nord-99400593147", verified: "2026-08-07" },
    { title: "Barcelona Activa", category: "trabajo", area: "Barcelona", cost: "gratis", age: "adultas", summary: "Orientación laboral, formación, emprendimiento y recursos para buscar trabajo.", url: "https://www.barcelonactiva.cat/", verified: "2026-08-07" },
    { title: "SOC", category: "trabajo", area: "Catalunya", cost: "publico", age: "adultas", summary: "Servicio público de empleo de Catalunya: inscripción, ofertas, cursos y prestaciones vinculadas.", url: "https://serveiocupacio.gencat.cat/", verified: "2026-08-07" },
    { title: "Barcelona Cuida", category: "cotidiano", area: "Barcelona", cost: "gratis", age: "todas", summary: "Información y orientación sobre cuidados, trabajo del hogar, dependencia y recursos comunitarios.", url: "https://guia.barcelona.cat/es/detall/espai-barcelona-cuida_99400624897.html", verified: "2026-08-07" },
    { title: "Xarxa d'Aliments", category: "cotidiano", area: "Barcelona", cost: "gratis", age: "todas", summary: "Puerta de entrada: servicios sociales municipales. Solicita valoración; no pagues a intermediarios.", url: "https://ajuntament.barcelona.cat/serveissocials/es", verified: "2026-08-07" },
    { title: "Vivienda · Ayuntamiento de Barcelona", category: "vivienda", area: "Barcelona", cost: "publico", age: "adultas", summary: "Oficinas de vivienda, ayudas, bolsa, mediación y prevención de pérdida de vivienda.", url: "https://www.habitatge.barcelona/es", verified: "2026-08-07" },
    { title: "Biblioteca Francesca Bonnemaison", category: "cultura", area: "Barcelona", cost: "gratis", age: "todas", summary: "Fondo especial LGTBI con unas 300 obras; consulta catálogo y disponibilidad.", url: "https://bibliotecavirtual.diba.cat/ca/detall-fons-especial/-/detall/gdD7/FONS_ESPECIAL/346848/124983182", verified: "2026-08-07" },
    { title: "Biblioteca Sagrada Família", category: "cultura", area: "Barcelona", cost: "gratis", age: "todas", summary: "Amplio fondo especializado LGTBI; préstamo sujeto al carné de bibliotecas.", url: "https://bibliotecavirtual.diba.cat/ca/detall-fons-especial/-/detall/gdD7/FONS_ESPECIAL/347043/125317416", verified: "2026-08-07" },
    { title: "Biblio Digital + eFilm", category: "cultura", area: "Catalunya", cost: "gratis", age: "todas", summary: "Préstamo legal de libros, prensa, audiolibros y películas con carné de biblioteca.", url: "https://biblioteques.gencat.cat/ca/biblioteques/catalegs/eBiblio/", verified: "2026-08-07" },
    { title: "RTVE Play · Cine Orgullo", category: "cultura", area: "Online", cost: "gratis", age: "todas", summary: "Colección de películas y documentales LGTBI disponible legalmente; el catálogo puede variar.", url: "https://www.rtve.es/play/colecciones/play-cine-orgullo-lgtbi/530/", verified: "2026-08-07" },
    { title: "Plurals i singulars · Ràdio 4", category: "cultura", area: "Online", cost: "gratis", age: "todas", summary: "Programa de radio pública sobre diversidad sexual, afectiva y de género.", url: "https://www.rtve.es/play/audios/plurals-i-singulars-a-radio-4/", verified: "2026-08-07" },
    { title: "Sitges · guía oficial LGTBIQ+", category: "ocio", area: "Sitges", cost: "mixto", age: "todas", summary: "Agenda, playas, cultura y espacios inclusivos desde la oficina oficial de turismo.", url: "https://www.sitgesanytime.com/en/explore/made-for-you/theme6", verified: "2026-08-07" },
    { title: "Platja de l'Home Mort", category: "ocio", area: "Sitges", cost: "gratis", age: "adultas", summary: "Playa histórica y abierta a la diversidad. Acceso difícil, sin socorrismo; lleva agua y planifica la vuelta.", url: "https://www.sitgesanytime.com/en/what-to-do/places-of-interest/pld7/playa-de-l-home-mort", verified: "2026-08-07" },
    { title: "Museu Maricel + Cau Ferrat", category: "ocio", area: "Sitges", cost: "pago", age: "todas", summary: "Ruta cultural junto al mar. Consulta gratuidades, accesibilidad y reserva oficial.", url: "https://museusdesitges.cat/", verified: "2026-08-07" },
    { title: "Barcelona LGTBI · agenda oficial", category: "ocio", area: "Barcelona", cost: "mixto", age: "todas", summary: "Actividades municipales, exposiciones, grupos y programación del Centre LGTBI.", url: "https://ajuntament.barcelona.cat/lgtbi/es", verified: "2026-08-07" },
    { title: "BCN LGBT · mapa comunitario", category: "noche", area: "Barcelona", cost: "mixto", age: "adultas", summary: "Directorio comunitario amplio de bares, clubes, tiendas y servicios. Verifica apertura y normas en el canal oficial de cada local.", url: "https://bcn.lgbt/", verified: "2026-08-07", discreet: true },
    { title: "Gaixample a pie", category: "noche", area: "Barcelona", cost: "gratis", age: "adultas", summary: "Paseo urbano para descubrir librerías, cafés y vida nocturna inclusiva. Elige espacios según ambiente, accesibilidad y presupuesto.", url: "https://www.barcelonaturisme.com/wv3/es/page/47/lgtbi.html", verified: "2026-08-07", discreet: true },
    { title: "Sitges de noche", category: "noche", area: "Sitges", cost: "mixto", age: "adultas", summary: "Calles del Pecado y Bonaire concentran locales. Algunos son solo para adultos; revisa acceso, consentimiento, precios y transporte de vuelta.", url: "https://www.sitgesanytime.com/en/explore/made-for-you/theme6", verified: "2026-08-07", discreet: true }
  ];

  const routes = [
    { time: "0–2 h", title: "Peligro o urgencia", text: "112 para peligro inmediato. 061 para orientación sanitaria. Busca un lugar con gente y una persona de confianza." },
    { time: "Hoy", title: "Techo, comida y contacto", text: "Servicios Sociales o SAIER pueden valorar urgencias. Guarda documentos en una copia segura y no pagues por una cita pública." },
    { time: "72 h", title: "Salud y derechos", text: "Solicita CAP, empadronamiento y orientación jurídica. Si hubo violencia o discriminación, registra fecha, lugar, testigos y pruebas sin ponerte en riesgo." },
    { time: "30 días", title: "Red, idioma y trabajo", text: "Combina un recurso institucional, una entidad comunitaria y una actividad social. La red humana reduce errores y aislamiento." },
    { time: "Después", title: "Proyecto propio", text: "Revisa formación, empleo, vivienda y bienestar. Tu plan puede cambiar; pedir apoyo temprano no te quita autonomía." }
  ];

  const culture = [
    { type: "Película", title: "Te estoy amando locamente", note: "Memoria del movimiento homosexual andaluz; útil para hablar de activismo, familia y transición democrática.", access: "Buscar en eFilm o plataforma legal", url: "https://www.justwatch.com/es/pelicula/te-estoy-amando-locamente" },
    { type: "Película", title: "20.000 especies de abejas", note: "Infancia trans, familia y lenguaje. Conviene verla evitando convertir una experiencia en modelo universal.", access: "Buscar en eFilm", url: "https://biblioteques.gencat.cat/ca/biblioteques/catalegs/eBiblio/" },
    { type: "Película", title: "Carmen y Lola", note: "Amor entre dos jóvenes gitanas; abre debate sobre mirada autoral, representación y comunidad.", access: "Localizador legal", url: "https://www.justwatch.com/es/pelicula/carmen-y-lola" },
    { type: "Documental", title: "Sedimentos", note: "Seis mujeres trans conversan desde edades y trayectorias distintas; valiosa por sus contradicciones y afectos.", access: "Buscar en eFilm", url: "https://biblioteques.gencat.cat/ca/biblioteques/catalegs/eBiblio/" },
    { type: "Libro", title: "El viaje inútil · Camila Sosa Villada", note: "Escritura, clase, identidad y supervivencia; breve, intensa y nada paternalista.", access: "Catálogo de bibliotecas", url: "https://aladi.diba.cat/" },
    { type: "Libro", title: "Las malas · Camila Sosa Villada", note: "Fábula feroz sobre familia elegida y violencia estructural. Contiene escenas duras.", access: "Catálogo de bibliotecas", url: "https://aladi.diba.cat/" },
    { type: "Libro", title: "Stone Butch Blues · Leslie Feinberg", note: "Clásico sobre clase obrera, género y comunidad. Existe edición gratuita autorizada por la autora en inglés.", access: "Descarga autorizada", url: "https://www.lesliefeinberg.net/" },
    { type: "Ensayo", title: "Un apartamento en Urano · Paul B. Preciado", note: "Crónicas sobre fronteras, cuerpo y ciudadanía; estimulante, discutible y útil para pensar migración.", access: "Catálogo de bibliotecas", url: "https://aladi.diba.cat/" },
    { type: "Radio", title: "Plurals i singulars", note: "Archivo de radio pública catalana centrado en diversidad sexual y de género.", access: "RTVE Play", url: "https://www.rtve.es/play/audios/plurals-i-singulars-a-radio-4/" }
  ];

  const agents = [
    { id: "legal", name: "Alex", role: "Orientación jurídica", tone: "preciso y prudente", scope: "Ordena preguntas sobre extranjería, asilo, discriminación y documentación; nunca sustituye a un abogado.", color: "coral" },
    { id: "health", name: "Nora", role: "Navegación sanitaria", tone: "calma y sin juicios", scope: "Ayuda a localizar CAP, salud sexual, apoyo trans y urgencias; no diagnostica ni receta.", color: "mint" },
    { id: "guide", name: "Rai", role: "Guía Barcelona + Sitges", tone: "cómplice y callejero", scope: "Propone rutas por presupuesto, energía, accesibilidad y horario con enlaces verificables.", color: "yellow" },
    { id: "work", name: "Mika", role: "Trabajo y formación", tone: "directo y práctico", scope: "Ayuda a preparar siguientes pasos de empleo, homologación y aprendizaje; no promete resultados.", color: "blue" },
    { id: "wellbeing", name: "Sol", role: "Bienestar y red", tone: "cálido y respetuoso", scope: "Acompaña a organizar apoyo y autocuidado. Ante riesgo, prioriza 112, 061 o 024.", color: "pink" },
    { id: "culture", name: "Léo", role: "Radar cultural", tone: "curioso y un poco canalla", scope: "Recomienda libros, cine, radio, museos y planes legales sin convertir la cultura queer en una sola estética.", color: "lime" }
  ];

  const planItems = [
    { mood: "tranqui", budget: "gratis", time: "dia", area: "Barcelona", title: "Sant Antoni sin prisa", steps: ["Centre LGTBI y su agenda", "Paseo por el mercado y el barrio", "Fondo LGTBI de la Bonnemaison"] },
    { mood: "cultura", budget: "bajo", time: "dia", area: "Barcelona", title: "Archivo, café y mar", steps: ["Fondo LGTBI de Sagrada Família", "Exposición municipal gratuita", "Atardecer en la Barceloneta"] },
    { mood: "gente", budget: "bajo", time: "noche", area: "Barcelona", title: "Gaixample con plan B", steps: ["Revisar agenda del Centre LGTBI", "Elegir un café o bar con precios visibles", "Guardar ruta nocturna de vuelta"] },
    { mood: "fiesta", budget: "medio", time: "noche", area: "Barcelona", title: "Noche sin improvisar seguridad", steps: ["Cena temprana compartida", "Local del directorio BCN LGBT", "Vuelta acordada y batería suficiente"] },
    { mood: "mar", budget: "gratis", time: "dia", area: "Sitges", title: "Sitges de postal y conversación", steps: ["Paseo por Sant Sebastià", "Cau Ferrat por fuera o con entrada", "Agenda de Colors Sitges Link"] },
    { mood: "aventura", budget: "bajo", time: "dia", area: "Sitges", title: "Costa con cabeza", steps: ["Tren temprano", "Ruta oficial y agua", "Playa accesible; Home Mort solo con calzado y plan de regreso"] },
    { mood: "cultura", budget: "gratis", time: "casa", area: "Online", title: "Salón queer legal", steps: ["Elegir una película de RTVE Play", "Reservar un libro en Biblio Digital", "Cerrar con un episodio de Ràdio 4"] },
    { mood: "tranqui", budget: "gratis", time: "casa", area: "Online", title: "Bajar revoluciones", steps: ["Silenciar notificaciones 30 minutos", "Explorar una biblioteca digital", "Escribir a una entidad para la actividad de mañana"] }
  ];

  return Object.freeze({ messages, emergencies, resources, routes, culture, agents, planItems });
})();
