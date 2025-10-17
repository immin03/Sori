/* js/app.js — 2025.10 Harmonized with state.js (subcollection) */

(function () {
  // -------- 상태 --------
  let currentCategory = "daily";
  let currentIndex = 0;
  let currentSub = null; // 서브필터
  let phrases = [];      // 현재 탭에서 표시할 배열

  // -------- 엘리먼트 캐시 --------
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
    scrapBtn: $("scrapBtn"),
    badge: $("badge"),
    context: $("context"),
    korean: $("korean"),
    english: $("english"),
    pronunciation: $("pronunciation"),
    repDots: [...document.querySelectorAll(".rep-dot")],
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
  };

  // -------- 유틸 --------
  const getAllData = () => window.SoriDataIndex || window.SORI_DATA || {};
  const getUser = () =>
    (window.firebase && firebase.auth && firebase.auth().currentUser) || null;

  function setActiveTab(tab) {
    ["daily", "travel", "drama", "saved"].forEach((id) => {
      const b = $(id + "Btn");
      if (b) b.classList.toggle("active", id === tab);
    });
  }

  // -------- 서브필터 렌더링 --------
  function renderSubFilters() {
    const map = window.subCategories || {};
    const icons = window.subIcons || {};
    const list = map[currentCategory] || [];

    // drama/saved는 서브필터 숨김
    if (!els.subFilters) return;
    if (currentCategory === "drama" || currentCategory === "saved" || list.length === 0) {
      els.subFilters.style.display = "none";
      els.subFilters.innerHTML = "";
      return;
    }

    els.subFilters.style.display = "block";
    const chips = ["All", ...list];
    els.subFilters.innerHTML =
      `<div class="sub-filters">` +
      chips
        .map((label) => {
          const val = label === "All" ? "" : label;
          const selected = (val || null) === (currentSub || null);
          const icon = label !== "All" && icons[label] ? icons[label] + " " : "";
          return `<div class="filter-chip ${selected ? "active" : ""}" data-sub="${val}">
                   ${icon}${label}
                  </div>`;
        })
        .join("") +
      `</div>`;
  }

  function bindSubFilterClick() {
    els.subFilters?.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      const v = chip.getAttribute("data-sub") || "";
      currentSub = v || null;
      renderSubFilters();
      reloadCategoryData(); // 필터 적용 후 재계산
    });
  }

  // -------- 데이터 로딩/필터 --------
  function loadPhrasesFor(cat) {
    const all = getAllData()[cat] || [];
    if (!currentSub) return all;
    return all.filter((x) => (x.sub || null) === currentSub);
  }

  function reloadCategoryData() {
    phrases = loadPhrasesFor(currentCategory);
    currentIndex = Math.min(currentIndex, Math.max(0, phrases.length - 1));
    renderPhrase();
  }

  // -------- Saved 탭 구성 --------
  function buildSavedList() {
    const ids = (window.SoriUser?.getSavedIds && window.SoriUser.getSavedIds()) || [];
    const all = getAllData();
    const pool = [...(all.daily || []), ...(all.travel || []), ...(all.drama || [])];
    return ids
      .map((id) => pool.find((p) => p.id === id))
      .filter(Boolean);
  }

  // -------- 탭 전환 --------
  function handleTab(tab) {
    currentCategory = tab;
    currentIndex = 0;
    if (tab === "saved") {
      if (!getUser()) {
        showMessage("Please login to check your scraps.");
        setActiveTab(tab);
        renderSubFilters();
        return;
      }
      currentSub = null; // saved에는 서브필터 없음
      phrases = buildSavedList();
      if (phrases.length === 0) showMessage("No saved phrases yet.");
      else renderPhrase();
    } else {
      reloadCategoryData();
    }
    setActiveTab(tab);
    renderSubFilters();
  }

  // -------- 렌더링 --------
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
    const p = phrases[currentIndex];
    els.korean.textContent = p.k || "";
    els.english.textContent = p.e ? `"${p.e}"` : "";
    els.pronunciation.textContent = p.p || "";
    els.badge.textContent = p.t || "";
    els.context.textContent = p.c || "";
    els.prog.textContent = `${currentIndex + 1} / ${phrases.length}`;
    updateScrapBtn(p.id);
    resetDots(true);
  }

  // -------- ★ 스크랩 --------
  function updateScrapBtn(id) {
    if (!els.scrapBtn) return;
    const active = id && window.SoriUser?.isSaved && window.SoriUser.isSaved(id);
    els.scrapBtn.classList.toggle("active", !!active);
    els.scrapBtn.textContent = active ? "★" : "☆";
  }

  async function onScrapClick() {
    const p = phrases[currentIndex];
    if (!p) return;
    const user = getUser();
    if (!user) return alert("Please login to save phrases.");
    try {
      const res = await window.SoriUser.toggleSave(p);
      updateScrapBtn(p.id);
      // Saved 탭 보고 있으면 리스트 갱신
      if (currentCategory === "saved") {
        phrases = buildSavedList();
        currentIndex = Math.min(currentIndex, Math.max(0, phrases.length - 1));
        renderPhrase();
      }
    } catch (e) {
      console.warn(e);
      alert("Save failed. Try again.");
    }
  }

  // -------- 연습/음성 --------
  function resetDots(hideCongrats = false) {
    els.repDots.forEach((d) => d.classList.remove("completed"));
    if (els.repCount) els.repCount.textContent = 0;
    if (hideCongrats && els.congrats) els.congrats.classList.remove("show");
  }

  async function speak(text, rate) {
    // 우선 SORI.TTS(tts.js)
    if (window.SORI?.TTS?.speak) return window.SORI.TTS.speak(text, { rate });

    // 폴백: Web Speech
    return new Promise((resolve, reject) => {
      try {
        if (!("speechSynthesis" in window)) return reject(new Error("No speechSynthesis"));
        const synth = window.speechSynthesis;
        try { synth.cancel(); } catch {}
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ko-KR";
        u.rate = rate || 0.75;
        const pick = () => {
          const vs = synth.getVoices();
          const ko = vs.find(v => v.lang?.toLowerCase().startsWith("ko") || v.name?.toLowerCase().includes("korean") || v.name?.includes("한국"));
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
    if (!p || !p.k) return;
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
    try {
      if (window.SoriState?.onPracticeComplete && p?.id) {
        window.SoriState.onPracticeComplete(p.id, 5);
      }
    } catch (e) {
      console.warn("onPracticeComplete failed", e);
    }
  }

  // -------- 네비 --------
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

  // -------- 메시지/에러 --------
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

  // -------- 이벤트 바인딩 --------
  function bindEvents() {
    els.dailyBtn?.addEventListener("click", () => handleTab("daily"));
    els.travelBtn?.addEventListener("click", () => handleTab("travel"));
    els.dramaBtn?.addEventListener("click", () => handleTab("drama"));
    els.savedBtn?.addEventListener("click", () => handleTab("saved"));

    bindSubFilterClick();

    els.scrapBtn?.addEventListener("click", onScrapClick);
    els.playBtn?.addEventListener("click", playAudio);
    els.nextBtn?.addEventListener("click", nextPhrase);
    els.prevBtn?.addEventListener("click", prevPhrase);

    els.speed?.addEventListener("input", () => {
      const v = parseFloat(els.speed.value || "0.75");
      els.speedTxt.textContent = (Math.round(v * 100) / 100) + "x";
    });

    // 로그인 상태 변화 -> Saved/별 갱신
    if (window.firebase?.auth) {
      firebase.auth().onAuthStateChanged(() => {
        if (currentCategory === "saved") {
          phrases = buildSavedList();
          currentIndex = 0;
          renderPhrase();
        } else {
          updateScrapBtn(phrases?.[currentIndex]?.id || null);
        }
      });
    }

    // state.js에서 별도 이벤트를 쏴줌 (선택적)
    window.addEventListener("sori-auth-changed", () => {
      if (currentCategory === "saved") {
        phrases = buildSavedList();
        currentIndex = 0;
        renderPhrase();
      } else {
        updateScrapBtn(phrases?.[currentIndex]?.id || null);
      }
    });
  }

  // -------- 초기화 --------
  window.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    setActiveTab("daily");
    renderSubFilters();
    reloadCategoryData();
  });
})();
