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
    
    // Quiz submit
    quizSubmit?.addEventListener('click', () => {
      if (selectedOption) {
        console.log('Selected:', selectedOption.textContent);
        // TODO: Implement answer checking
      }
    });
    
    // Quiz category selection
    quizCategories.forEach(category => {
      category.addEventListener('click', function() {
        // Remove active class from all categories
        quizCategories.forEach(c => c.classList.remove('active'));
        // Add active class to clicked category
        this.classList.add('active');
        console.log('Category selected:', this.getAttribute('data-category'));
        // TODO: Load questions for selected category
      });
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuiz);
  } else {
    initQuiz();
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

