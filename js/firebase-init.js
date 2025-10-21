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
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("[firebase-init] 세션 퍼시스턴스 설정 완료"))
  .catch(err => console.error("[firebase-init] 세션 퍼시스턴스 설정 실패:", err));

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

// 디버그: 전역 signOut 호출 추적
const _signOut = auth.signOut.bind(auth);
auth.signOut = async (...args) => {
  console.warn("[auth] signOut called!", new Error().stack);
  return _signOut(...args);
};

// 전역 디버그 플래그(이전 코드가 참조하던 경우 대비)
window.__authReady = false;
authReady.then(() => { window.__authReady = true; });

// 디버그 로그 (필요하면 유지)
console.log("[firebase-init] loaded");
console.log("[firebase-init] Firebase config:", {
  apiKey: firebaseConfig.apiKey.substring(0, 10) + "...",
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});
