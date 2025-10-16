// js/app.js
// 목적
// 1) iPhone Safari TTS 무음 이슈 해소를 위한 TTS 언락 처리
// 2) Travel 탭 클릭 시 카테고리 전환 제대로 동작
// 3) DOM 로딩 순서 문제 방지

(function () {
  // 상태 객체가 없으면 기본값 생성
  window.st = window.st || { cat: 'daily', sub: null, i: 0, spd: 0.85, repCount: 0, filteredLines: [] };

  // 데이터 안전장치
  window.travelAll = window.travelAll || [];
  window.dailyAll = window.dailyAll || [];
  window.dramaAll = window.dramaAll || [];

  // 선택자 캐시
  let $badge, $context, $korean, $pron, $eng, $prog;
  let $repCount, $dots, $congrats;
  let $speed, $speedTxt;
  let $play, $prev, $next;
  let $dailyBtn, $travelBtn, $dramaBtn, $subFilters;

  // iPhone TTS 언락 제어
  let ttsUnlocked = false;

  // iOS Safari에서 최초 사용자 제스처 뒤 짧은 더미 음성을 재생하여 TTS 권한을 열어준다
  function unlockTTSOnce() {
    if (ttsUnlocked || !('speechSynthesis' in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.lang = 'ko-KR';
      u.rate = 1.0;
      u.volume = 0.01; // 거의 안 들리게
      u.onend = () => { ttsUnlocked = true; };
      u.onerror = () => { ttsUnlocked = true; };
      window.speechSynthesis.speak(u);
    } catch (e) {
      ttsUnlocked = true;
    }
  }

  function getLines() {
    if (st.cat === 'travel') return window.travelAll;
    if (st.cat === 'daily') return window.dailyAll;
    return window.dramaAll;
  }

  function updateSubFilters() {
    if (!$subFilters) return;
    // drama는 서브필터 숨김
    if (st.cat === 'drama') {
      $subFilters.style.display = 'none';
      return;
    }
    const cats = (window.subCategories && window.subCategories[st.cat]) || [];
    if (!cats.length) {
      $subFilters.style.display = 'none';
      return;
    }
    $subFilters.style.display = 'block';

    const chips = [
      `<div class="sub-filters">
         <div class="filter-chip ${!st.sub ? 'active' : ''}" data-sub="">All</div>`
    ];
    for (const c of cats) {
      const icon = (window.subIcons && window.subIcons[c]) ? (window.subIcons[c] + ' ') : '';
      chips.push(
        `<div class="filter-chip ${st.sub === c ? 'active' : ''}" data-sub="${c}">${icon}${c}</div>`
      );
    }
    chips.push('</div>');
    $subFilters.innerHTML = chips.join('');

    // 이벤트 위임
    $subFilters.querySelector('.sub-filters').addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      st.sub = chip.getAttribute('data-sub') || null;
      st.i = 0;
      st.filteredLines = getFiltered();
      updateSubFilters();
      show();
    }, { once: true }); // 다시 그릴 때 중복 바인딩 방지
  }

  function getFiltered() {
    const base = getLines();
    return st.sub ? base.filter(x => x.sub === st.sub) : base.slice();
  }

  function updateRepetitionDisplay() {
    if ($repCount) $repCount.textContent = st.repCount || 0;
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
    if ($congrats) {
      if ((st.repCount || 0) >= 5) $congrats.classList.add('show');
      else $congrats.classList.remove('show');
    }
  }

  function show() {
    st.filteredLines = getFiltered();
    if (!st.filteredLines.length) {
      // 데이터가 비어 있으면 index 0로 리셋
      st.i = 0;
      updateRepetitionDisplay();
      return;
    }
    if (st.i >= st.filteredLines.length) st.i = 0;
    if (st.i < 0) st.i = 0;
    st.repCount = 0;

    const d = st.filteredLines[st.i];
    if ($badge)   $badge.textContent = d.t;
    if ($context) $context.textContent = 'Conversation: ' + d.c;
    if ($korean)  $korean.textContent = d.k;
    if ($pron)    $pron.textContent = d.p;
    if ($eng)     $eng.textContent = `"${d.e}"`;
    if ($prog)    $prog.textContent = (st.i + 1) + ' / ' + st.filteredLines.length;

    updateRepetitionDisplay();
  }

  function play() {
    if (!('speechSynthesis' in window)) {
      const err = document.getElementById('errorMsg');
      if (err) {
        err.textContent = 'Your browser does not support text-to-speech. Try Chrome, Safari, or Edge.';
        err.style.display = 'block';
        setTimeout(() => { err.style.display = 'none'; }, 4000);
      }
      return;
    }
    unlockTTSOnce();

    const synth = window.speechSynthesis;
    synth.cancel();

    const current = st.filteredLines[st.i];
    if (!current) return;

    // 보이스 목록 로딩 후 speakText 호출
    let voices = synth.getVoices();
    const speakNow = () => {
      if (typeof window.speakText === 'function') {
        window.speakText(current.k, voices);
      } else {
        // 최소한의 폴백
        const u = new SpeechSynthesisUtterance(current.k);
        u.lang = 'ko-KR';
        u.rate = st.spd || 0.9;
        synth.speak(u);
      }
    };

    if (!voices || voices.length === 0) {
      synth.onvoiceschanged = () => {
        voices = synth.getVoices();
        speakNow();
      };
      // 혹시 이벤트가 안 오는 브라우저용 타임아웃
      setTimeout(() => {
        voices = synth.getVoices();
        speakNow();
      }, 600);
    } else {
      speakNow();
    }

    // 반복 카운트
    if ((st.repCount || 0) < 5) {
      st.repCount = (st.repCount || 0) + 1;
      updateRepetitionDisplay();
      if (st.repCount >= 5) {
        setTimeout(() => {
          if (st.i < st.filteredLines.length - 1) next();
        }, 800);
      }
    }
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

  function switchCategory(cat) {
    if (!cat) return;
    st.cat = cat;
    st.sub = null;
    st.i = 0;
    st.repCount = 0;

    // 탭 active 토글
    $dramaBtn && $dramaBtn.classList.remove('active');
    $dailyBtn && $dailyBtn.classList.remove('active');
    $travelBtn && $travelBtn.classList.remove('active');
    if (cat === 'drama') $dramaBtn && $dramaBtn.classList.add('active');
    else if (cat === 'daily') $dailyBtn && $dailyBtn.classList.add('active');
    else if (cat === 'travel') $travelBtn && $travelBtn.classList.add('active');

    updateSubFilters();
    show();
  }

  // DOM 준비 후 초기화
  document.addEventListener('DOMContentLoaded', () => {
    // 엘리먼트 캐시
    $badge   = document.getElementById('badge');
    $context = document.getElementById('context');
    $korean  = document.getElementById('korean');
    $pron    = document.getElementById('pronunciation');
    $eng     = document.getElementById('english');
    $prog    = document.getElementById('prog');

    $repCount = document.getElementById('repCount');
    $congrats = document.getElementById('congrats');

    $speed    = document.getElementById('speed');
    $speedTxt = document.getElementById('speedTxt');

    $play = document.getElementById('playBtn');
    $prev = document.getElementById('prevBtn');
    $next = document.getElementById('nextBtn');

    $dailyBtn  = document.getElementById('dailyBtn');
    $travelBtn = document.getElementById('travelBtn');
    $dramaBtn  = document.getElementById('dramaBtn');
    $subFilters = document.getElementById('subFilters');

    // 이벤트 바인딩은 DOMContentLoaded 이후에만
    if ($play)  $play.addEventListener('click', () => { unlockTTSOnce(); play(); });
    if ($prev)  $prev.addEventListener('click', () => { unlockTTSOnce(); prev(); });
    if ($next)  $next.addEventListener('click', () => { unlockTTSOnce(); next(); });

    if ($speed) {
      $speed.addEventListener('input', (e) => {
        st.spd = parseFloat(e.target.value);
        if ($speedTxt) $speedTxt.textContent = st.spd + 'x';
      });
    }

    if ($dailyBtn)  $dailyBtn.addEventListener('click', () => { unlockTTSOnce(); switchCategory('daily'); });
    if ($travelBtn) $travelBtn.addEventListener('click', () => { unlockTTSOnce(); switchCategory('travel'); });
    if ($dramaBtn)  $dramaBtn.addEventListener('click', () => { unlockTTSOnce(); switchCategory('drama'); });

    // 초기 표시
    // 만약 travel만 쓰고 싶다면 아래 한 줄로 시작 카테고리를 travel로 고정
    // st.cat = 'travel';
    // $travelBtn && $travelBtn.classList.add('active');

    // 현재 선택된 탭 표시
    if (st.cat === 'travel') $travelBtn && $travelBtn.classList.add('active');
    else if (st.cat === 'daily') $dailyBtn && $dailyBtn.classList.add('active');
    else $dramaBtn && $dramaBtn.classList.add('active');

    updateSubFilters();
    show();
  });
})();
