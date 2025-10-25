// 관리자 페이지 JavaScript
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { sendNewsletterEmail, createEmailTemplate } from "./email-service.js";

// 관리자 이메일 목록 (실제 운영 시에는 환경변수나 설정 파일에서 관리)
const ADMIN_EMAILS = [
  "immin03@gmail.com", // 관리자 이메일
  "sorikorea@gmail.com" // 예시 이메일
];

let currentUser = null;
let newsletters = [];
let subscribers = [];
let editor = null;

// DOM 요소들
const $ = (id) => document.getElementById(id);
const elements = {
  loginRequired: $("loginRequired"),
  adminPanel: $("adminPanel"),
  userEmail: $("userEmail"),
  logoutBtn: $("logoutBtn"),
  loginBtn: $("loginBtn"),
  newsletterForm: $("newsletterForm"),
  newsletterList: $("newsletterList"),
  subscribersList: $("subscribersList"),
  alertContainer: $("alertContainer")
};

// 유틸리티 함수들
function showAlert(message, type = 'error') {
  const alert = document.createElement('div');
  alert.className = `alert ${type}`;
  alert.textContent = message;
  elements.alertContainer.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

function formatDate(timestamp) {
  if (!timestamp) return '날짜 없음';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 관리자 권한 체크
function isAdmin(user) {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email);
}

// 인증 상태 관리
function updateAuthUI(user) {
  currentUser = user;
  
  if (!user) {
    elements.loginRequired.classList.remove('hidden');
    elements.adminPanel.classList.add('hidden');
    return;
  }
  
  if (!isAdmin(user)) {
    elements.loginRequired.classList.remove('hidden');
    elements.adminPanel.classList.add('hidden');
    elements.userEmail.textContent = user.email;
    showAlert('관리자 권한이 없습니다. 관리자에게 문의하세요.', 'error');
    return;
  }
  
  elements.loginRequired.classList.add('hidden');
  elements.adminPanel.classList.remove('hidden');
  elements.userEmail.textContent = user.email;
  
  // 데이터 로드
  loadNewsletters();
  loadSubscribers();
}

// 로그인 처리
async function handleLogin() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log('로그인 성공:', result.user.email);
  } catch (error) {
    console.error('로그인 실패:', error);
    showAlert('로그인에 실패했습니다: ' + error.message);
  }
}

// 로그아웃 처리
async function handleLogout() {
  try {
    await signOut(auth);
    console.log('로그아웃 완료');
  } catch (error) {
    console.error('로그아웃 실패:', error);
    showAlert('로그아웃에 실패했습니다: ' + error.message);
  }
}

// 뉴스레터 저장
async function saveNewsletter(formData) {
  try {
    const newsletterData = {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      status: 'draft',
      createdAt: new Date(),
      createdBy: currentUser.uid,
      authorEmail: currentUser.email,
      sendEmail: formData.sendEmail || false
    };
    
    const docRef = await addDoc(collection(db, 'newsletters'), newsletterData);
    console.log('뉴스레터 저장 완료:', docRef.id);
    
    showAlert('뉴스레터가 저장되었습니다.', 'success');
    loadNewsletters();
    
    // 폼 초기화
    elements.newsletterForm.reset();
    
  } catch (error) {
    console.error('뉴스레터 저장 실패:', error);
    showAlert('뉴스레터 저장에 실패했습니다: ' + error.message);
  }
}

