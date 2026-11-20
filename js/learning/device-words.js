// The optional speech model loads only after the learner enables device checking.
export function supportsDeviceCheck(env) {
  return Boolean(env.Worker && env.WebAssembly && (env.OfflineAudioContext || env.webkitOfflineAudioContext));
}

export function containsSpeech(samples) {
  let audibleFrames = 0;
  for (let offset = 0; offset < samples.length; offset += 320) {
    const end = Math.min(samples.length, offset + 320);
    let energy = 0;
    for (let n = offset; n < end; n++) energy += samples[n] * samples[n];
    if (Math.sqrt(energy / (end - offset)) > .003 && ++audibleFrames >= 4) return true;
  }
  return false;
}

let worker = null, active = null, idleTimer = null, sequence = 0;
function releaseWorker() {
  clearTimeout(idleTimer); worker?.terminate(); worker = null;
}
function aborted() { return new DOMException('Device check cancelled','AbortError'); }
function send(env, samples, signal, progress) {
  if (signal.aborted) return Promise.reject(aborted());
  active?.cancel();
  clearTimeout(idleTimer);
  worker ||= new env.Worker(new URL('./speech-worker.js?v=20261120s1',import.meta.url),{type:'module'});
  return new Promise((resolve,reject) => {
    const id = ++sequence;
    const cancel = () => finish(aborted());
    const timer = setTimeout(() => finish(new Error('The speech model timed out.')), 180000);
    function finish(error, text) {
      if (active?.id !== id) return;
      clearTimeout(timer); signal.removeEventListener('abort',cancel); active = null;
      if (error) { releaseWorker(); reject(error); }
      else { idleTimer = setTimeout(releaseWorker,90000); resolve(text); }
    }
    active = {id,cancel};
    signal.addEventListener('abort',cancel,{once:true});
    worker.onerror = () => finish(new Error('The device speech service could not start.'));
    worker.onmessage = ({data}) => {
      if (data.id !== id) return;
      if (data.stage) progress(data.stage);
      else if (data.error) finish(new Error('The device could not check this recording.'));
      else finish(null,data.text);
    };
    try { worker.postMessage({id,samples}, samples ? [samples.buffer] : []); } catch (error) { finish(error); }
  });
}

export async function checkOnDevice(env, blob, signal, progress) {
  let samples;
  if (blob) {
    const Offline = env.OfflineAudioContext || env.webkitOfflineAudioContext;
    const context = new Offline(1,1,16000);
    const buffer = await context.decodeAudioData(await blob.arrayBuffer());
    if (signal.aborted) throw aborted();
    const length = Math.min(buffer.length,16 * 16000);
    samples = new Float32Array(length);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const channel = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) samples[i] += channel[i] / buffer.numberOfChannels;
    }
    if (!containsSpeech(samples)) return '';
  }
  return send(env,samples,signal,progress);
}
