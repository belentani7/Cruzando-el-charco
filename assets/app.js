(() => {
  "use strict";

  const content = window.CHARCO_CONTENT;
  const config = window.CHARCO_CONFIG || {};
  if (!content) return;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const safeUrl = (value) => {
    try {
      const url = new URL(value, window.location.href);
      return ["http:", "https:", "tel:"].includes(url.protocol) ? url.href : "#";
    } catch {
      return "#";
    }
  };

  let language = localStorage.getItem("charco-language") || config.defaultLanguage || "es";
  let currentCategory = "all";
  let currentAgent = content.agents[0];
  let audioContext = null;
  let radioNodes = [];
  let remoteConsent = false;
  let animationContext = null;

  const t = (key) => (content.messages[language] || content.messages.es)[key] || content.messages.es[key] || key;

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => { toast.hidden = true; }, 4200);
  }

  function applyLanguage(nextLanguage) {
    if (!content.messages[nextLanguage]) return;
    language = nextLanguage;
    localStorage.setItem("charco-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = ["ar", "ur"].includes(language) ? "rtl" : "ltr";
    $$('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
    $$('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
    $("#language-select").value = language;
    renderEmergencies();
    renderDirectory();
    if (language !== "es") showToast(t("translationNotice"));
  }

  function renderEmergencies() {
    const grid = $("#emergency-grid");
    grid.replaceChildren();
    content.emergencies.forEach((item) => {
      const card = el("article", "emergency-card reveal");
      card.append(el("h3", "", item.title), el("p", "", item.detail));
      const phone = el("a", "phone", item.label);
      phone.href = `tel:${item.phone}`;
      phone.setAttribute("aria-label", `${t("call")} ${item.title}: ${item.label}`);
      const source = el("a", "source-link", t("open"));
      source.href = safeUrl(item.source);
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      card.append(phone, source);
      grid.append(card);
    });
  }

  function renderRoutes() {
    const list = $("#route-list");
    list.replaceChildren();
    content.routes.forEach((item) => {
      const row = el("li", "route-step reveal");
      const time = el("time", "", item.time);
      const title = el("h3", "", item.title);
      const text = el("p", "", item.text);
      row.append(time, title, text);
      list.append(row);
    });
  }

  const categoryLabels = {
    all: "Todo", apoyo: "Apoyo", migracion: "Papeles", derechos: "Derechos", salud: "Salud",
    comunidad: "Comunidad", juventud: "Juventud", trabajo: "Trabajo", cotidiano: "Vida diaria",
    vivienda: "Vivienda", cultura: "Cultura", ocio: "Ocio", noche: "+18 discreto"
  };

  function setupCategoryFilters() {
    const group = $("#category-filters");
    Object.entries(categoryLabels).forEach(([value, label]) => {
      const button = el("button", "filter-chip", value === "all" ? t("all") : label);
      button.type = "button";
      button.dataset.category = value;
      button.setAttribute("aria-pressed", String(value === "all"));
      button.addEventListener("click", () => {
        currentCategory = value;
        $$(".filter-chip", group).forEach((chip) => chip.setAttribute("aria-pressed", String(chip === button)));
        renderDirectory();
      });
      group.append(button);
    });
  }

  function renderDirectory() {
    const search = $("#directory-search").value.trim().toLocaleLowerCase(language);
    const area = $("#area-filter").value;
    const cost = $("#cost-filter").value;
    const showAdult = $("#adult-filter").checked;
    const filtered = content.resources.filter((item) => {
      const haystack = `${item.title} ${item.summary} ${item.area} ${item.category} ${item.address || ""}`.toLocaleLowerCase(language);
      return (currentCategory === "all" || item.category === currentCategory)
        && (area === "all" || item.area === area)
        && (cost === "all" || item.cost === cost)
        && (!item.discreet || showAdult)
        && (!search || haystack.includes(search));
    });

    const grid = $("#resource-grid");
    grid.replaceChildren();
    filtered.forEach((item) => {
      const card = el("article", "resource-card");
      const head = el("div", "resource-card-head");
      head.append(el("span", "verified", `REV · ${item.verified}`), el("span", "verified", item.area));
      const title = el("h3", "", item.title);
      const summary = el("p", "", item.summary);
      const meta = el("div", "resource-meta");
      [categoryLabels[item.category] || item.category, item.cost, item.age].forEach((value) => meta.append(el("span", "", value)));
      card.append(head, title, summary, meta);
      if (item.address) card.append(el("p", "resource-address", `⌖ ${item.address}`));
      const actions = el("div", "resource-actions");
      const source = el("a", "", t("open"));
      source.href = safeUrl(item.url);
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      actions.append(source);
      if (item.phone) {
        const phone = el("a", "", `${t("call")} · ${item.phone}`);
        phone.href = `tel:${item.phone}`;
        actions.append(phone);
      }
      card.append(actions);
      grid.append(card);
    });
    $("#result-count").textContent = `${filtered.length} / ${content.resources.length} recursos · +18 ${showAdult ? "visible" : "oculto"}`;
    $("#empty-state").hidden = filtered.length !== 0;
  }

  function renderCulture() {
    const list = $("#culture-list");
    list.replaceChildren();
    content.culture.forEach((item) => {
      const card = el("article", "culture-card reveal");
      const type = el("span", "type", item.type);
      const title = el("h3", "", item.title);
      const note = el("p", "", item.note);
      const link = el("a", "", item.access);
      link.href = safeUrl(item.url);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      card.append(type, title, note, link);
      list.append(card);
    });
  }

  function setupPlanMachine() {
    $("#plan-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget));
      const scored = content.planItems.map((plan) => ({
        plan,
        score: Number(plan.mood === values.mood) * 4 + Number(plan.budget === values.budget) * 2
          + Number(plan.time === values.time) * 3 + Number(plan.area === values.area) * 3
      })).sort((a, b) => b.score - a.score);
      const topScore = scored[0].score;
      const candidates = scored.filter((item) => item.score === topScore);
      const chosen = candidates[Math.floor(Math.random() * candidates.length)].plan;
      const output = $("#plan-output");
      output.replaceChildren();
      output.append(el("span", "plan-stamp", `PLAN / ${String(Math.floor(Math.random() * 90) + 10)}`), el("h3", "", chosen.title));
      const list = el("ol");
      chosen.steps.forEach((step) => list.append(el("li", "", step)));
      output.append(list, el("p", "", "Comprueba horarios, accesibilidad, precio y transporte antes de salir."));
    });
  }

  function initials(name) { return name.slice(0, 2).toLocaleUpperCase(); }

  function renderAgents() {
    const tabs = $("#agent-tabs");
    tabs.replaceChildren();
    content.agents.forEach((agent, index) => {
      const button = el("button", "agent-tab");
      button.type = "button";
      button.role = "tab";
      button.id = `agent-tab-${agent.id}`;
      button.setAttribute("aria-selected", String(index === 0));
      const avatar = el("span", "agent-avatar", initials(agent.name));
      const copy = el("span");
      copy.append(el("strong", "", agent.name), el("small", "", agent.role));
      button.append(avatar, copy);
      button.addEventListener("click", () => selectAgent(agent, button));
      tabs.append(button);
    });
    selectAgent(content.agents[0], $(".agent-tab"));
  }

  function selectAgent(agent, tab) {
    currentAgent = agent;
    $$(".agent-tab").forEach((button) => button.setAttribute("aria-selected", String(button === tab)));
    const intro = $("#agent-intro");
    intro.replaceChildren();
    const avatar = el("span", "agent-avatar", initials(agent.name));
    const copy = el("div");
    copy.append(el("h3", "", `${agent.name} · ${agent.role}`), el("p", "", `${agent.scope} Tono: ${agent.tone}.`));
    intro.append(avatar, copy);
    const log = $("#chat-log");
    log.replaceChildren();
    addChatMessage("agent", agentOpening(agent));
  }

  function agentOpening(agent) {
    const openings = {
      legal: "Te ayudo a ordenar el caso y localizar la fuente competente. Dime el trámite, la provincia y si existe una urgencia; omite datos personales.",
      health: "Cuéntame qué tipo de atención buscas y si es urgente. Si hay peligro vital, llama al 112; para orientación sanitaria en Catalunya, 061.",
      guide: "Dime zona, presupuesto, horario y energía. Te monto una ruta sin convertir Barcelona en un folleto de despedida de soltero.",
      work: "Dime qué buscas: primer empleo, cambio, formación, homologación o derechos laborales. Lo convertimos en próximos pasos.",
      wellbeing: "Podemos ordenar lo que pesa y encontrar apoyo humano. Si existe riesgo de hacerte daño, llama al 024 o 112 ahora.",
      culture: "Dime el mood: cine, libro, museo, radio, mar o noche. Te propongo algo con acceso legal y un motivo para elegirlo."
    };
    return openings[agent.id];
  }

  function addChatMessage(kind, text) {
    const log = $("#chat-log");
    const message = el("div", `chat-message ${kind}`, text);
    log.append(message);
    log.scrollTop = log.scrollHeight;
  }

  function localAgentReply(agent, question) {
    const q = question.toLocaleLowerCase("es");
    if (/suicid|matarme|hacerme daño|no quiero vivir/.test(q)) return "Si existe riesgo inmediato, llama al 112. También puedes llamar al 024. No te quedes a solas: busca una persona o espacio seguro ahora. Esta conversación no puede sustituir ayuda de emergencia.";
    if (/agresi|peligro|violencia|amenaz/.test(q)) return "Prioridad: aléjate del peligro y llama al 112. Si puedes hacerlo sin riesgo, anota hora, lugar, testigos y conserva pruebas. El Centre LGTBI y la Oficina por la No Discriminación pueden orientar después.";
    if (/asilo|refug|papel|arraigo|nie|empadron/.test(q)) return "Ruta prudente: 1) consulta la página oficial de Protección Internacional o SAIER; 2) reúne documentos y una cronología; 3) pide orientación jurídica gratuita; 4) no pagues a intermediarios por citas públicas. El teléfono oficial de Protección Internacional es 910 006 910.";
    if (/prep|pep|vih|its|sexo|prueba/.test(q)) return "Para salud sexual comunitaria consulta BCN Checkpoint o Stop Sida. La PEP es una urgencia dependiente del tiempo: contacta 061 o un servicio de urgencias cuanto antes. Para peligro vital, 112. No puedo diagnosticar.";
    if (/trans|hormon|genero|género/.test(q)) return "Puedes empezar por Trànsit o por el servicio trans y no binario del Centre LGTBI. Te ayudarán a conocer el circuito público y tus opciones; evita comprar medicación sin seguimiento sanitario.";
    if (/trabaj|empleo|curriculum|currículum|homolog/.test(q)) return "Plan corto: alta o consulta en SOC, sesión de orientación en Barcelona Activa y, si necesitas extranjería u homologación, SAIER. Lleva CV de una página y documentos en copia, no originales salvo solicitud expresa.";
    if (/casa|habitaci|alquiler|techo|desahuc/.test(q)) return "Para urgencia de alojamiento, contacta Servicios Sociales o SAIER. Para alquiler o riesgo de perder vivienda, usa las Oficinas de Vivienda. No envíes dinero antes de verificar identidad, contrato y vivienda.";
    if (/sitges|playa|platja|mar/.test(q)) return "Ruta fácil: tren, paseo de Sant Sebastià, Cau Ferrat/Maricel y agenda de Colors Sitges Link. Home Mort tiene acceso difícil y no cuenta con socorrismo: agua, calzado, luz y regreso planificado.";
    if (/fiesta|bar|club|noche|ligar/.test(q)) return "Mira la agenda oficial y el mapa comunitario BCN LGBT. Antes de entrar: precio claro, vuelta guardada, batería y una persona que sepa dónde estás. Algunos espacios son +18; consentimiento claro, siempre.";
    if (/pel[ií]cula|cine|libro|leer|radio|podcast/.test(q)) return "Para acceso legal: Biblio Digital/eFilm, los fondos LGTBI de Bonnemaison y Sagrada Família, RTVE Play y Plurals i singulars. Cuéntame un género y te afino la selección.";
    const agentFallback = {
      legal: "Necesito tres datos no identificativos: tema del trámite, provincia y fecha límite. Con eso te indico fuente oficial y preguntas para un profesional.",
      health: "Dime si es urgente, qué tipo de servicio buscas y en qué zona estás. No incluyas historia clínica ni datos identificativos.",
      guide: "Pásame zona, presupuesto, día/noche y energía: tranqui, cultura, mar, gente o fiesta.",
      work: "Dime tu objetivo laboral, experiencia aproximada y si necesitas formación u homologación.",
      wellbeing: "¿Necesitas escucha, apoyo comunitario o un recurso profesional? Si hay riesgo inmediato, 112; crisis suicida, 024.",
      culture: "Dime formato, idioma y mood. Te propongo tres opciones y cómo acceder legalmente."
    };
    return agentFallback[agent.id];
  }

  async function remoteAgentReply(agent, question) {
    const endpoint = String(config.agentApiUrl || "").trim();
    if (!endpoint) return null;
    if (!remoteConsent) {
      remoteConsent = window.confirm("Este modo enviará tu pregunta a un proveedor externo mediante el servidor del proyecto. No incluyas datos personales. ¿Continuar esta sesión?");
      if (!remoteConsent) return null;
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ agent: agent.id, message: question, language })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return typeof data.reply === "string" ? data.reply.slice(0, 4000) : null;
  }

  function setupAgentForm() {
    $("#agent-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = $("#agent-question");
      const question = input.value.trim();
      if (!question) return;
      input.value = "";
      addChatMessage("user", question);
      let reply = null;
      try { reply = await remoteAgentReply(currentAgent, question); }
      catch { showToast("La IA externa no respondió. Continúo con el modo local de la guía."); }
      addChatMessage("agent", reply || localAgentReply(currentAgent, question));
    });
  }

  function stripMarkup(value) {
    const parser = new DOMParser();
    return (parser.parseFromString(String(value), "text/html").body.textContent || "").trim();
  }

  async function loadNews() {
    const grid = $("#news-grid");
    const status = $("#news-status");
    try {
      const response = await fetch(`data/news.json?v=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items.slice(0, config.newsDisplayLimit || 18) : [];
      grid.replaceChildren();
      items.forEach((item) => {
        const card = el("article", "news-card");
        const source = el("div", "news-source");
        source.append(el("span", "", String(item.source || "Fuente")), el("time", "", String(item.date || "Sin fecha")));
        const title = el("h3", "", stripMarkup(item.title || "Sin título"));
        const description = el("p", "", stripMarkup(item.description || "").slice(0, 220));
        const link = el("a", "", "Leer en la fuente");
        link.href = safeUrl(item.url);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.append(source, title, description, link);
        grid.append(card);
      });
      status.textContent = `${data.total || items.length} piezas conservadas · actualización ${data.updated || "sin fecha"}`;
    } catch {
      grid.replaceChildren(el("p", "", "El archivo no está disponible ahora. Usa el directorio de fuentes y vuelve a intentarlo."));
      status.textContent = "Archivo temporalmente no disponible";
    }
  }

  function setupTheme() {
    const saved = localStorage.getItem("charco-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day";
    const theme = saved || preferred;
    document.documentElement.dataset.theme = theme;
    $("#theme-toggle").setAttribute("aria-pressed", String(theme === "night"));
    $("#theme-toggle").addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "night" ? "day" : "night";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("charco-theme", next);
      $("#theme-toggle").setAttribute("aria-pressed", String(next === "night"));
      document.querySelector('meta[name="theme-color"]').content = next === "night" ? "#071a23" : "#082b3a";
    });
  }

  function setupSpeech() {
    const button = $("#listen-button");
    if (!("speechSynthesis" in window)) {
      button.hidden = true;
      return;
    }
    button.addEventListener("click", () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        button.setAttribute("aria-pressed", "false");
        button.querySelector("span:last-child").textContent = t("listen");
        return;
      }
      const readable = $$('main h1, main h2, main h3, main p').map((node) => node.textContent.trim()).filter(Boolean).join(". ").slice(0, 12000);
      const utterance = new SpeechSynthesisUtterance(readable);
      utterance.lang = language;
      utterance.rate = .96;
      utterance.onend = () => {
        button.setAttribute("aria-pressed", "false");
        button.querySelector("span:last-child").textContent = t("listen");
      };
      button.setAttribute("aria-pressed", "true");
      button.querySelector("span:last-child").textContent = t("stop");
      speechSynthesis.speak(utterance);
    });
  }

  function setupRadio() {
    const button = $("#radio-toggle");
    const display = $("#radio-display strong");
    const led = $("#radio-led");
    const volume = $("#radio-volume");
    const stop = () => {
      radioNodes.forEach((node) => { try { node.stop?.(); node.disconnect?.(); } catch {} });
      radioNodes = [];
      audioContext?.close();
      audioContext = null;
      button.setAttribute("aria-pressed", "false");
      button.textContent = t("radioOn");
      display.textContent = "SILENCIO ACTIVO";
      led.classList.remove("on");
    };
    button.addEventListener("click", () => {
      if (audioContext) { stop(); return; }
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) { showToast("Este navegador no permite la señal sonora."); return; }
      audioContext = new AudioContext();
      const master = audioContext.createGain();
      master.gain.value = Number(volume.value) / 100 * .09;
      master.connect(audioContext.destination);
      [110, 164.81, 220].forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = index === 1 ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        gain.gain.value = index === 0 ? .55 : .18;
        oscillator.connect(gain).connect(master);
        oscillator.start();
        radioNodes.push(oscillator, gain);
      });
      radioNodes.push(master);
      volume.oninput = () => { master.gain.value = Number(volume.value) / 100 * .09; };
      button.setAttribute("aria-pressed", "true");
      button.textContent = t("radioOff");
      display.textContent = "SEÑAL AMBIENTE · CH-11";
      led.classList.add("on");
    });
    window.addEventListener("pagehide", stop);
  }

  function setupNavigation() {
    const toggle = $("#menu-toggle");
    const nav = $("#site-nav");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach((link) => link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }));
    $("#quick-exit").addEventListener("click", () => window.location.replace("https://www.google.com/"));
  }

  function setupAnimations() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.gsap) return;
    const plugins = [window.ScrollTrigger, window.CustomEase].filter(Boolean);
    window.gsap.registerPlugin(...plugins);
    if (window.CustomEase) window.CustomEase.create("charcoEase", "M0,0 C0.16,1 0.3,1 1,1");
    let lenis = null;
    if (window.Lenis) {
      lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, lerp: .12 });
      lenis.on("scroll", () => window.ScrollTrigger?.update());
      window.gsap.ticker.add((time) => lenis.raf(time * 1000));
      window.gsap.ticker.lagSmoothing(0);
    }
    animationContext = window.gsap.context(() => {
      window.gsap.from(".hero-copy > *", { opacity: 0, y: 32, duration: .8, stagger: .08, ease: "charcoEase" });
      window.gsap.from(".signal-console", { opacity: 0, x: 50, rotate: 1.5, duration: 1, ease: "charcoEase" });
      window.gsap.to(".map-route", { strokeDashoffset: -68, duration: 3.5, repeat: -1, ease: "none" });
      $$(".reveal").forEach((node) => {
        if (node.closest(".hero")) return;
        window.gsap.from(node, { opacity: 0, y: 38, duration: .75, ease: "charcoEase", scrollTrigger: { trigger: node, start: "top 88%", once: true } });
      });
      $$(".city-card img").forEach((image) => {
        window.gsap.fromTo(image, { yPercent: -4, scale: 1.06 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: image.parentElement, start: "top bottom", end: "bottom top", scrub: .7 } });
      });
    });
    window.addEventListener("pagehide", () => { animationContext?.revert(); lenis?.destroy(); }, { once: true });
  }

  function updateClock() {
    $("#console-clock").textContent = `BCN ${new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit" }).format(new Date())}`;
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  function init() {
    renderEmergencies();
    renderRoutes();
    setupCategoryFilters();
    renderDirectory();
    renderCulture();
    renderAgents();
    setupPlanMachine();
    setupAgentForm();
    setupTheme();
    setupSpeech();
    setupRadio();
    setupNavigation();
    applyLanguage(language);
    $("#language-select").addEventListener("change", (event) => applyLanguage(event.target.value));
    ["#directory-search", "#area-filter", "#cost-filter", "#adult-filter"].forEach((selector) => $(selector).addEventListener("input", renderDirectory));
    $("#news-refresh").addEventListener("click", loadNews);
    loadNews();
    updateClock();
    window.setInterval(updateClock, 30000);
    setupAnimations();
    registerServiceWorker();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
