/* One cancellable cloud-audio player shared by lessons and quiz. */
(function () {
  window.SORI = window.SORI || {};
  const endpoint = 'https://asia-northeast3-sori-tts.cloudfunctions.net/tts';
  const recordings = new Map([
  [
    "주문 도와드릴게요. 뭐 드릴까요?",
    "cafe-cue-1"
  ],
  [
    "아메리카노 한 잔, 주세요.",
    "cafe-reply-1"
  ],
  [
    "얼음은 얼마나 넣어 드릴까요?",
    "cafe-cue-2"
  ],
  [
    "얼음은 빼 주세요.",
    "cafe-reply-2"
  ],
  [
    "드시고 가세요?",
    "cafe-cue-3"
  ],
  [
    "포장할게요.",
    "cafe-reply-3"
  ],
  [
    "오늘 귤이 맛있어요.",
    "market-cue-1"
  ],
  [
    "맛 좀 봐도 돼요?",
    "market-reply-1"
  ],
  [
    "하나 드셔 보세요.",
    "market-cue-2"
  ],
  [
    "얼마예요?",
    "market-reply-2"
  ],
  [
    "한 봉지에 오천 원이에요. 어떻게 결제하시겠어요?",
    "market-cue-3"
  ],
  [
    "카드로 결제할게요.",
    "market-reply-3"
  ],
  [
    "몇 분이세요?",
    "restaurant-cue-1"
  ],
  [
    "두 명이에요.",
    "restaurant-reply-1"
  ],
  [
    "메뉴 보셨어요?",
    "restaurant-cue-2"
  ],
  [
    "추천 메뉴가 있나요?",
    "restaurant-reply-2"
  ],
  [
    "식사 맛있게 하셨어요?",
    "restaurant-cue-3"
  ],
  [
    "계산서 부탁드려요.",
    "restaurant-reply-3"
  ],
  [
    "안 매운 걸로, 주세요.",
    "mild"
  ],
  [
    "지하철역이 어디예요?",
    "subway"
  ],
  [
    "한국에 왜 오셨어요?",
    "airport-cue-1"
  ],
  [
    "관광하러 왔습니다.",
    "airport-reply-1"
  ],
  [
    "얼마나 머무르실 거예요?",
    "airport-cue-2"
  ],
  [
    "일주일 머물 예정입니다.",
    "airport-reply-2"
  ],
  [
    "더 필요한 것이 있으세요?",
    "airport-cue-3"
  ],
  [
    "공항버스는 어디에서 타요?",
    "airport-reply-3"
  ],
  [
    "어서 오세요. 예약하셨어요?",
    "hotel-cue-1"
  ],
  [
    "예약했어요. 체크인 하고 싶어요.",
    "hotel-reply-1"
  ],
  [
    "객실 안내해 드릴게요.",
    "hotel-cue-2"
  ],
  [
    "와이파이 비밀번호가 뭐예요?",
    "hotel-reply-2"
  ],
  [
    "객실에 필요한 게 있으세요?",
    "hotel-cue-3"
  ],
  [
    "수건을 더 가져다 주세요.",
    "hotel-reply-3"
  ],
  [
    "무엇을 도와드릴까요?",
    "transport-cue-1"
  ],
  [
    "교통카드 있으세요?",
    "transport-cue-2"
  ],
  [
    "교통카드 충전하고 싶어요.",
    "transport-reply-2"
  ],
  [
    "또 궁금한 점 있으세요?",
    "transport-cue-3"
  ],
  [
    "막차가 몇 시예요?",
    "transport-reply-3"
  ],
  [
    "어서 오세요. 편하게 구경하세요.",
    "shopping-cue-1"
  ],
  [
    "입어봐도 될까요?",
    "shopping-reply-1"
  ],
  [
    "사이즈는 괜찮으세요?",
    "shopping-cue-2"
  ],
  [
    "이거 다른 사이즈 있어요?",
    "shopping-reply-2"
  ],
  [
    "결제 도와드릴게요.",
    "shopping-cue-3"
  ],
  [
    "영수증 주세요.",
    "shopping-reply-3"
  ],
  [
    "필요하신 거 있으세요?",
    "convenience-cue-1"
  ],
  [
    "생수 한 병 주세요.",
    "convenience-reply-1"
  ],
  [
    "도시락도 구매하셨네요.",
    "convenience-cue-2"
  ],
  [
    "이거 데워 주실 수 있어요?",
    "convenience-reply-2"
  ],
  [
    "더 필요한 것 있으세요?",
    "convenience-cue-3"
  ],
  [
    "일회용 수저 좀 주세요.",
    "convenience-reply-3"
  ],
  [
    "뭐 드릴까요?",
    "street-food-cue-1"
  ],
  [
    "어묵 두 꼬치 주세요.",
    "street-food-reply-1"
  ],
  [
    "떡볶이도 드릴까요?",
    "street-food-cue-2"
  ],
  [
    "덜 매운 떡볶이 있어요?",
    "street-food-reply-2"
  ],
  [
    "드시고 가세요? 포장하세요?",
    "street-food-cue-3"
  ],
  [
    "포장 용기로 부탁해요.",
    "street-food-reply-3"
  ],
  [
    "화장품 찾으세요?",
    "department-cue-1"
  ],
  [
    "테스터 사용해 봐도 될까요?",
    "department-reply-1"
  ],
  [
    "이 옷도 보시겠어요?",
    "department-cue-2"
  ],
  [
    "사이즈 교환 가능해요?",
    "department-reply-2"
  ],
  [
    "선물이세요?",
    "department-cue-3"
  ],
  [
    "선물 포장 가능할까요?",
    "department-reply-3"
  ],
  [
    "안녕하세요! 처음 뵙겠습니다.",
    "social-cue-1"
  ],
  [
    "만나서 반가워요.",
    "social-reply-1"
  ],
  [
    "오늘 같이 영화 볼까요?",
    "social-cue-2"
  ],
  [
    "미안하지만, 오늘은 어려워요.",
    "social-reply-2"
  ],
  [
    "그럼 다음에 봐요.",
    "social-cue-3"
  ],
  [
    "내일 시간, 괜찮으세요?",
    "social-reply-3"
  ],
  [
    "괜찮으세요?",
    "help-cue-1"
  ],
  [
    "길을 잃었어요.",
    "help-reply-1"
  ],
  [
    "무슨 일이 있었어요?",
    "help-cue-2"
  ],
  [
    "지갑을 잃어버렸어요.",
    "help-reply-2"
  ],
  [
    "제가 도와드릴까요?",
    "help-cue-3"
  ],
  [
    "도와주셔서 감사합니다.",
    "help-reply-3"
  ]
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
