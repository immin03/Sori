/* js/app.js — 2025-10 Stable
   탭 이동 · 스크랩 · 연습 진행 · 음성 재생 (방어코드/오프라인 폴백 강화)
*/
(function () {
  // ============ 유틸 ============
  const $ = (id) => document.getElementById(id);
  const getAuthUser = () =>
    (window.firebase && firebase.auth && firebase.auth().currentUser) || null;

  // 데이터 인덱스 가져오기 (여러 전역 키 폴백)
  function getAllData() {
    return (
      window.SoriDataIndex ||
      window.SORI_DATA ||
      window.SORI?.DATA ||
      {} // 없으면 빈 객체
    );
  }

  // phrase.id가 없을 때를 대비해 안정적인 ID 생성
  function ensureId(p) {
    if (p.id) return p.id;
    // 같은 문장을 각 카테고리에서 구분할 수 있도록 t/k/c 조합
    p.id = [p.t || "", p.k || "", p.c || ""].join("|");
    return p.id;
  }

  // ============ 로컬 상태 ============
  let currentCategory = "daily";
  let currentIndex = 0;
  let phrases = [];
  let savedList = []; // phrase.id 배열

  // ============ 엘리먼트 캐시 ============
  // (defer 로드 전제. 방어적으로 Optional Chaining 사용)
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
    congrats: $("congrats"),

    playBtn: $("playBtn"),
    nextBtn: $("nextBtn"),
    prevBtn: $("prevBtn"),
    prog: $("prog"),
    errorMsg: $("errorMsg"),

    speed: $("speed"),
    speedTxt: $("speedTxt"),
  };

  // ============ 데이터 로딩 ============
  function loadPhrasesFor(cat) {
    const all = getAllData();
    const arr = all?.[cat] || [];
    // id 보정
    arr.forEach(ensureId);
    return arr;
  }

  function loadData() {
    phrases = loadPhrasesFor(currentCategory);
    currentIndex = 0;
    renderPhrase();
  }

  // ============ 탭 ============
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
      if (!getAuthUser()) {
        showMessage("Please login to check your scraps.");
        phrases = [];
        setActiveTab(tab);
        return;
      }
      // 저장 목록을 실제 문장 배열로 변환
      const all = getAllData();
      const pool = ["daily", "travel", "drama"]
        .flatMap((c) => (all[c] || []).map((p) => ({ ...p, id: ensureId(p) })));
      phrases = savedList
        .map((id) => pool.find((p) => p.id === id))
        .filter(Boolean);

      if (phrases.length === 0) {
        showMessage("No saved phrases yet.");
      } else {
        renderPhrase();
      }
      setActiveTab(tab);
      return;
    }

    // 일반 탭
    loadData();
    setActiveTab(tab);
  }

  // ============ 렌더링 ============
  function renderPhrase() {
    if (!phrases || phrases.length === 0) {
      // 비어있을 때는 UI를 초기화
      els.korean && (els.korean.textContent = "");
      els.english && (els.english.textContent = "");
      els.pronunciation && (els.pronunciation.textContent = "");
      els.badge && (els.badge.textContent = "");
      els.context && (els.context.textContent = "");
      els.prog && (els.prog.textContent = "");
      updateScrapBtn(null);
      resetDots(true);
      return;
    }

    const p = phrases[currentIndex] || {};
    els.korean && (els.korean.textContent = p.k || "");
    els.english && (els.english.textContent = p.e ? `"${p.e}"` : "");
    els.pronunciation && (els.pronunciation.textContent = p.p || "");
    els.badge && (els.badge.textContent = p.t || "");
    els.context && (els.context.textContent = p.c || "");
    els.prog && (els.prog.textContent = `${currentIndex + 1} / ${phrases.length}`);

    updateScrapBtn(ensureId(p));
    resetDots(true);
  }

  // ============ 스크랩 ============
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

    const id = ensureId(p);
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
      console.warn("[savedList] cloud save failed:", e);
    }
    // 로컬 동기화
    try {
      localStorage.setItem("soriSaved", JSON.stringify(savedList));
    } catch {}
  }

  // ============ 연습/음성 ============
  function resetDots(hideCongrats = false) {
    els.repDots.forEach((d) => d.classList.remove("completed"));
    if (els.repCount) els.repCount.textContent = "0";
    if (hideCongrats && els.congrats) els.congrats.classList.remove("show");
  }

  // Web Speech API + TTS 폴백
  async function speak(text, rate) {
    // 커스텀 TTS 있으면 우선 사용
    if (window.SORI?.TTS?.speak) {
      await window.SORI.TTS.speak(text, { rate });
      return;
    }
    // 브라우저 TTS
    await new Promise((resolve, reject) => {
      try {
        if (!("speechSynthesis" in window)) return reject(new Error("No speechSynthesis"));
        const synth = window.speechSynthesis;
        synth.cancel(); // 이전 발화 취소
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ko-KR";
        u.rate = rate || 0.75;

        const startSpeak = () => synth.speak(u);
        const setVoice = () => {
          const vs = synth.getVoices();
          const ko =
            vs.find((v) => v.lang?.toLowerCase().startsWith("ko")) ||
            vs.find((v) => v.name?.toLowerCase().includes("korean")) ||
            vs[0];
          if (ko) u.voice = ko;
        };

        u.onend = resolve;
        u.onerror = (e) => reject(e.error || e);
        if (synth.getVoices().length === 0) {
          synth.onvoiceschanged = () => {
            setVoice();
            startSpeak();
          };
        } else {
          setVoice();
          startSpeak();
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
      const rate = parseFloat(els.speed?.value || "0.75");
      await speak(p.k || "", rate);
      markDotAndAward(p);
    } catch (e) {
      console.warn(e);
      showError("Audio playback failed.");
    }
  }

  function markDotAndAward(p) {
    let n = parseInt(els.repCount?.textContent || "0", 10);
    if (n < 5) {
      n++;
      if (els.repCount) els.repCount.textContent = String(n);
      if (els.repDots[n - 1]) els.repDots[n - 1].classList.add("completed");
      if (n === 5 && els.congrats) {
        els.congrats.classList.add("show");
        setTimeout(() => els.congrats.classList.remove("show"), 1800);
      }
    }
    // 진행 리포트(선택)
    try {
      if (p && window.SoriState?.onPracticeComplete) {
        window.SoriState.onPracticeComplete(ensureId(p), 5);
      }
    } catch (e) {
      console.warn("onPracticeComplete failed:", e);
    }
  }

  // ============ Next / Prev ============
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

  // ============ 메시지 & 에러 ============
  function showError(msg) {
    if (!els.errorMsg) return;
    els.errorMsg.style.display = "block";
    els.errorMsg.textContent = msg;
    setTimeout(() => (els.errorMsg.style.display = "none"), 2200);
  }
  function showMessage(msg) {
    els.korean && (els.korean.textContent = msg);
    els.english && (els.english.textContent = "");
    els.pronunciation && (els.pronunciation.textContent = "");
    els.badge && (els.badge.textContent = "");
    els.context && (els.context.textContent = "");
    els.prog && (els.prog.textContent = "");
    updateScrapBtn(null);
    resetDots(true);
  }

  // ============ 이벤트 바인딩 ============
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
      const v = Number(els.speed?.value || 0.75);
      if (els.speedTxt) els.speedTxt.textContent = `${v.toFixed(2).replace(/\.?0+$/,"")}x`;
    });

    // 로그인 상태 동기화(저장목록/버튼 텍스트 등은 state.js가 처리)
    if (window.firebase?.auth) {
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user && window.db) {
          try {
            const ref = db.collection("users").doc(user.uid);
            const snap = await ref.get();
            if (snap.exists && snap.data().savedList) {
              savedList = snap.data().savedList || [];
              try { localStorage.setItem("soriSaved", JSON.stringify(savedList)); } catch {}
            }
          } catch (e) {
            console.warn("load savedList error:", e);
          }
        }
        if (currentCategory === "saved") handleTab("saved");
        else updateScrapBtn(phrases[currentIndex]?.id);
      });
    }
  }

  // ============ 초기화 ============
  window.addEventListener("DOMContentLoaded", () => {
    // 로컬 저장 스크랩 불러오기(게스트용)
    try {
      const local = localStorage.getItem("soriSaved");
      if (local) savedList = JSON.parse(local) || [];
    } catch {}
    bindEvents();
    loadData();
  });
})();
