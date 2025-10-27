/* Sidebar and Menu Toggle */
(function() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarClose = document.getElementById('sidebarClose');
  const menuItems = document.querySelectorAll('.menu-item');
  const newsletterView = document.getElementById('newsletterView');
  const mainContent = document.getElementById('mainContent');

  function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function switchView(view) {
    if (view === 'newsletter') {
      mainContent.style.display = 'none';
      document.getElementById('quizView').style.display = 'none';
      newsletterView.style.display = 'flex';
    } else if (view === 'quiz') {
      mainContent.style.display = 'none';
      newsletterView.style.display = 'none';
      document.getElementById('quizView').style.display = 'flex';
    } else {
      newsletterView.style.display = 'none';
      document.getElementById('quizView').style.display = 'none';
      mainContent.style.display = 'block';
    }
    closeSidebar();
  }

  menuToggle?.addEventListener('click', openSidebar);
  sidebarClose?.addEventListener('click', closeSidebar);
  sidebarOverlay?.addEventListener('click', closeSidebar);

  menuItems?.forEach(item => {
    item.addEventListener('click', function() {
      const view = this.getAttribute('data-view');
      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      switchView(view);
    });
  });
})();

