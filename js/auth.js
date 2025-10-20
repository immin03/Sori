// js/auth.js
console.log("Firebase Auth loaded");

// Firebase SDK import
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase 앱과 인증 객체 가져오기
const auth = getAuth(window.firebaseApp);
const provider = new GoogleAuthProvider();

// 팝업 차단 방지를 위한 추가 설정
provider.setCustomParameters({
  prompt: 'select_account'
});

// 로그인 버튼 클릭 시 실행될 함수
window.handleGoogleLogin = function () {
  console.log("Google login button clicked");
  
  signInWithPopup(auth, provider)
    .then((result) => {
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
    })
    .catch((error) => {
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
    });
};

// 로그아웃 함수
window.handleLogout = function () {
  signOut(auth)
    .then(() => {
      console.log("✅ 로그아웃 성공");
      
      // 성공 메시지 표시
      const toast = document.getElementById('congrats');
      if (toast) {
        toast.textContent = "로그아웃 완료!";
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      }
    })
    .catch((error) => {
      console.error("❌ 로그아웃 실패:", error.message);
      alert("로그아웃 중 오류가 발생했습니다: " + error.message);
    });
};

// 인증 상태 변경 감지
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("사용자 로그인됨:", user.displayName);
  } else {
    console.log("사용자 로그아웃됨");
  }
});

// SoriUser 객체 생성 (app.js에서 사용)
window.SoriUser = {
  logout: window.handleLogout
};
