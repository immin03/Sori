import {situationGroups,matchingLevel,levelNames} from './categories.js?v=20261123restore';
const batch = 16;
const opening = ['안녕하세요.','만나서 반가워요.','아메리카노 한 잔, 주세요.','얼마예요?','두 명이에요.','지하철역이 어디예요?','도와주셔서 감사합니다.','포장할게요.'];

function key(text) {
  return String(text || '').normalize('NFC').toLowerCase().replace(/[\u00c0-\u024f]/g, c => c.normalize('NFD').replace(/\p{M}/gu, ''))
    .replace(/[’']/g,'').replace(/[^\p{Letter}\p{Number}]+/gu,' ').trim();
}

export function findExpressions(rows, query, topic = '') {
  const term = key(query);
  const compact = term.replaceAll(' ', '');
  const result = [];
  for (const row of rows) {
    if (topic && key(row.sub || row.t) !== key(topic)) continue;
    const primary = [row.k, row.e, row.p].map(key);
    const context = [row.sub, row.t, row.c].map(key);
    const starter = opening.indexOf(row.k);
    const rank = !term ? (starter < 0 ? opening.length : starter) : primary.includes(term) ? 0 : primary.some(s => s.includes(term)) ? 1 :
      primary.some(s => s.replaceAll(' ', '').includes(compact)) ? 2 :
      term.split(' ').every(word => [...primary, ...context].some(s => s.includes(word))) ? 3 : -1;
    if (rank >= 0) result.push({row,rank});
  }
  return result.sort((a,b) => a.rank - b.rank).map(hit => hit.row);
}

export function mountPhraseSearch(root, rows, {home = false, open, browse,index={}} = {}) {
  const input = root.querySelector('input[type=search]');
  const info = root.querySelector('[role=status]');
  const results = root.querySelector('[data-phrase-list]');
  const more = root.querySelector('[data-more-phrases]');
  const filters = root.querySelector('[data-topics]');
  let topic = '', group = '', level='all',limit = batch;
  const make = (tag, value) => { const node = document.createElement(tag); node.textContent = value; return node; };
  function paint() {
    results.replaceChildren();
    const searching = Boolean(input.value.trim() || topic);
    root.classList.toggle('has-query', searching);
    if (home && !searching) { info.textContent = ''; more.hidden = true; return; }
    const matches = findExpressions(matchingLevel(group?index[group]||[]:rows,level), input.value, topic);
    info.textContent = matches.length ? matches.length + (matches.length === 1 ? ' expression' : ' expressions') :
      'No expressions found. Try “hello”, “coffee” or a Korean word.';
    for (const row of matches.slice(0, limit)) {
      const button = make('button','');
      button.type = 'button'; button.className = 'phrase-hit';
      const ko = make('strong', row.k); ko.lang = 'ko';
      const reading = make('span', row.p); reading.className = 'phrase-reading';
      const meaning = make('span', row.e);
      button.append(ko,reading,meaning);
      button.addEventListener('click', () => open(row.id,true,'', {group,topic,level,ids:matches.map(r=>r.id)})); results.append(button);
    }
    more.hidden = matches.length <= limit;
  }
  function paintFilters(){
    filters.replaceChildren();
    const select=document.createElement('select');select.setAttribute('aria-label','Learning category');
    select.append(new Option('All categories',''));
    for(const g of situationGroups(index))select.append(new Option(g.title,g.id));
    select.value=group;
    const situations=document.createElement('select');situations.setAttribute('aria-label','Situation');
    situations.append(new Option('All situations',''));
    const names=[...new Set((group?index[group]||[]:rows).map(r=>r.sub||r.t))];
    for(const name of names)situations.append(new Option(name,name));
    situations.value=topic;
    select.onchange=()=>{group=select.value;topic='';limit=batch;paintFilters();paint();};
    situations.onchange=()=>{topic=situations.value;limit=batch;paint();};
    const difficulty=document.createElement('select');difficulty.setAttribute('aria-label','Difficulty');
    for(const [id,label] of Object.entries(levelNames))difficulty.append(new Option(label,id));
    difficulty.value=level;difficulty.onchange=()=>{level=difficulty.value;limit=batch;paint();};
    filters.append(select,situations,difficulty);
  }
  paintFilters();
  root.querySelector('[data-browse-phrases]')?.addEventListener('click', browse);
  input.addEventListener('input', () => { limit = batch; paint(); });
  more.addEventListener('click', () => {
    const old = limit; limit += batch; paint();
    results.children[old]?.focus({preventScroll:true});
  });
  paint();
  return {focus() { input.focus({preventScroll:true}); },setScope(g,t,l){group=g;topic=t;level=l;limit=batch;input.value='';paintFilters();paint();}};
}
