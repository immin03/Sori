import {PracticeProgress} from './progress.js?v=20261120s1';
import {scenes} from './scenes.js?v=20261120s1';
import {mountSpokenTurn,spokenTurnControls} from './spoken-turn.js?v=20261121nav';
import {DailyVocabulary} from './vocabulary.js?v=20261121library';
import {vocabularyCard,mountVocabulary} from './vocabulary-ui.js?v=20261121nav';
import {showVocabularyLibrary} from './vocabulary-library.js?v=20261121nav';
import {mountPhraseSearch} from './phrase-search.js?v=20261120s1';
import {sharePublic} from '../share-public.js?v=20261121trip';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el = id => document.getElementById(id);
let rows, byId, byKorean, progress, dailyWords, currentScope, voice, lessonVoice, phrasebook, lastVerdict;
let phraseModel='', repeatStep=0, repeatTimer;
let phraseAuto=false, openingPhrase=false, sessionMode='voice';
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
function homePanel() {
  const hash=location.hash;
  const panel=hash==='#conversations'?'conversations':hash==='#saved-phrases'?'saved':hash==='#review'?'review':'vocabulary';
  el('homeTitle').textContent=({vocabulary:'Vocabulary',conversations:'Conversations',review:'Review',saved:'Saved phrases'})[panel];
  for (const section of el('homeView').querySelectorAll('[data-speak-panel]')) section.hidden=section.dataset.speakPanel!==panel;
}
function reviewRow(href,title,summary) {
  return `<a class="section-row" href="${href}"><strong>${title}</strong><span>${summary}</span></a>`;
}
function paintHome() {
  el('dailyVocabulary').innerHTML = vocabularyCard(dailyWords);
  const cafe=scenes.cafe;
  const otherScenes=Object.entries(scenes).filter(([kind])=>kind!=='cafe').map(([kind,s])=>
    `<button class="section-row" data-scene="${kind}"><strong>${esc(s.title)}</strong><span>${esc(s.role)} · ${sceneAction(kind)}</span></button>`).join('');
  el('practiceDashboard').innerHTML=`<article class="speaking-feature">
    <img src="assets/photos/cafe-conversation.webp" alt="A barista hands over a cup of black coffee." width="1400" height="933">
    <div class="feature-copy"><span class="feature-meta">Café · 3 turns</span><h2>${esc(cafe.title)}</h2>
    <p>Listen to the barista and order in Korean.</p><button class="sori-primary" data-scene="cafe">${sceneAction('cafe')}</button></div></article>
    <div class="section-rows">${otherScenes}</div><h2 class="subsection-title">Phrase practice</h2>
    <button class="section-row" data-practice-start><strong>Everyday expressions</strong><span>Practise five phrases aloud</span></button>${saveNotice()}`;
  const shelf=dailyWords.shelf(), saved=(window.SoriSaved?.list || []).filter(id=>byId.has(id)), {due,last}=progress.stats();
  const again=progress.sessionFor('review');
  el('speakReview').innerHTML=`<div class="section-rows">
    ${reviewRow('#practice=vocabulary&amp;view=words','My words',shelf.length ? shelf.length + ' practised · mixed and tricky word review' : 'Practised vocabulary and tricky words')}
    ${reviewRow('#saved-phrases','Saved phrases',saved.length ? saved.length+' saved' : 'Phrases you have bookmarked')}
    ${due||again ? '<button class="section-row" data-practice-review><strong>Due expressions</strong><span>'+ (again?'Continue your review':due+' ready to practise aloud')+'</span></button>' : '<div class="section-row quiet-row"><strong>Due expressions</strong><span>No expressions due today</span></div>'}
    <button class="section-row" data-start-quiz><strong>Listening quiz</strong><span>Listen in Korean, then say or choose the meaning</span></button></div>`;
  el('savedPhrases').innerHTML='<a class="section-back" href="#review">Review</a>'+(saved.length ?
    '<div class="section-rows">'+saved.map(id=>{const q=byId.get(id);return `<button class="section-row" data-saved-phrase="${esc(id)}"><strong lang="ko">${esc(q.k)}</strong><span>${esc(q.e)}</span></button>`;}).join('')+'</div>':
    '<p class="empty-note">Tap Save on a phrase to keep it here for speaking practice.</p><a class="section-back" href="#phrases">Open the phrasebook</a>');
  el('learnPracticeEntry').innerHTML='<button class="sori-secondary" data-browse-collection>Browse categories</button>'+(last?'<button class="text-button" data-practice-resume>Last expression</button>':'');
  homePanel();
}
function discardVoice() { voice?.dispose(); voice = null; }
function stopRepeats(message = '') {
  clearTimeout(repeatTimer);
  if(!repeatStep)return;
  repeatStep=0;
  el('repeatPhrase').textContent='Listen, pause & repeat · 3 times';
  el('lessonAudioStatus').textContent=message;
}
function repeatPhrase() {
  if(!lessonVoice)return false;
  if(repeatStep){stopRepeats();lessonVoice.onModel();return true;}
  lessonVoice.onModel();
  repeatStep=1;
  el('repeatPhrase').textContent='Stop repeats · 1 of 3';
  el('lessonAudioStatus').textContent='Listen, then repeat the phrase aloud.';
  lessonVoice.play();
  return true;
}
function repeatVerdict(kind) {
  if(!repeatStep || kind!=='correct')return;
  if(repeatStep===3){stopRepeats('Three repeats complete.');return;}
  repeatStep++;
  el('repeatPhrase').textContent='Stop repeats · '+repeatStep+' of 3';
  const current=lessonVoice;
  clearTimeout(repeatTimer);
  repeatTimer=setTimeout(()=>{
    if(repeatStep && lessonVoice===current && !document.hidden){current.onModel();current.play();}
  },550);
}
function closeLessonVoice() {
  stopRepeats();phraseModel='';
  lessonVoice?.dispose(); lessonVoice = null;
  el('lessonVoice').querySelector('.voice-slot').replaceChildren();
}
function setupLessonVoice(start = false) {
  closeLessonVoice();
  const model=el('korean').textContent.trim(), slot=el('lessonVoice').querySelector('.voice-slot');
  if(!model)return;
  phraseModel=model;
  slot.innerHTML=spokenTurnControls({externalButton:true,compare:true});
  lessonVoice=mountSpokenTurn(slot,window,{cue:model,answer:model,start,externalButton:el('playBtn'),modelLine:el('korean'),
    rate:()=>Number(el('speed').value)||.8,onMode:mode=>{phraseAuto=mode==='voice';if(!phraseAuto)stopRepeats();},onVerdict:repeatVerdict,
    onPlayed:()=>window.dispatchEvent(new CustomEvent('sori-repeat-ended',{detail:{text:model}}))});
}
function library() {
  discardVoice(); window.SORI?.TTS?.cancel();
  viewRoot().classList.remove('practice-session-active','single-phrase','phrase-index','collection');
  el('practiceSession').hidden = true;
}
function changeHash(hash) {
  if (location.hash !== hash) history.pushState(null,'',hash);
  window.SoriNav?.refresh();
}
function browse(push = true) {
  if (push) changeHash('#phrases');
  phraseAuto=false;library(); closeLessonVoice(); viewRoot().classList.add('phrase-index'); window.SoriNav?.show('listen');
  window.scrollTo({top:0,behavior:'instant'}); phrasebook?.focus();
}
function collection() {
  phraseAuto=false;library(); window.SoriNav?.show('listen'); viewRoot().classList.add('collection');
  setupLessonVoice(); window.scrollTo({top:0,behavior:'instant'});
}
function openPhrase(id, push = true, from = '') {
  if (!byId.has(id)) { browse(false); return; }
  if (push) changeHash('#phrase=' + encodeURIComponent(id) + (from ? '&from='+from : ''));
  window.SoriNav?.show('listen');
  openingPhrase=true;
  try { if (!window.SoriLearn?.openId(id)) return; } finally {openingPhrase=false;}
  viewRoot().classList.add('single-phrase');
  const parent=new URLSearchParams(location.hash.slice(1)).get('from');
  const back=el('lessonCard').querySelector('.lesson-back');
  back.textContent=parent==='review'?'Saved phrases':'Phrasebook';back.href=parent==='review'?'#saved-phrases':'#phrases';
  phraseAuto=push;
  setupLessonVoice(push);
  progress.setLast(id);window.scrollTo({top:0,behavior:'instant'});
  el('korean').tabIndex=-1;el('korean').focus({preventScroll:true});
}
function openVocabulary(start = false) {
  library(); closeLessonVoice(); window.SoriNav?.show('listen');
  viewRoot().classList.add('practice-session-active');
  const target = el('practiceSession');
  target.hidden = false;
  const params = new URLSearchParams(location.hash.slice(1)), page = params.get('view');
  if (['topics','topic','words'].includes(page) || (page === 'round' && !dailyWords.custom())) {
    showVocabularyLibrary(target,dailyWords,params);
  } else {
    voice = mountVocabulary(target, dailyWords, window, {start, custom:page === 'round', onProgress:paintHome});
  }
  window.scrollTo({top:0,behavior:'instant'});
}
function view(kind, {fresh = false, pool, play = false} = {}) {
  closeLessonVoice();
  const choices = pool || (Object.hasOwn(scenes,kind) ? scenes[kind].turns.map(t => byKorean.get(t[3])?.id).filter(Boolean) :
    kind === 'review' ? progress.due() : dailyPool());
  if (!choices.length && !progress.sessionFor(kind)) { window.SoriNav.go('#review'); return; }
  sessionMode='voice';
  progress.start(choices,{kind,fresh}); window.SoriNav?.show('listen');
  viewRoot().classList.remove('single-phrase','collection','phrase-index');
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
    <a class="section-back" href="${s?.kind==='review'?'#review':'#conversations'}">Back to ${s?.kind==='review'?'review':'conversations'}</a></section>`;
}
function renderSession(play = false) {
  discardVoice(); window.SORI?.TTS?.cancel(); lastVerdict = null;
  const target = el('practiceSession'), session = progress.active();
  if (!session) { target.innerHTML = finishMarkup(progress.data.session); return; }
  const phrase = byId.get(session.ids[session.index]), scene = scenes[session.kind];
  const turn = scene?.turns.find(t => t[3] === phrase.k);
  const cue = turn ? `<section class="speaker-cue"><div class="turn-cap"><span>${esc(scene.role)}</span></div>
    <p lang="ko">${esc(turn[0])}</p><p class="roman-line">${esc(turn[5])}</p><p class="meaning-line">${esc(turn[1])}</p></section>` : '';
  target.innerHTML = `<header class="session-header"><a class="section-back" href="${session.kind === 'review' ? '#review' : '#conversations'}">${session.kind === 'review' ? 'Review' : 'Conversations'}</a>
    <span>Turn ${session.index + 1} of ${session.ids.length}</span></header>
    <progress max="${session.ids.length}" value="${session.index + 1}" aria-label="Current turn"></progress>
    <h1>${esc(scene?.title || (session.kind === 'review' ? 'Review your replies' : 'Everyday expressions'))}</h1>${cue}
    <section class="session-answer"><div class="turn-cap"><span>Your turn</span><button class="text-button memory-toggle" aria-expanded="true" aria-controls="replyExample" data-memory>Try from memory</button></div>
    <p class="turn-intent">${esc(turn ? turn[2] : phrase.e)}</p>
    <div id="replyExample"><h2 lang="ko" data-spoken-model>${esc(phrase.k)}</h2><p class="roman-line">${esc(phrase.p)}</p>${turn ? `<p class="meaning-line">${esc(phrase.e)}</p>` : ''}</div>
    ${spokenTurnControls({compare:true})}
    <details class="speaking-tip"><summary>Listen to the example</summary><div class="audio-choices">${audioButton(phrase.k,'Natural')}${audioButton(phrase.k,'Slow',0.65)}</div></details>${turn ? `<details class="speaking-tip"><summary>Speaking tip</summary><p>${esc(turn[4])}</p></details>` : ''}
    <div class="recall-actions"><button class="text-button" data-practice-answer="again">Review later</button><button class="sori-secondary" data-practice-answer="remembered">${session.index + 1 === session.ids.length ? 'Finish practice' : 'Next turn'} →</button></div></section>${saveNotice()}`;
  voice=mountSpokenTurn(target.querySelector('.spoken-turn'),window,{cue:turn?turn[0]:phrase.k,answer:phrase.k,alternatives:turn?.[6]||[],
    modelLine:target.querySelector('[data-spoken-model]'),start:play,typed:sessionMode==='type',onMode:mode=>{sessionMode=mode;},
    onVerdict(kind){lastVerdict=kind;if(kind==='retry')progress.markMissed();}});

}
function route() {
  if (!progress) return;
  const params = new URLSearchParams(location.hash.slice(1));
  if (params.get('practice') === 'vocabulary') openVocabulary();
  else if (Object.hasOwn(scenes,params.get('practice')) || ['daily','review'].includes(params.get('practice'))) view(params.get('practice'));
  else if (params.has('phrase')) openPhrase(params.get('phrase'),false);
  else if (['#phrases','#speak'].includes(location.hash)) browse(false);
  else if (location.hash === '#collection') collection();
  else if (['','#home','#conversations','#review','#saved-phrases'].includes(location.hash)) { homePanel();window.scrollTo({top:0,behavior:'instant'}); }
}
function boot() {
  rows = Object.values(window.SoriDataIndex || {}).flat(); byId = new Map(rows.map(p => [p.id,p])); byKorean = new Map(rows.map(p => [p.k,p]));
  let storage;
  try { storage = localStorage; } catch { storage = {getItem(){return null;},setItem(){throw Error('Storage unavailable');}}; }
  progress = new PracticeProgress({storage,ids:byId.keys()}); currentScope = window.firebaseAuth?.currentUser?.uid || null; progress.setUser(currentScope);
  dailyWords = new DailyVocabulary(storage, currentScope);
  window.SoriPractice = {library,openPhrase,browse,repeatPhrase,hasPhraseVoice:()=>Boolean(lessonVoice),roundKind:()=>dailyWords.custom()?.kind};
  for (const root of document.querySelectorAll('[data-phrase-finder]')) {
    const home = root.dataset.phraseFinder === 'home';
    const control = mountPhraseSearch(root,rows,{home,open:openPhrase,browse});
    if (!home) phrasebook = control;
  }
  paintHome(); route();
}
document.addEventListener('click',event => {
  const b = event.target.closest('button'); if (!b || !progress) return;
  if (b.hasAttribute('data-vocab-difficulty')) {
    if (dailyWords.difficulty() !== b.dataset.vocabDifficulty) {
      dailyWords.setDifficulty(b.dataset.vocabDifficulty); paintHome();
      if (new URLSearchParams(location.hash.slice(1)).get('practice') === 'vocabulary') openVocabulary();
    }
    return;
  }
  if (b.hasAttribute('data-vocab-start') || b.hasAttribute('data-vocab-review')) {
    const round = b.hasAttribute('data-vocab-review') ? dailyWords.startReview(b.dataset.vocabReview) :
      dailyWords.startTopic(b.dataset.vocabStart,b.dataset.vocabLevel || dailyWords.difficulty(),b.dataset.vocabWord);
    if (round) { changeHash('#practice=vocabulary&view=round'); openVocabulary(true); }
    return;
  }
  if (b.hasAttribute('data-open-vocabulary')) {
    const day = dailyWords.today();
    if (day.index === day.words.length) { dailyWords.setIndex(0,day.day); paintHome(); }
    changeHash('#practice=vocabulary'); openVocabulary(true);
  }
  if(b.hasAttribute('data-saved-phrase'))openPhrase(b.dataset.savedPhrase,true,'review');
  if(b.hasAttribute('data-start-quiz')){changeHash('#quiz');window.SoriNav.show('quiz');window.SoriQuiz?.start();}
  if (Object.hasOwn(scenes,b.dataset.scene)) { changeHash('#practice=' + b.dataset.scene); view(b.dataset.scene,{play:true}); }
  if (b.matches('[data-practice-start],[data-practice-new]')) {changeHash('#practice=daily');view('daily',{fresh:b.hasAttribute('data-practice-new'),play:true});}
  if (b.hasAttribute('data-practice-review')) {changeHash('#practice=review');view('review',{play:true});}
  if (b.hasAttribute('data-retry-misses')) {changeHash('#practice=review');view('review',{fresh:true,pool:progress.data.session.missed,play:true});}
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
  if (event.detail.view !== 'listen') { phraseAuto=false;library(); closeLessonVoice(); }
  if (event.detail.view === 'home' && dailyWords) paintHome();
});
window.addEventListener('sori-model-start',()=>{stopRepeats();voice?.onModel();lessonVoice?.onModel();});
window.addEventListener('savedListChanged',()=>{if(dailyWords)paintHome();});
window.addEventListener('pagehide',() => { discardVoice(); closeLessonVoice(); });
document.addEventListener('visibilitychange',() => { if (document.hidden) { stopRepeats();voice?.onModel(); lessonVoice?.onModel(); window.SORI?.TTS?.cancel(); } });
window.addEventListener('sori-phrase-shown',event => {
  if (!progress || openingPhrase) return;
  const shown=viewRoot().style.display!=='none' && (viewRoot().classList.contains('single-phrase') || viewRoot().classList.contains('collection'));
  if (event.detail.id && shown) {
    if(!lessonVoice || phraseModel!==el('korean').textContent.trim())setupLessonVoice(phraseAuto);
  } else closeLessonVoice();
  if (event.detail.id && viewRoot().style.display !== 'none' && el('practiceSession').hidden) {
    progress.setLast(event.detail.id);
    if (viewRoot().classList.contains('single-phrase') && location.hash.startsWith('#phrase=')) {
      const from=new URLSearchParams(location.hash.slice(1)).get('from');
      history.replaceState(null,'','#phrase=' + encodeURIComponent(event.detail.id)+(from?'&from='+encodeURIComponent(from):''));
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
