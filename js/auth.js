import { auth, provider, authReady } from "./firebase-init.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

console.log("Firebase Auth 모듈 로드됨");

// 로그인 버튼 클릭 시 실행될 함수
window.handleGoogleLogin = async function () {
  console.log("Google login button clicked");
  
  try {
    await authReady; // Auth 준비 완료까지 대기
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log("✅ 로그인 성공:", user.displayName);

    // 성공 메시지 표시
    const toast = document.getElementById('congrats');
    if (toast) {
      toast.textContent = `환영합니다, ${user.displayName}님!`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
    
    // 모달 닫기
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.remove('open');
    }
    
  } catch (error) {
    console.error("❌ 로그인 실패:", error);
    
    let errorMessage = "로그인 중 오류가 발생했습니다.";
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "로그인이 취소되었습니다.";
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = "팝업이 차단되었습니다. 팝업을 허용해주세요.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(errorMessage);
  }
};

// 로그아웃 함수
window.handleLogout = async function () {
  try {
    await authReady; // Auth 준비 완료까지 대기
    await signOut(auth);
    
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

// 인증 상태 변경 감지
authReady.then(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("사용자 로그인됨:", user.displayName);
    } else {
      console.log("사용자 로그아웃됨");
    }
  });
});

// SoriUser 객체 생성 (app.js에서 사용)
window.SoriUser = {
  logout: window.handleLogout
};

// Auth 준비 완료 이벤트 발생
authReady.then(() => {
  window.dispatchEvent(new CustomEvent('firebaseReady'));
});