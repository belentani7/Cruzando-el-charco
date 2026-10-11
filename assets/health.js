/* Salud práctica — herramientas locales, sin diagnóstico y sin red.
 *
 * LÍMITES EXPLÍCITOS (no negociables)
 * - Ninguna función valora síntomas, prescribe ni decide si algo es urgente:
 *   las rutas derivan a 112 / 061 / 024 y a los servicios reales.
 * - Todo dato personal que se pueda crear (reloj PEP, recordatorios, diario de
 *   ánimo) vive SOLO en localStorage del navegador. No hay envío, no hay cuenta
 *   y hay un botón de borrado visible para cada bloque.
 * - Se avisa de que localStorage no cifra y de que en un dispositivo compartido
 *   puede leerse: la persona decide qué guardar.
 */
window.CHARCO_HEALTH = (() => {
  "use strict";

  const content = window.CHARCO_CONTENT;
  const STORAGE = {
    pep: "charco-pep-start",
    reminders: "charco-reminders",
    mood: "charco-mood"
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const t = (key, fallback) => {
    const language = document.documentElement.lang || "es";
    const messages = (content && content.messages) || {};
    return (messages[language] && messages[language][key]) || (messages.es && messages.es[key]) || fallback || key;
  };

  const read = (key, fallback) => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  };
  const write = (key, value) => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  };
  const remove = (key) => {
    try { window.localStorage.removeItem(key); } catch { /* almacenamiento bloqueado */ }
  };

  const hoursBetween = (from, to = Date.now()) => (to - from) / 36e5;

  /* ------------------------------------------------------------ rutas */

  const routesBlock = () => {
    const wrap = el("div", "health-routes");
    const routes = (content.tools && content.tools.healthRoutes) || [];
    const list = el("div", "health-route-buttons");
    list.setAttribute("role", "group");
    list.setAttribute("aria-label", t("healthRouteLegend"));
    const output = el("div", "health-route-output");
    output.setAttribute("aria-live", "polite");
    output.append(el("p", "health-hint", t("healthRouteLegend")));

    routes.forEach((route) => {
      const button = el("button", `chip-route tone-${route.tone || "mint"}`, route.label);
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        [...list.children].forEach((child) => child.setAttribute("aria-pressed", String(child === button)));
        const card = el("article", `health-route-card tone-${route.tone || "mint"}`);
        card.append(el("h4", "", `${t("healthResult")}: ${route.label}`));
        const steps = el("ol", "health-steps");
        route.steps.forEach((step) => steps.append(el("li", "", step)));
        card.append(steps);
        const actions = el("div", "health-route-actions");
        if (route.phone) {
          const phone = el("a", "button button-primary", `${t("healthCallNow")} · ${route.phoneLabel || route.phone}`);
          phone.href = `tel:${route.phone}`;
          actions.append(phone);
        }
        if (route.source) {
          const source = el("a", "button button-ghost", t("healthOpenSource"));
          source.href = route.source;
          source.target = "_blank";
          source.rel = "noopener noreferrer";
          actions.append(source);
        }
        const reset = el("button", "text-button", t("healthReset"));
        reset.type = "button";
        reset.addEventListener("click", () => {
          [...list.children].forEach((child) => child.setAttribute("aria-pressed", "false"));
          output.replaceChildren(el("p", "health-hint", t("healthRouteLegend")));
        });
        actions.append(reset);
        card.append(actions);
        output.replaceChildren(card);
        card.querySelector("h4").setAttribute("tabindex", "-1");
        card.querySelector("h4").focus();
        window.CHARCO_EVENTS?.emit("health:route", { id: route.id });
      });
      list.append(button);
    });

    wrap.append(list, output, el("p", "health-privacy", t("healthPrivacyNote")));
    return wrap;
  };

  /* --------------------------------------------------------- reloj PEP */

  const prepBlock = () => {
    const wrap = el("div", "health-prep");
    wrap.append(el("h3", "", t("healthPrepTitle")), el("p", "", t("healthPrepText")));
    const controls = el("div", "health-controls");
    const startButton = el("button", "button button-primary", t("prepStart"));
    startButton.type = "button";
    const clearButton = el("button", "button button-ghost", t("prepClear"));
    clearButton.type = "button";
    const readout = el("div", "health-readout");
    readout.setAttribute("aria-live", "polite");
    controls.append(startButton, clearButton);

    const paint = () => {
      const started = read(STORAGE.pep, null);
      readout.replaceChildren();
      clearButton.disabled = !started;
      if (!started) {
        readout.append(el("p", "health-hint", t("prepEmpty")));
        startButton.textContent = t("prepStart");
        return;
      }
      const hours = hoursBetween(started.at);
      const left = Math.max(0, 72 - hours);
      startButton.textContent = t("prepStart");
      const clock = el("div", "health-clock");
      clock.append(
        el("span", "health-clock-label", t("prepElapsed")),
        el("strong", "", `${hours.toFixed(1)} h`),
        el("span", "health-clock-label", t("prepWindow")),
        el("strong", "", `${left.toFixed(1)} h`)
      );
      const bar = el("div", "health-bar");
      const fill = el("i");
      fill.style.width = `${Math.min(100, (hours / 72) * 100).toFixed(1)}%`;
      bar.append(fill);
      const action = el("p", "health-action", hours <= 72 ? t("prepAction") : t("prepKeep"));
      // Enlace directo: cuando el reloj está activo, la llamada tiene que estar a un toque.
      const call = el("a", "button button-primary", `${t("healthCallNow")} · 061`);
      call.href = "tel:061";
      readout.append(clock, bar, action, call, el("p", "health-hint", t("prepKeep")));
    };

    startButton.addEventListener("click", () => {
      write(STORAGE.pep, { at: Date.now() });
      paint();
    });
    clearButton.addEventListener("click", () => {
      remove(STORAGE.pep);
      paint();
    });

    wrap.append(controls, readout);
    paint();
    return wrap;
  };

  /* ------------------------------------------------------ recordatorios */

  const trackerBlock = () => {
    const wrap = el("div", "health-tracker");
    wrap.append(el("h3", "", t("trackerTitle")), el("p", "", t("trackerText")));
    const form = el("form", "health-form");
    const nameLabel = el("label", "studio-field");
    nameLabel.append(el("span", "", t("trackerName")));
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.maxLength = 48;
    nameInput.required = true;
    nameInput.autocomplete = "off";
    nameInput.placeholder = t("trackerName");
    nameLabel.append(nameInput);
    const everyLabel = el("label", "studio-field");
    everyLabel.append(el("span", "", t("trackerEvery")));
    const everyInput = document.createElement("input");
    everyInput.type = "number";
    everyInput.min = "1";
    everyInput.max = "72";
    everyInput.value = "8";
    everyLabel.append(everyInput);
    const submit = el("button", "button button-primary", t("trackerAdd"));
    submit.type = "submit";
    form.append(nameLabel, everyLabel, submit);

    const list = el("ul", "health-list");
    const status = el("p", "health-hint", "");
    status.setAttribute("aria-live", "polite");
    const clearButton = el("button", "button button-ghost", t("trackerClear"));
    clearButton.type = "button";

    const paint = () => {
      const reminders = read(STORAGE.reminders, []);
      list.replaceChildren();
      clearButton.disabled = reminders.length === 0;
      if (!reminders.length) {
        list.append(el("li", "health-hint", t("trackerEmpty")));
        return;
      }
      reminders.forEach((reminder, index) => {
        const item = el("li", "health-reminder");
        const hours = hoursBetween(reminder.at);
        const next = Math.max(0, reminder.every - (hours % reminder.every));
        item.append(
          el("strong", "", reminder.name),
          el("span", "", `${t("trackerEvery")}: ${reminder.every} h · ${t("prepElapsed")}: ${hours.toFixed(1)} h · → ${next.toFixed(1)} h`),
          (() => {
            const button = el("button", "text-button", t("trackerClear"));
            button.type = "button";
            button.setAttribute("aria-label", `${t("trackerClear")}: ${reminder.name}`);
            button.addEventListener("click", () => {
              const next = read(STORAGE.reminders, []).filter((_, position) => position !== index);
              write(STORAGE.reminders, next);
              paint();
            });
            return button;
          })()
        );
        list.append(item);
      });
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = nameInput.value.trim().slice(0, 48);
      const every = Math.min(72, Math.max(1, Number(everyInput.value) || 8));
      if (!name) return;
      const reminders = read(STORAGE.reminders, []);
      reminders.push({ name, every, at: Date.now() });
      const stored = write(STORAGE.reminders, reminders);
      status.textContent = stored ? t("trackerSaved") : t("trackerClaim");
      nameInput.value = "";
      paint();
    });

    clearButton.addEventListener("click", () => {
      remove(STORAGE.reminders);
      paint();
    });

    wrap.append(form, list, status, el("p", "health-privacy", t("trackerClaim")), clearButton);
    paint();
    return wrap;
  };

  /* -------------------------------------------------------- diario ánimo */

  const moodBlock = () => {
    const wrap = el("div", "health-mood");
    wrap.append(el("h3", "", t("moodTitle")), el("p", "", t("moodText")));
    const form = el("form", "health-form");
    const legend = el("fieldset", "health-mood-fieldset");
    legend.append(el("legend", "", t("moodQuestion")));
    const options = el("div", "chip-options");
    [1, 2, 3, 4, 5].forEach((value) => {
      const label = el("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "mood";
      input.value = String(value);
      if (value === 3) input.checked = true;
      label.append(input, el("span", "", `${value} · ${t(`mood${value}`)}`));
      options.append(label);
    });
    legend.append(options);
    const noteLabel = el("label", "studio-field");
    noteLabel.append(el("span", "", t("moodNote")));
    const note = document.createElement("input");
    note.type = "text";
    note.maxLength = 120;
    note.autocomplete = "off";
    noteLabel.append(note);
    const submit = el("button", "button button-primary", t("moodSave"));
    submit.type = "submit";
    form.append(legend, noteLabel, submit);

    const chart = el("div", "health-chart");
    const status = el("p", "health-hint", "");
    status.setAttribute("aria-live", "polite");
    const actions = el("div", "health-controls");
    const exportButton = el("button", "button button-ghost", t("moodExport"));
    exportButton.type = "button";
    const eraseButton = el("button", "button button-ghost", t("moodErase"));
    eraseButton.type = "button";
    actions.append(exportButton, eraseButton);

    const paint = () => {
      const entries = read(STORAGE.mood, []);
      chart.replaceChildren();
      eraseButton.disabled = entries.length === 0;
      exportButton.disabled = entries.length === 0;
      if (!entries.length) {
        chart.append(el("p", "health-hint", t("mood14")));
        return;
      }
      const recent = entries.slice(-14);
      const bars = el("ol", "health-bars");
      recent.forEach((entry) => {
        const item = el("li");
        const bar = el("i");
        item.append(bar);
        bar.style.height = `${entry.mood * 18}%`;
        bar.title = `${new Date(entry.at).toLocaleString()} · ${t(`mood${entry.mood}`)}`;
        item.setAttribute("aria-label", `${new Date(entry.at).toLocaleDateString()}: ${t(`mood${entry.mood}`)}`);
        bars.append(item);
      });
      chart.append(el("p", "health-hint", t("mood14")), bars);
      if (recent[recent.length - 1] && Number(recent[recent.length - 1].mood) <= 2) {
        chart.append(el("p", "health-crisis", t("moodCrisis")));
      }
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const mood = Number(data.get("mood")) || 3;
      const entries = read(STORAGE.mood, []);
      entries.push({ at: Date.now(), mood, note: String(note.value || "").slice(0, 120) || undefined });
      const stored = write(STORAGE.mood, entries.slice(-180));
      status.textContent = stored ? t("moodSaved") : t("moodCrisis");
      note.value = "";
      paint();
    });

    exportButton.addEventListener("click", () => {
      const entries = read(STORAGE.mood, []);
      const blob = new Blob([JSON.stringify({ generatedAt: new Date().toISOString(), entries }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "charco-animo.json";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 15000);
    });

    eraseButton.addEventListener("click", () => {
      remove(STORAGE.mood);
      status.textContent = t("moodErased");
      paint();
    });

    wrap.append(form, chart, status, actions, el("p", "health-privacy", t("healthPrivacyNote")));
    paint();
    return wrap;
  };

  /* --------------------------------------------------------- qué chatear */

  const topicsBlock = () => {
    const wrap = el("div", "health-topics");
    const topics = (content.tools && content.tools.healthTopics) || [];
    const details = el("details", "health-topics-details");
    details.append(el("summary", "", t("healthTopicsTitle")));
    const list = el("ul", "health-topics-list");
    topics.forEach((topic) => {
      const item = el("li");
      item.append(el("strong", "", topic.title), el("span", "", topic.text));
      list.append(item);
    });
    details.append(list);
    wrap.append(details);
    return wrap;
  };

  const mount = (container) => {
    if (!container || container.dataset.mounted === "true") return;
    container.dataset.mounted = "true";
    const grid = el("div", "health-grid");
    grid.append(routesBlock(), prepBlock(), trackerBlock(), moodBlock());
    container.replaceChildren(grid, topicsBlock());
  };

  return Object.freeze({
    mount,
    version: "1.0.0",
    storageKeys: { ...STORAGE },
    hoursBetween
  });
})();
