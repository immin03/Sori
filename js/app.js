/* js/app.js
   Sori main UI logic
   Requires: window.SORI_DATA (from dataindex.js), window.SoriTTS (from tts.js), optional window.SoriState
*/
(function () {
  // ---------- Guards ----------
  if (!window.SORI_DATA) {
    console.error("SORI_DATA is not loaded. Make sure data/*.js and dataindex.js are included before app.js");
    return;
  }

  const {
    dailyAll,
    travelAll,
    dramaAll,
    subCategories,
    subIcons
  } = window.SORI_DATA;

  const hasState = !!window.SoriState;
  const hasTTS = !!window.SoriTTS;

  // ---------- App State ----------
  const st = {
    cat: "daily",     // daily | travel | drama
    sub: null,        // subcategory name or null
    i: 0,             // index within current list
    spd: 0.75,        // 0.3 ~ 1.5
    repCount: 0,      // 0 ~ 5
    filteredLines: [] // current list
  };

  // ---------- DOM ----------
  const els = {
    // tabs
    dailyBtn:   document.getElementById("dailyBtn"),
    travelBtn:  document.getElementById("travelBtn"),
    dramaBtn:   document.getElementById("dramaBtn"),
    subFilters: document.getElementById("subFilters"),

    // main card
    badge:   document.getElementById("badge"),
    context: document.getElementById("context"),
    korean:  document.getElementById("korean"),
    english: document.getElementById("english"),
    pron:    document.getElementById("pronunciation"),
    prog:    document.getElementById("prog"),

    // repetition
    repCount: document.getElementById("repCount"),
    dots: [1,2,3,4,5].map(n => document.getElementById("dot"+n)),
    congrats: document.getElementById("congrats"),

    // controls
    playBtn:  document.getElementById("playBtn"),
    prevBtn:  document.getElementById("prevBtn"),
    nextBtn:  document.getElementById("nextBtn"),
    speed:    document.getElementById("speed"),
    speedTxt: document.getElementById("speedTxt"),

    // misc
    err: document.getElementById("errorMsg")
  };

  // ---------- Helpers ----------
  function baseByCat() {
    if (st.cat === "drama") return dramaAll;
    if (st.cat === "travel") return travelAll;
    return dailyAll;
  }

  function computeLines() {
    const base = baseByCat();
    return st.sub ? base.filter(item => item.sub === st.sub) : base;
  }

  function showError(msg) {
    if (!els.err) return;
    els.err.textContent = msg;
    els.err.style.display = "block";
    setTimeout(() => { els.err.style.display = "none"; }, 4000);
  }

  function setActiveTab() {
    els.dailyBtn?.classList.remove("active");
    els.travelBtn?.classList.remove("active");
    els.dramaBtn?.classList.remove("active");
    if (st.cat === "daily") els.dailyBtn?.classList.add("active");
    else if (st.cat === "travel") els.travelBtn?.classList.add("active");
    else if (st.cat === "drama") els.dramaBtn?.classList.add("active");
  }

  function updateSubFilters() {
    const c = els.subFilters;
    if (!c) return;

    // drama: hide sub-filter by default
    if (st.cat === "drama") {
      c.style.display = "none";
      c.innerHTML = "";
      return;
    }

    const cats = subCategories[st.cat] || [];
    c.style.display = "block";

    const chips = [
      `<div class="sub-filters">`,
      `<div class="filter-chip ${!st.sub ? "active":""}" data-sub="">All</div>`,
      ...cats.map(cat => {
        const icon = subIcons[cat] ? `${subIcons[cat]} ` : "";
        const active = st.sub === cat ? "active" : "";
        return `<div class="filter-chip ${active}" data-sub="${cat}">${icon}${cat}</div>`;
      }),
      `</div>`
    ].join("");

    c.innerHTML = chips;

    // delegate clicks
    c.querySelectorAll(".filter-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const sub = chip.getAttribute("data-sub");
        filterSub(sub || null);
      });
    });
  }

  function updateRepetitionUI() {
    if (els.repCount) els.repCount.textContent = st.repCount || 0;
    els.dots.forEach((dot, idx) => {
      if (!dot) return;
      const done = idx < (st.repCount || 0);
      dot.classList.toggle("completed", done);
      dot.textContent = done ? "✓" : "";
    });

    if (els.congrats) {
      if ((st.repCount || 0) >= 5) els.congrats.classList.add("show");
      else els.congrats.classList.remove("show");
    }
  }

  function render() {
    st.filteredLines = computeLines();
    if (st.filteredLines.length === 0) {
      // fallback to base
      st.sub = null;
      st.filteredLines = baseByCat();
      st.i = 0;
    }
    if (st.i < 0) st.i = 0;
    if (st.i >= st.filteredLines.length) st.i = 0;

    st.repCount = 0;

    const d = st.filteredLines[st.i];
    if (els.badge)   els.badge.textContent   = d.t;
    if (els.context) els.context.textContent = "Conversation: " + d.c;
    if (els.korean)  els.korean.textContent  = d.k;
    if (els.pron)    els.pron.textContent    = d.p;
    if (els.english) els.english.textContent = `"${d.e}"`;
    if (els.prog)    els.prog.textContent    = `${st.i + 1} / ${st.filteredLines.length}`;

    updateRepetitionUI();
  }

  function speakCurrent() {
    const d = st.filteredLines[st.i];
    if (!d) return;

    if (!hasTTS || !window.SoriTTS.isSupported()) {
      showError("Your browser does not support text-to-speech. Try Chrome, Safari, or Edge.");
      return;
    }

    // ensure speed
    window.SoriTTS.setRate(st.spd);

    // Safari quirk: cancel before speak
    window.SoriTTS.cancel();
    window.SoriTTS.speakKo(d.k, {
      onError: () => showError("Speech failed. Please try again.")
    });

    // repetition progress
    if (st.repCount < 5) {
      st.repCount += 1;
      updateRepetitionUI();
      if (st.repCount >= 5) {
        // award + move to next
        if (hasState) {
          try {
            const phraseId = d.k; // simple id
            window.SoriState.onPracticeComplete?.(phraseId, 5);
          } catch (e) {
            // non-fatal
          }
        }
        setTimeout(autoNext, 1500);
      }
    }
  }

  function prev() {
    if (st.i > 0) {
      st.i -= 1;
      st.repCount = 0;
      render();
    }
  }

  function next() {
    if (st.i < st.filteredLines.length - 1) {
      st.i += 1;
      st.repCount = 0;
      render();
    }
  }

  function autoNext() {
    if (st.i < st.filteredLines.length - 1) {
      next();
    } else {
      showError("You completed all phrases! Great work!");
    }
  }

  function filterSub(sub) {
    st.sub = sub;
    st.i = 0;
    st.repCount = 0;
    st.filteredLines = computeLines();
    updateSubFilters();
    render();
  }

  function switchCat(cat) {
    if (st.cat === cat) return;
    st.cat = cat;
    st.sub = null;
    st.i = 0;
    st.repCount = 0;
    setActiveTab();
    updateSubFilters();
    render();
  }

  // ---------- Wire events ----------
  els.dailyBtn?.addEventListener("click", () => switchCat("daily"));
  els.travelBtn?.addEventListener("click", () => switchCat("travel"));
  els.dramaBtn?.addEventListener("click", () => switchCat("drama"));

  els.playBtn?.addEventListener("click", speakCurrent);
  els.prevBtn?.addEventListener("click", prev);
  els.nextBtn?.addEventListener("click", next);

  els.speed?.addEventListener("input", (e) => {
    const v = parseFloat(e.target.value || "0.75");
    st.spd = Math.max(0.3, Math.min(1.5, v));
    if (els.speedTxt) els.speedTxt.textContent = st.spd + "x";
    if (hasTTS) window.SoriTTS.setRate(st.spd);
  });

  // ---------- Init ----------
  st.filteredLines = computeLines();
  setActiveTab();
  updateSubFilters();

  // if TTS present, wait for voices then render once to be safe
  const start = () => render();

  if (hasTTS && window.SoriTTS.ready) {
    window.SoriTTS.ready.then(() => start());
  } else {
    start();
  }
})();
