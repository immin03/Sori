// Compare the Korean the browser heard with this turn's model or an authored reply.
const counters = {1:'한', 2:'두', 3:'세', 4:'네'};
export function normalizeWords(value) {
  return String(value || '').normalize('NFKC').toLowerCase()
    .replace(/(?<!\d)([1-4])\s*(잔|명|분|개|병|장|봉지)/gu, (_, n, unit) => counters[n] + unit)
    .replace(/[^\p{Letter}\p{Number}]/gu, '');
}

export function checkWords(model, transcript, alternatives = [], confidence) {
  const heard = normalizeWords(transcript);
  if (!heard || (confidence > 0 && confidence < 0.45)) return {kind:'unclear'};
  if ([model, ...alternatives].some(line => normalizeWords(line) === heard)) return {kind:'correct'};
  const words = model.split(/\s+/).map(part => part.replace(/[.,?!…]/g, '')).filter(Boolean);
  let offset = 0;
  for (const word of words) {
    const chunk = normalizeWords(word);
    const found = heard.indexOf(chunk, offset);
    if (found < 0) return {kind:'retry', focus:word};
    offset = found + chunk.length;
  }
  return {kind:'retry'};
}

export function speechService(env) {
  return env.SpeechRecognition || env.webkitSpeechRecognition;
}

// A user can stop the recorder before the browser returns its final transcript.
export function listenForWords(env, track, onResult, onUnavailable, {onInterim, onStart, onSpeechEnd} = {}) {
  const Recognition = speechService(env);
  const reader = new Recognition();
  reader.lang = 'ko-KR';
  reader.continuous = false;
  reader.interimResults = Boolean(onInterim);
  reader.maxAlternatives = 1;
  let ended = false;
  function finish(callback) {
    if (ended) return;
    ended = true;
    reader.onresult = reader.onerror = reader.onend = reader.onstart = reader.onspeechend = null;
    callback();
  }
  reader.onresult = event => {
    if (ended) return;
    const rows = Array.from(event.results).filter(row => row[0]);
    if (!rows.length) return;
    const text = rows.map(row => row[0].transcript.trim()).join(' ');
    if (rows.every(row => row.isFinal)) finish(() => onResult(text, rows.at(-1)[0].confidence));
    else onInterim?.(text);
  };
  reader.onstart = () => { if (!ended) onStart?.(); };
  reader.onspeechend = () => { if (!ended) onSpeechEnd?.(); };
  reader.onerror = event => finish(() => onUnavailable(event.error));
  reader.onend = () => finish(() => onUnavailable('no-speech'));
  try {
    if (track) reader.start(track);
    else reader.start();
  } catch (error) {
    if (!track || !['TypeError','NotSupportedError'].includes(error.name)) throw error;
    reader.start();
  }
  return {
    stop() { if (!ended) { try { reader.stop(); } catch { finish(() => onUnavailable('no-speech')); } } },
    cancel() {
      ended = true;
      reader.onresult = reader.onerror = reader.onend = reader.onstart = reader.onspeechend = null;
      try { reader.abort(); } catch {}
    }
  };
}

let audioContext;
export function prepareChime(env) {
  const Audio = env.AudioContext || env.webkitAudioContext;
  if (!Audio) return;
  try {
    audioContext ||= new Audio();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  } catch {}
}

export function playChime(kind) {
  if (!audioContext || audioContext.state !== 'running') return;
  const pitches = kind === 'correct' ? [523.25, 783.99] : [392, 329.63];
  pitches.forEach((hz, i) => {
    const start = audioContext.currentTime + i * .115;
    const note = audioContext.createOscillator();
    const volume = audioContext.createGain();
    note.frequency.value = hz;
    volume.gain.setValueAtTime(.001, start);
    volume.gain.exponentialRampToValueAtTime(.07, start + .018);
    volume.gain.exponentialRampToValueAtTime(.001, start + .17);
    note.connect(volume).connect(audioContext.destination);
    note.start(start);
    note.stop(start + .18);
  });
}
