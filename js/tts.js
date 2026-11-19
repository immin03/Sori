/* One cancellable cloud-audio player shared by lessons and quiz. */
(function () {
  window.SORI = window.SORI || {};
  const endpoint = 'https://asia-northeast3-sori-tts.cloudfunctions.net/tts';
  let active = null;
  const clamp = rate => Math.max(0.6,Math.min(1,Number(rate)||0.8));
  const aborted = () => Object.assign(new Error('Playback cancelled'),{name:'AbortError'});
  function cancel() { if (active) active.finish(aborted()); }
  function speak(text,{rate=0.8}={}) {
    cancel();
    if (!String(text || '').trim()) return Promise.reject(new Error('Empty speech'));
    return new Promise((resolve,reject) => {
      const audio=new Audio(), controller=new AbortController();
      let url=null, done=false;
      const session={audio, finish(error) {
        if (done) return; done=true;
        clearTimeout(timer); controller.abort();
        audio.onended=null; audio.onerror=null;
        try { audio.pause(); } catch {}
        if (url) URL.revokeObjectURL(url);
        if (active===session) active=null;
        error ? reject(error) : resolve();
      }};
      active=session;
      const timer=setTimeout(() => session.finish(new Error('Audio timed out')),45000);
      audio.playbackRate=clamp(rate);
      audio.onended=()=>session.finish();
      audio.onerror=()=>session.finish(new Error('Audio could not be decoded'));
      (async () => {
        try {
          const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:String(text).trim()}),signal:controller.signal});
          if (done) return;
          if (!response.ok) throw new Error('Audio request failed: '+response.status);
          const blob=await response.blob();
          if (done) return;
          if (!blob.size || /^(text\/|application\/json)/i.test(blob.type)) throw new Error('Invalid audio response');
          url=URL.createObjectURL(blob); audio.src=url;
          await audio.play(); // completion is onended, not the start of playback
        } catch(error) { session.finish(error); }
      })();
    });
  }
  window.SORI.TTS={speak,cancel,setRate(rate){if(active)active.audio.playbackRate=clamp(rate);}};
})();
