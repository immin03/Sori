import {sharePublic} from '../share-public.js?v=20261121trip';
import {matchingStories,nextStory} from './archive.js?v=20261121editorial';
/* Korea 101 lives inside Sori. Public story sharing never includes trip invites. */
const root=document.getElementById('newsletterView'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let stories=[],originals=[],query='',filter='All',openStory=null,mailEnabled=false,token=null,actor=null,busy=false;
const local={get(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}};
token=local.get('sori:subscription-cancel');
const bookmarks=()=>local.get('sori:story-bookmarks')||[];
function random(){const a=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...a)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
async function call(path,method='GET',body){const r=await fetch((window.SoriConfig?.tripsApiBase||'/api')+'/'+path,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok)throw Error(data.error||'Please try again.');return data;}
function issueDate(s){return new Date(s.published+'T12:00:00Z').toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});}
function saveButton(s){
  const saved=bookmarks().includes(s.id);
  return `<button type="button" class="story-bookmark" data-save-id="${s.id}" aria-pressed="${saved}" aria-label="${saved?'Remove from saved':'Save story'}: ${esc(s.title)}">${saved?'Saved':'Save'}</button>`;
}
function card(story){
  return `<div class="story-list-item"><button type="button" class="story-tile" data-story="${story.id}"><img src="${story.photo}" alt="${esc(story.photoAlt)}" loading="lazy" width="160" height="120"><span><small>${esc(story.category)} · ${story.minutes} min</small><strong>${esc(story.title)}</strong></span></button>${saveButton(story)}</div>`;
}
function subscribeBox(){return `<section class="native-subscribe"><span class="eyebrow">Korea 101 in your inbox</span><h2>Make a little room for Korea.</h2><p>Language, food, culture and places. Free to read here. We’re preparing two or three new stories a week.</p><form id="nativeSubscribe"><label for="subscriberEmail">Your email<input id="subscriberEmail" name="email" type="email" maxlength="254" autocomplete="email" required placeholder="you@example.com"></label><label class="check-row"><input type="checkbox" name="consent" required>I’d like free Korea 101 stories by email.</label><button class="sori-primary">${mailEnabled?'Subscribe for free':'Join the email waitlist'}</button><p class="small-note">${mailEnabled?'Confirm the email we send before delivery begins.':'Email delivery is not active yet. Joining the waitlist does not start newsletter emails; confirmation will be required.'}</p><p id="subscribeStatus" role="status" aria-live="polite"></p>${token?'<button type="button" class="text-button" data-cancel-subscription>Remove me from the email list</button>':''}</form></section>`;}
function preview(){const el=document.getElementById('homeStories');if(el)el.innerHTML=`<div class="home-section-heading"><div><span class="eyebrow">Korea 101 · Read it here</span><h2>A few minutes in Korea.</h2></div><button class="text-button" data-go="newsletter">All stories</button></div><div class="home-story-list">${stories.slice(0,2).map(card).join('')}</div>`;}
function archive(){
  const matches=matchingStories(stories,filter,query,bookmarks());
  const latest=filter==='All'&&!query.trim()?matches[0]:null;
  const featured=root.querySelector('#latestIssue');featured.hidden=!latest;
  featured.innerHTML=latest?`<button type="button" class="issue-cover" data-story="${latest.id}" aria-label="Read ${esc(latest.title)}"><img src="${esc(latest.photo)}" alt="${esc(latest.photoAlt)}" width="640" height="420"></button><div><span class="eyebrow">Latest issue · <time datetime="${esc(latest.published)}">${issueDate(latest)}</time></span><h2>${esc(latest.title)}</h2><p>${esc(latest.excerpt)}</p><div class="issue-actions"><button class="sori-primary" data-story="${latest.id}">Read · ${latest.minutes} min</button>${saveButton(latest)}</div></div>`:'';
  root.querySelector('#archiveTitle').textContent=latest?'More stories':filter==='Saved'?'Saved stories':'Stories';
  const list=latest?matches.slice(1):matches;
  root.querySelector('#archiveCount').textContent=list.length+' '+(list.length===1?'story':'stories');
  root.querySelector('#archiveList').innerHTML=list.length?list.map(card).join(''):`<p class="small-note">${filter==='Saved'&&!query.trim()?'Save a story to find it here.':'No new issues match.'} <button type="button" class="text-button" data-reset-stories>Browse all stories</button></p>`;
  const originalList=root.querySelector('#originalArchive');if(originalList)originalList.innerHTML=originalArchive();
  root.querySelectorAll('[data-story-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.storyFilter===filter)));
}

function readingPlace(){
  const entry=local.get('sori:reading-place');
  if(!entry||!Number.isInteger(entry.index)||entry.index<1)return null;
  const s=stories.find(s=>s.id===entry.id);return s&&entry.index<s.paragraphs.length?{s,index:entry.index}:null;
}

function noteReadingPlace(){
  if(!openStory||root.style.display==='none')return;
  const paragraphs=root.querySelectorAll('.story-body p'),last=paragraphs[paragraphs.length-1];if(!last)return;
  const line=window.innerHeight*.48;
  if(last.getBoundingClientRect().bottom<=line){if(local.get('sori:reading-place')?.id===openStory.id)local.set('sori:reading-place',null);return;}
  let index=-1;paragraphs.forEach((p,i)=>{if(p.getBoundingClientRect().top<=line)index=i;});
  if(index>=1)local.set('sori:reading-place',{id:openStory.id,index});
}

function feed(){
  openStory=null;const saved=location.hash==='#read=saved',resume=saved?null:readingPlace(),topics=['All',...new Set(stories.map(s=>s.category))];
  root.innerHTML=`<header class="story-feed-heading"><h1>${saved?'Saved stories':'Korea 101'}</h1></header>${resume?`<button class="reading-resume" data-story="${resume.s.id}" data-resume-reading="${resume.index}"><strong>Continue reading</strong><small>${esc(resume.s.title)}</small></button>`:''}<section class="latest-issue" id="latestIssue" aria-label="Latest issue"></section><section class="story-archive"><details class="story-search-options"><summary>Search &amp; topics</summary><label class="sr-only" for="storyQuery">Search the archive</label><input id="storyQuery" class="learn-search" type="search" placeholder="Search stories" value="${esc(query)}"><div class="story-filters" ${saved?'hidden':''} role="group" aria-label="Story topics">${topics.map(t=>`<button type="button" data-story-filter="${esc(t)}">${esc(t)}</button>`).join('')}</div></details><div class="archive-heading"><h2 id="archiveTitle">Stories</h2><span id="archiveCount" role="status"></span></div><div class="story-feed" id="archiveList"></div></section>${saved?'':'<section id="originalArchive" class="story-archive" aria-label="Original newsletters"></section>'}`;
  archive();
}
function paragraphWithAudio(paragraph, phrase) {
  const words = phrase.replace(/[.?!]+$/u,'');
  const start = paragraph.indexOf(words);
  if (start < 0 || !words) return esc(paragraph);
  const end = start + words.length;
  return esc(paragraph.slice(0,start)) +
    `<button type="button" class="inline-speech" data-inline-audio data-audio="${esc(phrase)}" aria-label="Listen to ${esc(phrase)}"><span lang="ko">${esc(words)}</span></button>` +
    esc(paragraph.slice(end));
}
function storyBody(story){
 return story.paragraphs.map((p,i)=>(story.headings||[]).filter(h=>h.before===i).map(h=>`<h2>${esc(h.title)}</h2>`).join('')+`<p id="story-paragraph-${i}" tabindex="-1">${paragraphWithAudio(p,story.phrase)}</p>`+(story.figures||[]).filter(f=>f.after===i).map(f=>`<figure class="story-figure"><img src="${esc(f.photo)}" alt="${esc(f.alt)}" loading="lazy"><figcaption>${esc(f.caption)}</figcaption></figure>`).join('')).join('');
}
function expressions(story,lesson){
 return `<section class="story-korean"><span class="eyebrow">Learning Korea through language</span><h2>Try these expressions</h2>${(story.expressions||[]).map(e=>`<div class="story-expression"><strong lang="ko">${esc(e.ko)}</strong><p class="roman-line">${esc(e.roman)}</p><p class="meaning-line">${esc(e.meaning)}</p><p class="story-example"><span lang="ko">${esc(e.example)}</span><br>${esc(e.translation)}</p><button type="button" class="sori-secondary" data-audio="${esc(e.ko)}">Listen</button></div>`).join('')}${lesson?`<button class="sori-primary" data-korean="${esc(story.phrase)}">Practise a related phrase ›</button>`:''}</section>`;
}
function originalArchive(){
 const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const available=filter==='All'?[...originals].filter(o=>terms.every(t=>o.title.toLocaleLowerCase().includes(t))).sort((a,b)=>b.date.localeCompare(a.date)):[];
 return available.length?`<div class="archive-heading"><h2>Original newsletters</h2><span>${available.length} issues</span></div><p class="small-note">Minwoo's original Korea 101 newsletter archive.</p><div class="story-originals">${available.map(o=>`<a href="${esc(o.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(o.title)}</strong><small>${esc(o.date)} · ${o.minutes} min · Read on Beehiiv</small></a>`).join('')}</div>`:'';
}
async function article(id,{push=false,paragraph=0}={}){const story=stories.find(s=>s.id===id);if(!story)return;const fromSaved=push?location.hash==='#read=saved':new URLSearchParams(location.hash.slice(1)).get('from')==='saved';
 const hash='#story='+id+(fromSaved?'&from=saved':'');
 if(push&&location.hash!==hash){if(!location.hash)history.replaceState(null,'','#read');history.pushState(null,'',hash);}openStory=story;const next=nextStory(stories,id);const lesson=Object.values(window.SoriDataIndex||{}).flat().find(p=>p.k===story.phrase);window.SoriNav?.show('newsletter');const reaction=local.get('sori:story-reaction:'+id);
 root.innerHTML=`<button type="button" class="text-button" data-stories-back="${fromSaved?'saved':'all'}">${fromSaved?'Back to saved stories':'All Korea 101 stories'}</button><article class="native-story"><header><span class="eyebrow">${esc(story.category)} · ${story.minutes} min read</span><h1>${esc(story.title)}</h1><p>${esc(story.excerpt)}</p><span class="story-byline">Korea 101 by Sori · <time datetime="${esc(story.published)}">${issueDate(story)}</time></span></header><img class="story-reader-photo" src="${story.photo}" alt="${esc(story.photoAlt)}" width="960" height="640">${story.photoContext?'<p class="story-cover-caption">'+esc(story.photoContext)+'</p>':''}<div class="story-reader-actions">${saveButton(story)}<button type="button" class="sori-secondary" data-story-share>Share story</button></div><div class="story-body">${storyBody(story)}</div>${story.sources.length?`<details class="story-sources"><summary>Reading & sources</summary>${story.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join('')}</details>`:''}${story.originalUrl?`<p><a class="text-button" href="${esc(story.originalUrl)}" target="_blank" rel="noopener noreferrer">Read the original newsletter ↗</a></p>`:''}${story.travel?`<p><a class="sori-primary" href="${esc(story.travel)}">Explore Sori’s matching travel guide ›</a></p>`:''}${expressions(story,lesson)}<section class="story-conversation"><h2>${esc(story.question)}</h2><button type="button" class="sori-secondary" data-story-question>Ask a friend this question</button><div class="story-reactions"><button type="button" data-story-reaction="useful" aria-pressed="${reaction==='useful'}">Useful <span id="usefulCount">0</span></button><button type="button" data-story-reaction="curious" aria-pressed="${reaction==='curious'}">Made me curious <span id="curiousCount">0</span></button></div><p id="storyStatus" role="status" aria-live="polite"></p></section>${next?`<aside class="story-next"><span class="eyebrow">Read next</span>${card(next)}</aside>`:''}</article>`;
 if(paragraph>0){const anchor=root.querySelector('#story-paragraph-'+paragraph);anchor?.focus({preventScroll:true});anchor?.scrollIntoView({block:'start'});}else window.scrollTo({top:0,behavior:'instant'});try{const counts=await call('stories/'+id+'/activity');if(openStory?.id===id)paintCounts(counts);}catch{if(openStory?.id===id){const counts=root.querySelectorAll('.story-reactions span');counts.forEach(n=>n.textContent='');}}}
function paintCounts(c){const a=root.querySelector('#usefulCount'),b=root.querySelector('#curiousCount');if(a)a.textContent=c.useful;if(b)b.textContent=c.curious;}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;try{
 if(b.dataset.story){await article(b.dataset.story,{push:true,paragraph:Number(b.dataset.resumeReading)||0});return;}
 if(b.hasAttribute('data-stories-back')){window.SoriNav.go(b.dataset.storiesBack==='saved'?'#read=saved':'#read');}
 if(b.dataset.storyFilter){filter=b.dataset.storyFilter;archive();}
 if(b.dataset.saveId){const ids=bookmarks(),id=b.dataset.saveId,saved=ids.includes(id);local.set('sori:story-bookmarks',saved?ids.filter(x=>x!==id):[...ids,id]);const s=stories.find(st=>st.id===id);if(s)document.querySelectorAll('[data-save-id="'+id+'"]').forEach(el=>{el.textContent=saved?'Save':'Saved';el.setAttribute('aria-pressed',String(!saved));el.setAttribute('aria-label',(saved?'Save story: ':'Remove from saved: ')+s.title);});if(!openStory&&filter==='Saved')archive();}
 if((b.hasAttribute('data-story-share')||b.hasAttribute('data-story-question'))&&openStory){await sharePublic({title:openStory.title,text:b.hasAttribute('data-story-question')?openStory.question:openStory.title,url:location.origin+'/stories/'+openStory.id+'/'},root.querySelector('#storyStatus'));}
 if(b.hasAttribute('data-reset-stories')&&location.hash==='#read=saved'){window.SoriNav.go('#read');return;}
 if(b.hasAttribute('data-reset-stories')){query='';filter='All';root.querySelector('#storyQuery').value='';archive();root.querySelector('#storyQuery').focus();}
 if(b.dataset.storyReaction&&openStory&&!busy){busy=true;const id=openStory.id,value=local.get('sori:story-reaction:'+id)===b.dataset.storyReaction?null:b.dataset.storyReaction;const counts=await call('stories/'+id+'/reaction','POST',{token:actor,value});local.set('sori:story-reaction:'+id,value);if(openStory?.id!==id)return;paintCounts(counts);root.querySelectorAll('[data-story-reaction]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.storyReaction===value)));root.querySelector('#storyStatus').textContent='Thanks. Your reaction is saved.';}
 if(b.hasAttribute('data-cancel-subscription')&&token){await call('newsletter/unsubscribe','POST',{token});root.querySelector('#subscribeStatus').textContent='You have been removed from this email list.';token=null;local.set('sori:subscription-cancel',null);b.remove();}
 }catch(error){const status=root.querySelector('#storyStatus')||root.querySelector('#subscribeStatus');if(status)status.textContent=error.message;}finally{busy=false;}});
root.addEventListener('submit',async e=>{if(e.target.id!=='nativeSubscribe')return;e.preventDefault();if(busy)return;busy=true;const f=e.target,b=f.querySelector('button');b.disabled=true;try{const data=new FormData(f),result=await call('newsletter/signup','POST',{email:data.get('email'),consent:data.get('consent')==='on'});if(result.cancelToken){token=result.cancelToken;local.set('sori:subscription-cancel',token);}root.querySelector('#subscribeStatus').textContent=result.message;if(token&&!root.querySelector('[data-cancel-subscription]')){const cancel=document.createElement('button');cancel.type='button';cancel.className='text-button';cancel.dataset.cancelSubscription='';cancel.textContent='Remove me from this list';root.querySelector('#subscribeStatus').after(cancel);}}catch(error){root.querySelector('#subscribeStatus').textContent=error.message;}finally{busy=false;b.disabled=false;}});
async function subscriptionLink(){const p=new URLSearchParams(location.hash.slice(1)),value=p.get('subscribe')||p.get('unsubscribe');if(!value)return;window.SoriNav?.show('newsletter');try{const result=await call(p.has('subscribe')?'newsletter/confirm':'newsletter/unsubscribe','POST',{token:value});root.querySelector('#subscribeStatus').textContent=result.status==='confirmed'?'Your Korea 101 subscription is confirmed.':'You are unsubscribed.';}catch(error){root.querySelector('#subscribeStatus').textContent=error.message;}}
function readRoute() {
 const hash=location.hash,p=new URLSearchParams(hash.slice(1));
 if(p.has('story')){if(!stories.some(s=>s.id===p.get('story'))){history.replaceState(null,'','#read');query='';filter='All';feed();window.SoriNav?.show('newsletter');return;}if(openStory?.id!==p.get('story') || root.querySelector('[data-stories-back]')?.dataset.storiesBack!==(p.get('from')==='saved'?'saved':'all'))article(p.get('story'));return;}
 if(hash==='#read=newsletter'||p.has('subscribe')||p.has('unsubscribe')){
   openStory=null;root.innerHTML='<header class="story-feed-heading"><h1>Newsletter</h1></header>'+subscribeBox();
   window.SoriNav?.show('newsletter');return;
 }
 if(hash==='#read'||hash==='#read=saved'){
   query='';filter=hash==='#read=saved'?'Saved':'All';feed();window.SoriNav?.show('newsletter');window.scrollTo({top:0,behavior:'instant'});
 }
}
try {
 const response=await fetch('data/stories.json?v=20261121curated');stories=(await response.json()).filter(s=>s.status==='published');
 originals=await fetch('data/original-issues.json?v=20261121editorial').then(r=>r.json()).catch(()=>[]);
 actor=local.get('sori:story-actor');if(!/^[A-Za-z0-9_-]{43}$/.test(actor||'')){actor=random();local.set('sori:story-actor',actor);}
 preview();feed();readRoute();
 call('newsletter/status').then(data=>{mailEnabled=data.emailEnabled;if(mailEnabled){const button=root.querySelector('#nativeSubscribe>button');if(button)button.textContent='Subscribe for free';const note=root.querySelector('#nativeSubscribe .small-note');if(note)note.textContent='Confirm the email we send before delivery begins.';}}).catch(()=>{});
 await subscriptionLink();
} catch {root.innerHTML='<p>We could not load Korea 101. Please refresh to try again.</p>';}
window.addEventListener('hashchange',readRoute);
root.addEventListener('input',e=>{if(e.target.id==='storyQuery'){query=e.target.value;archive();}});
let pendingScroll=false;
window.addEventListener('scroll',()=>{if(pendingScroll||!openStory||root.style.display==='none')return;pendingScroll=true;requestAnimationFrame(()=>{pendingScroll=false;noteReadingPlace();});},{passive:true});
window.SoriReader={openFeed(){feed();}};

export {};
