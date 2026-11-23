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

// New questions reuse the Korean voice and one short recording for the gap.
export function attachSynthesizedQuestion(question, player, tts, onState, timers = window) {
  let active = null;
  const gap = attachQuestionAudio(player, state => {
    if (!active) return;
    if (state === 'playing') onState('playing');
    if (state === 'error' || state === 'blocked') finish(active, state);
  }, timers);

  function finish(run, state) {
    if (active !== run) return;
    active = null;
    onState(state);
    if (state === 'ended') run.afterEnd?.();
  }
  function stop() {
    if (!active) return;
    const run = active;
    finish(run, 'idle');
    gap.stop();
    tts?.cancel();
  }
  async function say(run, part) {
    if (!/[\p{L}\p{N}]/u.test(part)) return;
    await tts.speak(part.trim(), {rate:0.85, onPlaying() {
      if (active === run) onState('playing');
    }});
  }
  function failed(run, error) {
    finish(run, error?.name === 'NotAllowedError' ? 'blocked' : 'error');
  }
  async function play(afterEnd) {
    stop();
    const run = {afterEnd};
    active = run;
    onState('loading');
    try {
      await say(run, question.before);
      if (active !== run) return;
      gap.play(async () => {
        if (active !== run) return;
        try {
          await say(run, question.after);
          finish(run, 'ended');
        } catch (error) { failed(run, error); }
      });
    } catch (error) { failed(run, error); }
  }
  return {play, stop, get playing() { return Boolean(active); }};
}
