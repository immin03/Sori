/* One cancellable cloud-audio player shared by lessons and quiz. */
(function () {
  window.SORI = window.SORI || {};
  const endpoint = 'https://asia-northeast3-sori-tts.cloudfunctions.net/tts';
  const recordings = new Map([
    ["주문 도와드릴게요. 뭐 드릴까요?", "cafe-cue-1"],
    ["아메리카노 한 잔, 주세요.", "cafe-reply-1"],
    ["얼음은 얼마나 넣어 드릴까요?", "cafe-cue-2"],
    ["얼음은 빼 주세요.", "cafe-reply-2"],
    ["드시고 가세요?", "cafe-cue-3"],
    ["포장할게요.", "cafe-reply-3"],
    ["오늘 귤이 맛있어요.", "market-cue-1"],
    ["맛 좀 봐도 돼요?", "market-reply-1"],
    ["하나 드셔 보세요.", "market-cue-2"],
    ["얼마예요?", "market-reply-2"],
    ["한 봉지에 오천 원이에요. 어떻게 결제하시겠어요?", "market-cue-3"],
    ["카드로 결제할게요.", "market-reply-3"],
    ["몇 분이세요?", "restaurant-cue-1"],
    ["두 명이에요.", "restaurant-reply-1"],
    ["메뉴 보셨어요?", "restaurant-cue-2"],
    ["추천 메뉴가 있나요?", "restaurant-reply-2"],
    ["식사 맛있게 하셨어요?", "restaurant-cue-3"],
    ["계산서 부탁드려요.", "restaurant-reply-3"],
    ["안 매운 걸로, 주세요.", "mild"],
    ["지하철역이 어디예요?", "subway"]
  ]);
  let active = null;
  const cache=new Map();let cacheBytes=0;
  function remember(text,blob){if(blob.size>2*1024*1024)return;cache.set(text,blob);cacheBytes+=blob.size;while(cache.size>32||cacheBytes>8*1024*1024){const key=cache.keys().next().value;cacheBytes-=cache.get(key).size;cache.delete(key);}}
  const clamp = rate => Math.max(0.6,Math.min(1,Number(rate)||0.8));
  const aborted = () => Object.assign(new Error('Playback cancelled'),{name:'AbortError'});
  function cancel() { if (active) active.finish(aborted()); }
  function speak(text,{rate=0.8,onPlaying}={}) {
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
      audio.preservesPitch=true;
      audio.onended=()=>session.finish();
      audio.onerror=()=>session.finish(new Error('Audio could not be decoded'));
      (async () => {
        try {
          const key=String(text).trim(),file=recordings.get(key);
          if(file){
            audio.src='assets/audio/speaking/'+file+'.mp3';
            await audio.play();
            if(!done && typeof onPlaying==='function')onPlaying();
            return;
          }
          let blob=cache.get(key);
          if(blob){cache.delete(key);cache.set(key,blob);}else{
            const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:key}),signal:controller.signal});
            if (done) return;
            if (!response.ok) throw new Error('Audio request failed: '+response.status);
            blob=await response.blob();
          }
          if (done) return;
          if (!blob.size || /^(text\/|application\/json)/i.test(blob.type)) throw new Error('Invalid audio response');
          if(!cache.has(key))remember(key,blob);
          url=URL.createObjectURL(blob); audio.src=url;
          await audio.play(); // completion is onended, not the start of playback
          if(!done&&typeof onPlaying==='function')onPlaying();
        } catch(error) { session.finish(error); }
      })();
    });
  }
  window.SORI.TTS={speak,cancel,setRate(rate){if(active)active.audio.playbackRate=clamp(rate);}};
})();
