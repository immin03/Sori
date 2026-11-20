import {PracticeProgress} from './progress.js?v=20261120s1';
import {scenes} from './scenes.js?v=20261120s1';
import {attachVoiceReply,recorderControls} from './voice-reply.js?v=20261121vocab';
import {DailyVocabulary} from './vocabulary.js?v=20261121q1';
import {vocabularyCard,mountVocabulary} from './vocabulary-ui.js?v=20261121q1';
import {mountPhraseSearch} from './phrase-search.js?v=20261120s1';
import {sharePublic} from '../share-public.js?v=20261121trip';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el = id => document.getElementById(id);
let rows, byId, byKorean, progress, dailyWords, currentScope, voice, lessonVoice, phrasebook, lastVerdict;
const viewRoot = () => el('mainContent');
function saveNotice() {
  return progress.error ? '<p class="small-note" role="status">This browser could not save your progress.</p>' : '';
}
function dailyPool() {
  const priority = ['아메리카노 한 잔, 주세요.','얼마예요?','안 매운 걸로, 주세요.','지하철역이 어디예요?'];
  return [...priority.map(k => byKorean.get(k)?.id).filter(Boolean),
    ...rows.filter(p => ['Cafe','Restaurant','Transport','Greeting','Hotel','Shopping'].includes(p.sub || p.t)).map(p => p.id)];
}
function sceneAction(kind) {
  const active = progress.sessionFor(kind);
  return active ? 'Continue at turn ' + (active.index + 1) : 'Start conversation';
}
function paintHome() {
  el('dailyVocabulary').innerHTML = vocabularyCard(dailyWords);
  const cafe = scenes.cafe, sample = byKorean.get(cafe.turns[0][3]);
  const {today,due,last} = progress.stats();
  const otherScenes = Object.entries(scenes).filter(([kind]) => kind !== 'cafe').map(([kind,s]) => {
    const session = progress.sessionFor(kind);
    return `<button class="conversation-row" data-scene="${kind}"><span><strong>${esc(s.title)}</strong><small>${esc(s.role)} · ${session ? 'Continue at turn ' + (session.index + 1) : s.turns.length + ' turns'}</small></span><span aria-hidden="true">↗</span></button>`;
  }).join('');
  el('practiceDashboard').innerHTML = `<article class="speaking-feature">
    <img src="assets/photos/cafe-conversation.webp" alt="A barista hands over a cup of black coffee." width="1400" height="933" fetchpriority="high">
    <div class="feature-copy"><span class="feature-meta">Café · 3 turns</span><h2>${esc(cafe.title)}</h2>
    <p class="feature-sample" lang="ko">${esc(sample.k)}</p><p class="roman-line">${esc(sample.p)}</p><p>${esc(sample.e)}</p>
    <button class="sori-primary" data-scene="cafe">${sceneAction('cafe')} <span aria-hidden="true">→</span></button></div></article>
    <section class="conversation-list"><div class="list-title"><h2>More practice</h2><span>${Math.min(5,today)} / 5 today</span></div>
    ${otherScenes}<button class="conversation-row" data-practice-start><span><strong>${progress.sessionFor('daily') ? 'Continue daily practice' : 'Five everyday expressions'}</strong><small>Listen, speak and recall</small></span><span aria-hidden="true">↗</span></button>
    ${due ? `<button class="conversation-row" data-practice-review><strong>Review ${due} due</strong><span aria-hidden="true">↗</span></button>` : ''}</section>${saveNotice()}`;
  el('learnPracticeEntry').innerHTML = '<button class="sori-secondary" data-browse-collection>Categories &amp; saved words</button>' +
    (last ? '<button class="text-button" data-practice-resume>Last expression</button>' : '');
}
function discardVoice() { voice?.dispose(); voice = null; }
function closeLessonVoice() {
  lessonVoice?.dispose(); lessonVoice = null;
  el('lessonVoice').querySelector('.voice-slot').replaceChildren();
}
function setupLessonVoice() {
  closeLessonVoice();
  const model = el('korean').textContent.trim();
  if (!model) return;
  const slot = el('lessonVoice').querySelector('.voice-slot');
  slot.innerHTML = recorderControls();
  lessonVoice = attachVoiceReply(slot, window, model);
}
function library() {
  discardVoice(); window.SORI?.TTS?.cancel();
  viewRoot().classList.remove('practice-session-active','single-phrase','phrase-index','collection');
  el('practiceSession').hidden = true;
}
function changeHash(hash) {
  if (location.hash !== hash) history.pushState(null,'',hash);
}
function browse(push = true) {
  if (push) changeHash('#phrases');
  library(); closeLessonVoice(); viewRoot().classList.add('phrase-index'); window.SoriNav?.show('listen');
  window.scrollTo({top:0,behavior:'instant'}); phrasebook?.focus();
}
function collection() {
  library(); window.SoriNav?.show('listen'); viewRoot().classList.add('collection');
  setupLessonVoice(); window.scrollTo({top:0,behavior:'instant'});
}
function openPhrase(id, push = true) {
  if (!byId.has(id)) { browse(false); return; }
  if (push) changeHash('#phrase=' + encodeURIComponent(id));
  window.SoriNav?.show('listen');
  if (!window.SoriLearn?.openId(id)) return;
  viewRoot().classList.add('single-phrase');
  if (!lessonVoice) setupLessonVoice();
  window.scrollTo({top:0,behavior:'instant'});
  el('korean').tabIndex = -1; el('korean').focus({preventScroll:true});
}
function openVocabulary(start = false) {
  library(); closeLessonVoice(); window.SoriNav?.show('listen');
  viewRoot().classList.add('practice-session-active');
  const target = el('practiceSession');
  target.hidden = false;
  voice = mountVocabulary(target, dailyWords, window, {start, onProgress:paintHome});
  window.scrollTo({top:0,behavior:'instant'});
}
function view(kind, {fresh = false, pool, play = false} = {}) {
  closeLessonVoice();
  const choices = pool || (Object.hasOwn(scenes,kind) ? scenes[kind].turns.map(t => byKorean.get(t[3])?.id).filter(Boolean) :
    kind === 'review' ? progress.due() : dailyPool());
  if (!choices.length && !progress.sessionFor(kind)) return;
  progress.start(choices,{kind,fresh}); window.SoriNav?.show('listen');
  viewRoot().classList.remove('single-phrase');
  viewRoot().classList.add('practice-session-active');
  el('practiceSession').hidden = false;
  renderSession(play); paintHome(); window.scrollTo({top:0,behavior:'instant'});
}
function audioButton(line,label,rate = 1) {
  return `<button type="button" class="sori-secondary" data-audio="${esc(line)}" data-rate="${rate}">${label}</button>`;
}
function finishMarkup(s) {
  const scene = scenes[s?.kind], n = s?.ids.length || 0;
  const next = Object.keys(scenes).find(k => k !== s?.kind);
  return `<section class="practice-finish"><span class="feature-meta">Practice complete</span><h1>${scene ? 'Conversation complete.' : 'Practice complete.'}</h1>
    <p>${scene ? `You took all ${n} turns in “${esc(scene.title)}.”` : `You practised ${n} expressions.`}</p>
    ${s?.missed?.length ? `<button class="sori-primary" data-retry-misses>Practise missed replies (${s.missed.length})</button>` : ''}
    ${scene ? `<button class="sori-secondary" data-scene="${s.kind}">Try this conversation again</button><button class="sori-secondary" data-challenge="${s.kind}">Challenge a friend</button><p id="challengeStatus" role="status"></p><button class="text-button" data-scene="${next}">${esc(scenes[next].title)} ›</button>` : '<button class="sori-secondary" data-practice-new>Practise another five</button>'}
    <button class="text-button" data-to-phrasebook>Browse the phrasebook</button></section>`;
}
function renderSession(play = false) {
  discardVoice(); window.SORI?.TTS?.cancel(); lastVerdict = null;
  const target = el('practiceSession'), session = progress.active();
  if (!session) { target.innerHTML = finishMarkup(progress.data.session); return; }
  const phrase = byId.get(session.ids[session.index]), scene = scenes[session.kind];
  const turn = scene?.turns.find(t => t[3] === phrase.k);
  const cue = turn ? `<section class="speaker-cue"><div class="turn-cap"><span>${esc(scene.role)}</span>${audioButton(turn[0],'Listen')}</div>
    <p lang="ko">${esc(turn[0])}</p><p class="roman-line">${esc(turn[5])}</p><p class="meaning-line">${esc(turn[1])}</p></section>` : '';
  target.innerHTML = `<header class="session-header"><button class="text-button" data-pause-session>‹ Speak</button>
    <span>Turn ${session.index + 1} of ${session.ids.length}</span></header>
    <progress max="${session.ids.length}" value="${session.index + 1}" aria-label="Current turn"></progress>
    <h1>${esc(scene?.title || (session.kind === 'review' ? 'Review your replies' : 'Everyday expressions'))}</h1>${cue}
    <section class="session-answer"><div class="turn-cap"><span>Your turn</span><button class="text-button memory-toggle" aria-expanded="true" aria-controls="replyExample" data-memory>Try from memory</button></div>
    <p class="turn-intent">${esc(turn ? turn[2] : phrase.e)}</p>
    <div id="replyExample"><h2 lang="ko">${esc(phrase.k)}</h2><p class="roman-line">${esc(phrase.p)}</p>${turn ? `<p class="meaning-line">${esc(phrase.e)}</p>` : ''}</div>
    <div class="audio-choices">${audioButton(phrase.k,'Hear example')}${audioButton(phrase.k,'Slow',0.65)}</div>
    ${recorderControls()}${turn ? `<details class="speaking-tip"><summary>Speaking tip</summary><p>${esc(turn[4])}</p></details>` : ''}
    <div class="recall-actions"><button class="text-button" data-practice-answer="again">Review later</button><button class="sori-secondary" data-practice-answer="remembered">${session.index + 1 === session.ids.length ? 'Finish practice' : 'Next turn'} →</button></div></section>${saveNotice()}`;
  voice = attachVoiceReply(target.querySelector('.reply-recorder'), window, phrase.k, turn?.[6] || [], kind => {
    lastVerdict = kind;
    if (kind === 'retry') progress.markMissed();
  });
  if (play && turn) target.querySelector('.speaker-cue [data-audio]')?.click();
}
function route() {
  if (!progress) return;
  const params = new URLSearchParams(location.hash.slice(1));
  if (params.get('practice') === 'vocabulary') openVocabulary();
  else if (Object.hasOwn(scenes,params.get('practice'))) view(params.get('practice'));
  else if (params.has('phrase')) openPhrase(params.get('phrase'),false);
  else if (['#phrases','#speak'].includes(location.hash)) browse(false);
  else if (location.hash === '#collection') collection();
}
function boot() {
  rows = Object.values(window.SoriDataIndex || {}).flat(); byId = new Map(rows.map(p => [p.id,p])); byKorean = new Map(rows.map(p => [p.k,p]));
  let storage;
  try { storage = localStorage; } catch { storage = {getItem(){return null;},setItem(){throw Error('Storage unavailable');}}; }
  progress = new PracticeProgress({storage,ids:byId.keys()}); currentScope = window.firebaseAuth?.currentUser?.uid || null; progress.setUser(currentScope);
  dailyWords = new DailyVocabulary(storage, currentScope);
  window.SoriPractice = {library,openPhrase,browse};
  for (const root of document.querySelectorAll('[data-phrase-finder]')) {
    const home = root.dataset.phraseFinder === 'home';
    const control = mountPhraseSearch(root,rows,{home,open:openPhrase,browse});
    if (!home) phrasebook = control;
  }
  paintHome(); route();
}
document.addEventListener('click',event => {
  const b = event.target.closest('button'); if (!b || !progress) return;
  if (b.hasAttribute('data-open-vocabulary')) { changeHash('#practice=vocabulary'); openVocabulary(true); }
  if (b.matches('[data-audio],[data-repeat-current],#playBtn')) { voice?.onModel(); lessonVoice?.onModel(); }
  if (Object.hasOwn(scenes,b.dataset.scene)) { changeHash('#practice=' + b.dataset.scene); view(b.dataset.scene,{play:true}); }
  if (b.matches('[data-practice-start],[data-practice-new]')) view('daily',{fresh:b.hasAttribute('data-practice-new')});
  if (b.hasAttribute('data-practice-review')) view('review');
  if (b.hasAttribute('data-retry-misses')) view('review',{fresh:true,pool:progress.data.session.missed});
  if (b.hasAttribute('data-practice-resume')) openPhrase(progress.data.last);
  if (b.hasAttribute('data-to-phrasebook')) browse();
  if (b.hasAttribute('data-browse-collection')) {
    changeHash('#collection'); collection();
  }
  if (b.hasAttribute('data-pause-session')) { changeHash('#home'); window.SoriNav.show('home'); window.scrollTo({top:0,behavior:'instant'}); }
  if (b.hasAttribute('data-memory')) {
    const answer = el('replyExample'); answer.hidden = !answer.hidden;
    b.setAttribute('aria-expanded',String(!answer.hidden)); b.textContent = answer.hidden ? 'Show example' : 'Try from memory';
  }
  if (b.dataset.practiceAnswer) {
    if (b.dataset.practiceAnswer === 'again') progress.markMissed();
    progress.answer(lastVerdict === 'retry' ? 'again' : b.dataset.practiceAnswer);
    renderSession(true); paintHome(); window.scrollTo({top:0,behavior:'instant'});
    const heading = el('practiceSession').querySelector('h1'); heading.tabIndex = -1; heading.focus({preventScroll:true});
  }
  if (Object.hasOwn(scenes,b.dataset.challenge)) sharePublic({title:scenes[b.dataset.challenge].title,text:'Take three turns in Korean with me.',url:location.origin + '/#practice=' + b.dataset.challenge},el('challengeStatus'));
});
if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
window.addEventListener('hashchange',route);
window.addEventListener('sori-view',event => {
  if (event.detail.view !== 'listen') { library(); closeLessonVoice(); }
  if (event.detail.view === 'home' && dailyWords) paintHome();
});
window.addEventListener('pagehide',() => { discardVoice(); closeLessonVoice(); });
document.addEventListener('visibilitychange',() => { if (document.hidden) { voice?.onModel(); lessonVoice?.onModel(); window.SORI?.TTS?.cancel(); } });
window.addEventListener('sori-phrase-shown',event => {
  if (!progress) return;
  closeLessonVoice();
  if (event.detail.id && viewRoot().style.display !== 'none' && !viewRoot().classList.contains('practice-session-active')) setupLessonVoice();
  if (event.detail.id && viewRoot().style.display !== 'none' && el('practiceSession').hidden) {
    progress.setLast(event.detail.id);
    if (viewRoot().classList.contains('single-phrase') && location.hash.startsWith('#phrase=')) {
      history.replaceState(null,'','#phrase=' + encodeURIComponent(event.detail.id));
    }
  }
  paintHome();
});
window.addEventListener('sori-auth-changed',() => {
  const next = window.firebaseAuth?.currentUser?.uid || null;
  if (!progress || next === currentScope) return;
  currentScope = next; library(); closeLessonVoice(); progress.setUser(next);
  dailyWords = new DailyVocabulary(progress.storage, next); paintHome(); route();
});
