import {PracticeProgress} from './progress.js?v=20261120ux1';
import {scenes} from './scenes.js?v=20261120ux1';
import {attachVoiceReply,recorderControls} from './voice-reply.js?v=20261120ux1';
import {sharePublic} from '../share-public.js?v=20261120ux1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let rows=[],byId,byKorean,progress,currentScope,voice,lessonVoice,revealed=false;
function feedback(){return progress.error?'<p class="small-note" role="status">This browser could not save your progress. Your current practice still works.</p>':'';}
function dailyPool(){
  const priority=['아메리카노 한 잔, 주세요.','얼마예요?','안 매운 걸로, 주세요.','지하철역이 어디예요?'];
  return [...priority.map(k=>byKorean.get(k)?.id).filter(Boolean),...rows.filter(p=>['Cafe','Restaurant','Transport','Greeting','Hotel','Shopping'].includes(p.sub||p.t)).map(p=>p.id)];
}

function sceneButtons(){
  return Object.entries(scenes).map(([key,s])=>{
    const active=progress.sessionFor(key);
    return `<button class="scene-choice" data-scene="${key}"><strong>${esc(s.title)}</strong><span>${active?'Continue at turn '+(active.index+1):'3 turns'} <span aria-hidden="true">›</span></span></button>`;
  }).join('');
}

function paintHome(){
  const {today,due,last}=progress.stats(),active=progress.sessionFor('daily');
  document.getElementById('practiceDashboard').innerHTML=`<div class="practice-summary"><div><span class="eyebrow">Speaking practice</span><h2>Your next conversation</h2></div><span class="practice-total">${Math.min(5,today)} / 5 today</span></div><div class="scene-choices">${sceneButtons()}</div><div class="practice-dashboard-actions"><button class="text-button" data-practice-start>${active?'Continue daily practice':'Practise five expressions'}</button>${due?`<button class="text-button" data-practice-review>Review ${due} due</button>`:''}</div>${feedback()}`;
  document.getElementById('learnPracticeEntry').innerHTML=`<section aria-label="Choose a conversation"><h2>Try a conversation</h2><div class="scene-choices">${sceneButtons()}</div><div class="practice-dashboard-actions"><button class="sori-secondary" data-practice-start>${active?'Continue your five expressions':'Five-expression practice'}</button>${due?`<button class="text-button" data-practice-review>Review ${due} due</button>`:''}${last?'<button class="text-button" data-practice-resume>Last expression</button>':''}</div></section>`;
}

function discardVoice(){voice?.dispose();voice=null;}

function closeLessonVoice(){
  lessonVoice?.dispose();lessonVoice=null;
  const panel=document.getElementById('lessonVoice');
  if(panel){panel.open=false;panel.querySelector('.voice-slot').replaceChildren();}
}
function setupLessonVoice(){
  const panel=document.getElementById('lessonVoice');
  panel.addEventListener('toggle',()=>{
    lessonVoice?.dispose();lessonVoice=null;
    const slot=panel.querySelector('.voice-slot');slot.replaceChildren();
    if(panel.open){
      slot.innerHTML=recorderControls();
      lessonVoice=attachVoiceReply(slot,window,document.getElementById('korean').textContent.trim());
    }
  });
}
function library(){
  discardVoice();window.SORI?.TTS?.cancel();
  document.getElementById('mainContent').classList.remove('practice-session-active');document.getElementById('practiceSession').hidden=true;
}

function view(kind,fresh=false){
  closeLessonVoice();
  let pool;
  if(Object.hasOwn(scenes,kind))pool=scenes[kind].turns.map(t=>byKorean.get(t[3])?.id).filter(Boolean);
  else pool=kind==='review'?progress.due():dailyPool();
  if(!pool.length&&!progress.sessionFor(kind))return;
  progress.start(pool,{kind,fresh});window.SoriNav?.show('listen');
  document.getElementById('mainContent').classList.add('practice-session-active');
  document.getElementById('practiceSession').hidden=false;
  renderSession();paintHome();window.scrollTo({top:0,behavior:'instant'});
}

function audioButton(line,label,rate=1){
  return `<button type="button" class="sori-secondary" data-audio="${esc(line)}" data-rate="${rate}">${label}</button>`;
}

function finishMarkup(session){
  const scene=scenes[session?.kind];
  const next=Object.keys(scenes).find(k=>k!==session?.kind);
  return `<section class="practice-finish"><span class="eyebrow">Practice complete</span><h1>${scene?'Conversation complete':'Practice complete'}</h1><p>${scene?`You took all ${session.ids.length} turns in “${esc(scene.title)}.”`:`You practised ${session?.ids.length||0} expressions.`} Expressions marked for review will come back.</p>${scene?`<button class="sori-primary" data-scene="${session.kind}">Try this conversation again</button><button class="sori-secondary" data-challenge="${session.kind}">Challenge a friend</button><p id="challengeStatus" role="status"></p><button class="text-button" data-scene="${next}">${esc(scenes[next].title)} ›</button>`:'<button class="sori-primary" data-practice-new>Practise another five</button>'}<button class="text-button" data-practice-library>Browse expressions</button></section>`;
}

