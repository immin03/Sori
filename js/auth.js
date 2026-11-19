import {auth, provider, authReady} from './firebase-init.js?v=20261119r4';
import './state.js?v=20261119r4';
import {signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js';
// The inline modal gate owns buttons. This module owns the authentication API only.
let pending = null;
async function login() {
  await authReady;
  try { return await signInWithPopup(auth, provider); }
  catch (error) { if (error.code === 'auth/popup-blocked') return signInWithRedirect(auth, provider); throw error; }
}
window.SoriUser = {
  logout: () => signOut(auth),
  isLoggedIn: () => !!auth.currentUser,
  getCurrentUser: () => auth.currentUser,
  onAuth: callback => onAuthStateChanged(auth, callback),
  login: () => { if (!pending) pending=login().finally(() => {pending=null;}); return pending; }
};
getRedirectResult(auth).catch(() => {
  window.dispatchEvent(new CustomEvent('sori-auth-error'));
});
authReady.then(() => { window.firebaseAuth=auth; window.dispatchEvent(new CustomEvent('firebaseReady')); });
