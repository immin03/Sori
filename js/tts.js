/* js/tts.js – robust Web Speech wrapper */
(function () {
  if (!window.SORI) window.SORI = {};
  const TTS = {
    speak(text, { rate } = {}) {
      return new Promise((resolve, reject) => {
        try {
          if (!("speechSynthesis" in window)) {
            return reject(new Error("No speechSynthesis"));
          }
          const synth = window.speechSynthesis;
          try { synth.cancel(); } catch {}
          const u = new SpeechSynthesisUtterance(String(text || ""));
          u.lang = "ko-KR";
          u.rate = rate || 0.75;
          u.onerror = (e) => reject(e.error || e);
          u.onend = () => resolve();

          const speakNow = () => {
            const vs = synth.getVoices();
            const ko = vs.find(v =>
              (v.lang || "").toLowerCase().startsWith("ko") ||
              (v.name || "").toLowerCase().includes("korean") ||
              (v.name || "").includes("한국")
            );
            if (ko) u.voice = ko;
            synth.speak(u);
          };

          // 보이스가 늦게 로드되는 브라우저 대응
          if (synth.getVoices().length === 0) {
            synth.onvoiceschanged = () => {
              speakNow();
              synth.onvoiceschanged = null;
            };
            // 일부 브라우저에서 이벤트가 안 오는 경우 대비
            setTimeout(speakNow, 0);
          } else {
            speakNow();
          }
        } catch (e) {
          reject(e);
        }
      });
    },
  };
  window.SORI.TTS = TTS;
})();
