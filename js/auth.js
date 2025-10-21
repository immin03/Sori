import { auth, provider, authReady } from "./firebase-init.js";
import { signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// 중복 클릭 방지 플래그
let loggingIn = false;

// 이벤트 위임: 문서 전체에서 [data-login] 또는 지정 클래스 클릭을 잡음
const LOGIN_SELECTOR = '[data-login], .js-login, #loginBtn, .google-login, #googleLoginBtn';

document.addEventListener("click", async (e) => {
  const trigger = e.target.closest(LOGIN_SELECTOR);
  if (!trigger) return;

  e.preventDefault();

  if (loggingIn) {
    console.log("[auth] 로그인 진행 중, 중복 클릭 무시");
    return;
  }
  
  loggingIn = true;

  try {
    await authReady;                         // 준비 보장
    console.log("[auth] redirect login start");
    await signInWithRedirect(auth, provider);
    // 여기서 페이지가 구글로 이동하므로 아래는 보통 실행되지 않음
  } catch (err) {
    loggingIn = false;
    console.error("[auth] redirect error", err);
    alert("Login failed: " + (err?.message || err));
  }
});

// 리디렉션 복귀 처리 + 상태 로깅
getRedirectResult(auth)
  .then((res) => {
    if (res?.user) {
      console.log("[auth] redirect result user:", res.user.email);
      
      // 성공 메시지 표시
      const toast = document.getElementById('congrats');
      if (toast) {
        toast.textContent = `환영합니다, ${res.user.displayName}님!`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      }
      
      // 모달 닫기
      const modal = document.getElementById('authModal');
      if (modal) {
        modal.classList.remove('open');
      }
    } else {
      console.log("[auth] redirect result: none (checking existing session)");
    }
  })
  .catch((e) => console.error("[auth] redirect result error", e));

// 기존 window 함수들도 유지 (호환성)
window.handleGoogleLogin = async function () {
  if (loggingIn) return;
  loggingIn = true;
  
  try {
    await authReady;
    console.log("[auth] handleGoogleLogin redirect start");
    await signInWithRedirect(auth, provider);
  } catch (e) {
    loggingIn = false;
    console.error("[auth] handleGoogleLogin error:", e);
    alert("로그인 실패: " + e.message);
  }
};

window.handleLogout = async function () {
  try {
    await authReady;
    await auth.signOut();
    console.log("✅ 로그아웃 성공");
    
    // 성공 메시지 표시
    const toast = document.getElementById('congrats');
    if (toast) {
      toast.textContent = "로그아웃 완료!";
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }
  } catch (error) {
    console.error("❌ 로그아웃 실패:", error.message);
    alert("로그아웃 중 오류가 발생했습니다: " + error.message);
  }
};

// SoriUser 객체 생성 (app.js에서 사용)
window.SoriUser = {
  logout: window.handleLogout
};

// Auth 준비 완료 이벤트 발생
authReady.then(() => {
  // index.html에서 사용하는 window.firebaseAuth 노출
  window.firebaseAuth = auth;
  window.dispatchEvent(new CustomEvent('firebaseReady'));
});

console.log("[auth] loaded with event delegation");