// js/tts.js
// Web Speech API로 한국어 억양을 최대한 자연스럽게 만들기 위한 보정 로직
// - 문장/절 분절 후 순차 재생
// - 질문문 끝 억양 상승
// - 느낌문 에너지 상승
// - 평서문 여운 처리
// - 한국어 보이스 우선 선택 및 iOS 보이스 로딩 보정

(function () {
  const synth = window.speechSynthesis;

  // 한국어 보이스 우선순위 테이블
  const preferredKoVoices = [
    // Apple 계열
    'Yuna', 'Sora', 'Yuri', 'Narae',
    // Microsoft 계열
    'Microsoft SunHi', 'Microsoft Heami',
  ];

  // 보이스 로드 대기: iOS/Safari에서 getVoices가 빈 배열로 나오는 이슈 보정
  function waitForVoices(timeoutMs = 1500) {
    return new Promise((resolve) => {
      const start = Date.now();
      const tick = () => {
        const voices = synth.getVoices();
        if (voices && voices.length > 0) return resolve(voices);
        if (Date.now() - start > timeoutMs) return resolve(voices || []);
        setTimeout(tick, 100);
      };
      // 보이스 리스트 업데이트 이벤트도 수신
      synth.onvoiceschanged = () => {
        const voices = synth.getVoices();
        if (voices && voices.length > 0) resolve(voices);
      };
      tick();
    });
  }

  // 한국어 보이스 선택
  function pickKoVoice(voices) {
    if (!voices || voices.length === 0) return null;

    // 1순위: ko-KR 계열에 선호 이름 매칭
    for (const name of preferredKoVoices) {
      const found = voices.find((v) => (v.lang || '').toLowerCase().startsWith('ko') && v.name.includes(name));
      if (found) return found;
    }
    // 2순위: ko-KR 계열 아무거나
    const koAny = voices.find((v) => (v.lang || '').toLowerCase().startsWith('ko'));
    if (koAny) return koAny;

    // 3순위: lang에 'ko' 포함
    const koLoose = voices.find((v) => (v.lang || '').toLowerCase().includes('ko'));
    if (koLoose) return koLoose;

    // 없으면 기본값
    return null;
  }

  // 텍스트를 자연스러운 절로 분절
  function splitIntoClauses(txt) {
    // 주요 분절 기호 기준으로 분리. 기호는 유지하여 억양 판단에 사용.
    const parts = [];
    let buf = '';
    for (const ch of txt) {
      buf += ch;
      if (/[.。!?！？…]/.test(ch)) {
        parts.push(buf.trim());
        buf = '';
      }
    }
    if (buf.trim()) parts.push(buf.trim());

    // 쉼표 기반 추가 분절: 너무 길면 쉼을 한 번 더 준다
    const expanded = [];
    for (const part of parts) {
      if (part.length > 18 && part.indexOf(',') !== -1) {
        // 쉼표 하나까지만 두 절로 쪼개 자연스러운 호흡을 만든다
        const idx = part.indexOf(',');
        expanded.push(part.slice(0, idx + 1).trim());
        expanded.push(part.slice(idx + 1).trim());
      } else {
        expanded.push(part);
      }
    }
    return expanded.filter(Boolean);
  }

  // 문장/절 성격 판별
  function classifyClause(clause) {
    const end = clause.slice(-1);
    if (/[?？]/.test(end)) return 'question';
    if (/[!！]/.test(end)) return 'exclaim';
    return 'statement';
  }

  // 자연스러운 여운 처리를 위한 텍스트 후처리
  function postProcessText(clause, kind) {
    let t = clause;

    // 문장 중간에 약한 쉼을 추가하여 합성기가 더 자연스럽게 읽도록 유도
    // 한국어 종결 표현 직전에는 과도한 쉼을 넣지 않는다.
    t = t
      .replace(/(습니다|해요)(\s|$)/g, '$1,$2')
      .replace(/(했어요|했죠|일까요)(\s|$)/g, '$1,$2')
      .replace(/(\S)(그리고|하지만|그래서)\s/g, '$1, $2 ');

    if (kind === 'question') {
      // 끝 음을 살짝 끌게 하는 마커(합성기용): 물결표를 붙이면 일부 엔진에서 상승 억양처럼 들린다.
      t = t.replace(/[?？]\s*$/, '?~');
    } else if (kind === 'exclaim') {
      t = t.replace(/[!！]\s*$/, '!~');
    } else {
      // 평서문은 살짝 여운
      t = t.replace(/[.。]\s*$/, '...');
    }
    return t;
  }

  // 절 단위로 하나씩 읽기. 억양 파라미터를 절 성격에 맞게 조정.
  function utterClause(text, kind, voice, baseRate) {
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ko-KR';
      if (voice) u.voice = voice;

      // 기본값
      u.rate = Math.min(1.2, Math.max(0.5, baseRate || 0.9));
      u.pitch = 1.0;
      u.volume = 1.0;

      // 억양 보정
      if (kind === 'question') {
        // 질문: 약간 느리게, 피치 업
        u.rate = Math.max(0.65, (baseRate || 0.9) - 0.05);
        u.pitch = 1.22;
      } else if (kind === 'exclaim') {
        // 느낌문: 약간 빠르게, 피치 소폭 업
        u.rate = Math.min(1.25, (baseRate || 0.9) + 0.08);
        u.pitch = 1.12;
      } else {
        // 평서문: 기본, 끝 여운을 살짝
        u.rate = Math.max(0.7, (baseRate || 0.9));
        u.pitch = 1.02;
      }

      u.onend = resolve;
      u.onerror = resolve;
      synth.speak(u);
    });
  }

  // 질문문 마무리 상승 효과를 강화: 마지막 단어를 살짝 반복 재생
  function reinforceQuestionTail(originalClause, voice, baseRate) {
    const cleaned = originalClause.replace(/[?？]\s*$/, '');
    // 마지막 2~4글자 정도만 추출
    const tail = cleaned.slice(-4) || cleaned;
    const u = new SpeechSynthesisUtterance(tail + '~');
    u.lang = 'ko-KR';
    if (voice) u.voice = voice;
    u.rate = Math.max(0.6, (baseRate || 0.9) - 0.1);
    u.pitch = 1.32; // 더 높은 피치로 끝 올림
    u.volume = 1.0;
    return new Promise((resolve) => {
      u.onend = resolve;
      u.onerror = resolve;
      synth.speak(u);
    });
  }

  // 외부에서 호출하는 API. 기존 시그니처 유지: speakText(txt, voices)
  window.speakText = async function speakText(txt, voicesFromCaller) {
    if (!('speechSynthesis' in window)) {
      const errEl = document.getElementById('errorMsg');
      if (errEl) {
        errEl.textContent = 'Your browser does not support text-to-speech. Try Chrome, Safari, or Edge.';
        errEl.style.display = 'block';
        setTimeout(() => (errEl.style.display = 'none'), 4000);
      }
      return;
    }

    try {
      // 기존에 재생 중인 발화 취소
      synth.cancel();

      // st.spd가 있으면 반영
      const baseRate = (window.st && typeof window.st.spd === 'number') ? window.st.spd : 0.9;

      // 보이스 확보
      const loadedVoices = voicesFromCaller && voicesFromCaller.length
        ? voicesFromCaller
        : await waitForVoices();
      const voice = pickKoVoice(loadedVoices);

      // 문장을 절로 분절
      const clauses = splitIntoClauses(String(txt));
      if (clauses.length === 0) return;

      // 절별로 순차 재생
      for (let i = 0; i < clauses.length; i++) {
        const raw = clauses[i];
        const kind = classifyClause(raw);
        const processed = postProcessText(raw, kind);
        await utterClause(processed, kind, voice, baseRate);

        // 질문문이면 끝을 한 번 더 살짝 올려준다
        if (kind === 'question') {
          await reinforceQuestionTail(raw, voice, baseRate);
        }

        // 절 사이 간단한 쉼
        if (i < clauses.length - 1) {
          await new Promise((r) => setTimeout(r, 90));
        }
      }
    } catch (e) {
      // 오류는 조용히 처리
      // console.error('TTS error:', e);
    }
  };

  // iOS에서 최초 호출 전에 보이스를 미리 한 번 불러오도록 유도
  // 사용자가 상호작용(버튼 클릭) 이후에만 실제 발화가 가능하다는 제약은 동일.
  waitForVoices();
})();
