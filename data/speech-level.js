// data/speech-level.js - 경어/반말 레벨 감지 시스템
(function () {
  'use strict';

  function detectSpeechLevel(koreanText, category = null) {
    if (!koreanText || typeof koreanText !== 'string') return null;
    
    const text = koreanText.trim().replace(/[.!?]$/, '');
    
    // 1. 카테고리 우선 체크
    if (category === 'Trendy' || category === 'trendy' || category === 'Trendy Talk' || category === 'trendyBtn') {
      return 'casual';
    }
    
    if (category === 'K-Drama' || category === 'drama' || category === 'Drama') {
      return 'casual';
    }
    
    // 2. Numbers 카테고리 중립 처리
    if (category === 'Numbers' || category === 'numbers') {
      const neutralPatterns = ['요', '습니다', '해요', '어', '아', '지', '야'];
      if (!neutralPatterns.some(pattern => text.includes(pattern))) {
        return null;
      }
    }
    
    // 3. 중립 표현들
    const neutralExpressions = [
      '여섯, 일곱, 여덟, 아홉, 열', '하나, 둘, 셋, 넷, 다섯', '일, 이, 삼, 사, 오',
      '월요일, 화요일, 수요일', '목요일, 금요일', '토요일, 일요일',
      '일월, 이월, 삼월', '사월, 오월, 유월', '칠월, 팔월, 구월',
      '시월, 십일월, 십이월', '원, 십 원, 백 원', '천 원, 만 원',
      '금요일 오후 세 시', '금요일', '오후', '세 시'
    ];
    
    if (neutralExpressions.some(expr => text === expr || text.includes(expr))) {
      return null;
    }
    
    // 4. 명사형 패턴 (중립)
    const nounPatterns = [
      /요일$/, /월$/, /시$/, /분$/, /원$/, /일$/, /년$/, /개$/, /권$/, /장$/,
      /^\d+/, /^\w+요일/, /^\w+월/, /^\w+시/, /^\w+분/, /^\w+원/,
      /오후|오전|새벽|밤|낮|아침|저녁/,
      /월요일|화요일|수요일|목요일|금요일|토요일|일요일/,
      /일월|이월|삼월|사월|오월|유월|칠월|팔월|구월|시월|십일월|십이월/
    ];
    
    if (nounPatterns.some(pattern => pattern.test(text))) {
      return null;
    }
    
    // 5. "안녕" 캐주얼 처리 (우선순위)
    if (text === '안녕' || text.startsWith('안녕')) {
      return 'casual';
    }
    
    // 6. 특별한 캐주얼 표현들
    const casualExpressions = [
      '안녕!', '헐!', '대박!', '쩐다', '진짜?', '뭐야?', '어때?', '뭐해?', '어디야?',
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
      '킹리적 갓심이야.', '레알이야.', '무야호~'
    ];
    
    if (casualExpressions.includes(text)) {
      return 'casual';
    }
    
    // 7. 경어 패턴
    const politePatterns = [
      /습니다$/, /해요$/, /이에요$/, /예요$/, /어요$/, /아요$/, /요$/,
      /세요$/, /으세요$/, /주세요$/, /드릴게요$/, /할게요$/, /할래요$/,
      /있어요$/, /없어요$/, /되나요$/, /가능해요$/, /있나요$/, /없나요$/,
      /할까요$/, /될까요$/, /하세요$/, /하시나요$/, /하시는지$/, /하시는$/,
      /하시는군요$/, /입니다$/, /부탁드립니다$/, /부탁드려요$/, /부탁해요$/,
      /감사합니다$/, /죄송합니다$/, /실례합니다$/, /안녕하세요$/, /합니다$/
    ];
    
    // 경어 우선 확인
    if (text.endsWith('세요') || text.endsWith('해요') || text.endsWith('이에요') || 
        text.endsWith('예요') || text.endsWith('어요') || text.endsWith('아요') || 
        text.endsWith('요') || text.endsWith('습니다') || text.endsWith('합니다') ||
        text.endsWith('드립니다') || text.endsWith('주세요') || text.endsWith('해주세요') || 
        text.endsWith('해 주세요')) {
      return 'polite';
    }
    
    // 경어 패턴 확인
    if (politePatterns.some(pattern => pattern.test(text))) {
      return 'polite';
    }
    
    // 8. 캐주얼 패턴
    const casualPatterns = [/어$/, /아$/, /지$/, /야$/, /해$/];
    
    if (casualPatterns.some(pattern => pattern.test(text))) {
      return 'casual';
    }
    
    // 9. 일반적인 경우들
    if (text.includes('요') || text.includes('습니다') || text.includes('해요')) {
      return 'polite';
    }
    
    if (text.includes('어') || text.includes('아') || text.includes('지') || text.includes('야')) {
      return 'casual';
    }
    
    return null;
  }

  function updateSpeechLevelTag(koreanText) {
    const badgeEl = document.getElementById('badge');
    if (!badgeEl) return;
    
    const badgeContainer = badgeEl.parentElement;
    if (!badgeContainer) return;
    
    // 기존 태그 제거
    const existingTag = badgeContainer.querySelector('.speech-level-tag');
    if (existingTag) {
      existingTag.remove();
    }
    
    // 현재 카테고리 확인 - 여러 방법으로 시도
    let category = null;
    
    // 방법 1: .tab-button.active 찾기
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab) {
      category = activeTab.textContent.trim();
    }
    
    // 방법 2: app.js의 currentCategory 사용
    if (!category && window.SoriApp && window.SoriApp.currentCategory) {
      category = window.SoriApp.currentCategory;
    }
    
    // 방법 3: 버튼 ID로 매핑
    if (!category) {
      const tabButtons = ['dailyBtn', 'travelBtn', 'dramaBtn', 'trendyBtn', 'numbersBtn'];
      for (const btnId of tabButtons) {
        const btn = document.getElementById(btnId);
        if (btn && btn.classList.contains('active')) {
          category = btn.textContent.trim();
          break;
        }
      }
    }
    
    const speechLevel = detectSpeechLevel(koreanText, category);
    
    if (speechLevel) {
      const tag = document.createElement('span');
      tag.className = `speech-level-tag ${speechLevel}`;
      tag.textContent = speechLevel === 'polite' ? 'Polite' : 'Casual';
      badgeContainer.appendChild(tag);
    }
  }

  // 전역 노출
  window.detectSpeechLevel = detectSpeechLevel;
  window.updateSpeechLevelTag = updateSpeechLevelTag;
})();