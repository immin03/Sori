const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const model = '아메리카노 한 잔, 주세요.';
const tick = () => new Promise(resolve => setImmediate(resolve));
const index = vm.createContext({window:{},console:{log(){}}});
for (const file of ['daily','travel','drama','trendy','numbers','dataindex']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../data',file + '.js'),'utf8'),index);
}
const rows = Object.values(index.window.SoriDataIndex).flat();

test('Korean word checking accepts spacing, punctuation and counters without losing quantity or negation',async () => {
  const {checkWords} = await import('../js/learning/word-check.js');
  for (const text of ['아메리카노 한잔 주세요!','아메리카노 1잔 주세요','아메리카노 한 잔 부탁드려요']) {
    assert.equal(checkWords(model,text,['아메리카노 한 잔 부탁드려요.'],.95).kind,'correct');
  }
  assert.deepEqual(checkWords(model,'아메리카노 두 잔 주세요'),{kind:'retry',focus:'한'});
  for (const text of ['아메리카노 11잔 주세요','아메리카노 한 잔 안 주세요','주세요 아메리카노 한 잔']) {
    assert.equal(checkWords(model,text).kind,'retry');
  }
  assert.equal(checkWords(model,'').kind,'unclear');
  assert.equal(checkWords(model,model,[],.2).kind,'unclear');
  assert.equal(checkWords(model,model,[],0).kind,'correct'); // Browsers may omit confidence.
});

test('each partner prompt has a reading and each authored alternative fits its lesson',async () => {
  const {scenes} = await import('../js/learning/scenes.js');
  const {checkWords} = await import('../js/learning/word-check.js');
  for (const scene of Object.values(scenes)) for (const turn of scene.turns) {
    const [prompt,meaning,intent,reply,hint,reading,equivalents] = turn;
    assert.ok(prompt && meaning && intent && hint);
    assert.match(reading,/^[a-z0-9?.,! ]+$/);
    assert.ok(rows.find(p => p.k === reply)?.p);
    for (const other of equivalents) assert.equal(checkWords(reply,other,equivalents).kind,'correct');
  }
});

test('phrasebook searches Korean, English, romanization, topics and the complete collection',async () => {
  const {findExpressions} = await import('../js/learning/phrase-search.js');
  assert.equal(findExpressions(rows,'').length,358);
  assert.equal(findExpressions(rows,'')[0].k,'안녕하세요.');
  for (const query of ['AMERICANO','아메리카노한잔','amerikano han jan','café']) {
    assert.ok(findExpressions(rows,query).some(p => p.k === model),query);
  }
  assert.ok(findExpressions(rows,'','Greeting').every(p => p.sub === 'Greeting'));
  assert.deepEqual(findExpressions(rows,'없는단어zzz'),[]);
});

test('missed turns survive a pause and can be retried as a dedicated review',async () => {
  const {PracticeProgress} = await import('../js/learning/progress.js');
  const data = new Map();
  const options = {storage:{getItem:k => data.get(k),setItem:(k,v) => data.set(k,v)},ids:['a','b','c']};
  const p = new PracticeProgress(options);
  p.start(['a','b','c'],{kind:'cafe'}); p.markMissed(); p.markMissed(); p.answer('again');
  const resumed = new PracticeProgress(options);
  assert.deepEqual(resumed.active().missed,['a']);
  resumed.answer('remembered'); resumed.answer('remembered');
  assert.deepEqual(resumed.start(resumed.data.session.missed,{kind:'review',fresh:true}).ids,['a']);
  assert.deepEqual(resumed.data.session.missed,undefined);
});

function fixture({supported = true} = {}) {
  const nodes = new Map(), prefs = new Map(), readers = [], verdicts = [], timers = new Map();
  let ended = 0, revoked = 0, timerId = 0;
  const query = key => {
    if (!nodes.has(key)) nodes.set(key,{
      textContent:'',children:[],addEventListener(){},pause(){},removeAttribute(){},replaceChildren(){this.children=[];},
      appendChild(node){this.children.push(node);},get childElementCount(){return this.children.length;},
      ownerDocument:{createElement(){return {};}}
    });
    return nodes.get(key);
  };
  const track = {stop(){ended++;}};
  class Recorder {
    constructor(){this.state='inactive';}
    start(){this.state='recording';}
    stop(){this.state='inactive';queueMicrotask(() => {this.ondataavailable({data:new Blob(['recorded'])});this.onstop();});}
  }
  class Reader {
    constructor(){readers.push(this);}
    start(t){this.track=t;}
    stop(){this.stopped=true;}
    abort(){this.aborted=true;}
    final(text,confidence=.95){this.onresult?.({resultIndex:0,results:[{0:{transcript:text,confidence},isFinal:true}]});}
  }
  const env = {navigator:{mediaDevices:{getUserMedia:async () => ({getTracks:() => [track], getAudioTracks:() => [track]})}},
    MediaRecorder:Recorder,SpeechRecognition:supported ? Reader : undefined,
    localStorage:{getItem:k=>prefs.get(k),setItem:(k,v)=>prefs.set(k,v)},
    setTimeout(fn,ms){timers.set(++timerId,{fn,ms});return timerId;},clearTimeout:id=>timers.delete(id),
    URL:{createObjectURL:() => 'blob:test',revokeObjectURL(){revoked++;}}};
  return {container:{querySelector:query},env,query,readers,track,verdicts,timers,prefs,counts:()=>({ended,revoked})};
}

