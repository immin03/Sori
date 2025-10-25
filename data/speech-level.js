// data/speech-level.js - 경어/반말 레벨 감지 시스템
(function () {
  'use strict';

  // 경어/반말 레벨 감지 함수
  function detectSpeechLevel(koreanText, category = null) {
    if (!koreanText || typeof koreanText !== 'string') return null;
    
    const text = koreanText.trim().replace(/[.!?]$/, ''); // 마침표 제거
    
    // 숫자나 중립적인 표현인지 확인
    if (/^[0-9\s\-\.]+$/.test(text) || text.length <= 2) {
      return null; // 중립
    }
    
    // Numbers 카테고리는 대부분 중립 (명사형)
    if (category === 'Numbers' || category === 'numbers') {
      // 문장이 아닌 단순 명사나 숫자 표현들은 중립
      if (!text.includes('요') && !text.includes('습니다') && !text.includes('해요') && 
          !text.includes('어') && !text.includes('아') && !text.includes('지') && !text.includes('야')) {
        return null; // 중립
      }
    }
    
    // 중립 표현들 (명사형, 숫자, 요일 등)
    const neutralExpressions = [
      '여섯, 일곱, 여덟, 아홉, 열', '하나, 둘, 셋, 넷, 다섯', '일, 이, 삼, 사, 오',
      '월요일, 화요일, 수요일', '목요일, 금요일', '토요일, 일요일',
      '일월, 이월, 삼월', '사월, 오월, 유월', '칠월, 팔월, 구월',
      '시월, 십일월, 십이월', '원, 십 원, 백 원', '천 원, 만 원',
      '십만, 백만', '천만, 일 억', '이십일, 이십이, 이십삼', '삼십, 사십, 오십',
      '육십, 칠십, 팔십, 구십', '백, 이백, 삼백', '천, 이천, 삼천',
      '첫째 날, 둘째 날', '셋째 날, 넷째 날', '삼월 오일', '유월 십구일',
      '금요일 오후 세 시', '금요일', '오후', '세 시'
    ];
    
    // 중립 표현들 확인
    for (const expression of neutralExpressions) {
      if (text === expression || text.includes(expression)) {
        return null; // 중립
      }
    }
    
    // 명사형 패턴 확인 (시간, 요일, 숫자 등)
    const nounPatterns = [
      /요일$/, /월$/, /시$/, /분$/, /원$/, /일$/, /년$/, /개$/, /권$/, /장$/,
      /^\d+/, /^\w+요일/, /^\w+월/, /^\w+시/, /^\w+분/, /^\w+원/,
      /오후|오전|새벽|밤|낮|아침|저녁/,
      /월요일|화요일|수요일|목요일|금요일|토요일|일요일/,
      /일월|이월|삼월|사월|오월|유월|칠월|팔월|구월|시월|십일월|십이월/
    ];
    
    for (const pattern of nounPatterns) {
      if (pattern.test(text)) {
        return null; // 중립
      }
    }
    
    // 트렌디 카테고리는 모두 캐주얼
    if (category === 'Trendy' || category === 'trendy' || category === 'Trendy Talk') {
      return 'casual';
    }
    
    // 드라마 카테고리는 대부분 캐주얼 (일상 대화체)
    if (category === 'K-Drama' || category === 'drama' || category === 'Drama') {
      return 'casual';
    }
    
    // 경어 패턴 (더 정확한 패턴들)
    const politePatterns = [
      /습니다$/, /해요$/, /이에요$/, /예요$/, /어요$/, /아요$/, /요$/,
      /세요$/, /으세요$/, /주세요$/, /드릴게요$/, /할게요$/, /할래요$/,
      /있어요$/, /없어요$/, /되나요$/, /가능해요$/, /있나요$/, /없나요$/,
      /할까요$/, /될까요$/, /하세요$/, /하시나요$/, /하시는지$/, /하시는$/,
      /하시는군요$/, /입니다$/, /부탁드립니다$/, /부탁드려요$/, /부탁해요$/,
      /감사합니다$/, /죄송합니다$/, /실례합니다$/, /안녕하세요$/, /합니다$/
    ];
    
    // 경어 우선 확인 (가장 먼저 체크)
    if (text.endsWith('세요') || text.endsWith('해요') || text.endsWith('이에요') || 
        text.endsWith('예요') || text.endsWith('어요') || text.endsWith('아요') || 
        text.endsWith('요') || text.endsWith('습니다') || text.endsWith('합니다')) {
      return 'polite';
    }
    
    // 반말 패턴 (더 정확한 패턴들)
    const casualPatterns = [
      /어$/, /아$/, /지$/, /야$/, /해$/, /야$/, /어$/, /아$/,
      /지$/, /야$/, /해$/, /야$/, /어$/, /아$/, /지$/, /야$/,
      /해$/, /야$/, /어$/, /아$/, /지$/, /야$/, /해$/, /야$/,
      /어$/, /아$/, /지$/, /야$/, /해$/, /야$/, /어$/, /아$/,
      /지$/, /야$/, /해$/, /야$/, /어$/, /아$/, /지$/, /야$/,
      /해$/, /야$/, /어$/, /아$/, /지$/, /야$/, /해$/, /야$/
    ];
    
    // 특별한 반말 표현들
    const casualExpressions = [
      '안녕!', '안녕', '헐!', '대박!', '쩐다', '진짜?', '뭐야?', '어때?', '뭐해?', '어디야?',
      '말도 안 돼!', '대박이다!', '진짜 웃겨!', '이게 실화야?', '뭐래?', '그치 그치.',
      '나도 그래.', '그게 되네?', '피곤해 죽겠어.', '귀찮아 죽겠어.', '답답해 미치겠어.',
      '노답이야.', '현타 왔다.', '킹받네.', '어쩔 수 없지.', '완전 좋아!', '답정너잖아.',
      '긴장돼.', '멋지다!', '짱이다!', '오글거려.', '노잼이야.', '꿀잼이야!', '미쳤다.',
      '그건 좀 에바야.', '너무 오바야.', '수상해.', '진짜야?', 'ㅋㅋㅋㅋ', 'ㅠㅠ',
      '개웃겨.', '진심이야.', '끝도 없어.', '완전 내 얘기야.', '그건 니 생각이고~',
      '레전드다.', '요즘 유행이야.', '오늘은 플렉스했어.', '화이팅!', '고생 많았어.',
      '축하해!', '내 잘못이야.', '미안해.', '고마워!', '같이 가자!', '패스할게.',
      '좋지!', '할 수 있다!', '현생에 치였어.', '자기관리 중이야.', '소확행이야.',
      '오늘도 갓생 살자.', '번아웃 왔어.', '감정기복 심해.', '힐링 중이야.',
      '킹리적 갓심이야.', '레알이야.', '무야호~',
      // 드라마 특별 표현들
      '첫눈 오는 날엔, 용기가 필요해.', '너는, 내가 잃은 모든 날들이다.', '혼자였던 시간도, 나를 만들었어.',
      '널 좋아한 게, 잘못이었을까?', '끝이라고 생각한 순간, 다시 시작됐어.', '나는, 내 방식대로 간다.',
      '숨 좀 쉬게 해줘.', '부르면 가고, 안 부르면 안 가.', '슬픈 날엔, 내 어깨 빌려줄게요.',
      '오늘도 파이팅!', '밥은 꼭 챙겨 먹어.', '기러기, 토마토, 스위스, 인도인.', '지금 이 순간이, 전부야.',
      '괜찮아. 버틸 수 있어.', '포기하면, 거기서 끝이야.', '천천히 해도, 괜찮아.', '답은 늘, 가까이에 있어.',
      '작은 성실이, 큰 변화를 만든다.', '어떤 날은, 버티는 게 용기야.', '처음이라서 더 두근거려.',
      '실패는 값비싼 수업료야.', '상처도 나의 일부야.', '남긴 것은 이야기예요.', '정의는 때로, 날카로워야 해.',
      '인연은, 때가 되면 다시 와.', '두려움은 퍼지고, 용기는 모인다.', '괴물은 밖에만 있지 않아.',
      '머리로 싸우는 법을 알지.', '천천히 해도, 우리는 친구야.', '시작은 미약해도, 포기는 없어.',
      '완벽보다, 따뜻함이 먼저야.', '네 속도로 걸어가.', '나는 선택했고, 책임진다.', '진실은, 시간을 건너온다.',
      '지더라도 배운다면, 진 거 아니야.', '집요함이 결국 이겨.', '국경보다 마음이 넓었지.', '다름은 틀림이 아니야.',
      '네가 누군지 알기도 전에, 좋아했어.', '천 년을 기다렸어, 너를.', '사랑이 뭔데? 먹는 거야?',
      '악당도 사랑할 수 있나요?', '가짜 연애가 진짜가 됐어.', '인생은 속도가 아니라 방향이야.',
      '선택은 내가 하는 거야.', '어제의 나보다 나아지면 돼.', '오늘이 선물이야.', '가는 길이 꽃길이면 좋겠어.',
      '넌 충분히 잘하고 있어.', '울어도 괜찮아.', '난 네가 할 수 있다고 믿어.', '혼자가 아니야.', '쉬어도 괜찮아.',
      '네 편이 있어 든든해.', '같이 웃던 날을 잊지 말자.', '작은 시작이 큰 파도를 만든다.', '비교 말고, 집중만 하자.',
      '밤공기부터 천천히 들이마셔.', '오늘의 나는 충분했다.', '집은, 돌아오면 따뜻해진다.', '네 손을 먼저 잡을게.',
      '네가 오면, 시간이 느려져.', '다시 시작해도 괜찮아.'
    ];
    
    // 특별한 반말 표현들 먼저 확인
    for (const expression of casualExpressions) {
      if (text === expression) {
        return 'casual';
      }
    }
    
    // "안녕"으로 시작하는 경우도 캐주얼로 처리
    if (text === '안녕' || text.startsWith('안녕')) {
      return 'casual';
    }
    
    // 경어 패턴 확인 (우선순위)
    for (const pattern of politePatterns) {
      if (pattern.test(text)) {
        return 'polite';
      }
    }
    
    // 추가 경어 패턴 확인
    if (text.endsWith('합니다') || text.endsWith('드립니다') || text.endsWith('습니다') || 
        text.endsWith('주세요') || text.endsWith('해주세요') || text.endsWith('해 주세요')) {
      return 'polite';
    }
    
    // 반말 패턴 확인
    for (const pattern of casualPatterns) {
      if (pattern.test(text)) {
        return 'casual';
      }
    }
    
    // 특별한 경우들
    if (text.includes('요') || text.includes('습니다') || text.includes('해요')) {
      return 'polite';
    }
    
    if (text.includes('어') || text.includes('아') || text.includes('지') || text.includes('야')) {
      return 'casual';
    }
    
    return null; // 중립
  }

  // 카테고리 태그에 경어/반말 레벨 태그 추가
  function updateSpeechLevelTag(koreanText) {
    const badgeEl = document.getElementById('badge');
    if (!badgeEl) return;
    
    // badge-container 찾기
    const badgeContainer = badgeEl.parentElement;
    if (!badgeContainer) return;
    
    // 기존 speech level 태그 제거
    const existingTag = badgeContainer.querySelector('.speech-level-tag');
    if (existingTag) {
      existingTag.remove();
    }
    
    // 현재 활성화된 카테고리 확인
    const activeTab = document.querySelector('.tab-button.active');
    const category = activeTab ? activeTab.textContent.trim() : null;
    
    const speechLevel = detectSpeechLevel(koreanText, category);
    
    if (speechLevel) {
      const tag = document.createElement('span');
      tag.className = `speech-level-tag ${speechLevel}`;
      tag.textContent = speechLevel === 'polite' ? 'Polite' : 'Casual';
      badgeContainer.appendChild(tag);
    }
  }

  // 전역으로 함수 노출
  window.detectSpeechLevel = detectSpeechLevel;
  window.updateSpeechLevelTag = updateSpeechLevelTag;
})();
