// Speech synthesis wrapper
(function () {
  window.SORI = window.SORI || {};

  let cachedVoices = [];
  let voicesReady = false;

  function loadVoices() {
    cachedVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    voicesReady = cachedVoices && cachedVoices.length > 0;
  }

  // Some browsers populate voices asynchronously
  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
  }

  function pickKoreanVoice() {
    if (!cachedVoices) return null;
    const direct = cachedVoices.find(v =>
      v.lang === 'ko-KR' || v.lang === 'ko_KR' || (v.lang && v.lang.startsWith('ko-'))
    );
    if (direct) return direct;
    // fallback: names containing hints
    return cachedVoices.find(v =>
      (v.name || '').toLowerCase().includes('korean') ||
      (v.name || '').includes('한국')
    ) || null;
  }

  function speak(text, opts = {}) {
    if (!('speechSynthesis' in window)) {
      throw new Error('SpeechSynthesis not supported');
    }
    const synth = window.speechSynthesis;
    synth.cancel();

    const u = new SpeechSynthesisUtterance(String(text || ''));
    u.lang = 'ko-KR';
    u.rate = typeof opts.rate === 'number' ? opts.rate : (window.SORI?.State?.get().spd ?? 0.75);
    u.pitch = typeof opts.pitch === 'number' ? opts.pitch : 1.0;
    u.volume = typeof opts.volume === 'number' ? opts.volume : 1.0;

    const v = pickKoreanVoice();
    if (v) u.voice = v;

    return new Promise((resolve, reject) => {
      u.onend = () => resolve(true);
      u.onerror = (e) => reject(e.error || e);
      // small timeout to reduce first-utter lag on some engines
      setTimeout(() => synth.speak(u), 150);
    });
  }

  function cancel() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  window.SORI.TTS = { speak, cancel, pickKoreanVoice, get voices() { return cachedVoices; }, get voicesReady() { return voicesReady; } };
})();
