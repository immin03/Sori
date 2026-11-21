import {sameTopicChoices, levels} from './vocabulary.js?v=20261121library';
import {difficultyControl, topicTitle} from './vocabulary-library.js?v=20261121nav';
import {paintSpokenQuestion} from './speech-highlight.js?v=20261121nav';
import {attachVoiceReply, recorderControls} from './voice-reply.js?v=20261121focus';
import {attachQuestionAudio} from './question-audio.js?v=20261121q1';
import {checkWords} from './word-check.js?v=20261121nav';

function prompt(question) {
  return `<p class="vocab-sentence" lang="ko"><span data-vocab-before>${question.before}</span><span class="vocab-blank" data-blank><span class="sr-only" lang="en">blank</span></span><span data-vocab-after>${question.after}</span></p>
    <p class="vocab-meaning">${question.meaning}</p>`;
}

export function vocabularyCard(daily) {
  const {words, index} = daily.today();
  const complete = index === words.length;
  const level = daily.difficulty?.() || 'all';
  return `<article class="vocab-card daily-start"><div class="daily-symbol" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="8" y="9" width="32" height="30" rx="8"/><path d="M16 25h16M24 17v16M16 5v8M32 5v8"/></svg></div>
    <h2>Today’s vocabulary</h2><p>${index} / ${words.length} words</p>
    <progress max="${words.length}" value="${index}" aria-label="Today's progress"></progress>
    <button type="button" class="sori-primary" data-open-vocabulary>${complete ? 'Review today’s words' : index ? 'Continue' : 'Start lesson'}</button>
    </article><a class="section-row topic-entry" href="#practice=vocabulary&amp;view=topics"><strong>Vocabulary topics</strong><span aria-hidden="true">›</span></a>
    <details class="focus-settings"><summary>Level: ${level==='all'?'All levels':levels[level]}</summary>${difficultyControl(level)}</details>`;
}

