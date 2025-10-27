/* Daily Quiz Functionality */
(function() {
  let initialized = false;
  
  // Wait for DOM to be ready
  function initQuiz() {
    const quizPlayBtn = document.getElementById('quizPlayBtn');
    const quizKorean = document.querySelector('.quiz-korean');
    const quizOptions = document.querySelectorAll('.quiz-option');
    const quizSubmit = document.querySelector('.quiz-submit');
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
    let triesCount = 0;
    let currentStreak = 0;
    
    // TTS API endpoint
    const ENDPOINT = "https://asia-northeast3-sori-tts.cloudfunctions.net/tts";
    const audio = new Audio();
    let lastUrl = null;
    let currentSpeed = 0.80;
    
    // Get speed
    function getSpeed() {
      return currentSpeed;
    }
    
    // Set audio rate
    function setAudioRate() {
      audio.playbackRate = getSpeed();
    }
    
    // Speed control
    if (quizSpeed) {
      currentSpeed = parseFloat(quizSpeed.value);
      quizSpeed.addEventListener('input', (e) => {
        currentSpeed = parseFloat(e.target.value);
        if (quizSpeedVal) {
          quizSpeedVal.textContent = currentSpeed.toFixed(2) + 'x';
        }
        setAudioRate();
      });
    }
    
    // Play Korean text
    async function playKorean(text) {
      try {
        audio.pause();
      } catch(_) {}
      
      if (lastUrl) {
        try { URL.revokeObjectURL(lastUrl); } catch(_) {}
        lastUrl = null;
      }
      
      const t = (text || '').trim();
      if (!t) return;
      
      try {
        const r = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: t })
        });
        const b = await r.blob();
        const url = URL.createObjectURL(b);
        lastUrl = url;
        audio.src = url;
        setAudioRate();
        await audio.play();
      } catch(e) {
        console.error('TTS Error:', e);
      }
    }
    
    // Quiz play button
    quizPlayBtn.addEventListener('click', () => {
      if (quizKorean) {
        playKorean(quizKorean.textContent);
      }
    });
    
    // Quiz option selection
    let selectedOption = null;
    quizOptions.forEach(option => {
      option.addEventListener('click', function() {
        quizOptions.forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        selectedOption = this;
        if (quizSubmit) {
          quizSubmit.disabled = false;
        }
      });
    });
    
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
      currentQuestions = shuffled.slice(0, 10);
      currentQuestionIndex = 0;
      triesCount = 0;
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
      
      const LOCAL_KEY = "soriSaved";
      const savedList = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      const id = currentQuestionData.id;
      const isSaved = id && savedList.indexOf(id) >= 0;
      
      btn.classList.toggle('active', isSaved);
      const favoriteText = btn.querySelector('.quiz-favorite-text');
      if (favoriteText) {
        favoriteText.textContent = isSaved ? '★' : '☆';
      }
    }
    
    // Load current question
    function loadCurrentQuestion() {
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
            option.textContent = answers[index];
            option.dataset.answer = answers[index];
            option.dataset.isCorrect = answers[index] === questionData.e;
            option.classList.remove('selected');
            
            // Reset all button styles to default - important!
            option.removeAttribute('style');
          }
        });
        
        // Disable submit button until new answer is selected
        if (quizSubmit) {
          quizSubmit.disabled = true;
        }
        
        selectedOption = null;
        
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
          triesCount = 0;
          loadCurrentQuestion();
        }
      });
    }
    
    // Next question
    if (quizNextBtn) {
      quizNextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < currentQuestions.length - 1) {
          currentQuestionIndex++;
          triesCount = 0;
          loadCurrentQuestion();
        }
      });
    }
    
    // Play sound effect
    function playSoundEffect(type) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (type === 'correct') {
        // Correct answer: brighter, more joyful ascending melody
        const freqs = [523.25, 659.25, 783.99]; // C, E, G major triad
        let time = audioContext.currentTime;
        
        freqs.forEach((freq, i) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = freq;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, time);
          gainNode.gain.linearRampToValueAtTime(0.2, time + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
          
          oscillator.start(time);
          oscillator.stop(time + 0.2);
          time += 0.1;
        });
      } else {
        // Wrong answer: lower, descending tone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 400;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    }
    
    // Quiz submit
    quizSubmit?.addEventListener('click', () => {
      if (selectedOption) {
        const isCorrect = selectedOption.dataset.isCorrect === 'true';
        
        if (isCorrect) {
          // Play success sound
          playSoundEffect('correct');
          
          // Increment streak
          currentStreak++;
          updateStreakDisplay();
          
          // Correct answer - show feedback (purple)
          selectedOption.style.background = '#7c3aed';
          selectedOption.style.color = '#fff';
          selectedOption.style.borderColor = '#7c3aed';
          
          // Update score
          const scoreEl = document.getElementById('quizScore');
          if (scoreEl) {
            const currentScore = parseInt(scoreEl.textContent) || 0;
            scoreEl.textContent = currentScore + 1;
            // Animate score
            scoreEl.style.transform = 'scale(1.3)';
            setTimeout(() => scoreEl.style.transform = 'scale(1)', 200);
          }
          
          triesCount = 0; // Reset tries for next question
          
          // Wait a bit then load next question automatically
          setTimeout(() => {
            if (currentQuestionIndex < currentQuestions.length - 1) {
              currentQuestionIndex++;
              loadCurrentQuestion();
            }
          }, 1500);
        } else {
          // Play failure sound
          playSoundEffect('wrong');
          triesCount++;
          
          // Reset streak on wrong answer
          currentStreak = 0;
          updateStreakDisplay();
          
          // Wrong answer - show feedback (red)
          selectedOption.style.background = '#ef4444';
          selectedOption.style.color = '#fff';
          selectedOption.style.borderColor = '#ef4444';
          
          // Highlight correct answer in purple
          quizOptions.forEach(option => {
            if (option.dataset.isCorrect === 'true') {
              option.style.background = '#7c3aed';
              option.style.color = '#fff';
              option.style.borderColor = '#7c3aed';
            }
          });
          
          // Reset for another try (no timeout, just let user retry)
          setTimeout(() => {
            selectedOption = null;
            quizOptions.forEach((option, index) => {
              // Keep correct answer purple, reset others
              if (option.dataset.isCorrect !== 'true') {
                option.style.background = '';
                option.style.color = '';
                option.style.borderColor = '';
              }
              option.classList.remove('selected');
            });
            
            // Enable submit button for retry
            if (quizSubmit) {
              quizSubmit.disabled = true;
            }
          }, 1200);
        }
      }
    });
    
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
    
    // Quiz favorite button click handler
    function handleQuizFavoriteClick(e) {
      if (!e.target.closest('#quizFavoriteBtn')) return;
      
      const btn = document.getElementById('quizFavoriteBtn');
      if (!btn) return;
      
      const loggedIn = !!window.firebaseAuth?.currentUser;
      
      if (!loggedIn) {
        const modal = document.getElementById('authModal');
        if (modal) {
          modal.classList.add('open');
        }
        return;
      }
      
      if (!currentQuestionData) return;
      
      (async () => {
        try {
          const LOCAL_KEY = "soriSaved";
          const savedList = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
          const id = currentQuestionData.id;
          
          if (!id) return;
          
          const i = savedList.indexOf(id);
          let isActive;
          if (i >= 0) {
            savedList.splice(i, 1);
            isActive = false;
          } else {
            savedList.push(id);
            isActive = true;
          }
          
          localStorage.setItem(LOCAL_KEY, JSON.stringify(savedList));
          
          const user = window.firebaseAuth?.currentUser;
          if (user && user.uid && window.db) {
            try {
              await window.db.collection("users").doc(user.uid).set({ savedList: savedList }, { merge: true });
            } catch (e) {
              console.error('Cloud save error:', e);
            }
          }
          
          // Update UI
          updateFavoriteButtonState();
        } catch(e) {
          console.error('Save error:', e);
        }
      })();
    }
    
    // Only add listener once
    document.addEventListener('click', handleQuizFavoriteClick);
    
    
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

/* Logo Click to Home */
(function() {
  const logoHome = document.querySelector('.logo-home');
  const newsletterView = document.getElementById('newsletterView');
  const quizView = document.getElementById('quizView');
  const mainContent = document.getElementById('mainContent');
  const menuItems = document.querySelectorAll('.menu-item');
  
  logoHome?.addEventListener('click', () => {
    // Show Listen & Repeat view
    newsletterView.style.display = 'none';
    quizView.style.display = 'none';
    mainContent.style.display = 'block';
    
    // Update active menu item
    menuItems.forEach(item => {
      if (item.getAttribute('data-view') === 'listen') {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  });
})();

