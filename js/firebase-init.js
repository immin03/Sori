// Firebase v9 CDN 방식으로 변경
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

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

// 세션 유지 강제: 리디렉션 후에도 로그인 상태가 유지되도록
setPersistence(auth, browserLocalPersistence).catch(console.error);

// 팝업 차단 방지를 위한 추가 설정
provider.setCustomParameters({
  prompt: 'select_account'
});

// 준비 신호: onAuthStateChanged + 안전용 타임아웃 둘 다 사용
export const authReady = new Promise((resolve) => {
  let settled = false;
  onAuthStateChanged(auth, (u) => {
    console.log("[auth] state changed:", u ? `IN as ${u.email || u.uid}` : "OUT");
    if (!settled) { settled = true; resolve(); }
  });
  // 로딩 순서/확장프로그램 영향 시 안전망
  setTimeout(() => { if (!settled) resolve(); }, 1500);
});

// signOut 추적 제거

// 전역 디버그 플래그(이전 코드가 참조하던 경우 대비)
window.__authReady = false;
authReady.then(() => { window.__authReady = true; });

// Auth 준비 완료 이벤트 발생 (auth.js에서 처리)

// 디버그 로그 제거