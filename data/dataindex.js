/* data/dataindex.js — merge + id normalize + sub filters/icons */
(function () {
  // 개별 파일이 노출하는 전역 이름 가정:
  // window.DAILY_DATA = [{k,e,p,t,c,sub}, ...]
  // window.TRAVEL_DATA = [...]
  // window.DRAMA_DATA  = [...]

  const daily  = Array.isArray(window.DAILY_DATA)  ? window.DAILY_DATA  : (window.SORI_DATA?.daily  || []);
  const travel = Array.isArray(window.TRAVEL_DATA) ? window.TRAVEL_DATA : (window.SORI_DATA?.travel || []);
  const drama  = Array.isArray(window.DRAMA_DATA)  ? window.DRAMA_DATA  : (window.SORI_DATA?.drama  || []);

  // 안전한 id 생성기 (카테고리+문장 기반)
  function makeId(cat, obj, idx) {
    const base = `${cat}:${(obj.k || "").trim()}|${(obj.e || "").trim()}`;
    // 간단 해시
    let h = 0;
    for (let i = 0; i < base.length; i++) {
      h = ((h << 5) - h) + base.charCodeAt(i);
      h |= 0;
    }
    return `${cat}:${Math.abs(h)}:${idx}`;
  }

  function normalize(cat, arr) {
    return (arr || []).map((o, i) => {
      const n = { ...o };
      if (!n.id) n.id = makeId(cat, n, i);
      // UI에서 기대하는 필드 기본값
      if (!n.t)   n.t = n.sub || cat;     // 뱃지 텍스트
      if (!n.c)   n.c = n.ctx || "";      // context
      if (!n.p)   n.p = n.pron || "";     // 발음 힌트
      if (!n.sub) n.sub = null;           // 서브카테고리 없으면 null
      return n;
    });
  }

  const data = {
    daily:  normalize("daily",  daily),
    travel: normalize("travel", travel),
    drama:  normalize("drama",  drama),
  };

  // 서브필터/아이콘 (index/app에서 사용)
  const subCategories = {
    daily:  ['Greeting','Cafe','Restaurant','Shopping','Health','Social','Work','Tech','Exercise'],
    travel: ['Airport','Hotel','Transport','Emergency','Convenience','Street Food','Market','Duty Free','Department','Food Court','Payment','Delivery','Sightseeing'],
    drama:  [] // 드라마는 서브필터 없음
  };

  const subIcons = {
    'Greeting':'👋','Cafe':'☕','Restaurant':'🍽️','Shopping':'🛍️','Health':'💊','Social':'👥',
    'Work':'💼','Tech':'🖥️','Exercise':'🏃',
    'Airport':'✈️','Hotel':'🏨','Transport':'🚇','Emergency':'🆘',
    'Convenence':'🏪','Convenience':'🏪','Street Food':'🌭','Market':'🧺','Duty Free':'🛂','Department':'🏬',
    'Food Court':'🥢','Payment':'💳','Delivery':'📦','Sightseeing':'📍'
  };

  // 전역 노출 (app.js가 참조)
  window.SoriDataIndex = data;
  // 구(舊) 코드 호환
  window.SORI_DATA = Object.assign({}, window.SORI_DATA || {}, data);
  window.subCategories = subCategories;
  window.subIcons = subIcons;
})();
