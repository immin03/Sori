/* js/app.js — 2025.10 Fixed version
   탭 이동 + 스크랩 + 연습 진행 통합
*/

(function(){
  let currentCategory = "daily";
  let currentIndex = 0;
  let phrases = [];
  let savedList = [];

  const els = {
    dailyBtn: document.getElementById("dailyBtn"),
    travelBtn: document.getElementById("travelBtn"),
    dramaBtn: document.getElementById("dramaBtn"),
    savedBtn: document.getElementById("savedBtn"),
    scrapBtn: document.getElementById("scrapBtn"),
    badge: document.getElementById("badge"),
    context: document.getElementById("context"),
    korean: document.getElementById("korean"),
    english: document.getElementById("english"),
    pronunciation: document.getElementById("pronunciation"),
    repDots: [...document.querySelectorAll(".rep-dot")],
    repCount: document.getElementById("repCount"),
    playBtn: document.getElementById("playBtn"),
    nextBtn: document.getElementById("nextBtn"),
    prevBtn: document.getElementById("prevBtn"),
    prog: document.getElementById("prog"),
    errorMsg: document.getElementById("errorMsg"),
    speed: document.getElementById("speed"),
    speedTxt: document.getElementById("speedTxt"),
    tip: document.querySelector(".practice-tip"),
  };

  // ---------- 데이터 불러오기 ----------
  function loadData(){
    if(window.SoriDataIndex){
      const all = window.SoriDataIndex;
      phrases = all[currentCategory] || [];
      renderPhrase();
    }
  }

  // ---------- 탭 클릭 ----------
  function setActiveTab(tab){
    ["daily","travel","drama","saved"].forEach(id=>{
      const el = document.getElementById(id+"Btn");
      el.classList.toggle("active", id===tab);
    });
  }

  function handleTab(tab){
    currentCategory = tab;
    currentIndex = 0;
    if(tab==="saved"){
      if(!window.firebase?.auth?.currentUser){
        showMessage("Please login to check your scraps.");
        phrases = [];
        renderPhrase();
        return;
      }
      phrases = savedList.map(id=>findPhraseById(id)).filter(Boolean);
      if(phrases.length===0) showMessage("No saved phrases yet.");
    }else{
      loadData();
    }
    setActiveTab(tab);
  }

  // ---------- 문장 렌더링 ----------
  function renderPhrase(){
    if(!phrases || phrases.length===0){
      els.korean.textContent = "";
      els.english.textContent = "";
      els.pronunciation.textContent = "";
      els.badge.textContent = "";
      els.context.textContent = "";
      els.prog.textContent = "";
      return;
    }
    const p = phrases[currentIndex];
    els.korean.textContent = p.k;
    els.english.textContent = `"${p.e}"`;
    els.pronunciation.textContent = p.p || "";
    els.badge.textContent = p.t || "";
    els.context.textContent = p.c || "";
    els.prog.textContent = `${currentIndex+1} / ${phrases.length}`;
    updateScrapBtn(p.id);
    resetDots();
  }

  // ---------- 별 스크랩 ----------
  function updateScrapBtn(id){
    if(savedList.includes(id)){
      els.scrapBtn.classList.add("active");
      els.scrapBtn.textContent = "★";
    }else{
      els.scrapBtn.classList.remove("active");
      els.scrapBtn.textContent = "☆";
    }
  }

  function toggleScrap(){
    const user = window.firebase?.auth?.currentUser;
    if(!user){
      alert("Please login to save phrases.");
      return;
    }
    const p = phrases[currentIndex];
    if(!p) return;
    const id = p.id;
    const i = savedList.indexOf(id);
    if(i>=0) savedList.splice(i,1);
    else savedList.push(id);
    updateScrapBtn(id);

    // Firestore에 저장
    if(window.db && user){
      db.collection("users").doc(user.uid).set({ savedList }, { merge:true });
    }else{
      localStorage.setItem("soriSaved", JSON.stringify(savedList));
    }
  }

  function findPhraseById(id){
    for(const cat of ["daily","travel","drama"]){
      const found = (window.SoriDataIndex[cat]||[]).find(p=>p.id===id);
      if(found) return found;
    }
    return null;
  }

  // ---------- 연습/음성 ----------
  function resetDots(){
    els.repDots.forEach(dot=>dot.classList.remove("completed"));
    els.repCount.textContent = 0;
  }

  function playAudio(){
    try{
      const txt = els.korean.textContent;
      const rate = parseFloat(els.speed.value);
      const utter = new SpeechSynthesisUtterance(txt);
      utter.lang = "ko-KR";
      utter.rate = rate;
      speechSynthesis.speak(utter);
      markDot();
    }catch(e){
      console.warn(e);
      showError("Audio playback failed.");
    }
  }

  function markDot(){
    let current = parseInt(els.repCount.textContent);
    if(current<5){
      current++;
      els.repCount.textContent = current;
      els.repDots[current-1].classList.add("completed");
      if(current===5){
        const g = document.getElementById("congrats");
        if(g){ g.classList.add("show"); setTimeout(()=>g.classList.remove("show"),2000); }
      }
    }
    if(window.SoriState?.onPracticeComplete){
      const p = phrases[currentIndex];
      window.SoriState.onPracticeComplete(p.id, 5);
    }
  }

  // ---------- Next / Prev ----------
  function nextPhrase(){
    if(currentIndex<phrases.length-1){ currentIndex++; renderPhrase(); }
  }
  function prevPhrase(){
    if(currentIndex>0){ currentIndex--; renderPhrase(); }
  }

  // ---------- Helpers ----------
  function showError(msg){
    els.errorMsg.style.display="block";
    els.errorMsg.textContent=msg;
    setTimeout(()=>{els.errorMsg.style.display="none";},2000);
  }
  function showMessage(msg){
    els.korean.textContent=msg;
    els.english.textContent="";
    els.pronunciation.textContent="";
    els.badge.textContent="";
    els.context.textContent="";
    els.prog.textContent="";
  }

  // ---------- 이벤트 바인딩 ----------
  function initEvents(){
    els.dailyBtn?.addEventListener("click",()=>handleTab("daily"));
    els.travelBtn?.addEventListener("click",()=>handleTab("travel"));
    els.dramaBtn?.addEventListener("click",()=>handleTab("drama"));
    els.savedBtn?.addEventListener("click",()=>handleTab("saved"));

    els.scrapBtn?.addEventListener("click",toggleScrap);
    els.playBtn?.addEventListener("click",playAudio);
    els.nextBtn?.addEventListener("click",nextPhrase);
    els.prevBtn?.addEventListener("click",prevPhrase);
    els.speed?.addEventListener("input",()=>{ els.speedTxt.textContent=els.speed.value+"x"; });
  }

  // ---------- 초기화 ----------
  window.addEventListener("DOMContentLoaded",()=>{
    const local = localStorage.getItem("soriSaved");
    if(local) savedList = JSON.parse(local);
    initEvents();
    loadData();
  });

  // 로그인 후 Firestore에서 savedList 로드
  if(window.firebase?.auth){
    firebase.auth().onAuthStateChanged(async user=>{
      if(user && window.db){
        const ref = db.collection("users").doc(user.uid);
        const snap = await ref.get();
        if(snap.exists && snap.data().savedList){
          savedList = snap.data().savedList;
          localStorage.setItem("soriSaved", JSON.stringify(savedList));
        }
      }
    });
  }
})();
