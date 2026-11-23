import {icon} from '../ui-icons.js';
import {sameTopicChoices, levels, topics, vocabulary} from './vocabulary.js?v=study1';
import {difficultyControl, topicTitle} from './vocabulary-library.js?v=mobile2';
import {paintSpokenQuestion} from './speech-highlight.js?v=20261123beta';
import {attachVoiceReply, recorderControls} from './voice-reply.js?v=20261123beta';
import {attachQuestionAudio, attachSynthesizedQuestion} from './question-audio.js?v=20261123beta';
import {checkWords,prepareChime,playChime} from './word-check.js?v=20261123relaunch';
import {romanize} from './romanize.js?v=20261123restore';

function prompt(question) {
  return `<p class="vocab-sentence" lang="ko"><span data-vocab-before>${question.before}</span><span class="vocab-blank" data-blank><span class="sr-only" lang="en">blank</span></span><span data-vocab-after>${question.after}</span></p>
    <p class="roman-line vocab-reading">${romanize(question.before)} ____ ${romanize(question.after)}</p><p class="vocab-meaning">${question.meaning}</p>`;
}

export function vocabularyCard(daily) {
  const {words, index} = daily.today();
  const complete = index === words.length;
  return `<article class="vocab-card daily-start"><div class="daily-symbol">${icon('book')}</div>
    <h2>Today’s words</h2><p>${index} of ${words.length} practised</p>
    <progress max="${words.length}" value="${index}" aria-label="Today's progress"></progress>
    <button type="button" class="sori-primary" data-open-vocabulary>${complete ? 'Review today’s words' : index ? 'Continue' : 'Start lesson'} ${icon('arrow')}</button></article>
    <section class="home-vocab-topics"><div class="browse-heading"><h2>Word topics</h2><a href="#practice=vocabulary&amp;view=topics">View all ${topics.length} ${icon('arrow')}</a></div>
    <div class="tile-grid">${topics.slice(0,6).map(topic=>`<a class="topic-tile" href="#practice=vocabulary&amp;view=topic&amp;topic=${topic.id}"><span class="tile-icon">${icon(topic.id)}</span><strong>${topic.title}</strong></a>`).join('')}</div></section>`;
}

