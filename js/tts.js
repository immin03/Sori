// helper to speak Korean text using Web Speech API
function speakText(txt, rate) {
  const synth = window.speechSynthesis;
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('SpeechSynthesis not supported'));
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'ko-KR';
    u.rate = rate || 0.75;
    u.pitch = 1.0;
    u.volume = 1.0;

    // pick a Korean voice if present
    const setVoice = () => {
      const voices = synth.getVoices();
      const koVoice = voices.find(v =>
        v.lang && (v.lang === 'ko-KR' || v.lang === 'ko_KR' || v.lang.startsWith('ko-') || v.name.includes('Korean') || v.name.includes('한국'))
      );
      if (koVoice) u.voice = koVoice;
      synth.speak(u);
    };

    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = setVoice;
    } else {
      setVoice();
    }

    u.onerror = (e) => reject(e.error || e);
    u.onend = () => resolve();
  });
}
