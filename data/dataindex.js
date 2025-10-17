/* data/dataindex.js – normalize & merge (ES5 safe)
   모든 원본을 표준 스키마 {id,k,e,p,t,c,sub}로 통일해서 window.SoriDataIndex로 내보냅니다.
*/
(function () {
  function asArray(x) {
    if (Array.isArray(x)) return x;
    if (x && Array.isArray(x.data)) return x.data;
    return [];
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
      var k = pick(x, ["k", "ko", "korean", "kr", "text_ko", "kor"]);
      var e = pick(x, ["e", "en", "eng", "english", "text_en"]);
      var p = pick(x, ["p", "pron", "pronunciation", "roman", "romaja"]);
      var t = pick(x, ["t", "tag", "topic", "category"]);
      var c = pick(x, ["c", "context", "situation", "scene"]);
      var sub = pick(x, ["sub", "subCategory", "subcategory", "section", "group"]) || null;

      var id = x.id || (cat + ":" + (k || "") + "|" + (e || ""));
      out.push({ id: id, k: k, e: e, p: p, t: t || cat, c: c, sub: sub });
    }
    return out;
  }
  var dailySrc  = asArray(window.SoriDaily  || (window.SORI_DATA && window.SORI_DATA.daily));
  var travelSrc = asArray(window.SoriTravel || (window.SORI_DATA && window.SORI_DATA.travel));
  var dramaSrc  = asArray(window.SoriDrama  || (window.SORI_DATA && window.SORI_DATA.drama));

  var daily  = norm(dailySrc,  "daily");
  var travel = norm(travelSrc, "travel");
  var drama  = norm(dramaSrc,  "drama");

  window.SoriDataIndex = { daily: daily, travel: travel, drama: drama };

  function uniq(arr) {
    var seen = {}, res = [];
    for (var i = 0; i < arr.length; i++) {
      var v = arr[i];
      if (v && !seen[v]) { seen[v] = 1; res.push(v); }
    }
    return res;
  }
  if (!window.subCategories) {
    window.subCategories = {
      daily:  uniq(daily .map(function (x) { return x.sub; })),
      travel: uniq(travel.map(function (x) { return x.sub; })),
      drama:  []
    };
  }
  if (!window.subIcons) {
    window.subIcons = {
      // Daily
      Greeting:"👋", Cafe:"☕", Restaurant:"🍽️", Shopping:"🛍️", Health:"💊",
      Social:"👥", Work:"💼", Tech:"🖥️", Exercise:"🏃",
      // Travel
      Airport:"✈️", Hotel:"🏨", Transport:"🚇", Emergency:"🆘", Convenience:"🏪",
      "Street Food":"🌭", Market:"🧺", "Duty Free":"🛂", Department:"🏬",
      "Food Court":"🥢", Payment:"💳", Delivery:"📦", Sightseeing:"📍"
    };
  }
  console.log("[SoriDataIndex ready]", {
    daily: daily.length, travel: travel.length, drama: drama.length
  });
})();