export function mountVocabulary(target, daily, env, {start = false, onProgress, custom = false} = {}) {
  let voice, cue, unlockTimer;
  function interrupt() { cue?.stop(); voice?.onModel(); }
  const get = selector => target.querySelector(selector);
  function render(mode = 'ready', playOnOpen = true) {
    env.clearTimeout(unlockTimer);
    cue?.stop(); cue = null; voice?.dispose(); voice = null;
    env.SORI?.TTS?.cancel();
    const round = custom ? daily.custom() : daily.today();
    if (!round) return;
    const {words,index,day,token} = round;
    const title = round.kind === 'daily' ? 'Today’s vocabulary' : round.kind === 'topic' ? topicTitle(round.topic) : round.scope === 'this-round' ? 'Missed words' : round.scope === 'tricky' ? 'Tricky word review' : 'Mixed review';
    const parent = round.kind === 'review' ? ['My words','#practice=vocabulary&amp;view=words'] : round.kind === 'topic' ? [topicTitle(round.topic),'#practice=vocabulary&amp;view=topic&amp;topic='+round.topic] : ['Vocabulary','#home'];
    const header = `<header class="session-header"><a class="section-back focus-exit" href="${parent[1]}" aria-label="Exit to ${parent[0]}">×</a><span>${Math.min(index+1,words.length)} / ${words.length}</span></header>`;
    if (index === words.length) {
      const correct=round.slots.filter(s=>s.result==='correct').length;
      const missed=round.slots.filter(s=>['retry','reveal'].includes(s.result)).length;
      const seen=words.length-correct-missed;
      target.innerHTML = `${header}<section class="vocab-finish">
        <h1 tabindex="-1">${round.kind === 'daily' ? 'Today’s vocabulary complete.' : title + ' complete.'}</h1>
        <p class="round-score"><strong>${correct} / ${words.length}</strong> correct on the first try · ${missed} to review${seen?' · '+seen+' previously seen':''}</p>
        ${missed?`<button type="button" class="sori-primary" data-vocab-misses="${token}">Retry missed words (${missed})</button>`:''}
        <ul>${words.map((q,i) => `<li><strong lang="ko">${q.term}</strong><span>${romanize(q.term)} · ${q.gloss}${['retry','reveal'].includes(round.slots[i].result) ? ' · Saved for another try' : ''}</span></li>`).join('')}</ul>
        <div class="vocab-hub-actions"><a class="sori-primary" href="#practice=vocabulary&amp;view=words">Open my words</a>
        ${round.kind === 'topic' ? `<button type="button" class="sori-secondary" data-vocab-start="${round.topic}" data-vocab-level="${round.level}">Another set</button>` :
          round.kind === 'review' ? '<button type="button" class="sori-secondary" data-vocab-review="all">Review another set</button>' :
          '<button type="button" class="sori-secondary" data-vocab-replay>Practise again</button>'}</div></section>`;
      if (round.kind === 'daily') get('[data-vocab-replay]').onclick = () => { daily.setIndex(0,day); onProgress?.(); render('voice'); };
      target.querySelector('h1').focus?.({preventScroll:true});
      return;
    }
    const question = words[index];
    const liveAudio = question.questionAudio === 'synthesized';
    const questionSrc = new URL(liveAudio ? '../../assets/audio/vocab-gap.wav' : '../../assets/audio/questions/' + question.audioId + '.mp3', import.meta.url).href;
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
          <audio hidden playsinline preload="metadata" data-question-player src="${questionSrc}"></audio>
        </div>
        <p class="vocab-instruction sr-only">${choice ? 'Say the missing Korean word or tap your choice.' : 'The chime marks the blank. Say the word or the whole sentence.'}</p>
        ${choice ? `<div class="vocab-choices" role="group" aria-label="Choose the missing word">${options.map((word,i) => `<button type="button" lang="ko" data-choice="${i}">${word}</button>`).join('')}</div><p class="vocab-choice-status" role="status" data-choice-result></p>` : ''}
        ${recorderControls({exercise:true})}
        <form class="vocab-type" data-type-form hidden><label for="vocabAnswer">Your answer in Korean</label>
          <div><input id="vocabAnswer" lang="ko" autocomplete="off" required><button type="submit" class="sori-secondary">Check answer</button></div>
          <p role="status" data-typed-result></p></form>
        <div class="vocab-options"><button type="button" class="text-button" data-switch-input>Type instead</button>
          <button type="button" class="text-button" data-reveal-word>Show answer</button></div>
        <div class="answer-verdict" role="status" aria-live="polite" aria-atomic="true" tabindex="-1" hidden data-verdict-panel></div><div class="vocab-next" data-after-answer hidden><button type="button" class="sori-primary" data-next-word>${index + 1 === words.length ? 'Finish practice' : 'Next word'}</button>
          <button type="button" class="text-button" data-hear-word>Hear the answer</button></div>
      </section>`;
    const blank = get('[data-blank]'), mic = get('.vocab-mic'), recordButton = get('[data-record-reply]');
    const form = get('[data-type-form]'), input = get('#vocabAnswer'), typedResult = get('[data-typed-result]');
    const switchButton = get('[data-switch-input]'), reveal = get('[data-reveal-word]'), after = get('[data-after-answer]');
    const cueButton = get('[data-hear-question]'), cueLabel = get('[data-question-label]'), cueStatus = get('[data-question-status]');
    const parts = {before:get('[data-vocab-before]'), blank, after:get('[data-vocab-after]')};
    let continueMode = mode, heardQuestion = false, answered = false;
    const verdictPanel=get('[data-verdict-panel]'), next=get('[data-next-word]');
    next.disabled=true;
    function sound(kind){
      try { if(env.localStorage.getItem('sori:voice:sound')==='off')return; }catch{}
      prepareChime(env);playChime(kind);
    }
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
    const player = get('[data-question-player]');
    cue = liveAudio ? attachSynthesizedQuestion(question, player, env.SORI?.TTS, showPlayback, env) :
      attachQuestionAudio(player, showPlayback, env);
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

      answered=false;next.disabled=true;env.clearTimeout(unlockTimer);
      verdictPanel.hidden=true;
      blank.innerHTML = '<span class="sr-only" lang="en">blank</span>';
      delete blank.dataset.heard;
      paintSpokenQuestion(parts,question,'');
      get('.vocab-reading').textContent=romanize(question.before)+' ____ '+romanize(question.after);
      delete blank.dataset.result; delete get('[data-hear-word]').dataset.audio; reveal.hidden = false; after.hidden = true;
      delete form.dataset.result;
      switchButton.hidden = choice; typedResult.textContent = '';
    }
    function result(kind, fresh = true) {
      if (!['correct','retry','reveal'].includes(kind)) return;
      if(answered)return;
      answered=true;
      if(fresh){
        daily.record(token,index,kind);
        if(kind!=='reveal')env.dispatchEvent?.(new CustomEvent('sori-study-answer',{detail:'word:'+question.id}));
      }
      next.disabled=fresh;
      env.clearTimeout(unlockTimer);
      if(fresh)unlockTimer=env.setTimeout(()=>{if(answered)next.disabled=false;},1000);
      verdictPanel.hidden=false;verdictPanel.dataset.kind=kind;
      verdictPanel.innerHTML=(kind==='correct'?'<strong>✓ Correct! Nicely done.</strong>':kind==='retry'?'<strong>Try that one again.</strong>':'<strong>Here’s the answer.</strong>')+'<span lang="ko">'+question.word+'</span><small>'+romanize(question.word)+' · '+question.gloss+'</small>';
      if(fresh)verdictPanel.focus({preventScroll:true});
      if(fresh)verdictPanel.scrollIntoView?.({block:'nearest'});
      if(fresh && kind==='correct')env.dispatchEvent?.(new CustomEvent('sori-word-learned',{detail:question.id}));
      form.dataset.result=kind;
      blank.textContent = question.word; blank.dataset.result = kind;
      get('.vocab-reading').textContent=romanize(question.sentence);
      get('[data-hear-word]').dataset.audio = question.sentence;
      reveal.hidden = true; after.hidden = false;
      if (kind === 'correct') { recordButton.hidden = false; recordButton.textContent='Try again'; form.querySelector('button').hidden = true; switchButton.hidden = true; }
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
    reveal.onclick = () => { interrupt(); result('reveal'); showPlayback('idle');  };
    next.onclick = () => {
      if(!answered||next.disabled)return;
      next.disabled=true;daily.advance(token,index); onProgress?.(); render(continueMode);
    };
    if (choice) {
      switchButton.hidden = true;
      options.forEach((word,i) => {
        const button = get('[data-choice="' + i + '"]');
        button.onclick = () => {
          interrupt();
          if (word !== question.word) button.dataset.wrong = 'true';
          sound(word===question.word?'correct':'retry');
          result(word === question.word ? 'correct' : 'retry');

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
        if(['correct','retry'].includes(verdict.kind))sound(verdict.kind);
        result(verdict.kind);

      };
    } else {
      voice = attachVoiceReply(mic, env, question.sentence, question.accepted, kind=>result(kind), {
        exercise:true, choice, onBegin() { cue.stop(); heardQuestion = true; continueMode = 'voice'; reset(); },
        onTranscript(text) { if (after.hidden) paintSpokenQuestion(parts,question,text); }
      });
      target.querySelector('h1').focus({preventScroll:true});
    }
    if (current.result) { result(current.result === 'seen' ? 'reveal' : current.result,false); showPlayback('idle'); }
    else if (playOnOpen) hearQuestion(mode === 'voice');
  }
  render(start ? 'voice' : 'ready');
  return {onModel:interrupt, dispose() { env.clearTimeout(unlockTimer);cue?.stop(); voice?.dispose(); }};
}
