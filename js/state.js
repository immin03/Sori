/* js/state.js
   App-wide state + (optional) Firebase auth wiring
   Exposes:
     - window.handleGoogleLogin()
     - window.handleMyButton()
     - window.SoriState.onPracticeComplete(phraseId, xpGain)
*/

(function () {
  // ---- Firebase config (데모 값) ----
  // 실제 프로젝트 값으로 바꿔 쓰세요. (없어도 데모모드로 동작)
  const firebaseConfig = {
    apiKey: "AIzaSyBXxvK_your_api_key_here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  };

  let auth = null, db = null, currentUser = null;
  let firebaseReady = false;

  // ---- 유저 진행도 (로컬 + 옵션: Firebase) ----
  const userState = {
    uid: null, name: null, email: null, photoURL: null,
    level: 1, xp: 0, totalDays: 0, streak: 0, lastVisit: null,
    practiceCount: {}
  };

  function calcLevel(xp) {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    if (xp < 1500) return 5;
    return Math.floor(xp / 300) + 1;
  }

  // ---- Firebase 초기화 (있으면) ----
  try {
    if (typeof firebase !== "undefined") {
      firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();
      firebaseReady = true;
      console.log("✅ Firebase initialized");
    }
  } catch (e) {
    console.log("⚠️ Firebase init skipped (demo mode):", e.message);
  }

  // ---- 출석/스택 업데이트 (옵션) ----
  async function checkAndUpdateAttendance() {
    if (!firebaseReady || !currentUser) return;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (userState.lastVisit !== today) {
      const isConsecutive = userState.lastVisit === yesterday;
      userState.lastVisit = today;
      userState.totalDays += 1;
      userState.streak = isConsecutive ? userState.streak + 1 : 1;
      userState.xp += 10;
      await db.collection('users').doc(currentUser.uid).set({
        ...userState,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
  }

  async function loadUserData() {
    if (!firebaseReady || !currentUser) return;
    try {
      const snap = await db.collection('users').doc(currentUser.uid).get();
      if (snap.exists) {
        const d = snap.data();
        userState.level = d.level || 1;
        userState.xp = d.xp || 0;
        userState.totalDays = d.totalDays || 0;
        userState.streak = d.streak || 0;
        userState.lastVisit = d.lastVisit || null;
        userState.practiceCount = d.practiceCount || {};
      } else {
        userState.uid = currentUser.uid;
        userState.name = currentUser.displayName;
        userState.email = currentUser.email;
        userState.photoURL = currentUser.photoURL;
        userState.lastVisit = new Date().toDateString();
        userState.totalDays = 1;
        userState.streak = 1;
        userState.xp = 10;
        await db.collection('users').doc(currentUser.uid).set({
          ...userState,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      await checkAndUpdateAttendance();
    } catch (e) {
      console.error("Error loading user data:", e);
    }
  }

  async function savePractice(phraseId, incXp) {
    if (!firebaseReady || !currentUser) return;
    userState.practiceCount[phraseId] = (userState.practiceCount[phraseId] || 0) + incXp;
    userState.xp += incXp;
    const newLevel = calcLevel(userState.xp);
    if (newLevel > userState.level) {
      userState.level = newLevel;
      // UI 토스트 역할은 app.js의 showError 사용. 여기서는 콘솔만.
      console.log(`🎊 Level Up! Level ${newLevel}`);
    }
    await db.collection('users').doc(currentUser.uid).set({
      xp: userState.xp,
      level: userState.level,
      practiceCount: userState.practiceCount,
      lastVisit: userState.lastVisit,
      totalDays: userState.totalDays,
      streak: userState.streak,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  // ---- 전역: 로그인 / 마이 버튼 핸들러 ----
  window.handleGoogleLogin = function handleGoogleLogin() {
    // Firebase가 없거나 설정값 그대로면 데모 모드
    if (!auth) {
      alert('🔧 Demo Mode - Firebase Not Configured\n\n실제 구글 로그인을 쓰려면 Firebase 프로젝트 키를 state.js에 넣어주세요.');
      // 모달 닫기 (있으면)
      document.getElementById('authModal')?.classList.add('hidden');
      return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(res => {
        currentUser = res.user;
        document.getElementById('authModal')?.classList.add('hidden');
        alert('✅ Login successful! Welcome ' + (currentUser.displayName || 'user'));
      })
      .catch(err => {
        console.error('❌ Login error:', err);
        alert('❌ Login failed: ' + err.message);
      });
  };

  window.handleMyButton = function handleMyButton() {
    if (!currentUser) {
      alert('⚠️ Please login first to view your profile!');
      document.getElementById('authModal')?.classList.remove('hidden');
      return;
    }
    const level = calcLevel(userState.xp);
    alert(
      `👤 Your Profile\n\n` +
      `Name: ${userState.name || currentUser.displayName || '-'}\n` +
      `Email: ${userState.email || currentUser.email || '-'}\n` +
      `Level: ${level}\n` +
      `Total XP: ${userState.xp}\n` +
      `Total Days: ${userState.totalDays}\n` +
      `Current Streak: ${userState.streak} 🔥`
    );
  };

  // ---- 인증 상태 변화 감지 ----
  if (auth) {
    auth.onAuthStateChanged(async (user) => {
      currentUser = user || null;
      if (currentUser) {
        userState.uid = currentUser.uid;
        userState.name = currentUser.displayName || '';
        userState.email = currentUser.email || '';
        userState.photoURL = currentUser.photoURL || '';
        await loadUserData();
      }
    });
  }

  // ---- app.js가 호출하는 전역 상태 API ----
  window.SoriState = {
    onPracticeComplete: async (phraseId, xpGain = 5) => {
      // Firebase 있으면 저장, 없으면 로컬 계산만
      try {
        userState.xp += xpGain;
        const lvl = calcLevel(userState.xp);
        if (lvl > userState.level) userState.level = lvl;
        userState.practiceCount[phraseId] = (userState.practiceCount[phraseId] || 0) + xpGain;
        if (firebaseReady && currentUser) {
          await savePractice(phraseId, 0); // 위에서 이미 xp 반영했으니 0으로 저장만
        }
      } catch (e) {
        console.warn('onPracticeComplete error (non-fatal):', e);
      }
    }
  };
})();

