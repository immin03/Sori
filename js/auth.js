import { auth, provider, authReady } from "./firebase-init.js";
import { signInWithRedirect, getRedirectResult } from "firebase/auth";

console.log("[auth] loaded");

const btn = document.getElementById("loginBtn"); // 실제 버튼 id와 일치해야 함
if (btn) btn.disabled = true;

// 준비되면 버튼 활성화
authReady.then(() => {
  if (btn) btn.disabled = false;
  console.log("[auth] ready");
});

// 로그인 시 팝업 대신 리디렉션 사용(모바일/팝업차단 안전)
btn?.addEventListener("click", async () => {
  try {
    await authReady; // 준비 전 실행 금지
    await signInWithRedirect(auth, provider);
  } catch (e) {
    alert("Login failed: " + e.message);
    console.error(e);
  }
});

// 리디렉션 복귀 처리(선택)
getRedirectResult(auth).then((res) => {
  if (res?.user) {
    console.log("[auth] signed in:", res.user.email);
    
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
}).catch(console.error);

// 기존 window 함수들도 유지 (호환성)
window.handleGoogleLogin = async function () {
  try {
    await authReady;
    await signInWithRedirect(auth, provider);
  } catch (e) {
    alert("Login failed: " + e.message);
    console.error(e);
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