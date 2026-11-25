/**
 * ==========================================================================
 * Palkon Ki Kitab - Core JavaScript Logic
 * Features:
 *  - Full CRUD for Shayaris with LocalStorage Persistence
 *  - 4 Categories with Custom Visual Themes & Counters
 *  - Hero Typewriter Showcase with Auto-typing & Shuffle
 *  - Dynamic Category-Aware Particle Canvas (Stars, Rain, Embers, Emojis)
 *  - 3D Card Hover Tilt with Radial Mouse Glow
 *  - Heart Burst & Ripple Micro-interactions
 *  - Search, Filter by Favourites, Sort (Newest / Oldest)
 *  - JSON Backup Export & Import with Validation
 *  - Dark & Light Mode Toggle
 * ==========================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. CONSTANTS & INITIAL DATA
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'palako_ki_kitab_v1';
  const THEME_KEY = 'palako_ki_kitab_theme';
  const USER_SESSION_KEY = 'palkon_current_user';
  const ACCOUNTS_STORAGE_KEY = 'palkon_accounts';
  const USER_DIARY_PREFIX = 'palkon_user_';

  // Category Configuration
  const CATEGORIES = {
    motivation: {
      name: 'Motivation',
      hindiName: 'Inspiration',
      icon: '🔥',
      color: '#ff9f1c',
      bannerTitle: 'Motivational Collection'
    },
    sad: {
      name: 'Sad',
      hindiName: 'Melancholy',
      icon: '🌧️',
      color: '#4895ef',
      bannerTitle: 'Sad & Melancholy Collection'
    },
    love: {
      name: 'Love',
      hindiName: 'Romance',
      icon: '❤️',
      color: '#ff2a6d',
      bannerTitle: 'Romantic & Love Collection'
    },
    funny: {
      name: 'Funny',
      hindiName: 'Humour',
      icon: '😂',
      color: '#06d6a0',
      bannerTitle: 'Funny & Humorous Collection'
    }
  };

  // Empty initial list - No sample items
  const INITIAL_ITEMS = [];

  // --------------------------------------------------------------------------
  // 2. STATE
  // --------------------------------------------------------------------------
  let shayaris = [];
  let currentType = 'shayari'; // 'shayari' | 'poetry'
  let currentUser = null; // { id, name, email } or null
  let currentCategory = 'all';
  let searchQuery = '';
  let sortBy = 'newest';
  let favoritesOnly = false;
  let typewriterTimeout = null;
  let isTypewriterActive = true;
  let typewriterIndex = 0;

  // --------------------------------------------------------------------------
  // 3. DOM ELEMENTS
  // --------------------------------------------------------------------------
  // Section Switcher (Shayari vs Poetry)
  const contentTypeSwitcher = document.getElementById('content-type-switcher');
  const typeBtnShayari = document.getElementById('type-btn-shayari');
  const typeBtnPoetry = document.getElementById('type-btn-poetry');
  const typeCountShayari = document.getElementById('type-count-shayari');
  const typeCountPoetry = document.getElementById('type-count-poetry');
  const typeIndicator = document.getElementById('type-indicator');
  const addBtnText = document.getElementById('add-btn-text');

  // User Auth & Profile Elements
  const authModalBtn = document.getElementById('auth-modal-btn');
  const authBtnLabel = document.getElementById('auth-btn-label');
  const userProfileMenu = document.getElementById('user-profile-menu');
  const menuUserName = document.getElementById('menu-user-name');
  const menuUserEmail = document.getElementById('menu-user-email');
  const userAvatarCircle = document.getElementById('user-avatar-circle');
  const userStatShayari = document.getElementById('user-stat-shayari');
  const userStatPoetry = document.getElementById('user-stat-poetry');
  const userLogoutBtn = document.getElementById('user-logout-btn');

  // Auth Modal Elements
  const authModal = document.getElementById('auth-modal');
  const authModalHeading = document.getElementById('auth-modal-heading');
  const authModalSubheading = document.getElementById('auth-modal-subheading');
  const authModalCloseBtn = document.getElementById('auth-modal-close-btn');
  const authCancelBtn = document.getElementById('auth-cancel-btn');
  const authTabLogin = document.getElementById('auth-tab-login');
  const authTabSignup = document.getElementById('auth-tab-signup');
  const authForm = document.getElementById('auth-form');
  const authAlert = document.getElementById('auth-alert');
  const authNameGroup = document.getElementById('auth-name-group');
  const authNameInput = document.getElementById('auth-name-input');
  const authEmailInput = document.getElementById('auth-email-input');
  const authPasswordInput = document.getElementById('auth-password-input');
  const authPwdHint = document.getElementById('auth-pwd-hint');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authSubmitText = document.getElementById('auth-submit-text');
  let authMode = 'login'; // 'login' | 'signup'

  const cardsGrid = document.getElementById('cards-grid');
  const emptyState = document.getElementById('empty-state');
  const emptyTitle = document.getElementById('empty-title');
  const emptySubtitle = document.getElementById('empty-subtitle');
  const emptyIcon = document.getElementById('empty-icon');
  const sanctuaryLockedState = document.getElementById('sanctuary-locked-state');
  const lockLoginBtn = document.getElementById('lock-login-btn');
  const lockSignupBtn = document.getElementById('lock-signup-btn');
  const categoryHeaderBanner = document.getElementById('category-header-banner');

  const tabsWrapper = document.getElementById('tabs-wrapper');
  const tabIndicator = document.getElementById('tab-indicator');
  const navTabs = document.querySelectorAll('.nav-tab');

  const countAll = document.getElementById('count-all');
  const countMotivation = document.getElementById('count-motivation');
  const countSad = document.getElementById('count-sad');
  const countLove = document.getElementById('count-love');
  const countFunny = document.getElementById('count-funny');

  const bannerBadge = document.getElementById('banner-badge');
  const bannerIcon = document.getElementById('banner-icon');
  const bannerTitle = document.getElementById('banner-title');
  const bannerCount = document.getElementById('banner-count');

  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const filterFavBtn = document.getElementById('filter-fav-btn');
  const sortSelect = document.getElementById('sort-select');

  // Hero Typewriter Elements
  const heroTypewriterText = document.getElementById('hero-typewriter-text');
  const heroCategoryTag = document.getElementById('hero-category-tag');
  const heroAuthorText = document.getElementById('hero-author-text');
  const heroShuffleBtn = document.getElementById('hero-shuffle-btn');

  // Add/Edit Modal Elements
  const modalOverlay = document.getElementById('shayari-modal');
  const modalHeading = document.getElementById('modal-heading');
  const modalBadgeIcon = document.getElementById('modal-badge-icon');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const openAddModalBtn = document.getElementById('open-add-modal-btn');
  const emptyAddBtn = document.getElementById('empty-add-btn');
  const shayariForm = document.getElementById('shayari-form');
  const formEditId = document.getElementById('form-edit-id');
  const formContent = document.getElementById('form-content');
  const formContentLabel = document.getElementById('form-content-label');
  const formAuthor = document.getElementById('form-author');
  const formDate = document.getElementById('form-date');
  const formCharCount = document.getElementById('form-char-count');
  const formSubmitText = document.getElementById('form-submit-text');
  const btnQuoteTool = document.getElementById('btn-quote-tool');

  // Delete Confirmation Modal Elements
  const deleteModal = document.getElementById('delete-modal');
  const deleteModalCloseBtn = document.getElementById('delete-modal-close-btn');
  const deleteCancelBtn = document.getElementById('delete-cancel-btn');
  const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
  const deletePreviewText = document.getElementById('delete-preview-text');
  let pendingDeleteShayari = null;

  // Backup & Theme Elements
  const exportJsonBtn = document.getElementById('export-json-btn');
  const importJsonBtn = document.getElementById('import-json-btn');
  const importFileInput = document.getElementById('import-file-input');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const toastStack = document.getElementById('toast-stack');

  // Ambient Canvas
  const ambientCanvas = document.getElementById('ambient-canvas');

  // --------------------------------------------------------------------------
  // 4. STORAGE & INITIALIZATION
  // --------------------------------------------------------------------------
  // 4. STORAGE & INITIALIZATION (Permanent Multi-Tier Storage System)
  // --------------------------------------------------------------------------
  const IDB_NAME = 'PalkonKiKitabDB';
  const IDB_STORE = 'shayaris_vault';
  const IDB_VERSION = 1;

  function openIndexedDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) return resolve(null);
      const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => resolve(null);
    });
  }

  async function saveToIndexedDB(items) {
    try {
      const db = await openIndexedDB();
      if (!db) return;
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.clear();
      items.forEach(item => store.put(item));
    } catch (e) {
      console.warn('IndexedDB write failed', e);
    }
  }

  async function loadFromIndexedDB() {
    try {
      const db = await openIndexedDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const req = store.getAll();
        req.onsuccess = () => {
          if (Array.isArray(req.result)) {
            const filtered = req.result.filter(item => 
              item && item.id && 
              !item.id.startsWith('shayari_sample_') && 
              !item.id.startsWith('poetry_sample_')
            );
            resolve(filtered.length > 0 ? filtered : null);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async function syncWithServer(items) {
    try {
      await fetch('/api/shayaris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      });
    } catch (e) {
      // Standalone mode without backend
    }
  }

  async function syncUserWithServer(email, items) {
    if (!email) return;
    try {
      await fetch('/api/user/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, items })
      });
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // 4B. AUTHENTICATION & MULTI-USER SYSTEM
  // --------------------------------------------------------------------------
  function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return re.test(email.trim());
  }

  function migrateLegacyShayarisToUser(email) {
    if (!email) return;
    const legacyKeys = [
      STORAGE_KEY,
      'palkon_permanent_vault',
      'meri_shayari_diary_en_v1',
      'meri_shayari_diary_v1'
    ];
    let itemsToMigrate = [];
    for (const k of legacyKeys) {
      try {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const filtered = parsed.filter(i => i && i.id && !i.id.startsWith('shayari_sample_') && !i.id.startsWith('poetry_sample_'));
            if (filtered.length > 0) {
              itemsToMigrate = filtered;
              break;
            }
          }
        }
      } catch (e) {}
    }

    const userKey = USER_DIARY_PREFIX + email;
    let existingUserItems = [];
    try {
      const existing = localStorage.getItem(userKey);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (Array.isArray(parsed)) existingUserItems = parsed;
      }
    } catch (e) {}

    if (itemsToMigrate.length > 0) {
      const existingIds = new Set(existingUserItems.map(i => i.id));
      itemsToMigrate.forEach(it => {
        if (!existingIds.has(it.id)) {
          existingUserItems.push(it);
          existingIds.add(it.id);
        }
      });
      localStorage.setItem(userKey, JSON.stringify(existingUserItems));
      syncUserWithServer(email, existingUserItems);
    }

    // Clean up public legacy keys so guest never sees them again
    for (const k of legacyKeys) {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    }
  }

  function initAuth() {
    try {
      const stored = localStorage.getItem(USER_SESSION_KEY);
      if (stored) {
        currentUser = JSON.parse(stored);
      }
    } catch (e) {
      currentUser = null;
    }
    updateAuthUI();
  }

  function updateAuthUI() {
    if (currentUser && currentUser.email) {
      const displayName = currentUser.name || currentUser.email.split('@')[0];
      const initials = (displayName.length > 2 ? displayName.substring(0, 2) : displayName).toUpperCase();

      if (authBtnLabel) {
        authBtnLabel.textContent = `${displayName} ▾`;
      }
      if (userAvatarCircle) {
        userAvatarCircle.textContent = initials;
      }
      if (menuUserName) {
        menuUserName.textContent = displayName;
      }
      if (menuUserEmail) {
        menuUserEmail.textContent = currentUser.email;
      }

      const countS = shayaris.filter(s => (s.type || 'shayari') === 'shayari').length;
      const countP = shayaris.filter(s => (s.type || 'shayari') === 'poetry').length;

      if (userStatShayari) userStatShayari.textContent = countS;
      if (userStatPoetry) userStatPoetry.textContent = countP;
    } else {
      if (authBtnLabel) {
        authBtnLabel.textContent = 'Login / Sign Up';
      }
      if (userProfileMenu) {
        userProfileMenu.style.display = 'none';
      }
    }
  }

  function openAuthModal(mode = 'login') {
    authMode = mode;
    switchAuthTab(mode);
    authModal.classList.add('active');
    authModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    hideAuthAlert();
    setTimeout(() => {
      if (mode === 'signup' && authNameInput) {
        authNameInput.focus();
      } else {
        authEmailInput.focus();
      }
    }, 150);
  }

  function closeAuthModal() {
    authModal.classList.remove('active');
    authModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hideAuthAlert();
  }

  function switchAuthTab(tab) {
    authMode = tab;
    authTabLogin.classList.toggle('active', tab === 'login');
    authTabSignup.classList.toggle('active', tab === 'signup');

    if (tab === 'signup') {
      authNameGroup.style.display = 'block';
      authPwdHint.style.display = 'block';
      authModalHeading.textContent = 'Create New Account';
      authModalSubheading.textContent = 'Sign up to keep your poetry safe forever';
      authSubmitText.textContent = 'Sign Up';
    } else {
      authNameGroup.style.display = 'none';
      authPwdHint.style.display = 'none';
      authModalHeading.textContent = 'Account Login';
      authModalSubheading.textContent = 'Access your private saved collection';
      authSubmitText.textContent = 'Log In';
    }
    hideAuthAlert();
  }

  function showAuthAlert(message, type = 'error') {
    if (!authAlert) return;
    authAlert.textContent = message;
    authAlert.className = `auth-alert alert-${type}`;
    authAlert.style.display = 'block';
  }

  function hideAuthAlert() {
    if (!authAlert) return;
    authAlert.style.display = 'none';
    authAlert.textContent = '';
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    hideAuthAlert();

    const email = authEmailInput.value.trim().toLowerCase();
    const password = authPasswordInput.value.trim();
    const name = authNameInput ? authNameInput.value.trim() : '';

    if (!isValidEmail(email)) {
      showAuthAlert('Please enter a valid email address (e.g., yourname@domain.com).');
      authEmailInput.focus();
      return;
    }
    if (!password || password.length < 4) {
      showAuthAlert('Password must be at least 4 characters long.');
      authPasswordInput.focus();
      return;
    }
    if (authMode === 'signup' && !name) {
      showAuthAlert('Please enter your full name.');
      authNameInput.focus();
      return;
    }

    authSubmitBtn.disabled = true;
    authSubmitText.textContent = 'Processing...';

    const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    const payload = authMode === 'signup'
      ? { name, email, password }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        showAuthAlert(data.error || 'Authentication failed. Please check credentials.');
        authSubmitBtn.disabled = false;
        authSubmitText.textContent = authMode === 'signup' ? 'Sign Up' : 'Log In';
        return;
      }

      currentUser = data.user;
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(currentUser));
      migrateLegacyShayarisToUser(currentUser.email);

      if (Array.isArray(data.items) && data.items.length > 0) {
        shayaris = data.items.map(item => ({ ...item, type: item.type || 'shayari' }));
      } else {
        try {
          const userVault = localStorage.getItem(USER_DIARY_PREFIX + currentUser.email);
          shayaris = userVault ? JSON.parse(userVault) : [];
        } catch (e) {
          shayaris = [];
        }
      }

      saveShayaris();
      closeAuthModal();
      updateAuthUI();
      renderCards();
      startTypewriter();
      showToast(`Welcome back, ${currentUser.name}! 🌟`, '👋');
      authForm.reset();

    } catch (err) {
      // Offline fallback handling
      handleOfflineAuth(email, password, name);
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitText.textContent = authMode === 'signup' ? 'Sign Up' : 'Log In';
    }
  }

  function handleOfflineAuth(email, password, name) {
    if (!isValidEmail(email)) {
      showAuthAlert('Please enter a valid email address (e.g., yourname@domain.com).');
      return;
    }

    let accounts = {};
    try {
      const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (stored) accounts = JSON.parse(stored);
    } catch (e) {}

    if (authMode === 'signup') {
      if (accounts[email]) {
        showAuthAlert('This email is already registered. Please log in.');
        return;
      }
      accounts[email] = {
        name: name || email.split('@')[0],
        email,
        password
      };
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));

      currentUser = {
        id: 'usr_' + Date.now(),
        name: accounts[email].name,
        email: email
      };
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(currentUser));
      migrateLegacyShayarisToUser(currentUser.email);

      try {
        const userSaved = localStorage.getItem(USER_DIARY_PREFIX + email);
        shayaris = userSaved ? JSON.parse(userSaved) : [];
      } catch (e) {
        shayaris = [];
      }
      saveShayaris();

      closeAuthModal();
      updateAuthUI();
      renderCards();
      startTypewriter();
      showToast(`Welcome to Palako Ki Kitab, ${currentUser.name}! 🌟`, '🎉');
      authForm.reset();

    } else {
      const acc = accounts[email];
      if (!acc) {
        showAuthAlert('No account found with this email. Please click Sign Up to create an account.');
        return;
      }
      if (acc.password !== password) {
        showAuthAlert('Incorrect password. Please try again.');
        return;
      }

      currentUser = {
        id: acc.id || 'usr_' + Date.now(),
        name: acc.name,
        email: acc.email
      };
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(currentUser));
      migrateLegacyShayarisToUser(currentUser.email);

      const userSaved = localStorage.getItem(USER_DIARY_PREFIX + email);
      if (userSaved) {
        try {
          shayaris = JSON.parse(userSaved);
        } catch (e) {
          shayaris = [];
        }
      } else {
        shayaris = [];
      }

      closeAuthModal();
      updateAuthUI();
      renderCards();
      startTypewriter();
      showToast(`Welcome back, ${currentUser.name}! 🌟`, '👋');
      authForm.reset();
    }
  }

  function handleLogout() {
    currentUser = null;
    localStorage.removeItem(USER_SESSION_KEY);
    if (userProfileMenu) userProfileMenu.style.display = 'none';
    updateAuthUI();
    loadShayaris();
    renderCards();
    startTypewriter();
    showToast('Logged out successfully.', '👋');
  }

  function loadShayaris() {
    initAuth();

    if (!currentUser || !currentUser.email) {
      shayaris = [];
      updateCounters();
      return;
    }

    let loaded = null;
    try {
      const userVault = localStorage.getItem(USER_DIARY_PREFIX + currentUser.email);
      if (userVault) {
        const parsed = JSON.parse(userVault);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loaded = parsed;
        }
      }
    } catch (e) {}

    if (loaded && loaded.length > 0) {
      shayaris = loaded.map(item => ({
        ...item,
        type: item.type || 'shayari'
      }));
    } else {
      shayaris = [];
    }

    // Filter out any default sample items
    shayaris = shayaris.filter(item => 
      item && item.id && 
      !item.id.startsWith('shayari_sample_') && 
      !item.id.startsWith('poetry_sample_')
    );

    checkBackgroundStores();
  }

  async function checkBackgroundStores() {
    if (!currentUser || !currentUser.email) return;

    let extra = null;
    try {
      const res = await fetch(`/api/user/data?email=${encodeURIComponent(currentUser.email)}`);
      if (res.ok) {
        const serverData = await res.json();
        if (Array.isArray(serverData)) {
          extra = serverData;
        }
      }
    } catch (e) {}

    if (extra && extra.length > 0) {
      const currentIds = new Set(shayaris.map(s => s.id));
      let updated = false;
      extra.forEach(item => {
        if (!currentIds.has(item.id) && item.id && !item.id.startsWith('shayari_sample_') && !item.id.startsWith('poetry_sample_')) {
          shayaris.push({
            ...item,
            type: item.type || 'shayari'
          });
          currentIds.add(item.id);
          updated = true;
        }
      });
      if (updated) {
        saveShayaris();
        renderCards();
      }
    }
  }

  function saveShayaris() {
    if (!currentUser || !currentUser.email) {
      updateAuthUI();
      return;
    }

    try {
      const dataStr = JSON.stringify(shayaris);
      localStorage.setItem(USER_DIARY_PREFIX + currentUser.email, dataStr);
      syncUserWithServer(currentUser.email, shayaris);
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }

    // Save in background to IndexedDB
    saveToIndexedDB(shayaris);
    updateAuthUI();
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    showToast(`${next === 'dark' ? 'Dark mode' : 'Light mode'} enabled`, next === 'dark' ? '🌙' : '☀️');
  }

  // --------------------------------------------------------------------------
  // 5. DATE FORMATTER ("21 November 2026")
  // --------------------------------------------------------------------------
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      // Split YYYY-MM-DD manually to prevent timezone shifts
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (monthIndex >= 0 && monthIndex < 12 && !isNaN(day)) {
          return `${day} ${MONTH_NAMES[monthIndex]} ${year}`;
        }
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      }
    } catch (e) {
      // Fallback
    }
    return dateStr;
  }

  function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --------------------------------------------------------------------------
  // 6. UI COUNTERS, PRIMARY SECTION SWITCHER & CATEGORY BANNER
  // --------------------------------------------------------------------------
  function updateCounters() {
    if (!currentUser || !currentUser.email) {
      if (typeCountShayari) typeCountShayari.textContent = '0';
      if (typeCountPoetry) typeCountPoetry.textContent = '0';
      if (countAll) countAll.textContent = '0';
      if (countMotivation) countMotivation.textContent = '0';
      if (countSad) countSad.textContent = '0';
      if (countLove) countLove.textContent = '0';
      if (countFunny) countFunny.textContent = '0';
      updateTabIndicator();
      updateTypeIndicator();
      return;
    }

    let countShayariTotal = 0;
    let countPoetryTotal = 0;
    let counts = { motivation: 0, sad: 0, love: 0, funny: 0 };

    shayaris.forEach(s => {
      const itemType = s.type || 'shayari';
      if (itemType === 'shayari') countShayariTotal++;
      else if (itemType === 'poetry') countPoetryTotal++;

      if (itemType === currentType) {
        if (counts[s.category] !== undefined) {
          counts[s.category]++;
        }
      }
    });

    if (typeCountShayari) typeCountShayari.textContent = countShayariTotal;
    if (typeCountPoetry) typeCountPoetry.textContent = countPoetryTotal;

    const currentTypeTotal = currentType === 'shayari' ? countShayariTotal : countPoetryTotal;
    if (countAll) countAll.textContent = currentTypeTotal;
    if (countMotivation) countMotivation.textContent = counts.motivation;
    if (countSad) countSad.textContent = counts.sad;
    if (countLove) countLove.textContent = counts.love;
    if (countFunny) countFunny.textContent = counts.funny;

    updateTabIndicator();
    updateTypeIndicator();
  }

  function setType(type) {
    currentType = type;
    if (typeBtnShayari && typeBtnPoetry) {
      typeBtnShayari.classList.toggle('active', type === 'shayari');
      typeBtnPoetry.classList.toggle('active', type === 'poetry');
      typeBtnShayari.setAttribute('aria-selected', type === 'shayari' ? 'true' : 'false');
      typeBtnPoetry.setAttribute('aria-selected', type === 'poetry' ? 'true' : 'false');
    }

    if (addBtnText) {
      addBtnText.textContent = type === 'poetry' ? 'Add New Poem' : 'Add New Shayari';
    }

    updateTypeIndicator();
    renderCards();
    startTypewriter();
  }

  function updateTypeIndicator() {
    if (!typeIndicator) return;
    const activeBtn = currentType === 'poetry' ? typeBtnPoetry : typeBtnShayari;
    if (activeBtn) {
      typeIndicator.style.width = `${activeBtn.offsetWidth}px`;
      typeIndicator.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    }
  }

  function updateCategoryBanner(filteredCount) {
    const isPoetry = currentType === 'poetry';
    const typeLabel = isPoetry ? 'Poetry' : 'Shayari';
    const typePlural = isPoetry ? 'Poems' : 'Shayaris';

    if (currentCategory === 'all') {
      bannerIcon.textContent = isPoetry ? '📜' : '✨';
      bannerTitle.textContent = favoritesOnly
        ? `Favourite ${typePlural} Collection`
        : `All ${typePlural} Collection`;
    } else {
      const cat = CATEGORIES[currentCategory];
      bannerIcon.textContent = cat ? cat.icon : '✨';
      bannerTitle.textContent = cat ? `${cat.name} ${typeLabel} Collection` : `${typeLabel} Collection`;
    }
    bannerCount.textContent = `${filteredCount} ${filteredCount === 1 ? typeLabel : typePlural} Available`;
  }

  // --------------------------------------------------------------------------
  // 7. TAB NAVIGATION & ANIMATED UNDERLINE
  // --------------------------------------------------------------------------
  function updateTabIndicator() {
    const activeTab = document.querySelector('.nav-tab.active');
    if (!activeTab || !tabIndicator) return;

    tabIndicator.style.width = `${activeTab.offsetWidth}px`;
    tabIndicator.style.transform = `translateX(${activeTab.offsetLeft}px)`;
  }

  function setCategory(cat) {
    currentCategory = cat;
    tabsWrapper.setAttribute('data-active-category', cat);

    navTabs.forEach(tab => {
      if (tab.dataset.category === cat) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    updateTabIndicator();
    renderCards();
    
    // Switch canvas particle mode
    if (particleSystem) {
      particleSystem.setCategory(cat);
    }
  }

  // --------------------------------------------------------------------------
  // 8. CARD RENDERING & 3D TILT
  // --------------------------------------------------------------------------
  function getFilteredShayaris() {
    let list = shayaris.filter(s => (s.type || 'shayari') === currentType);

    // Filter by Category
    if (currentCategory !== 'all') {
      list = list.filter(s => s.category === currentCategory);
    }

    // Filter by Favourites
    if (favoritesOnly) {
      list = list.filter(s => s.favorite);
    }

    // Search Query (Text, Title/Author)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        (s.content && s.content.toLowerCase().includes(q)) ||
        (s.author && s.author.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime() || a.createdAt;
      const dateB = new Date(b.date || 0).getTime() || b.createdAt;
      return sortBy === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    return list;
  }

  function renderCards() {
    if (!currentUser || !currentUser.email) {
      if (categoryHeaderBanner) categoryHeaderBanner.style.display = 'none';
      if (cardsGrid) cardsGrid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'none';
      if (sanctuaryLockedState) sanctuaryLockedState.style.display = 'block';
      updateCounters();
      return;
    }

    if (sanctuaryLockedState) sanctuaryLockedState.style.display = 'none';
    if (categoryHeaderBanner) categoryHeaderBanner.style.display = 'flex';

    const list = getFilteredShayaris();
    updateCounters();
    updateCategoryBanner(list.length);

    cardsGrid.innerHTML = '';

    if (list.length === 0) {
      cardsGrid.style.display = 'none';
      emptyState.style.display = 'flex';
      setupEmptyStateText();
      return;
    }

    cardsGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    // Staggered entrance render
    list.forEach((item, index) => {
      const card = createCardElement(item, index);
      cardsGrid.appendChild(card);
    });
  }

  function setupEmptyStateText() {
    const isPoetry = currentType === 'poetry';
    const typeLabel = isPoetry ? 'poem' : 'shayari';
    const typeLabelCap = isPoetry ? 'Poem' : 'Shayari';
    const typePlural = isPoetry ? 'poems' : 'shayaris';

    if (searchQuery.trim()) {
      emptyIcon.textContent = '🔍';
      emptyTitle.textContent = `No ${typePlural} found`;
      emptySubtitle.textContent = `No results found for "${searchQuery}". Please try searching with different words.`;
    } else if (favoritesOnly) {
      emptyIcon.textContent = '🤍';
      emptyTitle.textContent = 'No favourites yet';
      emptySubtitle.textContent = 'Click the heart icon on any card to add it to your favourites!';
    } else if (currentCategory !== 'all') {
      const cat = CATEGORIES[currentCategory];
      emptyIcon.textContent = cat ? cat.icon : '🪶';
      emptyTitle.textContent = `No ${cat ? cat.name : ''} ${typePlural} here yet`;
      emptySubtitle.textContent = `Write your first ${cat ? cat.name.toLowerCase() : ''} ${typeLabel} and enrich your collection!`;
    } else {
      emptyIcon.textContent = isPoetry ? '📜' : '📖';
      emptyTitle.textContent = `Your ${typeLabel} collection is empty`;
      emptySubtitle.textContent = `Weave your heart's emotions into words and add your first ${typeLabel}!`;
    }

    const emptyAddSpan = emptyAddBtn ? emptyAddBtn.querySelector('span') : null;
    if (emptyAddSpan) {
      emptyAddSpan.textContent = `Write New ${typeLabelCap}`;
    }
  }

  function createCardElement(shayari, index) {
    const card = document.createElement('article');
    card.className = 'shayari-card card-animate-in';
    card.setAttribute('data-id', shayari.id);
    card.setAttribute('data-category', shayari.category);
    // Stagger animation delay
    card.style.animationDelay = `${Math.min(index * 0.05, 0.4)}s`;

    const catInfo = CATEGORIES[shayari.category] || {
      name: shayari.category,
      icon: '✨'
    };

    const formattedDate = formatDate(shayari.date);
    const authorDisplay = shayari.author ? escapeHtml(shayari.author) : '';

    card.innerHTML = `
      <div class="card-top">
        <span class="card-category-badge cat-${shayari.category}">
          <span>${catInfo.icon}</span>
          <span>${catInfo.name}</span>
        </span>
        <span class="card-date">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${formattedDate}
        </span>
      </div>

      <div class="card-body">
        <div class="card-poem-text">${escapeHtml(shayari.content)}</div>
        ${authorDisplay ? `<div class="card-author-title">${authorDisplay}</div>` : ''}
      </div>

      <div class="card-actions">
        <div class="card-action-btns-left">
          <button class="card-btn btn-copy btn-ripple" title="Copy Shayari" aria-label="Copy Shayari text">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="card-btn btn-edit btn-ripple" title="Edit Shayari" aria-label="Edit Shayari">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="card-btn btn-delete btn-ripple" title="Delete Shayari" aria-label="Delete Shayari">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>

        <button class="fav-toggle-btn ${shayari.favorite ? 'is-fav' : ''} btn-ripple" title="${shayari.favorite ? 'Remove Favourite' : 'Mark Favourite'}" aria-label="Toggle Favourite">
          <svg viewBox="0 0 24 24" fill="${shayari.favorite ? '#ff2a6d' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
    `;

    // Attach Event Listeners to Card Buttons
    const copyBtn = card.querySelector('.btn-copy');
    copyBtn.addEventListener('click', () => copyShayari(shayari));

    const editBtn = card.querySelector('.btn-edit');
    editBtn.addEventListener('click', () => openEditModal(shayari));

    const deleteBtn = card.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => openDeleteModal(shayari));

    const favBtn = card.querySelector('.fav-toggle-btn');
    favBtn.addEventListener('click', (e) => toggleFavourite(shayari, favBtn, e));

    // 3D Tilt on Hover
    setupCardTilt(card);

    return card;
  }

  // 3D Tilt Mouse Interaction
  function setupCardTilt(card) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId = null;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -7.5;
      const rotateY = ((x - centerX) / centerX) * 7.5;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px) scale3d(1.02, 1.02, 1.02)`;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    card.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
    });
  }

  // --------------------------------------------------------------------------
  // 9. CARD ACTIONS: COPY, EDIT, DELETE, FAVOURITE
  // --------------------------------------------------------------------------
  function copyShayari(shayari) {
    let textToCopy = shayari.content;
    if (shayari.author) {
      textToCopy += `\n\n— ${shayari.author}`;
    }
    const isPoetry = (shayari.type || 'shayari') === 'poetry';
    const typeLabel = isPoetry ? 'Poem' : 'Shayari';

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => showToast(`${typeLabel} copied to clipboard!`, '📋'))
        .catch(() => fallbackCopy(textToCopy, typeLabel));
    } else {
      fallbackCopy(textToCopy, typeLabel);
    }
  }

  function fallbackCopy(text, typeLabel = 'Shayari') {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.focus();
    temp.select();
    try {
      document.execCommand('copy');
      showToast(`${typeLabel} copied to clipboard!`, '📋');
    } catch (e) {
      showToast('Failed to copy', '❌');
    }
    document.body.removeChild(temp);
  }

  function toggleFavourite(shayari, btnEl, evt) {
    shayari.favorite = !shayari.favorite;
    saveShayaris();

    // Trigger Heart Burst Effect
    btnEl.classList.toggle('is-fav', shayari.favorite);
    btnEl.classList.remove('heart-burst-animate');
    void btnEl.offsetWidth; // Trigger reflow
    btnEl.classList.add('heart-burst-animate');

    const svgPath = btnEl.querySelector('svg');
    if (svgPath) {
      svgPath.setAttribute('fill', shayari.favorite ? '#ff2a6d' : 'none');
    }

    if (shayari.favorite) {
      spawnHeartBurstParticles(btnEl);
      showToast('Added to favourites ❤️', '💖');
    } else {
      showToast('Removed from favourites', '🤍');
    }

    // If currently filtered by favourites and unfavorited, re-render
    if (favoritesOnly) {
      renderCards();
    }
  }

  function spawnHeartBurstParticles(container) {
    const hearts = ['❤️', '💖', '✨', '🌸', '💫'];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'mini-heart-particle';
      p.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      
      const angle = (i / count) * 2 * Math.PI;
      const distance = 35 + Math.random() * 25;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);
      
      container.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }
  }

  // --------------------------------------------------------------------------
  // 10. HERO TYPEWRITER SHOWCASE
  // --------------------------------------------------------------------------
  function startTypewriter() {
    clearTimeout(typewriterTimeout);

    if (!currentUser || !currentUser.email) {
      heroTypewriterText.textContent = 'Welcome to Palako Ki Kitab • Log in to unlock your private collection.';
      heroCategoryTag.textContent = '🔐 Private Sanctuary';
      heroCategoryTag.className = 'category-tag-mini cat-motivation';
      heroAuthorText.textContent = '— Palako Ki Kitab';
      return;
    }

    const typeCandidates = shayaris.filter(s => (s.type || 'shayari') === currentType);

    if (!typeCandidates || typeCandidates.length === 0) {
      heroTypewriterText.textContent = currentType === 'poetry'
        ? 'Let your thoughts blossom into poetic verse...'
        : 'Express the whispers of your heart in words...';
      heroCategoryTag.textContent = currentType === 'poetry' ? '📜 Poetry' : '✨ Shayari';
      heroCategoryTag.className = 'category-tag-mini cat-motivation';
      heroAuthorText.textContent = '— Palako Ki Kitab';
      return;
    }

    const currentItem = typeCandidates[typewriterIndex % typeCandidates.length];
    const cat = CATEGORIES[currentItem.category] || { name: 'Poetry', icon: '✨' };

    heroCategoryTag.textContent = `${cat.icon} ${cat.name}`;
    heroCategoryTag.className = `category-tag-mini cat-${currentItem.category}`;
    heroAuthorText.textContent = currentItem.author ? `— ${currentItem.author}` : '— Anonymous';

    const fullText = currentItem.content;
    let charPos = 0;
    heroTypewriterText.textContent = '';

    function typeChar() {
      if (!isTypewriterActive) return;
      if (charPos < fullText.length) {
        heroTypewriterText.textContent = fullText.substring(0, charPos + 1);
        charPos++;
        // Natural speed variation: slight pause on newlines or commas
        const char = fullText[charPos - 1];
        const delay = char === '\n' ? 220 : char === ' ' ? 70 : 40;
        typewriterTimeout = setTimeout(typeChar, delay);
      } else {
        // Full text reached, pause for reading
        typewriterTimeout = setTimeout(eraseText, 4500);
      }
    }

    function eraseText() {
      if (!isTypewriterActive) return;
      if (charPos > 0) {
        heroTypewriterText.textContent = fullText.substring(0, charPos - 1);
        charPos--;
        typewriterTimeout = setTimeout(eraseText, 18);
      } else {
        // Move to next item
        typewriterIndex = (typewriterIndex + 1) % typeCandidates.length;
        typewriterTimeout = setTimeout(startTypewriter, 500);
      }
    }

    typeChar();
  }

  function shuffleTypewriter() {
    clearTimeout(typewriterTimeout);
    const typeCandidates = shayaris.filter(s => (s.type || 'shayari') === currentType);
    if (typeCandidates.length > 1) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * typeCandidates.length);
      } while (nextIndex === typewriterIndex);
      typewriterIndex = nextIndex;
    } else {
      typewriterIndex = 0;
    }
    startTypewriter();
  }

  // --------------------------------------------------------------------------
  // 11. MODAL (ADD & EDIT)
  // --------------------------------------------------------------------------
  function openAddModal() {
    if (!currentUser || !currentUser.email) {
      openAuthModal('login');
      showAuthAlert('Please log in with your email to add new poetry to your private collection.', 'info');
      showToast('Please log in or sign up first', '🔐');
      return;
    }

    formEditId.value = '';
    const isPoetry = currentType === 'poetry';
    modalHeading.textContent = isPoetry ? 'Add New Poem' : 'Add New Shayari';
    modalBadgeIcon.textContent = isPoetry ? '📜' : '✍️';
    formSubmitText.textContent = isPoetry ? 'Save Poem to Diary' : 'Save Shayari to Diary';

    if (formContentLabel) {
      formContentLabel.innerHTML = isPoetry 
        ? 'Poetry Stanzas / Verses <span class="required">*</span>'
        : 'Shayari Lines (Matla &amp; Maqta) <span class="required">*</span>';
    }

    // Default form values
    formContent.value = '';
    formAuthor.value = '';
    formDate.value = getTodayString();
    formCharCount.textContent = '0 characters';

    // Set content-type radio to currentType
    const typeRadio = shayariForm.querySelector(`input[name="content-type"][value="${currentType}"]`);
    if (typeRadio) typeRadio.checked = true;

    // Select category matching current filter tab if valid
    const defaultCat = currentCategory !== 'all' ? currentCategory : 'motivation';
    const radio = shayariForm.querySelector(`input[name="category"][value="${defaultCat}"]`);
    if (radio) radio.checked = true;

    clearFormErrors();
    openModal();
    setTimeout(() => formContent.focus(), 150);
  }

  function openEditModal(shayari) {
    formEditId.value = shayari.id;
    const isPoetry = (shayari.type || 'shayari') === 'poetry';
    modalHeading.textContent = isPoetry ? 'Edit Poem' : 'Edit Shayari';
    modalBadgeIcon.textContent = isPoetry ? '📜' : '📝';
    formSubmitText.textContent = 'Save Changes';

    if (formContentLabel) {
      formContentLabel.innerHTML = isPoetry 
        ? 'Poetry Stanzas / Verses <span class="required">*</span>'
        : 'Shayari Lines (Matla &amp; Maqta) <span class="required">*</span>';
    }

    formContent.value = shayari.content || '';
    formAuthor.value = shayari.author || '';
    formDate.value = shayari.date || getTodayString();
    formCharCount.textContent = `${shayari.content.length} characters`;

    const typeRadio = shayariForm.querySelector(`input[name="content-type"][value="${shayari.type || 'shayari'}"]`);
    if (typeRadio) typeRadio.checked = true;

    const radio = shayariForm.querySelector(`input[name="category"][value="${shayari.category}"]`);
    if (radio) radio.checked = true;

    clearFormErrors();
    openModal();
    setTimeout(() => formContent.focus(), 150);
  }

  function openModal() {
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function clearFormErrors() {
    const group = formContent.closest('.form-group');
    if (group) group.classList.remove('has-error');
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const content = formContent.value.trim();
    const group = formContent.closest('.form-group');

    // Validation
    if (!content) {
      if (group) group.classList.add('has-error');
      formContent.focus();
      showToast('Please enter text (Cannot be empty)', '⚠️');
      return;
    }

    const editId = formEditId.value;
    const typeRadioChecked = shayariForm.querySelector('input[name="content-type"]:checked');
    const type = typeRadioChecked ? typeRadioChecked.value : currentType;
    const category = shayariForm.querySelector('input[name="category"]:checked').value;
    const author = formAuthor.value.trim();
    const date = formDate.value || getTodayString();

    const typeLabel = type === 'poetry' ? 'Poem' : 'Shayari';

    if (editId) {
      // Update existing
      const index = shayaris.findIndex(s => s.id === editId);
      if (index !== -1) {
        shayaris[index] = {
          ...shayaris[index],
          type,
          category,
          content,
          author,
          date
        };
        showToast(`${typeLabel} successfully updated!`, '✨');
      }
    } else {
      // Create new
      const newShayari = {
        id: (type === 'poetry' ? 'poetry_' : 'shayari_') + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        type,
        category,
        content,
        author,
        date,
        favorite: false,
        createdAt: Date.now()
      };
      shayaris.unshift(newShayari);
      showToast(`New ${typeLabel.toLowerCase()} added to diary!`, '🎉');

      // If user added in another section, switch to it automatically
      if (type !== currentType) {
        setType(type);
      }
    }

    saveShayaris();
    closeModal();
    renderCards();
    startTypewriter(); // Refresh typewriter with new addition
  }

  // --------------------------------------------------------------------------
  // 11B. DELETE CONFIRMATION MODAL & SAFE UNDO
  // --------------------------------------------------------------------------
  function openDeleteModal(shayari) {
    pendingDeleteShayari = shayari;
    const isPoetry = (shayari.type || 'shayari') === 'poetry';
    const typeLabel = isPoetry ? 'Poem' : 'Shayari';

    const headingEl = document.getElementById('delete-modal-heading');
    if (headingEl) headingEl.textContent = `Delete ${typeLabel}?`;
    if (deleteConfirmBtn) {
      const span = deleteConfirmBtn.querySelector('span');
      if (span) span.textContent = `Delete ${typeLabel}`;
    }

    const preview = shayari.content.length > 120 ? shayari.content.substring(0, 120) + '...' : shayari.content;
    deletePreviewText.textContent = `“${preview}”`;
    deleteModal.classList.add('active');
    deleteModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => deleteConfirmBtn.focus(), 120);
  }

  function closeDeleteModal() {
    deleteModal.classList.remove('active');
    deleteModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    pendingDeleteShayari = null;
  }

  function handleConfirmDelete() {
    if (!pendingDeleteShayari) return;
    const shayariToDelete = pendingDeleteShayari;
    const targetId = shayariToDelete.id;
    const isPoetry = (shayariToDelete.type || 'shayari') === 'poetry';
    const typeLabel = isPoetry ? 'Poem' : 'Shayari';
    const originalIndex = shayaris.findIndex(s => s.id === targetId);

    closeDeleteModal();

    const cardEl = document.querySelector(`.shayari-card[data-id="${targetId}"]`);
    if (cardEl) {
      cardEl.classList.add('card-deleting');
    }

    setTimeout(() => {
      if (originalIndex !== -1) {
        shayaris.splice(originalIndex, 1);
        saveShayaris();
        renderCards();
        startTypewriter();
        showUndoToast(`${typeLabel} removed from collection`, shayariToDelete, originalIndex);
      }
    }, 420);
  }

  function showUndoToast(message, restoredShayari, originalIndex) {
    const isPoetry = (restoredShayari.type || 'shayari') === 'poetry';
    const typeLabel = isPoetry ? 'Poem' : 'Shayari';
    const toast = document.createElement('div');
    toast.className = 'toast toast-undo';
    toast.innerHTML = `
      <span class="toast-icon">🗑️</span>
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-undo-btn">Undo</button>
    `;

    const undoBtn = toast.querySelector('.toast-undo-btn');
    let undone = false;

    undoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (undone) return;
      undone = true;

      const insertIdx = Math.min(originalIndex, shayaris.length);
      shayaris.splice(insertIdx, 0, restoredShayari);
      saveShayaris();
      renderCards();
      startTypewriter();
      removeToast(toast);
      showToast(`✨ ${typeLabel} restored back to collection!`, '💖');
    });

    toastStack.appendChild(toast);
    setTimeout(() => {
      removeToast(toast);
    }, 6000);
  }

  // --------------------------------------------------------------------------
  // 12. EXPORT & IMPORT (JSON BACKUP)
  // --------------------------------------------------------------------------
  function exportToJson() {
    try {
      const dataStr = JSON.stringify(shayaris, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const today = getTodayString();
      const a = document.createElement('a');
      a.href = url;
      a.download = `palkon-ki-kitab-backup-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Backup of ${shayaris.length} ${shayaris.length === 1 ? 'shayari' : 'shayaris'} exported!`, '💾');
    } catch (e) {
      showToast('Failed to export backup', '❌');
    }
  }

  function handleImportJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) {
          throw new Error('Invalid JSON format: Expected an array of shayaris');
        }

        // Validate items
        const validItems = parsed.filter(item => 
          item && 
          typeof item.content === 'string' && 
          item.content.trim().length > 0
        ).map(item => ({
          id: item.id || ('shayari_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
          category: CATEGORIES[item.category] ? item.category : 'motivation',
          content: item.content.trim(),
          author: item.author || '',
          date: item.date || getTodayString(),
          favorite: Boolean(item.favorite),
          createdAt: item.createdAt || Date.now()
        }));

        if (validItems.length === 0) {
          showToast('No valid shayaris found in file', '⚠️');
          return;
        }

        // Merge without duplicate IDs
        const existingIds = new Set(shayaris.map(s => s.id));
        let addedCount = 0;
        validItems.forEach(item => {
          if (!existingIds.has(item.id)) {
            shayaris.push(item);
            existingIds.add(item.id);
            addedCount++;
          }
        });

        saveShayaris();
        renderCards();
        startTypewriter();
        showToast(`${addedCount} new ${addedCount === 1 ? 'shayari' : 'shayaris'} imported!`, '📥');
      } catch (err) {
        showToast('Invalid backup file (JSON)', '❌');
      }
      importFileInput.value = ''; // Reset input
    };
    reader.readAsText(file);
  }

  // --------------------------------------------------------------------------
  // 13. TOAST NOTIFICATION SYSTEM
  // --------------------------------------------------------------------------
  function showToast(message, icon = '✨') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    toast.addEventListener('click', () => removeToast(toast));

    toastStack.appendChild(toast);

    // Auto dismiss after 3.2 seconds
    setTimeout(() => {
      removeToast(toast);
    }, 3200);
  }

  function removeToast(toast) {
    if (!toast || toast.classList.contains('toast-closing')) return;
    toast.classList.add('toast-closing');
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 300);
  }

  // --------------------------------------------------------------------------
  // 14. DYNAMIC CATEGORY-AWARE PARTICLE CANVAS
  // (Stars for Love, Rain for Sad, Sparkles for Motivation, Emojis for Funny)
  // --------------------------------------------------------------------------
  let particleSystem = null;

  class ParticleCanvas {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.category = 'all';
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.animationFrameId = null;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Mouse interactive physics
      this.mouseX = -1000;
      this.mouseY = -1000;
      this.isMouseActive = false;
      this.mouseTimer = null;

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Mouse proximity tracking for fluid particle reactions
      window.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.isMouseActive = true;
        clearTimeout(this.mouseTimer);
        this.mouseTimer = setTimeout(() => {
          this.isMouseActive = false;
        }, 1800);
      });

      window.addEventListener('mouseleave', () => {
        this.isMouseActive = false;
        this.mouseX = -1000;
        this.mouseY = -1000;
      });

      this.createParticles();
      if (!this.reducedMotion) {
        this.animate();
      }
    }

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
      this.createParticles();
    }

    setCategory(cat) {
      this.category = cat;
      this.createParticles();
    }

    createParticles() {
      this.particles = [];
      const count = this.width < 768 ? 32 : 64;

      for (let i = 0; i < count; i++) {
        this.particles.push(this.spawnParticle(true));
      }
    }

    spawnParticle(initial = false) {
      const mode = this.category;
      const x = Math.random() * this.width;
      const y = initial ? Math.random() * this.height : (mode === 'sad' ? -10 : this.height + 10);

      switch (mode) {
        case 'motivation':
          // Rising Golden Sparks & Embers
          return {
            type: 'ember',
            x,
            y,
            radius: Math.random() * 2.6 + 1.2,
            speedY: -(Math.random() * 1.5 + 0.8),
            speedX: (Math.random() - 0.5) * 0.8,
            color: Math.random() > 0.4 ? '#ffbe0b' : '#ff9f1c',
            alpha: Math.random() * 0.7 + 0.3,
            decay: Math.random() * 0.005 + 0.002
          };

        case 'sad':
          // Falling Gentle Rain Drops
          return {
            type: 'rain',
            x,
            y,
            length: Math.random() * 16 + 10,
            speedY: Math.random() * 4 + 3.5,
            speedX: -0.6,
            color: 'rgba(76, 201, 240, 0.45)',
            width: Math.random() * 1.5 + 0.8
          };

        case 'love':
          // Floating Twinkling Stars & Glowing Mini Hearts
          return {
            type: Math.random() > 0.4 ? 'star' : 'heart',
            x,
            y,
            size: Math.random() * 8 + 6,
            speedY: -(Math.random() * 0.8 + 0.4),
            speedX: (Math.random() - 0.5) * 0.5,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 0.04,
            alpha: Math.random() * 0.6 + 0.3,
            color: Math.random() > 0.5 ? '#ff2a6d' : '#ff758f'
          };

        case 'funny':
          // Bouncing Smiling Emoji Bubbles
          const emojis = ['😄', '✨', '🎈', '🌟', '🥳'];
          return {
            type: 'emoji',
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            x,
            y,
            size: Math.random() * 10 + 14,
            speedY: -(Math.random() * 1.2 + 0.6),
            speedX: (Math.random() - 0.5) * 1.2,
            alpha: Math.random() * 0.7 + 0.3
          };

        default:
          // 'all' Mode: Ambient Gentle Cosmic Motes
          return {
            type: 'mote',
            x,
            y,
            radius: Math.random() * 2.2 + 1,
            speedY: (Math.random() - 0.5) * 0.4,
            speedX: (Math.random() - 0.5) * 0.4,
            color: '#a855f7',
            alpha: Math.random() * 0.5 + 0.2
          };
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      const time = Date.now() * 0.002;

      // Draw glowing constellation filaments in 'all' mode
      if (this.category === 'all') {
        const count = this.particles.length;
        for (let i = 0; i < count; i++) {
          const p1 = this.particles[i];
          for (let j = i + 1; j < count; j++) {
            const p2 = this.particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 7225) { // < 85px
              const dist = Math.sqrt(distSq);
              this.ctx.beginPath();
              this.ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 * (1 - dist / 85)})`;
              this.ctx.lineWidth = 0.65;
              this.ctx.moveTo(p1.x, p1.y);
              this.ctx.lineTo(p2.x, p2.y);
              this.ctx.stroke();
            }
          }
        }
      }

      for (let i = 0; i < this.particles.length; i++) {
        let p = this.particles[i];

        // Soft fluid mouse repulsion
        if (this.isMouseActive) {
          const mdx = p.x - this.mouseX;
          const mdy = p.y - this.mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 130 && mdist > 0) {
            const force = (1 - mdist / 130) * 2.4;
            p.x += (mdx / mdist) * force;
            p.y += (mdy / mdist) * force;
          }
        }

        if (p.type === 'rain') {
          // Falling raindrop
          this.ctx.beginPath();
          this.ctx.strokeStyle = p.color;
          this.ctx.lineWidth = p.width;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
          this.ctx.stroke();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > this.height) {
            this.particles[i] = this.spawnParticle(false);
          }
        } else if (p.type === 'ember') {
          // Dynamic flickering spark
          const flicker = Math.sin(time * 3 + i) * 0.15;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, Math.max(0.5, p.radius + flicker), 0, Math.PI * 2);
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = Math.max(0.1, Math.min(1, p.alpha + flicker));
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = p.color;
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
          this.ctx.globalAlpha = 1;

          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.y * 0.03) * 0.45;
          p.alpha -= p.decay;

          if (p.y < 0 || p.alpha <= 0) {
            this.particles[i] = this.spawnParticle(false);
          }
        } else if (p.type === 'star') {
          // Twinkling soft star with gentle sway
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation);
          this.ctx.fillStyle = p.color;
          const twinkle = Math.sin(time * 2 + i) * 0.2;
          this.ctx.globalAlpha = Math.max(0.1, Math.min(1, p.alpha + twinkle));
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = p.color;

          const r = p.size;
          this.ctx.beginPath();
          this.ctx.moveTo(0, -r);
          this.ctx.quadraticCurveTo(0, 0, r, 0);
          this.ctx.quadraticCurveTo(0, 0, 0, r);
          this.ctx.quadraticCurveTo(0, 0, -r, 0);
          this.ctx.quadraticCurveTo(0, 0, 0, -r);
          this.ctx.fill();

          this.ctx.restore();

          p.y += p.speedY;
          p.x += p.speedX + Math.sin(time + p.y * 0.015) * 0.5;
          p.rotation += p.rotSpeed;

          if (p.y < -15) {
            this.particles[i] = this.spawnParticle(false);
          }
        } else if (p.type === 'heart') {
          // Floating gentle heart
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation);
          this.ctx.font = `${p.size}px serif`;
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = p.alpha;
          this.ctx.fillText('❤️', 0, 0);
          this.ctx.restore();

          p.y += p.speedY;
          p.x += p.speedX + Math.sin(time + p.y * 0.02) * 0.6;
          p.rotation += p.rotSpeed;

          if (p.y < -15) {
            this.particles[i] = this.spawnParticle(false);
          }
        } else if (p.type === 'emoji') {
          // Floating bobbing emoji
          this.ctx.save();
          this.ctx.font = `${p.size}px sans-serif`;
          this.ctx.globalAlpha = p.alpha;
          this.ctx.fillText(p.emoji, p.x, p.y);
          this.ctx.restore();

          p.y += p.speedY + Math.sin(time * 2 + p.x) * 0.3;
          p.x += p.speedX;

          if (p.y < -20) {
            this.particles[i] = this.spawnParticle(false);
          }
        } else {
          // Ambient mote with subtle glow
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = p.alpha;
          this.ctx.shadowBlur = 6;
          this.ctx.shadowColor = p.color;
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
          this.ctx.globalAlpha = 1;

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y < 0 || p.y > this.height || p.x < 0 || p.x > this.width) {
            this.particles[i] = this.spawnParticle(false);
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
  }

  // --------------------------------------------------------------------------
  // 15. BUTTON RIPPLE EFFECT
  // --------------------------------------------------------------------------
  function setupRipples() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn-ripple');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('ripple');

      const existingRipple = btn.querySelector('.ripple');
      if (existingRipple) existingRipple.remove();

      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  }

  // --------------------------------------------------------------------------
  // 16. UTILITY FUNCTIONS
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --------------------------------------------------------------------------
  // 17. EVENT LISTENERS SETUP
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Primary Section Switcher (Shayari vs Poetry)
    if (typeBtnShayari) {
      typeBtnShayari.addEventListener('click', () => setType('shayari'));
    }
    if (typeBtnPoetry) {
      typeBtnPoetry.addEventListener('click', () => setType('poetry'));
    }

    // User Auth & Profile Menu
    if (authModalBtn) {
      authModalBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentUser) {
          if (userProfileMenu) {
            const isVisible = userProfileMenu.style.display === 'block';
            userProfileMenu.style.display = isVisible ? 'none' : 'block';
          }
        } else {
          openAuthModal('login');
        }
      });
    }

    if (userLogoutBtn) {
      userLogoutBtn.addEventListener('click', handleLogout);
    }

    // Click outside to dismiss user profile menu
    document.addEventListener('click', (e) => {
      if (userProfileMenu && userProfileMenu.style.display === 'block') {
        if (!userProfileMenu.contains(e.target) && !authModalBtn.contains(e.target)) {
          userProfileMenu.style.display = 'none';
        }
      }
    });

    // Auth Modal Controls
    if (authModalCloseBtn) authModalCloseBtn.addEventListener('click', closeAuthModal);
    if (authCancelBtn) authCancelBtn.addEventListener('click', closeAuthModal);
    if (authTabLogin) authTabLogin.addEventListener('click', () => switchAuthTab('login'));
    if (authTabSignup) authTabSignup.addEventListener('click', () => switchAuthTab('signup'));
    if (authForm) authForm.addEventListener('submit', handleAuthSubmit);
    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
      });
    }

    // Locked Sanctuary Buttons
    if (lockLoginBtn) {
      lockLoginBtn.addEventListener('click', () => openAuthModal('login'));
    }
    if (lockSignupBtn) {
      lockSignupBtn.addEventListener('click', () => openAuthModal('signup'));
    }

    // Category Tabs Click
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        setCategory(tab.dataset.category);
      });
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      searchClearBtn.style.display = searchQuery ? 'flex' : 'none';
      renderCards();
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.style.display = 'none';
      searchInput.focus();
      renderCards();
    });

    // Favourites Filter Toggle
    filterFavBtn.addEventListener('click', () => {
      favoritesOnly = !favoritesOnly;
      filterFavBtn.classList.toggle('active', favoritesOnly);
      filterFavBtn.setAttribute('data-fav-filter', favoritesOnly ? 'true' : 'false');
      renderCards();
      const typePlural = currentType === 'poetry' ? 'poems' : 'shayaris';
      showToast(
        favoritesOnly ? `Showing favourite ${typePlural} only` : `Showing all ${typePlural}`,
        favoritesOnly ? '❤️' : '✨'
      );
    });

    // Sort Dropdown
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      renderCards();
    });

    // Hero Typewriter Shuffle
    heroShuffleBtn.addEventListener('click', shuffleTypewriter);

    // Modal Trigger Buttons
    openAddModalBtn.addEventListener('click', openAddModal);
    emptyAddBtn.addEventListener('click', openAddModal);
    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);

    // Click outside modal to close
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Delete Modal Listeners
    if (deleteModalCloseBtn) deleteModalCloseBtn.addEventListener('click', closeDeleteModal);
    if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', closeDeleteModal);
    if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', handleConfirmDelete);
    if (deleteModal) {
      deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
      });
    }

    // Keyboard Shortcuts (Esc to close, Ctrl+Enter to submit form)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (authModal && authModal.classList.contains('active')) {
          closeAuthModal();
        } else if (deleteModal && deleteModal.classList.contains('active')) {
          closeDeleteModal();
        } else if (modalOverlay.classList.contains('active')) {
          closeModal();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (authModal && authModal.classList.contains('active')) {
          authForm.requestSubmit();
        } else if (modalOverlay.classList.contains('active')) {
          shayariForm.requestSubmit();
        }
      }
    });

    // Form Events
    shayariForm.addEventListener('submit', handleFormSubmit);

    // When switching content-type radio inside modal, adjust labels dynamically
    const modalTypeRadios = shayariForm.querySelectorAll('input[name="content-type"]');
    modalTypeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        const selectedType = radio.value;
        const isPoetry = selectedType === 'poetry';
        if (formContentLabel) {
          formContentLabel.innerHTML = isPoetry 
            ? 'Poetry Stanzas / Verses <span class="required">*</span>'
            : 'Shayari Lines (Matla &amp; Maqta) <span class="required">*</span>';
        }
        if (!formEditId.value) {
          modalHeading.textContent = isPoetry ? 'Add New Poem' : 'Add New Shayari';
          formSubmitText.textContent = isPoetry ? 'Save Poem to Diary' : 'Save Shayari to Diary';
        }
      });
    });

    formContent.addEventListener('input', () => {
      formCharCount.textContent = `${formContent.value.length} characters`;
      if (formContent.value.trim()) {
        clearFormErrors();
      }
    });

    // Helper Tool: Insert Quotes
    btnQuoteTool.addEventListener('click', () => {
      const start = formContent.selectionStart;
      const end = formContent.selectionEnd;
      const selected = formContent.value.substring(start, end);
      const replacement = selected ? `“${selected}”` : '“”';
      formContent.setRangeText(replacement, start, end, 'end');
      formContent.focus();
      formCharCount.textContent = `${formContent.value.length} characters`;
    });

    // Theme Toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Export & Import
    exportJsonBtn.addEventListener('click', exportToJson);
    importJsonBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', handleImportJson);

    // Window Resize for Tab Underline & Type Indicator
    window.addEventListener('resize', () => {
      updateTabIndicator();
      updateTypeIndicator();
    });
  }

  // --------------------------------------------------------------------------
  // 18. APPLICATION BOOTSTRAP
  // --------------------------------------------------------------------------
  function initApp() {
    initTheme();
    loadShayaris();
    setupEventListeners();
    setupRipples();

    // Start Ambient Particle Canvas
    if (ambientCanvas) {
      particleSystem = new ParticleCanvas(ambientCanvas);
    }

    // Render initial cards & counters
    renderCards();

    // Start Hero Typewriter
    startTypewriter();

    // Position tab indicator after layout paints
    setTimeout(() => {
      updateTabIndicator();
      updateTypeIndicator();
    }, 120);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
