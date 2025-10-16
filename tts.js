// tts.js
(function(){
  function pickKoreanVoice(voices){
    return voices.find(v =>
      v.lang && v.lang.includes('ko') &&
      (v.name.includes('Yuna') || v.name.includes('Sora') ||
       v.name.includes('Female') || v.name.includes('여성'))
    ) || voices.find(v =>
      v.lang && (v.lang === 'ko-KR' || v.lang === 'ko_KR' || v.lang.startsWith('ko-'))
    ) || null;
  }

  function speakText(txt, rate){
    const synth = window.speechSynthesis;
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = 'ko-KR';
      u.rate = rate;
      u.pitch = 1.0;
      u.volume = 1.0;
      const voices = synth.getVoices();
      const koVoice = pickKoreanVoice(voices);
      if (koVoice) u.voice = koVoice;
      u.onerror = (e) => { console.error('Speech error:', e); window.SoriState.showError('⚠️ Speech failed. Please try again.'); };
      synth.speak(u);
    }, 200);
  }

  function playCurrent(){
    const st = window.SoriState.st;
    const list = window.SoriApp.getCurrentList();
    const current = list[st.i];
    const txt = current.k;

    if (!('speechSynthesis' in window)) {
      window.SoriState.showError('⚠️ Your browser does not support text-to-speech. Try Chrome, Safari, or Edge.');
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    let voices = synth.getVoices();
    if (voices.length === 0) {
      synth.onvoiceschanged = () => {
        voices = synth.getVoices();
        speakText(txt, st.spd);
      };
    } else {
      speakText(txt, st.spd);
    }

    // repetition
    if ((st.repCount || 0) < 5) {
      st.repCount = (st.repCount || 0) + 1;
      window.SoriApp.updateRepetitionDisplay();
      if (st.repCount >= 5) window.SoriApp.autoNext();
    }
  }

  window.SoriTTS = { playCurrent };
})();
