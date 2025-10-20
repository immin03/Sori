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

// 준비 신호: onAuthStateChanged + 안전용 타임아웃 둘 다 사용
export const authReady = new Promise((resolve) => {
  let done = false;
  onAuthStateChanged(auth, () => {
    if (!done) { done = true; resolve(); }
  });
  // 혹시 브라우저/확장프로그램 때문에 콜백이 지연되면 1.5초 후 강제 준비 완료
  setTimeout(() => { if (!done) resolve(); }, 1500);
});

// 디버그 로그 (필요하면 유지)
console.log("[firebase-init] loaded");