export function mountVocabulary(target, daily, env, {start = false, onProgress, custom = false} = {}) {
  let voice, cue;
  function interrupt() { cue?.stop(); voice?.onModel(); }
  const get = selector => target.querySelector(selector);
  function render(mode = 'ready', playOnOpen = true) {
    cue?.stop(); cue = null; voice?.dispose(); voice = null;
    env.SORI?.TTS?.cancel();
    const round = custom ? daily.custom() : daily.today();
    if (!round) return;
    const {words,index,day,token} = round;
    const title = round.kind === 'daily' ? 'Today’s vocabulary' : round.kind === 'topic' ? topicTitle(round.topic) : round.scope === 'tricky' ? 'Tricky word review' : 'Mixed review';
    const parent = round.kind === 'review' ? ['My words','#practice=vocabulary&amp;view=words'] : round.kind === 'topic' ? [topicTitle(round.topic),'#practice=vocabulary&amp;view=topic&amp;topic='+round.topic] : ['Vocabulary','#home'];
    const header = `<header class="session-header"><a class="section-back focus-exit" href="${parent[1]}" aria-label="Exit to ${parent[0]}">×</a><span>${Math.min(index+1,words.length)} / ${words.length}</span></header>`;
    if (index === words.length) {
      target.innerHTML = `${header}<section class="vocab-finish">
        <h1 tabindex="-1">${round.kind === 'daily' ? 'Today’s vocabulary complete.' : title + ' complete.'}</h1>
        <ul>${words.map((q,i) => `<li><strong lang="ko">${q.term}</strong><span>${q.gloss}${['retry','reveal'].includes(round.slots[i].result) ? ' · Saved for another try' : ''}</span></li>`).join('')}</ul>
        <div class="vocab-hub-actions"><a class="sori-primary" href="#practice=vocabulary&amp;view=words">Open my words</a>
        ${round.kind === 'topic' ? `<button type="button" class="sori-secondary" data-vocab-start="${round.topic}" data-vocab-level="${round.level}">Another set</button>` :
          round.kind === 'review' ? '<button type="button" class="sori-secondary" data-vocab-review="all">Review another set</button>' :
          '<button type="button" class="sori-secondary" data-vocab-replay>Practise again</button>'}</div></section>`;
      if (round.kind === 'daily') get('[data-vocab-replay]').onclick = () => { daily.setIndex(0,day); onProgress?.(); render('voice'); };
      target.querySelector('h1').focus?.({preventScroll:true});
      return;
    }
    const question = words[index];
    const current = round.slots[index], choice = current.format === 'choice';
    const options = choice ? sameTopicChoices(question,day + index + token.length) : [];
    target.innerHTML = `${header}
      <progress max="${words.length}" value="${index + 1}" aria-label="Current word"></progress>
      <section class="vocab-exercise"><h1 tabindex="-1">Fill in the blank</h1>
        <div class="vocab-prompt">${prompt(question)}
          <div class="vocab-audio-row">
            <button type="button" class="sori-primary vocab-audio-toggle" data-hear-question>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4 5.5 8.5H2.8v7h2.7L11 20zM15 8.4a5 5 0 0 1 0 7.2M18 5a9.6 9.6 0 0 1 0 14"/></svg>
            <span data-question-label>Listen</span></button>
            <span class="cue-status" role="status" data-question-status></span>
          </div>
          <audio hidden playsinline preload="metadata" data-question-player src="${new URL('../../assets/audio/questions/' + question.audioId + '.mp3', import.meta.url).href}"></audio>
        </div>
        <p class="vocab-instruction sr-only">${choice ? 'Say the missing Korean word or tap your choice.' : 'The chime marks the blank. Say the word or the whole sentence.'}</p>
        ${choice ? `<div class="vocab-choices" role="group" aria-label="Choose the missing word">${options.map((word,i) => `<button type="button" lang="ko" data-choice="${i}">${word}</button>`).join('')}</div><p class="vocab-choice-status" role="status" data-choice-result></p>` : ''}
        ${recorderControls({exercise:true})}
        <form class="vocab-type" data-type-form hidden><label for="vocabAnswer">Your answer in Korean</label>
          <div><input id="vocabAnswer" lang="ko" autocomplete="off" required><button type="submit" class="sori-secondary">Check answer</button></div>
          <p role="status" data-typed-result></p></form>
        <div class="vocab-options"><button type="button" class="text-button" data-switch-input>Type instead</button>
          <button type="button" class="text-button" data-reveal-word>Show answer</button></div>
        <div class="vocab-next" data-after-answer hidden><button type="button" class="sori-primary" data-next-word>${index + 1 === words.length ? 'Finish practice' : 'Next word'}</button>
          <button type="button" class="text-button" data-hear-word>Hear the answer</button></div>
      </section>`;
    const blank = get('[data-blank]'), mic = get('.vocab-mic'), recordButton = get('[data-record-reply]');
    const form = get('[data-type-form]'), input = get('#vocabAnswer'), typedResult = get('[data-typed-result]');
    const switchButton = get('[data-switch-input]'), reveal = get('[data-reveal-word]'), after = get('[data-after-answer]');
    const cueButton = get('[data-hear-question]'), cueLabel = get('[data-question-label]'), cueStatus = get('[data-question-status]');
    const parts = {before:get('[data-vocab-before]'), blank, after:get('[data-vocab-after]')};
    let continueMode = mode, heardQuestion = false;
    const typing = !choice && mode === 'type';
    function showPlayback(state) {
      const playing = state === 'playing' || state === 'loading';
      if (state === 'playing' || state === 'ended') heardQuestion = true;
      const firstListen = !heardQuestion && !typing && after.hidden;
      cueLabel.textContent = playing ? 'Stop' : firstListen ? 'Listen' : heardQuestion ? 'Replay' : 'Listen';
      cueButton.className = 'vocab-audio-toggle ' + (firstListen && !playing ? 'sori-primary' : 'sori-secondary');
      cueButton.setAttribute('aria-busy', String(state === 'loading'));
      const messages = {loading:'Loading…', playing:'Playing question…', error:'Audio couldn’t play. Tap to retry.', blocked:'Tap to hear the question.'};
      cueStatus.textContent = messages[state] || '';
      mic.hidden = typing || (choice && !after.hidden) || playing || (firstListen && state !== 'error');
    }
    cue = attachQuestionAudio(get('[data-question-player]'), showPlayback, env);
    function hearQuestion(thenSpeak) {
      voice?.onModel(); env.SORI?.TTS?.cancel();
      cue.play(thenSpeak ? () => { if (!env.document?.hidden) voice?.start(); } : undefined);
    }
    cueButton.onclick = () => {
      if (cue.playing) cue.stop();
      else hearQuestion(!typing && after.hidden);
    };
    showPlayback('idle');
    function reset() {
      blank.innerHTML = '<span class="sr-only" lang="en">blank</span>';
      delete blank.dataset.heard;
      paintSpokenQuestion(parts,question,'');
      delete blank.dataset.result; delete get('[data-hear-word]').dataset.audio; reveal.hidden = false; after.hidden = true;
      delete form.dataset.result;
      switchButton.hidden = choice; typedResult.textContent = '';
    }
    function result(kind) {
      if (!['correct','retry','reveal'].includes(kind)) return;
      daily.record(token,index,kind);
      form.dataset.result=kind;
      blank.textContent = question.word; blank.dataset.result = kind;
      get('[data-hear-word]').dataset.audio = question.sentence;
      reveal.hidden = true; after.hidden = false;
      if (kind === 'correct') { recordButton.hidden = true; form.querySelector('button').hidden = true; switchButton.hidden = true; }
      if (kind === 'retry') recordButton.textContent = 'Try speaking again';
      if (choice) {
        mic.hidden = true;
        for (const [i,word] of options.entries()) {
          const option = get('[data-choice="' + i + '"]');
          option.disabled = true;
          if (word === question.word) option.dataset.correct = 'true';
        }
        get('[data-choice-result]').textContent = kind === 'correct' ? 'Correct!' : 'The missing word is ' + question.word + '.';
      }
    }
    switchButton.onclick = () => render(typing ? 'voice' : 'type', typing);
    reveal.onclick = () => { interrupt(); result('reveal'); showPlayback('idle'); get('[data-next-word]').focus(); };
    get('[data-next-word]').onclick = () => {
      daily.advance(token,index); onProgress?.(); render(continueMode);
    };
    if (choice) {
      switchButton.hidden = true;
      options.forEach((word,i) => {
        const button = get('[data-choice="' + i + '"]');
        button.onclick = () => {
          interrupt();
          if (word !== question.word) button.dataset.wrong = 'true';
          result(word === question.word ? 'correct' : 'retry');
          get('[data-next-word]').focus({preventScroll:true});
        };
      });
      target.querySelector('h1').focus({preventScroll:true});
    }
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
        exercise:true, choice, onBegin() { cue.stop(); heardQuestion = true; continueMode = 'voice'; reset(); },
        onTranscript(text) { if (after.hidden) paintSpokenQuestion(parts,question,text); }
      });
      target.querySelector('h1').focus({preventScroll:true});
    }
    if (current.result) { result(current.result === 'seen' ? 'reveal' : current.result); showPlayback('idle'); }
    else if (playOnOpen) hearQuestion(mode === 'voice');
  }
  render(start ? 'voice' : 'ready');
  return {onModel:interrupt, dispose() { cue?.stop(); voice?.dispose(); }};
}
