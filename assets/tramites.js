/* Generador de ruta de trámites — orientación ordenada, nunca asesoramiento.
 *
 * QUÉ HACE
 * Con tres respuestas construye una lista de pasos en orden razonable, con la
 * fuente oficial u organización que corresponde a cada paso. Todo el cálculo es
 * local: no hay red, no hay cuenta y no hay historial enviado.
 *
 * QUÉ NO HACE
 * No calcula plazos, no valora si una solicitud será aceptada y no sustituye a
 * un abogado ni a una entidad especializada. Cada ruta muestra ese límite.
 */
window.CHARCO_TRAMITES = (() => {
  "use strict";

  const content = window.CHARCO_CONTENT;
  const STORAGE = "charco-tramites";

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

  const byTitle = new Map((content.resources || []).map((item) => [item.title, item]));

  const QUESTIONS = [
    {
      id: "situacion",
      label: () => t("tramitesQ1"),
      options: [
        { value: "asilo", label: "Solicitante de asilo o refugiado" },
        { value: "sin-papeles", label: "Estoy sin permiso de residencia" },
        { value: "con-permiso", label: "Tengo permiso temporal (estudio, trabajo o familiar)" },
        { value: "nueva", label: "Acabo de llegar (menos de tres meses)" }
      ]
    },
    {
      id: "necesidad",
      label: () => t("tramitesQ2"),
      options: [
        { value: "documentos", label: "Documentos, residencia o asilo" },
        { value: "salud", label: "Salud y bienestar" },
        { value: "trabajo", label: "Trabajo y formación" },
        { value: "vivienda", label: "Vivienda y vida diaria" },
        { value: "familia", label: "Familia, menores o pareja" }
      ]
    },
    {
      id: "tiempo",
      label: () => t("tramitesQ3"),
      options: [
        { value: "menos-3", label: "Menos de 3 meses" },
        { value: "3-12", label: "Entre 3 y 12 meses" },
        { value: "mas-12", label: "Más de 12 meses" },
        { value: "no-se", label: "No lo sé" }
      ]
    }
  ];

  const STEP = (title, detail, source) => ({ title, detail, source });

  const buildRoute = ({ situacion, necesidad, tiempo }) => {
    const steps = [];
    const push = (step) => { if (!steps.some((existing) => existing.title === step.title)) steps.push(step); };

    // Base común: sin empadronamiento casi todo se bloquea.
    push(STEP("Empadronamiento", "Pide cita en el ayuntamiento donde vives de verdad y lleva algún documento del domicilio. No depende de tu permiso de residencia y es la llave de salud, escuela y ayudas.", "Sitges · serveis municipals"));

    if (situacion === "asilo") {
      push(STEP("Primera orientación de asilo", "Acude a una entidad especializada antes de firmar o presentar nada. Se ordenan hechos, fechas y pruebas de persecución, incluida la orientación sexual o identidad de género.", "CEAR Catalunya"));
      push(STEP("Registro de la solicitud", "El resguardo de la solicitud es tu prueba documental de estancia: guárdalo y llévalo siempre en copia.", "Protección internacional · Ministerio del Interior"));
    } else if (situacion === "sin-papeles") {
      push(STEP("Diagnóstico de vías posibles", "No hay una única ruta: arraigo, asilo, reagrupación, violencia o causas humanitarias se valoran caso a caso. Pide orientación antes de gastar dinero en gestorías.", "SAIER"));
      push(STEP("Documentar el tiempo aquí", "Reúne empadronamiento, visitas médicas, transferencias, contratos de alquiler o testigos. El tiempo acreditado es el material con el que se trabaja.", "Punt d'Informació d'Arrelament"));
      push(STEP("NIE si no lo tienes", "Consulta requisitos y tasas en canales oficiales. Nadie puede venderte una cita pública.", "Policía Nacional · Extranjería (NIE y TIE)"));
      push(STEP("Orientación jurídica gratuita", "Si no tienes recursos, pregunta por el turno de oficio y por el servicio de orientación jurídica de tu municipio.", "ICAB · orientació jurídica i torn d'ofici"));
    } else if (situacion === "con-permiso") {
      push(STEP("Revisa caducidades", "Renovar con tiempo evita perder derechos. Consulta la vía de renovación y apunta el número de expediente de cada trámite.", "Portal de inmigración · Ministerio de Inclusión"));
      push(STEP("Homologación si trabajas en profesión regulada", "Comprueba si tu título necesita homologación o equivalencia y calcula tiempos antes de pagar intermediarios.", "Barcelona Activa"));
    } else {
      push(STEP("Primera acogida", "SAIER hace atención inicial, información de extranjería y derivación; también ayuda con traducción.", "SAIER"));
      push(STEP("Documentos que sí puedes conseguir ya", "Empadronamiento, tarjeta sanitaria o documento de atención sanitaria y, si procede, inscripción en el SOC.", "Canal Salut"));
    }

    if (necesidad === "salud" || necesidad === "documentos") {
      push(STEP("CAP y cobertura sanitaria", "Pide centro de salud asignado. La atención de urgencia y a menores no depende del permiso de residencia.", "Canal Salut"));
      push(STEP("Apoyo psicológico con perspectiva LGTBIQ+", "El Centre LGTBI ofrece apoyo gratuito; si hay crisis, el 024 está disponible 24 h.", "Centre LGTBI de Barcelona"));
    }
    if (necesidad === "salud") {
      push(STEP("Salud sexual y pruebas", "Pruebas comunitarias confidenciales de VIH e ITS; la PrEP es gratuita en Catalunya para personas con riesgo elevado.", "BCN Checkpoint"));
    }
    if (necesidad === "trabajo" || necesidad === "documentos") {
      push(STEP("Inscripción en el SOC", "Es la puerta a cursos y ofertas públicas; puede hacerse online o presencial.", "SOC"));
      push(STEP("Catalán y formación", "Cursos oficiales por niveles y voluntariado lingüístico: mejora real de acceso a empleo.", "CPNL · cursos de català"));
      push(STEP("Tus derechos laborales", "Sin contrato sigues teniendo derechos: la Inspección de Trabajo puede actuar y no se te sanciona por tu situación administrativa.", "Inspecció de Treball de Catalunya"));
    }
    if (necesidad === "vivienda" || necesidad === "familia") {
      push(STEP("Vivienda: verificar antes de pagar", "Visita la vivienda o pide videollamada, exige contrato por escrito y recibo de todo. Nunca transferencias a terceros sin comprobar.", "Vivienda · Ayuntamiento de Barcelona"));
      push(STEP("Servicios sociales del municipio", "Valoran urgencias de alojamiento y ayudas; también informan de mediación si hay riesgo de desahucio.", "Sitges · serveis municipals"));
    }
    if (necesidad === "familia") {
      push(STEP("Menores: escuela y sanidad", "La escolarización y la atención sanitaria de menores tienen garantías específicas: pregunta en servicios sociales y en el centro educativo.", "Sitges · serveis municipals"));
      push(STEP("Reagrupación familiar", "Consulta requisitos económicos y de vivienda antes de iniciar el procedimiento; los tiempos importan.", "Portal de inmigración · Ministerio de Inclusión"));
    }

    if (tiempo === "mas-12") {
      push(STEP("Revisar arraigo y renovaciones", "Con más de un año documentable, merece la pena revisar todas las vías disponibles con orientación especializada.", "Punt d'Informació d'Arrelament"));
    }
    if (tiempo === "no-se") {
      push(STEP("Construir un mapa de fechas", "Antes de cualquier trámite: escribe cuándo llegaste, cuándo te empadronaste, cuándo acudiste a salud y qué documentos tienes.", "SAIER"));
    }

    push(STEP("Guardar copias y no pagar por lo que es gratis", "Fotografía cada documento, guarda los resguardos y desconfía de quien cobra por citas públicas o promete resultados.", "Oficina por la No Discriminación"));
    return steps;
  };

  const read = () => {
    try { return JSON.parse(window.localStorage.getItem(STORAGE) || "{}"); } catch { return {}; }
  };
  const save = (value) => {
    try { window.localStorage.setItem(STORAGE, JSON.stringify(value)); return true; } catch { return false; }
  };

  const mount = (container) => {
    if (!container || container.dataset.mounted === "true") return;
    container.dataset.mounted = "true";

    const shell = el("div", "tramites");
    const form = el("form", "tramites-form");
    const selects = {};
    QUESTIONS.forEach((question) => {
      const field = el("label", "studio-field");
      field.append(el("span", "", question.label()));
      const select = document.createElement("select");
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "…";
      select.append(placeholder);
      question.options.forEach((option) => {
        const node = document.createElement("option");
        node.value = option.value;
        node.textContent = option.label;
        select.append(node);
      });
      field.append(select);
      selects[question.id] = select;
      form.append(field);
    });
    const actions = el("div", "health-controls");
    const generate = el("button", "button button-primary", t("tramitesGenerate"));
    generate.type = "submit";
    const reset = el("button", "button button-ghost", t("tramitesReset"));
    reset.type = "button";
    const print = el("button", "button button-ghost", t("tramitesPrint"));
    print.type = "button";
    actions.append(generate, reset, print);
    form.append(actions);

    const output = el("div", "tramites-output");
    output.setAttribute("aria-live", "polite");
    const hint = el("p", "health-hint", t("tramitesPick"));
    output.append(hint);

    const saved = read();

    const render = (answers) => {
      const steps = buildRoute(answers);
      const done = new Set(saved.done || []);
      output.replaceChildren();
      const header = el("div", "tramites-header");
      header.append(
        el("h3", "", t("tramitesSteps")),
        el("span", "tramites-progress", `${t("tramitesProgress")}: ${steps.filter((step) => done.has(step.title)).length}/${steps.length}`)
      );
      const list = el("ol", "tramites-list");
      steps.forEach((step, index) => {
        const item = el("li", "tramites-step");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `tramite-${index}`;
        checkbox.checked = done.has(step.title);
        checkbox.addEventListener("change", () => {
          const current = read();
          const next = new Set(current.done || []);
          if (checkbox.checked) next.add(step.title); else next.delete(step.title);
          save({ ...current, done: [...next] });
          render(answers);
        });
        const label = el("label");
        label.setAttribute("for", checkbox.id);
        label.append(el("strong", "", `${index + 1}. ${step.title}`), el("span", "", step.detail));
        const resource = byTitle.get(step.source);
        if (resource) {
          const link = el("a", "tramites-source", `${t("tramitesSources")}: ${resource.title}`);
          link.href = resource.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          label.append(link);
        }
        item.append(checkbox, label);
        list.append(item);
      });
      const disclaimer = el("p", "health-privacy", t("tramitesDisclaimer"));
      const saveButton = el("button", "button button-ghost", t("tramitesSave"));
      saveButton.type = "button";
      saveButton.addEventListener("click", () => {
        const current = read();
        save({ ...current, answers });
        saveButton.textContent = t("tramitesSaved");
      });
      output.append(header, list, disclaimer, saveButton);
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      output.scrollIntoView?.({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const answers = {};
      Object.entries(selects).forEach(([key, select]) => { answers[key] = select.value; });
      if (Object.values(answers).some((value) => !value)) {
        output.replaceChildren(el("p", "health-hint", t("tramitesPick")));
        const firstEmpty = Object.values(selects).find((select) => !select.value);
        firstEmpty?.focus();
        return;
      }
      save({ ...read(), answers });
      render(answers);
    });

    reset.addEventListener("click", () => {
      Object.values(selects).forEach((select) => { select.value = ""; });
      output.replaceChildren(el("p", "health-hint", t("tramitesPick")));
      selects.situacion.focus();
    });

    print.addEventListener("click", () => {
      document.body.classList.add("printing-tramites");
      window.print();
      window.setTimeout(() => document.body.classList.remove("printing-tramites"), 400);
    });

    // Restaurar respuestas guardadas: continuar donde se dejó, sin cuenta.
    if (saved.answers) {
      Object.entries(saved.answers).forEach(([key, value]) => { if (selects[key]) selects[key].value = value; });
      if (Object.values(saved.answers).every(Boolean)) render(saved.answers);
    }

    shell.append(form, output);
    container.replaceChildren(shell);
  };

  return Object.freeze({ mount, buildRoute, version: "1.0.0" });
})();
