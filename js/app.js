/* js/app.js — 2025.10 Stable + Subfilters (All default, reset on change, congrats EN) */
(function () {
  // ---------- 로컬 상태 ----------
  let currentCategory = "daily";
  let currentIndex = 0;
  let currentSub = null;                 // All 기본: null이면 All로 처리
  let phrases = [];
  let savedList = [];

  // ---------- 엘리먼트 캐시 ----------
  const $ = (id) => document.getElementById(id);
  const els = {
    dailyBtn: $("dailyBtn"),
    travelBtn: $("travelBtn"),
    dramaBtn: $("dramaBtn"),
    trendyBtn: $("trendyBtn"),
    numbersBtn: $("numbersBtn"),  // ★ 추가
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
  const getAuthUser = () => {
    // firebaseAuth.currentUser를 직접 사용 (단일 소스)
    try {
      if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        const user = window.firebaseAuth.currentUser;
        if (user && user.email) {
          return user;
        }
      }
    } catch (e) {
      console.warn("getAuthUser error:", e);
    }
    return null;
  };

  // 정규화된 인덱스 우선 사용
  const getAllData = () => window.SoriDataIndex || window.SORI_DATA || {};

  const norm = function(v){ return (v == null ? "" : String(v)).trim().toLowerCase(); };

  // ---------- 서브 목록/아이콘/기본 서브 ----------
  const SUBS = window.SoriSubCategories || {
    daily:  ['Love','Greeting','Cafe','Restaurant','Shopping','Health','Social','Work','Tech','Exercise'],
    travel: ['Airport','Hotel','Transport','Emergency','Convenience','Street Food','Market','Duty Free','Department','Food Court','Payment','Delivery','Sightseeing'],
    trendy: ['Reaction','Emotion','Daily Talk','Online','Support & Life','Fun'],
    numbers:['Basic','Counting','Dates','Money','Tens & Hundreds','Practice'] // ★ 추가
  };
  const ICONS = window.SoriSubIcons || {
    Love:'❤️',
    Greeting:'👋', Cafe:'☕', Restaurant:'🍽️', Shopping:'🛍️', Health:'💊', Social:'👥',
    Work:'💼', Tech:'🖥️', Exercise:'🏃',
    Airport:'✈️', Hotel:'🏨', Transport:'🚇', Emergency:'🆘',
    Convenience:'🏪', 'Street Food':'🌭', Market:'🧺', 'Duty Free':'🛂', Department:'🏬',
    'Food Court':'🥢', Payment:'💳', Delivery:'📦', Sightseeing:'📍',
    // numbers fallback 아이콘 ★
    Basic:'🔢', Counting:'✋', Dates:'📅', Money:'💵', 'Tens & Hundreds':'🔟', Practice:'🎯'
  };

  const DEFAULTS = (window.SoriDefaults && window.SoriDefaults.defaultSubByCategory) || {};
  function defaultSubFor(cat){
    // All을 기본으로 보여주고 싶으니 null 반환
    return null;
  }

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

    // currentSub이 없으면 All 처리
    if (!currentSub || currentSub === "All") {
      phrases = base;
    } else {
      const want = norm(currentSub);
      phrases = base.filter(function(p){ return norm(p.sub || p.t) === want; });
    }


    // 진행도 안전 보정
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
    if (currentCategory === "saved" || currentCategory === "drama") {
      els.subFilters.style.display = "none";
      els.subFilters.innerHTML = "";
      els.subFilters.classList.remove('visible');
      const toggleBtn = document.getElementById('subFiltersToggle');
      if (toggleBtn) toggleBtn.style.display = 'none';
      return;
    }
    const list = SUBS[currentCategory] || [];
    if (!list.length) {
      els.subFilters.style.display = "none";
      els.subFilters.innerHTML = "";
      els.subFilters.classList.remove('visible');
      const toggleBtn = document.getElementById('subFiltersToggle');
      if (toggleBtn) toggleBtn.style.display = 'none';
      return;
    }
    
    const toggleBtn = document.getElementById('subFiltersToggle');
    if (toggleBtn) toggleBtn.style.display = 'block';

    const chips = ["All"].concat(list);
    var html = chips.map(function(lbl){
      var value = (lbl === "All") ? "" : lbl;
      var effectiveSub = currentSub;               // null이면 All 활성
      var active = value ? (norm(value) === norm(effectiveSub)) : (!effectiveSub);
      return '<button type="button" class="sub-chip ' + (active?'active':'') + '" aria-pressed="'+active+'" data-sub="'+ value +'">'+ lbl +'</button>';
    }).join("");
    els.subFilters.innerHTML = html;
    els.subFilters.classList.remove('visible'); // 기본값: 숨김
  }

  // ---------- 탭 ----------
  function setActiveTab(tab) {
    const labels={daily:"Daily",travel:"Travel",drama:"K-Drama",trendy:"Trendy Talk",numbers:"Numbers",saved:"Saved"};const picker=document.getElementById("pickerTrigger");if(picker)picker.textContent=labels[tab]||"Daily";
    ["daily","travel","drama","trendy","numbers","saved"].forEach(function(id){
      var b = $(id + "Btn");
      if (b) b.classList.toggle("active", id === tab);
    });
  }

  function handleTab(tab) {
    window.SoriPractice?.library();
    currentCategory = tab;
    currentIndex = 0;              // 카테고리 전환 시 1부터
    // drama/saved는 서브 없음, 그 외는 All 기본
    if (tab === "drama" || tab === "saved") {
      currentSub = null;
    } else {
      currentSub = null;           // All
    }

    rebuildSubFilters();
    loadData();
    setActiveTab(tab);
  }

  // ---------- 렌더링 ----------
  function renderScrapStar(id) {
    if (!els.scrapBtn) return;
    var active = !!(id && savedList.indexOf(id) >= 0);
    els.scrapBtn.classList.toggle("active", active);
    els.scrapBtn.textContent = active ? "Saved" : "Save";
    els.scrapBtn.setAttribute("aria-pressed",String(active));
  }

  let renderedId;
  function renderPhrase() {
    const next = phrases[currentIndex]?.id;
    if(next && renderedId===next && window.SoriPractice?.hasPhraseVoice()){
      els.prog.textContent=(currentIndex + 1) + " / " + phrases.length;
      renderScrapStar(next);return;
    }
    renderedId=next;
    window.SORI?.TTS?.cancel();
    const status=document.getElementById("lessonAudioStatus");if(status)status.textContent="";if(els.playBtn)els.playBtn.textContent="Listen & answer";
    if (!phrases || phrases.length === 0) {
      els.korean.textContent = "";
      els.english.textContent = "";
      els.pronunciation.textContent = "";
      els.badge.textContent = "";
      els.context.textContent = "";
      els.prog.textContent = "";
      renderScrapStar(null);
      window.dispatchEvent(new CustomEvent('sori-phrase-shown',{detail:{id:null}}));
      resetDots(true);
      return;
    }
    var p = phrases[currentIndex];
    els.korean.textContent = p.k || "";
    els.english.textContent = p.e || "";
    els.pronunciation.textContent = p.p || "";
    els.badge.textContent = p.t || (p.sub || "");
    els.context.textContent = p.c || "";
    els.prog.textContent = (currentIndex + 1) + " / " + phrases.length;
    renderScrapStar(p.id);
    resetDots(true);
    const repeat=document.getElementById("repeatPhrase");if(repeat)repeat.dataset.audioText=p.k;
    window.dispatchEvent(new CustomEvent("sori-phrase-shown",{detail:{id:p.id}}));
  }

  // ---------- 별(스크랩) ----------
  async function toggleScrap() {
    const user = getAuthUser();
    if (window.DEBUG) {
      console.log("저장 시도 - 사용자:", user ? user.email : "없음");
      console.log("firebaseAuth 상태:", window.firebaseAuth ? "있음" : "없음");
      console.log("currentUser 상태:", window.firebaseAuth?.currentUser ? "있음" : "없음");
    }
    if (!user) { 
      // alert 제거됨
      return; 
    }
    
    const p = phrases[currentIndex];
    if (!p) return;
    
    window.SoriSaved?.toggle(p.id);
  }

  function findPhraseById(id) {
    const all = getAllData();
    const cats = ["daily","travel","drama","trendy","numbers"]; // ★ numbers 포함
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
    throw new Error('Audio service is not ready');
  }

  async function playAudio() {
    if(window.SoriPractice?.hasPhraseVoice())return;
    const p = phrases[currentIndex];
    if (!p) return;
    const status=document.getElementById('lessonAudioStatus');if(status)status.textContent='Getting the audio ready…';
    els.playBtn.textContent='Loading…';
    try {
      const rate = parseFloat(els.speed.value || "0.75");
      await window.SORI.TTS.speak(p.k,{rate,onPlaying(){els.playBtn.textContent='Playing…';if(status)status.textContent='Listen, then say it out loud.';}});
      if (phrases[currentIndex]?.id === p.id){markDotAndAward(p);if(status)status.textContent='Your turn. Say it once, then listen again.';}
    } catch (e) {
      if (e?.name === "AbortError") return;
      console.warn(e);
      showError("Audio playback failed. Please try again.");
      if(status)status.textContent='Audio could not play. Tap Listen & Repeat to try again.';
    } finally {els.playBtn.textContent='Listen & Repeat';}
  }

  function markDotAndAward(p) {
    var n = parseInt(els.repCount.textContent || "0", 10);
    if (n < 5) {
      n++;
      els.repCount.textContent = String(n);
      if (els.repDots[n - 1]) els.repDots[n - 1].classList.add("completed");
      if (n === 5 && els.congrats) {
        // 영어로 가벼운 칭찬 문구
        els.congrats.textContent = "Nice work!";
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
    els.dailyBtn   && els.dailyBtn  .addEventListener("click", function(){ handleTab("daily");   });
    els.travelBtn  && els.travelBtn .addEventListener("click", function(){ handleTab("travel");  });
    els.dramaBtn   && els.dramaBtn  .addEventListener("click", function(){ handleTab("drama");   });
    els.trendyBtn  && els.trendyBtn .addEventListener("click", function(){ handleTab("trendy");  });
    els.numbersBtn && els.numbersBtn.addEventListener("click", function(){ handleTab("numbers"); }); // ★ 추가
    els.savedBtn   && els.savedBtn  .addEventListener("click", function(){ handleTab("saved");   });

    // 서브필터 델리게이션
    els.subFilters && els.subFilters.addEventListener("click", function(e){
      var chip = e.target.closest && e.target.closest(".sub-chip");
      if (!chip) return;
      var v = chip.getAttribute("data-sub") || "";
      currentSub = v || null;     // All이면 null
      currentIndex = 0;           // 서브 변경 시 1부터
      rebuildSubFilters();
      loadData();
    });

    els.scrapBtn && els.scrapBtn.addEventListener("click", toggleScrap);
    els.playBtn  && els.playBtn .addEventListener("click", playAudio);
    els.nextBtn  && els.nextBtn .addEventListener("click", nextPhrase);
    els.prevBtn  && els.prevBtn .addEventListener("click", prevPhrase);

    els.speed && els.speed.addEventListener("input", function(){
      var v = parseFloat(els.speed.value || "0.75");
      window.SORI?.TTS?.setRate(v);
      els.speedTxt.textContent = (Math.round(v * 100) / 100).toFixed(2) + "x";
    });

    window.addEventListener('sori-auth-changed', () => { if (currentCategory === 'saved') handleTab('saved'); });
    window.addEventListener('sori-sync-status', e => {
      if (e.detail.status === 'offline') showError('Cloud sync is unavailable. Please try again when connected.');
      if (e.detail.status === 'local-error') showError('Device storage is unavailable. Keep this page open until cloud sync completes.');
    });
    // Listen for savedList changes from Quiz
    window.addEventListener('savedListChanged', function(e) {
      if (e.detail && e.detail.savedList) {
        savedList = e.detail.savedList;
        renderScrapStar(phrases[currentIndex]?.id);
        if (currentCategory === "saved") {
          handleTab("saved");
        }
      }
    });
  }

  function openId(id) {
    for (const [category, list] of Object.entries(getAllData())) {
      if (!list.some(p => p.id === id)) continue;
      window.SoriPractice?.library();
      currentCategory = category;
      currentSub = null;
      rebuildSubFilters();
      applyFilter();
      currentIndex = phrases.findIndex(p => p.id === id);
      setActiveTab(category);
      renderPhrase();
      return true;
    }
    return false;
  }
  window.addEventListener('sori-repeat-ended',e=>{const p=phrases[currentIndex];if(p&&p.k===e.detail.text)markDotAndAward(p);});
  window.SoriLearn = {
    openId,
    openCategory(category,situation) {
      handleTab(category);
      if (situation) { currentSub=situation; currentIndex=0; rebuildSubFilters(); loadData(); }
    },
    openKorean(text) {
      const match = Object.values(getAllData()).flat().find(p => p.k === text);
      return match ? openId(match.id) : false;
    }
  };
  document.getElementById('showTranslation')?.addEventListener('change',e=>document.getElementById('mainContent').classList.toggle('translation-off',!e.target.checked));
  document.getElementById('showRomanization')?.addEventListener('change',e=>document.getElementById('mainContent').classList.toggle('romanization-off',!e.target.checked));

  // ---------- 초기화 ----------
  window.addEventListener("DOMContentLoaded", function(){
    try {
      savedList = window.SoriSaved ? window.SoriSaved.list.slice() : [];
    } catch(_){}

    // 첫 진입: Daily 탭 + All 서브가 기본
    currentCategory = "daily";
    currentSub = null;            // All

    bindEvents();
    rebuildSubFilters();
    loadData();
    console.log("[Sori] boot", { data: getAllData(), currentCategory, currentSub });
  });
})();
