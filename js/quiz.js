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
    
    if (!quizPlayBtn || !quizKorean || !quizOptions.length) {
      return; // Elements not ready yet
    }
    
    if (initialized) {
      return; // Already initialized
    }
    initialized = true;
    
    // TTS API endpoint
    const ENDPOINT = "https://asia-northeast3-sori-tts.cloudfunctions.net/tts";
    const audio = new Audio();
    let lastUrl = null;
    
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
      
      // Get random item from category
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex];
    }
    
    // Update quiz question
    function updateQuestion(category) {
      const questionData = getQuizData(category);
      
      if (!questionData) {
        console.error('No data available for category:', category);
        return;
      }
      
      // Update Korean text
      if (quizKorean) {
        quizKorean.textContent = questionData.k;
      }
      
      // Generate wrong answers (random from other items)
      const catMap = {
        'daily': 'daily',
        'travel': 'travel',
        'trendy': 'trendy',
        'drama': 'drama',
        'numbers': 'numbers'
      };
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
        
        // Update option buttons
        quizOptions.forEach((option, index) => {
          if (answers[index]) {
            option.textContent = answers[index];
            option.dataset.answer = answers[index];
            option.dataset.isCorrect = answers[index] === questionData.e;
            option.classList.remove('selected');
          }
        });
        
        // Disable submit button until new answer is selected
        if (quizSubmit) {
          quizSubmit.disabled = true;
        }
      }
    }
    
    // Quiz submit
    quizSubmit?.addEventListener('click', () => {
      if (selectedOption) {
        const isCorrect = selectedOption.dataset.isCorrect === 'true';
        
        if (isCorrect) {
          // Correct answer - show feedback and move to next question
          selectedOption.style.background = '#10b981';
          selectedOption.style.color = '#fff';
          selectedOption.style.borderColor = '#10b981';
          
          // Update score
          const scoreEl = document.getElementById('quizScore');
          if (scoreEl) {
            const currentScore = parseInt(scoreEl.textContent) || 0;
            scoreEl.textContent = currentScore + 1;
          }
          
          // Wait a bit then load next question
          setTimeout(() => {
            const activeCategory = document.querySelector('.quiz-category.active');
            if (activeCategory) {
              selectedOption = null;
              updateQuestion(activeCategory.dataset.category);
            }
          }, 1000);
        } else {
          // Wrong answer - show feedback
          selectedOption.style.background = '#ef4444';
          selectedOption.style.color = '#fff';
          selectedOption.style.borderColor = '#ef4444';
          
          // Highlight correct answer
          quizOptions.forEach(option => {
            if (option.dataset.isCorrect === 'true') {
              option.style.background = '#10b981';
              option.style.color = '#fff';
              option.style.borderColor = '#10b981';
            }
          });
          
          // Wait a bit then reload same question
          setTimeout(() => {
            selectedOption = null;
            const activeCategory = document.querySelector('.quiz-category.active');
            if (activeCategory) {
              updateQuestion(activeCategory.dataset.category);
            }
          }, 2000);
        }
      }
    });
    
    // Quiz category selection
    quizCategories.forEach(category => {
      category.addEventListener('click', function() {
        // Remove active class from all categories
        quizCategories.forEach(c => c.classList.remove('active'));
        // Add active class to clicked category
        this.classList.add('active');
        
        const selectedCategory = this.dataset.category;
        console.log('Category selected:', selectedCategory);
        
        // Load new question for selected category
        updateQuestion(selectedCategory);
      });
    });
    
    // Initialize first question
    const activeCategory = document.querySelector('.quiz-category.active');
    if (activeCategory) {
      updateQuestion(activeCategory.dataset.category);
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

