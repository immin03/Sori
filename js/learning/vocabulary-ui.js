import {attachVoiceReply, recorderControls} from './voice-reply.js?v=20261121vocab';
import {checkWords} from './word-check.js?v=20261121vocab';

function prompt(question) {
  return `<p class="vocab-meaning">${question.meaning}</p>
    <p class="vocab-sentence" lang="ko">${question.before}<span class="vocab-blank" data-blank><span class="sr-only" lang="en">blank</span></span>${question.after}</p>`;
}

export function vocabularyCard(daily) {
  const {words, index} = daily.today();
  const complete = index === words.length;
  return `<article class="vocab-card"><header><h2>Today’s vocabulary</h2><span>${complete ? 'Complete' : `Word ${index + 1} of ${words.length}`}</span></header>
    ${complete ? '<p class="vocab-meaning">You’ve practised today’s three words.</p>' : prompt(words[index]) + '<p class="vocab-instruction">Say the missing Korean word or the whole sentence.</p>'}
    <button type="button" class="sori-primary" data-open-vocabulary>${complete ? 'Review today’s words' : 'Speak my answer'}</button></article>`;
}

export function mountVocabulary(target, daily, env, {start = false, onProgress} = {}) {
  let voice;
  const get = selector => target.querySelector(selector);
  const back = '<button type="button" class="text-button" data-pause-session>‹ Speak</button>';
  function render(mode = 'ready') {
    voice?.dispose(); voice = null;
    env.SORI?.TTS?.cancel();
    const {words, index, day} = daily.today();
    if (index === words.length) {
      target.innerHTML = `<header class="session-header">${back}</header><section class="vocab-finish">
        <h1 tabindex="-1">Today’s vocabulary complete.</h1><ul>${words.map(q => `<li><strong lang="ko">${q.word}</strong><span>${q.meaning}</span></li>`).join('')}</ul>
        <button type="button" class="sori-secondary" data-vocab-replay>Practise again</button></section>`;
      get('[data-vocab-replay]').onclick = () => { daily.setIndex(0, day); onProgress?.(); render('ready'); };
      target.querySelector('h1').focus?.({preventScroll:true});
      return;
    }
    const question = words[index];
    target.innerHTML = `<header class="session-header">${back}<span>Word ${index + 1} of ${words.length}</span></header>
      <progress max="${words.length}" value="${index + 1}" aria-label="Current word"></progress>
      <section class="vocab-exercise"><h1 tabindex="-1">Today’s vocabulary</h1>
        <div class="vocab-prompt">${prompt(question)}</div>
        <p class="vocab-instruction">Say the missing word or the whole sentence in Korean.</p>
        ${recorderControls({exercise:true})}
        <form class="vocab-type" data-type-form hidden><label for="vocabAnswer">Your answer in Korean</label>
          <div><input id="vocabAnswer" lang="ko" autocomplete="off" required><button type="submit" class="sori-secondary">Check answer</button></div>
          <p role="status" data-typed-result></p></form>
        <div class="vocab-options"><button type="button" class="text-button" data-switch-input>Type instead</button>
          <button type="button" class="text-button" data-reveal-word>Show answer</button></div>
        <div class="vocab-next" data-after-answer hidden><button type="button" class="sori-primary" data-next-word>${index + 1 === words.length ? 'Finish practice' : 'Next word'} →</button>
          <button type="button" class="text-button" data-hear-word>Hear the answer</button></div>
      </section>`;
    const blank = get('[data-blank]'), mic = get('.vocab-mic'), recordButton = get('[data-record-reply]');
    const form = get('[data-type-form]'), input = get('#vocabAnswer'), typedResult = get('[data-typed-result]');
    const switchButton = get('[data-switch-input]'), reveal = get('[data-reveal-word]'), after = get('[data-after-answer]');
    let continueMode = mode;
    function reset() {
      blank.innerHTML = '<span class="sr-only" lang="en">blank</span>';
      delete blank.dataset.result; delete get('[data-hear-word]').dataset.audio; reveal.hidden = false; after.hidden = true;
      switchButton.hidden = false; typedResult.textContent = '';
    }
    function result(kind) {
      if (!['correct','retry','reveal'].includes(kind)) return;
      blank.textContent = question.word; blank.dataset.result = kind;
      get('[data-hear-word]').dataset.audio = question.sentence;
      reveal.hidden = true; after.hidden = false;
      if (kind === 'correct') { recordButton.hidden = true; form.querySelector('button').hidden = true; switchButton.hidden = true; }
      if (kind === 'retry') recordButton.textContent = 'Try speaking again';
    }
    switchButton.onclick = () => render(mode === 'type' ? 'voice' : 'type');
    reveal.onclick = () => { voice?.onModel(); result('reveal'); get('[data-next-word]').focus(); };
    get('[data-next-word]').onclick = () => {
      daily.setIndex(index + 1, day); onProgress?.(); render(continueMode);
    };
    if (mode === 'type') {
      mic.hidden = true; form.hidden = false; switchButton.textContent = 'Speak instead';
      get('.vocab-instruction').hidden = true;
      input.focus({preventScroll:true});
      input.oninput = () => { reset(); form.querySelector('button').hidden = false; };
      form.onsubmit = event => {
        event.preventDefault();
        if (!input.value.trim()) { input.focus(); return; }
        const verdict = checkWords(question.sentence, input.value, question.accepted);
        typedResult.textContent = verdict.kind === 'correct' ? 'Correct!' : 'Not quite. Try the highlighted word.';
        result(verdict.kind);
        if (verdict.kind === 'correct') get('[data-next-word]').focus({preventScroll:true});
      };
    } else {
      voice = attachVoiceReply(mic, env, question.sentence, question.accepted, result, {
        exercise:true, onBegin() { continueMode = 'voice'; reset(); }
      });
      target.querySelector('h1').focus({preventScroll:true});
      if (mode === 'voice') voice.start();
    }
  }
  render(start ? 'voice' : 'ready');
  return {onModel() { voice?.onModel(); }, dispose() { voice?.dispose(); }};
}
