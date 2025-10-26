/* js/state.js — auth + saved(glue) for app.js (Firestore savedList array) */
(function () {
  // --- Firebase (compat) ---
  const firebaseConfig = {
    apiKey: "AIzaSyBZsIN5q3wc_uglLODnzho-MSfqAACBlu4",
    authDomain: "sori-533fc.firebaseapp.com",
    projectId: "sori-533fc",
    storageBucket: "sori-533fc.firebasestorage.app",
    messagingSenderId: "645509054375",
    appId: "1:645509054375:web:dddc1321e92c286e0cc082",
    measurementId: "G-JD752VQ54Z"
  };

  let auth = null, db = null;
  try {
    if (typeof firebase !== "undefined") {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();
      // app.js에서 사용
      window.db = db;
    }
  } catch (e) {
    console.warn("Firebase init error:", e);
  }

  // --- 상단 Login/Logout 버튼 토글 ---
  const loginBtn = document.getElementById("loginBtn");
  function setLoginButton(user) {
    if (!loginBtn) return;
    if (user) {
      loginBtn.textContent = "Logout";
      loginBtn.classList.remove("primary");
    } else {
      loginBtn.textContent = "Login";
      loginBtn.classList.add("primary");
    }
  }

  // --- 로컬 저장 (게스트도 유지) ---
  const LOCAL_KEY = "soriSaved"; // app.js가 읽는 키
  const readLocal = () => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); }
    catch { return []; }
  };
  const writeLocal = (arr) => {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(arr || [])); } catch {}
  };

  // --- 클라우드 <-> 로컬 동기화 (배열 merge) ---
  async function pullSavedFromCloud(uid) {
    if (!db || !uid) return [];
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    return (snap.exists && Array.isArray(snap.data()?.savedList)) ? snap.data().savedList : [];
  }

  async function pushSavedToCloud(uid, list) {
    if (!db || !uid) return;
    const ref = db.collection("users").doc(uid);
    await ref.set({ savedList: list || [] }, { merge: true });
  }

  function mergeUnique(a = [], b = []) {
    return Array.from(new Set([...(a || []), ...(b || [])]));
  }

  // --- 공개 API (모달/헤더에서 사용) ---
  window.handleGoogleLogin = async function handleGoogleLogin() {
    if (!auth) return; // alert 제거됨
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
      document.getElementById("authModal")?.classList.add("hidden");
    } catch (e) {
      // alert 제거됨
    }
  };

  window.SoriUser = {
    async logout() {
      try { await auth?.signOut(); } catch (e) { console.warn(e); }
    }
  };

  // --- 학습 훅 (app.js가 호출) ---
  window.SoriState = {
    async onPracticeComplete(phraseId, xpGain = 5) {
      try {
        const u = auth?.currentUser;
        if (!u || !db) return;
        // 가벼운 메타만 기록 (필수 아님)
        await db.collection("users").doc(u.uid).set({
          lastPracticeAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn("onPracticeComplete error:", e);
      }
    }
  };

  // --- 인증 상태 변화 처리 ---
  auth?.onAuthStateChanged(async (user) => {
    setLoginButton(user);

    if (user) {
      // 1) 클라우드에서 가져오기
      const cloud = await pullSavedFromCloud(user.uid);
      // 2) 로컬과 머지
      const local = readLocal();
      const merged = mergeUnique(cloud, local);
      // 3) 클라우드/로컬 모두 갱신
      await pushSavedToCloud(user.uid, merged);
      writeLocal(merged);
    } else {
      // 로그아웃 시 로컬은 그대로 유지 (게스트에서도 Saved 탭 준비)
      // 필요하면 여기서 비워도 됨: writeLocal([])
    }

    // app.js가 Saved 탭/별 상태를 다시 그릴 수 있도록 이벤트 발행(선택)
    try { window.dispatchEvent(new CustomEvent("sori-auth-changed")); } catch {}
  });
})();
