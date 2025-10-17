<!doctype html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-X1909BBKR5"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-X1909DBKR5'); /* ← 필요 시 맞게 수정 */
  </script>

  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sori - Learn Korean</title>

  <!-- Firebase -->
  <script defer src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script defer src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  <script defer src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 680px; margin: 0 auto; padding: 12px; background: #faf8ff; min-height: 100vh; }
    h1 { font-size: 24px; margin: 0 0 4px 0; color: #7c3aed; font-weight: 800; }
    .intro { color: #9ca3af; font-size: 12px; margin-bottom: 10px; line-height: 1.3; font-weight: 500; }

    .header-container { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; position: relative; z-index: 1; }
    .header-right { display:flex; gap:8px; }

    /* 상단 Login/Logout 작은 버튼 */
    .top-btn{ padding:6px 12px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; border:0; }
    .top-btn.primary{ background:#7c3aed; color:#fff; }
    .top-btn:not(.primary){ background:#f9fafb; color:#6b7280; border:2px solid #e5e7eb; }
    .top-btn:not(.primary):hover{ background:#f3f4f6; }

    .card { border-radius: 16px; padding: 16px; margin: 8px 0; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); background: white; }

    /* 4열 탭 */
    .category-tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 8px; }
    .tab-button { padding: 10px 14px; border: 2px solid #f3f4f6; border-radius: 14px; background: #f9fafb; color: #9ca3af; cursor: pointer; font-size: 13px; font-weight: 700; transition: all 0.2s; }
    .tab-button:hover { background: #f3f4f6; }
    .tab-button.active { background: #7c3aed; color: white; border-color: #7c3aed; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2); }

    .sub-filters { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px; padding: 10px; background: #f9fafb; border-radius: 10px; }
    .filter-chip { padding: 5px 10px; border-radius: 14px; background: white; border: 2px solid #e5e7eb; color: #6b7280; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s; }
    .filter-chip:hover { background: #f9fafb; }
    .filter-chip.active { background: #7c3aed; color: white; border-color: #7c3aed; }

    .badge { display: inline-block; background: #7c3aed; color: white; padding: 5px 10px; border-radius: 10px; font-size: 11px; font-weight: 800; margin-bottom: 5px; }
    .context-box { background: #f9fafb; border-radius: 8px; padding: 6px 10px; margin-bottom: 10px; font-size: 12px; color: #6b7280; font-weight: 600; }
    .korean-section { background: #f9fafb; border-radius: 14px; padding: 16px 12px; margin: 8px 0; }
    .target-display { font-size: 28px; font-weight: 900; color: #1f2937; text-align: center; line-height: 1.2; margin-bottom: 6px; }
    .english-translation { color: #6b7280; font-size: 16px; text-align: center; margin-bottom: 10px; font-weight: 600; }
    .pronunciation-hint { color: #9ca3af; font-size: 13px; font-weight: 600; text-align: center; letter-spacing: 0.3px; margin-bottom: 0; font-style: italic; }

    button { padding: 12px 18px; border: 0; border-radius: 14px; background: #7c3aed; color: white; cursor: pointer; font-size: 15px; font-weight: 800; width: 100%; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2); transition: all 0.2s; }
    button:hover { background: #6d28d9; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25); }
    button:disabled { opacity: 0.4; cursor: not-allowed; }
    button.secondary { background: #f9fafb; color: #6b7280; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); }
    button.secondary:hover { background: #f3f4f6; }

    /* ★ 스크랩 버튼 – 테두리 없음, 중앙정렬, 상태색 유지 */
    .icon-btn{
      border: none;
      background: transparent;
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      line-height: 1;
      padding: 0;
      color: #9ca3af;     /* 기본 회색 */
      cursor: pointer;
    }
    .icon-btn:hover{ transform: scale(1.04); }
    .icon-btn.active{ color: #d97706; } /* 저장 시 강조색 */

    .button-group { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px; }
    .practice-tip { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 12px; border-radius: 10px; margin-top: 8px; font-size: 12px; color: #92400e; line-height: 1.4; font-weight: 500; }
    .repetition-tracker { margin: 8px 0; padding: 10px; background: #f9fafb; border-radius: 10px; }
    .repetition-label { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 8px; text-align: center; }
    .repetition-dots { display: flex; gap: 5px; justify-content: center; margin-bottom: 8px; }
    .rep-dot { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #e5e7eb; background: white; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.3s; }
    .rep-dot.completed { background: #7c3aed; border-color: #7c3aed; transform: scale(1.1); }
    .congratulations { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 12px; border-radius: 10px; text-align: center; margin: 8px 0; display: none; animation: slideIn 0.5s ease-out; }
    .congratulations.show { display: block; }
    .congratulations-emoji { font-size: 36px; margin-bottom: 4px; }
    .congratulations-text { font-size: 16px; font-weight: 800; color: #92400e; margin-bottom: 2px; }
    .congratulations-subtext { font-size: 12px; color: #92400e; font-weight: 600; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .progress { text-align: center; color: #7c3aed; font-size: 13px; font-weight: 700; margin-top: 8px; }
    .voice-speed { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 8px; }
    .voice-speed label { color: #7c3aed; font-size: 12px; font-weight: 600; }
    .voice-speed input { width: 110px; cursor: pointer; }
    .voice-speed span { color: #7c3aed; font-weight: 700; font-size: 12px; min-width: 45px; }
    .error-msg { background: #fee2e2; color: #991b1b; padding: 8px 12px; border-radius: 8px; margin-top: 8px; font-size: 11px; font-weight: 600; display: none; }

    @media (max-width: 640px) {
      body { padding: 12px; }
      h1 { font-size: 24px; }
      .card { padding: 16px; }
      .target-display { font-size: 28px; }
      .pronunciation-hint { font-size: 15px; }
      .category-tabs { grid-template-columns: 1fr; } /* 모바일에서는 한 줄씩 */
    }

    /* 로그인 모달 */
    .auth-section { 
      display: none; position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.45);
      align-items: center; justify-content: center;
      z-index: 9999; padding: 16px; pointer-events: auto;
    }
    .auth-section:not(.hidden){ display:flex; }
    .auth-card{ max-width: 360px; width: 100%; padding: 24px; border-radius: 18px; background: white; box-shadow: 0 18px 50px rgba(0,0,0,0.35); position: relative; pointer-events: auto; text-align: center; }
    .auth-close { position:absolute; top:10px; right:10px; background:none; border:none; font-size:22px; color:#9ca3af; cursor:pointer; width:32px; height:32px; border-radius:8px; line-height:1; }
    .auth-close:hover { background:#f3f4f6; color:#6b7280; }
    .auth-title { font-size: 24px; font-weight: 800; color: #7c3aed; margin-bottom: 6px; }
    .auth-subtitle { font-size: 13px; color: #9ca3af; margin-bottom: 18px; }
    .google-login-btn { background: white; border: 2px solid #e5e7eb; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; color: #1f2937; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 12px; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); user-select: none; }
    .google-login-btn:hover { background:#f9fafb; }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header-container">
    <div class="header-left">
      <h1>Sori <span style="font-size: 14px; color: #9ca3af; font-weight: 600;">(beta)</span></h1>
      <div class="intro">Master Korean with K-Drama lines and daily conversations</div>
    </div>
    <div class="header-right">
      <button id="loginBtn" class="top-btn primary">Login</button>
    </div>
  </div>

  <div class="card">
    <div class="category-tabs">
      <button class="tab-button active" id="dailyBtn">Daily</button>
      <button class="tab-button" id="travelBtn">Travel</button>
      <button class="tab-button" id="dramaBtn">K-Drama</button>
      <button class="tab-button" id="savedBtn">★ Saved</button> <!-- Saved 탭 추가 -->
    </div>
    <div id="subFilters" style="display:none;"></div>
  </div>

  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div class="badge" id="badge">Greeting</div>
      <!-- 스크랩 버튼 -->
      <button id="scrapBtn" class="icon-btn" title="Save this phrase">☆</button>
    </div>

    <div class="context-box" id="context">Conversation: First meeting</div>

    <div class="korean-section">
      <div class="target-display" id="korean">안녕하세요.</div>
      <div class="english-translation" id="english">"Hello"</div>
      <div class="pronunciation-hint" id="pronunciation">annyeonghaseyo</div>
    </div>

    <div class="repetition-tracker">
      <div class="repetition-label">Practice Count: <span id="repCount">0</span> / 5</div>
      <div class="repetition-dots" id="repDots">
        <div class="rep-dot" id="dot1"></div>
        <div class="rep-dot" id="dot2"></div>
        <div class="rep-dot" id="dot3"></div>
        <div class="rep-dot" id="dot4"></div>
        <div class="rep-dot" id="dot5"></div>
      </div>
    </div>

    <div class="congratulations" id="congrats">
      <div class="congratulations-emoji">🎉</div>
      <div class="congratulations-text">참 잘했어요!</div>
      <div class="congratulations-subtext">Great job! Ready for the next one?</div>
    </div>

    <button id="playBtn">Listen & Repeat</button>
    <div class="error-msg" id="errorMsg"></div>

    <div class="voice-speed">
      <label>Speed:</label>
      <input type="range" id="speed" min="0.3" max="1.0" step="0.1" value="0.75">
      <span id="speedTxt">0.75x</span>
    </div>

    <div class="practice-tip">
      Tip: Listen carefully and repeat multiple times. Consistency is key.
    </div>
  </div>

  <div class="card">
    <div class="button-group">
      <button class="secondary" id="prevBtn">◀ Previous</button>
      <button class="secondary" id="nextBtn">▶ Next</button>
    </div>
    <div class="progress" id="prog">1 / 30</div>
  </div>

  <!-- 로그인 모달 -->
  <div class="auth-section hidden" id="authModal">
    <div class="auth-card">
      <button class="auth-close" id="authClose" aria-label="Close">×</button>
      <div class="auth-title">Sign in</div>
      <div class="auth-subtitle">Use your Google account</div>
      <button class="google-login-btn" id="googleBtn" onclick="handleGoogleLogin && handleGoogleLogin()">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3C33.6 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.6 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.2-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.6 29.4 4 24 4 16 4 9.2 8.5 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.1 0 9.9-1.9 13.5-5.1l-6.2-5.1C29.2 36 26.8 37 24 37c-5.1 0-9.5-3.4-11.1-8.1l-6.6 5C10 38.7 16.5 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-1.3 3.7-4.7 6.5-8.7 6.5-5.1 0-9.5-3.4-11.1-8.1l-6.6 5C10 38.7 16.5 44 24 44c10 0 19-7.3 19-20 0-1.2-.1-2.4-.4-3.5z"/>
        </svg>
        <span>Continue with Google</span>
      </button>
    </div>
  </div>

  <!-- 데이터 -->
  <script defer src="data/daily.js"></script>
  <script defer src="data/drama.js"></script>
  <script defer src="data/travel.js"></script>
  <script defer src="data/dataindex.js"></script>

  <!-- 기능: state -> tts -> app -->
  <script defer src="js/state.js"></script>
  <script defer src="js/tts.js"></script>
  <script defer src="js/app.js"></script>

  <!-- 로그인 버튼/모달 제어 -->
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const authModal = document.getElementById("authModal");
      const loginBtn = document.getElementById("loginBtn");

      // Login/Logout 버튼 동작
      loginBtn?.addEventListener("click", async () => {
        try {
          const u = (window.firebase?.auth && firebase.auth().currentUser) || null;
          if (u && window.SoriUser?.logout) {
            await window.SoriUser.logout();   // state.js가 텍스트 'Login'으로 되돌림
          } else {
            authModal?.classList.remove("hidden");
          }
        } catch(e){ console.warn(e); }
      });

      document.getElementById("authClose")?.addEventListener("click", () => {
        authModal?.classList.add("hidden");
      });
    });
  </script>
</body>
</html>

