/* Estudio Charco — música generativa local (Web Audio API).
 *
 * DECISIONES
 * - Nada de audio remoto: la CSP del sitio no permite orígenes de terceros y la
 *   audiencia puede estar sin datos. Todo el sonido se sintetiza aquí.
 * - Nada de archivos binarios en el repositorio: los "paisajes" son parámetros.
 * - Nada de reproducción automática: el navegador lo bloquea y, además, sería
 *   una falta de respeto en un sitio que se abre en la sala de espera de una
 *   oficina o en casa compartida.
 * - Volumen máximo bajo y limitador: el móvil se usa con auriculares de un euro.
 * - Se puede exportar 30 s a WAV con OfflineAudioContext: música generada por la
 *   persona usuaria, sin licencias de terceros.
 */
window.CHARCO_STUDIO = (() => {
  "use strict";

  const content = window.CHARCO_CONTENT;
  const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    pentatonic: [0, 3, 5, 7, 10]
  };
  const KEYS = { C: 261.63, D: 293.66, F: 349.23, G: 392.0, A: 220.0 };
  const MAX_GAIN = 0.22;

  const state = {
    context: null,
    master: null,
    nodes: [],
    timer: null,
    playing: false,
    preset: null,
    analyser: null,
    frame: null,
    nextNote: 0,
    step: 0
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

  /* --------------------------------------------------------------- motor */

  const noteFrequency = (preset, index) => {
    const scale = SCALES[preset.scale] || SCALES.major;
    const root = KEYS[preset.key] || KEYS.C;
    const octave = Math.floor(index / scale.length);
    const semitone = scale[((index % scale.length) + scale.length) % scale.length];
    return root * Math.pow(2, semitone / 12 + (octave - 1) * 0 + (octave >= scale.length ? 0 : 0)) * (octave > 0 ? 2 : 1);
  };

  const impulse = (context, seconds, decay) => {
    const rate = context.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = context.createBuffer(2, length, rate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  };

  // Construye el grafo completo. Se reutiliza en reproducción y en exportación,
  // para que el WAV suene igual que lo que se escucha.
  const buildGraph = (context, preset, destination) => {
    const nodes = [];
    const master = context.createGain();
    master.gain.value = 0;
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 6;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.006;
    limiter.release.value = 0.25;
    master.connect(limiter).connect(destination);
    nodes.push(master, limiter);

    const reverb = context.createConvolver();
    reverb.buffer = impulse(context, 2.6, 3.2);
    const reverbGain = context.createGain();
    reverbGain.gain.value = preset.reverb * 0.5;
    reverb.connect(reverbGain).connect(master);
    nodes.push(reverb, reverbGain);

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = preset.brightness;
    filter.Q.value = 0.9;
    filter.connect(master);
    filter.connect(reverb);
    nodes.push(filter);

    // Coro: dos osciladores desafinados, lento y cálido.
    const pad = context.createGain();
    pad.gain.value = 0.0001;
    pad.connect(filter);
    [1, 1.005, 0.5].forEach((ratio, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = preset.wave;
      oscillator.frequency.value = (KEYS[preset.key] || KEYS.C) * ratio * (index === 2 ? 0.5 : 1);
      oscillator.detune.value = index === 1 ? 7 : 0;
      oscillator.connect(pad);
      oscillator.start();
      nodes.push(oscillator);
    });
    nodes.push(pad);

    // LFO de filtro: evita que el pad suene congelado.
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = Math.min(1200, preset.brightness * 0.28);
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    nodes.push(lfo, lfoGain);

    // Textura: ruido filtrado, presente en los paisajes con más "aire".
    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i += 1) noiseData[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const noiseFilter = context.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 900;
    noiseFilter.Q.value = 0.6;
    const noiseGain = context.createGain();
    noiseGain.gain.value = 0.05;
    noise.connect(noiseFilter).connect(noiseGain).connect(master);
    noiseGain.connect(reverb);
    noise.start();
    nodes.push(noise, noiseFilter, noiseGain);

    return { nodes, master, filter, pad, reverb, reverbGain };
  };

  const playVoice = (preset, frequency, duration, gainValue) => {
    const context = state.context;
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = preset.wave === "sawtooth" ? "triangle" : preset.wave;
    oscillator.frequency.value = frequency;
    const now = context.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(state.filter || state.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  };

  const scheduler = () => {
    const preset = state.preset;
    const context = state.context;
    if (!preset || !context || !state.playing) return;
    const beat = 60 / preset.tempo;
    const lookahead = 0.8;
    while (state.nextNote < context.currentTime + lookahead) {
      const step = state.step;
      const density = preset.density;
      // Arpegio pentatónico sobre el pad: siempre consonante, nunca mecánico.
      if (step % 2 === 0 && Math.random() < density) {
        playVoice(preset, noteFrequency(preset, (step * 3) % 12), beat * 1.6, 0.05 + density * 0.05);
      }
      if (step % 8 === 4 && Math.random() < density * 0.8) {
        playVoice(preset, noteFrequency(preset, 2 + (step % 5)), beat * 2.4, 0.04);
      }
      state.step += 1;
      state.nextNote += beat / 2;
    }
  };

  const fade = (master, target, seconds) => {
    if (!state.context || !master) return;
    const now = state.context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
    master.gain.linearRampToValueAtTime(Math.max(0.0001, target), now + seconds);
  };

  const stop = () => {
    window.clearInterval(state.timer);
    state.timer = null;
    state.playing = false;
    const context = state.context;
    const nodes = state.nodes;
    fade(state.master, 0.0001, 0.6);
    window.setTimeout(() => {
      nodes.forEach((node) => { try { node.stop && node.stop(); node.disconnect(); } catch { /* nodo ya detenido */ } });
      if (context && context.state !== "closed") context.close().catch(() => {});
    }, 700);
    state.context = null;
    state.nodes = [];
    state.master = null;
    state.filter = null;
    state.analyser = null;
  };

  const start = (preset, volume) => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    stop();
    const context = new AudioContextClass();
    state.context = context;
    state.preset = preset;
    const graph = buildGraph(context, preset, context.destination);
    state.nodes = graph.nodes;
    state.master = graph.master;
    state.filter = graph.filter;
    state.analyser = context.createAnalyser();
    state.analyser.fftSize = 512;
    graph.master.connect(state.analyser);
    state.nextNote = context.currentTime + 0.12;
    state.step = 0;
    state.playing = true;
    state.reverbGain = graph.reverbGain;
    graph.master.gain.value = 0.0001;
    graph.master.gain.linearRampToValueAtTime(Math.min(MAX_GAIN, volume), context.currentTime + 1.4);
    state.timer = window.setInterval(scheduler, 90);
    scheduler();
    return true;
  };

  /* ------------------------------------------------------------ exportar */

  const encodeWav = (buffer) => {
    const channels = buffer.numberOfChannels;
    const length = buffer.length * channels * 2 + 44;
    const view = new DataView(new ArrayBuffer(length));
    const writeString = (offset, value) => {
      for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
    };
    writeString(0, "RIFF");
    view.setUint32(4, length - 8, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length - 44, true);
    let offset = 44;
    for (let channel = 0; channel < channels; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i += 1) {
        const sample = Math.max(-1, Math.min(1, data[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }
    return new Blob([view], { type: "audio/wav" });
  };

  const renderWav = async (preset, seconds = 30) => {
    const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OfflineContext) throw new Error("unsupported");
    const context = new OfflineContext(2, Math.round(44100 * seconds), 44100);
    const graph = buildGraph(context, preset, context.destination);
    graph.master.gain.setValueAtTime(0.0001, 0);
    graph.master.gain.linearRampToValueAtTime(0.18, 2);
    graph.master.gain.setValueAtTime(0.18, seconds - 3);
    graph.master.gain.linearRampToValueAtTime(0.0001, seconds);
    // Arpegio determinista para que el WAV sea reproducible.
    const beat = 60 / preset.tempo;
    let time = 0.5;
    let step = 0;
    while (time < seconds - 1.5) {
      if (step % 2 === 0) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = preset.wave === "sawtooth" ? "triangle" : preset.wave;
        oscillator.frequency.value = noteFrequency(preset, (step * 3) % 12);
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(0.07, time + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + beat * 1.4);
        oscillator.connect(gain).connect(graph.filter);
        oscillator.start(time);
        oscillator.stop(time + beat * 1.6);
      }
      step += 1;
      time += beat / 2;
    }
    const rendered = await context.startRendering();
    return encodeWav(rendered);
  };

  /* ----------------------------------------------------------------- vista */

  const mount = (container) => {
    if (!container || container.dataset.mounted === "true") return;
    container.dataset.mounted = "true";
    const presets = (content && content.tools && content.tools.soundPresets) || [];
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    const shell = el("div", "studio");
    const toolbar = el("div", "studio-toolbar");
    const playButton = el("button", "button button-primary", t("musicPlay"));
    playButton.type = "button";
    playButton.setAttribute("aria-pressed", "false");
    const renderButton = el("button", "button button-ghost", t("musicRender"));
    renderButton.type = "button";

    const presetLabel = el("label", "studio-field");
    presetLabel.append(el("span", "", t("musicPreset", "Paisaje")));
    const presetSelect = document.createElement("select");
    presets.forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = `${preset.name} · ${preset.mood}`;
      presetSelect.append(option);
    });
    presetLabel.append(presetSelect);

    const volumeLabel = el("label", "studio-field");
    volumeLabel.append(el("span", "", t("musicVolume", "Volumen")));
    const volume = document.createElement("input");
    volume.type = "range";
    volume.min = "0";
    volume.max = "70";
    volume.value = "38";
    volume.step = "2";
    volumeLabel.append(volume, el("output", "studio-output", "38%"));

    toolbar.append(playButton, presetLabel, volumeLabel, renderButton);

    const sliders = el("div", "studio-sliders");
    const controlDefs = [
      { key: "tempo", label: t("musicTempo", "Tempo"), min: 50, max: 120, step: 2, unit: " BPM" },
      { key: "brightness", label: t("musicBrightness", "Brillo"), min: 800, max: 7000, step: 100, unit: " Hz" },
      { key: "density", label: t("musicDensity", "Densidad"), min: 0.1, max: 0.95, step: 0.05, unit: "" },
      { key: "reverb", label: t("musicReverb", "Espacio"), min: 0.1, max: 0.9, step: 0.05, unit: "" }
    ];
    const controls = {};
    controlDefs.forEach((definition) => {
      const label = el("label", "studio-field");
      label.append(el("span", "", definition.label));
      const input = document.createElement("input");
      input.type = "range";
      input.min = String(definition.min);
      input.max = String(definition.max);
      input.step = String(definition.step);
      const output = el("output", "studio-output", "");
      label.append(input, output);
      controls[definition.key] = { input, output, unit: definition.unit };
      sliders.append(label);
    });

    const canvas = document.createElement("canvas");
    canvas.className = "studio-canvas";
    canvas.width = 640;
    canvas.height = 160;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Visualización de la señal sonora generada");

    const status = el("p", "studio-status", t("musicNote"));
    status.setAttribute("aria-live", "polite");
    shell.append(toolbar, sliders, canvas, status);
    container.replaceChildren(shell);

    const currentPreset = () => {
      const found = presets.find((preset) => preset.id === presetSelect.value) || presets[0];
      return { ...found };
    };

    const readControls = () => {
      const base = currentPreset();
      Object.entries(controls).forEach(([key, control]) => { base[key] = Number(control.input.value); });
      return base;
    };

    const syncControls = () => {
      const preset = currentPreset();
      Object.entries(controls).forEach(([key, control]) => {
        control.input.value = String(preset[key]);
        control.output.textContent = `${preset[key]}${control.unit}`;
      });
    };

    const draw = (analyser) => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const reduced = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
      const render = () => {
        const width = canvas.width;
        const height = canvas.height;
        context.clearRect(0, 0, width, height);
        context.fillStyle = "rgba(6, 22, 31, 0.9)";
        context.fillRect(0, 0, width, height);
        context.strokeStyle = "#63d8c7";
        context.lineWidth = 2;
        context.beginPath();
        if (analyser) {
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data);
          const bars = 48;
          const step = Math.floor(data.length / bars);
          for (let i = 0; i < bars; i += 1) {
            let sum = 0;
            for (let j = 0; j < step; j += 1) sum += data[i * step + j];
            const value = (sum / step) / 255;
            const barHeight = Math.max(3, value * height * 0.92);
            context.fillStyle = i % 3 === 0 ? "#f4c64e" : "#63d8c7";
            context.fillRect(i * (width / bars) + 2, height - barHeight, width / bars - 3, barHeight);
          }
        } else {
          context.moveTo(0, height / 2);
          for (let x = 0; x < width; x += 8) {
            context.lineTo(x, height / 2 + Math.sin(x / 26) * 10);
          }
          context.stroke();
        }
        if (!reduced && state.playing) state.frame = window.requestAnimationFrame(render);
      };
      window.cancelAnimationFrame(state.frame);
      render();
    };

    const refreshUi = () => {
      playButton.textContent = state.playing ? t("musicStop") : t("musicPlay");
      playButton.setAttribute("aria-pressed", String(state.playing));
      renderButton.disabled = false;
    };

    playButton.addEventListener("click", () => {
      if (state.playing) {
        stop();
        refreshUi();
        status.textContent = t("musicNote");
        draw(null);
        return;
      }
      if (!AudioContextClass) {
        status.textContent = t("musicUnsupported");
        playButton.disabled = true;
        return;
      }
      const preset = readControls();
      const ok = start(preset, Number(volume.value) / 100);
      if (!ok) {
        status.textContent = t("musicUnsupported");
        return;
      }
      refreshUi();
      status.textContent = `${preset.name} · ${t("musicNote")}`;
      draw(state.analyser);
    });

    presetSelect.addEventListener("change", () => {
      syncControls();
      if (state.playing) {
        const preset = readControls();
        start(preset, Number(volume.value) / 100);
        draw(state.analyser);
      }
    });

    volume.addEventListener("input", () => {
      volumeLabel.querySelector("output").textContent = `${volume.value}%`;
      if (state.master && state.context) {
        state.master.gain.setTargetAtTime((Number(volume.value) / 100) * MAX_GAIN, state.context.currentTime, 0.15);
      }
    });

    Object.entries(controls).forEach(([key, control]) => {
      control.input.addEventListener("input", () => {
        control.output.textContent = `${control.input.value}${control.unit}`;
        if (!state.playing || !state.context) return;
        const preset = readControls();
        state.preset = preset;
        if (key === "brightness" && state.filter) state.filter.frequency.setTargetAtTime(preset.brightness, state.context.currentTime, 0.2);
        if (key === "reverb" && state.reverbGain) {
          state.reverbGain.gain.setTargetAtTime(preset.reverb * 0.5, state.context.currentTime, 0.2);
        }
      });
    });

    renderButton.addEventListener("click", async () => {
      renderButton.disabled = true;
      status.textContent = t("musicRendering");
      try {
        const blob = await renderWav(readControls(), 30);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `charco-${presetSelect.value}-30s.wav`;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 20000);
        status.textContent = t("musicRendered");
      } catch {
        status.textContent = t("musicUnsupported");
      } finally {
        renderButton.disabled = false;
      }
    });

    window.addEventListener("pagehide", () => {
      window.cancelAnimationFrame(state.frame);
      if (state.playing) stop();
    }, { once: true });

    syncControls();
    draw(null);
  };

  return Object.freeze({ mount, start, stop, renderWav, isPlaying: () => state.playing, version: "1.0.0" });
})();
