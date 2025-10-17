// UI wiring + rendering (self-contained, safe fallbacks)
(function () {
  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);

  // 안전 폴백: 전역 네임스페이스
  if (!window.SORI) window.SORI = {};

  // 데이터 접근자 (dataindex.js가 있으면 그걸 사용)
  const D = () => (window.SORI_DATA || {});

  // 안전한 서브필터/아이콘 폴백
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

  // ---------- Local App State (이 파일이 스스로 관리) ----------
  const st = {
    cat: 'daily',
    sub: null,
    i: 0,
    repCount: 0,
    spd: 0.75,
    filteredLines: []
  };

  // 라인 소스 얻기
  function getLinesForCat() {
    const data = D();
    const all = st.cat === 'drama' ? (data.dramaAll || data.drama || [])
             : st.cat === 'daily' ? (data.dailyAll || data.daily || [])
             :                      (data.travelAll || data.travel || []);
    return st.sub ? all.filter(x => x.sub === st.sub) : all;
  }

  // 최초/카테고리 변경시 재계산
  function recomputeFiltered() {
    let lines = getLinesForCat();
    if (!Array.isArray(lines) || lines.length === 0) {
      // 데이터가 아직 안 들어온 경우도 대비
      lines = [];
    }
    st.filteredLines = lines;
    if (st.i >= lines.length) st.i = Math.max(0, lines.length - 1);
    if (st.i < 0) st.i = 0;
  }

  // 외부에서 쓰던 API 모사해서 노출 (기존 코드/다른 파일 호환)
  const StateAPI = {
    get: () => st,
    setCat: (cat) => { st.cat = cat; st.sub = null; st.i = 0; st.repCount = 0; recomputeFiltered(); },
    setSub: (sub) => { st.sub = sub; st.i = 0; st.repCount = 0; recomputeFiltered(); },
    setSpeed: (v) => { st.spd = v; },
    resetRep: () => { st.repCount = 0; },
    incRep: () => { st.repCount = Math.min(5, (st.repCount || 0) + 1); },
    next: () => { if (st.i < st.filteredLines.length - 1) { st.i++; st.repCount = 0; } },
    prev: () => { if (st.i > 0) { st.i--; st.repCount = 0; } }
  };

  // 전역으로도 노출(다른 파일이 기대할 수 있으니)
  window.SORI.State = window.SORI.State || StateAPI;

  // ---------- TTS (SORI.TTS 없으면 브라우저 폴백) ----------
  async function speakKorean(text, rate) {
    // SORI.TTS가 있다면 우선 사용
    if (window.SORI?.TTS?.speak) {
      return window.SORI.TTS.speak(text, { rate });
    }
    // 폴백: Web Speech API
    return new Promise((resolve, reject) => {
      try {
        if (!('speechSynthesis' in window)) return reject(new Error('No speechSynthesis'));
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ko-KR';
        u.rate = rate || 0.75;
        // 한국어 보이스 선택
        const pick = () => {
          const vs = synth.getVoices();
          const ko = vs.find(v => v.lang?.toLowerCase().startsWith('ko') || v.name?.toLowerCase().includes('korean') || v.name?.includes('한국'));
          if (ko) u.voice = ko;
          synth.speak(u);
        };
        u.onerror = (e) => reject(e.error || e);
        u.onend = () => resolve();
        if (synth.getVoices().length === 0) {
          synth.onvoiceschanged = () => pick();
        } else {
          pick();
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  // ---------- UI ----------
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
    const cat = st.cat;
    if (cat === 'drama') el.dramaBtn?.classList.add('active');
    else if (cat === 'daily') el.dailyBtn?.classList.add('active');
    else if (cat === 'travel') el.travelBtn?.classList.add('active');
  }

  function updateSubFilters() {
    const map = window.subCategories || {};
    const icons = window.subIcons || {};
    if (!el.subFilters) return;

    if (st.cat === 'drama' || !Array.isArray(map[st.cat]) || map[st.cat].length === 0) {
      el.subFilters.style.display = 'none';
      el.subFilters.innerHTML = '';
      return;
    }
    el.subFilters.style.display = 'block';

    const chips = ['All', ...map[st.cat]];
    const active = st.sub;

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
      console.error('updateSubFilters render error:', err);
      el.subFilters.innerHTML = `<div class="sub-filters"><div class="filter-chip active">All</div></div>`;
    }
  }

  function updateRepetitionDisplay() {
    if (el.repCount) el.repCount.textContent = st.repCount || 0;
    el.dots.forEach((d, i) => {
      if (!d) return;
      const done = i < (st.repCount || 0);
      d.classList.toggle('completed', done);
      d.textContent = done ? '✓' : '';
    });
    if (el.congrats) {
      if ((st.repCount || 0) >= 5) el.congrats.classList.add('show');
      else el.congrats.classList.remove('show');
    }
  }

  function show() {
    // 데이터 재계산 (데이터 파일이 늦게 로드되는 경우 대비)
    if (!st.filteredLines || st.filteredLines.length === 0) {
      recomputeFiltered();
    }
    const arr = st.filteredLines;
    if (!arr || arr.length === 0) {
      // 데이터가 아직 없으면 UI만 유지
      if (el.prog) el.prog.textContent = '0 / 0';
      return;
    }
    const d = arr[st.i];
    if (el.badge) el.badge.textContent = d.t;
    if (el.context) el.context.textContent = 'Conversation: ' + d.c;
    if (el.korean) el.korean.textContent = d.k;
    if (el.pron) el.pron.textContent = d.p;
    if (el.english) el.english.textContent = `"${d.e}"`;
    if (el.prog) el.prog.textContent = (st.i + 1) + ' / ' + arr.length;

    st.repCount = 0;
    updateRepetitionDisplay();
  }

  function showError(msg) {
    if (!el.err) return;
    el.err.textContent = msg;
    el.err.style.display = 'block';
    setTimeout(() => { el.err.style.display = 'none'; }, 4000);
  }

  async function play() {
    const arr = st.filteredLines;
    if (!arr || arr.length === 0) return;
    const txt = arr[st.i].k;

    try {
      await speakKorean(txt, st.spd);
      if (st.repCount < 5) {
        st.repCount += 1;
        updateRepetitionDisplay();

        if (st.repCount >= 5) {
          // Firestore 저장 훅 (있으면 호출)
          try {
            const phraseId = txt;
            if (window.SoriState?.onPracticeComplete) {
              await window.SoriState.onPracticeComplete(phraseId, 5);
            }
          } catch (e) {
            // 저장 실패는 UI 진행에 영향 주지 않음
            console.warn('onPracticeComplete failed (non-fatal):', e);
          }

          // 자동 다음
          setTimeout(() => {
            if (st.i < st.filteredLines.length - 1) {
              st.i++;
              st.repCount = 0;
              show();
            } else {
              showError('You completed all phrases in this set!');
            }
          }, 1000);
        }
      }
    } catch (e) {
      console.error(e);
      showError('Speech failed. Try again or check browser settings.');
    }
  }

  function bindEvents() {
    el.dailyBtn?.addEventListener('click', () => {
      StateAPI.setCat('daily'); setActiveTab(); updateSubFilters(); show();
    });
    el.travelBtn?.addEventListener('click', () => {
      StateAPI.setCat('travel'); setActiveTab(); updateSubFilters(); show();
    });
    el.dramaBtn?.addEventListener('click', () => {
      StateAPI.setCat('drama'); setActiveTab(); updateSubFilters(); show();
    });

    // sub filter delegation
    el.subFilters?.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      const v = chip.getAttribute('data-sub') || null;
      StateAPI.setSub(v || null);
      updateSubFilters(); show();
    });

    el.playBtn?.addEventListener('click', play);
    el.prevBtn?.addEventListener('click', () => { StateAPI.prev(); show(); });
    el.nextBtn?.addEventListener('click', () => { StateAPI.next(); show(); });

    el.speed?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      StateAPI.setSpeed(val);
      if (el.speedTxt) el.speedTxt.textContent = val.toFixed(2).replace(/\.?0+$/,'') + 'x';
    });
  }

  function init() {
    cacheEls();
    recomputeFiltered();
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

