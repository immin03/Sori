/* js/state.js
   Firebase 10.x compat SDK 기반
   - 로그인/로그아웃
   - 프로필/진행도 저장
   - 스크랩 클라우드 동기화 (Firestore + localStorage)
*/

(function () {
  // === Firebase 설정 ===
  const firebaseConfig = {
    apiKey: "AIzaSyBZsIN5q3wc_uglLODnzho-MSfqAACBlu4",
    authDomain: "sori-533fc.firebaseapp.com",
    projectId: "sori-533fc",
    storageBucket: "sori-533fc.firebasestorage.app",
    messagingSenderId: "645509054375",
    appId: "1:645509054375:web:dddc1321e92c286e0cc082",
    measurementId: "G-JD752VQ54Z"
  };

  let auth = null, db = null, currentUser = null;
  const SCRAP_KEY = 'sori_scraps_v1';

  const userState = {
    uid: null, name: null, email: null, photoURL: null,
    level: 1, xp: 0, totalDays: 0, streak: 0, lastVisit: null,
    practiceCount: {},
    scraps: [] // 클라우드 보관용
  };

  // === Firebase 초기화 ===
  try {
    if (typeof firebase !== "undefined") {
      firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();
      console.log("✅ Firebase initialized");
    } else {
      console.error("❌ Firebase SDK not found (check script order)");
    }
  } catch (e) {
    console.error("❌ Firebase init error:", e);
  }

  // === 유틸 ===
  function calcLevel(xp) {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    if (xp < 1500) return 5;
    return Math.floor(xp / 300) + 1;
  }

  const getLocalScraps = () => {
    try { return JSON.parse(localStorage.getItem(SCRAP_KEY) || '[]'); }
    catch { return []; }
  };
  const setLocalScraps = (arr) => {
    try { localStorage.setItem(SCRAP_KEY, JSON.stringify(arr)); } catch {}
  };

  function refreshLoginButtonUI() {
    const btn = document.getElementById('loginBtn');
    if (!btn) return;
    const isIn = !!currentUser;
    btn.textContent = isIn ? 'Logout' : 'Login';
    // 보라색은 로그인 전(유도), 로그인 후엔 회색 버튼 느낌
    if (isIn) btn.classList.remove('primary'); else btn.classList.add('primary');
  }

  // === 사용자 데이터 로드/저장 ===
  async function loadUserData() {
    if (!db || !currentUser) return;
    const ref = db.collection("users").doc(currentUser.uid);
    const snap = await ref.get();
    if (snap.exists) {
      const data = snap.data();
      Object.assign(userState, {
        level: 1, xp: 0, totalDays: 0, streak: 0, lastVisit: null,
        practiceCount: {}, scraps: [], ...data
      });
    } else {
      Object.assign(userState, {
        uid: currentUser.uid,
        name: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        lastVisit: new Date().toDateString(),
        totalDays: 1,
        streak: 1,
        xp: 10,
        level: 1,
        practiceCount: {},
        scraps: getLocalScraps()
      });
      await ref.set(userState, { merge: true });
    }
    console.log("✅ User data loaded");
  }

  async function savePractice(phraseId, incXp) {
    if (!db || !currentUser) return;
    const ref = db.collection("users").doc(currentUser.uid);
    userState.practiceCount[phraseId] = (userState.practiceCount[phraseId] || 0) + incXp;
    userState.xp += incXp;
    userState.level = calcLevel(userState.xp);
    await ref.set({
      practiceCount: userState.practiceCount,
      xp: userState.xp,
      level: userState.level
    }, { merge: true });
  }

  // 스크랩 병합/동기화 (로그인 시 호출)
  async function syncScrapsWithCloud() {
    const local = new Set(getLocalScraps());
    const cloudArr = Array.isArray(userState.scraps) ? userState.scraps : [];
    cloudArr.forEach(s => local.add(s));
    const merged = Array.from(local);
    setLocalScraps(merged);
    userState.scraps = merged;
    try {
      if (db && currentUser) {
        await db.collection('users').doc(currentUser.uid).set({ scraps: merged }, { merge: true });
      }
    } catch (e) {
      console.warn('scrap sync failed (non-fatal):', e);
    }
  }

  // === 전역: 로그인 / 로그아웃 ===
  window.handleGoogleLogin = function handleGoogleLogin() {
    if (!auth) {
      alert("Firebase Auth not initialized. Check SDK order.");
      return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(async (res) => {
        currentUser = res.user;
        document.getElementById("authModal")?.classList.add("hidden");
        await loadUserData();
        await syncScrapsWithCloud();
        refreshLoginButtonUI();
        alert("✅ Logged in as " + (currentUser.displayName || "user"));
      })
      .catch((err) => {
        alert("❌ Login failed: " + err.message);
      });
  };

  // My 버튼에서 쓰일 수도 있으니 유지
  window.handleMyButton = function handleMyButton() {
    if (!currentUser) {
      alert("⚠️ Please login first!");
      document.getElementById("authModal")?.classList.remove("hidden");
      return;
    }
    alert(
      `👤 Profile\n` +
      `Name: ${userState.name || currentUser.displayName}\n` +
      `Email: ${userState.email || currentUser.email}\n` +
      `Level: ${userState.level}\n` +
      `XP: ${userState.xp}\n` +
      `Streak: ${userState.streak} days`
    );
  };

  // === 인증 상태 변화 ===
  if (auth) {
    auth.onAuthStateChanged(async (user) => {
      currentUser = user || null;
      if (currentUser) {
        console.log("👋 Logged in:", currentUser.email);
        await loadUserData();
        await syncScrapsWithCloud();
      } else {
        console.log("🚪 Logged out");
      }
      refreshLoginButtonUI();
    });
  }

  // === 외부에서 사용할 유저 헬퍼 (app.js에서 사용) ===
  window.SoriUser = {
    isLoggedIn: () => !!currentUser,
    logout: async () => {
      try {
        if (auth) await auth.signOut();
      } catch (e) {
        console.error('Logout error:', e);
      } finally {
        refreshLoginButtonUI();
        // 로그인 모달은 닫힌 상태 유지
      }
    },
    getScraps: async () => {
      // 로그인 상태면 클라우드 우선, 실패 시 로컬
      if (db && currentUser) {
        try {
          const snap = await db.collection('users').doc(currentUser.uid).get();
          const arr = (snap.exists && Array.isArray(snap.data().scraps)) ? snap.data().scraps : [];
          setLocalScraps(arr);
          return arr;
        } catch (e) { console.warn(e); }
      }
      return getLocalScraps();
    },
    setScraps: async (arr) => {
      setLocalScraps(arr);
      if (db && currentUser) {
        try {
          await db.collection('users').doc(currentUser.uid).set({ scraps: arr }, { merge: true });
        } catch (e) { console.warn(e); }
      }
    }
  };

  // === 학습 완료시 XP 반영 (app.js에서 호출) ===
  window.SoriState = {
    onPracticeComplete: async (phraseId, xpGain = 5) => {
      try {
        if (!currentUser) return;
        await savePractice(phraseId, xpGain);
      } catch (e) {
        console.warn("⚠️ onPracticeComplete error:", e);
      }
    }
  };
})();

