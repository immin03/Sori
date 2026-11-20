// Interim transcripts are hypotheses. Rebuild the matching range from the latest one, including retractions.
const chars = text => Array.from(text.normalize('NFC').replace(/[^\p{Letter}\p{Number}]/gu,''));
function commonLength(a,b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}
export function spokenRange(question, transcript) {
  const heard = chars(transcript), before = chars(question.before), word = chars(question.word), after = chars(question.after);
  const full = commonLength(heard,[...before,...word,...after]);
  const gap = commonLength(heard,[...word,...after]);
  const reached = full >= gap ? full : before.length + gap;
  return {
    before:full >= gap ? Math.min(full,before.length) : 0,
    word:Math.max(0, Math.min(word.length,reached - before.length)),
    after:Math.max(0, reached - before.length - word.length)
  };
}
function cutoff(text, n) {
  if (!n) return 0;
  let seen = 0, end = 0;
  for (const c of text) {
    end += c.length;
    if (chars(c).length && ++seen === n) break;
  }
  return end;
}
function paintRange(node, text, count, conceal) {
  if (node.dataset.heard === String(count)) return;
  node.dataset.heard = String(count);
  const doc = node.ownerDocument;
  if (!doc?.createTextNode) return;
  const end = cutoff(text,count);
  node.replaceChildren();
  if (end) {
    const mark = doc.createElement('mark');
    mark.className = 'vocab-spoken'; mark.textContent = text.slice(0,end);
    node.appendChild(mark);
  }
  if (!conceal) node.appendChild(doc.createTextNode(text.slice(end)));
  else if (!count) {
    const label = doc.createElement('span'); label.className = 'sr-only'; label.lang = 'en'; label.textContent = 'blank';
    node.appendChild(label);
  }
}
export function paintSpokenQuestion(nodes, question, transcript) {
  const range = spokenRange(question,transcript);
  paintRange(nodes.before,question.before,range.before,false);
  paintRange(nodes.blank,question.word,range.word,true);
  paintRange(nodes.after,question.after,range.after,false);
}
export function paintTranscript(node, text) {
  if (!node) return;
  const doc = node.ownerDocument;
  if (!doc?.createTextNode) { node.textContent = text; return; }
  const letters = Array.from(text.normalize('NFC'));
  const common = commonLength(Array.from(node.children,el => el.textContent), letters);
  while (node.childElementCount > common) node.lastElementChild.remove();
  for (const letter of letters.slice(common)) {
    const span = doc.createElement('span');
    span.textContent = letter; node.appendChild(span);
  }
}
