/* js/app.js — 2025.10 Stable + Subfilters */
(function () {
  // ---------- 로컬 상태 ----------
  let currentCategory = "daily";
  let currentIndex = 0;
  let currentSub = null;         // ← 서브필터 상태
  let phrases = [];
  let savedList = [];            // phrase.id 배열

  // ---------- 엘리먼트 캐시 ----------
  const $ = (id) => document.getElementById(id);
  const els = {
    dailyBtn: $("dailyBtn"),
    travelBtn: $("travelBtn"),
    dramaBtn: $("dramaBtn"),
    savedBtn: $("savedBtn"),
    scrapBtn: $("scrapBtn"),
    badge: $("badge"),
    context: $("context"),
    korean: $("korean"),
    english: $("english"),
    pronunciation: $("pronunciation"),
    repDots: [...document.querySelectorAll(".rep-dot")],
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

  const getAllData = () => window.SoriDataIndex || window.SORI_DATA || {};

  // 서브 카테고리 매핑(데이터에 없을 때 폴백)
  const SUBS = window.SoriSubCategories || {
    daily: ['Greeting','Cafe','Restaurant','Shopping','Health','Social','Work','Tech','Exercise'],
    travel:['Airport','Hotel','Transport','Emergency','Convenience','Street Food','Market','Duty Free','Department','Food Court','Payment','Delivery','Sightseeing']
  };
  const ICONS = window.SoriSubIcons || {
    Greeting:'👋', Cafe:'☕', Restaurant:'🍽️', Shopping:'🛍️', Health:'💊', Social:'👥',
    Work:'💼', Tech:'🖥️', Exercise:'🏃',
    Airport:'✈️', Hotel:'🏨', Transport:'🚇', Emergency:'🆘',
    Convenience:'🏪', 'Street Food':'🌭', Market:'🧺', 'Duty Free':'🛂', Department:'🏬',
    'Food Court':'🥢', Payment:'💳', Delivery:'📦', Sightseeing:'📍'
  };

  // ---------- 데이터 로딩/필터 ----------
  function rawFor(cat) {
    const all = getAllData();
    return all?.[cat] || [];
  }

  function applyFilter() {
    // Saved는 별도 처리에서 phrases 세팅
    if (currentCategory === "saved") return;
    const raw  = rawFor(currentCategory) || []; const base = Array.isArray(raw) ? raw.slice()            : (raw && Array.isArray(raw.data)) ? raw.data.slice()            : [];
    phrases = currentSub ? base.filter(p => p.sub === currentSub) : base.slice();
    currentIndex = Math.min(currentIndex, Math.max(0, phrases.length - 1));
renderPhrase(); // ← 필터 적용 후 화면 갱신
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
      phrases = savedList.map(id => findPhraseById(id)).filter(Boolean);
      if (phrases.length === 0) showMessage("No saved phrases yet.");
      currentIndex = 0;
    } else {
      applyFilter();
    }
    renderPhrase();
  }

  // ---------- 서브필터 UI ----------
  function rebuildSubFilters() {
    // saved/drama는 서브필터 비표시
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

    const chips = ["All", ...list];
    const html = chips.map(lbl => {
      const value = lbl === "All" ? "" : lbl;
      const active = (value ? value === currentSub : currentSub == null);
      const icon = lbl !== "All" && ICONS[lbl] ? ICONS[lbl] + " " : "";
      return `<div class="sub-chip ${active ? "active" : ""}" data-sub="${value}">${icon}${lbl}</div>`;
    }).join("");
    els.subFilters.innerHTML = html;
  }

  // ---------- 탭 ----------
  function setActiveTab(tab) {
    ["daily", "travel", "drama", "saved"].forEach((id) => {
      const b = $(id + "Btn");
      if (b) b.classList.toggle("active", id === tab);
    });
  }

  function handleTab(tab) {
    currentCategory = tab;
    currentIndex = 0;
    // 탭 바꿀 때 서브필터 초기화
    currentSub = null;
    rebuildSubFilters();
    loadData();
    setActiveTab(tab);
  }

  // ---------- 렌더링 ----------
  function renderScrapStar(id) {
    if (!els.scrapBtn) return;
    const active = !!(id && savedList.includes(id));
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
    const p = phrases[currentIndex];
    els.korean.textContent = p.k || "";
    els.english.textContent = p.e ? `"${p.e}"` : "";
    els.pronunciation.textContent = p.p || "";
    els.badge.textContent = p.t || "";
    els.context.textContent = p.c || "";
    els.prog.textContent = `${currentIndex + 1} / ${phrases.length}`;
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
        await db.collection("users").doc(user.uid).set({ savedList }, { merge: true });
      }
    } catch (e) {
      console.warn("cloud save failed, fallback to local", e);
    }
    localStorage.setItem("soriSaved", JSON.stringify(savedList));
  }

  function findPhraseById(id) {
    const all = getAllData();
    for (const cat of ["daily", "travel", "drama"]) {
      const hit = (all[cat] || []).find(p => p.id === id);
      if (hit) return hit;
    }
    return null;
  }

  // ---------- 연습/음성 ----------
  function resetDots(hideCongrats = false) {
    els.repDots.forEach((d) => d.classList.remove("completed"));
    if (els.repCount) els.repCount.textContent = 0;
    if (hideCongrats && els.congrats) els.congrats.classList.remove("show");
  }

  async function speak(text, rate) {
    if (window.SORI?.TTS?.speak) { await window.SORI.TTS.speak(text, { rate }); return; }
    return new Promise((resolve, reject) => {
      try {
        if (!("speechSynthesis" in window)) return reject(new Error("No speechSynthesis"));
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ko-KR";
        u.rate = rate || 0.75;
        const pick = () => {
          const vs = synth.getVoices();
          const ko = vs.find(v =>
            v.lang?.toLowerCase().startsWith("ko") ||
            v.name?.toLowerCase().includes("korean") ||
            v.name?.includes("한국")
          );
          if (ko) u.voice = ko;
          synth.speak(u);
        };
        u.onerror = (e) => reject(e.error || e);
        u.onend = () => resolve();
        if (synth.getVoices().length === 0) synth.onvoiceschanged = () => pick();
        else pick();
      } catch (e) { reject(e); }
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
    let n = parseInt(els.repCount.textContent || "0", 10);
    if (n < 5) {
      n++;
      els.repCount.textContent = String(n);
      if (els.repDots[n - 1]) els.repDots[n - 1].classList.add("completed");
      if (n === 5 && els.congrats) {
        els.congrats.classList.add("show");
        setTimeout(() => els.congrats.classList.remove("show"), 1800);
      }
    }
    try { window.SoriState?.onPracticeComplete?.(p.id, 5); } catch {}
  }

  // ---------- Next / Prev ----------
  function nextPhrase() { if (currentIndex < phrases.length - 1) { currentIndex++; renderPhrase(); } }
  function prevPhrase() { if (currentIndex > 0) { currentIndex--; renderPhrase(); } }

  // ---------- Helpers ----------
  function showError(msg) {
    if (!els.errorMsg) return;
    els.errorMsg.style.display = "block";
    els.errorMsg.textContent = msg;
    setTimeout(() => (els.errorMsg.style.display = "none"), 2200);
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
    els.dailyBtn?.addEventListener("click", () => handleTab("daily"));
    els.travelBtn?.addEventListener("click", () => handleTab("travel"));
    els.dramaBtn?.addEventListener("click", () => handleTab("drama"));
    els.savedBtn?.addEventListener("click", () => handleTab("saved"));

    // 서브필터 델리게이션
    els.subFilters?.addEventListener("click", (e) => {
      const chip = e.target.closest(".sub-chip");
      if (!chip) return;
      const v = chip.getAttribute("data-sub") || "";
      currentSub = v || null;
      rebuildSubFilters();
      loadData();
    });

    els.scrapBtn?.addEventListener("click", toggleScrap);
    els.playBtn?.addEventListener("click", playAudio);
    els.nextBtn?.addEventListener("click", nextPhrase);
    els.prevBtn?.addEventListener("click", prevPhrase);

    els.speed?.addEventListener("input", () => {
      const v = parseFloat(els.speed.value || "0.75");
      els.speedTxt.textContent = (Math.round(v * 100) / 100) + "x";
    });

    // 로그인 상태 변화 → savedList 동기화
    if (window.firebase?.auth) {
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user && window.db) {
          try {
            const ref = db.collection("users").doc(user.uid);
            const snap = await ref.get();
            if (snap.exists && snap.data().savedList) {
              savedList = snap.data().savedList || [];
              localStorage.setItem("soriSaved", JSON.stringify(savedList));
            }
          } catch (e) { console.warn("load savedList error", e); }
        }
        if (currentCategory === "saved") handleTab("saved");
      });
    }
  }

  // ---------- 초기화 ----------
  window.addEventListener("DOMContentLoaded", () => {
    try {
      const local = localStorage.getItem("soriSaved");
      if (local) savedList = JSON.parse(local) || [];
    } catch {}
    bindEvents();
    rebuildSubFilters();
    loadData();
    console.log("[Sori] boot", getAllData());
  });
})();
