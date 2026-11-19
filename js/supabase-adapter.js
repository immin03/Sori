// Firebase Auth stays the identity provider; no service-role key belongs here.
export function createSupabaseAdapter(config, auth, request = fetch) {
  const base = config.supabaseUrl;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base || '') || !config.supabasePublishableKey) throw new Error('Supabase configuration missing or invalid');
  async function call(user,path,method='GET',body) {
    if (auth.currentUser?.uid !== user.uid) throw new Error('Account changed');
    const token = await user.getIdToken();
    if (auth.currentUser?.uid !== user.uid) throw new Error('Account changed');
    const result=await request(base+'/rest/v1/'+path,{method,headers:{apikey:config.supabasePublishableKey,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},...(body ? {body:JSON.stringify(body)} : {})});
    if (!result.ok) throw new Error('Storage request failed: '+result.status);
    return method==='GET' ? result.json() : null;
  }
  const uid=user => encodeURIComponent(user.uid);
  return {
    async read(user) { const rows=await call(user,'sori_saved_phrases?select=phrase_id&user_id=eq.'+uid(user)); return rows.map(x=>x.phrase_id); },
    update(user,id,saved) { return saved ? call(user,'sori_saved_phrases?on_conflict=user_id,phrase_id','POST',{user_id:user.uid,phrase_id:id}) : call(user,'sori_saved_phrases?user_id=eq.'+uid(user)+'&phrase_id=eq.'+encodeURIComponent(id),'DELETE'); },
    practice(user) { return call(user,'sori_user_state?on_conflict=user_id','POST',{user_id:user.uid,last_practice_at:new Date().toISOString()}); }
  };
}
