// js/app.js
import { st, showError } from './state.js';
import { speakKo, ensureKoVoiceReady } from './tts.js';
import { dailyAll, dramaAll, travelAll, subCategories, subIcons } from '../data/dataIndex.js';

console.log('[Sori] app.js loaded');

// ====== 데이터 접근 ======
function getLines() {
  const base = st.cat === 'drama' ? dramaAll : (st.cat === 'daily' ? dailyAll : travelAll);
  return st.sub ? base.filter(item => item.sub === st.sub) : base;
}

function updateSubFilters() {
  const container = document.getElementById('subFilters');
  if (!container) return;

  if (st.cat === 'drama') {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  const cats = subCategories[st.cat] || [];
  container.innerHTML =
    '<div class="sub-filters">' +
    `<div class="filter-chip ${!st.sub ? 'active' : ''}" onclick="filterSub(null)">All</div>` +
    cats.map(cat =>
      `<div class="filter-chip ${st.sub === cat ? 'active' : ''}" onclick="filterSub('${cat}')">` +
      `${subIcons[cat] ? subIcons[cat] + ' ' : '🏷️ '}${cat}</div>`
    ).join('') +
    '</div>';
}

function updateRepetitionDisplay() {
  const repCountEl = document.getElementById('repCount');
  if (repCountEl) repCountEl.textContent = st.repCount || 0;

  for (let i = 1; i <= 5; i++) {
    const dot = document.getElementById('dot' + i);
    if (!dot) continue;
    if (i <= (st.repCount || 0)) { dot.classList.add('completed'); dot.textContent = '✓'; }
    else { dot.classList.remove('completed'); dot.textContent = ''; }
  }

  const congrats = document.getElementById('congrats');
  if (congrats) {
    if ((st.repCount || 0) >= 5) congrats.style.display = 'block';
    else congrats.style.display = 'none';
  }
}

function show() {
  st.filteredLines = getLines();

  if (st.filteredLines.length === 0) {
    st.filteredLines = st.cat === 'drama' ? dramaAll : (st.cat === 'daily' ? dailyAll : travelAll);
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

  if (badgeEl)  badgeEl.textContent = d.t;
  if (contextEl)contextEl.textContent = 'Conversation: ' + d.c;
  if (koreanEl) koreanEl.textContent = d.k;
  if (pronEl)  pronEl.textContent = d.p;
  if (engEl)   engEl.textContent = `"${d.e}"`;
  if (progEl)  progEl.textContent = (st.i + 1) + ' / ' + st.filteredLines.length;

  updateRepetitionDisplay();
}

// 전역(HTML onclick에서 씀)
window.filterSub = (sub) => {
  st.sub = sub;
  st.i = 0;
  st.filteredLines = getLines();
  updateSubFilters();
  show();
};

function play() {
  const current = st.filteredLines[st.i];
  const txt = current.k;

  if (!('speechSynthesis' in window)) {
    showError('⚠️ TTS not supported. Try Chrome, Safari, or Edge.');
    return;
  }

  ensureKoVoiceReady(() => speakKo(txt, st.spd));

  if ((st.repCount || 0) < 5) {
    st.repCount = (st.repCount || 0) + 1;
    updateRepetitionDisplay();
    if (st.repCount >= 5) autoNext();
  }
}

function prev() { if (st.i > 0) { st.i--; st.repCount = 0; show(); } }
function next() { if (st.i < st.filteredLines.length - 1) { st.i++; st.repCount = 0; show(); } }

function autoNext() {
  if (st.repCount >= 5) {
    setTimeout(() => {
      if (st.i < st.filteredLines.length - 1) next();
      else showError('🎉 You completed all phrases! Great work!');
    }, 1500);
  }
}

function switchCategory(cat) {
  st.cat = cat; st.sub = null; st.i = 0; st.repCount = 0;
  document.getElementById('dramaBtn')?.classList.remove('active');
  document.getElementById('dailyBtn')?.classList.remove('active');
  document.getElementById('travelBtn')?.classList.remove('active');
  if (cat === 'drama') document.getElementById('dramaBtn')?.classList.add('active');
  else if (cat === 'daily') document.getElementById('dailyBtn')?.classList.add('active');
  else if (cat === 'travel') document.getElementById('travelBtn')?.classList.add('active');
  updateSubFilters();
  show();
}

// 이벤트 바인딩
document.getElementById('dramaBtn')?.addEventListener('click', () => switchCategory('drama'));
document.getElementById('dailyBtn')?.addEventListener('click', () => switchCategory('daily'));
document.getElementById('travelBtn')?.addEventListener('click', () => switchCategory('travel'));
document.getElementById('playBtn')?.addEventListener('click', play);
document.getElementById('prevBtn')?.addEventListener('click', prev);
document.getElementById('nextBtn')?.addEventListener('click', next);

document.getElementById('speed')?.addEventListener('input', (e) => {
  st.spd = parseFloat(e.target.value);
  const speedTxt = document.getElementById('speedTxt');
  if (speedTxt) speedTxt.textContent = st.spd + 'x';
});

// 초기화
st.filteredLines = getLines();
document.getElementById('dailyBtn')?.classList.add('active');
updateSubFilters();
show();
console.log('[Sori] init complete');

