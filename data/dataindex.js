/* data/dataindex.js – normalize & merge (2025-10)
   모든 카테고리 데이터를 app.js가 기대하는 형태로 통일:
   { id, k, e, p, t, c, sub }
*/

(function () {
  // 안전한 배열 화
  const A = (x) => (Array.isArray(x) ? x : Array.isArray(x?.data) ? x.data : []);

  // 들어오는 다양한 키들을 표준 키로 매핑
  function normItem(x = {}, idx = 0, cat = "") {
    const k =
      x.k ?? x.ko ?? x.korean ?? x.kr ?? x.text_ko ?? x.kor ?? "";
    const e =
      x.e ?? x.en ?? x.eng ?? x.english ?? x.text_en ?? "";
    const p =
      x.p ?? x.pron ?? x.pronunciation ?? x.roman ?? x.romaja ?? "";
    const t =
      x.t ?? x.tag ?? x.topic ?? x.category ?? cat || "";
    const c =
      x.c ?? x.context ?? x.situation ?? x.scene ?? "";
    const sub =
      x.sub ?? x.subCategory ?? x.subcategory ?? x.section ?? x.group ?? null;

    // id 없으면 안정적인 seed로 생성 (카테고리+한글+영문)
    let id = x.id;
    if (!id) id = `${cat}:${(k || "").trim()}|${(e || "").trim()}` || `${cat}:${idx}`;

    return { id, k, e, p, t, c, sub };
  }

  // 카테고리별 원본 배열 수집 (파일별 전역명 가정)
  const dailySrc  = A(window.SoriDaily  || window.SORI_DATA?.daily);
  const travelSrc = A(window.SoriTravel || window.SORI_DATA?.travel);
  const dramaSrc  = A(window.SoriDrama  || window.SORI_DATA?.drama);

  // 정규화
  const daily  = dailySrc .map((x, i) => normItem(x, i, "daily")).filter(x => x.k);
  const travel = travelSrc.map((x, i) => normItem(x, i, "travel")).filter(x => x.k);
  const drama  = dramaSrc .map((x, i) => normItem(x, i, "drama")).filter(x => x.k);

  // 전역 병합 (app.js는 window.SoriDataIndex를 읽어요)
  window.SoriDataIndex = { daily, travel, drama };

  // 서브카테고리 자동 생성 (없으면)
  function uniq(arr){ return [...new Set(arr.filter(Boolean))]; }
  window.subCategories = window.subCategories || {
    daily:  uniq(daily .map(x => x.sub)),
    travel: uniq(travel.map(x => x.sub)),
    drama:  [] // 드라마는 기본적으로 서브필터 숨김
  };

  // 아이콘 기본값(이미 있으면 유지)
  window.subIcons = window.subIcons || {
    // Daily
    Greeting:"👋", Cafe:"☕", Restaurant:"🍽️", Shopping:"🛍️", Health:"💊",
    Social:"👥", Work:"💼", Tech:"🖥️", Exercise:"🏃",
    // Travel
    Airport:"✈️", Hotel:"🏨", Transport:"🚇", Emergency:"🆘", Convenience:"🏪",
    "Street Food":"🌭", Market:"🧺", "Duty Free":"🛂", Department:"🏬",
    "Food Court":"🥢", Payment:"💳", Delivery:"📦", Sightseeing:"📍"
  };

  // 디버그
  console.log("[SoriDataIndex ready]", {
    daily:  daily.length,
    travel: travel.length,
    drama:  drama.length,
    subDaily:  window.subCategories.daily,
    subTravel: window.subCategories.travel
  });
})();
