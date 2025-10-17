/* js/app.js — 2025.10 Stabilized: tabs + subfilters + TTS + saved */
(function () {
  // ====== 상태 ======
  let currentCategory = "daily";
  let currentSub = null;          // <- 서브필터 (null = All)
  let currentIndex = 0;
  let phrases = [];               // 필터링 후 목록
  let savedList = [];             // [phrase.id]

  const $ = (id) => document.getElementById(id);
  const els = {
    // 탭
    dailyBtn: $("dailyBtn"),
    travelBtn: $("travelBtn"),
    dramaBtn: $("dramaBtn"),
    savedBtn: $("savedBtn"),
    // 서브필터
    subFilters: $("subFilters"),
    // 본문
    badge: $("badge"),
    context: $("context"),
    korean: $("korean"),
    english: $("english"),
    pronunciation: $("pronunciation"),
    // 연습
    repDots: Array.from(document.querySelectorAll(".rep-dot")),
    repCount: $("repCount"),
    congrats: $("congrats"),
    // 컨트롤
    playBtn: $("playBtn"),
    nextBtn: $("nextBtn"),
    prevBtn: $("prevBtn"),
    prog: $("prog"),
    errorMsg: $("errorMsg"),
    speed: $("speed"),
    speedTxt: $("speedTxt"),
    // 스크랩
    scrapBtn: $("scrapBtn"),
  };

  const getUser = () =>
    (window.firebase && firebase.auth && firebase.auth().currentUser) || null;

  // ====== 데이터 ======
  function getAllData() {
    // dataindex.js 가 보통 window.SoriDataIndex 로 내보냄
    return window.SoriDataIndex || window.SORI_DATA || {};
  }

  function rawListFor(cat) {
    const all = getAllData();
    return Array.isArray(all[cat]) ? all[cat] : [];
  }

  function recomputeFiltered() {
    let base = rawListFor(currentCategory);
    if (currentCategory === "saved") {
      // Saved 탭
      base = savedList
        .map((id) => findPhraseById(id))
        .filter(Boolean);
    } else if (currentSub) {
      base = base.filter((x) => x.sub === currentSub);
    }
    phrases = base;
    currentIndex = Math.min(currentIndex, Math.max(0, phrases.length - 1));
  }

  // ====== 서브필터 UI ======
  function renderSubFilters() {
    // Saved/Drama 는 서브필터 숨김(원하면 drama도 켤 수 있음)
    if (
      currentCategory === "saved" ||
      currentCategory === "drama" ||
      !els.subFilters
    ) {
      els.subFilters.style.display = "none";
      els.subFilters.innerHTML = "";
      return;
    }
    const map = window.subCategories || {};
    const icons = window.subIcons || {};
    const list = map[currentCategory] || [];
    if (list.length === 0) {
      els.subFilters.style.display = "none";
      els.subFilters.innerHTML = "";
      return;
    }

    els.subFilters.style.display = "block";
    const chips = ["All", ...list]
      .map((label) => {
        const val = label === "All" ? "" : label;
        const selected =
          (label === "All" && !currentSub) || (currentSub === label);
        const icon =
          label !== "All" && icons[label] ? icons[label] + " " : "";
        return `<div class="filter-chip ${selected ? "active" : ""}" data-sub="${val}">${icon}${label}</div>`;
      })
      .join("");

    els.subFilters.innerHTML = `
      <div class="sub-filters" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;padding:10px;background:#f9fafb;border-radius:10px;">
        ${chips}
      </div>
    `;
  }

  function bindSubFilterEvents() {
    if (!els.subFilters) return;
    els.subFilters.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      const v = chip.getAttribute("data-sub") || "";
      currentSub = v || null;
      currentIndex = 0;
      recomputeFiltered();
      renderSubFilters();
      renderPhrase();
      setActiveTab(currentCategory);
    });
  }

  // ====== 탭 ======
  function setActiveTab(tab) {
    ["daily", "travel", "drama", "saved"].forEach((id) => {
      const b = $(id + "Btn");
      if (b) b.classList.toggle("active", id === tab);
    });
  }

  function switchTab(tab) {
    currentCategory = tab;
    currentSub = null;
    currentIndex = 0;

    if (tab === "saved") {
      if (!getUser()) {
        // 로그인 전 안내
        phrases = [];
        renderSubFilters(); // 숨김
        showMessage("Please login to check your scraps.");
        setActiveTab(tab);
        return;
      }
    }
    recomputeFiltered();
    renderSubFilters();
    renderPhrase();
    setActiveTab(tab);
  }

  // ====== 렌더 ======
  function renderPhrase() {
    if (!phrases || phrases.length === 0) {
      els.korean.textContent = "";
      els.english.textContent = "";
      els.pronunciation.textContent = "";
      els.badge.textContent = "";
      els.context.textContent = "";
      els.prog.textContent = "";
      updateScrapBtn(null);
      resetDots(true);
      return;
    }
    const p = phrases[currentIndex] || {};
    els.korean.textContent = p.k || "";
    els.english.textContent = p.e ? `"${p.e}"` : "";
    els.pronunciation.textContent = p.p || "";
    els.badge.textContent = p.t || "";
    els.context.textContent = p.c || "";
    els.prog.textContent = `${currentIndex + 1} / ${phrases.length}`;
    updateScrapBtn(p.id);
    resetDots(true);
  }

  // ====== 스크랩 ======
  function updateScrapBtn(id) {
    if (!els.scrapBtn) return;
    const active = id && savedList.includes(id);
    els.scrapBtn.classList.toggle("active", !!active);
    els.scrapBtn.textContent = active ? "★" : "☆";
  }

  async function toggleScrap() {
    const user = getUser();
    if (!user) {
      alert("Please login to save phrases.");
      return;
    }
    const p = phrases[currentIndex];
    if (!p) return;
    const id = p.id;
    const i = savedList.indexOf(id);
    if (i >= 0) savedList.splice(i, 1);
    else savedList.push(id);
    updateScrapBtn(id);

    try {
      if (window.db) {
        await db.collection("users").doc(user.uid).set({ savedList }, { merge: true });
      }
    } catch (e) {
      console.warn("cloud save failed", e);
    }
    try {
      localStorage.setItem("soriSaved", JSON.stringify(savedList));
    } catch {}
  }

  function findPhraseById(id) {
    const all = getAllData();
    for (const cat of ["daily", "travel", "drama"]) {
      const arr = all[cat] || [];
      const hit = arr.find((x) => x.id === id);
      if (hit) return hit;
    }
    return null;
  }

  // ====== 연습/음성 ======
  function resetDots(hideCongrats = false) {
    els.repDots.forEach((d) => d.classList.remove("completed"));
    if (els.repCount) els.repCount.textContent = "0";
    if (hideCongrats && els.congrats) els.congrats.classList.remove("show");
  }

  async function speak(text, rate) {
    // 1) 커스텀 TTS 있으면 우선
    if (window.SORI?.TTS?.speak) {
      return window.SORI.TTS.speak(text, { rate });
    }
    // 2) 폴백 (혹시 tts.js를 못 읽은 경우)
    return new Promise((resolve, reject) => {
      try {
        if (!("speechSynthesis" in window)) return reject(new Error("No speechSynthesis"));
        const synth = window.speechSynthesis;
        try { synth.cancel(); } catch {}
        const u = new SpeechSynthesisUtterance(String(text || ""));
        u.lang = "ko-KR";
        u.rate = rate || 0.75;
        u.onerror = (e) => reject(e.error || e);
        u.onend = () => resolve();
        const go = () => synth.speak(u);
        if (synth.getVoices().length === 0) {
          synth.onvoiceschanged = () => { go(); synth.onvoiceschanged = null; };
          setTimeout(go, 0);
        } else {
          go();
        }
      } catch (e) { reject(e); }
    });
  }

  async function playAudio() {
    const p = phrases[currentIndex];
    if (!p || !p.k) return;
    try {
      const rate = parseFloat(els.speed.value || "0.75");
      await speak(p.k, rate);
      awardRep(p.id);
    } catch (e) {
      console.warn(e);
      showError("Audio playback failed.");
    }
  }

  function awardRep(phraseId) {
    let n = parseInt(els.repCount.textContent || "0", 10);
    if (n < 5) {
      n++;
      els.repCount.textContent = String(n);
      if (els.repDots[n - 1]) els.repDots[n - 1].classList.add("completed");
      if (n === 5 && els.congrats) {
        els.congrats.classList.add("show");
        setTimeout(() => els.congrats.classList.remove("show"), 1600);
      }
    }
    try {
      if (window.SoriState?.onPracticeComplete) {
        window.SoriState.onPracticeComplete(phraseId, 5);
      }
    } catch {}
  }

  function nextPhrase() {
    if (currentIndex < phrases.length - 1) {
      currentIndex++;
      renderPhrase();
    }
  }
  function prevPhrase() {
    if (currentIndex > 0) {
      currentIndex--;
      renderPhrase();
    }
  }

  // ====== 헬퍼 ======
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
    updateScrapBtn(null);
    resetDots(true);
  }

  // ====== 이벤트 바인딩 ======
  function bindEvents() {
    els.dailyBtn?.addEventListener("click", () => switchTab("daily"));
    els.travelBtn?.addEventListener("click", () => switchTab("travel"));
    els.dramaBtn?.addEventListener("click", () => switchTab("drama"));
    els.savedBtn?.addEventListener("click", () => switchTab("saved"));

    bindSubFilterEvents();

    els.scrapBtn?.addEventListener("click", toggleScrap);
    els.playBtn?.addEventListener("click", playAudio);
    els.nextBtn?.addEventListener("click", nextPhrase);
    els.prevBtn?.addEventListener("click", prevPhrase);

    els.speed?.addEventListener("input", () => {
      const v = parseFloat(els.speed.value || "0.75");
      els.speedTxt.textContent = (Math.round(v * 100) / 100) + "x";
    });

    // 로그인 변경 → savedList 로드 & Saved 탭 재렌더
    if (window.firebase?.auth) {
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user && window.db) {
          try {
            const snap = await db.collection("users").doc(user.uid).get();
            if (snap.exists && Array.isArray(snap.data().savedList)) {
              savedList = snap.data().savedList;
              localStorage.setItem("soriSaved", JSON.stringify(savedList));
            }
          } catch (e) { console.warn("saved load error", e); }
        }
        if (currentCategory === "saved") switchTab("saved");
      });
    }
  }

  // ====== 초기화 ======
  window.addEventListener("DOMContentLoaded", () => {
    try {
      const local = localStorage.getItem("soriSaved");
      if (local) savedList = JSON.parse(local) || [];
    } catch {}
    bindEvents();
    recomputeFiltered();
    renderSubFilters();
    renderPhrase();
    setActiveTab(currentCategory);
    // 디버그 로그
    const all = getAllData();
    console.log("[Sori] boot",
      { daily: (all.daily||[]).length, travel: (all.travel||[]).length, drama: (all.drama||[]).length }
    );
  });
})();
