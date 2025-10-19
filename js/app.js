/* js/app.js — 2025.10 Stable + Subfilters (fixed, add trendy) */
(function () {
  // ---------- 로컬 상태 ----------
  let currentCategory = "daily";
  let currentIndex = 0;
  let currentSub = null;
  let phrases = [];
  let savedList = [];

  // ---------- 엘리먼트 캐시 ----------
  const $ = (id) => document.getElementById(id);
  const els = {
    dailyBtn: $("dailyBtn"),
    travelBtn: $("travelBtn"),
    dramaBtn: $("dramaBtn"),
    trendyBtn: $("trendyBtn"),                  // ★ 추가
    savedBtn: $("savedBtn"),
    scrapBtn: $("scrapBtn"),
    badge: $("badge"),
    context: $("context"),
    korean: $("korean"),
    english: $("english"),
    pronunciation: $("pronunciation"),
    repDots: [].slice.call(document.querySelectorAll(".rep-dot")),
    repCount: $("repCount"),
    playBtn: $("playBtn"),
    nextBtn: $("nextBtn"),
    prevBtn: $("prevBtn"),
    prog: $("prog"),
    errorMsg: $("errorMsg"),
    speed: $("speed"),
    speedTxt: $("speedTxt"),
    congrats: $("congrats"),
    subFilters: $("subFilters"),
  };

  // ---------- 유틸 ----------
  const getAuthUser = () =>
    (window.firebase && firebase.auth && firebase.auth().currentUser) || null;

  // SoriDataIndex(정규화) 우선 → 없으면 원본 SORI_DATA
  const getAllData = () => window.SoriDataIndex || window.SORI_DATA || {};

  // 서브 카테고리 매핑(데이터에 없을 때 폴백)
  const SUBS = window.SoriSubCategories || {
    daily:  ['Greeting','Cafe','Restaurant','Shopping','Health','Social','Work','Tech','Exercise'],
    travel: ['Airport','Hotel','Transport','Emergency','Convenience','Street Food','Market','Duty Free','Department','Food Court','Payment','Delivery','Sightseeing'],
    trendy: ['Reaction','Emotion','Daily Talk','Online','Support & Life','Fun']  // ★ 추가
  };
  const ICONS = window.SoriSubIcons || {
    Greeting:'👋', Cafe:'☕', Restaurant:'🍽️', Shopping:'🛍️', Health:'💊', Social:'👥',
    Work:'💼', Tech:'🖥️', Exercise:'🏃',
    Airport:'✈️', Hotel:'🏨', Transport:'🚇', Emergency:'🆘',
    Convenience:'🏪', 'Street Food':'🌭', Market:'🧺', 'Duty Free':'🛂', Department:'🏬',
    'Food Court':'🥢', Payment:'💳', Delivery:'📦', Sightseeing:'📍'
    // Trendy는 아이콘 없음(요청 사항)
  };

  // 소문자+트림
  const norm = function(v){ return (v == null ? "" : String(v)).trim().toLowerCase(); };

  // ---------- 데이터 로딩/필터 ----------
  function rawFor(cat) {
    const all = getAllData();
    return all && all[cat] ? all[cat] : [];
  }

  function applyFilter() {
    if (currentCategory === "saved") return;

    const raw = rawFor(currentCategory) || [];
    const base = Array.isArray(raw)
      ? raw.slice()
      : (raw && Array.isArray(raw.data)) ? raw.data.slice() : [];

    if (!currentSub) {
      phrases = base;
    } else {
      const want = norm(currentSub);
      phrases = base.filter(function(p){ return norm(p.sub) === want; });
    }
    currentIndex = Math.min(currentIndex, Math.max(0, phrases.length - 1));
  }

  function loadData() {
    if (currentCategory === "saved") {
      const u = getAuthUser();
      if (!u) {
        showMessage("Please login to check your scraps.");
        phrases = [];
        setActiveTab("saved");
        renderScrapStar(null);
        return;
      }
      phrases = savedList.map(findPhraseById).filter(Boolean);
      currentIndex = 0;
      if (phrases.length === 0) {
        showMessage("No saved phrases yet.");
        return;
      }
    } else {
      applyFilter();
      if (phrases.length === 0) {
        showMessage("No items in this subcategory yet.");
        return;
      }
    }
    renderPhrase();
  }

  // ---------- 서브필터 UI ----------
  function rebuildSubFilters() {
    // saved/drama는 서브필터 비표시 (요구사항 유지)
    if (currentCategory === "saved" || currentCategory === "drama") {
      els.subFilters.style.display = "none";
      els.subFilters.innerHTML = "";
      return;
    }
    const list = SUBS[currentCategory] || [];
    if (!list.length) {
      els.subFilters.style.display = "none";
      els.subFilters.innerHTML = "";
      return;
    }
    els.subFilters.style.display = "flex";

    const chips = ["All"].concat(list);
    var html = chips.map(function(lbl){
      var value = (lbl === "All") ? "" : lbl;
      var active = value ? (norm(value) === norm(currentSub)) : (currentSub == null);
      var icon = (lbl !== "All" && ICONS[lbl]) ? (ICONS[lbl] + " ") : "";
      return '<div class="sub-chip ' + (active?'active':'') + '" data-sub="'+ value +'">'+ icon + lbl +'</div>';
    }).join("");
    els.subFilters.innerHTML = html;
  }

  // ---------- 탭 ----------
  function setActiveTab(tab) {
    ["daily","travel","drama","trendy","saved"].forEach(function(id){  // ★ trendy 포함
      var b = $(id + "Btn");
      if (b) b.classList.toggle("active", id === tab);
    });
  }

  function handleTab(tab) {
    currentCategory = tab;
    currentIndex = 0;
    currentSub = null;
    rebuildSubFilters();
    loadData();
    setActiveTab(tab);
  }

  // ---------- 렌더링 ----------
  function renderScrapStar(id) {
    if (!els.scrapBtn) return;
    var active = !!(id && savedList.indexOf(id) >= 0);
    els.scrapBtn.classList.toggle("active", active);
    els.scrapBtn.textContent = active ? "★" : "☆";
  }

  function renderPhrase() {
    if (!phrases || phrases.length === 0) {
      els.korean.textContent = "";
      els.english.textContent = "";
      els.pronunciation.textContent = "";
      els.badge.textContent = "";
      els.context.textContent = "";
      els.prog.textContent = "";
      renderScrapStar(null);
      resetDots(true);
      return;
    }
    var p = phrases[currentIndex];
    els.korean.textContent = p.k || "";
    els.english.textContent = p.e ? '"' + p.e + '"' : ""; // 의미는 위 스크립트가 context로도 보정
    els.pronunciation.textContent = p.p || "";
    els.badge.textContent = p.t || "";
    els.context.textContent = p.c || "";
    els.prog.textContent = (currentIndex + 1) + " / " + phrases.length;
    renderScrapStar(p.id);
    resetDots(true);
  }

  // ---------- 별(스크랩) ----------
  async function toggleScrap() {
    const user = getAuthUser();
    if (!user) { alert("Please login to save phrases."); return; }
    const p = phrases[currentIndex];
    if (!p) return;
    const id = p.id;
    const i = savedList.indexOf(id);
    if (i >= 0) savedList.splice(i, 1);
    else savedList.push(id);
    renderScrapStar(id);

    try {
      if (window.db) {
        await db.collection("users").doc(user.uid).set({ savedList: savedList }, { merge: true });
      }
    } catch (e) { console.warn("cloud save failed, fallback to local", e); }
    localStorage.setItem("soriSaved", JSON.stringify(savedList));
  }

  function findPhraseById(id) {
    const all = getAllData();
    const cats = ["daily","travel","drama","trendy"];   // ★ trendy 검색 포함
    for (var i=0;i<cats.length;i++){
      var cat = cats[i];
      var list = all[cat] || [];
      for (var j=0;j<list.length;j++){
        if (list[j] && list[j].id === id) return list[j];
      }
    }
    return null;
  }

  // ---------- 연습/음성 ----------
  function resetDots(hideCongrats) {
    els.repDots.forEach(function(d){ d.classList.remove("completed"); });
    if (els.repCount) els.repCount.textContent = 0;
    if (hideCongrats && els.congrats) els.congrats.classList.remove("show");
  }

  async function speak(text, rate) {
    if (window.SORI && window.SORI.TTS && window.SORI.TTS.speak) {
      await window.SORI.TTS.speak(text, { rate: rate });
      return;
    }
    return new Promise(function(resolve, reject){
      try {
        if (!("speechSynthesis" in window)) return reject(new Error("No speechSynthesis"));
        var synth = window.speechSynthesis;
        synth.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = "ko-KR";
        u.rate = rate || 0.75;
        var pick = function(){
          var vs = synth.getVoices();
          var ko = vs && vs.find ? vs.find(function(v){
            return (v.lang && v.lang.toLowerCase().indexOf("ko")===0) ||
                   (v.name && (v.name.toLowerCase().indexOf("korean")>=0 || v.name.indexOf("한국")>=0));
          }) : null;
          if (ko) u.voice = ko;
          synth.speak(u);
        };
        u.onerror = function(e){ reject(e.error || e); };
        u.onend = function(){ resolve(); };
        if ((synth.getVoices()||[]).length === 0) synth.onvoiceschanged = function(){ pick(); };
        else pick();
      } catch(e){ reject(e); }
    });
  }

  async function playAudio() {
    const p = phrases[currentIndex];
    if (!p) return;
    try {
      const rate = parseFloat(els.speed.value || "0.75");
      await speak(p.k, rate);
      markDotAndAward(p);
    } catch (e) {
      console.warn(e);
      showError("Audio playback failed.");
    }
  }

  function markDotAndAward(p) {
    var n = parseInt(els.repCount.textContent || "0", 10);
    if (n < 5) {
      n++;
      els.repCount.textContent = String(n);
      if (els.repDots[n - 1]) els.repDots[n - 1].classList.add("completed");
      if (n === 5 && els.congrats) {
        els.congrats.classList.add("show");
        setTimeout(function(){ els.congrats.classList.remove("show"); }, 1800);
      }
    }
    try { window.SoriState && window.SoriState.onPracticeComplete && window.SoriState.onPracticeComplete(p.id, 5); } catch(_){}
  }

  // ---------- Next / Prev ----------
  function nextPhrase() { if (currentIndex < phrases.length - 1) { currentIndex++; renderPhrase(); } }
  function prevPhrase() { if (currentIndex > 0) { currentIndex--; renderPhrase(); } }

  // ---------- Helpers ----------
  function showError(msg) {
    if (!els.errorMsg) return;
    els.errorMsg.style.display = "block";
    els.errorMsg.textContent = msg;
    setTimeout(function(){ els.errorMsg.style.display = "none"; }, 2200);
  }
  function showMessage(msg) {
    els.korean.textContent = msg;
    els.english.textContent = "";
    els.pronunciation.textContent = "";
    els.badge.textContent = "";
    els.context.textContent = "";
    els.prog.textContent = "";
    renderScrapStar(null);
    resetDots(true);
  }

  // ---------- 이벤트 ----------
  function bindEvents() {
    els.dailyBtn  && els.dailyBtn .addEventListener("click", function(){ handleTab("daily");  });
    els.travelBtn && els.travelBtn.addEventListener("click", function(){ handleTab("travel"); });
    els.dramaBtn  && els.dramaBtn .addEventListener("click", function(){ handleTab("drama");  });
    els.trendyBtn && els.trendyBtn.addEventListener("click", function(){ handleTab("trendy"); }); // ★ 추가
    els.savedBtn  && els.savedBtn .addEventListener("click", function(){ handleTab("saved");  });

    // 서브필터 델리게이션
    els.subFilters && els.subFilters.addEventListener("click", function(e){
      var chip = e.target.closest && e.target.closest(".sub-chip");
      if (!chip) return;
      var v = chip.getAttribute("data-sub") || "";
      currentSub = v || null;
      rebuildSubFilters();
      loadData();
    });

    els.scrapBtn && els.scrapBtn.addEventListener("click", toggleScrap);
    els.playBtn  && els.playBtn .addEventListener("click", playAudio);
    els.nextBtn  && els.nextBtn .addEventListener("click", nextPhrase);
    els.prevBtn  && els.prevBtn .addEventListener("click", prevPhrase);

    els.speed && els.speed.addEventListener("input", function(){
      var v = parseFloat(els.speed.value || "0.75");
      els.speedTxt.textContent = (Math.round(v * 100) / 100).toFixed(2) + "x";
    });

    // 로그인 상태 변화 → savedList 동기화
    if (window.firebase && firebase.auth) {
      firebase.auth().onAuthStateChanged(function(user){
        if (user && window.db) {
          db.collection("users").doc(user.uid).get().then(function(snap){
            if (snap.exists && snap.data() && snap.data().savedList) {
              savedList = snap.data().savedList || [];
              localStorage.setItem("soriSaved", JSON.stringify(savedList));
            }
          }).catch(function(e){ console.warn("load savedList error", e); });
        }
        if (currentCategory === "saved") handleTab("saved");
      });
    }
  }

  // ---------- 초기화 ----------
  window.addEventListener("DOMContentLoaded", function(){
    try {
      var local = localStorage.getItem("soriSaved");
      if (local) savedList = JSON.parse(local) || [];
    } catch(_){}
    bindEvents();
    rebuildSubFilters();
    loadData();
    console.log("[Sori] boot", getAllData());
  });
})();
