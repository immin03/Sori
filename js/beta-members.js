const dialog=document.getElementById('betaDialog'),content=dialog.querySelector('[data-beta-body]');
const features=['Offline speaking lessons','Personal pronunciation coaching','Practice with a partner','K-drama listening challenges','Weekly progress by email','Offline travel maps','Live transit alerts','Other'];
let current=null,profile=null,updated=0,lastAttempt=0,refreshing=null,screen=0,adminRows=[],cursor=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(path,body,user=current){
 if(!user)throw Error('Sign in with Google to continue.');
 const token=await user.getIdToken();
 const r=await fetch(window.SoriConfig.tripsApiBase+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const result=await r.json();if(!r.ok)throw Error(result.error||'Please try again.');return result;
}
function show(){if(!dialog.open)dialog.showModal();}
function hide(){screen++;dialog.close();}
function later(){try{sessionStorage.setItem('sori:asked:'+current?.uid,'1');}catch{}hide();}
let dictation=null;
function stopDictation(){if(dictation){dictation.abort();dictation=null;}}
function offerDictation(form){
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Recognition)return;
 const field=form.elements.idea,button=document.createElement('button');
 button.type='button';button.className='text-button';button.textContent='Dictate an idea';
 field.parentElement.after(button);
 button.onclick=()=>{
  if(dictation){dictation.stop();return;}
  const recognizer=new Recognition(),status=form.querySelector('[role=status]');
  recognizer.lang=navigator.language||'en-US';recognizer.interimResults=false;
  recognizer.onstart=()=>{button.textContent='Stop dictation';status.textContent='Listening. You can edit your words before sending.';};
  recognizer.onresult=e=>{if(dictation!==recognizer)return;const line=e.results[0]?.[0]?.transcript||'';field.value=[field.value.trim(),line.trim()].filter(Boolean).join(' ').slice(0,600);status.textContent='Review your idea before sending.';};
  recognizer.onerror=()=>{if(dictation===recognizer)status.textContent='Dictation could not finish. You can type your idea.';};
  recognizer.onend=()=>{if(dictation===recognizer)dictation=null;button.textContent='Dictate an idea';};
  dictation=recognizer;try{recognizer.start();}catch{dictation=null;status.textContent='Dictation is unavailable. You can type your idea.';}
 };
}
function survey(){
 screen++;
 const f=profile?.feedback||{};
 content.innerHTML='<h2 id="betaTitle">Help shape Sori</h2><p>Which parts of Korean life brought you here? Share as much or as little as you like.</p><form id="betaSurvey"><label>What would you like to do with Sori?<textarea name="goal" maxlength="600" placeholder="Talk to my partner’s family…">'+esc(f.goal)+'</textarea></label><label>What information would help you most?<textarea name="information" maxlength="600" placeholder="How to order at a neighborhood restaurant…">'+esc(f.information)+'</textarea></label><fieldset><legend>What should we build next?</legend>'+features.map(x=>'<label class="feature-option"><input type="checkbox" name="feature" value="'+x+'" '+(f.features?.includes(x)?'checked':'')+'>'+x+'</label>').join('')+'</fieldset><label>Another idea or request<textarea name="idea" maxlength="600">'+esc(f.idea)+'</textarea></label><small>Optional. Your answers are shared privately with the Sori team.</small><p role="status"></p><button class="sori-primary">Send feedback</button> <button class="text-button" type="button" data-later>Maybe later</button></form>';
 show();offerDictation(content.querySelector('form'));content.querySelector('[data-later]').onclick=later;
 content.querySelector('form').onsubmit=async e=>{
  e.preventDefault();stopDictation();const form=e.target,button=form.querySelector('.sori-primary'),status=form.querySelector('[role=status]');
  const data=new FormData(form),user=current;
  const values={goal:data.get('goal'),information:data.get('information'),idea:data.get('idea'),features:data.getAll('feature')};
  if(!values.features.length && ![values.goal,values.information,values.idea].some(x=>x.trim())){status.textContent='Choose one feature or write a few words.';return;}
  button.disabled=true;
  try{const result=await api('/member/feedback',values,user);if(user!==current)return;profile=result;content.innerHTML='<h2 id="betaTitle">Thanks for helping shape Sori.</h2><button class="sori-primary" data-done>Done</button>';content.querySelector('button').onclick=hide;}
  catch(err){status.textContent=err.message;button.disabled=false;}
 };
}
const date=n=>n?new Date(n).toLocaleDateString():'';
async function admin(append=false){
 const own=++screen;show();if(!append){adminRows=[];cursor=null;}
 content.innerHTML='<h2 id="betaTitle">Beta members</h2><p role="status">Loading members…</p>';
 try {
  const res=await api('/admin/members'+(cursor?'?cursor='+encodeURIComponent(cursor):''));
  if(own!==screen||!dialog.open)return;
  adminRows.push(...res.members);cursor=res.cursor;
  const sorted=[...adminRows].sort((a,b)=>b.lastSeen-a.lastSeen),week=Date.now()-7*86400000;
  const votes=features.map(name=>[name,sorted.filter(r=>r.feedback?.features.includes(name)).length]).filter(([,count])=>count).sort((a,b)=>b[1]-a[1]);
  content.innerHTML='<h2 id="betaTitle">Beta members</h2><p>Signed-in activity since beta tracking began. A visit starts after 30 minutes away.</p><strong>'+sorted.length+' members loaded · '+sorted.filter(r=>r.lastSeen>=week).length+' active in 7 days · '+sorted.filter(r=>r.visits>1).length+' returned</strong>'+(votes.length?'<h3>Requested features</h3>'+votes.map(([x,n])=>'<p>'+esc(x)+' · '+n+'</p>').join(''):'')+sorted.map(r=>'<details class="member-record"><summary>'+esc(r.name||r.email)+' · '+r.visits+' visits</summary><p>'+esc(r.email)+'</p><p>Joined '+date(r.joined)+' · Last seen '+date(r.lastSeen)+' · '+r.activeDays+' active days</p>'+(r.feedback?'<p>Goals · '+esc(r.feedback.goal)+'</p><p>Information · '+esc(r.feedback.information)+'</p><p>Requests · '+esc(r.feedback.features.join(', '))+'</p><p>Other ideas · '+esc(r.feedback.idea)+'</p>':'<p>No survey response yet.</p>')+'</details>').join('')+(cursor?'<button class="sori-secondary" data-more>Load more members</button>':'');
  content.querySelector('[data-more]')?.addEventListener('click',()=>admin(true));
 }catch(err){if(own===screen)content.querySelector('[role=status]').textContent=err.message;}
}
function openFeedback(forAdmin=false){
 if(current){survey();return;}content.innerHTML='<h2 id="betaTitle">Beta feedback</h2><p>Sign in with Google to share a suggestion.</p><button class="sori-primary">Sign in with Google</button><p role="status"></p>';if(forAdmin){content.querySelector('h2').textContent='Member dashboard';content.querySelector('p').textContent='Sign in with the administrator’s Google account to view beta members.';}show();
 content.querySelector('button').onclick=async()=>{try{await window.SoriUser.login();}catch{content.querySelector('[role=status]').textContent='Sign-in could not finish. Please try again.';}};
}
function sync(){
 const user=window.SoriUser?.getCurrentUser()||null;
 if(current?.uid!==user?.uid){current=user;profile=null;updated=lastAttempt=0;refreshing=null;screen++;adminRows=[];cursor=null;stopDictation();
  if(dialog.open){if(location.hash==='#admin' && current){content.innerHTML='<h2 id="betaTitle">Member dashboard</h2><p>Verifying access…</p>';}else hide();}document.querySelector('[data-beta-admin]').hidden=true;}
 if(!current||document.hidden||Date.now()-updated<5*60000||Date.now()-lastAttempt<30000||refreshing)return;
 const own=current;lastAttempt=Date.now();
 const task=api('/member/visit',{},own).then(r=>{
  if(own!==current)return;
  updated=Date.now();profile=r;document.querySelector('[data-beta-admin]').hidden=!r.isAdmin;
  let asked=false;try{asked=sessionStorage.getItem('sori:asked:'+own.uid);}catch{}
  if(location.hash==='#admin'){admin();return;}
  if(!r.answered&&!asked&&!dialog.open&&!document.body.classList.contains('focus-exercise')){survey();try{sessionStorage.setItem('sori:asked:'+own.uid,'1');}catch{}}
 }).catch(()=>{if(own===current && location.hash==='#admin' && dialog.open){content.innerHTML='<h2 id="betaTitle">Member dashboard</h2><p>Could not verify your account. Please retry.</p><button class="sori-secondary">Retry</button>';content.querySelector('button').onclick=()=>admin();}}).finally(()=>{if(refreshing===task)refreshing=null;});refreshing=task;
}
dialog.querySelector('[data-beta-close]').onclick=later;
dialog.addEventListener('close',()=>{stopDictation();screen++;content.replaceChildren();if(location.hash==='#admin')history.replaceState(null,'','#home');});
document.querySelector('[data-beta-feedback]').onclick=()=>openFeedback();
document.querySelector('[data-beta-admin]').onclick=()=>admin();
window.addEventListener('sori-auth-changed',sync);window.addEventListener('firebaseReady',sync);
document.addEventListener('visibilitychange',sync);document.addEventListener('pointerdown',sync,{passive:true});
function adminLink(){if(location.hash==='#admin'){if(current)admin();else openFeedback(true);}}
window.addEventListener('hashchange',adminLink);sync();adminLink();
