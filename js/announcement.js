/* Quiz Announcement Popup */
(function() {
  const ANNOUNCEMENT_KEY = 'quiz_announcement_shown';
  const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  function shouldShowAnnouncement() {
    const lastShown = localStorage.getItem(ANNOUNCEMENT_KEY);
    if (!lastShown) {
      return true; // Never shown
    }
    
    const lastShownTime = parseInt(lastShown, 10);
    const now = Date.now();
    const timeSinceLastShown = now - lastShownTime;
    
    // Show if more than 1 day has passed
    return timeSinceLastShown > ONE_DAY;
  }
  
  function markAnnouncementShown() {
    localStorage.setItem(ANNOUNCEMENT_KEY, Date.now().toString());
  }
  
  function showAnnouncement() {
    const overlay = document.getElementById('announcementOverlay');
    const popup = document.getElementById('announcementPopup');
    
    if (overlay && popup) {
      overlay.classList.add('show');
      popup.classList.add('show');
    }
  }
  
  function hideAnnouncement() {
    const overlay = document.getElementById('announcementOverlay');
    const popup = document.getElementById('announcementPopup');
    
    if (overlay && popup) {
      overlay.classList.remove('show');
      popup.classList.remove('show');
    }
  }
  
  function setupAnnouncement() {
    const overlay = document.getElementById('announcementOverlay');
    const popup = document.getElementById('announcementPopup');
    const checkBox = document.getElementById('announcementDontShow');
    const closeBtn = document.querySelector('.announcement-close');
    
    if (!overlay || !popup) {
      return;
    }
    
    // Check if should show announcement
    if (shouldShowAnnouncement()) {
      showAnnouncement();
    }
    
    // Close button
    closeBtn?.addEventListener('click', () => {
      if (checkBox?.checked) {
        markAnnouncementShown();
      }
      hideAnnouncement();
    });
    
    // Overlay click to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        if (checkBox?.checked) {
          markAnnouncementShown();
        }
        hideAnnouncement();
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAnnouncement);
  } else {
    setupAnnouncement();
  }
})();

