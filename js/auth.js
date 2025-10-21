import { auth, provider, authReady } from "./firebase-init.js";
import { signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

console.log("[auth] loaded");

// 로그인 버튼 선택 (더 안전한 방식)
const btn = document.getElementById("loginBtn") || document.querySelector('[data-role="login"]') || document.querySelector('#loginBtn');
if (btn) btn.disabled = true;

// 준비되면 버튼 활성화
authReady.then(() => {
  if (btn) btn.disabled = false;
  console.log("[auth] ready");
});

// 리디렉션 로그인만 사용
let inFlight = false;
btn?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (inFlight) return;
  inFlight = true;
  try {
    await authReady;
    console.log("[auth] redirect login start");
    await signInWithRedirect(auth, provider);
  } catch (e) {
    console.error("[auth] redirect error", e);
    alert("Login failed: " + e.message);
  } finally {
    inFlight = false;
  }
});

// 복귀 처리: 성공 시 UI 고정, 실패만 알림
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
    }
  })
  .catch((e) => console.error("[auth] redirect result error", e));

// 기존 window 함수들도 유지 (호환성)
window.handleGoogleLogin = async function () {
  try {
    await authReady;
    console.log("[auth] handleGoogleLogin 리디렉션 시작");
    await signInWithRedirect(auth, provider);
  } catch (e) {
    console.error("[auth] handleGoogleLogin 실패:", e);
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