/* js/tts.js — 안정형 Web Speech TTS (브라우저 기본) */
(function () {
  if (!window.SORI) window.SORI = {};

  // ---- voices 로딩 보장 ----
  let voices = [];
  let voicesReadyResolve;
  const voicesReady = new Promise((res) => (voicesReadyResolve = res));

  function refreshVoices() {
    try {
      voices = window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : [];
      if (voices.length > 0 && voicesReadyResolve) {
        voicesReadyResolve(true);
        voicesReadyResolve = null;
      }
    } catch {}
  }

  // 일부 크롬/사파리는 onvoiceschanged가 늦게 옴
  if ('speechSynthesis' in window) {
    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;
    // 첫 호출 프리워밍 (iOS 사파리 대응)
    try { window.speechSynthesis.getVoices(); } catch {}
  }

  async function speak(text, opts = {}) {
    if (!('speechSynthesis' in window)) {
      throw new Error('TTS_NOT_SUPPORTED');
    }
    const rate = Math.max(0.3, Math.min(1.2, Number(opts.rate || 0.75)));

    // 사용자 제스처 뒤에 호출되도록 가볍게 yield (오디오 정책 회피)
    await Promise.resolve();

    // 목소리 준비 대기 (최대 1초)
    const timeout = new Promise((_, rej) =>
      setTimeout(() => rej(new Error('VOICES_TIMEOUT')), 1000)
    );
    try { await Promise.race([voicesReady, timeout]); } catch {}

    return new Promise((resolve, reject) => {
      try {
        window.speechSynthesis.cancel();

        const u = new SpeechSynthesisUtterance(String(text || ''));
        u.lang = 'ko-KR';
        u.rate = rate;

        // ko 우선, 없으면 기본
        const v =
          voices.find(v => /(^ko\b)|korean|한국/i.test(`${v.lang} ${v.name}`)) ||
          voices[0];
        if (v) u.voice = v;

        u.onend = () => resolve();
        u.onerror = (e) => reject(new Error(e?.error || 'AUDIO_PLAYBACK_FAILED'));

        window.speechSynthesis.speak(u);
      } catch (err) {
        reject(err);
      }
    });
  }

  window.SORI.TTS = { speak };
})();

