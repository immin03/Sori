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

// 리디렉션 방식 로그인
btn?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await authReady; // 반드시 준비 보장
    console.log("[auth] 리디렉션 로그인 시작");
    await signInWithRedirect(auth, provider);
  } catch (e) {
    console.error("[auth] 리디렉션 로그인 실패:", e);
    alert("로그인 실패: " + e.message);
  }
});

// 리디렉션 복귀 처리 개선
authReady.then(async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log("[auth] 리디렉션 로그인 성공:", result.user.email);
      
      // 성공 메시지 표시
      const toast = document.getElementById('congrats');
      if (toast) {
        toast.textContent = `환영합니다, ${result.user.displayName}님!`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      }
      
      // 모달 닫기
      const modal = document.getElementById('authModal');
      if (modal) {
        modal.classList.remove('open');
      }
    } else {
      console.log("[auth] 리디렉션 결과 없음 - 기존 세션 확인 중...");
    }
  } catch (error) {
    console.error("[auth] 리디렉션 처리 오류:", error);
  }
});

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