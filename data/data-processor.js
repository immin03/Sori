// data/data-processor.js - 데이터 처리 및 명사 정의 시스템
(function () {
  'use strict';

  let map = null, applying = false, timer = null;

  function buildMap() {
    const DB = window.SORI_DATA || {};
    const pools = [...(DB.daily || []), ...(DB.travel || []), ...(DB.drama || []), ...(DB.trendy || []), ...(DB.numbers || [])];
    const m = new Map();
    for (const o of pools) {
      const k = (o.k || '').trim();
      if (k && !m.has(k)) m.set(k, { e: o.e || '', p: o.p || '' });
    }
    return m;
  }

  function waitData(max = 2000) {
    return new Promise(res => {
      const st = performance.now();
      (function poll() {
        if (window.SORI_DATA || performance.now() - st > max) return res(buildMap());
        setTimeout(poll, 50);
      })();
    });
  }

  function hideLines() { 
    document.getElementById('lessonCard')?.classList.remove('lesson-ready'); 
  }
  
  function showLines() { 
    document.getElementById('lessonCard')?.classList.add('lesson-ready'); 
  }

  function updateNounDefinitions(koreanText) {
    const nounDefsEl = document.getElementById('nounDefinitions');
    const nounListEl = nounDefsEl?.querySelector('.noun-list');
    
    if (!nounDefsEl || !nounListEl) return;
    
    const nouns = window.SORI_NOUNS?.[koreanText];
    
    if (nouns && nouns.length > 0) {
      nounListEl.innerHTML = '';
      nouns.forEach(noun => {
        const nounItem = document.createElement('div');
        nounItem.className = 'noun-item';
        nounItem.innerHTML = `
          <span class="noun-korean">${noun.korean}</span>
          <span class="noun-english">${noun.english}</span>
          <span class="noun-roman">${noun.roman}</span>
        `;
        nounListEl.appendChild(nounItem);
      });
      nounDefsEl.style.display = 'block';
    } else {
      nounDefsEl.style.display = 'none';
    }
  }

  function applyOnce() {
    if (applying) return;
    const ctx = context, en = english, pr = pronunciation, koEl = korean;
    if (!ctx || !en || !pr || !koEl) return;

    const ko = (koEl.textContent || '').trim();
    const hit = map?.get(ko) || {};
    const meaning = hit.e || (ctx.textContent || '').replace(/(^"+|"+$)/g, '').trim();
    const roman = hit.p || (pr.textContent || '').trim() || (en.textContent || '').trim();

    applying = true;
    try {
      if (meaning) ctx.textContent = quote(meaning);
      if (roman) en.textContent = roman;
      pr.style.display = 'none';
      
      // 명사 정의 업데이트
      updateNounDefinitions(ko);
      
      // 경어/반말 레벨 태그 업데이트
      if (window.updateSpeechLevelTag) {
        window.updateSpeechLevelTag(ko);
      }
      
      showLines();
    } finally {
      setTimeout(() => { applying = false; }, 0);
    }
  }

  function scheduleApply() {
    hideLines();
    clearTimeout(timer);
    timer = setTimeout(applyOnce, 110);
  }

  function quote(s) {
    return `"${String(s || '').replace(/^"+|"+$/g, '').trim()}"`;
  }

  // DOM 요소들
  const context = document.getElementById('context');
  const english = document.getElementById('english');
  const pronunciation = document.getElementById('pronunciation');
  const korean = document.getElementById('korean');

  document.addEventListener('DOMContentLoaded', async () => {
    hideLines();
    map = await waitData();
    scheduleApply();
    const mo = new MutationObserver(() => { if (!applying) scheduleApply(); });
    korean && mo.observe(korean, { childList: true, characterData: true, subtree: true });
    ['nextBtn', 'prevBtn', 'dailyBtn', 'travelBtn', 'dramaBtn', 'trendyBtn', 'numbersBtn', 'savedBtnHidden', 'subFilters']
      .forEach(id => {
        const el = (id === 'subFilters') ? document.getElementById(id) : document.getElementById(id);
        el && el.addEventListener('click', scheduleApply, true);
      });

    const speedEl = speed, speedLbl = speedTxt;
    const sync = () => speedLbl.textContent = (parseFloat(speedEl.value)).toFixed(2) + 'x';
    speedEl.addEventListener('input', sync); 
    sync();
  });

  // 전역으로 함수 노출
  window.buildMap = buildMap;
  window.waitData = waitData;
  window.updateNounDefinitions = updateNounDefinitions;
  window.applyOnce = applyOnce;
  window.scheduleApply = scheduleApply;
})();
