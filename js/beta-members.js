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
// The member API verifies the Google account before this link enters the menu.
const adminGroup=document.createElement('section');
adminGroup.className='menu-group';
adminGroup.innerHTML='<h3 lang="ko"><a href="#admin">관리자</a></h3>';
const canOpenAdmin=()=>Boolean(current && current.uid===window.SoriUser?.getCurrentUser()?.uid && profile?.isAdmin===true);
function updateAdminMenu(){
 if(canOpenAdmin()){
  if(!adminGroup.isConnected)document.querySelector('#sidebar .sidebar-menu').append(adminGroup);
 }else{
  adminGroup.remove();adminRows=[];cursor=null;
 }
}
const date=n=>n?new Date(n).toLocaleDateString():'';
let adminView='overview',adminSearch='',adminFilter='all';
const adminTime=n=>n?new Date(n).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):'기록 없음';
function downloadMembers(){
 const cells=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
 const rows=[['이름','이메일','가입일','마지막 방문','방문 수','활동 일수','학습 목표','필요한 정보','요청 기능','기타 의견','응답일'],...filteredMembers().map(r=>[r.name,r.email,adminTime(r.joined),adminTime(r.lastSeen),r.visits,r.activeDays,r.feedback?.goal,r.feedback?.information,r.feedback?.features?.join(' | '),r.feedback?.idea,adminTime(r.feedback?.updated)])];
 const url=URL.createObjectURL(new Blob(['\ufeff'+rows.map(row=>row.map(cells).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='sori-members-'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function filteredMembers(){
 const q=adminSearch.toLowerCase().trim(),week=Date.now()-7*86400000;
 return adminRows.filter(r=>(adminView!=='survey'||r.feedback)&&(!q||[r.name,r.email,r.feedback?.goal,r.feedback?.information,r.feedback?.idea,...(r.feedback?.features||[])].join(' ').toLowerCase().includes(q))&&(adminFilter==='all'||adminFilter==='answered'&&r.feedback||adminFilter==='unanswered'&&!r.feedback||adminFilter==='active'&&r.lastSeen>=week||adminFilter==='returned'&&r.visits>1)).sort((a,b)=>b.lastSeen-a.lastSeen);
}
function renderAdmin(){
 const now=Date.now(),week=now-7*86400000,month=now-30*86400000,total=adminRows.length,answered=adminRows.filter(r=>r.feedback).length;
 const stats=[['전체 회원',total],['최근 7일 활동',adminRows.filter(r=>r.lastSeen>=week).length],['최근 30일 활동',adminRows.filter(r=>r.lastSeen>=month).length],['재방문 회원',adminRows.filter(r=>r.visits>1).length],['총 방문',adminRows.reduce((n,r)=>n+(Number(r.visits)||0),0)],['설문 응답',answered+' / '+total]];
 content.innerHTML='<header class="admin-heading"><div><h2 id="betaTitle">Sori 관리자</h2><p>회원 · 이용 현황 · 고객 의견</p></div><button class="sori-secondary" data-refresh>새로고침</button></header><nav class="admin-tabs" aria-label="관리자 메뉴">'+[['overview','대시보드'],['members','회원 관리'],['survey','설문 응답'],['requests','기능 요청']].map(([id,label])=>'<button aria-pressed="'+(adminView===id)+'" data-view="'+id+'">'+label+'</button>').join('')+'</nav><p class="admin-note">로그인 회원의 베타 추적 기록 기준입니다. 30분 이상 간격의 접속을 새 방문으로 집계합니다. 시간은 한국 기준이며 비회원 방문·페이지별 이용·학습 성적은 현재 수집되지 않습니다.</p><div class="admin-stats">'+stats.map(([label,value])=>'<article><small>'+label+'</small><strong>'+value+'</strong></article>').join('')+'</div><section data-admin-panel></section><p role="status">전체 '+total+'명 로드 완료 · '+adminTime(now)+'</p>';
 const panel=content.querySelector('[data-admin-panel]');
 if(adminView==='overview'){
  const days=Array.from({length:14},(_,i)=>{const start=new Date(now+(i-13)*86400000).toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});return [start,adminRows.filter(r=>new Date(r.joined).toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'})===start).length];});
  const max=Math.max(1,...days.map(x=>x[1]));
  panel.innerHTML='<h3>최근 14일 가입</h3><div class="admin-chart">'+days.map(([day,n])=>'<div><span>'+esc(day.slice(5))+'</span><meter min="0" max="'+max+'" value="'+n+'">'+n+'</meter><strong>'+n+'</strong></div>').join('')+'</div><h3>설문 참여</h3><p>응답률 '+(total?Math.round(answered/total*100):0)+'% · 미응답 '+(total-answered)+'명</p><h3>최근 방문 회원</h3>'+[...adminRows].sort((a,b)=>b.lastSeen-a.lastSeen).slice(0,5).map(r=>'<p>'+esc(r.name||r.email)+' <small>'+esc(adminTime(r.lastSeen))+'</small></p>').join('');
 }else if(adminView==='requests'){
  const votes=features.map(name=>[name,adminRows.filter(r=>r.feedback?.features?.includes(name)).length]).sort((a,b)=>b[1]-a[1]);
  panel.innerHTML='<h3>개발 요청 순위</h3><p>복수 선택 설문 · 응답자 '+answered+'명 기준</p>'+votes.map(([name,n])=>'<div class="admin-vote"><span>'+esc(name)+'</span><strong>'+n+'명</strong><progress max="'+Math.max(1,answered)+'" value="'+n+'"></progress></div>').join('')+'<h3>직접 남긴 제안</h3>'+adminRows.filter(r=>r.feedback?.idea).map(r=>'<article class="admin-answer"><strong>'+esc(r.name||r.email)+'</strong><p>'+esc(r.feedback.idea)+'</p><small>'+adminTime(r.feedback.updated)+'</small></article>').join('');
 }else{
  panel.innerHTML='<div class="admin-filters"><label>회원·응답 검색<input type="search" data-search placeholder="이름, 이메일, 의견" value="'+esc(adminSearch)+'"></label><label>회원 상태<select data-filter>'+[['all','전체'],['answered','설문 응답'],['unanswered','설문 미응답'],['active','최근 7일 활동'],['returned','재방문']].map(([v,l])=>'<option value="'+v+'" '+(v===adminFilter?'selected':'')+'>'+l+'</option>').join('')+'</select></label><button class="sori-secondary" data-export>현재 목록 CSV</button></div><div data-member-list></div>';
  const list=panel.querySelector('[data-member-list]');
  const draw=()=>{const rows=filteredMembers().filter(r=>adminView!=='survey'||r.feedback);list.innerHTML='<p>'+rows.length+'명</p>'+(rows.length?rows.map(r=>'<details class="member-record"><summary><strong>'+esc(r.name||'이름 없음')+'</strong><span>'+esc(r.email)+'</span><small>'+r.visits+'회 방문 · '+(r.feedback?'설문 응답':'설문 미응답')+'</small></summary><dl><dt>가입</dt><dd>'+adminTime(r.joined)+'</dd><dt>최초 수집</dt><dd>'+adminTime(r.firstSeen)+'</dd><dt>최근 방문</dt><dd>'+adminTime(r.lastSeen)+'</dd><dt>활동 일수</dt><dd>'+Number(r.activeDays||0)+'일</dd></dl>'+(r.feedback?'<h4>설문 응답</h4>'+[['학습 목표',r.feedback.goal],['필요한 정보',r.feedback.information],['희망 기능',r.feedback.features?.join(', ')],['기타 의견',r.feedback.idea],['응답일',adminTime(r.feedback.updated)]].map(([label,value])=>'<div class="admin-answer"><strong>'+label+'</strong><p>'+esc(value||'응답 없음')+'</p></div>').join(''):'<p>아직 설문을 제출하지 않았습니다.</p>')+'</details>').join(''):'<p>조건에 맞는 회원이 없습니다.</p>');};
  panel.querySelector('[data-search]').oninput=e=>{adminSearch=e.target.value;draw();};panel.querySelector('[data-filter]').onchange=e=>{adminFilter=e.target.value;draw();};panel.querySelector('[data-export]').onclick=downloadMembers;draw();
 }
 content.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{adminView=b.dataset.view;renderAdmin();});content.querySelector('[data-refresh]').onclick=()=>admin();
}
async function admin(){
 if(!canOpenAdmin())return;
 const own=++screen;dialog.dataset.panel='admin';show();adminRows=[];cursor=null;
 content.innerHTML='<h2 id="betaTitle">Sori 관리자</h2><p role="status">전체 회원 정보를 불러오는 중…</p>';
 try{
  do{
   const res=await api('/admin/members'+(cursor?'?cursor='+encodeURIComponent(cursor):''));
   if(own!==screen||!dialog.open||!canOpenAdmin())return;
   adminRows.push(...res.members);cursor=res.cursor;
   content.querySelector('[role=status]').textContent=adminRows.length+'명 불러옴…';
  }while(cursor);
  renderAdmin();
 }catch(err){if(own===screen){content.innerHTML='<h2 id="betaTitle">Sori 관리자</h2><p role="alert">'+esc(err.message)+'</p><button class="sori-secondary" data-retry>다시 시도</button>';content.querySelector('[data-retry]').onclick=()=>admin();}}
}
function openFeedback(){
 if(current){survey();return;}content.innerHTML='<h2 id="betaTitle">Beta feedback</h2><p>Sign in with Google to share a suggestion.</p><button class="sori-primary">Sign in with Google</button><p role="status"></p>';show();
 content.querySelector('button').onclick=async()=>{try{await window.SoriUser.login();}catch{content.querySelector('[role=status]').textContent='Sign-in could not finish. Please try again.';}};
}
function sync(){
 const user=window.SoriUser?.getCurrentUser()||null;
 if(current?.uid!==user?.uid){current=user;profile=null;updated=lastAttempt=0;refreshing=null;screen++;adminRows=[];cursor=null;stopDictation();
  updateAdminMenu();
  if(dialog.open)hide();
 }
 if(!current||document.hidden||Date.now()-updated<5*60000||Date.now()-lastAttempt<30000||refreshing)return;
 const own=current;lastAttempt=Date.now();
 const task=api('/member/visit',{},own).then(r=>{
  if(own!==current)return;
  updated=Date.now();profile=r;updateAdminMenu();
  let asked=false;try{asked=sessionStorage.getItem('sori:asked:'+own.uid);}catch{}
  if(location.hash==='#admin'){
   if(canOpenAdmin()){if(!dialog.open)admin();}
   else {if(dialog.open)hide();history.replaceState(null,'','#home');}
   return;
  }
  if(!r.answered&&!asked&&!dialog.open&&!document.body.classList.contains('focus-exercise')){survey();try{sessionStorage.setItem('sori:asked:'+own.uid,'1');}catch{}}
 }).catch(()=>{
  if(own!==current)return;
  profile=null;updateAdminMenu();if(location.hash==='#admin' && dialog.open)hide();
 }).finally(()=>{if(refreshing===task)refreshing=null;});refreshing=task;
}
dialog.querySelector('[data-beta-close]').onclick=later;
dialog.addEventListener('close',()=>{delete dialog.dataset.panel;stopDictation();screen++;content.replaceChildren();if(location.hash==='#admin')history.replaceState(null,'','#home');});
document.querySelector('[data-beta-feedback]').onclick=()=>openFeedback();
window.addEventListener('sori-auth-changed',sync);window.addEventListener('firebaseReady',sync);
document.addEventListener('visibilitychange',sync);document.addEventListener('pointerdown',sync,{passive:true});
function adminLink(){
 if(location.hash==='#admin'){
  if(canOpenAdmin())admin();else sync();
 }else if(dialog.open && dialog.dataset.panel==='admin')hide();
}
window.addEventListener('hashchange',adminLink);sync();adminLink();
