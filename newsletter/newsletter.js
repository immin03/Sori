// 뉴스레터 기능 JavaScript
import { auth, db } from "../js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

let currentUser = null;
let newsletters = [];
let isSubscribed = false;

// DOM 요소들
const $ = (id) => document.getElementById(id);
const elements = {
  newsletterSection: $("newsletterSection"),
  newsletterList: $("newsletterList"),
  newsletterContent: $("newsletterContent"),
  newsletterTitle: $("newsletterTitle"),
  newsletterMeta: $("newsletterMeta"),
  newsletterBody: $("newsletterBody"),
  subscribeBtn: $("subscribeBtn"),
  backToList: $("backToList")
};

// 유틸리티 함수들
function showToast(message, type = 'info') {
  const toast = document.getElementById('congrats');
  if (toast) {
    toast.textContent = message;
    toast.className = `alert ${type}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

function formatDate(timestamp) {
  if (!timestamp) return '날짜 없음';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// 뉴스레터 목록 로드
async function loadNewsletters() {
  try {
    const q = query(
      collection(db, 'newsletters'), 
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    newsletters = [];
    querySnapshot.forEach((doc) => {
      newsletters.push({ id: doc.id, ...doc.data() });
    });
    
    renderNewsletterList();
  } catch (error) {
    console.error('뉴스레터 로드 실패:', error);
    showToast('뉴스레터를 불러오는데 실패했습니다.', 'error');
  }
}

// 뉴스레터 목록 렌더링
function renderNewsletterList() {
  if (!newsletters.length) {
    elements.newsletterList.innerHTML = `
      <div class="subscribe-form">
        <h3>📧 뉴스레터 구독하기</h3>
        <p>한국어 학습 팁과 앱 업데이트 소식을 받아보세요!</p>
        <input type="email" id="emailInput" placeholder="이메일 주소를 입력하세요" />
        <button class="btn btn-primary" onclick="subscribeToNewsletter()">구독하기</button>
      </div>
    `;
    return;
  }
  
  const html = newsletters.map(newsletter => `
    <div class="newsletter-item" onclick="showNewsletter('${newsletter.id}')">
      <h3>${newsletter.title}</h3>
      <div class="newsletter-meta">
        <span class="newsletter-type">${getTypeLabel(newsletter.type)}</span>
        <span>${formatDate(newsletter.publishedAt || newsletter.createdAt)}</span>
      </div>
      <div class="newsletter-preview">${newsletter.content.substring(0, 100)}${newsletter.content.length > 100 ? '...' : ''}</div>
    </div>
  `).join('');
  
  elements.newsletterList.innerHTML = html;
}

// 타입 라벨 변환
function getTypeLabel(type) {
  const labels = {
    'general': '일반',
    'update': '업데이트',
    'tip': '학습팁',
    'event': '이벤트'
  };
  return labels[type] || type;
}

// 뉴스레터 상세 보기
function showNewsletter(id) {
  const newsletter = newsletters.find(n => n.id === id);
  if (!newsletter) return;
  
  elements.newsletterTitle.textContent = newsletter.title;
  elements.newsletterMeta.innerHTML = `
    <span class="newsletter-type">${getTypeLabel(newsletter.type)}</span>
    <span>${formatDate(newsletter.publishedAt || newsletter.createdAt)}</span>
  `;
  elements.newsletterBody.textContent = newsletter.content;
  
  elements.newsletterList.style.display = 'none';
  elements.newsletterContent.style.display = 'block';
}

// 목록으로 돌아가기
function backToList() {
  elements.newsletterContent.style.display = 'none';
  elements.newsletterList.style.display = 'block';
}

// 구독 상태 확인
async function checkSubscriptionStatus() {
  if (!currentUser) {
    updateSubscribeButton();
    return;
  }
  
  try {
    const q = query(
      collection(db, 'subscribers'),
      where('userId', '==', currentUser.uid),
      where('active', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    isSubscribed = !querySnapshot.empty;
    updateSubscribeButton();
  } catch (error) {
    console.error('구독 상태 확인 실패:', error);
  }
}

// 구독 버튼 업데이트
function updateSubscribeButton() {
  if (!elements.subscribeBtn) return;
  
  if (!currentUser) {
    elements.subscribeBtn.textContent = '로그인 후 구독하기';
    elements.subscribeBtn.style.background = '#7c3aed';
    elements.subscribeBtn.onclick = showLoginModal;
  } else if (isSubscribed) {
    elements.subscribeBtn.textContent = '구독 중';
    elements.subscribeBtn.style.background = '#6b7280';
    elements.subscribeBtn.onclick = unsubscribeFromNewsletter;
  } else {
    elements.subscribeBtn.textContent = '구독하기';
    elements.subscribeBtn.style.background = '#7c3aed';
    elements.subscribeBtn.onclick = subscribeToNewsletter;
  }
}

// 로그인 모달 표시
function showLoginModal() {
  // 기존 로그인 모달 열기
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('open');
  } else {
    showToast('로그인 후 구독하실 수 있습니다.', 'error');
  }
}

// 구독 폼 표시 (로그인된 사용자용)
function showSubscribeForm() {
  if (!currentUser) {
    showLoginModal();
    return;
  }
  
  subscribeToNewsletter();
}

// 뉴스레터 구독
async function subscribeToNewsletter() {
  if (!currentUser) {
    showLoginModal();
    return;
  }
  
  try {
    // 중복 구독 확인 (userId 기준)
    const q = query(
      collection(db, 'subscribers'),
      where('userId', '==', currentUser.uid)
    );
    const existingSubs = await getDocs(q);
    
    if (!existingSubs.empty) {
      // 기존 구독자 활성화
      const subDoc = existingSubs.docs[0];
      await updateDoc(doc(db, 'subscribers', subDoc.id), {
        active: true,
        subscribedAt: new Date(),
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL
      });
    } else {
      // 새 구독자 추가
      await addDoc(collection(db, 'subscribers'), {
        userId: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        active: true,
        subscribedAt: new Date()
      });
    }
    
    isSubscribed = true;
    updateSubscribeButton();
    showToast('뉴스레터 구독이 완료되었습니다!', 'success');
    
  } catch (error) {
    console.error('구독 실패:', error);
    showToast('구독에 실패했습니다. 다시 시도해주세요.', 'error');
  }
}

// 뉴스레터 구독 해제
async function unsubscribeFromNewsletter() {
  if (!currentUser?.uid) return;
  
  try {
    const q = query(
      collection(db, 'subscribers'),
      where('userId', '==', currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const subDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'subscribers', subDoc.id), {
        active: false,
        unsubscribedAt: new Date()
      });
    }
    
    isSubscribed = false;
    updateSubscribeButton();
    showToast('구독이 해제되었습니다.', 'info');
    
  } catch (error) {
    console.error('구독 해제 실패:', error);
    showToast('구독 해제에 실패했습니다.', 'error');
  }
}

// 뉴스레터 탭 활성화
function showNewsletterTab() {
  // 다른 섹션들 숨기기
  document.getElementById('lessonCard').style.display = 'none';
  document.querySelector('.navbar').style.display = 'none';
  
  // 뉴스레터 섹션 표시
  elements.newsletterSection.style.display = 'block';
  
  // 뉴스레터 로드
  loadNewsletters();
  checkSubscriptionStatus();
}

// 뉴스레터 탭 비활성화
function hideNewsletterTab() {
  elements.newsletterSection.style.display = 'none';
  elements.newsletterList.style.display = 'block';
  elements.newsletterContent.style.display = 'none';
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 뒤로가기 버튼
  elements.backToList?.addEventListener('click', backToList);
  
  // 구독 버튼
  elements.subscribeBtn?.addEventListener('click', showSubscribeForm);
}

// 전역 함수들 (HTML에서 호출)
window.showNewsletter = showNewsletter;
window.backToList = backToList;
window.subscribeToNewsletter = subscribeToNewsletter;
window.showLoginModal = showLoginModal;
window.showNewsletterTab = showNewsletterTab;
window.hideNewsletterTab = hideNewsletterTab;

// 초기화
function init() {
  setupEventListeners();
  
  // 인증 상태 감지
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      checkSubscriptionStatus();
    } else {
      isSubscribed = false;
      updateSubscribeButton();
    }
  });
}

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
