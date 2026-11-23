import {Journey} from './journey.js?v=20261123beta';
import {PracticeProgress} from './progress.js?v=20261123beta';
import {scenes} from './scenes.js?v=20261123beta';
import {mountSpokenTurn,spokenTurnControls} from './spoken-turn.js?v=20261123beta';
import {DailyVocabulary} from './vocabulary.js?v=20261123beta';
import {vocabularyCard,mountVocabulary} from './vocabulary-ui.js?v=20261123beta';
import {showVocabularyLibrary} from './vocabulary-library.js?v=20261123beta';
import {mountPhraseSearch} from './phrase-search.js?v=20261123levels';
import {sharePublic} from '../share-public.js?v=20261121trip';
import {situationGroups,matchingLevel,levelNames} from './categories.js?v=20261123levels';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el = id => document.getElementById(id);
let rows, byId, byKorean, progress, dailyWords, currentScope, voice, lessonVoice, phrasebook, lastVerdict;
let journey;
let sceneExpanded=false;
let sceneGroup='All places';
const legacyPlaces={cafe:'Café',restaurant:'Restaurant',social:'Meeting friends',shopping:'Shop',airport:'Airport',hotel:'Hotel',transport:'Station',help:'Visitor center',convenience:'Convenience store','street-food':'Food stall',market:'Market',department:'Department store'};
let libraryGroup='daily', phraseScope=null;
let phraseModel='', repeatStep=0, repeatTimer;
let phraseAuto=false, openingPhrase=false, sessionMode='voice';
const viewRoot = () => el('mainContent');
function saveNotice() {
  return progress.error ? '<p class="small-note" role="status">This browser could not save your progress.</p>' : '';
}
function dailyPool() {
  const priority = ['밥 먹었어요?','안녕하세요.','얼마예요?','안 매운 걸로, 주세요.','지하철역이 어디예요?'];
  return [...priority.map(k => byKorean.get(k)?.id).filter(Boolean),
    ...rows.filter(p => ['Cafe','Restaurant','Transport','Greeting','Hotel','Shopping'].includes(p.sub || p.t)).map(p => p.id)];
}
function homePanel() {
  const hash=location.hash;
  const panel=hash==='#conversations'?'conversations':hash==='#saved-phrases'?'saved':hash==='#review'?'review':'vocabulary';
  el('journeyPanel').hidden=!['conversations','vocabulary'].includes(panel);
  el('homeTitle').textContent=({vocabulary:'Vocabulary',conversations:'Conversations',review:'Review',saved:'Saved phrases'})[panel];
  for (const section of el('homeView').querySelectorAll('[data-speak-panel]')) section.hidden=section.dataset.speakPanel!==panel;
}
function reviewRow(href,title,summary) {
  return `<a class="section-row" href="${href}"><strong>${title}</strong><span>${summary}</span></a>`;
}
function roleplayCards(){
 const entries=Object.entries(scenes).filter(([key,s])=>sceneGroup==='All places'||sceneGroup===(s.place||legacyPlaces[key]||s.role));
 const visible=sceneGroup==='All places'&&!sceneExpanded?entries.slice(0,6):entries;
 return visible.map(([key,s])=>`<button class="scene-choice" data-scene="${key}"><small>${esc(s.place||legacyPlaces[key]||s.role)}</small><strong>${esc(s.title)}</strong><small>${s.level?levelNames[s.level]+' · ':''}${s.turns.length} turns</small></button>`).join('')+(visible.length<entries.length?'<button class="scene-choice" data-more-scenes>Show all '+entries.length+' conversations</button>':'');
}
document.addEventListener('change',e=>{if(e.target.matches('[data-scene-group]')){sceneGroup=e.target.value;e.target.closest('details').querySelector('.roleplay-grid').innerHTML=roleplayCards();}});
function paintHome() {
  if(journey.data.level && journey.data.level!==dailyWords.difficulty())dailyWords.setDifficulty(journey.data.level);
  el('dailyVocabulary').innerHTML = vocabularyCard(dailyWords);
  el('journeyPanel').innerHTML=journey.markup();
  const level='all', groups=situationGroups(window.SoriDataIndex);
  const selected=groups.find(g=>g.id===libraryGroup)||groups[0];
  const sceneTopics={Greeting:'social',Social:'social',Cafe:'cafe',Restaurant:'restaurant',Shopping:'shopping',Airport:'airport',Hotel:'hotel',Transport:'transport',Emergency:'help',Convenience:'convenience','Street Food':'street-food',Market:'market',Department:'department'};
  const topicLink=(group,topic)=>'#phrases='+encodeURIComponent(group)+'&amp;topic='+encodeURIComponent(topic);
  const paths={Greeting:'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',Social:'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8-1a3 3 0 1 0 0-6M2 20v-2a6 6 0 0 1 12 0v2M17 14a5 5 0 0 1 5 5',Love:'M12 20 4 12a5 5 0 0 1 8-6 5 5 0 0 1 8 6z',Cafe:'M4 7h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 8h3a2 2 0 0 1 0 4h-3M3 22h16',Restaurant:'M5 3v8m4-8v8M7 11v10M18 3v18m0-18a5 5 0 0 0-5 5v3h5',Shopping:'M4 8h16l-1 13H5zM8 8V6a4 4 0 0 1 8 0v2',Health:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',Work:'M3 7h18v13H3zM8 7V4h8v3M3 13h18M10 13v3h4v-3',Tech:'M3 4h18v12H3zM8 21h8M12 16v5',Exercise:'M3 9v6m4-9v12m10-12v12m4-9v6M7 12h10',Airport:'m2 12 20-8-7 18-3-7-7-3zM12 15 22 4',Hotel:'M3 5v16m18-10v10M3 16h18M3 9h7v7m0-4h11v4',Transport:'M4 4h16v14H4zM7 7h10M6 14h3m6 0h3M7 18l-2 3m12-3 2 3',Emergency:'M12 3 2 21h20zM12 9v5m0 3v1',Payment:'M3 5h18v14H3zM3 10h18M6 15h4',Sightseeing:'M12 22s7-8 7-14a7 7 0 0 0-14 0c0 6 7 14 7 14zm0-17a3 3 0 1 0 0 6 3 3 0 0 0 0-6'};
  const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.Greeting}"/></svg>`;
  el('practiceDashboard').innerHTML=`<div class="learning-intro"><h2>Learn Korean for real life</h2><p>${rows.length} expressions across ${groups.reduce((n,g)=>n+g.topics.length,0)} situations. Choose a topic and learn at your own pace.</p></div>
    <details class="scene-catalog" open><summary>Role-play by place · ${Object.keys(scenes).length} conversations</summary><label class="scene-location">Place <select data-scene-group>${['All places',...new Set(Object.entries(scenes).map(([id,s])=>s.place||legacyPlaces[id]||s.role))].map(p=>`<option ${p===sceneGroup?'selected':''}>${esc(p)}</option>`).join('')}</select></label><div class="roleplay-grid">${roleplayCards()}</div></details>
    <nav class="learning-groups" aria-label="Learning categories">${groups.map(g=>`<button data-library-group="${g.id}" aria-pressed="${g.id===selected.id}"><strong>${esc(g.title)}</strong><small>${g.topics.length} topics</small></button>`).join('')}</nav>
    <section class="conversation-group"><h2>${esc(selected.title)}</h2><p class="conversation-intro">${esc(selected.description)}</p><div class="conversation-grid">${selected.topics.map(t=>{
      const matches=matchingLevel(t.rows,level), scene=sceneTopics[t.name], roleplay=scene&&matchingLevel(scenes[scene].turns.map(t=>byKorean.get(t[3])).filter(Boolean),level).length>0&&selected.id!=='drama'&&selected.id!=='trendy'&&selected.id!=='numbers';
      return `<article class="conversation-card"><span class="scene-icon">${icon(t.name)}</span><strong>${esc(t.name)}</strong><small>${matches.length} expressions · ${levelNames[level]}</small>${matches.length?`<a class="topic-open" href="${topicLink(selected.id,t.name)}">View expressions <span>›</span></a>`:'<span class="small-note">Choose another level</span>'}${roleplay?`<button class="topic-roleplay" data-scene="${scene}">Role-play</button>`:''}</article>`;
    }).join('')}</div></section><div class="section-rows"><button class="section-row" data-practice-start><strong>Mixed everyday practice</strong><span>›</span></button><a class="section-row" href="#phrases"><strong>Search all expressions</strong><span>›</span></a></div>${saveNotice()}`;
  const shelf=dailyWords.shelf(), saved=(window.SoriSaved?.list || []).filter(id=>byId.has(id)), {due,last}=progress.stats();
  const again=progress.sessionFor('review');
  el('speakReview').innerHTML=`<div class="section-rows">
    ${reviewRow('#practice=vocabulary&amp;view=words','My words',String(shelf.length))}
    ${reviewRow('#saved-phrases','Saved phrases',String(saved.length))}
    ${due||again ? '<button class="section-row" data-practice-review><strong>Due expressions</strong><span>'+ (again?'Continue':due+' due')+'</span></button>' : '<div class="section-row quiet-row"><strong>Due expressions</strong><span>None due</span></div>'}
    <button class="section-row" data-start-quiz><strong>Listening quiz</strong><span aria-hidden="true">›</span></button></div>`;
  el('savedPhrases').innerHTML='<a class="section-back" href="#review">Review</a>'+(saved.length ?
    '<div class="section-rows">'+saved.map(id=>{const q=byId.get(id);return `<button class="section-row" data-saved-phrase="${esc(id)}"><strong lang="ko">${esc(q.k)}</strong><span>${esc(q.e)}</span></button>`;}).join('')+'</div>':
    '<p class="empty-note">Tap Save on a phrase to keep it here for speaking practice.</p><a class="section-back" href="#phrases">Open the phrasebook</a>');
  el('learnPracticeEntry').innerHTML='<button class="sori-secondary" data-browse-collection>Browse categories</button>'+(last?'<button class="text-button" data-practice-resume>Last expression</button>':'');
  homePanel();
}
function discardVoice() {  voice?.dispose(); voice = null; }
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
    rate:()=>Number(el('speed').value)||.8,onMode:mode=>{phraseAuto=mode==='voice';if(!phraseAuto)stopRepeats();},onVerdict:kind=>{if(kind==='correct'){const id=byKorean.get(model)?.id;if(id)journey.complete(id);}repeatVerdict(kind);},
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
function browse(push = true, group = "", topic = "", level = "all") {
  if (push) changeHash('#phrases');
  phraseAuto=false;library(); closeLessonVoice(); viewRoot().classList.add('phrase-index'); window.SoriNav?.show('listen');
  window.scrollTo({top:0,behavior:'instant'}); phrasebook?.setScope(group,topic,level);
  if(!group)phrasebook?.focus();
}
function collection() {
  phraseAuto=false;library(); window.SoriNav?.show('listen'); viewRoot().classList.add('collection');
  setupLessonVoice(); window.scrollTo({top:0,behavior:'instant'});
}
function openPhrase(id, push = true, from = '', scope = null) {
  if (!byId.has(id)) { browse(false); return; }
  if(push) phraseScope=scope;
  if (push) changeHash('#phrase=' + encodeURIComponent(id) + (from ? '&from='+from : '')+(scope?.group?'&group='+encodeURIComponent(scope.group)+'&topic='+encodeURIComponent(scope.topic)+'&level='+encodeURIComponent(scope.level):''));
  window.SoriNav?.show('listen');
  openingPhrase=true;
  try { if (!window.SoriLearn?.openId(id,phraseScope?.ids)) return; } finally {openingPhrase=false;}
  viewRoot().classList.add('single-phrase');
  const parent=new URLSearchParams(location.hash.slice(1)).get('from');
  const back=el('lessonCard').querySelector('.lesson-back');
  back.textContent='×';back.setAttribute('aria-label',parent==='review'?'Back to saved phrases':'Back to phrasebook');back.href=parent==='review'?'#saved-phrases':phraseScope?.group?'#phrases='+encodeURIComponent(phraseScope.group)+'&topic='+encodeURIComponent(phraseScope.topic)+'&level='+encodeURIComponent(phraseScope.level):'#phrases';
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
  const choices = pool || (Object.hasOwn(scenes,kind) ? scenes[kind].turns.map(t=>byKorean.get(t[3])?.id).filter(Boolean) :
    kind==='path' ? journey.remaining().map(p=>p.id) :
    kind === 'review' ? progress.due() : dailyPool().filter(id=>matchingLevel([byId.get(id)],dailyWords.difficulty()).length));
  if(kind==='path' && !choices.length && progress.active()?.kind==='path')choices.push(...progress.active().ids);
  if (!choices.length) { window.SoriNav.go('#conversations'); return; }
  sessionMode='voice';
  const previous=progress.sessionFor(kind);
  progress.start(choices,{kind,fresh:fresh||Boolean(previous&&Object.hasOwn(scenes,kind)&&previous.ids.some(id=>!choices.includes(id)))}); window.SoriNav?.show('listen');
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
  if(s?.kind==='path')return '<section class="practice-finish"><h1>Lesson complete</h1><p>Your next lesson starts with the expressions you still need.</p>'+journey.markup()+'<a class="section-back" href="#conversations">Back to conversations</a></section>';
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
  target.innerHTML = `<header class="session-header"><a class="section-back focus-exit" aria-label="Exit practice" href="${session.kind === 'review' ? '#review' : '#conversations'}">×</a>
    <span>${session.index+1} / ${session.ids.length}</span></header>
    <progress max="${session.ids.length}" value="${session.index + 1}" aria-label="Current turn"></progress>
    <h1>${turn?'Listen and reply':'Say it in Korean'}</h1>${cue}
    <section class="session-answer"><div class="turn-cap"><span>Your reply</span></div>
    <p class="reply-intent">${esc(turn?.[2]||phrase.e)}</p><div id="replyExample"><h2 lang="ko" data-spoken-model>${esc(phrase.k)}</h2><p class="roman-line">${esc(phrase.p)}</p><p class="meaning-line">${turn?esc(phrase.e):''}</p></div>
    ${spokenTurnControls({compare:true})}
    <div class="recall-actions"><button class="text-button" data-practice-answer="again">Skip</button><button class="sori-primary" data-practice-answer="remembered" hidden>${session.index + 1 === session.ids.length ? 'Finish' : 'Next'}</button></div>
    <div class="audio-choices review-audio">${audioButton(phrase.k,'Hear reply')}${audioButton(phrase.k,'Slow',0.65)}</div><details class="speaking-tip"><summary>Practice tips</summary>${turn?`<p>${esc(turn[4])}</p>`:''}<button class="text-button" aria-expanded="true" aria-controls="replyExample" data-memory>Try from memory</button></details></section>${saveNotice()}`;
  const next=target.querySelector('[data-practice-answer="remembered"]');

  voice=mountSpokenTurn(target.querySelector('.spoken-turn'),window,{cue:turn?turn[0]:phrase.k,answer:phrase.k,alternatives:turn?.[6]||[],
    modelLine:target.querySelector('[data-spoken-model]'),start:play,turnSignal:true,typed:sessionMode==='type',onMode:mode=>{sessionMode=mode;},
    onVerdict(kind){
      lastVerdict=kind;
      if(kind==='retry'){progress.markMissed();next.hidden=false;}
      if(kind==='correct'){
        journey.complete(phrase.id);
        next.hidden=false;
        target.querySelector('[data-practice-answer="again"]').hidden=true;
        next.focus({preventScroll:true});
      }
    }});

}
function route() {
  if (!progress) return;
  const params = new URLSearchParams(location.hash.slice(1));
  if (params.get('practice') === 'vocabulary') openVocabulary();
  else if (Object.hasOwn(scenes,params.get('practice')) || ['daily','review','path'].includes(params.get('practice'))) view(params.get('practice'));
  else if (params.has('phrase')) {const group=params.get('group'),topic=params.get('topic')||'',level=params.get('level')||'all';phraseScope=group?{group,topic,level,ids:matchingLevel((window.SoriDataIndex[group]||[]).filter(r=>!topic||(r.sub||r.t)===topic),level).map(r=>r.id)}:null;openPhrase(params.get('phrase'),false);}
  else if (params.has('phrases') || ['#phrases','#speak'].includes(location.hash)) browse(false,params.get('phrases')||'',params.get('topic')||'',params.get('level')||'all');
  else if (location.hash === '#collection') collection();
  else if (['','#home','#conversations','#review','#saved-phrases'].includes(location.hash)) { homePanel();window.scrollTo({top:0,behavior:'instant'}); }
}
function prioritizePath(all) {
 const priority=['밥 먹었어요?','안녕하세요.','안녕하세요!','반가워요.'];
 const rank=r=>priority.includes(r.k)?priority.indexOf(r.k):r.sub==='Greeting'?10:20;
 return [...all].sort((a,b)=>rank(a)-rank(b));
}
function boot() {
  rows = Object.values(window.SoriDataIndex || {}).flat(); byId = new Map(rows.map(p => [p.id,p])); byKorean = new Map(rows.map(p => [p.k,p]));
  let storage;
  try { storage = localStorage; } catch { storage = {getItem(){return null;},setItem(){throw Error('Storage unavailable');}}; }
  progress = new PracticeProgress({storage,ids:byId.keys()}); currentScope = window.firebaseAuth?.currentUser?.uid || null; progress.setUser(currentScope);
  journey = new Journey(storage,currentScope,prioritizePath(rows));
  dailyWords = new DailyVocabulary(storage, currentScope);
  window.SoriPractice = {library,openPhrase,browse,repeatPhrase,hasPhraseVoice:()=>Boolean(lessonVoice),roundKind:()=>dailyWords.custom()?.kind};
  for (const root of document.querySelectorAll('[data-phrase-finder]')) {
    const home = root.dataset.phraseFinder === 'home';
    const control = mountPhraseSearch(root,rows,{home,open:openPhrase,browse,index:window.SoriDataIndex});
    if (!home) phrasebook = control;
  }
  paintHome(); route();
}
document.addEventListener('click',event => {
  const b = event.target.closest('button'); if (!b || !progress) return;
  if(b.matches('[data-path-test],[data-path-begin],[data-path-answer]')){
    if(b.hasAttribute('data-path-test'))journey.testing=true;
    else if(b.hasAttribute('data-path-begin'))journey.select('essentials');
    else journey.answer(Number(b.dataset.pathAnswer));
    if(journey.data.level)dailyWords.setDifficulty(journey.data.level);
    paintHome();el('journeyPanel').querySelector('h2')?.scrollIntoView({block:'nearest'});return;
  }
  if(b.hasAttribute('data-path-continue')){changeHash('#practice=path');view('path',{play:true});return;}
  if(b.hasAttribute('data-more-scenes')){sceneExpanded=true;b.closest('.roleplay-grid').innerHTML=roleplayCards();return;}
  if(b.dataset.libraryGroup){libraryGroup=b.dataset.libraryGroup;paintHome();return;}
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
      history.replaceState(null,'','#phrase=' + encodeURIComponent(event.detail.id)+(from?'&from='+encodeURIComponent(from):'')+(phraseScope?.group?'&group='+encodeURIComponent(phraseScope.group)+'&topic='+encodeURIComponent(phraseScope.topic)+'&level='+encodeURIComponent(phraseScope.level):''));
    }
  }
  paintHome();
});
window.addEventListener('sori-auth-changed',() => {
  const next = window.firebaseAuth?.currentUser?.uid || null;
  if (!progress || next === currentScope) return;
  currentScope = next; library(); closeLessonVoice(); progress.setUser(next);
  journey=new Journey(progress.storage,next,prioritizePath(rows));
  dailyWords = new DailyVocabulary(progress.storage, next); paintHome(); route();
});

window.addEventListener('sori-word-learned',e=>journey?.complete(e.detail,true));
