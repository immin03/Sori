import { auth, provider, authReady } from "./firebase-init.js";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

let loggingIn = false;

// 모달 열기 버튼
function bindOpenButton() {
  const openBtn = document.getElementById("openLogin");
  if (!openBtn || openBtn.dataset.wired) return;
  openBtn.dataset.wired = "1";
  
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('open');
  });
}

// 구글 로그인 버튼
function bindGoogleButton() {
  const googleBtn = document.getElementById("googleLogin");
  if (!googleBtn || googleBtn.dataset.wired) return;
  googleBtn.dataset.wired = "1";

  googleBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (loggingIn) return;
    loggingIn = true;

    try {
      await authReady;
      // 팝업 시도
      try {
        const result = await signInWithPopup(auth, provider);
        updateUI(true, result.user);
        
      } catch (popupError) {
        // 팝업 차단 시 리디렉션
        if (popupError.code === "auth/popup-blocked") {
          await signInWithRedirect(auth, provider);
        } else {
          throw popupError;
        }
      }
    } catch (err) {
      console.error("[auth] 로그인 실패:", err.message);
      alert("로그인 실패: " + err.message);
    } finally {
      loggingIn = false;
    }
  });
}

// UI 업데이트 함수
function updateUI(isLoggedIn, user = null) {
  const loginBtn = document.getElementById('openLogin');
  if (!loginBtn) return;

  if (isLoggedIn && user) {
    loginBtn.textContent = 'Logout';
    loginBtn.onclick = async () => {
      try {
        await auth.signOut();
        updateUI(false);
        console.log("[auth] 로그아웃 완료");
      } catch (e) {
        console.error("[auth] 로그아웃 실패:", e);
      }
    };
    
    // 모달 닫기
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('open');
    
    // 성공 메시지
    const toast = document.getElementById('congrats');
    if (toast) {
      toast.textContent = `환영합니다, ${user.displayName}님!`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  } else {
    loginBtn.textContent = 'Login';
    loginBtn.onclick = () => {
      const modal = document.getElementById('authModal');
      if (modal) modal.classList.add('open');
    };
  }
}

// 리디렉션 결과 처리 (사용자 액션 시에만)
// getRedirectResult는 Google 로그인 버튼 클릭 시에만 호출

// 인증 상태 변경 감지 (UI 업데이트만, 자동 로그인 없음)
auth.onAuthStateChanged((user) => {
  // UI만 업데이트하고 자동으로 모달을 열거나 로그인을 시도하지 않음
  updateUI(!!user, user);
});

// 버튼 바인딩
function init() {
  bindOpenButton();
  bindGoogleButton();
}

// 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// 전역 함수들
window.SoriUser = {
  logout: () => auth.signOut(),
  isLoggedIn: () => !!auth.currentUser,
  getCurrentUser: () => auth.currentUser,
  user: auth.currentUser,
  loginWithPopup: async () => {
    const result = await signInWithPopup(auth, provider);
    return result;
  },
  login: async () => {
    // 팝업 시도 후 차단되면 리디렉션
    try {
      return await signInWithPopup(auth, provider);
    } catch (e) {
      if (e.code === "auth/popup-blocked") {
        return await signInWithRedirect(auth, provider);
      }
      throw e;
    }
  },
  onAuth: (callback) => {
    auth.onAuthStateChanged(callback);
  }
};

// 로드 완료