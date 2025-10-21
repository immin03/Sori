import { auth, provider, authReady } from "./firebase-init.js";
import { signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

let loggingIn = false;
let lastUserGestureAt = 0;

// 사용자 제스처 기록 (자동 실행 방지)
["pointerdown","keydown"].forEach(ev =>
  window.addEventListener(ev, () => { lastUserGestureAt = Date.now(); }, { capture:true })
);

// 1) 모달 열기 버튼(헤더)은 오직 모달 열기만 담당
function bindOpenButton() {
  const openBtn = document.querySelector("#openLogin, [data-open-login]");
  if (!openBtn || openBtn.dataset.wired) return;
  openBtn.dataset.wired = "1";
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("[auth] open login modal");
    
    // 모달 열기
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.add('open');
    }
  });
}

// 2) 구글 로그인 버튼(모달 내부)만 실제 로그인 수행
function bindGoogleButton() {
  const googleBtn = document.querySelector("#googleLogin, [data-google-login]");
  if (!googleBtn || googleBtn.dataset.wired) return;
  googleBtn.dataset.wired = "1";

  // 절대 textContent 같은 걸 임의로 건드리지 말 것 (존재 확인 전 조작 금지)
  googleBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // 최근 5초 내 사용자 제스처 없으면 실행 금지 (자동 리디렉션 방지)
    if (Date.now() - lastUserGestureAt > 5000) {
      console.warn("[auth] no recent user gesture; block auto login");
      return;
    }
    if (loggingIn) {
      console.log("[auth] 로그인 진행 중, 중복 클릭 무시");
      return;
    }
    loggingIn = true;

    try {
      await authReady;
      console.log("[auth] redirect login start");
      await signInWithRedirect(auth, provider);
    } catch (err) {
      console.error("[auth] redirect error", err);
      alert("Login failed: " + (err?.message || err));
    } finally {
      loggingIn = false;
    }
  });
}

// 3) 최초 바인딩은 DOMContentLoaded 후에
function safeBindAll() {
  bindOpenButton();
  bindGoogleButton();
}

// 4) 모달/동적 렌더도 잡기 위해 MutationObserver로 재바인딩 (자동 실행 방지)
let observerActive = false;
const mo = new MutationObserver(() => {
  if (observerActive) {
    safeBindAll();
  }
});

// DOM이 완전히 로드된 후에만 observer 활성화
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    observerActive = true;
    mo.observe(document.body, { childList: true, subtree: true });
  }, 500);
});

// 5) 초기 한 번 실행 (자동 실행 방지)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // 약간의 지연을 두어 자동 실행 방지
    setTimeout(safeBindAll, 100);
  });
} else {
  // 이미 로드된 경우에도 지연
  setTimeout(safeBindAll, 100);
}

// 6) 리디렉션 복귀 로그 (성공 시 사용자 표시)
getRedirectResult(auth)
  .then((res) => {
    if (res?.user) {
      console.log("[auth] redirect result user:", res.user.email);
      
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
    } else {
      console.log("[auth] redirect result: none (checking existing session)");
    }
  })
  .catch((e) => console.error("[auth] redirect result error", e));

// 기존 window 함수들도 유지 (호환성)
window.handleGoogleLogin = async function () {
  if (loggingIn) return;
  loggingIn = true;
  
  try {
    await authReady;
    console.log("[auth] handleGoogleLogin redirect start");
    await signInWithRedirect(auth, provider);
  } catch (e) {
    loggingIn = false;
    console.error("[auth] handleGoogleLogin error:", e);
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

console.log("[auth] loaded with safe binding");