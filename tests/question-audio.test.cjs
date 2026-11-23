const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function playbackFixture() {
  const timers = new Map();
  const env = {setTimeout(fn) { timers.set(fn, fn); return fn; }, clearTimeout(id) { timers.delete(id); }};
  const media = {ended:false, currentTime:3, pause() {}, play() { this.ended = false; return Promise.resolve(); }};
  return {env, media, timers, states:[]};
}

test('legacy questions retain all their recordings and live questions share a gap sound', async () => {
  const {vocabulary,allQuestions} = await import('../js/learning/vocabulary.js');
  const {vocabularyCard} = await import('../js/learning/vocabulary-ui.js');
  const folder = path.resolve(__dirname, '../assets/audio/questions');
  const bundled = allQuestions.filter(q => q.questionAudio === 'bundled');
  assert.equal(bundled.length,128);
  assert.equal(allQuestions.filter(q => q.questionAudio === 'synthesized').length,320);
  assert.ok(fs.readFileSync(path.join(folder,'../vocab-gap.wav')).subarray(0,4).equals(Buffer.from('RIFF')));
  const names = bundled.map(q => q.audioId + '.mp3');
  assert.equal(new Set(names).size, bundled.length);
  assert.deepEqual(fs.readdirSync(folder).sort(), names.slice().sort());
  for (const name of names) {
    const clip = fs.readFileSync(path.join(folder, name));
    assert.ok(clip.length > 1000);
    assert.ok(clip.subarray(0,3).toString() === 'ID3' || clip[0] === 255);
  }
  const card = vocabularyCard({today:() => ({words:vocabulary.slice(0,3), index:0})});
  assert.match(card, /Start lesson/);
  assert.doesNotMatch(card, /vocab-sentence/);
  assert.doesNotMatch(card, /옷/);
});

test('the microphone handoff follows audible completion, never a play request or a stale end event', async () => {
  const {attachQuestionAudio} = await import('../js/learning/question-audio.js');
  const {env, media, timers, states} = playbackFixture();
  const cue = attachQuestionAudio(media, state => states.push(state), env);
  let starts = 0;
  cue.play(() => { starts++; });
  assert.equal(media.currentTime, 0);
  assert.deepEqual(states, ['loading']);
  media.onplaying(); assert.equal(starts, 0);
  const oldEnd = media.onended;
  cue.stop();
  cue.play(() => { starts++; });
  media.onplaying(); media.ended = true;
  oldEnd(); assert.equal(starts, 0);
  const end = media.onended; end(); end();
  assert.equal(starts, 1);
  assert.equal(cue.playing, false); assert.equal(timers.size, 0);
  cue.play(); media.onplaying(); media.ended = true; media.onended();
  assert.equal(starts, 1); // Listening to a prompt without opting into speaking.
});

test('autoplay denial, unavailable audio, pending playback and leaving a question keep the mic closed', async () => {
  const {attachQuestionAudio} = await import('../js/learning/question-audio.js');
  const {env, media, timers, states} = playbackFixture();
  const cue = attachQuestionAudio(media, state => states.push(state), env);
  let starts = 0, fail;
  const listen = () => { starts++; };
  media.play = () => new Promise((_,reject) => { fail = reject; });
  cue.play(listen);
  fail(Object.assign(Error(), {name:'NotAllowedError'}));
  await Promise.resolve();
  assert.equal(states.at(-1), 'blocked');
  cue.play(listen); const oldFail = fail;
  cue.play(listen);
  oldFail(Error()); await Promise.resolve(); assert.ok(cue.playing);
  media.onerror(); assert.equal(states.at(-1), 'error');
  cue.play(listen); [...timers.values()][0](); assert.equal(states.at(-1), 'error');
  cue.play(listen); const latePlaying = media.onplaying, lateEnd = media.onended;
  cue.stop(); latePlaying(); media.ended = true; lateEnd();
  assert.equal(states.at(-1), 'idle'); assert.equal(starts, 0); assert.equal(timers.size, 0);
});

test('live cloze questions speak around the gap and only open the mic after the final audio ends', async () => {
  const {attachSynthesizedQuestion} = await import('../js/learning/question-audio.js');
  const {env, media, states} = playbackFixture();
  const phrases = [], pending = [];
  const tts = {cancel() {}, speak(text, options) {
    phrases.push(text); options.onPlaying();
    return new Promise(resolve => pending.push(resolve));
  }};
  const question = {before:'오늘 ', after:' 먹어요.'};
  const cue = attachSynthesizedQuestion(question, media, tts, state => states.push(state), env);
  let starts = 0;
  const first = cue.play(() => starts++);
  assert.deepEqual(phrases, ['오늘']);
  pending.shift()(); await first;
  media.onplaying(); media.ended = true; media.onended();
  assert.deepEqual(phrases, ['오늘', '먹어요.']); assert.equal(starts,0);
  pending.shift()(); await new Promise(resolve=>setImmediate(resolve));
  assert.equal(starts,1); assert.equal(states.at(-1),'ended');
  const cancelled = cue.play(() => starts++);
  cue.stop(); pending.shift()(); await cancelled;
  assert.equal(starts,1); assert.equal(states.at(-1),'idle');
  const blocked = cue.play(() => starts++);
  pending.shift()(); await blocked;
  media.onerror(); assert.equal(starts,1); assert.equal(states.at(-1),'error');
});
