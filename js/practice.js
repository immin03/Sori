/* One audio interaction, whether you start at home or in a shared trip. */
(function(){
 let playingButton=null;
 document.addEventListener('click',async e=>{
  const button=e.target.closest('[data-audio]');if(!button)return;
  if(playingButton===button){window.SORI?.TTS?.cancel();return;}
  const label=button.textContent;playingButton=button;button.textContent='Loading…';button.setAttribute('aria-busy','true');
  let status=button.closest('.today-practice,.place-language')?.querySelector('.audio-status');
  if(!status){status=document.createElement('p');status.className='audio-status';status.setAttribute('role','status');button.closest('.today-practice,.place-language')?.appendChild(status);}
  status.textContent='Getting the audio ready…';
  try{await window.SORI.TTS.speak(button.dataset.audio,{rate:Number(button.dataset.rate)||0.8,onPlaying(){button.textContent='Stop';status.textContent='Listen, then say it out loud.';}});status.textContent='Your turn. Say it out loud, then listen again.';}
  catch(error){status.textContent=error.name==='AbortError'?'':'Audio could not play. Please tap to try again.';}
  finally{button.textContent=label;button.removeAttribute('aria-busy');if(playingButton===button)playingButton=null;}
 });
 document.addEventListener('click',e=>{const b=e.target.closest('[data-listen-rate]');if(!b)return;const speed=document.getElementById('speed');speed.value=b.dataset.listenRate;speed.dispatchEvent(new Event('input',{bubbles:true}));});
 document.getElementById('speed')?.addEventListener('input',e=>{document.querySelectorAll('[data-listen-rate]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.listenRate)===Number(e.target.value))));});
})();
