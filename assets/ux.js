/* Capa de experiencia: buscador rápido, modo discreto, plan privado,
 * ampliación del directorio, glosario, transporte y puente con el motor IA.
 *
 * Regla de oro respetada: nada de esto es necesario para que la guía funcione.
 * Si este archivo no cargara, index.html, app.js y content.js siguen mostrando
 * urgencias, directorio, planes, cultura, agentes locales y noticias.
 */
(() => {
  "use strict";

  const content = window.CHARCO_CONTENT;
  const config = window.CHARCO_CONFIG || {};
  if (!content) return;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  /* ------------------------------------------------------------ eventos */

  const bus = {
    listeners: new Map(),
    on(name, handler) {
      const list = this.listeners.get(name) || [];
      list.push(handler);
      this.listeners.set(name, list);
      return () => this.off(name, handler);
    },
    off(name, handler) {
      const list = this.listeners.get(name) || [];
      this.listeners.set(name, list.filter((item) => item !== handler));
    },
    emit(name, detail) {
      (this.listeners.get(name) || []).forEach((handler) => {
        try { handler(detail); } catch { /* un listener roto no rompe la página */ }
      });
    }
  };
  window.CHARCO_EVENTS = bus;

  const language = () => document.documentElement.lang || config.defaultLanguage || "es";
  const t = (key, fallback) => {
    const messages = content.messages || {};
    const lang = language();
    return (messages[lang] && messages[lang][key]) || (messages.es && messages.es[key]) || fallback || key;
  };
  const safeStore = {
    get(key, fallback) {
      try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
    }
  };
  const safeUrl = (value) => {
    try {
      const url = new URL(value, window.location.href);
      return ["http:", "https:", "tel:", "mailto:"].includes(url.protocol) ? url.href : "#";
    } catch { return "#"; }
  };

  /* ------------------------------------------------- buscador rápido */

  const buildIndex = () => {
    const entries = [];
    const seenSections = new Set();
    $$("main section[id]").forEach((section) => {
      const heading = section.querySelector("h1, h2");
      if (!heading || seenSections.has(section.id)) return;
      seenSections.add(section.id);
      entries.push({
        kind: "section",
        title: heading.textContent.trim(),
        hint: section.id,
        url: `#${section.id}`,
        keywords: `${section.id} ${heading.textContent}`
      });
    });
    content.resources.forEach((item) => {
      entries.push({
        kind: "resource",
        title: item.title,
        hint: `${item.category} · ${item.area} · ${item.level === "A" ? t("levelA") : item.level === "B" ? t("levelB") : t("levelC")}`,
        url: item.url,
        phone: item.phone || null,
        keywords: `${item.title} ${item.summary} ${item.category} ${item.area} ${item.address || ""}`,
        external: !String(item.url).startsWith("#")
      });
    });
    (content.glossary || []).forEach((item) => {
      entries.push({ kind: "resource", title: item.term, hint: item.short, url: item.source, keywords: `${item.term} ${item.short} ${item.detail}`, external: true });
    });
    const actions = [
      { key: "quickExit", action: () => $(".quick-exit")?.click() },
      { key: "theme", action: () => $("#theme-toggle")?.click() },
      { key: "print", action: () => window.print() },
      { key: "discreet", action: () => toggleDiscreet() },
      { key: "palette", action: () => $("#quick-exit")?.focus() }
    ];
    actions.forEach((action) => {
      entries.push({ kind: "action", title: t(action.key), hint: t("paletteActions"), action: action.action, keywords: `${t(action.key)} ${action.key}` });
    });
    content.emergencies.forEach((item) => {
      entries.push({ kind: "action", title: `${item.label} · ${item.title}`, hint: item.detail, phone: item.phone, keywords: `${item.title} ${item.detail} ${item.phone}`, action: () => { window.location.href = `tel:${item.phone}`; } });
    });
    return entries;
  };

  const normalize = (value) => String(value).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const palette = (() => {
    let index = [];
    let dialog = null;
    let input = null;
    let resultsBox = null;
    let visible = [];
    let cursor = 0;
    let lastFocus = null;

    const mount = () => {
      if (dialog) return dialog;
      dialog = el("div", "palette");
      dialog.id = "quick-find";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", "quick-find-title");
      dialog.hidden = true;
      const panel = el("div", "palette-panel");
      const header = el("div", "palette-header");
      header.append(el("h2", "", t("paletteTitle")));
      header.querySelector("h2").id = "quick-find-title";
      const close = el("button", "palette-close", "Esc ✕");
      close.type = "button";
      close.setAttribute("aria-label", t("paletteClose"));
      header.append(close);
      input = document.createElement("input");
      input.type = "search";
      input.className = "palette-input";
      input.setAttribute("aria-controls", "quick-find-results");
      input.setAttribute("aria-expanded", "true");
      input.setAttribute("role", "combobox");
      input.setAttribute("autocomplete", "off");
      input.placeholder = t("palettePlaceholder");
      input.setAttribute("aria-label", t("palette"));
      resultsBox = el("ul", "palette-results");
      resultsBox.id = "quick-find-results";
      resultsBox.setAttribute("role", "listbox");
      const hint = el("p", "palette-hint", t("paletteHint"));
      panel.append(header, input, resultsBox, hint);
      dialog.append(panel);
      document.body.append(dialog);

      const closeDialog = () => {
        dialog.hidden = true;
        document.body.classList.remove("palette-open");
        input.value = "";
        lastFocus?.focus?.();
      };
      close.addEventListener("click", closeDialog);
      dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
      input.addEventListener("input", () => { cursor = 0; render(input.value); });
      input.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") { event.preventDefault(); move(1); }
        else if (event.key === "ArrowUp") { event.preventDefault(); move(-1); }
        else if (event.key === "Enter") { event.preventDefault(); activate(visible[cursor]); }
        else if (event.key === "Escape") { event.preventDefault(); closeDialog(); }
      });
      document.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
          event.preventDefault();
          open();
        }
      });
      return dialog;
    };

    const open = () => {
      mount();
      index = buildIndex();
      lastFocus = document.activeElement;
      dialog.hidden = false;
      document.body.classList.add("palette-open");
      render("");
      input.focus();
    };

    const move = (delta) => {
      if (!visible.length) return;
      cursor = (cursor + delta + visible.length) % visible.length;
      [...resultsBox.children].forEach((child, position) => {
        child.setAttribute("aria-selected", String(position === cursor));
        child.classList.toggle("is-active", position === cursor);
      });
      resultsBox.children[cursor]?.scrollIntoView?.({ block: "nearest" });
    };

    const activate = (entry) => {
      if (!entry) return;
      window.CHARCO_EVENTS.emit("palette:activate", { kind: entry.kind, title: entry.title });
      if (entry.action) { entry.action(); if (entry.kind === "action" && entry.phone) return; }
      if (entry.url) {
        if (entry.external) window.open(safeUrl(entry.url), "_blank", "noopener,noreferrer");
        else window.location.hash = entry.url;
      }
      if (dialog && !entry.phone) {
        dialog.hidden = true;
        document.body.classList.remove("palette-open");
      }
    };

    const render = (query) => {
      const needle = normalize(query.trim());
      visible = index
        .map((entry) => {
          const haystack = normalize(`${entry.title} ${entry.hint} ${entry.keywords || ""}`);
          if (!needle) return { entry, score: entry.kind === "section" ? 3 : entry.kind === "action" ? 2 : 1 };
          const position = haystack.indexOf(needle);
          if (position === -1) return null;
          return { entry, score: (haystack.startsWith(needle) ? 4 : 1) - position / 200 };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .slice(0, 14)
        .map((item) => item.entry);

      resultsBox.replaceChildren();
      if (!visible.length) {
        resultsBox.append(el("li", "palette-empty", t("paletteEmpty")));
        return;
      }
      const groups = { section: t("paletteSections"), resource: t("paletteResources"), action: t("paletteActions") };
      let lastKind = null;
      visible.forEach((entry, position) => {
        if (entry.kind !== lastKind) {
          lastKind = entry.kind;
          const group = el("li", "palette-group", groups[entry.kind] || "");
          group.setAttribute("role", "presentation");
          resultsBox.append(group);
        }
        const item = el("li", "palette-item");
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(position === cursor));
        item.id = `palette-option-${position}`;
        item.append(el("strong", "", entry.title), el("span", "", entry.hint || ""));
        if (entry.phone) item.append(el("b", "", `${t("palettePhone")} ${entry.phone}`));
        item.addEventListener("click", () => activate(entry));
        item.addEventListener("mousemove", () => { cursor = position; move(0); });
        resultsBox.append(item);
      });
    };

    return { mount, open };
  })();

  /* ------------------------------------------------------- modo discreto */

  const DISCREET_TEXT = {
    es: "Nueva pestaña", ca: "Pestanya nova", en: "New tab", it: "Nuova scheda", fr: "Nouvel onglet",
    de: "Neuer Tab", pt: "Nova aba", zh: "新标签页", ur: "نئی ٹیب", ar: "علامة تبويب جديدة", fi: "Uusi välilehti"
  };

  const discreetKey = "charco-discreet";
  const applyDiscreet = (enabled) => {
    document.body.classList.toggle("is-discreet", enabled);
    if (enabled) {
      document.documentElement.dataset.discreetTitle = document.title;
      document.title = DISCREET_TEXT[language()] || DISCREET_TEXT.es;
    } else if (document.documentElement.dataset.discreetTitle) {
      document.title = document.documentElement.dataset.discreetTitle;
      delete document.documentElement.dataset.discreetTitle;
    }
    safeStore.set(discreetKey, enabled);
    const toggle = $("#discreet-toggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(enabled));
      toggle.textContent = enabled ? `${t("discreet")} · on` : t("discreet");
    }
  };
  const toggleDiscreet = () => {
    const enabled = !document.body.classList.contains("is-discreet");
    applyDiscreet(enabled);
    const toast = window.CHARCO_APP?.showToast;
    if (toast) toast(enabled ? t("discreetOn") : t("discreetOff"));
  };

  /* ----------------------------------------------------------- conexión */

  const setupConnectionBadge = () => {
    const target = $("#connection-state");
    if (!target) return;
    const paint = () => {
      const online = navigator.onLine !== false;
      target.textContent = online ? t("onlineNow") : t("offlineNow");
      target.dataset.state = online ? "online" : "offline";
    };
    window.addEventListener("online", paint);
    window.addEventListener("offline", paint);
    paint();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          target.textContent = t("updateAvailable");
          target.dataset.state = "update";
        });
      }).catch(() => {});
    }
  };

  /* -------------------------------------------------------- plan privado */

  const PLAN_KEY = "charco-plan";
  const planPanel = () => {
    const panel = el("aside", "plan-drawer");
    panel.id = "plan-drawer";
    panel.setAttribute("aria-labelledby", "plan-drawer-title");
    panel.hidden = true;
    const header = el("div", "plan-drawer-header");
    const title = el("h2", "", t("planTitle"));
    title.id = "plan-drawer-title";
    const close = el("button", "palette-close", "✕");
    close.type = "button";
    close.setAttribute("aria-label", t("paletteClose"));
    header.append(title, close);
    const list = el("ul", "plan-drawer-list");
    const actions = el("div", "health-controls");
    const printButton = el("button", "button button-primary", t("planPrint"));
    printButton.type = "button";
    const clearButton = el("button", "button button-ghost", t("planClear"));
    clearButton.type = "button";
    actions.append(printButton, clearButton);
    const status = el("p", "health-privacy", t("healthPrivacyNote"));
    panel.append(header, list, actions, status);
    document.body.append(panel);

    const paint = () => {
      const plan = safeStore.get(PLAN_KEY, []);
      list.replaceChildren();
      clearButton.disabled = plan.length === 0;
      printButton.disabled = plan.length === 0;
      if (!plan.length) {
        list.append(el("li", "health-hint", t("planEmpty")));
        return;
      }
      plan.forEach((entry, position) => {
        const item = el("li");
        item.append(el("strong", "", entry.title));
        if (entry.url) {
          const link = el("a", "", entry.area ? `${entry.area} · ${t("paletteOpen")}` : t("paletteOpen"));
          link.href = safeUrl(entry.url);
          if (!String(entry.url).startsWith("#")) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
          item.append(link);
        }
        const remove = el("button", "text-button", t("planClear"));
        remove.type = "button";
        remove.setAttribute("aria-label", `${t("planClear")}: ${entry.title}`);
        remove.addEventListener("click", () => {
          const next = safeStore.get(PLAN_KEY, []).filter((_, index) => index !== position);
          safeStore.set(PLAN_KEY, next);
          paint();
        });
        item.append(remove);
        list.append(item);
      });
    };

    close.addEventListener("click", () => { panel.hidden = true; });
    clearButton.addEventListener("click", () => { safeStore.set(PLAN_KEY, []); paint(); });
    printButton.addEventListener("click", () => {
      document.body.classList.add("printing-plan");
      window.print();
      window.setTimeout(() => document.body.classList.remove("printing-plan"), 400);
    });
    paint();

    const open = () => { panel.hidden = false; close.focus(); };
    const toggle = () => { if (panel.hidden) open(); else panel.hidden = true; };
    window.CHARCO_PLAN = {
      add(entry) {
        const plan = safeStore.get(PLAN_KEY, []);
        if (plan.some((item) => item.title === entry.title)) return false;
        plan.push({ title: entry.title, url: entry.url, area: entry.area, level: entry.level, category: entry.category });
        const stored = safeStore.set(PLAN_KEY, plan);
        paint();
        window.CHARCO_APP?.showToast?.(t("planAdded"));
        return stored;
      },
      open,
      toggle,
      paint,
      count: () => safeStore.get(PLAN_KEY, []).length
    };
    return { paint, toggle };
  };

  /* ------------------------------------------ ampliación de directorio */

  const addLevelFilter = () => {
    const selectRow = $(".select-row");
    if (!selectRow || $("#level-filter")) return;
    const label = el("label");
    label.setAttribute("for", "level-filter");
    label.append(el("span", "", t("filterLevel")));
    const select = document.createElement("select");
    select.id = "level-filter";
    [["all", t("levelAll")], ["A", t("levelA")], ["B", t("levelB")], ["C", t("levelC")]].forEach(([value, text]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      select.append(option);
    });
    label.append(select);
    selectRow.append(label);
    select.addEventListener("change", () => {
      // Se reutiliza el filtro existente añadiendo una regla extra sobre las tarjetas.
      const level = select.value;
      $$("#resource-grid .resource-card").forEach((card) => {
        card.hidden = level !== "all" && card.dataset.level !== level;
      });
    });
    return select;
  };

  const decorateDirectory = () => {
    const grid = $("#resource-grid");
    if (!grid) return;
    const decorate = (card) => {
      if (card.dataset.enhanced === "true") return;
      const title = card.querySelector("h3")?.textContent?.trim();
      const resource = content.resources.find((item) => item.title === title);
      if (!resource) return;
      card.dataset.enhanced = "true";
      card.dataset.level = resource.level;
      const head = card.querySelector(".resource-card-head");
      if (head && !head.querySelector(".level-badge")) {
        const badge = el("span", `level-badge level-${resource.level}`, `NIVEL ${resource.level}`);
        badge.title = resource.level === "A" ? t("levelA") : resource.level === "B" ? t("levelB") : t("levelC");
        head.append(badge);
      }
      const actions = card.querySelector(".resource-actions");
      if (!actions) return;
      const addPlan = el("button", "text-button", t("planAdd"));
      addPlan.type = "button";
      addPlan.addEventListener("click", () => window.CHARCO_PLAN?.add(resource));
      const copy = el("button", "text-button", t("copyCard"));
      copy.type = "button";
      copy.addEventListener("click", async () => {
        const text = `${resource.title}\n${resource.summary}\n${resource.area} · ${resource.cost}${resource.address ? `\n${resource.address}` : ""}${resource.phone ? `\n${t("palettePhone")}: ${resource.phone}` : ""}\n${resource.url}\n${t("verify")}`;
        try {
          await navigator.clipboard.writeText(text);
          window.CHARCO_APP?.showToast?.(t("copied"));
        } catch {
          window.CHARCO_APP?.showToast?.(t("copied"));
        }
      });
      const share = el("button", "text-button", t("shareCard"));
      share.type = "button";
      share.addEventListener("click", async () => {
        const payload = { title: resource.title, text: resource.summary, url: resource.url };
        try {
          if (navigator.share) { await navigator.share(payload); }
          else { await navigator.clipboard.writeText(`${resource.title} · ${resource.url}`); }
          window.CHARCO_APP?.showToast?.(t("shared"));
        } catch { /* la persona canceló: sin ruido */ }
      });
      const level = $("#level-filter")?.value || "all";
      if (level !== "all" && resource.level !== level) card.hidden = true;
      actions.append(addPlan, copy, share);
    };

    $$(".resource-card", grid).forEach(decorate);
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList?.contains("resource-card")) decorate(node);
        });
      });
    });
    observer.observe(grid, { childList: true });
  };

  /* --------------------------------------------------- agentes con citas */

  const renderSources = (sources) => {
    const log = $("#chat-log");
    if (!log || !sources?.length) return;
    const wrap = el("div", "chat-sources");
    wrap.append(el("span", "chat-sources-label", `${t("tramitesSources")}:`));
    sources.forEach((source) => {
      const link = el("a", "chat-source", source.title);
      link.href = safeUrl(source.url);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      if (source.level === "A") link.dataset.level = "A";
      wrap.append(link);
    });
    log.append(wrap);
    log.scrollTop = log.scrollHeight;
  };

  const bridgeAgents = () => {
    if (!window.CHARCO_AI || !window.CHARCO_APP) return;
    window.CHARCO_EXTENSIONS = Object.assign({}, window.CHARCO_EXTENSIONS, {
      agentReply: async (agent, question, lang) => {
        const result = window.CHARCO_AI.answer(agent.id, question, lang);
        return {
          text: result.text,
          sources: result.sources || [],
          mode: "local",
          kind: result.kind,
          confidence: result.confidence,
          phone: result.phone || null,
          secondaryPhone: result.secondaryPhone || null,
          safety: result.safety === true
        };
      }
    });

    bus.on("agent:reply", ({ result, agent, question }) => {
      if (!result) return;
      renderSources(result.sources);
      const badge = $("#agent-mode");
      if (badge) {
        badge.textContent = result.mode === "remote"
          ? t("agentModeRemote")
          : `${t("agentModeLocal")} · ${result.confidence || "media"}`;
      }
      if (result.safety) {
        const log = $("#chat-log");
        const notice = el("p", "chat-safety", t("moodCrisis"));
        log?.append(notice);
      }
      bus.emit("agent:answered", { agent: agent?.id, question, kind: result.kind });
    });
  };

  /* --------------------------------------------- glosario, transporte */

  const renderGlossary = () => {
    const target = $("#glossary-list");
    if (!target) return;
    target.replaceChildren();
    (content.glossary || []).forEach((item) => {
      const card = el("article", "glossary-card");
      card.append(el("h3", "", item.term), el("p", "glossary-short", item.short), el("p", "", item.detail));
      const link = el("a", "", t("healthOpenSource"));
      link.href = safeUrl(item.source);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      card.append(link);
      target.append(card);
    });
  };

  const renderTransport = () => {
    const target = $("#transport-grid");
    if (!target) return;
    target.replaceChildren();
    ((content.tools && content.tools.transport) || []).forEach((item) => {
      const card = el("article", "transport-card");
      card.append(
        el("span", "transport-mode", item.mode),
        el("h3", "", item.title),
        el("p", "", item.text),
        el("p", "transport-tip", item.tip)
      );
      const link = el("a", "", t("moveOfficial"));
      link.href = safeUrl(item.url);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      card.append(link);
      target.append(card);
    });
  };

  const renderChecklists = () => {
    const target = $("#checklist-grid");
    if (!target) return;
    target.replaceChildren();
    ((content.tools && content.tools.checklists) || []).forEach((checklist, index) => {
      const card = el("article", "checklist-card");
      const header = el("div", "checklist-header");
      const title = el("h3", "", checklist.title);
      title.id = `checklist-${checklist.id}`;
      header.append(title, el("span", "checklist-audience", checklist.audience));
      const list = el("ul", "checklist-items");
      checklist.items.forEach((item, position) => {
        const wrapper = el("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `check-${checklist.id}-${position}`;
        checkbox.checked = Boolean(safeStore.get(`charco-check-${checklist.id}`, {})[item.id]);
        const label = el("label");
        label.setAttribute("for", checkbox.id);
        label.append(el("strong", "", item.label), el("span", "", item.hint));
        checkbox.addEventListener("change", () => {
          const state = safeStore.get(`charco-check-${checklist.id}`, {});
          state[item.id] = checkbox.checked;
          safeStore.set(`charco-check-${checklist.id}`, state);
        });
        wrapper.append(checkbox, label);
        list.append(wrapper);
      });
      card.append(header, list);
      card.setAttribute("aria-labelledby", title.id);
      target.append(card);
    });
  };

  /* -------------------------------------------------- etiquetas de idioma */

  // Bloques que se renderizan desde datos canónicos en español (directorio, rutas,
  // cultura, glosario, herramientas). Se etiquetan con "ES" cuando el idioma activo
  // no es español para que nadie confunda contenido sin traducir con contenido roto.
  const CANONICAL_SPANISH = [
    "#emergency-grid .emergency-card p",
    "#route-list .route-step p",
    "#resource-grid .resource-card p",
    "#resource-grid .resource-card h3",
    "#culture-list .culture-card p",
    "#culture-list .culture-card h3",
    "#glossary-list dd",
    "#glossary-list .glossary-term",
    "#transport-grid .transport-card p",
    "#transport-grid .transport-card h3",
    "#checklist-grid .checklist-items span",
    "#checklist-grid .checklist-card h3",
    "#health-tools .health-route-output",
    "#health-tools .health-steps li",
    "#tramites-app .tramites-step",
    "#studio-app .studio-stations",
    "#plan-output h3, #plan-output li",
    "#news-grid .news-card h3, #news-grid .news-card p"
  ];

  const markFallbacks = () => {
    const lang = language();
    if (lang === "es") {
      $$("[data-fallback]").forEach((node) => delete node.dataset.fallback);
      return;
    }
    $$("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      const translated = content.messages[lang]?.[key];
      const spanish = content.messages.es?.[key];
      const isFallback = translated && spanish && translated === spanish && spanish.length > 60;
      if (isFallback) {
        node.dataset.fallback = "es";
        node.title = t("fallbackTag");
      } else {
        delete node.dataset.fallback;
      }
    });
    const label = t("fallbackTag");
    CANONICAL_SPANISH.forEach((selector) => {
      $$(selector).forEach((node) => {
        if (node.hasAttribute("data-i18n")) return;
        if (node.closest("[data-i18n]")) return;
        node.dataset.fallback = "es";
        node.title = label;
      });
    });
  };

  /* ------------------------------------------------------------- arranque */

  const remountLanguageAware = () => {
    ["#health-tools", "#tramites-app", "#studio-app", "#glossary-list", "#transport-grid", "#checklist-grid"].forEach((selector) => {
      const node = $(selector);
      if (node) delete node.dataset.mounted;
    });
    renderGlossary();
    renderTransport();
    renderChecklists();
    window.CHARCO_HEALTH?.mount($("#health-tools"));
    window.CHARCO_TRAMITES?.mount($("#tramites-app"));
    window.CHARCO_STUDIO?.mount($("#studio-app"));
    window.CHARCO_PLAN?.paint();
    markFallbacks();
  };

  const setupUtilityBar = () => {
    const bar = $(".utility-actions");
    if (!bar || $("#discreet-toggle")) return;
    const search = el("button", "icon-button", t("palette"));
    search.type = "button";
    search.id = "palette-open";
    search.setAttribute("aria-haspopup", "dialog");
    search.addEventListener("click", () => palette.open());
    const discreet = el("button", "icon-button", t("discreet"));
    discreet.type = "button";
    discreet.id = "discreet-toggle";
    discreet.setAttribute("aria-pressed", "false");
    discreet.addEventListener("click", toggleDiscreet);
    const plan = el("button", "icon-button", `${t("planTitle")} (0)`);
    plan.type = "button";
    plan.id = "plan-open";
    plan.addEventListener("click", () => window.CHARCO_PLAN?.toggle());
    bus.on("plan:change", () => { plan.textContent = `${t("planTitle")} (${window.CHARCO_PLAN?.count() || 0})`; });
    bar.append(search, discreet, plan);
    const status = el("span", "");
    status.id = "connection-state";
    status.setAttribute("role", "status");
    status.className = "connection-state";
    $(".utility-bar")?.append(status);
  };

  const scrollSpy = () => {
    if (!("IntersectionObserver" in window)) return;
    const links = $$(".site-nav a[href^='#']");
    const map = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((item) => item.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  };

  const applyNavLabels = () => {
    // La barra de navegación no usaba data-i18n: se etiqueta aquí para que el
    // sistema de traducción existente la cubra sin tocar app.js.
    const map = {
      "#urgente": "navUrgent", "#ruta": "navRoute", "#directorio": "navDirectory",
      "#salud": "navHealth", "#musica": "navMusic", "#tramites": "navTramites",
      "#moverse": "navMove", "#cultura": "navCulture", "#agentes": "navAgents", "#noticias": "navNews",
      "#planes": "navPlan", "#glosario": "navGlossary", "#ia": "navAI"
    };
    Object.entries(map).forEach(([selector, key]) => {
      const link = $(`.site-nav a[href='${selector}']`);
      if (link && !link.dataset.i18n) link.dataset.i18n = key;
    });
  };

  // Prompt master copiable: acción explícita, con estado anunciado a lectores
  // de pantalla y sin depender de la API de portapapeles si el navegador la niega.
  const setupPromptCopy = () => {
    const button = $("#ai-copy");
    const source = $("#ai-prompt-text");
    const feedback = $("#ai-feedback");
    if (!button || !source || button.dataset.bound === "1") return;
    button.dataset.bound = "1";
    button.addEventListener("click", async () => {
      const text = source.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        feedback.textContent = t("aiCopied");
      } catch {
        const range = document.createRange();
        range.selectNodeContents(source);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        feedback.textContent = t("aiCopyError");
      }
    });
  };

  const listenToApp = () => {
    // app.js emite eventos en lugar de exponer su estado interno: esta capa se
    // engancha sin acoplarse ni reescribir el frontend existente.
    document.addEventListener("charco:agent-reply", (event) => bus.emit("agent:reply", event.detail || {}));
    document.addEventListener("charco:directory", () => { decorateDirectory(); syncLevelVisibility(); });
    document.addEventListener("charco:language", () => {
      remountLanguageAware();
      setupPromptCopy();
      applyDiscreet(document.body.classList.contains("is-discreet"));
      bus.emit("plan:change", { count: window.CHARCO_PLAN?.count() || 0 });
    });
    document.addEventListener("charco:ready", () => bus.emit("ux:linked", {}));
  };

  const syncLevelVisibility = () => {
    const level = $("#level-filter")?.value || "all";
    $$("#resource-grid .resource-card").forEach((card) => {
      card.hidden = level !== "all" && card.dataset.level !== level;
    });
  };

  const init = () => {
    applyNavLabels();
    listenToApp();
    palette.mount();
    planPanel();
    setupUtilityBar();
    setupConnectionBadge();
    const levelSelect = addLevelFilter();
    decorateDirectory();
    setupPromptCopy();
    bridgeAgents();
    remountLanguageAware();
    scrollSpy();
    applyDiscreet(Boolean(safeStore.get(discreetKey, false)));
    // El filtro de nivel convive con los filtros de app.js: al cambiar cualquier
    // otro filtro se vuelve a aplicar el nivel seleccionado.
    ["#directory-search", "#area-filter", "#cost-filter", "#adult-filter"].forEach((selector) => {
      $(selector)?.addEventListener("input", syncLevelVisibility);
    });
    const level = $("#level-filter");
    if (level) level.addEventListener("change", () => {
      syncLevelVisibility();
      bus.emit("directory:level", { level: level.value });
    });
    bus.emit("ux:ready", { resources: content.resources.length });
  };

  window.CHARCO_UX = Object.freeze({
    version: "1.0.0",
    openPalette: () => palette.open(),
    toggleDiscreet,
    remountLanguageAware,
    markFallbacks,
    t
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
