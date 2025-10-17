/* js/state.js
   실제 Firebase 연결 버전 (Firebase 12.x 구성 기반)
   로그인 / 프로필 / 학습진행 저장 기능 포함
*/

(function () {
  // === Firebase 설정 (실제 값) ===
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
  const userState = {
    uid: null, name: null, email: null, photoURL: null,
    level: 1, xp: 0, totalDays: 0, streak: 0, lastVisit: null,
    practiceCount: {}
  };

  // === Firebase 초기화 ===
  try {
    if (typeof firebase !== "undefined") {
      firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();
      console.log("✅ Firebase initialized with real config");
    } else {
      console.error("❌ Firebase SDK not found (check script order)");
    }
  } catch (e) {
    console.error("❌ Firebase init error:", e);
  }

  function calcLevel(xp) {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    if (xp < 1500) return 5;
    return Math.floor(xp / 300) + 1;
  }

  async function loadUserData() {
    if (!db || !currentUser) return;
    const ref = db.collection("users").doc(currentUser.uid);
    const snap = await ref.get();
    if (snap.exists) {
      Object.assign(userState, snap.data());
    } else {
      userState.uid = currentUser.uid;
      userState.name = currentUser.displayName;
      userState.email = currentUser.email;
      userState.photoURL = currentUser.photoURL;
      userState.lastVisit = new Date().toDateString();
      userState.totalDays = 1;
      userState.streak = 1;
      userState.xp = 10;
      await ref.set(userState);
    }
    console.log("✅ User data loaded");
  }

  async function savePractice(phraseId, incXp) {
    if (!db || !currentUser) return;
    const ref = db.collection("users").doc(currentUser.uid);
    userState.practiceCount[phraseId] = (userState.practiceCount[phraseId] || 0) + incXp;
    userState.xp += incXp;
    userState.level = calcLevel(userState.xp);
    await ref.set(userState, { merge: true });
  }

  // === 전역 함수 등록 ===
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
        alert("✅ Logged in as " + (currentUser.displayName || "user"));
      })
      .catch((err) => {
        alert("❌ Login failed: " + err.message);
      });
  };

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
      } else {
        console.log("🚪 Logged out");
      }
    });
  }

  // === 학습 완료시 XP 반영 ===
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
