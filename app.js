// app.js
(function(){
  const st = window.SoriState.st;

  function getLines() {
    const { dramaAll, dailyAll, travelAll } = window.SoriData;
    const base = st.cat === 'drama' ? dramaAll : st.cat === 'daily' ? dailyAll : travelAll;
    return st.sub ? base.filter(item => item.sub === st.sub) : base;
  }

  function updateSubFilters() {
    const container = document.getElementById('subFilters');
    if (!container) return;

    if (st.cat === 'drama') {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    container.style.display = 'block';
    const cats = window.SoriData.subCategories[st.cat] || [];
    const subIcons = window.SoriData.subIcons;

    container.innerHTML =
      '<div class="sub-filters">' +
      '<div class="filter-chip ' + (!st.sub ? 'active' : '') + '" onclick="window.SoriApp.filterSub(null)">All</div>' +
      cats.map(cat =>
        '<div class="filter-chip ' + (st.sub === cat ? 'active' : '') + '" onclick="window.SoriApp.filterSub(\'' + cat + '\')">' +
        (subIcons[cat] ? subIcons[cat] + ' ' : '🏷️ ') + cat +
        '</div>'
      ).join('') +
      '</div>';
  }

  function filterSub(sub) {
    st.sub = sub;
    st.i = 0;
    st.filteredLines = getLines();
    updateSubFilters();
    show();
  }

  function updateRepetitionDisplay() {
    const repCountEl = document.getElementById('repCount');
    if (repCountEl) repCountEl.textContent = st.repCount || 0;

    for (let i = 1; i <= 5; i++) {
      const dot = document.getElementById('dot' + i);
      if (!dot) continue;
      if (i <= (st.repCount || 0)) {
        dot.classList.add('completed');
        dot.textContent = '✓';
      } else {
        dot.classList.remove('completed');
        dot.textContent = '';
      }
    }

    const congrats = document.getElementById('congrats');
    if (congrats) {
      if ((st.repCount || 0) >= 5) congrats.classList.add('show');
      else congrats.classList.remove('show');
    }
  }

  function show() {
    st.filteredLines = getLines();

    if (st.filteredLines.length === 0) {
      const { dramaAll, dailyAll, travelAll } = window.SoriData;
      st.filteredLines = st.cat === 'drama' ? dramaAll : st.cat === 'daily' ? dailyAll : travelAll;
      st.i = 0;
    }
    if (st.i >= st.filteredLines.length) st.i = 0;
    if (st.i < 0) st.i = 0;

    st.repCount = 0;

    const d = st.filteredLines[st.i];
    const badgeEl = document.getElementById('badge');
    const contextEl = document.getElementById('context');
    const koreanEl = document.getElementById('korean');
    const pronEl = document.getElementById('pronunciation');
    const engEl = document.getElementById('english');
    const progEl = document.getElementById('prog');

    if (badgeEl)   badgeEl.textContent = d.t;
    if (contextEl) contextEl.textContent = 'Conversation: ' + d.c;
    if (koreanEl)  koreanEl.textContent = d.k;
    if (pronEl)    pronEl.textContent = d.p;
    if (engEl)     engEl.textContent = '"' + d.e + '"';
    if (progEl)    progEl.textContent = (st.i + 1) + ' / ' + st.filteredLines.length;

    updateRepetitionDisplay();
  }

  function prev() {
    if (st.i > 0) {
      st.i--;
      st.repCount = 0;
      show();
    }
  }

  function next() {
    if (st.i < st.filteredLines.length - 1) {
      st.i++;
      st.repCount = 0;
      show();
    }
  }

  function autoNext() {
    if (st.repCount >= 5) {
      if (window.SoriState.currentUser && window.SoriState.db) { window.SoriState.updatePracticeStats(); }
      setTimeout(() => {
        if (st.i < st.filteredLines.length - 1) next();
        else window.SoriState.showError('🎉 You completed all phrases! Great work!');
      }, 2000);
    }
  }

  function switchCategory(cat) {
    st.cat = cat;
    st.sub = null;
    st.i = 0;
    st.repCount = 0;

    document.getElementById('dramaBtn')?.classList.remove('active');
    document.getElementById('dailyBtn')?.classList.remove('active');
    document.getElementById('travelBtn')?.classList.remove('active');

    if (cat === 'drama') document.getElementById('dramaBtn')?.classList.add('active');
    else if (cat === 'daily') document.getElementById('dailyBtn')?.classList.add('active');
    else if (cat === 'travel') document.getElementById('travelBtn')?.classList.add('active');

    updateSubFilters();
    show();
  }

  // Event bindings
  document.getElementById('dramaBtn').addEventListener('click', () => switchCategory('drama'));
  document.getElementById('dailyBtn').addEventListener('click', () => switchCategory('daily'));
  document.getElementById('travelBtn').addEventListener('click', () => switchCategory('travel'));
  document.getElementById('playBtn').addEventListener('click', () => window.SoriTTS.playCurrent());
  document.getElementById('prevBtn').addEventListener('click', prev);
  document.getElementById('nextBtn').addEventListener('click', next);

  document.getElementById('speed').addEventListener('input', (e) => {
    st.spd = parseFloat(e.target.value);
    const speedTxt = document.getElementById('speedTxt');
    if (speedTxt) speedTxt.textContent = st.spd + 'x';
  });

  // Init
  st.filteredLines = getLines(); // initial compute
  document.getElementById('dailyBtn').classList.add('active');
  updateSubFilters();
  show();

  // Helpers for other modules
  function getCurrentList(){ return st.filteredLines; }
  function getCurrentPhraseId(){ const cur = st.filteredLines[st.i]; return cur ? cur.k : ''; }

  // Expose
  window.SoriApp = {
    filterSub, updateRepetitionDisplay, autoNext,
    getCurrentList, getCurrentPhraseId
  };
})();
