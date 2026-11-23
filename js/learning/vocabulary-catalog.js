import {topicBank} from './vocabulary-bank.js?v=20261123beta';

export const levels = {essentials:'Beginner', intermediate:'Intermediate', nuance:'Advanced'};
export const topics = topicBank.map(({id,title,description}) => ({id,title,description}));
export const legacyOrder = ['new-clothes','some-water','subway-station','receipt','umbrella','reservation','menu','window-seat','exit','charger','tickets','pharmacy','open-window','last-train','photo'];

function question(meta, row, alternate) {
  const [meaning, frame, ...aliases] = row;
  const [,before,word,after] = frame.match(/^(.*?)\[([^\]]+)\](.*)$/u);
  // A learner may include the particle or ending immediately following the gap.
  const attached = after.match(/^[가-힣]+/u)?.[0] || '';
  const accepted = [...new Set([word, meta.term, word + attached, ...aliases])];
  return {...meta, audioId:meta.id + (alternate ? '-again' : ''), meaning, before, word, after,
    sentence:before + word + after, accepted, alternate};
}

export const wordIndex = new Map();
for (const topic of topicBank) {
  for (const [id,level,term,gloss,first,second] of topic.entries) {
    const meta = {id,topic:topic.id,level,term,gloss,questionAudio:topic.questionAudio || 'bundled'};
    wordIndex.set(id, [question(meta,first,false), question(meta,second,true)]);
  }
}
export const vocabulary = [...new Set([...legacyOrder, ...wordIndex.keys()])].map(id => wordIndex.get(id)[0]);
export const allQuestions = [...wordIndex.values()].flat();
