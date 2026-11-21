import {mountSpokenTurn,spokenTurnControls} from './learning/spoken-turn.js?v=20261121focus';
import {optionNames,spokenOption} from './learning/quiz-choice.js?v=20261121nav';
/* Daily Quiz Functionality */
(function() {
  let initialized = false;
  
  // Wait for DOM to be ready
  function initQuiz() {
    const quizPlayBtn = document.getElementById('quizPlayBtn');
    const quizKorean = document.querySelector('.quiz-korean');
    const quizOptions = document.querySelectorAll('.quiz-option');
    const voiceSlot=document.getElementById('quizVoice'), feedback=document.getElementById('quizFeedback');
    const quizCategories = document.querySelectorAll('.quiz-category');
    const quizSpeed = document.getElementById('quizSpeed');
    const quizSpeedVal = document.getElementById('quizSpeedVal');
    const quizPrevBtn = document.getElementById('quizPrevBtn');
    const quizNextBtn = document.getElementById('quizNextBtn');
    const quizFavoriteBtn = document.getElementById('quizFavoriteBtn');
    const quizInfoBtn = document.getElementById('quizInfoBtn');
    
    if (!quizPlayBtn || !quizKorean || !quizOptions.length) {
      return; // Elements not ready yet
    }
    
    if (initialized) {
      return; // Already initialized
    }
    initialized = true;
    
    let currentQuestionData = null;
    
    // Quiz state
    let currentQuestions = [];
    let currentQuestionIndex = -1;
    let currentStreak = 0;
    let turn=null, armed=false, retryTimer, advanceTimer;
    const solved=new Set();
    const visible=()=>document.getElementById('quizView').style.display==='block';
    function clearTimers(){clearTimeout(retryTimer);clearTimeout(advanceTimer);}
    function setupVoice(start=false) {
      turn?.dispose();turn=null;
      if(!visible() || !currentQuestionData)return;
      const answers=Array.from(quizOptions,o=>o.dataset.answer);
      const correct=Array.from(quizOptions).findIndex(o=>o.dataset.isCorrect==='true');
      if(correct<0 || solved.has(currentQuestionIndex)){voiceSlot.replaceChildren();return;}
      voiceSlot.innerHTML=spokenTurnControls({choice:true,externalButton:true});
      turn=mountSpokenTurn(voiceSlot,window,{cue:currentQuestionData.k,answer:answers[correct],alternatives:optionNames(correct),
        language:'en-US',choice:true,externalButton:quizPlayBtn,start,rate:()=>currentSpeed,onMode:()=>{armed=true;},
        onVerdict(kind,text){
          if(kind==='unavailable')armed=false;
          if(kind!=='correct' && kind!=='retry')return;
          const i=spokenOption(text,answers);
          if(i<0){feedback.textContent='Say an option number from one to four, or tap your answer.';return;}
          grade(quizOptions[i]);
        }});
    }
    window.SoriQuiz={start(){if(!turn)setupVoice();turn?.play();}};
    window.addEventListener('sori-view',e=>{
      if(e.detail.view==='quiz'){if(!turn)setupVoice();return;}
      clearTimers();armed=false;turn?.dispose();turn=null;
    });
    document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimers();armed=false;turn?.onModel();}});
    window.addEventListener('pagehide',()=>{clearTimers();armed=false;turn?.dispose();turn=null;});
    
    const quizAudio = window.SORI.TTS;
    let currentSpeed = parseFloat(quizSpeed?.value || '0.8');
    quizSpeed?.addEventListener('input', e => {
      currentSpeed=parseFloat(e.target.value);
      if (quizSpeedVal) quizSpeedVal.textContent=currentSpeed.toFixed(2)+'x';
      quizAudio.setRate(currentSpeed);
    });
    quizOptions.forEach(option => option.addEventListener('click',()=>grade(option)));

    // Get quiz data
    function getQuizData(category) {
      const catMap = {
        'daily': 'daily',
        'travel': 'travel',
        'trendy': 'trendy',
        'drama': 'drama',
        'numbers': 'numbers'
      };
      
      const catKey = catMap[category] || 'daily';
      const data = window.SORI_DATA && window.SORI_DATA[catKey];
      
      if (!data || data.length === 0) {
        return null;
      }
      
      return data;
    }
    
    // Load questions for category
    function loadQuestions(category) {
      const data = getQuizData(category);
      if (!data) {
        console.error('No data available for category:', category);
        return;
      }
      
      // Get 10 random questions
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      currentQuestions = shuffled.slice(0, 10);solved.clear();
      document.getElementById('quizScore').textContent='0';
      currentQuestionIndex = 0;
      document.getElementById("quizTotal").textContent = currentQuestions.length;
      currentStreak = 0; // Reset streak
      updateStreakDisplay();
      
      // Update navigation buttons
      updateNavButtons();
      
      // Load first question
      loadCurrentQuestion();
    }
    
    function updateFavoriteButtonState() {
      const btn = document.getElementById('quizFavoriteBtn');
      if (!currentQuestionData || !btn) return;
      
      try {
        // Get the actual id from SoriDataIndex
        const activeCategory = document.querySelector('.quiz-category.active');
        const category = activeCategory ? activeCategory.dataset.category : 'daily';
        const catData = window.SoriDataIndex && window.SoriDataIndex[category];
        
        if (!catData) {
          console.log('No category data found');
          return;
        }
        
        // Find the actual item with id from SoriDataIndex
        const foundItem = catData.find(item => 
          item.k === currentQuestionData.k && item.e === currentQuestionData.e
        );
        
        console.log('Found item:', foundItem);
        
        if (!foundItem || !foundItem.id) {
          console.log('No item or ID found');
          return;
        }
        
        const LOCAL_KEY = "soriSaved";
        const savedList = window.SoriSaved?.list || [];
        const isSaved = savedList.indexOf(foundItem.id) >= 0;
        
        console.log('Checking save state for ID:', foundItem.id, 'Is saved:', isSaved);
        
        btn.classList.toggle('active', isSaved);
        const favoriteText = btn.querySelector('.quiz-favorite-text');
        if (favoriteText) {
          favoriteText.textContent = isSaved ? 'Saved' : 'Save';
          console.log('Updated star icon to:', favoriteText.textContent);
        }
      } catch(e) {
        console.error('updateFavoriteButtonState error:', e);
      }
    }
    
    // Load current question
    function loadCurrentQuestion() {
      clearTimers();turn?.dispose();turn=null;feedback.textContent='';quizPlayBtn.hidden=false;
      if (currentQuestions.length === 0 || currentQuestionIndex < 0 || currentQuestionIndex >= currentQuestions.length) {
        return;
      }
      
      const questionData = currentQuestions[currentQuestionIndex];
      currentQuestionData = questionData; // Store for favorite button
      
      // Update Korean text
      if (quizKorean) {
        quizKorean.textContent = questionData.k;
      }
      
      // Update favorite button state after DOM updates
      setTimeout(() => updateFavoriteButtonState(), 50);
      
      // Get all questions for wrong answers
      const catMap = {
        'daily': 'daily',
        'travel': 'travel',
        'trendy': 'trendy',
        'drama': 'drama',
        'numbers': 'numbers'
      };
      const activeCategory = document.querySelector('.quiz-category.active');
      const category = activeCategory ? activeCategory.dataset.category : 'daily';
      const catKey = catMap[category] || 'daily';
      const categoryData = window.SORI_DATA && window.SORI_DATA[catKey];
      
      if (categoryData && quizOptions.length >= 4) {
        // Shuffle all items and pick 3 wrong answers
        const shuffled = [...categoryData].sort(() => Math.random() - 0.5);
        const wrongAnswers = shuffled
          .filter(item => item.e !== questionData.e)
          .slice(0, 3)
          .map(item => item.e);
        
        // Create answer options: correct answer + 3 wrong answers
        const answers = [questionData.e, ...wrongAnswers];
        answers.sort(() => Math.random() - 0.5);
        
        // Update option buttons and reset styles
        quizOptions.forEach((option, index) => {
          if (answers[index]) {
            option.textContent = (index+1) + '. ' + answers[index];
            option.dataset.answer = answers[index];
            option.dataset.isCorrect = answers[index] === questionData.e;
            option.classList.remove('selected');option.removeAttribute('data-verdict');
            
            // Reset all button styles to default - important!
            option.removeAttribute('style');
          }
        });
        
        if(solved.has(currentQuestionIndex)){
          feedback.textContent='You answered this question correctly.';
          for(const option of quizOptions)if(option.dataset.isCorrect==='true')option.classList.add('selected');
          quizPlayBtn.hidden=true;
        }
        setupVoice(armed);
        // Update navigation buttons
        updateNavButtons();
      }
    }
    
    // Update navigation buttons
    function updateNavButtons() {
      if (quizPrevBtn) {
        quizPrevBtn.disabled = currentQuestionIndex === 0;
      }
      if (quizNextBtn) {
        quizNextBtn.disabled = currentQuestionIndex >= currentQuestions.length - 1;
      }
    }
    
    // Previous question
    if (quizPrevBtn) {
      quizPrevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
          currentQuestionIndex--;
          loadCurrentQuestion();
        }
      });
    }
    
    // Next question
    if (quizNextBtn) {
      quizNextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < currentQuestions.length - 1) {
          currentQuestionIndex++;
          loadCurrentQuestion();
        }
      });
    }
    
    function grade(option) {
      if(!visible() || solved.has(currentQuestionIndex))return;
      turn?.onModel();clearTimers();
      const correct=option.dataset.isCorrect==='true';
      for(const b of quizOptions){b.classList.toggle('selected',b===option);b.removeAttribute('data-verdict');}
      option.dataset.verdict=correct?'correct':'retry';
      if(correct){
        solved.add(currentQuestionIndex);currentStreak++;updateStreakDisplay();
        document.getElementById('quizScore').textContent=String(solved.size);quizPlayBtn.hidden=true;
        feedback.textContent=currentQuestionIndex===currentQuestions.length-1?'Quiz complete. '+solved.size+' of '+currentQuestions.length+' answered correctly.':'Correct!';
        turn?.dispose();turn=null;voiceSlot.replaceChildren();
        if(currentQuestionIndex<currentQuestions.length-1)advanceTimer=setTimeout(()=>{
          if(visible()&&!document.hidden){currentQuestionIndex++;loadCurrentQuestion();}
        },1500);
      }else{
        currentStreak=0;updateStreakDisplay();
        feedback.textContent='Not quite. Try another meaning.';
        retryTimer=setTimeout(()=>{if(!visible())return;option.removeAttribute('data-verdict');option.classList.remove('selected');},1200);
      }
    }

    // Update streak display with animation
    function updateStreakDisplay() {
      const streakEl = document.getElementById('quizStreak');
      if (streakEl) {
        streakEl.textContent = currentStreak;
        if (currentStreak > 0) {
          streakEl.parentElement.style.transform = 'scale(1.15)';
          streakEl.parentElement.style.transition = 'transform 0.2s ease';
          setTimeout(() => {
            streakEl.parentElement.style.transform = 'scale(1)';
          }, 200);
        }
      }
    }
    
    // Quiz category selection
    quizCategories.forEach(category => {
      category.addEventListener('click', function() {
        // Remove active class from all categories
        quizCategories.forEach(c => c.classList.remove('active'));
        // Add active class to clicked category
        this.classList.add('active');
        
        const selectedCategory = this.dataset.category;
        console.log('Category selected:', selectedCategory);
        
        // Load questions for selected category
        loadQuestions(selectedCategory);
      });
    });
    
    // Quiz favorite button
    if (quizFavoriteBtn) {
      
      quizFavoriteBtn.addEventListener('click', async function() {
        const user = window.firebaseAuth?.currentUser;
        
        if (!user) {
          const modal = document.getElementById('authModal');
          if (modal) modal.classList.add('open');
          return;
        }
        
        if (!currentQuestionData) return;
        
        try {
          // Get category
          const activeCategory = document.querySelector('.quiz-category.active');
          const category = activeCategory ? activeCategory.dataset.category : 'daily';
          const catData = window.SoriDataIndex && window.SoriDataIndex[category];
          
          if (!catData) return;
          
          // Find the actual item with id from SoriDataIndex
          const foundItem = catData.find(item => 
            item.k === currentQuestionData.k && item.e === currentQuestionData.e
          );
          
          if (!foundItem || !foundItem.id) return;
          
          window.SoriSaved?.toggle(foundItem.id);
          updateFavoriteButtonState();
        } catch(e) {
          console.error('Quiz favorite error:', e);
        }
      });
    } else {
      console.log('Quiz favorite button not found');
    }
    
    window.addEventListener('savedListChanged', updateFavoriteButtonState);
    // Initialize first question
    const activeCategory = document.querySelector('.quiz-category.active');
    if (activeCategory) {
      loadQuestions(activeCategory.dataset.category);
    }
  }
  
    // Initialize when DOM is ready
    function tryInit() {
      // Check if SORI_DATA is available
      if (window.SORI_DATA) {
        initQuiz();
      } else {
        // Wait for data to load
        setTimeout(tryInit, 100);
      }
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryInit);
    } else {
      tryInit();
    }
})();

