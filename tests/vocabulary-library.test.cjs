const {test} = require('node:test');
const assert = require('node:assert/strict');

async function fixture() {
  const {DailyVocabulary} = await import('../js/learning/vocabulary.js');
  const raw = new Map(), storage = {getItem:k => raw.get(k), setItem:(k,v) => raw.set(k,v)};
  let now = new Date(2026,10,21,13);
  return {raw,make:(user = null) => new DailyVocabulary(storage,user,() => now),
    nextDay() { now = new Date(now); now.setDate(now.getDate() + 1); }};
}

test('every topic covers all three levels and every word has two distinct, answerable contexts',async () => {
  const {topics, levels, wordIndex, vocabulary, allQuestions, sameTopicChoices} = await import('../js/learning/vocabulary.js');
  const {checkWords} = await import('../js/learning/word-check.js');
  assert.equal(topics.length,8); assert.equal(vocabulary.length,64); assert.equal(allQuestions.length,128);
  assert.equal(new Set(vocabulary.map(q => q.term)).size,64);
  for (const t of topics) {
    const subset = vocabulary.filter(q => q.topic === t.id);
    assert.equal(subset.length,8);
    assert.deepEqual(new Set(subset.map(q => q.level)),new Set(Object.keys(levels)));
  }
  for (const [first,second] of wordIndex.values()) {
    assert.notEqual(first.sentence,second.sentence); assert.notEqual(first.meaning,second.meaning);
    for (const q of [first,second]) {
      assert.equal(checkWords(q.sentence,q.word,q.accepted).kind,'correct');
      const choices = sameTopicChoices(q,57);
      assert.equal(new Set(choices).size,3); assert.ok(choices.includes(q.word));
    }
  }
});

test('a difficulty applies to the day and topics, survives reload and restores each in-progress daily set',async () => {
  const f = await fixture(), d = f.make(), mixed = d.today();
  assert.equal(new Set(mixed.words.map(q=>q.topic)).size,3);
  assert.equal(new Set(mixed.words.map(q=>q.level)).size,3);
  d.record(mixed.token,0,'correct'); d.advance(mixed.token,0);
  d.setDifficulty('nuance');
  const advanced = d.today();
  assert.ok(advanced.words.every(q => q.level === 'nuance')); assert.equal(advanced.index,0);
  d.record(advanced.token,0,'reveal'); d.advance(advanced.token,0);
  assert.equal(f.make().difficulty(),'nuance');
  assert.equal(f.make('another-user').difficulty(),'all');
  d.setDifficulty('all'); assert.equal(d.today().index,1); assert.equal(d.today().token,mixed.token);
  d.setDifficulty('nuance'); assert.equal(d.today().index,1); assert.equal(d.today().token,advanced.token);
  assert.ok(d.startTopic('feelings',d.difficulty()).words.every(q => q.level === 'nuance'));
  const selection = d.today().words; f.nextDay(); assert.equal(d.today().index,0); assert.notDeepEqual(d.today().words,selection);
});

test('review uses only practised words, prioritises mistakes and varies the context and response',async () => {
  const f = await fixture(), d = f.make();
  assert.equal(d.startReview(),null);
  const a = d.startTopic('feelings','nuance','read-room');
  d.record(a.token,0,'unavailable'); assert.deepEqual(d.shelf(),[]);
  d.record(a.token,0,'retry'); d.record(a.token,0,'correct');
  assert.equal(d.isTricky('read-room'),true); assert.equal(d.entry('read-room').count,1);
  const food = d.startTopic('food','essentials','some-water'); d.record(food.token,0,'correct');
  d.advance(a.token,0); assert.equal(d.custom().index,0);
  assert.equal(d.shelf().length,2); assert.equal(f.make('b').shelf().length,0);
  d.setDifficulty('nuance'); const review = d.startReview();
  assert.deepEqual(review.words.map(q=>q.id),['read-room']);
  assert.notEqual(review.words[0].sentence,a.words[0].sentence); assert.equal(review.slots[0].format,'choice');
  const resumed = f.make(); assert.deepEqual(resumed.custom(),review);
  resumed.record(review.token,0,'correct'); resumed.advance(review.token,0); resumed.advance(review.token,0);
  assert.equal(resumed.custom().index,1); assert.equal(resumed.startReview('tricky'),null);
  assert.equal(resumed.entry('read-room').due,resumed.day()+1);
  f.nextDay(); const second = resumed.startReview();
  assert.equal(second.slots[0].format,'cloze'); assert.equal(second.words[0].sentence,a.words[0].sentence);
  resumed.record(second.token,0,'correct'); assert.equal(resumed.entry('read-room').due,resumed.day()+3);
});

test('a legacy learner gets only previously completed words in the shelf and no invented correct answers',async () => {
  const f = await fixture(), day = Date.UTC(2026,10,21)/86400000;
  f.raw.set('sori:vocabulary:v1:device',JSON.stringify({anchor:day-1,day,index:2}));
  const d = f.make();
  assert.deepEqual(d.today().words.map(q=>q.id),['receipt','umbrella','reservation']);
  assert.equal(d.today().index,2); assert.deepEqual(new Set(d.shelf().map(q=>q.id)),new Set(['receipt','umbrella']));
  assert.equal(d.entry('receipt').stage,0); assert.equal(d.isTricky('receipt'),false);
});

test('speech highlights only recognised syllables and follows revisions, word-only replies and decomposed Hangul',async () => {
  const {spokenRange} = await import('../js/learning/speech-highlight.js');
  const {wordIndex} = await import('../js/learning/vocabulary.js');
  const [q] = wordIndex.get('read-room');
  for (const [heard,b,w,a] of [
    ['',0,0,0],['제 친',2,0,0],['제 친구는 눈',4,1,0],['제 친구는 눈치가',4,2,1],
    ['제 친구는',4,0,0],['눈',0,1,0],['눈치'.normalize('NFD'),0,2,0],['다른 단어',0,0,0]
  ]) assert.deepEqual(spokenRange(q,heard),{before:b,word:w,after:a},heard);
});
