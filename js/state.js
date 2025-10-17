/* js/state.js - auth + saved + 진행상태 */
(function () {
  // --- Firebase 초기화(compat) ---
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
    if (typeof firebase !== "undefined" && !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();
    }
  } catch(e){ console.warn(e); }

  // --- 상단 버튼 토글 helper ---
  const loginBtn = () => document.getElementById('loginBtn');
  function setLoginButton(isIn){
    const b = loginBtn();
    if (!b) return;
    b.textContent = isIn ? 'Logout' : 'Login';
    b.classList.toggle('primary', !isIn);
  }

  // --- Saved 관리 (로컬 우선, 로그인 시 Firestore 동기화) ---
  function keyFor(uid){ return `sori_saved_${uid||'anon'}`; }
  function readLocal(uid){
    try { return new Set(JSON.parse(localStorage.getItem(keyFor(uid))||'[]')); }
    catch{ return new Set(); }
  }
  function writeLocal(uid, set){
    try { localStorage.setItem(keyFor(uid), JSON.stringify(Array.from(set))); } catch{}
  }

  // 현재 로그인 사용자
  let currentUser = null;
  // 메모리 캐시
  let savedSet = readLocal(null);

  async function syncFromCloud(){
    if (!db || !currentUser) return;
    const snap = await db.collection('users').doc(currentUser.uid).collection('saved').get();
    const cloud = new Set();
    snap.forEach(doc => cloud.add(doc.id));
    // 로컬과 합치기
    const merged = new Set([...savedSet, ...cloud]);
    savedSet = merged;
    writeLocal(currentUser.uid, savedSet);
  }

  async function pushOneToCloud(id, data){
    if (!db || !currentUser) return;
    await db.collection('users').doc(currentUser.uid)
      .collection('saved').doc(id).set(data || {saved:true});
  }
  async function removeOneFromCloud(id){
    if (!db || !currentUser) return;
    await db.collection('users').doc(currentUser.uid)
      .collection('saved').doc(id).delete().catch(()=>{});
  }

  // --- 전역 사용자 API ---
  const SoriUser = {
    isLoggedIn: () => !!(auth && auth.currentUser),
    getUid: () => (auth && auth.currentUser ? auth.currentUser.uid : null),

    // 저장 토글
    async toggleSave(phrase){
      if (!phrase || !phrase.id) return {saved:false};
      const id = phrase.id;
      // 로그인 확인은 밖에서 해도 되지만 안전망
      const loggedIn = SoriUser.isLoggedIn();
      if (savedSet.has(id)) {
        savedSet.delete(id);
        writeLocal(SoriUser.getUid()||null, savedSet);
        if (loggedIn) await removeOneFromCloud(id);
        return {saved:false};
      } else {
        savedSet.add(id);
        writeLocal(SoriUser.getUid()||null, savedSet);
        if (loggedIn) await pushOneToCloud(id, phrase);
        return {saved:true};
      }
    },

    isSaved: (id) => savedSet.has(id),

    // 저장된 id 리스트
    getSavedIds: () => Array.from(savedSet),

    async logout(){
      if (!auth) return;
      await auth.signOut();
      currentUser = null;
      // 익명 키로 저장 이동
      savedSet = readLocal(null);
      setLoginButton(false);
    }
  };

  window.SoriUser = SoriUser; // 전역 노출

  // --- 구글 로그인 핸들러(모달에서 호출) ---
  window.handleGoogleLogin = async function handleGoogleLogin(){
    if (!auth) return alert('Auth 준비 중입니다. 잠시 후 다시 시도해주세요.');
    try{
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
      document.getElementById('authModal')?.classList.add('hidden');
    }catch(e){
      alert('Login failed: ' + (e?.message||e));
    }
  };

  // --- 인증 상태 변경 시 처리 ---
  if (auth){
    auth.onAuthStateChanged(async (user) => {
      currentUser = user || null;
      if (currentUser) {
        // 로그인 후: 저장 합치기(로컬 anon + 클라우드)
        const before = new Set(savedSet);
        await syncFromCloud();
        // anon 로컬에 있던 걸 클라우드로 업로드
        const diff = [...before].filter(x => !savedSet.has(x));
        for (const id of diff) {
          await pushOneToCloud(id, {saved:true});
          savedSet.add(id);
        }
        writeLocal(currentUser.uid, savedSet);
        setLoginButton(true);
      } else {
        // 로그아웃 후: anon 로컬 셋으로
        savedSet = readLocal(null);
        setLoginButton(false);
      }
      // 별 표시 업데이트 요청
      window.dispatchEvent(new CustomEvent('sori-auth-changed'));
    });
  }

  // ---- 학습 XP 훅(선택) ----
  window.SoriState = {
    onPracticeComplete: async ()=>{}
  };
})();
