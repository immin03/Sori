/* One audio interaction, whether you start at home or in a shared trip. */
(function(){
 let playingButton=null;
 document.addEventListener('click',async e=>{
  const button=e.target.closest('[data-audio]');if(!button)return;
  repeatRun++;
  if(playingButton===button){window.SORI?.TTS?.cancel();return;}
  const label=button.textContent;playingButton=button;button.textContent='Loading…';button.setAttribute('aria-busy','true');
  let status=button.closest('.today-practice,.place-language,.session-answer')?.querySelector('.audio-status');
  if(!status){status=document.createElement('p');status.className='audio-status';status.setAttribute('role','status');button.closest('.today-practice,.place-language,.session-answer')?.appendChild(status);}
  status.textContent='Getting the audio ready…';
  try{await window.SORI.TTS.speak(button.dataset.audio,{rate:Number(button.dataset.rate)||0.8,onPlaying(){button.textContent='Stop';status.textContent='Listen, then say it out loud.';}});status.textContent='Your turn. Say it out loud, then listen again.';}
  catch(error){status.textContent=error.name==='AbortError'?'':'Audio could not play. Please tap to try again.';}
  finally{button.textContent=label;button.removeAttribute('aria-busy');if(playingButton===button)playingButton=null;}
 });
 document.addEventListener('click',e=>{const b=e.target.closest('[data-listen-rate]');if(!b)return;const speed=document.getElementById('speed');speed.value=b.dataset.listenRate;speed.dispatchEvent(new Event('input',{bubbles:true}));});
 document.getElementById('speed')?.addEventListener('input',e=>{document.querySelectorAll('[data-listen-rate]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.listenRate)===Number(e.target.value))));});
let repeatRun=0,repeatButton=null;
 document.addEventListener('click',async e=>{const button=e.target.closest('[data-repeat-current]');if(!button)return;
  if(repeatButton===button){repeatRun++;window.SORI?.TTS?.cancel();return;}
  const run=++repeatRun;repeatButton=button;const text=button.dataset.audioText;if(!text)return;
  try{for(let i=0;i<3;i++){if(run!==repeatRun)break;button.textContent='Stop practice · '+(i+1)+' / 3';await window.SORI.TTS.speak(text,{rate:Number(document.getElementById('speed').value)||0.8});window.dispatchEvent(new CustomEvent('sori-repeat-ended',{detail:{text}}));if(run!==repeatRun)break;button.textContent='Your turn… Stop practice';await new Promise(resolve=>setTimeout(resolve,1500));}}
  catch(error){if(error.name!=='AbortError'){const status=document.getElementById('lessonAudioStatus');if(status)status.textContent='Audio could not play. You can use Listen & Repeat instead.';}}
  finally{if(repeatButton===button){repeatButton=null;button.textContent='Listen, pause & repeat · 3 times';}}
 });
 document.getElementById('playBtn')?.addEventListener('click',()=>{repeatRun++;});
 window.addEventListener('sori-view',()=>{repeatRun++;window.SORI?.TTS?.cancel();});
 window.addEventListener('sori-phrase-shown',()=>{repeatRun++;});
})();
