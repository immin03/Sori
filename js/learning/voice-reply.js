import {paintTranscript} from './speech-highlight.js?v=20261121nav';
import {checkOnDevice, supportsDeviceCheck} from './device-words.js?v=20261120s1';
import {checkWords, listenForWords, playChime, prepareChime, speechService} from './word-check.js?v=20261123relaunch';

export function recorderControls({exercise = false} = {}) {
  return `<div class="reply-recorder${exercise ? ' vocab-mic' : ''}">
    <button class="sori-primary record-action" data-record-reply type="button">Record my reply</button>
    <p role="status" aria-live="polite" aria-atomic="true"></p>
    <p class="vocab-heard" lang="ko" aria-hidden="true" data-interim></p>
    <div class="check-result" data-check-result hidden></div>
    <audio controls hidden aria-label="Play your recorded reply"></audio>
    <button class="text-button" data-compare-reply hidden type="button">Hear the example, then my reply</button>
    <button class="text-button" data-cancel-check hidden type="button">Cancel word check</button>
    <div class="voice-settings">
      <label data-check-setting hidden><input type="checkbox" data-auto-check checked>Check my words</label>
      <label data-sound-setting hidden><input type="checkbox" data-check-sound checked>Feedback sound</label>
    </div>
    <div class="device-choice" data-device-choice hidden><button class="sori-secondary" data-device-check type="button">Enable on-device checking</button><small data-device-note></small></div>
    ${exercise?'<details class="voice-info"><summary>Voice info</summary><small data-mic-note></small></details>':'<small data-mic-note>Up to 15 seconds. Your recording is discarded when you leave the exercise.</small>'}
  </div>`;
}

function preference(env, name, value, defaultOn = true) {
  try {
    const key = 'sori:voice:' + name;
    if (value === undefined) {
      const saved = env.localStorage?.getItem(key);
      return saved == null ? defaultOn : saved === 'on';
    }
    env.localStorage?.setItem(key, value ? 'on' : 'off');
  } catch {}
  return defaultOn;
}
let browserUnavailable = false;

// Finish hands-free after speech and a short pause; the stop button is always available.
function watchForPause(env, stream, finish) {
  const Audio = env.AudioContext || env.webkitAudioContext;
  if (!Audio || !env.setInterval || !stream) return;
  let context, timer, source;
  const close = () => {
    env.clearInterval(timer);
    try { source?.disconnect(); context?.close().catch(() => {}); } catch {}
  };
  try {
    context = new Audio();
    context.resume().catch(() => {});
    source = context.createMediaStreamSource(stream);
    const meter = context.createAnalyser(); meter.fftSize = 1024; source.connect(meter);
    const frame = new Float32Array(meter.fftSize);
    let voiced = 0, quiet = 0;
    timer = env.setInterval(() => {
      meter.getFloatTimeDomainData(frame);
      let energy = 0;
      for (const sample of frame) energy += sample * sample;
      if (Math.sqrt(energy / frame.length) > .008) { voiced++; quiet = 0; }
      else if (voiced >= 3 && ++quiet >= 15) finish();
    },80);
    return close;
  } catch { close(); }
}

