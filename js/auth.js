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
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("✅ 로그인 성공:", user.displayName);

      alert(`환영합니다, ${user.displayName}님!`);
      document.body.insertAdjacentHTML(
        "beforeend",
        `<div style="position:fixed;top:20px;right:20px;background:#7c3aed;color:white;padding:10px 15px;border-radius:10px;font-weight:600;z-index:9999;">
          로그인 완료 (${user.displayName})
        </div>`
      );
    })
    .catch((error) => {
      console.error("❌ 로그인 실패:", error.message);
      alert("로그인 중 오류가 발생했습니다: " + error.message);
    });
};

// 로그아웃 함수
window.handleLogout = function () {
  auth.signOut()
    .then(() => {
      alert("로그아웃 완료!");
      console.log("✅ 로그아웃 성공");
    })
    .catch((error) => {
      console.error("❌ 로그아웃 실패:", error.message);
    });
};
