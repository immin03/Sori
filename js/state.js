// Firebase demo-safe config
const firebaseConfig = {
  apiKey: "AIzaSyBXxvK_your_api_key_here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

let auth, db, currentUser = null;
let firebaseInitialized = false;

try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    firebaseInitialized = true;
    console.log('Firebase initialized');
  } else {
    console.log('Firebase SDK not loaded');
  }
} catch (e) {
  console.log('Firebase init skipped (demo):', e.message);
}

// user state
const userState = {
  uid: null, name: null, email: null, photoURL: null,
  level: 1, xp: 0, totalDays: 0, streak: 0, lastVisit: null,
  practiceCount: {}
};

function calculateLevel(xp) {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1500) return 5;
  return Math.floor(xp / 300) + 1;
}
function getLevelName(level) {
  const levels = ['Beginner','Elementary','Intermediate','Advanced','Expert','Master'];
  return levels[Math.min(level - 1, levels.length - 1)] || 'Master';
}

async function checkAndUpdateAttendance() {
  if (!currentUser || !db) return;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (userState.lastVisit !== today) {
    const isConsecutive = userState.lastVisit === yesterday;
    userState.lastVisit = today;
    userState.totalDays += 1;
    userState.streak = isConsecutive ? userState.streak + 1 : 1;
    userState.xp += 10;
    await db.collection('users').doc(currentUser.uid).set({
      ...userState, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    updateUserUI();
    showError('Daily check-in complete! +10 XP');
  }
}

async function loadUserData() {
  if (!currentUser || !db) return;
  try {
    const doc = await db.collection('users').doc(currentUser.uid).get();
    if (doc.exists) {
      const data = doc.data();
      userState.level = data.level || 1;
      userState.xp = data.xp || 0;
      userState.totalDays = data.totalDays || 0;
      userState.streak = data.streak || 0;
      userState.lastVisit = data.lastVisit || null;
      userState.practiceCount = data.practiceCount || {};
    } else {
      userState.lastVisit = new Date().toDateString();
      userState.totalDays = 1;
      userState.streak = 1;
      userState.xp = 10;
      await db.collection('users').doc(currentUser.uid).set({
        ...userState,
        uid: currentUser.uid, email: currentUser.email,
        name: currentUser.displayName, photoURL: currentUser.photoURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    await checkAndUpdateAttendance();
  } catch (error) { console.error('Error loading user data:', error); }
}

function updateUserUI() {
  const nameEl   = document.getElementById('userName');
  const levelEl  = document.getElementById('userLevel');
  const daysEl   = document.getElementById('totalDays');
  const streakEl = document.getElementById('streak');
  const xpEl     = document.getElementById('xpPoints');
  const avatarEl = document.getElementById('userAvatar');
  if (nameEl)  nameEl.textContent  = userState.name || 'User';
  if (levelEl) levelEl.textContent = `Level ${userState.level} - ${getLevelName(userState.level)}`;
  if (daysEl)  daysEl.textContent  = userState.totalDays;
  if (streakEl)streakEl.textContent= userState.streak;
  if (xpEl)    xpEl.textContent    = userState.xp;
  if (avatarEl && userState.photoURL) avatarEl.src = userState.photoURL;
}

window.handleGoogleLogin = function() {
  if (!auth) {
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.classList.remove('hidden');
    alert('Demo Mode - Firebase not configured. You can test without login.');
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      const authModal = document.getElementById('authModal');
      if (authModal) authModal.classList.add('hidden');
      alert('Login successful! Welcome ' + result.user.displayName);
    })
    .catch((error) => {
      alert('Login failed: ' + error.message);
    });
};

window.handleMyButton = function() {
  if (currentUser) {
    const msg = `Your Profile\n\n` +
      `Name: ${userState.name}\n` +
      `Email: ${userState.email}\n` +
      `Level: ${userState.level} - ${getLevelName(userState.level)}\n` +
      `Total XP: ${userState.xp}\n` +
      `Total Days: ${userState.totalDays}\n` +
      `Current Streak: ${userState.streak}`;
    alert(msg);
  } else {
    alert('Please login first to view your profile.');
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.classList.remove('hidden');
  }
};

if (typeof auth !== 'undefined' && auth) {
  auth.onAuthStateChanged(async (user) => {
    const authModal   = document.getElementById('authModal');
    const userSection = document.getElementById('userSection');
    const loginBtn    = document.getElementById('loginBtn');
    if (user) {
      currentUser = user;
      userState.uid = user.uid;
      userState.name = user.displayName;
      userState.email = user.email;
      userState.photoURL = user.photoURL;
      if (authModal)   authModal.classList.add('hidden');
      if (userSection) userSection.style.display = 'block';
      if (loginBtn)    loginBtn.style.display = 'none';
      await loadUserData();
      updateUserUI();
    } else {
      currentUser = null;
      if (userSection) userSection.style.display = 'none';
      if (loginBtn)    loginBtn.style.display = 'block';
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn && auth) {
    logoutBtn.addEventListener('click', async () => {
      try { await auth.signOut(); }
      catch (error) { console.error('Logout error:', error); }
    });
  }
});

// practice stats update (called from app)
async function updatePracticeStats() {
  if (!currentUser || !db) return;
  const phraseId = st.filteredLines[st.i].k;
  userState.practiceCount[phraseId] = (userState.practiceCount[phraseId] || 0) + 5;
  userState.xp += 5;
  const newLevel = calculateLevel(userState.xp);
  if (newLevel > userState.level) {
    userState.level = newLevel;
    showError(`Level Up! You are now Level ${newLevel} - ${getLevelName(newLevel)}!`);
  }
  await db.collection('users').doc(currentUser.uid).update({
    xp: userState.xp, level: userState.level, practiceCount: userState.practiceCount,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  updateUserUI();
}
