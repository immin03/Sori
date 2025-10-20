// js/auth.js
console.log("Firebase Auth loaded");

// Firebase 설정 정보 (네 프로젝트 전용)
const firebaseConfig = {
  apiKey: "AIzaSyBzSINSq3wc_uglLODnzho-MSfqAACBlu4",
  authDomain: "sori-533fc.firebaseapp.com",
  projectId: "sori-533fc",
  storageBucket: "sori-533fc.appspot.com",
  messagingSenderId: "645509054375",
  appId: "1:645509054375:web:dddc1321e92c286e0cc082",
  measurementId: "G-JD752VQ54Z"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 로그인 버튼 클릭 시 실행될 함수
window.handleGoogleLogin = function () {
  console.log("Google login button clicked");
  
  if (!firebase || !firebase.auth) {
    console.error("Firebase not loaded");
    alert("Firebase가 로드되지 않았습니다. 페이지를 새로고침해주세요.");
    return;
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  
  // 팝업 차단 방지를 위한 추가 설정
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  auth.signInWithPopup(provider)
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
  auth.signOut()
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

// SoriUser 객체 생성 (app.js에서 사용)
window.SoriUser = {
  logout: window.handleLogout
};
