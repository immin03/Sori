/* js/app.js — 2025.10 Stable
   탭 이동 · 스크랩 · 연습 진행 · 음성 재생
*/
(function () {
  // ---------- 로컬 상태 ----------
  let currentCategory = "daily";
  let currentIndex = 0;
  let phrases = [];
  let savedList = []; // phrase.id 배열

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
  };

  const getAuthUser = () =>
    (window.firebase && firebase.auth && firebase.auth().currentUser) || null;

  // ---------- 데이터 로딩 ----------
  function getAllData() {
    // dataindex.js에서 노출한 전역
    return window.SoriDataIndex || window.SORI_DATA || {};
  }

  function loadPhrasesFor(cat) {
    const all = getAllData();
    return all?.[cat] || [];
  }

  function loadData() {
    phrases = loadPhrasesFor(currentCategory);
    currentIndex = Math.min(currentIndex, Math.max(0, phrases.length - 1));
    renderPhrase();
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

    if (tab === "saved") {
      // Saved는 로그인한 사용자만
      if (!getAuthUser()) {
        showMessage('Please login to check your scraps.');
        phrases = [];
        setActiveTab(tab);
        return;
      }
      phrases = savedList
        .map((id) => findPhraseById(id))
        .filter(Boolean);
      if (phrases.length === 0) {
        showMessage("No saved phrases yet.");
      } else {
        renderPhrase();
      }
    } else {
      loadData();
    }
    setActiveTab(tab);
  }

  // ---------- 렌더링 ----------
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

  // ---------- 별(스크랩) ----------
  function updateScrapBtn(id) {
    if (!els.scrapBtn) return;
    const active = id && savedList.includes(id);
    els.scrapBtn.classList.toggle("active", !!active);
    els.scrapBtn.textContent = active ? "★" : "☆";
  }

  async function toggleScrap() {
    const user = getAuthUser();
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

    // 클라우드 우선 저장
    try {
      if (window.db) {
        await db.collection("users").doc(user.uid).set({ savedList }, { merge: true });
      }
    } catch (e) {
      console.warn("cloud save failed, fallback to local", e);
    }
    // 로컬 동기화
    localStorage.setItem("soriSaved", JSON.stringify(savedList));
  }

  function findPhraseById(id) {
    const all = getAllData();
    for (const cat of ["daily", "travel", "drama"]) {
      const hit = (all[cat] || []).find((p) => p.id === id);
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
    // SORI.TTS가 있으면 우선 사용
    if (window.SORI?.TTS?.speak) {
      await window.SORI.TTS.speak(text, { rate });
      return;
    }
    // Web Speech API 폴백
    return new Promise((resolve, reject) => {
      try {
        if (!("speechSynthesis" in window)) return reject(new Error("No speechSynthesis"));
        const synth = window.speechSynthesis;
        synth.cancel(); // 중복 방지
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ko-KR";
        u.rate = rate || 0.75;
        const pickVoice = () => {
          const vs = synth.getVoices();
          const ko = vs.find(
            (v) =>
              v.lang?.toLowerCase().startsWith("ko") ||
              v.name?.toLowerCase().includes("korean") ||
              v.name?.includes("한국")
          );
          if (ko) u.voice = ko;
          synth.speak(u);
        };
        u.onerror = (e) => reject(e.error || e);
        u.onend = () => resolve();
        if (synth.getVoices().length === 0) {
          synth.onvoiceschanged = () => pickVoice();
        } else {
          pickVoice();
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  async function playAudio() {
    const p = phrases[currentIndex];
    if (!p) return;
    try {
      const rate = parseFloat(els.speed.value || "0.75");
      await speak(p.k, rate);
      markDotAndAward();
    } catch (e) {
      console.warn(e);
      showError("Audio playback failed.");
    }
  }

  function markDotAndAward() {
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
    // 진행 저장 (있으면)
    try {
      if (window.SoriState?.onPracticeComplete) {
        window.SoriState.onPracticeComplete(p.id, 5);
      }
    } catch (e) {
      console.warn("onPracticeComplete failed", e);
    }
  }

  // ---------- Next / Prev ----------
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
    updateScrapBtn(null);
    resetDots(true);
  }

  // ---------- 이벤트 ----------
  function bindEvents() {
    els.dailyBtn?.addEventListener("click", () => handleTab("daily"));
    els.travelBtn?.addEventListener("click", () => handleTab("travel"));
    els.dramaBtn?.addEventListener("click", () => handleTab("drama"));
    els.savedBtn?.addEventListener("click", () => handleTab("saved"));

    els.scrapBtn?.addEventListener("click", toggleScrap);
    els.playBtn?.addEventListener("click", playAudio);
    els.nextBtn?.addEventListener("click", nextPhrase);
    els.prevBtn?.addEventListener("click", prevPhrase);

    els.speed?.addEventListener("input", () => {
      const v = parseFloat(els.speed.value || "0.75");
      els.speedTxt.textContent = (Math.round(v * 100) / 100).toString() + "x";
    });

    // 로그인 상태 변화 → Saved 탭/별 상태 동기화
    if (window.firebase?.auth) {
      firebase.auth().onAuthStateChanged(async (user) => {
        // state.js에서 loginBtn 텍스트/모달 처리는 해주고 있음
        if (user && window.db) {
          try {
            const ref = db.collection("users").doc(user.uid);
            const snap = await ref.get();
            if (snap.exists && snap.data().savedList) {
              savedList = snap.data().savedList || [];
              localStorage.setItem("soriSaved", JSON.stringify(savedList));
            }
          } catch (e) {
            console.warn("load savedList error", e);
          }
        }
        // Saved 탭을 보고 있었다면 다시 그려주기
        if (currentCategory === "saved") handleTab("saved");
      });
    }
  }

  // ---------- 초기화 ----------
  window.addEventListener("DOMContentLoaded", () => {
    // 로컬 saved 복구 (게스트 모드에서도 유지)
    try {
      const local = localStorage.getItem("soriSaved");
      if (local) savedList = JSON.parse(local) || [];
    } catch {}
    bindEvents();
    loadData();
  });
})();