export function attachVoiceReply(container, env = window, example = '', alternatives = [], onVerdict = () => {}, {exercise = false, onBegin, onTranscript, language = 'ko-KR', choice = false, fullSentence = false} = {}) {
  const get = selector => container.querySelector(selector);
  const record = get('[data-record-reply]'), player = get('audio'), compare = get('[data-compare-reply]');
  const status = get('[role=status]'), result = get('[data-check-result]');
  const check = get('[data-auto-check]'), sound = get('[data-check-sound]'), note = get('[data-mic-note]');
  const canRecord = Boolean(env.navigator.mediaDevices?.getUserMedia && env.MediaRecorder);
  const canCheck = Boolean((exercise || canRecord) && speechService(env));
  const deviceButton = get('[data-device-check]'), cancelButton = get('[data-cancel-check]');
  const canUseDevice = language === 'ko-KR' && canRecord && supportsDeviceCheck(env);
  let deviceMode = canUseDevice && preference(env,'device',undefined,false);
  let model = example, clip = null, lastBlob = null, active = null, version = 0, disposed = false;
  let microphoneBlocked = false;
  const interim = get('[data-interim]');
  if (interim) interim.lang = language;
  function updateTranscript(text) { paintTranscript(interim,text); onTranscript?.(text); }
  const canSpeak = () => exercise ? Boolean(canCheck || deviceMode) : canRecord;

  function updateSettings() {
    const enabled = (canCheck || deviceMode) && Boolean(model);
    const offerDevice = canUseDevice && model && !microphoneBlocked && (deviceMode || !canCheck || browserUnavailable);
    get('[data-device-choice]').hidden = !offerDevice || Boolean(active);
    cancelButton.hidden = !active?.controller;
    if (offerDevice) {
      deviceButton.textContent = deviceMode ? (canCheck ? 'Use browser checking' : 'Turn off device checking') :
        (clip ? 'Check this recording on device' : 'Enable on-device checking');
      get('[data-device-note]').textContent = deviceMode ? '' : 'Optional download, about 70 MB the first time. Your voice stays on this device.';
    }
    get('[data-check-setting]').hidden = !enabled;
    get('[data-sound-setting]').hidden = !enabled || !check.checked;
    check.disabled = sound.disabled = Boolean(active);
    if (!active) {
      record.disabled = !canSpeak();
      record.textContent = exercise ? 'Speak' : enabled && check.checked ? (clip ? 'Try speaking again' : 'Speak & check') : (clip ? 'Record again' : 'Record my reply');
    }
    note.textContent = (deviceMode && check.checked || active?.controller) ? 'Words are checked on this device. Up to 15 seconds.' : enabled && check.checked ? 'Your browser’s Korean speech service may process audio online. Up to 15 seconds.' :
      (enabled ? 'Record and listen on this device. Up to 15 seconds.' : 'Automatic word checking is unavailable here. You can record and compare your reply.');
    compare.hidden = !clip || !model;
    if (exercise) {
      compare.hidden = true;
      note.textContent = deviceMode ? 'Speech is checked on this device.' : canCheck ? 'Your browser’s speech service may process audio online.' : '';
    }
  }
  check.checked = exercise || preference(env, 'check');
  sound.checked = preference(env, 'sound');
  check.onchange = () => { preference(env, 'check', check.checked); updateSettings(); };
  sound.onchange = () => preference(env, 'sound', sound.checked);
  function hideResult() {
    result.hidden = true;
    result.replaceChildren?.();
    updateTranscript('');
  }
  function showResult(kind, heard, focus) {
    if (!result.ownerDocument) return;
    const doc = result.ownerDocument;
    result.className = 'check-result ' + kind;
    result.replaceChildren();
    const add = (tag, text, korean = false) => {
      const el = doc.createElement(tag);
      if (korean) el.lang = language;
      el.textContent = text;
      result.appendChild(el);
    };
    if (heard) { add('small', 'Sori heard'); add('strong', heard, true); }
    if (!exercise && kind === 'retry' && focus) { add('small', 'Listen again for'); add('strong', focus, true); }
    result.hidden = !result.childElementCount;
  }
  function release(stream) { stream?.getTracks().forEach(track => track.stop()); }
  function clearClip() {
    player.pause(); player.removeAttribute('src'); player.hidden = true;
    if (clip) { env.URL.revokeObjectURL(clip); clip = null; }
    lastBlob = null;
    compare.hidden = true;
  }
  function settle(take) {
    if (take !== active || !take.recorded || (take.checking && !take.verdict)) return;
    env.clearTimeout(take.waitTimer);
    take.listener?.cancel();
    active = null;
    const verdict = take.verdict;
    if (verdict) {
      const messages = {
        correct:'That’s right! Your reply works.',
        retry:'Try that once more. Compare what Sori heard with the example.',
        unclear:'Couldn’t hear that clearly. Try speaking again.',
        unavailable: take.method === 'device' ? 'The device check could not finish. You can listen to this take or try checking it again.' :
          (canUseDevice ? 'The browser couldn’t check your words. You can check this recording on your device.' : 'Word checking is unavailable right now. Listen to your recording and the example.')
      };
      if (exercise) {
        messages.correct = 'Correct!';
        messages.retry = choice ? 'Try another option.' : 'Try again.';
        messages.unclear = 'Couldn’t hear that clearly. Try again.';
        messages.unavailable = take.reason === 'not-allowed'
          ? 'Microphone access is off. Allow access or type your answer.'
          : canUseDevice ? 'Voice checking is unavailable right now. Try on-device checking or type your answer.' : 'Voice checking is unavailable right now. You can type your answer.';
      }
      if (choice && verdict.kind === 'unavailable') messages.unavailable = 'Voice checking is unavailable here. Tap an option to answer.';
      paintTranscript(interim,'');
      onTranscript?.(take.heard || '');
      status.textContent = messages[verdict.kind];
      showResult(verdict.kind, take.heard, verdict.focus);
      if (sound.checked && ['correct','retry'].includes(verdict.kind)) playChime(verdict.kind);
    } else {
      status.textContent = clip ? 'Your reply is ready to play.' : 'No audio was captured. Try again when you’re ready.';
    }
    updateSettings();
    if (verdict) onVerdict(verdict.kind, take.heard);
  }
  function stop(take) {
    if (!take || take !== active || take.stopping) return;
    take.stopping = true;
    take.stopWatching?.();
    env.clearTimeout(take.limit);
    record.disabled = true;
    if (take.method === 'browser' && !take.verdict) {
      status.textContent = 'Checking your words…';
      take.waitTimer = env.setTimeout(() => {
        if (active !== take || take.verdict) return;
        take.verdict = {kind:'unavailable'}; settle(take);
      }, 4500);
      take.listener?.stop();
    }
    if (take.recorder?.state === 'recording') take.recorder.stop();
    release(take.stream); take.stream = null;
  }
  function cancelTake() {
    version++;
    const take = active;
    if (!take) return;
    active = null;
    take.controller?.abort(); take.stopWatching?.();
    env.clearTimeout(take.limit); env.clearTimeout(take.waitTimer);
    take.listener?.cancel();
    if (take.recorder?.state === 'recording') take.recorder.stop();
    release(take.stream); take.stream = null;
    status.textContent = '';
    updateTranscript('');
    updateSettings();
  }
  function onModel() { player.pause(); cancelTake(); }
  const interruptExamples = () => { env.dispatchEvent?.(new Event('sori-own-audio')); env.SORI?.TTS?.cancel(); };
  player.addEventListener('play', interruptExamples);
  compare.onclick = async () => {
    onModel(); interruptExamples();
    const current = version;
    compare.disabled = true;
    try {
      await env.SORI.TTS.speak(model, {rate:1});
      if (!disposed && current === version) await player.play();
    } catch (error) {
      if (!disposed && current === version && error.name !== 'AbortError') status.textContent = 'Use the audio controls to play each recording.';
    } finally { if (!disposed) compare.disabled = false; }
  };
  updateSettings();
  if (exercise && !canSpeak()) {
    status.textContent = canUseDevice ? 'Enable on-device checking to use your voice, or type your answer.' : 'Voice checking is unavailable in this browser. You can type your answer.';
    if (choice) status.textContent='You can tap an option to answer.';
  } else if (!canRecord && !exercise) {
    record.disabled = true; note.textContent = '';
    status.textContent = 'Recording is unavailable in this browser. You can still hear the example and practise aloud.';
  }
  async function deviceCheck(take, blob) {
    take.controller = new AbortController();
    record.disabled = true;
    updateSettings();
    status.textContent = blob ? 'Checking your words on this device…' : 'Preparing the speech model…';
    try {
      const text = await checkOnDevice(env,blob,take.controller.signal,message => {
        if (take === active) status.textContent = message;
      });
      if (take !== active) return;
      if (text || !blob) { deviceMode = true; preference(env,'device',true); }
      if (blob) {
        take.verdict = checkWords(model,text,alternatives); take.heard = text;
        settle(take);
      } else {
        active = null; record.disabled = false;
        status.textContent = 'Device checking is ready. Say your reply when you’re ready.'; updateSettings();
        if (exercise) record.onclick();
      }
    } catch {
      if (take !== active) return;
      deviceMode = false; preference(env,'device',false); browserUnavailable = true;
      if (blob) { take.verdict = {kind:'unavailable'}; settle(take); }
      else { active = null; status.textContent = exercise ? 'The speech model could not load. Try again or type your answer.' : 'The speech model could not load. You can try again or record your reply.'; updateSettings(); }
    }
  }
  deviceButton.onclick = () => {
    if (active || !canUseDevice) return;
    if (deviceMode) { deviceMode = false; preference(env,'device',false); updateSettings(); return; }
    check.checked = true; preference(env,'check',true);
    if (sound.checked) prepareChime(env);
    version++; interruptExamples(); player.pause(); hideResult();
    const take = {method:'device',checking:true,recorded:Boolean(clip),stopping:true};
    active = take; deviceCheck(take,lastBlob);
  };
  cancelButton.onclick = () => {
    if (!active?.controller) return;
    cancelTake(); status.textContent = clip ? 'Check cancelled. Your recording is ready to play.' : 'Device check cancelled.';
  };
  function startBrowserCheck(take, track) {
    const verdict = (value, heard = '', reason) => {
      if (take !== active || take.verdict) return;
      take.verdict = value; take.heard = heard; take.reason = reason;
      if (value.kind === 'unavailable') {
        microphoneBlocked = reason === 'not-allowed';
        if (!microphoneBlocked) browserUnavailable = true;
        if (!exercise && !take.stopping) take.stopWatching = watchForPause(env,take.stream,() => stop(take));
      }
      if (exercise || value.kind !== 'unavailable') stop(take);
      else if (!take.stopping) status.textContent = 'Word checking is unavailable. Finish recording to compare your reply.';
      settle(take);
    };
    try {
      take.listener = listenForWords(env, track,
        (text, confidence) => verdict(checkWords(model, text, alternatives, confidence), text),
        reason => verdict({kind:reason === 'no-speech' ? 'unclear' : 'unavailable'}, '', reason),
        {
          language,
          onStart() { if (exercise && take === active && !take.stopping) status.textContent = 'Listening…'; },
          onInterim(text) { if (take === active) updateTranscript(text); },
          onSpeechEnd() { if (exercise) stop(take); }
        });
    } catch (error) { verdict({kind:'unavailable'}, '', error.name === 'NotAllowedError' ? 'not-allowed' : error.name); }
  }
  record.onclick = async () => {
    if (active) { if (active.recorder || active.listener) stop(active); return; }
    if (!canSpeak() || disposed) return;
    microphoneBlocked = false;
    version++; clearClip(); hideResult(); interruptExamples();
    onBegin?.();
    const method = check.checked && model ? (deviceMode ? 'device' : canCheck ? 'browser' : null) : null;
    const take = {method,checking:Boolean(method), chunks:[]};
    active = take;
    if (take.checking && sound.checked) prepareChime(env);
    updateSettings();
    record.disabled = true; status.textContent = 'Waiting for microphone access…';
    if (exercise && method === 'browser') {
      // The recognizer opens its own microphone. A vocabulary answer needs no clip or second permission.
      take.recorded = true;
      record.disabled = false; record.textContent = 'Stop listening';
      take.limit = env.setTimeout(() => stop(take), 15000);
      startBrowserCheck(take);
      return;
    }
    try {
      const stream = await env.navigator.mediaDevices.getUserMedia({audio:true});
      if (active !== take) { release(stream); return; }
      take.stream = stream;
      const recorder = new env.MediaRecorder(stream);
      take.recorder = recorder;
      recorder.ondataavailable = event => { if (event.data.size) take.chunks.push(event.data); };
      recorder.onstop = () => {
        if (take !== active) return;
        if (take.chunks.length) {
          lastBlob = new Blob(take.chunks, {type:recorder.mimeType || take.chunks[0].type});
          clip = env.URL.createObjectURL(lastBlob);
          player.src = clip; player.hidden = exercise;
        }
        take.recorded = true;
        if (take.method === 'device' && lastBlob) deviceCheck(take,lastBlob);
        else {
          if (take.method === 'device') take.verdict = {kind:'unclear'};
          settle(take);
        }
      };
      recorder.onerror = () => { if (active === take) { cancelTake(); status.textContent = 'Recording stopped. You can try again.'; } };
      recorder.start();
      record.disabled = false; record.textContent = 'Stop recording';
      status.textContent = take.method === 'device' ? 'Listening. Pause when you finish, or tap Stop recording.' :
        take.checking ? 'Listening. Say the Korean reply.' : 'Recording your reply. It stops after 15 seconds.';
      take.limit = env.setTimeout(() => stop(take), 15000);
      if (take.method === 'device') take.stopWatching = watchForPause(env,stream,() => stop(take));
      if (take.method === 'browser') startBrowserCheck(take,stream.getAudioTracks?.()[0]);
    } catch (error) {
      if (active !== take) return;
      cancelTake();
      status.textContent = exercise ? (error.name === 'NotAllowedError' ? 'Microphone access is off. Allow it in your browser or type your answer.' : 'No microphone is available. You can type your answer.') :
        error.name === 'NotAllowedError' ? 'Microphone access is off. Say your reply aloud and continue, or allow access in your browser.' : 'A microphone wasn’t available. You can still hear the example and continue.';
    }
  };
  return {onModel, start() { if (!active && !record.disabled) return record.onclick?.(); }, allowModel(text) { model = text; updateSettings(); }, dispose() {
    disposed = true; cancelTake(); clearClip();
    record.onclick = compare.onclick = deviceButton.onclick = cancelButton.onclick = check.onchange = sound.onchange = null;
  }};
}
