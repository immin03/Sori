// js/app.js
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

  // ---------- Local App State ----------
  const st = {
    cat: 'daily',
    sub: null,
    i: 0,
    repCount: 0,
    spd: 0.75,
    filteredLines: []
  };

  // 스크랩(☆) - 로컬 기본값, 로그인 시 state.js가 클라우드와 병합
  const SCRAP_KEY = 'sori_scraps_v1';
  const getLocalScraps = () => {
    try { return JSON.parse(localStorage.getItem(SCRAP_KEY) || '[]'); } catch { return []; }
  };
  const setLocalScraps = (arr) => { try { localStorage.setItem(SCRAP_KEY, JSON.stringify(arr)); } catch {} };
  let scrapSet = new Set(getLocalScraps());

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
      lines = [];
    }
    st.filteredLines = lines;
    if (st.i >= lines.length) st.i = Math.max(0, lines.length - 1);
    if (st.i < 0) st.i = 0;
  }

  // 외부에서 쓰던 API 노출
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
  window.SORI.State = window.SORI.State || StateAPI;

  // ---------- TTS (SORI.TTS 없으면 브라우저 폴백) ----------
  async function speakKorean(text, rate) {
    if (window.SORI?.TTS?.speak) return window.SORI.TTS.speak(text, { rate });
    return new Promise((resolve, reject) => {
      try {
        if (!('speechSynthesis' in window)) return reject(new Error('No speechSynthesis'));
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ko-KR';
        u.rate = rate || 0.75;
        const pick = () => {
          const vs = synth.getVoices();
          const ko = vs.find(v => v.lang?.toLowerCase().startsWith('ko') || v.name?.toLowerCase().includes('korean') || v.name?.includes('한국'));
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

    // 추가 캐시
    el.scrapBtn = $('scrapBtn');
    el.myBtn = $('myBtn');
    el.myModal = $('myModal');
    el.myList = $('myList');
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

  // ----- 스크랩(☆) -----
  const currentPhraseId = () => {
    const arr = st.filteredLines;
    if (!arr || arr.length === 0) return null;
    return arr[st.i]?.k || null; // 한국어 문구 자체를 ID로 사용
  };

  function updateScrapUI() {
    if (!el.scrapBtn) return;
    const id = currentPhraseId();
    const saved = id ? scrapSet.has(id) : false;
    el.scrapBtn.textContent = saved ? '★' : '☆';
    el.scrapBtn.classList.toggle('active', saved);
  }

  async function toggleScrap() {
    const id = currentPhraseId();
    if (!id) return;
    if (scrapSet.has(id)) scrapSet.delete(id); else scrapSet.add(id);
    const arr = [...scrapSet];
    setLocalScraps(arr);
    try { if (window.SoriUser?.setScraps) await window.SoriUser.setScraps(arr); } catch {}
    updateScrapUI();
  }

  // My 모달 리스트 렌더
  function renderMyList() {
    if (!el.myList) return;

    // 최신 스크랩 가져오기 (로그인 시 클라우드 반영)
    (async () => {
      try {
        if (window.SoriUser?.getScraps) {
          const arr = await window.SoriUser.getScraps();
          scrapSet = new Set(arr);
        } else {
          scrapSet = new Set(getLocalScraps());
        }
      } catch { /* noop */ }

      const all = []
        .concat(D().dailyAll || D().daily || [])
        .concat(D().travelAll || D().travel || [])
        .concat(D().dramaAll || D().drama || []);
      const map = new Map(all.map(x => [x.k, x]));
      const items = [...scrapSet].map(id => map.get(id)).filter(Boolean);

      if (items.length === 0) {
        el.myList.innerHTML = '<div style="color:#6b7280;font-size:14px;">아직 스크랩한 문구가 없습니다. ☆ 버튼을 눌러 추가해보세요.</div>';
      } else {
        el.myList.innerHTML = items.map((d) => `
          <div class="card" style="margin:8px 0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div class="badge">${d.t}</div>
              <button class="icon-btn" data-unscrap="${d.k}" title="삭제">★</button>
            </div>
            <div style="font-weight:800;color:#1f2937;font-size:18px;">${d.k}</div>
            <div style="color:#6b7280;font-size:14px;">"${d.e}"</div>
            <button class="secondary" data-jump="${d.k}" style="margin-top:8px;">Go to phrase</button>
          </div>
        `).join('');
      }

      // 삭제/이동 이벤트 위임
      el.myList.onclick = async (e) => {
        const del = e.target.closest('[data-unscrap]');
        const jump = e.target.closest('[data-jump]');
        if (del) {
          const id = del.getAttribute('data-unscrap');
          scrapSet.delete(id);
          const arr = [...scrapSet];
          setLocalScraps(arr);
          try { if (window.SoriUser?.setScraps) await window.SoriUser.setScraps(arr); } catch {}
          renderMyList();
          updateScrapUI();
          return;
        }
        if (jump) {
          const id = jump.getAttribute('data-jump');
          const inDaily  = (D().dailyAll || D().daily || []).some(x => x.k === id);
          const inTravel = (D().travelAll || D().travel || []).some(x => x.k === id);
          const cat = inDaily ? 'daily' : inTravel ? 'travel' : 'drama';
          StateAPI.setCat(cat);

          // 해당 서브필터 설정 + 인덱스로 이동
          const allCat = getLinesForCat(); // cat 설정 후 재계산 필요
          const entry = (D().dailyAll || D().daily || [])
            .concat(D().travelAll || D().travel || [])
            .concat(D().dramaAll || D().drama || [])
            .find(x => x.k === id);

          StateAPI.setSub(entry?.sub || null);
          const arrNow = StateAPI.get().filteredLines;
          const idx = arrNow.findIndex(x => x.k === id);
          if (idx >= 0) StateAPI.get().i = idx;

          setActiveTab(); updateSubFilters(); show();
          $('myModal')?.classList.add('hidden');
        }
      };
    })();
  }

  function show() {
    if (!st.filteredLines || st.filteredLines.length === 0) {
      recomputeFiltered();
    }
    const arr = st.filteredLines;
    if (!arr || arr.length === 0) {
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
    updateScrapUI(); // ☆ 상태 갱신
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
          } catch (e) { console.warn('onPracticeComplete failed (non-fatal):', e); }

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

    // ☆ 스크랩 토글
    el.scrapBtn?.addEventListener('click', toggleScrap);

    // My 모달 열릴 때 목록 렌더 (index에서 모달 open 처리함)
    el.myBtn?.addEventListener('click', renderMyList);
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
