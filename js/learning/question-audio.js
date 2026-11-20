// A microphone handoff belongs to the playback that actually reached its end.
export function attachQuestionAudio(audio, onState, timers = window) {
  let active = null;
  function finish(run, state) {
    if (active !== run) return;
    active = null;
    timers.clearTimeout(run.timer);
    audio.onplaying = audio.onended = audio.onerror = null;
    if (state !== 'ended') audio.pause();
    onState(state);
    if (state === 'ended' && run.played) run.afterEnd?.();
  }
  function stop() {
    if (active) finish(active, 'idle');
  }
  function play(afterEnd) {
    stop();
    const run = {played:false, afterEnd};
    active = run;
    onState('loading');
    run.timer = timers.setTimeout(() => finish(run, 'error'), 15000);
    audio.onplaying = () => {
      if (active === run) { run.played = true; onState('playing'); }
    };
    audio.onended = () => { if (audio.ended) finish(run, 'ended'); };
    audio.onerror = () => finish(run, 'error');
    const failed = error => finish(run, error?.name === 'NotAllowedError' ? 'blocked' : 'error');
    try {
      audio.currentTime = 0;
      Promise.resolve(audio.play()).catch(failed);
    } catch (error) { failed(error); }
  }
  return {play, stop, get playing() { return Boolean(active); }};
}
