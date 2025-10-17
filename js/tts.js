/* js/tts.js
   Web Speech Synthesis helper for Sori
   Exposes: window.SoriTTS
*/
(function () {
  const synth = window.speechSynthesis;
  const supported = !!synth && "SpeechSynthesisUtterance" in window;

  let voices = [];
  let readyResolve;
  const ready = new Promise(res => { readyResolve = res; });

  // State
  const state = {
    rate: 0.75,
    pitch: 1.0,
    volume: 1.0,
    lang: "ko-KR",
    speaking: false,
    queue: []
  };

  // Load voices (handles Chrome/Safari async loading)
  function loadVoices() {
    try {
      voices = synth.getVoices ? synth.getVoices() || [] : [];
      if (voices.length > 0) readyResolve(true);
    } catch (_) {}
  }
  if (supported) {
    loadVoices();
    try {
      synth.onvoiceschanged = () => {
        loadVoices();
        readyResolve(true);
      };
    } catch (_) {}
    // Fallback timer in case onvoiceschanged doesn't fire
    const t = setInterval(() => {
      if (voices.length > 0) { clearInterval(t); readyResolve(true); }
      else loadVoices();
    }, 300);
    setTimeout(() => clearInterval(t), 5000);
  } else {
    readyResolve(false);
  }

  // Pick a Korean voice with sensible priority
  function pickKoVoice() {
    if (!voices || voices.length === 0) return null;
    const by = (fn) => voices.filter(fn);
    const exact = by(v => v.lang === "ko-KR" || v.lang === "ko_KR");
    const starts = by(v => v.lang && v.lang.startsWith("ko"));
    const nameHit = by(v => (v.name || "").toLowerCase().includes("korean") || (v.name || "").includes("한국"));
    return exact[0] || starts[0] || nameHit[0] || null;
  }

  // Speak helper
  function createUtterance(text, opts = {}) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = opts.lang || state.lang;
    u.rate = clampNumber(opts.rate ?? state.rate, 0.3, 1.5);
    u.pitch = clampNumber(opts.pitch ?? state.pitch, 0.5, 2.0);
    u.volume = clampNumber(opts.volume ?? state.volume, 0, 1);
    const v = pickKoVoice();
    if (v) u.voice = v;
    return u;
  }

  function clampNumber(n, min, max) {
    n = Number(n);
    if (Number.isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function cancel() {
    if (!supported) return;
    try { synth.cancel(); } catch (_) {}
    state.speaking = false;
    state.queue = [];
  }

  function speakKo(text, opts = {}) {
    if (!supported) {
      if (typeof opts.onError === "function") opts.onError(new Error("Speech Synthesis not supported"));
      return;
    }
    if (!text || !text.trim()) return;

    // Safari occasionally needs a cancel before speak to avoid queue lock
    try { synth.cancel(); } catch (_) {}

    const u = createUtterance(text, opts);
    u.onerror = (e) => {
      state.speaking = false;
      if (typeof opts.onError === "function") opts.onError(e);
    };
    u.onend = () => {
      state.speaking = false;
      if (typeof opts.onEnd === "function") opts.onEnd();
      // Play next in queue
      const next = state.queue.shift();
      if (next) speakKo(next.text, next.opts);
    };

    state.speaking = true;
    try { synth.speak(u); } catch (e) {
      state.speaking = false;
      if (typeof opts.onError === "function") opts.onError(e);
    }
  }

  function enqueue(text, opts = {}) {
    state.queue.push({ text, opts });
    if (!state.speaking) {
      const first = state.queue.shift();
      speakKo(first.text, first.opts);
    }
  }

  function setRate(rate) { state.rate = clampNumber(rate, 0.3, 1.5); }
  function getRate() { return state.rate; }
  function setPitch(pitch) { state.pitch = clampNumber(pitch, 0.5, 2.0); }
  function setVolume(v) { state.volume = clampNumber(v, 0, 1); }
  function isSupported() { return supported; }
  function getVoices() { return voices.slice(); }

  // Public API
  window.SoriTTS = {
    ready,                 // Promise<boolean>
    isSupported,           // () => boolean
    speakKo,               // (text, opts) => void
    enqueue,               // (text, opts) => void
    cancel,                // () => void
    setRate, getRate,      // rate helpers
    setPitch, setVolume,   // voice controls
    getVoices,             // debug or UI list
    pickKoVoice,           // returns a Voice or null
  };
})();
