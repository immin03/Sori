/* js/tts.js — Web Speech API wrapper (ko-KR) */
(function () {
  if (!window.SORI) window.SORI = {};
  const synth = window.speechSynthesis;

  async function waitForVoices() {
    if (!("speechSynthesis" in window)) return [];
    const have = synth.getVoices();
    if (have && have.length) return have;
    return new Promise((resolve) => {
      const on = () => {
        synth.onvoiceschanged = null;
        resolve(synth.getVoices() || []);
      };
      synth.onvoiceschanged = on;
      // 보이스 이벤트가 안 오는 브라우저 대비 타임아웃
      setTimeout(() => resolve(synth.getVoices() || []), 800);
    });
  }

  async function pickKoreanVoice() {
    const voices = await waitForVoices();
    // ko 우선, 다음은 이름에 korean/한국 포함
    return (
      voices.find(v => v.lang?.toLowerCase().startsWith("ko")) ||
      voices.find(v => (v.name || "").toLowerCase().includes("korean")) ||
      voices.find(v => (v.name || "").includes("한국")) ||
      null
    );
  }

  window.SORI.TTS = {
    /** speak(text, { rate }) -> Promise<void> */
    speak: async (text, opts = {}) => {
      return new Promise(async (resolve, reject) => {
        try {
          if (!("speechSynthesis" in window)) {
            return reject(new Error("speechSynthesis not supported"));
          }
          const rate = typeof opts.rate === "number" ? opts.rate : 0.75;

          // 중복 재생 방지
          try { synth.cancel(); } catch {}

          const u = new SpeechSynthesisUtterance(String(text || ""));
          u.lang = "ko-KR";
          u.rate = rate;

          const v = await pickKoreanVoice();
          if (v) u.voice = v;

          u.onerror = (e) => reject(e?.error || e);
          u.onend = () => resolve();

          synth.speak(u);
        } catch (e) {
          reject(e);
        }
      });
    },
    cancel: () => { try { synth.cancel(); } catch {} }
  };
})();
