/* data/dataindex.js – normalize & merge (ES5 safe)
   원본을 표준 스키마 {id,k,e,p,t,c,sub}로 통일해 window.SoriDataIndex 로 노출.
   - 소스 형식 지원: 배열 / {data:[...]} / {base:[...], plus:[...]}
*/
(function () {
  // ---- helpers ----
  function isArr(a){ return Object.prototype.toString.call(a)==='[object Array]'; }
  function asArray(x) {
    if (!x) return [];
    if (isArr(x)) return x.slice();
    if (x && isArr(x.data)) return x.data.slice();
    // 구 형식: { base:[...], plus:[...] }
    var out = [];
    if (x && isArr(x.base)) out = out.concat(x.base);
    if (x && isArr(x.plus)) out = out.concat(x.plus);
    return out;
  }
  function pick(obj, keys) {
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (obj && obj[k] != null) return obj[k];
    }
    return "";
  }
  function norm(list, cat) {
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var x = list[i] || {};
      var k   = pick(x, ["k","ko","korean","kr","text_ko","kor"]);
      var e   = pick(x, ["e","en","eng","english","text_en"]);
      var p   = pick(x, ["p","pron","pronunciation","roman","romaja"]);
      var t   = pick(x, ["t","tag","topic","category"]) || cat;
      var c   = pick(x, ["c","context","situation","scene"]);
      var sub = pick(x, ["sub","subCategory","subcategory","section","group"]) || null;

      var id = x.id || (cat + ":" + (k || "") + "|" + (e || ""));
      out.push({ id:id, k:k, e:e, p:p, t:t, c:c, sub:sub });
    }
    return out;
  }
  function uniqTruthies(arr) {
    var seen = {}, res = [];
    for (var i = 0; i < arr.length; i++) {
      var v = arr[i];
      if (v && !seen[v]) { seen[v]=1; res.push(v); }
    }
    return res;
  }
  // 주어진 선호 목록을 앞으로 당겨 정렬 (선호에 없는 값은 기존 순서 유지)
  function prioritize(list, firsts) {
    var i, set = {}, res = [];
    for (i = 0; i < firsts.length; i++) set[firsts[i]] = 1;
    // 1) 선호를 순서대로 집어넣되 실제 존재할 때만
    for (i = 0; i < firsts.length; i++) {
      if (list.indexOf(firsts[i]) !== -1) res.push(firsts[i]);
    }
    // 2) 나머지
    for (i = 0; i < list.length; i++) {
      var v = list[i];
      if (!set[v]) res.push(v);
    }
    return res;
  }

  // ---- source read (새 구조: window.SORI_DATA.<cat>) ----
  var SD = window.SORI_DATA || {};
  var dailySrc   = asArray(SD.daily);
  var travelSrc  = asArray(SD.travel);
  var dramaSrc   = asArray(SD.drama);
  var trendySrc  = asArray(SD.trendy); // 선택 소스

  // ---- normalize ----
  var daily   = norm(dailySrc,  "daily");
  var travel  = norm(travelSrc, "travel");
  var drama   = norm(dramaSrc,  "drama");
  var trendy  = norm(trendySrc, "trendy");

  // ---- publish main index ----
  window.SoriDataIndex = {
    daily:  daily,
    travel: travel,
    drama:  drama,
    trendy: trendy
  };

  // ---- 서브카테고리 목록 제공 (+ Love 최우선)
  var dailySubsRaw = uniqTruthies(daily.map(function(x){ return x.sub; }));
  var DAILY_PREF_ORDER = ["Love","Greeting","Cafe","Restaurant","Shopping","Health","Social","Work","Tech","Exercise"];
  var dailySubs = prioritize(dailySubsRaw, DAILY_PREF_ORDER);

  if (!window.SoriSubCategories) {
    window.SoriSubCategories = {
      daily:  dailySubs,
      travel: uniqTruthies(travel.map(function(x){ return x.sub; })),
      drama:  uniqTruthies(drama .map(function(x){ return x.sub; })),
      trendy: uniqTruthies(trendy.map(function(x){ return x.sub; }))
    };
  } else {
    // 이미 존재한다면 daily만 보강
    window.SoriSubCategories.daily = dailySubs;
  }

  // ---- 아이콘 (Love 추가)
  if (!window.SoriSubIcons) {
    window.SoriSubIcons = {
      Love:"❤️",
      Greeting:"👋", Cafe:"☕", Restaurant:"🍽️", Shopping:"🛍️", Health:"💊",
      Social:"👥", Work:"💼", Tech:"🖥️", Exercise:"🏃",
      Airport:"✈️", Hotel:"🏨", Transport:"🚇", Emergency:"🆘", Convenience:"🏪",
      "Street Food":"🌭", Market:"🧺", "Duty Free":"🛂", Department:"🏬",
      "Food Court":"🥢", Payment:"💳", Delivery:"📦", Sightseeing:"📍"
    };
  } else {
    window.SoriSubIcons.Love = window.SoriSubIcons.Love || "❤️";
  }

  // ---- 기본값(앱에서 참조용): daily는 Love부터
  if (!window.SoriDefaults) window.SoriDefaults = {};
  window.SoriDefaults.defaultSubByCategory = window.SoriDefaults.defaultSubByCategory || {};
  window.SoriDefaults.defaultSubByCategory.daily = "Love";

  // ---- log ----
  console.log("[SoriDataIndex ready]", {
    daily: daily.length, travel: travel.length, drama: drama.length, trendy: trendy.length,
    dailySubs: dailySubs
  });
})();
