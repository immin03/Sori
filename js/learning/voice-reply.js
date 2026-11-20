// One temporary recording per turn. Only the audio element receives the resulting URL.
export function recorderControls(){
  return '<div class="reply-recorder"><button class="sori-secondary" data-record-reply type="button">Record my reply</button><small>Optional · up to 15 seconds · only on this device</small><audio controls hidden aria-label="Play your recorded reply"></audio><button class="sori-secondary" data-compare-reply hidden type="button">Hear example, then my reply</button><p role="status" aria-live="polite"></p></div>';
}
export function attachVoiceReply(container, env=window, example='') {
  const record=container.querySelector('[data-record-reply]');
  const player=container.querySelector('audio');
  const compare=container.querySelector('[data-compare-reply]');
  let model=example;
  const updateCompare=()=>{compare.hidden=!clip||!model;};
  const feedback=container.querySelector('[role=status]');
  let stream=null, recorder=null, clip=null, timer=null, disposed=false, request=0;
  const stopTracks=s=>s?.getTracks().forEach(track=>track.stop());
  function clearClip(){
    player.pause(); player.removeAttribute('src'); player.hidden=true;
    if(clip){env.URL.revokeObjectURL(clip);clip=null;}updateCompare();
  }
  function release(){
    env.clearTimeout(timer);
    stopTracks(stream);stream=null;
  }
  function stop(){
    if(recorder?.state==='recording'){record.disabled=true;recorder.stop();}
    release();
  }
  function onModel(){
    player.pause();
    request++;
    if(recorder?.state==='recording')stop();
    else if(record.disabled && !recorder && env.navigator.mediaDevices?.getUserMedia && env.MediaRecorder){
      record.disabled=false;feedback.textContent='';record.textContent='Record my reply';
    }
  }
  const interruptExamples=()=>{env.dispatchEvent?.(new Event('sori-own-audio'));env.SORI?.TTS?.cancel();};
  player.addEventListener('play',interruptExamples);
  compare.onclick=async()=>{
    onModel();interruptExamples();const attempt=request;compare.disabled=true;
    try{
      feedback.textContent='Listen to the example first.';
      await env.SORI.TTS.speak(model,{rate:1});
      if(disposed||attempt!==request)return;
      feedback.textContent='Now listen to your reply.';await player.play();
    }catch(error){if(!disposed&&attempt===request&&error.name!=='AbortError')feedback.textContent='Use the audio controls to play each recording.';}
    finally{if(!disposed)compare.disabled=false;}
  };
  if(!env.navigator.mediaDevices?.getUserMedia||!env.MediaRecorder){
    record.disabled=true;feedback.textContent='Recording is unavailable in this browser. You can still say your reply and hear the example.';
  }
  record.onclick=async()=>{
    if(recorder?.state==='recording'){stop();return;}
    const attempt=++request;clearClip();interruptExamples();
    record.disabled=true;feedback.textContent='Waiting for microphone access…';
    try{
      const incoming=await env.navigator.mediaDevices.getUserMedia({audio:true});
      if(disposed||attempt!==request){stopTracks(incoming);return;}
      stream=incoming;const take=new env.MediaRecorder(stream),chunks=[];recorder=take;
      take.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      take.onstop=()=>{
        release();if(disposed)return;
        record.disabled=false;record.textContent='Record again';recorder=null;
        if(!chunks.length){feedback.textContent='No audio was captured. Try again when you’re ready.';return;}
        clip=env.URL.createObjectURL(new Blob(chunks,{type:take.mimeType||chunks[0].type}));
        player.src=clip;player.hidden=false;updateCompare();feedback.textContent='Your reply is ready to play.';
      };
      take.onerror=()=>{release();if(!disposed){feedback.textContent='Recording stopped. You can try again.';record.disabled=false;}};
      take.start();record.disabled=false;record.textContent='Stop recording';
      feedback.textContent='Recording your reply. It stops after 15 seconds.';
      timer=env.setTimeout(stop,15000);
    }catch(error){
      if(disposed||attempt!==request)return;release();recorder=null;record.disabled=false;record.textContent='Try recording again';
      feedback.textContent=error.name==='NotAllowedError'?'Microphone access is off. Say your reply aloud and continue, or allow access in your browser.':'A microphone wasn’t available. You can still hear the example and continue.';
    }
  };
  return {onModel,allowModel(text){model=text;updateCompare();},dispose(){
    disposed=true;request++;record.onclick=null;compare.onclick=null;stop();clearClip();
  }};
}
