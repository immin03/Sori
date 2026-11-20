import {attachVoiceReply, recorderControls} from './voice-reply.js?v=20261121vocab';
import {attachQuestionAudio} from './question-audio.js?v=20261121q1';
import {checkWords} from './word-check.js?v=20261121vocab';

function prompt(question) {
  return `<p class="vocab-meaning">${question.meaning}</p>
    <p class="vocab-sentence" lang="ko">${question.before}<span class="vocab-blank" data-blank><span class="sr-only" lang="en">blank</span></span>${question.after}</p>`;
}

export function vocabularyCard(daily) {
  const {words, index} = daily.today();
  const complete = index === words.length;
  return `<article class="vocab-card"><header><h2>Today’s vocabulary</h2><span>${complete ? 'Complete' : `Word ${index + 1} of ${words.length}`}</span></header>
    ${complete ? '<p class="vocab-meaning">You’ve practised today’s three words.</p>' : prompt(words[index]) + '<p class="vocab-instruction">Listen, then say the missing Korean word or the whole sentence.</p>'}
    <button type="button" class="sori-primary" data-open-vocabulary>${complete ? 'Review today’s words' : 'Listen &amp; answer'}</button></article>`;
}

export function mountVocabulary(target, daily, env, {start = false, onProgress} = {}) {
  let voice, cue;
  function interrupt() { cue?.stop(); voice?.onModel(); }
  const get = selector => target.querySelector(selector);
  const back = '<button type="button" class="text-button" data-pause-session>‹ Speak</button>';
  function render(mode = 'ready', playOnOpen = true) {
    cue?.stop(); cue = null; voice?.dispose(); voice = null;
    env.SORI?.TTS?.cancel();
    const {words, index, day} = daily.today();
    if (index === words.length) {
      target.innerHTML = `<header class="session-header">${back}</header><section class="vocab-finish">
        <h1 tabindex="-1">Today’s vocabulary complete.</h1><ul>${words.map(q => `<li><strong lang="ko">${q.word}</strong><span>${q.meaning}</span></li>`).join('')}</ul>
        <button type="button" class="sori-secondary" data-vocab-replay>Practise again</button></section>`;
      get('[data-vocab-replay]').onclick = () => { daily.setIndex(0, day); onProgress?.(); render('voice'); };
      target.querySelector('h1').focus?.({preventScroll:true});
      return;
    }
    const question = words[index];
    target.innerHTML = `<header class="session-header">${back}<span>Word ${index + 1} of ${words.length}</span></header>
      <progress max="${words.length}" value="${index + 1}" aria-label="Current word"></progress>
      <section class="vocab-exercise"><h1 tabindex="-1">Today’s vocabulary</h1>
        <div class="vocab-prompt">${prompt(question)}
          <div class="vocab-audio-row">
            <button type="button" class="sori-primary vocab-audio-toggle" data-hear-question>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4 5.5 8.5H2.8v7h2.7L11 20zM15 8.4a5 5 0 0 1 0 7.2M18 5a9.6 9.6 0 0 1 0 14"/></svg>
              <span data-question-label>Listen &amp; answer</span></button>
            <span class="cue-status" role="status" data-question-status></span>
          </div>
          <audio hidden playsinline preload="metadata" data-question-player src="${new URL('../../assets/audio/questions/' + question.audioId + '.mp3', import.meta.url).href}"></audio>
        </div>
        <p class="vocab-instruction">The chime marks the missing word. After the question, say the word or the whole sentence in Korean.</p>
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
    const cueButton = get('[data-hear-question]'), cueLabel = get('[data-question-label]'), cueStatus = get('[data-question-status]');
    let continueMode = mode, heardQuestion = false;
    const typing = mode === 'type';
    function showPlayback(state) {
      const playing = state === 'playing' || state === 'loading';
      if (state === 'playing' || state === 'ended') heardQuestion = true;
      const firstListen = !heardQuestion && !typing && after.hidden;
      cueLabel.textContent = playing ? 'Stop question' : firstListen ? 'Listen & answer' : heardQuestion ? 'Replay question' : 'Hear question';
      cueButton.className = 'vocab-audio-toggle ' + (firstListen && !playing ? 'sori-primary' : 'sori-secondary');
      cueButton.setAttribute('aria-busy', String(state === 'loading'));
      const messages = {loading:'Loading question…', playing:'Playing question…', error:'Audio couldn’t play. Tap to retry.', blocked:'Tap to hear the question.'};
      cueStatus.textContent = messages[state] || '';
      mic.hidden = typing || playing || (firstListen && state !== 'error');
    }
    cue = attachQuestionAudio(get('[data-question-player]'), showPlayback, env);
    function hearQuestion(thenSpeak) {
      voice?.onModel(); env.SORI?.TTS?.cancel();
      cue.play(thenSpeak ? () => { if (!env.document?.hidden) voice?.start(); } : undefined);
    }
    cueButton.onclick = () => {
      if (cue.playing) cue.stop();
      else hearQuestion(!typing && after.hidden && (!heardQuestion || continueMode === 'voice'));
    };
    showPlayback('idle');
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
    switchButton.onclick = () => render(typing ? 'voice' : 'type', typing);
    reveal.onclick = () => { interrupt(); result('reveal'); showPlayback('idle'); get('[data-next-word]').focus(); };
    get('[data-next-word]').onclick = () => {
      daily.setIndex(index + 1, day); onProgress?.(); render(continueMode);
    };
    if (typing) {
      mic.hidden = true; form.hidden = false; switchButton.textContent = 'Speak instead';
      get('.vocab-instruction').hidden = true;
      input.focus({preventScroll:true});
      input.oninput = () => { reset(); form.querySelector('button').hidden = false; };
      form.onsubmit = event => {
        event.preventDefault();
        if (!input.value.trim()) { input.focus(); return; }
        cue.stop();
        const verdict = checkWords(question.sentence, input.value, question.accepted);
        typedResult.textContent = verdict.kind === 'correct' ? 'Correct!' : 'Not quite. Try the highlighted word.';
        result(verdict.kind);
        if (verdict.kind === 'correct') get('[data-next-word]').focus({preventScroll:true});
      };
    } else {
      voice = attachVoiceReply(mic, env, question.sentence, question.accepted, result, {
        exercise:true, onBegin() { cue.stop(); heardQuestion = true; continueMode = 'voice'; reset(); }
      });
      target.querySelector('h1').focus({preventScroll:true});
    }
    if (playOnOpen) hearQuestion(mode === 'voice');
  }
  render(start ? 'voice' : 'ready');
  return {onModel:interrupt, dispose() { cue?.stop(); voice?.dispose(); }};
}
