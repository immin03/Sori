// Global app state + data helpers
(function () {
  window.SORI = window.SORI || {};

  const S = {
    cat: 'daily',     // 'daily' | 'travel' | 'drama'
    sub: null,        // e.g. 'Cafe' | null
    i: 0,             // current index within filteredLines
    spd: 0.75,        // speech rate
    repCount: 0,      // 0..5
    filteredLines: [] // current working set
  };

  function linesFor(cat, sub) {
    const D = window.SORI_DATA || {};
    const base =
      cat === 'drama' ? (D.dramaAll || []) :
      cat === 'daily' ? (D.dailyAll || []) :
                         (D.travelAll || []);
    return sub ? base.filter(x => x.sub === sub) : base;
  }

  function resetFiltered() {
    S.filteredLines = linesFor(S.cat, S.sub);
    if (!Array.isArray(S.filteredLines) || S.filteredLines.length === 0) {
      S.filteredLines = linesFor(S.cat, null);
    }
    if (S.i >= S.filteredLines.length) S.i = 0;
    if (S.i < 0) S.i = 0;
  }

  const API = {
    get() { return S; },
    setCat(cat) { S.cat = cat; S.sub = null; S.i = 0; S.repCount = 0; resetFiltered(); },
    setSub(sub) { S.sub = sub; S.i = 0; S.repCount = 0; resetFiltered(); },
    setIndex(i) { S.i = Math.max(0, Math.min(i, S.filteredLines.length - 1)); S.repCount = 0; },
    next() { if (S.i < S.filteredLines.length - 1) { S.i++; S.repCount = 0; } },
    prev() { if (S.i > 0) { S.i--; S.repCount = 0; } },
    setSpeed(v) { S.spd = Number(v) || 0.75; },
    resetRep() { S.repCount = 0; },
    incRep() { if (S.repCount < 5) S.repCount++; },
    linesFor,
    resetFiltered
  };

  // initialize with initial data
  API.resetFiltered();

  // expose
  window.SORI.State = API;
})();

