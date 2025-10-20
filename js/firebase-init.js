import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZsIN5q3wc_uglLODnzho-MSfqAACBlu4",
  authDomain: "sori-533fc.firebaseapp.com",
  projectId: "sori-533fc",
  storageBucket: "sori-533fc.firebasestorage.app",
  messagingSenderId: "645509054375",
  appId: "1:645509054375:web:dddc1321e92c286e0cc082",
  measurementId: "G-JD752VQ54Z"
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// 팝업 차단 방지를 위한 추가 설정
provider.setCustomParameters({
  prompt: 'select_account'
});

// Auth 준비 완료 신호
export const authReady = new Promise((resolve) => {
  onAuthStateChanged(auth, () => resolve());
});

console.log("Firebase 초기화 완료 (v9 모듈)");
