const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = name => fs.readFileSync(path.join(__dirname,'..',name),'utf8');

test('all eight section links and deep links select the correct service and menu item', () => {
  const window = {};
  vm.runInNewContext(source('js/sections.js'), {window,URLSearchParams});
  const {services,locate} = window.SoriSections;
  const tree = Array.from(services,group => [group.title,Array.from(group.children,c=>c[1])]);
  assert.deepEqual(tree,[['Speak',['Vocabulary','Conversations','Review']],
    ['Korea 101',['Stories','Saved stories','Newsletter']],['Explore',['Trip planner','My itineraries']]]);
  for(const group of services) for(const [id,,hash] of group.children) {
    assert.deepEqual(Array.from(locate(hash)).slice(0,2),[group.id,id]);
  }
  for(const [hash,section,view,round] of [
    ['#practice=vocabulary&view=round','vocabulary','listen','topic'],
    ['#practice=vocabulary&view=round','review','listen','review'],
    ['#practice=vocabulary&view=words','review','listen'],
    ['#practice=market','conversations','listen'],['#practice=daily','conversations','listen'],
    ['#practice=review','review','listen'],['#phrase=existing-id&from=review','review','listen'],
    ['#phrases','conversations','listen'],['#saved-phrases','review','home'],['#quiz','review','quiz'],
    ['#story=story-id','stories','newsletter'],['#story=story-id&from=saved','bookmarks','newsletter'],['#subscribe=token','newsletter','newsletter'],
    ['#day=plan','itineraries','guide'],['#trip=trip-id','itineraries','guide'],['#invite=token','itineraries','guide']
  ]) assert.deepEqual(Array.from(locate(hash,round)).slice(1),[section,view]);
});

test('a partner cue opens one microphone only after audible completion on the current visible turn',async()=>{
  const {cueHandoff} = await import('../js/learning/spoken-turn.js');
  let visible=true,opened=0;
  const requests=[], states=[];
  const flow=cueHandoff({
    speak:playing=>new Promise((end,fail)=>requests.push({playing,end,fail})),cancel(){},stopVoice(){},
    listen(){opened++;},visible:()=>visible,show:state=>states.push(state)
  });
  let run=flow.play(); requests.at(-1).end(); await run;
  assert.equal(opened,0);
  run=flow.play(); let request=requests.at(-1);request.playing();assert.equal(opened,0);
  request.end();await run;assert.equal(opened,1);
  run=flow.play();request=requests.at(-1);request.playing();flow.stop();request.end();await run;
  assert.equal(opened,1);
  const old=flow.play(), stale=requests.at(-1);
  run=flow.play();request=requests.at(-1);stale.playing();stale.end();await old;
  request.playing();visible=false;request.end();await run;assert.equal(opened,1);
  visible=true;run=flow.play();requests.at(-1).fail(Error('audio unavailable'));await run;
  assert.equal(states.at(-1),'error');assert.equal(opened,1);
});

test('the listening quiz accepts each English option and its spoken number without guessing unknown speech',async()=>{
  const {optionNames,spokenOption} = await import('../js/learning/quiz-choice.js');
  const answers=['Good night.','See you tomorrow.','One please.','Two people.'];
  answers.forEach((answer,i)=>{
    assert.equal(spokenOption(answer.toUpperCase(),answers),i);
    for(const name of optionNames(i))assert.equal(spokenOption(name,answers),i);
  });
  assert.equal(spokenOption('the third one',answers),2);
  assert.equal(spokenOption('a completely different phrase',answers),-1);
  assert.equal(spokenOption('',answers),-1);
});

test('every partner cue and sample reply has a bundled playable MPEG and matches its real scene text',async()=>{
  const {scenes}=await import('../js/learning/scenes.js');
  const tts=source('js/tts.js');
  const recordings=new Map(JSON.parse(tts.match(/const recordings = new Map\((\[[\s\S]*?\])\);/)[1]));
  for(const [name,scene] of Object.entries(scenes))scene.turns.forEach((turn,i)=>{
    assert.equal(recordings.get(turn[0]),name+'-cue-'+(i+1));assert.equal(recordings.get(turn[3]),name+'-reply-'+(i+1));
  });
  const dir=path.join(__dirname,'..','assets/audio/speaking');
  assert.deepEqual(fs.readdirSync(dir).sort(),Array.from(recordings.values(),name=>name+'.mp3').sort());
  for(const file of fs.readdirSync(dir)){
    const clip=fs.readFileSync(path.join(dir,file));
    assert.ok(clip.length>1000 && (clip.subarray(0,3).toString()==='ID3'||clip[0]===255));
  }
});