test('one take yields a transcript, a visual result and a playable clip after recording stops',async () => {
  const {attachVoiceReply} = await import('../js/learning/voice-reply.js');
  const f = fixture(), voice = attachVoiceReply(f.container,f.env,model,[],v=>f.verdicts.push(v));
  const button = f.query('[data-record-reply]'), status = f.query('[role=status]');
  assert.equal(button.textContent,'Speak & check');
  await button.onclick();
  assert.equal(f.readers[0].track,f.track);
  assert.equal(f.readers[0].lang,'ko-KR');
  f.readers[0].final('아메리카노 1잔 주세요');
  await tick();
  assert.match(status.textContent,/right/); assert.deepEqual(f.verdicts,['correct']);
  assert.equal(f.query('audio').src,'blob:test');
  assert.ok(f.query('[data-check-result]').children.some(c=>c.textContent==='아메리카노 1잔 주세요'));
  await button.onclick();
  f.readers[1].final('아메리카노 두 잔 주세요');
  await tick();
  assert.deepEqual(f.verdicts,['correct','retry']);
  assert.ok(f.query('[data-check-result]').children.some(c=>c.textContent==='한'));
  assert.equal(f.counts().ended,2);
  voice.dispose(); assert.equal(f.counts().revoked,2);
});

test('a delayed final result is accepted after tapping stop and rejected after leaving the turn',async () => {
  const {attachVoiceReply} = await import('../js/learning/voice-reply.js');
  const f = fixture(), voice = attachVoiceReply(f.container,f.env,model,[],v=>f.verdicts.push(v));
  const button = f.query('[data-record-reply]');
  await button.onclick(); await button.onclick(); await tick();
  assert.ok(button.disabled); assert.ok(f.readers[0].stopped);
  f.readers[0].final(model); assert.deepEqual(f.verdicts,['correct']);
  await button.onclick(); const stale = f.readers[1].onresult;
  voice.dispose(); stale({resultIndex:0,results:[{isFinal:true,0:{transcript:model,confidence:1}}]});
  await tick(); assert.deepEqual(f.verdicts,['correct']); assert.ok(f.query('audio').hidden);
});

test('silence, service failures and an absent speech service keep practice available',async () => {
  const {attachVoiceReply} = await import('../js/learning/voice-reply.js');
  const f = fixture(), voice = attachVoiceReply(f.container,f.env,model,[],v=>f.verdicts.push(v));
  const button = f.query('[data-record-reply]');
  await button.onclick(); f.readers[0].onerror({error:'no-speech'}); await tick();
  assert.deepEqual(f.verdicts,['unclear']);
  await button.onclick(); f.readers[1].onerror({error:'network'});
  assert.equal(button.textContent,'Stop recording'); await button.onclick(); await tick();
  assert.deepEqual(f.verdicts,['unclear','unavailable']); assert.equal(f.query('audio').src,'blob:test');
  const sound=f.query('[data-check-sound]');sound.checked=false;sound.onchange();
  assert.equal(f.prefs.get('sori:voice:sound'),'off');
  const opt=f.query('[data-auto-check]');opt.checked=false;opt.onchange();
  await button.onclick(); await button.onclick(); await tick(); assert.equal(f.readers.length,2);
  voice.dispose();
  const fallback = fixture({supported:false}); attachVoiceReply(fallback.container,fallback.env,model);
  assert.equal(fallback.query('[data-record-reply]').textContent,'Record my reply');
  assert.equal(fallback.query('[data-check-setting]').hidden,true);
});

test('on-device checking keeps silence ungraded and cancels unfinished model loading',async () => {
  const {checkOnDevice,containsSpeech,supportsDeviceCheck} = await import('../js/learning/device-words.js');
  const quiet = new Float32Array(16000), speaking = new Float32Array(16000).fill(.10);
  assert.equal(containsSpeech(quiet),false);
  assert.equal(containsSpeech(speaking),true);
  const jobs = [];
  class Worker {
    constructor(url,options){assert.match(url.pathname,/speech-worker.js/);assert.equal(options.type,'module');jobs.push(this);}
    postMessage(message){this.message=message;}
    terminate(){this.terminated=true;}
  }
  class OfflineAudioContext {
    async decodeAudioData(){return {length:quiet.length,numberOfChannels:1,getChannelData:()=>quiet};}
  }
  const env={Worker,WebAssembly,OfflineAudioContext}, controller = new AbortController();
  assert.equal(supportsDeviceCheck(env),true);
  assert.equal(await checkOnDevice(env,new Blob(['silence']),controller.signal,()=>{}),'');
  assert.equal(jobs.length,0);
  const loading=checkOnDevice(env,null,controller.signal,()=>{});
  controller.abort();
  await assert.rejects(loading,{name:'AbortError'});
  assert.equal(jobs[0].terminated,true);
});
