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
// Align complete syllables so one substitution does not hide the rest of the reply.
export function syllableFeedback(model, transcript, final = false) {
  const expected = chars(model), heard = chars(transcript).slice(0, 256);
  const distances = Array.from({length:expected.length + 1}, (_,i) =>
    Array.from({length:heard.length + 1}, (_,j) => i ? (j ? 0 : i) : j));
  for (let i=1; i<=expected.length; i++) for (let j=1; j<=heard.length; j++) {
    distances[i][j] = Math.min(distances[i-1][j]+1, distances[i][j-1]+1,
      distances[i-1][j-1] + Number(expected[i-1] !== heard[j-1]));
  }
  let i=expected.length, j=heard.length;
  if (!final) {
    i=0;
    for (let end=1; end<=expected.length; end++)
      if (distances[end][j] < distances[i][j] || (distances[end][j] === distances[i][j] && end<=j)) i=end;
  }
  const result=expected.map(()=>'pending');
  while(i || j) {
    if(i && j && distances[i][j]===distances[i-1][j-1]+Number(expected[i-1]!==heard[j-1])) {
      result[i-1]=expected[i-1]===heard[j-1]?'match':'miss';i--;j--;
    } else if(i && distances[i][j]===distances[i-1][j]+1) { result[i-1]='miss';i--; }
    else j--;
  }
  return result;
}
export function paintSpokenLine(node, model, transcript, verdict = '') {
  if (!node?.ownerDocument?.createTextNode) return;
  const states=syllableFeedback(model,transcript,verdict==='retry'||verdict==='correct');
  const doc=node.ownerDocument, fragment=doc.createDocumentFragment();
  let index=0;
  for (const ch of model.normalize('NFC')) {
    if(!chars(ch).length) { fragment.append(doc.createTextNode(ch));continue; }
    const span=doc.createElement('span');span.textContent=ch;
    span.className='syllable-'+(verdict==='correct'?'match':states[index]);index++;fragment.append(span);
  }
  node.setAttribute('aria-label',model);node.replaceChildren(fragment);
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