// 뉴스레터 목록 로드
async function loadNewsletters() {
  try {
    const q = query(collection(db, 'newsletters'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    newsletters = [];
    querySnapshot.forEach((doc) => {
      newsletters.push({ id: doc.id, ...doc.data() });
    });
    
    renderNewsletterList();
  } catch (error) {
    console.error('뉴스레터 로드 실패:', error);
    showAlert('뉴스레터 목록을 불러오는데 실패했습니다: ' + error.message);
  }
}

// 뉴스레터 목록 렌더링
function renderNewsletterList() {
  if (!newsletters.length) {
    elements.newsletterList.innerHTML = '<p>저장된 뉴스레터가 없습니다.</p>';
    return;
  }
  
  const html = newsletters.map(newsletter => `
    <div class="newsletter-item">
      <h3>${newsletter.title}</h3>
      <div class="meta">
        <span class="status ${newsletter.status}">${newsletter.status}</span>
        <span> • ${formatDate(newsletter.createdAt)}</span>
        <span> • ${newsletter.authorEmail}</span>
      </div>
      <div class="content">${newsletter.content.substring(0, 150)}${newsletter.content.length > 150 ? '...' : ''}</div>
      <div class="actions">
        <button class="btn btn-primary" onclick="editNewsletter('${newsletter.id}')">편집</button>
        <button class="btn btn-secondary" onclick="previewNewsletter('${newsletter.id}')">미리보기</button>
        <button class="btn btn-secondary" onclick="previewEmailTemplate('${newsletter.id}')">이메일 미리보기</button>
        ${newsletter.status === 'draft' ? 
          `<button class="btn btn-primary" onclick="publishNewsletter('${newsletter.id}')">발행</button>` : 
          ''
        }
        <button class="btn btn-danger" onclick="deleteNewsletter('${newsletter.id}')">삭제</button>
      </div>
    </div>
  `).join('');
  
  elements.newsletterList.innerHTML = html;
}

// 구독자 목록 로드
async function loadSubscribers() {
  try {
    const q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    subscribers = [];
    querySnapshot.forEach((doc) => {
      subscribers.push({ id: doc.id, ...doc.data() });
    });
    
    renderSubscribersList();
  } catch (error) {
    console.error('구독자 로드 실패:', error);
    showAlert('구독자 목록을 불러오는데 실패했습니다: ' + error.message);
  }
}

// 구독자 목록 렌더링
function renderSubscribersList() {
  // 통계 업데이트
  updateSubscriberStats();
  
  if (!subscribers.length) {
    elements.subscribersList.innerHTML = '<p>구독자가 없습니다.</p>';
    return;
  }
  
  const html = subscribers.map(subscriber => `
    <div class="newsletter-item">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        ${subscriber.photoURL ? 
          `<img src="${subscriber.photoURL}" alt="프로필" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` : 
          '<div style="width: 40px; height: 40px; border-radius: 50%; background: #7c3aed; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">' + (subscriber.displayName?.charAt(0) || subscriber.email?.charAt(0) || '?') + '</div>'
        }
        <div>
          <h3 style="margin: 0; font-size: 16px;">${subscriber.displayName || '이름 없음'}</h3>
          <div style="color: #6b7280; font-size: 14px;">${subscriber.email}</div>
        </div>
      </div>
      <div class="meta">
        <span>구독일: ${formatDate(subscriber.subscribedAt)}</span>
        <span class="status ${subscriber.active ? 'published' : 'draft'}">${subscriber.active ? '활성' : '비활성'}</span>
      </div>
      <div class="actions">
        <button class="btn btn-danger" onclick="unsubscribeUser('${subscriber.id}')">구독 해제</button>
      </div>
    </div>
  `).join('');
  
  elements.subscribersList.innerHTML = html;
}

// 구독자 통계 업데이트
function updateSubscriberStats() {
  const total = subscribers.length;
  const active = subscribers.filter(s => s.active).length;
  const inactive = total - active;
  
  $('totalSubscribers').textContent = total;
  $('activeSubscribers').textContent = active;
  $('inactiveSubscribers').textContent = inactive;
}

// 뉴스레터 편집
async function editNewsletter(id) {
  const newsletter = newsletters.find(n => n.id === id);
  if (!newsletter) return;
  
  // 폼에 데이터 채우기
  $('newsletterTitle').value = newsletter.title;
  $('newsletterType').value = newsletter.type;
  $('sendEmail').checked = newsletter.sendEmail || false;
  
  // 에디터에 내용 설정
  if (editor) {
    editor.setContent(newsletter.content || '');
  } else {
    $('newsletterContent').value = newsletter.content;
  }
  
  // 작성 탭으로 이동
  document.querySelector('[data-tab="create"]').click();
  
  // 편집 모드 표시
  const submitBtn = elements.newsletterForm.querySelector('button[type="submit"]');
  submitBtn.textContent = '뉴스레터 업데이트';
  submitBtn.dataset.editId = id;
}

// 뉴스레터 발행
async function publishNewsletter(id) {
  try {
    const newsletterRef = doc(db, 'newsletters', id);
    const newsletter = newsletters.find(n => n.id === id);
    
    if (!newsletter) {
      showAlert('뉴스레터를 찾을 수 없습니다.', 'error');
      return;
    }
    
    // 발행 상태로 업데이트
    await updateDoc(newsletterRef, {
      status: 'published',
      publishedAt: new Date()
    });
    
    // 이메일 발송이 활성화된 경우
    if (newsletter.sendEmail) {
      try {
        showAlert('뉴스레터를 발행하고 이메일을 발송하고 있습니다...', 'info');
        const result = await sendNewsletterEmail(id, newsletter);
        showAlert(`뉴스레터가 발행되었습니다. ${result.sentCount}명에게 이메일이 발송되었습니다.`, 'success');
      } catch (emailError) {
        console.error('이메일 발송 실패:', emailError);
        showAlert('뉴스레터는 발행되었지만 이메일 발송에 실패했습니다: ' + emailError.message, 'error');
      }
    } else {
      showAlert('뉴스레터가 발행되었습니다.', 'success');
    }
    
    loadNewsletters();
  } catch (error) {
    console.error('뉴스레터 발행 실패:', error);
    showAlert('뉴스레터 발행에 실패했습니다: ' + error.message);
  }
}

// 뉴스레터 삭제
async function deleteNewsletter(id) {
  if (!confirm('정말로 이 뉴스레터를 삭제하시겠습니까?')) return;
  
  try {
    await deleteDoc(doc(db, 'newsletters', id));
    showAlert('뉴스레터가 삭제되었습니다.', 'success');
    loadNewsletters();
  } catch (error) {
    console.error('뉴스레터 삭제 실패:', error);
    showAlert('뉴스레터 삭제에 실패했습니다: ' + error.message);
  }
}

// 뉴스레터 미리보기
function previewNewsletter(id) {
  const newsletter = newsletters.find(n => n.id === id);
  if (!newsletter) return;
  
  const previewWindow = window.open('', '_blank', 'width=800,height=600');
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${newsletter.title}</title>
      <style>
        body { font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #7c3aed; }
        .meta { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
        .content { white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <h1>${newsletter.title}</h1>
      <div class="meta">${formatDate(newsletter.createdAt)} • ${newsletter.type}</div>
      <div class="content">${newsletter.content}</div>
    </body>
    </html>
  `);
}

// 이메일 템플릿 미리보기
function previewEmailTemplate(id) {
  const newsletter = newsletters.find(n => n.id === id);
  if (!newsletter) return;
  
  const emailTemplate = createEmailTemplate(newsletter);
  const previewWindow = window.open('', '_blank', 'width=800,height=600');
  previewWindow.document.write(emailTemplate);
}

// 구독 해제
async function unsubscribeUser(id) {
  if (!confirm('정말로 이 사용자의 구독을 해제하시겠습니까?')) return;
  
  try {
    await updateDoc(doc(db, 'subscribers', id), {
      active: false,
      unsubscribedAt: new Date()
    });
    
    showAlert('구독이 해제되었습니다.', 'success');
    loadSubscribers();
  } catch (error) {
    console.error('구독 해제 실패:', error);
    showAlert('구독 해제에 실패했습니다: ' + error.message);
  }
}

// 탭 전환
function switchTab(tabName) {
  // 모든 탭 비활성화
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  // 선택된 탭 활성화
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}Tab`).classList.add('active');
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 로그인/로그아웃
  elements.loginBtn?.addEventListener('click', handleLogin);
  elements.logoutBtn?.addEventListener('click', handleLogout);
  
  // 폼 제출
  elements.newsletterForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 에디터 내용 가져오기
    let content = '';
    if (editor) {
      content = editor.getContent();
    } else {
      content = $('newsletterContent').value;
    }
    
    const formData = {
      title: $('newsletterTitle').value,
      content: content,
      type: $('newsletterType').value,
      sendEmail: $('sendEmail').checked
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const editId = submitBtn.dataset.editId;
    
    if (editId) {
      // 편집 모드
      try {
        await updateDoc(doc(db, 'newsletters', editId), {
          ...formData,
          updatedAt: new Date()
        });
        showAlert('뉴스레터가 업데이트되었습니다.', 'success');
        loadNewsletters();
        
        // 편집 모드 해제
        submitBtn.textContent = '뉴스레터 저장';
        delete submitBtn.dataset.editId;
        elements.newsletterForm.reset();
      } catch (error) {
        console.error('뉴스레터 업데이트 실패:', error);
        showAlert('뉴스레터 업데이트에 실패했습니다: ' + error.message);
      }
    } else {
      // 새로 작성
      await saveNewsletter(formData);
    }
  });
  
  // 탭 전환
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });
  
  // 구독자 새로고침
  $('refreshSubscribers')?.addEventListener('click', loadSubscribers);
  
  // 미리보기 버튼
  $('previewBtn')?.addEventListener('click', () => {
    const title = $('newsletterTitle').value;
    const type = $('newsletterType').value;
    
    // 에디터 내용 가져오기
    let content = '';
    if (editor) {
      content = editor.getContent();
    } else {
      content = $('newsletterContent').value;
    }
    
    if (!title || !content) {
      showAlert('제목과 내용을 입력해주세요.');
      return;
    }
    
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; }
          h1 { color: #7c3aed; }
          .meta { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
          .content { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">${new Date().toLocaleDateString('ko-KR')} • ${type}</div>
        <div class="content">${content}</div>
      </body>
      </html>
    `);
  });
}

// 전역 함수들 (HTML에서 호출)
window.editNewsletter = editNewsletter;
window.previewNewsletter = previewNewsletter;
window.previewEmailTemplate = previewEmailTemplate;
window.publishNewsletter = publishNewsletter;
window.deleteNewsletter = deleteNewsletter;
window.unsubscribeUser = unsubscribeUser;

// TinyMCE 에디터 초기화
function initEditor() {
  if (typeof tinymce === 'undefined') {
    console.error('TinyMCE가 로드되지 않았습니다.');
    return;
  }
  
  tinymce.init({
    selector: '#newsletterEditor',
    height: 400,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_style: 'body { font-family: "Noto Sans KR", Arial, sans-serif; font-size: 14px; }',
    setup: function (ed) {
      editor = ed;
      ed.on('change', function () {
        // 에디터 내용이 변경될 때마다 textarea에 동기화
        document.getElementById('newsletterContent').value = ed.getContent();
      });
    }
  });
}

// 초기화
function init() {
  setupEventListeners();
  
  // TinyMCE 에디터 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditor);
  } else {
    initEditor();
  }
  
  // 인증 상태 감지
  onAuthStateChanged(auth, (user) => {
    updateAuthUI(user);
  });
}

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
