import {levels, topics, legacyOrder, vocabulary, wordIndex} from './vocabulary-catalog.js?v=20261123beta';
export {levels, topics, vocabulary, wordIndex, allQuestions} from './vocabulary-catalog.js?v=20261123beta';

const intervals = [1, 3, 7, 14, 30];
function localDay(time) {
  const d = new Date(time);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000;
}
function score(seed, id) {
  let value = seed >>> 0;
  for (const ch of id) value = Math.imul(value ^ ch.charCodeAt(0), 16777619);
  value ^= value >>> 16;
  return Math.imul(value, 2246822507) >>> 0;
}
function slot(id, alternate = false, format = 'cloze') { return {id, alternate, format}; }
function validRound(round) {
  return round && Number.isInteger(round.index) && Array.isArray(round.slots) && round.slots.length &&
    round.index >= 0 && round.index <= round.slots.length && round.slots.every(s => s && wordIndex.has(s.id));
}
function expand(round) {
  return {...round, words:round.slots.map(s => wordIndex.get(s.id)[s.alternate ? 1 : 0])};
}
export function sameTopicChoices(question, seed) {
  const other = vocabulary.filter(q => q.topic === question.topic && q.id !== question.id && q.word !== question.word);
  other.sort((a,b) => score(seed,a.id) - score(seed,b.id));
  const options = [...new Set(other.map(q => q.word))].slice(0,2).concat(question.word);
  return options.sort((a,b) => score(seed + 73,a) - score(seed + 73,b));
}

