// js/tts.js
let koFemaleVoice = null;

function getKoFemaleVoice() {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  if (!voices || voices.length === 0) return null;

  const preferred = ["Yuna", "Seoyeon", "Sora", "Narae", "Yuri", "Female"];
  const ko = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("ko-kr"));
  for (const name of preferred) {
    const f = ko.find(v => v.name && v.name.toLowerCase().includes(name.toLowerCase()));
    if (f) return f;
  }
  return ko[0] || null;
}

export function ensureKoVoiceReady(cb) {
  const synth = window.speechSynthesis;
  const tryPick = () => {
    koFemaleVoice = getKoFemaleVoice();
    if (koFemaleVoice) cb();
    else setTimeout(tryPick, 120);
  };

  if (synth.getVoices().length > 0) {
    tryPick();
  } else {
    synth.onvoiceschanged = () => { tryPick(); synth.onvoiceschanged = null; };
    setTimeout(tryPick, 400);
  }
}

export function speakKo(text, rate = 0.75) {
  const synth = window.speechSynthesis;
  const go = () => {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = rate;
    u.pitch = 1.05;
    u.volume = 1.0;
    if (koFemaleVoice) u.voice = koFemaleVoice;
    synth.speak(u);
  };
  if (!koFemaleVoice) ensureKoVoiceReady(go);
  else go();
}

// 사용자 첫 터치 후 보이스 로드 안정화
document.addEventListener("DOMContentLoaded", () => {
  const prime = () => {
    ensureKoVoiceReady(() => {});
    window.removeEventListener("touchstart", prime, { passive: true });
    window.removeEventListener("click", prime, { passive: true });
  };
  window.addEventListener("touchstart", prime, { passive: true });
  window.addEventListener("click", prime, { passive: true });
});
