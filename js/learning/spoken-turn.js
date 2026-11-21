import {attachVoiceReply,recorderControls} from './voice-reply.js?v=20261121focus';
import {checkWords} from './word-check.js?v=20261121nav';
import {paintSpokenLine} from './speech-highlight.js?v=20261121nav';

// One playback owns one microphone handoff. A later turn, stop or failed cue invalidates it.
export function cueHandoff({speak,cancel,listen,stopVoice,visible,show}) {
  let sequence = 0, pending = false;
  function stop() {
    sequence++;
    if (pending) { pending=false; cancel(); }
    stopVoice(); show('idle');
  }
  async function play() {
    stop();
    const own = sequence;
    let audible = false;
    pending=true; show('loading');
    try {
      await speak(() => {
        if (own === sequence) { audible=true; show('playing'); }
      });
      if (own !== sequence) return;
      pending=false; show('idle');
      if (audible && visible()) listen();
    } catch (error) {
      if (own !== sequence) return;
      pending=false; show(error.name === 'AbortError' ? 'idle' : 'error');
    }
  }
  return {play,stop,get pending(){return pending;}};
}

export function spokenTurnControls({externalButton=false,choice=false,compare=false} = {}) {
  return `<div class="spoken-turn">
    ${externalButton ? '' : '<button type="button" class="sori-secondary focus-listen" data-turn-cue>Listen</button>'}
    <p class="turn-audio-state" role="status" data-turn-audio></p>
    ${recorderControls({exercise:true})}
    ${choice ? '' : '<button type="button" class="text-button" data-turn-type>Type instead</button><form class="vocab-type" data-turn-form hidden><label>Your answer in Korean<input lang="ko" autocomplete="off" required></label><button type="submit" class="sori-secondary">Check answer</button><p role="status"></p></form>'}
    ${compare ? '<details class="turn-recording"><summary>Record and compare</summary><div data-recording-slot></div></details>' : ''}
  </div>`;
}
export function mountSpokenTurn(root,env,{cue,answer,alternatives=[],start=false,typed=false,externalButton,
  rate=() => 1,language='ko-KR',modelLine,onMode,onVerdict,onHeard,onPlayed,choice=false}={}) {
  const get=s=>root.querySelector(s);
  const button=externalButton || get('[data-turn-cue]'), status=get('[data-turn-audio]');
  const mic=get('.vocab-mic'), type=get('[data-turn-type]'), form=get('[data-turn-form]');
  const details=get('.turn-recording');
  let voice, manual, disposed=false;
  const handoff=cueHandoff({
    speak:onPlaying=>env.SORI.TTS.speak(cue,{rate:rate(),onPlaying}),cancel:()=>env.SORI.TTS.cancel(),
    stopVoice:()=>{voice?.onModel();manual?.onModel();},
    visible:()=>!disposed && !env.document.hidden && !typed && root.isConnected,
    listen:()=>{ onPlayed?.();voice.start(); },
    show(state) {
      if (disposed) return;
      const busy=state==='loading'||state==='playing';
      button.textContent=busy?'Stop audio':'Listen';
      button.setAttribute('aria-label',button.textContent);
      button.setAttribute('aria-busy',String(state==='loading'));
      status.textContent=({loading:'Loading…',playing:'Playing…',error:'Audio couldn’t play. Tap to retry.'})[state] || '';
      mic.hidden=busy||typed;
    }
  });
  function answerResult(kind,heard) {
    if (disposed) return;
    if(root.setAttribute)root.setAttribute('data-answer-state',kind);
    onVerdict?.(kind,heard);
  }
  voice=attachVoiceReply(mic,env,answer,alternatives,answerResult,{
    exercise:true,language,choice,fullSentence:true,
    onBegin(){handoff.stop(); if(root.removeAttribute)root.removeAttribute('data-answer-state'); onMode?.('voice');},
    onTranscript(text){ if(modelLine)paintSpokenLine(modelLine,answer,text);onHeard?.(text); }
  });
  function mirrorInput(focus=false) {
    mic.hidden=typed;
    if (!form) return;
    form.hidden=!typed; type.textContent=typed?'Speak instead':'Type instead';
    if(typed && focus)form.querySelector('input').focus();
  }
  function play() {
    typed=false; mirrorInput(); onMode?.('voice');
    if(details?.open)details.open=false;
    if(handoff.pending)handoff.stop();else handoff.play();
  }
  button.addEventListener('click',play);
  if(type)type.onclick=()=>{
    handoff.stop();typed=!typed;mirrorInput(true);onMode?.(typed?'type':'voice');
    if(!typed)handoff.play();
  };
  if(form)form.onsubmit=e=>{
    e.preventDefault();const text=form.querySelector('input').value.trim();if(!text)return;
    const verdict=checkWords(answer,text,alternatives);
    form.querySelector('[role=status]').textContent=verdict.kind==='correct'?'Correct!':'Not quite. Try the Korean expression again.';
    answerResult(verdict.kind,text);
  };
  if(details)details.ontoggle=()=>{
    if(disposed || !details.open)return;
    handoff.stop();
    if(!manual){const slot=get('[data-recording-slot]');slot.innerHTML=recorderControls();manual=attachVoiceReply(slot,env,answer,alternatives,answerResult);}
  };
  handoff.stop(); mirrorInput();
  if(start)handoff.play();
  return {play,onModel:handoff.stop,dispose(){
    disposed=true;handoff.stop();voice.dispose();manual?.dispose();button.removeEventListener('click',play);
    if(type)type.onclick=null;if(form)form.onsubmit=null;if(details)details.ontoggle=null;
  }};
}