function renderSession(){
  discardVoice();window.SORI?.TTS?.cancel();revealed=false;
  const target=document.getElementById('practiceSession'),s=progress.active();
  if(!s){target.innerHTML=finishMarkup(progress.data.session);return;}
  const p=byId.get(s.ids[s.index]),scene=scenes[s.kind],turn=scene?.turns.find(t=>t[3]===p.k);
  const cue=turn?`<div class="speaker-cue"><span class="eyebrow">${esc(scene.role)}</span><p lang="ko">${esc(turn[0])}</p>${audioButton(turn[0],'Hear the '+scene.role.toLowerCase())}<details><summary>Show English</summary><p>${esc(turn[1])}</p></details></div>`:'';
  target.innerHTML=`<header class="session-header"><button class="text-button" data-practice-library>Pause & browse</button><span>Turn ${s.index+1} of ${s.ids.length}</span></header><progress max="${s.ids.length}" value="${s.index+1}" aria-label="Current turn"></progress><div class="session-prompt"><h1>${esc(scene?.title||'How would you say this?')}</h1>${cue}<span class="eyebrow">Your turn</span><p class="recall-prompt">${esc(turn?turn[2]:p.e)}</p>${recorderControls()}<button class="sori-primary" data-practice-reveal>Hear an example reply</button></div><section id="sessionAnswer" class="session-answer" hidden><span class="eyebrow">One way to say it</span><h2 lang="ko">${esc(p.k)}</h2><details><summary>Pronunciation guide & meaning</summary><p>${esc(p.p)}<br>${esc(p.e)}</p></details><div class="audio-choices">${audioButton(p.k,'Natural speed')}${audioButton(p.k,'Slow speed',0.65)}</div>${turn?`<p class="practice-instruction">${esc(turn[4])}</p>`:''}<div class="recall-actions"><button class="sori-secondary" data-practice-answer="again">Review later</button><button class="sori-primary" data-practice-answer="remembered">${s.index+1===s.ids.length?'Finish practice':'Got it · next turn'}</button></div></section>${feedback()}`;
  voice=attachVoiceReply(target.querySelector('.reply-recorder'));
}

function openShared(){
  const kind=new URLSearchParams(location.hash.slice(1)).get('practice');
  if(progress&&Object.hasOwn(scenes,kind))view(kind);
}

function boot(){
  rows=Object.values(window.SoriDataIndex||{}).flat();byId=new Map(rows.map(p=>[p.id,p]));byKorean=new Map(rows.map(p=>[p.k,p]));
  let storage;try{storage=localStorage;}catch{storage={getItem(){return null;},setItem(){throw Error('Storage unavailable');}};}
  progress=new PracticeProgress({storage,ids:byId.keys()});currentScope=window.firebaseAuth?.currentUser?.uid||null;progress.setUser(currentScope);
  window.SoriPractice={library};setupLessonVoice();paintHome();openShared();
}

function handleClick(e){
  const b=e.target.closest('button');if(!b||!progress)return;
  if(b.matches('[data-audio],[data-repeat-current],#playBtn')){voice?.onModel();lessonVoice?.onModel();}
  if(b.dataset.scene&&Object.hasOwn(scenes,b.dataset.scene)){
    const hash='#practice='+b.dataset.scene;
    if(location.hash!==hash)history.pushState(null,'',hash);
    view(b.dataset.scene);
  }
  if(b.hasAttribute('data-practice-start'))view('daily');
  if(b.hasAttribute('data-practice-new'))view('daily',true);
  if(b.hasAttribute('data-practice-review'))view('review');
  if(b.hasAttribute('data-practice-resume')){library();window.SoriLearn?.openId(progress.data.last);window.SoriNav?.show('listen');window.scrollTo({top:0,behavior:'instant'});}
  if(b.hasAttribute('data-practice-library')){library();if(location.hash.startsWith('#practice='))history.replaceState(null,'','#speak');paintHome();document.querySelector('#learnPracticeEntry button')?.focus();}
  if(b.hasAttribute('data-practice-reveal')){
    revealed=true;const a=document.getElementById('sessionAnswer');a.hidden=false;b.hidden=true;
    const audio=a.querySelector('[data-audio]');voice?.allowModel(audio.dataset.audio);audio.focus({preventScroll:true});a.scrollIntoView({block:'nearest'});audio.click();
  }
  if(b.dataset.practiceAnswer&&revealed){progress.answer(b.dataset.practiceAnswer);renderSession();paintHome();window.scrollTo({top:0,behavior:'instant'});const h=document.querySelector('#practiceSession h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}
  if(Object.hasOwn(scenes,b.dataset.challenge)){const key=b.dataset.challenge;sharePublic({title:scenes[key].title,text:'Take three turns in Korean with me.',url:location.origin+'/#practice='+key},document.getElementById('challengeStatus'));}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
document.addEventListener('click',handleClick);
window.addEventListener('hashchange',()=>{if(location.hash==='#speak')library();else openShared();});
window.addEventListener('sori-view',e=>{if(e.detail.view!=='listen'){library();closeLessonVoice();}});
window.addEventListener('pagehide',()=>{discardVoice();closeLessonVoice();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){voice?.onModel();lessonVoice?.onModel();window.SORI?.TTS?.cancel();}});
window.addEventListener('sori-phrase-shown',e=>{if(progress){closeLessonVoice();progress.setLast(e.detail.id);paintHome();}});
window.addEventListener('sori-auth-changed',()=>{if(!progress)return;const next=window.firebaseAuth?.currentUser?.uid||null;if(next===currentScope)return;currentScope=next;library();closeLessonVoice();progress.setUser(next);paintHome();});
