// UI wiring + rendering
(function () {
  const $ = (id) => document.getElementById(id);
  const S = () => window.SORI.State.get();
  const D = () => window.SORI_DATA || {};

  // 안전한 기본값 (데이터index.js가 없을 경우에도 작동)
  window.subCategories = window.subCategories || {
    daily: ['Greeting','Cafe','Restaurant','Shopping','Health','Social','Work','Tech','Exercise'],
    travel: ['Airport','Hotel','Transport','Emergency','Convenience','Street Food','Market','Duty Free','Department','Food Court','Payment','Delivery','Sightseeing'],
  };

  window.subIcons = window.subIcons || {
    'Greeting':'👋','Cafe':'☕','Restaurant':'🍽️','Shopping':'🛍️','Health':'💊','Social':'👥',
    'Work':'💼','Tech':'🖥️','Exercise':'🏃',
    'Airport':'✈️','Hotel':'🏨','Transport':'🚇','Emergency':'🆘',
    'Convenience':'🏪','Street Food':'🌭','Market':'🧺','Duty Free':'🛂','Department':'🏬',
    'Food Court':'🥢','Payment':'💳','Delivery':'📦','Sightseeing':'📍'
  };

  // UI elements
  let el = {};

  function cacheEls() {
    el.dailyBtn = $('dailyBtn');
    el.travelBtn = $('travelBtn');
    el.dramaBtn = $('dramaBtn');
    el.subFilters = $('subFilters');
    el.badge = $('badge');
    el.context = $('context');
    el.korean = $('korean');
    el.pron = $('pronunciation');
    el.english = $('english');
    el.repCount = $('repCount');
    el.dots = [ $('dot1'), $('dot2'), $('dot3'), $('dot4'), $('dot5') ];
    el.congrats = $('congrats');
    el.playBtn = $('playBtn');
    el.prevBtn = $('prevBtn');
    el.nextBtn = $('nextBtn');
    el.prog = $('prog');
    el.err = $('errorMsg');
    el.speed = $('speed');
    el.speedTxt = $('speedTxt');
  }

  function setActiveTab() {
    el.dramaBtn?.classList.remove('active');
    el.dailyBtn?.classList.remove('active');
    el.travelBtn?.classList.remove('active');
    const cat = S().cat;
    if (cat === 'drama') el.dramaBtn?.classList.add('active');
    else if (cat === 'daily') el.dailyBtn?.classList.add('active');
    else if (cat === 'travel') el.travelBtn?.classList.add('active');
  }

  // 수정된 updateSubFilters (에러 방지 + 폴백)
  function updateSubFilters() {
    const cat = S().cat;
    const map = window.subCategories || {};
    const icons = window.subIcons || {};
    if (!el.subFilters) return;

    if (cat === 'drama' || !map[cat] || map[cat].length === 0) {
      el.subFilters.style.display = 'none';
      el.subFilters.innerHTML = '';
      return;
    }

    el.subFilters.style.display = 'block';
    const chips = ['All', ...map[cat]];
    const active = S().sub;

    try {
      el.subFilters.innerHTML =
        `<div class="sub-filters">` +
        chips.map(label => {
          const val = label === 'All' ? null : label;
          const selected = (val === active) || (label === 'All' && active == null);
          const icon = label !== 'All' && icons[label] ? icons[label] + ' ' : '';
          return `<div class="filter-chip ${selected ? 'active' : ''}" data-sub="${val ?? ''}">${icon}${label}</div>`;
        }).join('') +
        `</div>`;
    } catch (err) {
      console.error('updateSubFilters error:', err);
      el.subFilters.innerHTML = `<div class="sub-filters"><div class="filter-chip active">All</div></div>`;
    }
  }

  function updateRepetitionDisplay() {
    if (el.repCount) el.repCount.textContent = S().repCount || 0;
    el.dots.forEach((d, i) => {
      if (!d) return;
      const done = i < (S().repCount || 0);
      d.classList.toggle('completed', done);
      d.textContent = done ? '✓' : '';
    });
    if (el.congrats) {
      if ((S().repCount || 0) >= 5) el.congrats.classList.add('show');
      else el.congrats.classList.remove('show');
    }
  }

  function show() {
    const st = S();
    const arr = st.filteredLines;
    if (!arr || arr.length === 0) return;
    const d = arr[st.i];
    if (el.badge) el.badge.textContent = d.t;
    if (el.context) el.context.textContent = 'Conversation: ' + d.c;
    if (el.korean) el.korean.textContent = d.k;
    if (el.pron) el.pron.textContent = d.p;
    if (el.english) el.english.textContent = `"${d.e}"`;
    if (el.prog) el.prog.textContent = (st.i + 1) + ' / ' + arr.length;
    window.SORI.State.resetRep();
    updateRepetitionDisplay();
  }

  function showError(msg) {
    if (!el.err) return;
    el.err.textContent = msg;
    el.err.style.display = 'block';
    setTimeout(() => { el.err.style.display = 'none'; }, 4000);
  }

  async function play() {
    const st = S();
    const arr = st.filteredLines;
    if (!arr || arr.length === 0) return;

    const txt = arr[st.i].k;

    try {
      await window.SORI.TTS.speak(txt, { rate: st.spd });
      if (S().repCount < 5) {
        window.SORI.State.incRep();
        updateRepetitionDisplay();
        if (S().repCount >= 5) {
          setTimeout(() => {
            if (S().i < S().filteredLines.length - 1) {
              window.SORI.State.next();
              show();
            } else {
              showError('You completed all phrases in this set!');
            }
          }, 1000);
        }
      }
    } catch (e) {
      showError('Speech failed. Try again or check browser settings.');
    }
  }

  function bindEvents() {
    el.dailyBtn?.addEventListener('click', () => {
      window.SORI.State.setCat('daily');
      setActiveTab();
      updateSubFilters();
      show();
    });
    el.travelBtn?.addEventListener('click', () => {
      window.SORI.State.setCat('travel');
      setActiveTab();
      updateSubFilters();
      show();
    });
    el.dramaBtn?.addEventListener('click', () => {
      window.SORI.State.setCat('drama');
      setActiveTab();
      updateSubFilters();
      show();
    });

    el.subFilters?.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      const v = chip.getAttribute('data-sub') || null;
      window.SORI.State.setSub(v || null);
      updateSubFilters();
      show();
    });

    el.playBtn?.addEventListener('click', play);
    el.prevBtn?.addEventListener('click', () => { window.SORI.State.prev(); show(); });
    el.nextBtn?.addEventListener('click', () => { window.SORI.State.next(); show(); });

    el.speed?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      window.SORI.State.setSpeed(val);
      if (el.speedTxt) el.speedTxt.textContent = val.toFixed(2).replace(/\.?0+$/,'') + 'x';
    });
  }

  function init() {
    cacheEls();
    setActiveTab();
    updateSubFilters();
    show();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
