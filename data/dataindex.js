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
    // 구(舊) 형식: { base:[...], plus:[...] }
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

  // ---- source read (새 구조: window.SORI_DATA.<cat>) ----
  var SD = window.SORI_DATA || {};
  var dailySrc  = asArray(SD.daily);
  var travelSrc = asArray(SD.travel);
  var dramaSrc  = asArray(SD.drama);

  // ---- normalize ----
  var daily  = norm(dailySrc,  "daily");
  var travel = norm(travelSrc, "travel");
  var drama  = norm(dramaSrc,  "drama");

  // ---- publish main index ----
  window.SoriDataIndex = { daily: daily, travel: travel, drama: drama };

  // ---- subcategory & icon defaults (app.js가 읽는 이름) ----
  if (!window.SoriSubCategories) {
    window.SoriSubCategories = {
      daily:  uniqTruthies(daily .map(function(x){ return x.sub; })),
      travel: uniqTruthies(travel.map(function(x){ return x.sub; })),
      drama:  []
    };
  }
  if (!window.SoriSubIcons) {
    window.SoriSubIcons = {
      // Daily
      Greeting:"👋", Cafe:"☕", Restaurant:"🍽️", Shopping:"🛍️", Health:"💊",
      Social:"👥", Work:"💼", Tech:"🖥️", Exercise:"🏃",
      // Travel
      Airport:"✈️", Hotel:"🏨", Transport:"🚇", Emergency:"🆘", Convenience:"🏪",
      "Street Food":"🌭", Market:"🧺", "Duty Free":"🛂", Department:"🏬",
      "Food Court":"🥢", Payment:"💳", Delivery:"📦", Sightseeing:"📍"
    };
  }

  // ---- log ----
  console.log("[SoriDataIndex ready]", {
    daily: daily.length, travel: travel.length, drama: drama.length
  });
})();
