import {romanize} from './romanize.js?v=20261123restore';
import {topics, levels, vocabulary} from './vocabulary-catalog.js?v=20261123beta';

const base = '#practice=vocabulary';
export function topicTitle(id) { return topics.find(t => t.id === id)?.title || 'Vocabulary'; }
function topicHref(id) {
  return base + '&amp;view=topic&amp;topic=' + id;
}
export function difficultyControl(current = 'all') {
  return '<fieldset class="vocab-levels"><legend>Difficulty</legend>' +
    Object.entries({all:'All levels',...levels}).map(([id,label]) =>
      `<button type="button" data-vocab-difficulty="${id}" aria-pressed="${current === id}">${label}</button>`).join('') + '</fieldset>';
}
function wordRow(q, daily, level = 'all') {
  const past = daily.entry(q.id);
  const status = daily.isTricky(q.id) ? 'Try again' : past ? 'Practised' : '';
  return `<li><button type="button" data-vocab-start="${q.topic}" data-vocab-level="${level}" data-vocab-word="${q.id}">
    <span><strong lang="ko">${q.term}</strong><span class="vocab-gloss">${romanize(q.term)} · ${q.gloss}</span></span>
    <span class="vocab-word-meta">${levels[q.level]}${status ? '<small>' + status + '</small>' : ''}</span></button></li>`;
}
function resume(round) {
  return round && round.index < round.words.length ? `<a class="vocab-resume" href="${base}&amp;view=round">Continue your set (word ${round.index + 1} of ${round.words.length})</a>` : '';
}
function topicsPage(daily, round) {
  return `<h1 tabindex="-1">Vocabulary topics</h1><p class="vocab-subtitle">${vocabulary.length} Korean words, from everyday essentials to expressions with nuance.</p>
    ${round?.kind === 'topic' && round.level === daily.difficulty() ? resume(round) : ''}
    <div class="vocab-topic-grid">${topics.map(t => {
      const words = vocabulary.filter(q => q.topic === t.id), seen = words.filter(q => daily.entry(q.id)).length;
      const sample = words.find(q => q.level === 'nuance') || words[0];
      return `<a class="vocab-topic-tile" href="${topicHref(t.id)}"><span class="vocab-topic-sample" lang="ko">${sample.term}</span><small>${romanize(sample.term)} · ${sample.gloss}</small>
        <strong>${t.title}</strong><span class="vocab-topic-desc">${t.description}</span><span class="vocab-topic-count">${seen} / ${words.length} practised</span></a>`;
    }).join('')}</div>`;
}
function topicPage(daily, topic, level, round) {
  const words = vocabulary.filter(q => q.topic === topic.id);
  const filtered = words.filter(q => level === 'all' || q.level === level);
  return `<h1 tabindex="-1">${topic.title}</h1><p class="vocab-subtitle">${topic.description}.</p>

    <div class="vocab-hub-actions"><button type="button" class="sori-primary" data-vocab-start="${topic.id}" data-vocab-level="${level}">Practise ${Math.min(4,filtered.length)} ${filtered.length === 1 ? 'word' : 'words'}</button>
    ${round?.topic === topic.id && round.level === level ? resume(round) : ''}</div>
    <ul class="vocab-word-list">${filtered.map(q => wordRow(q,daily,level)).join('')}</ul>`;
}
function wordsPage(daily, round) {
  const all = daily.shelf();
  const shelf = all;
  if (!shelf.length && all.length) return `<h1 tabindex="-1">My words</h1><p class="vocab-subtitle">You haven’t practised a word at this level yet.</p><a class="sori-primary" href="${base}&amp;view=topics">Choose a topic</a>`;
  if (!shelf.length) return `<h1 tabindex="-1">My words</h1><section class="vocab-shelf-intro"><h2>Your first word starts here.</h2><p>Answer a question or reveal a word. You’ll find it here to practise in a new sentence.</p>
    <a class="sori-primary" href="${base}&amp;view=topics">Choose a topic</a></section>`;
  const tricky = shelf.filter(q => daily.isTricky(q.id)).length;
  const due = shelf.filter(q => daily.entry(q.id).due <= daily.day()).length;
  return `<h1 tabindex="-1">My words</h1><p class="vocab-subtitle">${shelf.length} ${shelf.length === 1 ? 'word' : 'words'} practised · ${due} due for review</p>
    <section class="vocab-shelf-intro"><h2>Try them in a new sentence</h2><p>Say the word from memory or choose from the options. Each set has up to five words, starting with the ones due for review.</p>
      <div class="vocab-hub-actions"><button type="button" class="sori-primary" data-vocab-review="all">Mixed review</button>
      ${tricky ? `<button type="button" class="sori-secondary" data-vocab-review="tricky">Review tricky words (${tricky})</button>` : ''}</div>
      ${round?.kind === 'review' && round.level === daily.difficulty() ? resume(round) : ''}</section>
    <ul class="vocab-word-list">${shelf.map(q => wordRow(q,daily,daily.difficulty())).join('')}</ul>`;
}

export function showVocabularyLibrary(target, daily, params) {
  const view = params.get('view'), round = daily.custom();
  const topic = topics.find(t => t.id === params.get('topic'));
  const level = 'all';
  let html;
  if (view === 'words') html = wordsPage(daily,round);
  else if (view === 'topic' && topic) html = topicPage(daily,topic,level,round);
  else html = topicsPage(daily,round);
  const parent = view === 'words' ? ['Review','#review'] : view === 'topic' && topic ? ['Vocabulary topics',base+'&amp;view=topics'] : ['Vocabulary','#home'];
  target.innerHTML = `<header class="session-header"><a class="section-back" href="${parent[1]}">${parent[0]}</a></header><section class="vocab-hub">${html}</section>`;
  target.querySelector('h1').focus({preventScroll:true});
}
