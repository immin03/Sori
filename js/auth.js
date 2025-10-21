import { auth, provider, authReady } from "./firebase-init.js";
import { signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

let loggingIn = false;

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

// 인증 상태 변경 감지 (UI 업데이트만, 자동 로그인 없음)
auth.onAuthStateChanged((user) => {
  // UI만 업데이트하고 자동으로 모달을 열거나 로그인을 시도하지 않음
  updateUI(!!user, user);
});

// 전역 함수들 - redirect만 사용, popup 제거
window.SoriUser = {
  logout: async () => {
    try {
      console.log("[auth] SoriUser.logout 호출됨");
      await auth.signOut();
      console.log("[auth] auth.signOut() 완료");
    } catch (err) {
      console.error("[auth] logout 에러:", err);
      throw err;
    }
  },
  isLoggedIn: () => !!auth.currentUser,
  getCurrentUser: () => auth.currentUser,
  // loginRedirect: 무조건 리디렉션만 사용 (COOP 경고 제거)
  loginRedirect: async () => {
    if (loggingIn) return;
    loggingIn = true;
    try {
      await authReady;
      console.log("[auth] 리디렉션 로그인 시작");
      await signInWithRedirect(auth, provider);
      // 리디렉션은 페이지를 이동시키므로 여기까지 도달하지 않음
    } catch (err) {
      console.error("[auth] 로그인 실패:", err.message);
      loggingIn = false;
      throw err; // 에러를 다시 던져서 호출자에게 알림
    }
  },
  // login: loginRedirect와 동일하게 리디렉션만 사용
  login: async () => {
    if (loggingIn) return;
    loggingIn = true;
    try {
      await authReady;
      console.log("[auth] 로그인 시작");
      await signInWithRedirect(auth, provider);
      // 리디렉션은 페이지를 이동시키므로 여기까지 도달하지 않음
    } catch (err) {
      console.error("[auth] 로그인 실패:", err.message);
      loggingIn = false;
      throw err; // 에러를 다시 던져서 호출자에게 알림
    }
  },
  onAuth: (callback) => {
    auth.onAuthStateChanged(callback);
  }
};

// Auth 준비 완료 이벤트 발생
authReady.then(() => {
  window.firebaseAuth = auth;
  window.dispatchEvent(new CustomEvent('firebaseReady'));
  
  // 리디렉션 결과 처리 (페이지 로드 시 한 번만)
  getRedirectResult(auth)
    .then((result) => {
      loggingIn = false;
      if (result && result.user) {
        console.log("[auth] 리디렉션 로그인 성공:", result.user.email);
        updateUI(true, result.user);
      }
    })
    .catch((err) => {
      loggingIn = false;
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error("[auth] 리디렉션 결과 처리 실패:", err.message);
      }
    });
});
