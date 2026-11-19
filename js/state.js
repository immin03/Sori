import {app, auth} from './firebase-init.js?v=20261119r3';
import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js';
import {getFirestore, doc, getDoc, setDoc, arrayUnion, arrayRemove, serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js';
import {SavedStore} from './saved-store.js?v=20261119r3';
import {createSupabaseAdapter} from './supabase-adapter.js?v=20261119r3';

const db = getFirestore(app);
const firestoreAdapter = {
  async read(user) { const snap=await getDoc(doc(db,'users',user.uid)); return snap.exists() ? snap.data().savedList || [] : []; },
  update(user,id,saved) { return setDoc(doc(db,'users',user.uid), {savedList: saved ? arrayUnion(id) : arrayRemove(id)}, {merge:true}); },
  practice(user) { return setDoc(doc(db,'users',user.uid), {lastPracticeAt:serverTimestamp()}, {merge:true}); }
};
const config = window.SoriConfig || {};
// Supabase is opt-in only, after account mapping, backup and RLS verification.
const adapter = config.storageBackend === 'supabase' ? createSupabaseAdapter(config, auth) : firestoreAdapter;
let storage; try { storage=window.localStorage; } catch { storage={getItem(){return null;},setItem(){throw new Error('Storage disabled');}}; }
export const savedStore = new SavedStore({storage, adapter,
  onChange(savedList) { window.dispatchEvent(new CustomEvent('savedListChanged',{detail:{savedList}})); },
  onStatus(status) { window.dispatchEvent(new CustomEvent('sori-sync-status',{detail:{status}})); }
});
window.SoriSaved = savedStore;
window.SoriState = {async onPracticeComplete() {
  const user=auth.currentUser;
  if (user) try { await adapter.practice(user); } catch { window.dispatchEvent(new CustomEvent('sori-sync-status',{detail:{status:'offline'}})); }
}};
onAuthStateChanged(auth,user => { savedStore.setUser(user); });
window.addEventListener('online', () => { savedStore.setUser(auth.currentUser); });