export class DailyVocabulary {
  constructor(storage, user, clock = Date.now) {
    this.storage = storage;
    this.clock = clock;
    const suffix = user || 'device';
    this.key = 'sori:vocabulary:v2:' + suffix;
    this.state = {history:{}, serial:0, difficulty:'all', dailySets:{}, daily:null, round:null};
    this.refresh();
    if (!this.state.daily) this.migrate(this.read('sori:vocabulary:v1:' + suffix));
    this.today();
  }
  read(key) {
    try { return JSON.parse(this.storage.getItem(key)); } catch { return null; }
  }
  refresh() {
    if (this.volatile) return;
    const saved = this.read(this.key);
    if (saved && typeof saved.history === 'object' && saved.history && Number.isSafeInteger(saved.serial)) this.state = saved;
  }
  save() {
    try { this.storage.setItem(this.key, JSON.stringify(this.state)); } catch { this.volatile = true; }
  }
  day() { return localDay(this.clock()); }
  migrate(old) {
    if (!old || !Number.isSafeInteger(old.anchor) || !Number.isSafeInteger(old.day) ||
        old.anchor < 0 || old.anchor > old.day || old.day > this.day() || !Number.isInteger(old.index) || old.index < 0 || old.index > 3) return;
    const start = (old.day - old.anchor) * 3;
    const slots = Array.from({length:3}, (_,i) => slot(legacyOrder[(start + i) % legacyOrder.length]));
    for (const s of slots.slice(0,old.index)) {
      this.state.history[s.id] = {count:1, stage:0, due:old.day, last:old.day, turn:0, result:'seen', alternate:false, reviews:0};
      s.result = 'seen';
    }
    this.state.daily = {kind:'daily',token:'d' + old.day, day:old.day, index:old.index,slots};
    this.save();
  }
  difficulty() { return Object.hasOwn(levels,this.state.difficulty) ? this.state.difficulty : 'all'; }
  setDifficulty(level) {
    if (level !== 'all' && !Object.hasOwn(levels,level)) return;
    this.refresh();
    if (level === this.difficulty()) return;
    const day = this.day();
    const previous = this.state.daily;
    this.state.dailySets ||= {};
    for (const [key, round] of Object.entries(this.state.dailySets)) {
      if (round.day !== day) delete this.state.dailySets[key];
    }
    if (validRound(previous) && previous.day === day) this.state.dailySets[this.difficulty()] = previous;
    this.state.difficulty = level;
    this.state.daily = this.state.dailySets[level] || null;
    delete this.state.dailySets[level];
    this.save();
    this.today();
  }
  today() {
    this.refresh();
    const day = this.day();
    if (!validRound(this.state.daily) || this.state.daily.day !== day) {
      const picked = new Set(), history = this.state.history;
      const difficulty = this.difficulty();
      const mix = difficulty === 'all' ? Object.keys(levels) : Array(3).fill(difficulty);
      const slots = mix.map((level,i) => {
        const pool = vocabulary.filter(q => q.level === level && !picked.has(q.topic));
        pool.sort((a,b) => (history[a.id]?.count || 0) - (history[b.id]?.count || 0) ||
          score(day + i,a.id) - score(day + i,b.id));
        const q = pool[0];
        picked.add(q.topic);
        return this.newSlot(q.id);
      });
      this.state.daily = {kind:'daily',token:'d' + day + '-' + difficulty,day,index:0,slots};
      this.save();
    }
    return expand(this.state.daily);
  }
  newSlot(id, format = 'cloze') {
    const past = this.state.history[id];
    return slot(id, past ? !past.alternate : false, format);
  }
  custom() {
    this.refresh();
    return validRound(this.state.round) ? expand(this.state.round) : null;
  }
  entry(id) { return this.state.history[id]; }
  shelf() {
    this.refresh();
    const day = this.day();
    const dueRank = h => h.due <= day ? (['retry','reveal'].includes(h.result) ? 0 : 1) : 2;
    return vocabulary.filter(q => this.entry(q.id)).sort((a,b) => {
      const x = this.entry(a.id), y = this.entry(b.id);
      return dueRank(x) - dueRank(y) || x.due - y.due || x.turn - y.turn || a.term.localeCompare(b.term,'ko');
    });
  }
  isTricky(id) { return ['retry','reveal'].includes(this.entry(id)?.result); }
  makeRound(kind, slots, options) {
    if (!slots.length) return null;
    const serial = ++this.state.serial;
    this.state.round = {kind, token:'r' + serial, day:this.day(), index:0, slots, ...options};
    this.save();
    return expand(this.state.round);
  }
  startTopic(topic, level = this.difficulty(), word) {
    this.refresh();
    const seed = this.day() + this.state.serial;
    let pool = vocabulary.filter(q => q.topic === topic && (level === 'all' || q.level === level));
    if (word) pool = pool.filter(q => q.id === word);
    pool.sort((a,b) => (this.entry(a.id)?.count || 0) - (this.entry(b.id)?.count || 0) ||
      score(seed,a.id) - score(seed,b.id));
    return this.makeRound('topic',pool.slice(0,4).map(q => this.newSlot(q.id)),{topic,level});
  }
  startReview(scope = 'all') {
    const words = this.shelf().filter(q => this.difficulty() === 'all' || q.level === this.difficulty())
      .filter(q => scope !== 'tricky' || this.isTricky(q.id)).slice(0,5);
    const slots = words.map((q,i) => this.newSlot(q.id, (i + this.entry(q.id).reviews) % 2 ? 'cloze' : 'choice'));
    return this.makeRound('review',slots,{scope,level:this.difficulty()});
  }
  active(token) {
    return [this.state.daily,this.state.round].find(r => validRound(r) && r.token === token &&
      (r.kind !== 'daily' || r.day === this.day()));
  }
  record(token, index, result) {
    if (!['correct','retry','reveal'].includes(result)) return;
    this.refresh();
    const round = this.active(token), s = round?.slots[index];
    if (!s || round.index !== index || s.result) return;
    const day = this.day(), past = this.entry(s.id);
    const correct = result === 'correct';
    const stage = correct ? Math.min(intervals.length, (past?.stage || 0) + (past?.stage && past.last === day ? 0 : 1)) : 0;
    this.state.history[s.id] = {
      count:(past?.count || 0) + 1, stage, due:day + (correct ? intervals[stage - 1] : 0), last:day,
      turn:++this.state.serial, result, alternate:s.alternate, reviews:(past?.reviews || 0) + (round.kind === 'review' ? 1 : 0)
    };
    s.result = result;
    this.save();
  }
  advance(token, index) {
    this.refresh();
    const round = this.active(token);
    if (round && round.index === index && round.slots[index]?.result) { round.index++; this.save(); }
  }
  setIndex(index, day) {
    if (this.today().day !== day || !Number.isInteger(index)) return;
    const round = this.state.daily;
    round.index = Math.max(0,Math.min(round.slots.length,index));
    if (round.index === 0) {
      round.token = 'd' + day + '-' + ++this.state.serial;
      round.slots.forEach(s => delete s.result);
    }
    this.save();
  }
}
