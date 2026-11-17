(function () {
  'use strict';

  const SAVE_KEY = 'utulna_benzinka_save_v1';
  const ACCOUNTS_KEY = 'utulna_benzinka_accounts_v1';
  const SESSION_KEY = 'utulna_benzinka_session_v1';
  const SETTINGS_KEY = 'utulna_benzinka_settings_v1';

  function createDefaultSettings() {
    return {
      volume: 80,
      musicVolume: 70,
      muted: false,
      smartAssist: true,
      rightClickCancel: true,
      keyShortcuts: true
    };
  }

  const CAR_PALETTES = [
    { color: '#e07a5f', roofColor: '#f2a68d', variant: 'sedan' },
    { color: '#81b29a', roofColor: '#a8d1bd', variant: 'van' },
    { color: '#f2cc8f', roofColor: '#fae1b8', variant: 'sedan' },
    { color: '#5ca4a9', roofColor: '#87c5c9', variant: 'van' },
    { color: '#9c89b8', roofColor: '#bfb0d6', variant: 'sedan' },
    { color: '#d4746b', roofColor: '#e99b94', variant: 'sedan' }
  ];

  const SHIRT_COLORS = ['#e07a5f', '#5ca4a9', '#81b29a', '#d9a05b', '#8d7b9e', '#c97b84'];
  const HAIR_COLORS = ['#4a3525', '#7b5333', '#c88c4b', '#2f292b', '#a85a42'];
  const SKIN_COLORS = ['#fbdcc4', '#f4c7a5', '#e5b28a'];

  const PATH_WAYPOINTS = {
    CORNER_SW: { x: 495, y: 488 },
    DOOR_OUT: { x: 603, y: 488 },
    DOOR_IN: { x: 603, y: 455 },
    AISLE_WEST: { x: 603, y: 368 },
    COUNTER_LEFT_SOUTH: { x: 560, y: 332 },
    COUNTER_LEFT_NORTH: { x: 560, y: 246 },
    COUNTER_GAP_SOUTH: { x: 1044, y: 345 },
    COUNTER_GAP_NORTH: { x: 1044, y: 246 },
    STORAGE_DOOR_WEST: { x: 1052, y: 285 },
    STORAGE_DOOR_EAST: { x: 1102, y: 285 }
  };

  function createDefaultSave() {
    return {
      coins: 160,
      unlockedLevel: 1,
      stars: {},
      upgrades: {
        pumps: 1,
        coffee: 1,
        grill: 1,
        wash: 1,
        racks: 1,
        decor: 1,
        shoes: 1
      },
      staff: {
        tonik: 0,
        anicka: 0,
        kuba: 0
      },
      staffEnabled: {
        tonik: true,
        anicka: true,
        kuba: true
      }
    };
  }

  function normalizeSave(raw) {
    const def = createDefaultSave();
    if (!raw || typeof raw !== 'object') return def;
    return {
      coins: typeof raw.coins === 'number' ? raw.coins : def.coins,
      unlockedLevel: typeof raw.unlockedLevel === 'number' ? raw.unlockedLevel : def.unlockedLevel,
      stars: raw.stars && typeof raw.stars === 'object' ? raw.stars : {},
      upgrades: Object.assign({}, def.upgrades, raw.upgrades || {}),
      staff: Object.assign({}, def.staff, raw.staff || {}),
      staffEnabled: Object.assign({}, def.staffEnabled, raw.staffEnabled || {})
    };
  }

  class GasStationGame {
    constructor() {
      this.data = window.GAME_DATA;
      this.audio = window.SoundManager;
      this.currentUser = this._loadSession();
      this.isGuest = false;
      this.hasApiBackend = null;
      this.settings = this._loadSettings();
      this.save = createDefaultSave();

      this.selectedLevelId = 1;
      this.screen = 'map'; // 'map' | 'game'
      this.paused = false;

      this.canvas = document.getElementById('station-canvas');
      this.renderer = new window.StationRenderer(this.canvas);

      this.levelState = null;
      this.rafId = null;
      this.lastFrameTime = 0;

      this._applyAudioSettings();
      this._bindUI();
      this._syncSettingsUI();
      this._initAccountSession();
    }

    _loadSettings() {
      const def = createDefaultSettings();
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return def;
        const parsed = JSON.parse(raw);
        return {
          volume: typeof parsed.volume === 'number' ? parsed.volume : def.volume,
          musicVolume: typeof parsed.musicVolume === 'number' ? parsed.musicVolume : def.musicVolume,
          muted: Boolean(parsed.muted),
          smartAssist: parsed.smartAssist !== undefined ? Boolean(parsed.smartAssist) : def.smartAssist,
          rightClickCancel:
            parsed.rightClickCancel !== undefined ? Boolean(parsed.rightClickCancel) : def.rightClickCancel,
          keyShortcuts: parsed.keyShortcuts !== undefined ? Boolean(parsed.keyShortcuts) : def.keyShortcuts
        };
      } catch (_err) {
        return def;
      }
    }

    _persistSettings() {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      } catch (_err) {
        // Ignore storage errors
      }
    }

    _applyAudioSettings() {
      this.audio.muted = Boolean(this.settings.muted);
      this.audio.setVolume(this.settings.volume / 100);
      this.audio.setMusicVolume(this.settings.musicVolume / 100);
      if (this.audio.muted) {
        this.audio.stopAmbient();
      }
    }

    _syncSettingsUI() {
      document.getElementById('volume-slider').value = String(this.settings.volume);
      document.getElementById('volume-label').textContent = `${this.settings.volume} %`;
      document.getElementById('music-slider').value = String(this.settings.musicVolume);
      document.getElementById('music-label').textContent = `${this.settings.musicVolume} %`;
      document.getElementById('mute-btn').textContent = this.settings.muted ? '🔇 Zvuk vypnut' : '🔊 Zvuk zapnut';
      document.getElementById('ctrl-smart-assist').checked = this.settings.smartAssist;
      document.getElementById('ctrl-right-cancel').checked = this.settings.rightClickCancel;
      document.getElementById('ctrl-keys').checked = this.settings.keyShortcuts;
    }

    openSettingsModal() {
      this._syncSettingsUI();
      this.updateGlobalHUD();
      document.getElementById('settings-modal').classList.remove('hidden');
    }

    closeSettingsModal() {
      document.getElementById('settings-modal').classList.add('hidden');
    }

    _loadSession() {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.username && parsed.password) {
          return { username: parsed.username, password: parsed.password };
        }
      } catch (_err) {
        // Ignore parse errors
      }
      return null;
    }

    _saveSession(user) {
      this.currentUser = user;
      try {
        if (user) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (_err) {
        // Ignore storage errors
      }
    }

    _loadLocalAccounts() {
      try {
        const raw = localStorage.getItem(ACCOUNTS_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (_err) {
        return {};
      }
    }

    _saveLocalAccounts(accounts) {
      try {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      } catch (_err) {
        // Ignore storage errors
      }
    }

    async _initAccountSession() {
      if (this.currentUser) {
        try {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.currentUser)
          });
          const ct = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
          if (!ct.includes('application/json')) {
            this.hasApiBackend = false;
            throw new Error('Static host');
          }
          this.hasApiBackend = true;
          const data = await res.json();
          if (data && data.ok) {
            this.save = normalizeSave(data.save);
            this.selectedLevelId = Math.min(this.save.unlockedLevel, this.data.LEVELS.length);
            this.renderMap();
            this.updateGlobalHUD();
            return;
          }
        } catch (_err) {
          // Fallback to local account storage
          const accounts = this._loadLocalAccounts();
          const acc = accounts[this.currentUser.username.toLowerCase()];
          if (acc && acc.password === this.currentUser.password) {
            this.save = normalizeSave(acc.save);
            this.selectedLevelId = Math.min(this.save.unlockedLevel, this.data.LEVELS.length);
            this.renderMap();
            this.updateGlobalHUD();
            return;
          }
        }
        // Invalid stored session -> ask to log in cleanly
        this._saveSession(null);
      }

      this.save = this.loadFallbackSave();
      this.selectedLevelId = Math.min(this.save.unlockedLevel, this.data.LEVELS.length);
      this.renderMap();
      this.updateGlobalHUD();
      this.openAuthModal();
    }

    loadFallbackSave() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return createDefaultSave();
        return normalizeSave(JSON.parse(raw));
      } catch (_err) {
        return createDefaultSave();
      }
    }

    persistSave() {
      if (this.isGuest || !this.currentUser) {
        this.updateGlobalHUD();
        return;
      }

      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.save));
      } catch (_err) {
        // Ignore storage errors
      }

      const accounts = this._loadLocalAccounts();
      const key = this.currentUser.username.toLowerCase();
      accounts[key] = {
        username: this.currentUser.username,
        password: this.currentUser.password,
        save: this.save
      };
      this._saveLocalAccounts(accounts);

      if (this.hasApiBackend !== false) {
        fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.currentUser.username,
            password: this.currentUser.password,
            save: this.save
          })
        }).catch(() => {});
      }

      this.updateGlobalHUD();
    }

    openAuthModal() {
      const msgEl = document.getElementById('auth-message');
      msgEl.classList.add('hidden');
      msgEl.classList.remove('success');
      msgEl.textContent = '';
      document.getElementById('auth-username').value = '';
      document.getElementById('auth-password').value = '';
      document.getElementById('auth-modal').classList.remove('hidden');
    }

    closeAuthModal() {
      document.getElementById('auth-modal').classList.add('hidden');
    }

    _showAuthMessage(text, isSuccess) {
      const msgEl = document.getElementById('auth-message');
      msgEl.textContent = text;
      msgEl.classList.remove('hidden');
      if (isSuccess) msgEl.classList.add('success');
      else msgEl.classList.remove('success');
    }

    async _handleAuth(mode) {
      const username = document.getElementById('auth-username').value.trim();
      const password = document.getElementById('auth-password').value;

      if (!username || !password) {
        this._showAuthMessage('Zadej prosím jméno hráče i heslo.', false);
        return;
      }

      this.audio.playClick();
      const endpoint = mode === 'register' ? '/api/register' : '/api/login';
      const payload =
        mode === 'register'
          ? { username, password, save: createDefaultSave() }
          : { username, password };

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const ct = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
        if (!ct.includes('application/json')) {
          this.hasApiBackend = false;
          throw new Error('Static host');
        }
        this.hasApiBackend = true;
        const data = await res.json();
        if (!data || !data.ok) {
          this._showAuthMessage((data && data.error) || 'Přihlášení se nezdařilo.', false);
          return;
        }
        this._completeLogin(data.username, password, data.save);
        return;
      } catch (_err) {
        // Fallback when opened directly as file:// without server.js
        const accounts = this._loadLocalAccounts();
        const key = username.toLowerCase();
        if (mode === 'register') {
          if (accounts[key]) {
            this._showAuthMessage('Toto jméno už existuje. Zvol jiné nebo se přihlas.', false);
            return;
          }
          const newSave = createDefaultSave();
          accounts[key] = { username, password, save: newSave };
          this._saveLocalAccounts(accounts);
          this._completeLogin(username, password, newSave);
        } else {
          const acc = accounts[key];
          if (!acc) {
            this._showAuthMessage('Účet s tímto jménem nebyl nalezen.', false);
            return;
          }
          if (acc.password !== password) {
            this._showAuthMessage('Nesprávné heslo.', false);
            return;
          }
          this._completeLogin(acc.username, password, acc.save);
        }
      }
    }

    _completeLogin(username, password, saveObj) {
      this.isGuest = false;
      this._saveSession({ username, password });
      this.save = normalizeSave(saveObj);
      this.selectedLevelId = Math.min(this.save.unlockedLevel, this.data.LEVELS.length);
      document.getElementById('logout-btn').textContent = '🚪 Odhlásit / Účet';
      this.persistSave();
      this.closeAuthModal();
      this.renderMap();
      this.updateGlobalHUD();
      this.audio.playHappy();
    }

    _startGuestSession() {
      this.audio.playClick();
      this.isGuest = true;
      this._saveSession(null);
      this.save = createDefaultSave();
      this.selectedLevelId = 1;
      document.getElementById('logout-btn').textContent = '🔑 Přihlásit se';
      this.closeAuthModal();
      this.renderMap();
      this.updateGlobalHUD();
    }

    _bindUI() {
      // Auth Modal buttons
      document.getElementById('auth-login-btn').addEventListener('click', () => this._handleAuth('login'));
      document.getElementById('auth-register-btn').addEventListener('click', () => this._handleAuth('register'));
      document.getElementById('auth-guest-btn').addEventListener('click', () => this._startGuestSession());
      document.getElementById('auth-password').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this._handleAuth('login');
        }
      });

      document.getElementById('logout-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.closeSettingsModal();
        if (this.screen === 'game') {
          this.exitLevelToMap();
        }
        if (!this.isGuest && this.currentUser) {
          this.persistSave();
        }
        this.isGuest = false;
        this._saveSession(null);
        document.getElementById('logout-btn').textContent = '🚪 Odhlásit / Přepnout účet';
        this.updateGlobalHUD();
        this.openAuthModal();
      });

      // Top navigation & buttons
      document.getElementById('open-shop-map-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.openPrepModal(this.selectedLevelId);
      });

      document.getElementById('help-btn').addEventListener('click', () => {
        this.audio.playClick();
        document.getElementById('help-modal').classList.remove('hidden');
      });

      document.getElementById('close-help-btn').addEventListener('click', () => {
        this.audio.playClick();
        document.getElementById('help-modal').classList.add('hidden');
      });

      // Settings & Controls Modal
      document.getElementById('settings-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.openSettingsModal();
      });

      document.getElementById('game-settings-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.openSettingsModal();
      });

      document.getElementById('close-settings-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.closeSettingsModal();
      });

      document.getElementById('volume-slider').addEventListener('input', (e) => {
        this.settings.volume = Number(e.target.value);
        this.settings.muted = this.settings.volume === 0 ? true : this.settings.muted;
        this._applyAudioSettings();
        this._persistSettings();
        this._syncSettingsUI();
      });

      document.getElementById('music-slider').addEventListener('input', (e) => {
        this.settings.musicVolume = Number(e.target.value);
        this._applyAudioSettings();
        this._persistSettings();
        this._syncSettingsUI();
      });

      document.getElementById('mute-btn').addEventListener('click', () => {
        const muted = this.audio.toggleMute();
        this.settings.muted = muted;
        this._persistSettings();
        this._syncSettingsUI();
        if (!muted && this.screen === 'game') {
          this.audio.startAmbient();
        }
      });

      document.getElementById('ctrl-smart-assist').addEventListener('change', (e) => {
        this.settings.smartAssist = Boolean(e.target.checked);
        this._persistSettings();
      });

      document.getElementById('ctrl-right-cancel').addEventListener('change', (e) => {
        this.settings.rightClickCancel = Boolean(e.target.checked);
        this._persistSettings();
      });

      document.getElementById('ctrl-keys').addEventListener('change', (e) => {
        this.settings.keyShortcuts = Boolean(e.target.checked);
        this._persistSettings();
      });

      document.getElementById('reset-save-btn').addEventListener('click', () => {
        this.audio.playClick();
        if (window.confirm('Opravdu chceš začít úplně od začátku a vymazat postup?')) {
          this.closeSettingsModal();
          if (this.screen === 'game') {
            this.exitLevelToMap();
          }
          this.save = createDefaultSave();
          this.selectedLevelId = 1;
          this.persistSave();
          this.renderMap();
        }
      });

      // Prep Modal Controls
      document.getElementById('close-prep-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.closePrepModal();
      });

      document.getElementById('prep-bonus-btn').addEventListener('click', () => {
        this.audio.playUpgrade();
        this.save.coins += 200;
        this.persistSave();
        this.renderPrepModal();
        this.renderMap();
      });

      document.getElementById('start-level-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.closePrepModal();
        this.startLevel(this.selectedLevelId);
      });

      // Tabs in Prep Modal
      document.querySelectorAll('.prep-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.audio.playClick();
          const tab = btn.getAttribute('data-tab');
          document.querySelectorAll('.prep-tab-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          document.querySelectorAll('.prep-panel').forEach((p) => p.classList.remove('active'));
          document.getElementById(`prep-panel-${tab}`).classList.add('active');
        });
      });

      // Gameplay HUD Controls
      document.getElementById('pause-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.togglePause();
      });

      document.getElementById('clear-queue-btn').addEventListener('click', () => {
        if (!this.levelState) return;
        this.audio.playClick();
        this.levelState.player.taskQueue = [];
        if (this.levelState.player.actionTimer <= 0) {
          this.levelState.player.currentTask = null;
          this.levelState.player.waypoints = [];
          this.levelState.player.moving = false;
        }
      });

      // Result Modal Controls
      document.getElementById('result-replay-btn').addEventListener('click', () => {
        this.audio.playClick();
        document.getElementById('result-modal').classList.add('hidden');
        this.startLevel(this.selectedLevelId);
      });

      document.getElementById('result-map-btn').addEventListener('click', () => {
        this.audio.playClick();
        document.getElementById('result-modal').classList.add('hidden');
        this.exitLevelToMap();
      });

      document.getElementById('result-next-btn').addEventListener('click', () => {
        this.audio.playClick();
        document.getElementById('result-modal').classList.add('hidden');
        const nextId = Math.min(this.selectedLevelId + 1, this.data.LEVELS.length);
        this.selectedLevelId = nextId;
        this.exitLevelToMap();
      });

      // Canvas mouse events
      this.canvas.addEventListener('mousemove', (e) => this._onCanvasMouseMove(e));
      this.canvas.addEventListener('mouseleave', () => {
        if (this.levelState) {
          this.levelState.hoveredTarget = null;
        }
      });
      this.canvas.addEventListener('click', (e) => this._onCanvasClick(e));
      this.canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (this.levelState && this.settings.rightClickCancel) {
          this.levelState.player.taskQueue = [];
        }
      });

      document.addEventListener('keydown', (e) => {
        if (!this.settings.keyShortcuts || this.screen !== 'game' || !this.levelState) return;
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
        if (!document.getElementById('settings-modal').classList.contains('hidden')) return;

        if (e.code === 'Space' || e.code === 'KeyP') {
          e.preventDefault();
          this.audio.playClick();
          this.togglePause();
        } else if (e.code === 'Escape' || e.code === 'KeyC') {
          this.audio.playClick();
          this.levelState.player.taskQueue = [];
          if (this.levelState.player.actionTimer <= 0) {
            this.levelState.player.currentTask = null;
            this.levelState.player.waypoints = [];
            this.levelState.player.moving = false;
          }
        }
      });
    }

    updateGlobalHUD() {
      const totalStars = Object.values(this.save.stars).reduce((acc, s) => acc + s, 0);
      const maxStars = this.data.LEVELS.length * 3;
      const userLabel = this.isGuest
        ? 'Host (neukládá se)'
        : this.currentUser
        ? this.currentUser.username
        : 'Host';
      document.getElementById('user-badge-name').textContent = userLabel;
      const settingsUserEl = document.getElementById('settings-user-label');
      if (settingsUserEl) {
        settingsUserEl.textContent = `Aktivní hráč: ${userLabel}`;
      }
      document.getElementById('map-coins').textContent = `${this.save.coins} Kč`;
      document.getElementById('map-stars').textContent = `${totalStars} / ${maxStars} ⭐`;
      document.getElementById('prep-coins').textContent = `${this.save.coins} Kč`;
    }

    renderMap() {
      this.updateGlobalHUD();
      const svg = document.getElementById('map-road-svg');
      const nodesLayer = document.getElementById('map-nodes-layer');
      nodesLayer.innerHTML = '';

      const levels = this.data.LEVELS;
      let pathMarkup = `
        <defs>
          <linearGradient id="mapSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fff4db" />
            <stop offset="100%" stop-color="#e5ebd3" />
          </linearGradient>
        </defs>
        <rect width="1150" height="560" fill="url(#mapSky)" rx="22" />
        <path d="M0,180 Q280,120 580,165 T1150,150 L1150,560 L0,560 Z" fill="#d7e4c2" opacity="0.7" />
        <path d="M0,340 Q320,290 660,335 T1150,310 L1150,560 L0,560 Z" fill="#c7d8b0" opacity="0.65" />
        <ellipse cx="520" cy="145" rx="95" ry="26" fill="#9fd0db" opacity="0.7" />
        <ellipse cx="1020" cy="110" rx="135" ry="38" fill="#8cc4d4" opacity="0.8" />
      `;

      const props = [
        [65, 290, '🌲'], [185, 445, '🌻'], [310, 210, '🍎'], [445, 470, '🌲'],
        [585, 195, '⛵'], [710, 445, '🏡'], [835, 165, '🍇'], [960, 425, '⛰️'], [1075, 125, '🚨']
      ];
      props.forEach(([px, py, emoji]) => {
        pathMarkup += `<text x="${px}" y="${py}" font-size="26" text-anchor="middle">${emoji}</text>`;
      });

      for (let i = 0; i < levels.length - 1; i++) {
        const a = levels[i];
        const b = levels[i + 1];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 + (i % 2 === 0 ? -38 : 38);
        const unlockedSegment = b.id <= this.save.unlockedLevel;

        pathMarkup += `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="${
          unlockedSegment ? '#8c7258' : '#b7ab98'
        }" stroke-width="24" stroke-linecap="round" opacity="${unlockedSegment ? 0.9 : 0.45}" />`;

        pathMarkup += `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="${
          unlockedSegment ? '#fff5dc' : '#e6decb'
        }" stroke-width="3.5" stroke-dasharray="10 10" stroke-linecap="round" />`;
      }

      svg.innerHTML = pathMarkup;

      levels.forEach((lvl) => {
        const isUnlocked = lvl.id <= this.save.unlockedLevel;
        const starsEarned = this.save.stars[lvl.id] || 0;
        const isSelected = lvl.id === this.selectedLevelId;

        const btn = document.createElement('button');
        btn.id = `stop-node-${lvl.id}`;
        btn.type = 'button';
        btn.className = `map-stop-node ${isUnlocked ? 'unlocked' : 'locked'} ${
          starsEarned > 0 ? 'completed' : ''
        } ${isSelected ? 'selected' : ''}`;
        btn.style.left = `${(lvl.x / 1150) * 100}%`;
        btn.style.top = `${(lvl.y / 560) * 100}%`;

        let starsHtml = '';
        for (let s = 1; s <= 3; s++) {
          starsHtml += `<span class="${s <= starsEarned ? 'star-on' : 'star-off'}">★</span>`;
        }

        btn.innerHTML = `
          <div class="stop-badge">${isUnlocked ? lvl.id : '🔒'}</div>
          <div class="stop-label">
            <span class="stop-name">${lvl.name}</span>
            <span class="stop-stars">${starsHtml}</span>
          </div>
        `;

        if (isUnlocked) {
          const handleOpen = (e) => {
            e.stopPropagation();
            this.audio.playClick();
            this.selectedLevelId = lvl.id;
            nodesLayer.querySelectorAll('.map-stop-node').forEach((n) => n.classList.remove('selected'));
            btn.classList.add('selected');
            this.openPrepModal(lvl.id);
          };
          btn.addEventListener('click', handleOpen);
          const badge = btn.querySelector('.stop-badge');
          const label = btn.querySelector('.stop-label');
          if (badge) badge.addEventListener('click', handleOpen);
          if (label) label.addEventListener('click', handleOpen);
        } else {
          btn.title = 'Dokonči předchozí zastávku alespoň na 1 hvězdu.';
        }

        nodesLayer.appendChild(btn);
      });
    }

    openPrepModal(levelId) {
      this.selectedLevelId = levelId;
      this.renderPrepModal();
      document.getElementById('prep-modal').classList.remove('hidden');
    }

    closePrepModal() {
      document.getElementById('prep-modal').classList.add('hidden');
    }

    renderPrepModal() {
      const level = this.data.LEVELS.find((l) => l.id === this.selectedLevelId) || this.data.LEVELS[0];
      document.getElementById('prep-level-title').textContent = `${level.id}. ${level.name}`;
      document.getElementById('prep-level-subtitle').textContent = level.subtitle;
      document.getElementById('prep-level-meta').textContent =
        `Zákazníků ve směně: ${level.customers} · Cíl: ⭐ ${level.stars[0]} Kč · ⭐⭐ ${level.stars[1]} Kč · ⭐⭐⭐ ${level.stars[2]} Kč`;
      document.getElementById('prep-coins').textContent = `${this.save.coins} Kč`;

      const upgradesGrid = document.getElementById('upgrades-list');
      upgradesGrid.innerHTML = '';

      this.data.UPGRADES.forEach((upg) => {
        const curLvl = this.save.upgrades[upg.id] || 1;
        const isMax = curLvl >= upg.maxLevel;
        const nextCost = isMax ? null : upg.costs[curLvl - 1];
        const canAfford = nextCost !== null && this.save.coins >= nextCost;

        let pips = '';
        for (let i = 1; i <= upg.maxLevel; i++) {
          pips += `<span class="lvl-pip ${i <= curLvl ? 'filled' : ''}"></span>`;
        }

        const card = document.createElement('div');
        card.className = 'prep-card';
        card.innerHTML = `
          <div class="prep-card-head">
            <span class="prep-icon">${upg.icon}</span>
            <div>
              <h4>${upg.name}</h4>
              <div class="lvl-pips">${pips} <span class="lvl-text">Úr. ${curLvl}/${upg.maxLevel}</span></div>
            </div>
          </div>
          <p class="prep-desc">${upg.description}</p>
          <button type="button" class="btn-buy" data-upgrade="${upg.id}" ${
            isMax || !canAfford ? 'disabled' : ''
          }>
            ${isMax ? '✨ Na maximu' : `Vylepšit (${nextCost} Kč)`}
          </button>
        `;

        const btn = card.querySelector('.btn-buy');
        if (!isMax) {
          btn.addEventListener('click', () => this.buyUpgrade(upg.id));
        }

        upgradesGrid.appendChild(card);
      });

      const staffGrid = document.getElementById('staff-list');
      staffGrid.innerHTML = '';

      this.data.STAFF.forEach((st) => {
        const curLvl = this.save.staff[st.id] || 0;
        const isHired = curLvl > 0;
        const isMax = curLvl >= st.maxLevel;
        const nextCost = !isHired ? st.hireCost : isMax ? null : st.upgradeCosts[curLvl - 1];
        const canAfford = nextCost !== null && this.save.coins >= nextCost;
        const isEnabled = this.save.staffEnabled[st.id] !== false;

        let pips = '';
        for (let i = 1; i <= st.maxLevel; i++) {
          pips += `<span class="lvl-pip ${i <= curLvl ? 'filled' : ''}"></span>`;
        }

        const card = document.createElement('div');
        card.className = `prep-card ${isHired ? 'hired-card' : ''}`;
        card.innerHTML = `
          <div class="prep-card-head">
            <span class="prep-icon">${st.icon}</span>
            <div>
              <h4>${st.name}</h4>
              <div class="lvl-pips">${pips} <span class="lvl-text">${
                isHired ? `Úr. ${curLvl}/${st.maxLevel}` : 'Nenajatý'
              }</span></div>
            </div>
          </div>
          <p class="prep-desc">${st.description}</p>
          <div class="staff-actions">
            <button type="button" class="btn-buy" data-staff="${st.id}" ${isMax || !canAfford ? 'disabled' : ''}>
              ${
                !isHired
                  ? `Najmout (${nextCost} Kč)`
                  : isMax
                  ? '✨ Zkušený mistr'
                  : `Zrychlit (${nextCost} Kč)`
              }
            </button>
            ${
              isHired
                ? `<button type="button" class="btn-toggle ${isEnabled ? 'on' : 'off'}">${
                    isEnabled ? '✅ Ve směně' : '💤 Odpočívá'
                  }</button>`
                : ''
            }
          </div>
        `;

        const buyBtn = card.querySelector('.btn-buy');
        if (!isMax) {
          buyBtn.addEventListener('click', () => this.hireOrUpgradeStaff(st.id));
        }
        const toggleBtn = card.querySelector('.btn-toggle');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', () => {
            this.audio.playClick();
            this.save.staffEnabled[st.id] = !isEnabled;
            this.persistSave();
            this.renderPrepModal();
          });
        }

        staffGrid.appendChild(card);
      });
    }

    buyUpgrade(upgradeId) {
      const upg = this.data.UPGRADES.find((u) => u.id === upgradeId);
      if (!upg) return;
      const curLvl = this.save.upgrades[upgradeId] || 1;
      if (curLvl >= upg.maxLevel) return;
      const cost = upg.costs[curLvl - 1];
      if (this.save.coins < cost) return;

      this.save.coins -= cost;
      this.save.upgrades[upgradeId] = curLvl + 1;
      this.audio.playUpgrade();
      this.persistSave();
      this.renderPrepModal();
      this.renderMap();
    }

    hireOrUpgradeStaff(staffId) {
      const st = this.data.STAFF.find((s) => s.id === staffId);
      if (!st) return;
      const curLvl = this.save.staff[staffId] || 0;
      if (curLvl >= st.maxLevel) return;
      const cost = curLvl === 0 ? st.hireCost : st.upgradeCosts[curLvl - 1];
      if (this.save.coins < cost) return;

      this.save.coins -= cost;
      this.save.staff[staffId] = curLvl + 1;
      this.save.staffEnabled[staffId] = true;
      this.audio.playUpgrade();
      this.persistSave();
      this.renderPrepModal();
      this.renderMap();
    }

    startLevel(levelId) {
      const level = this.data.LEVELS.find((l) => l.id === levelId) || this.data.LEVELS[0];
      this.selectedLevelId = level.id;
      this.screen = 'game';
      this.paused = false;

      document.getElementById('map-screen').classList.add('hidden');
      document.getElementById('game-screen').classList.remove('hidden');
      document.getElementById('pause-btn').textContent = '⏸️ Pauza';

      const shoesLvl = this.save.upgrades.shoes || 1;
      const playerSpeed = 215 * (1 + (shoesLvl - 1) * 0.22);
      const maxCarry = shoesLvl >= 2 ? 3 : 2;

      const racksLvl = this.save.upgrades.racks || 1;
      const maxRackStock = 2 + racksLvl * 2;
      const racks = Object.values(this.data.RACKS).map((r) =>
        Object.assign({}, r, {
          stock: maxRackStock,
          maxStock: maxRackStock
        })
      );

      const player = {
        id: 'player',
        isPlayer: true,
        label: 'Ty (Obsluha)',
        x: 550,
        y: 248,
        speed: playerSpeed,
        color: '#e07a5f',
        hatColor: '#b5554c',
        held: [],
        maxCarry,
        currentTask: null,
        taskQueue: [],
        waypoints: [],
        actionTimer: 0,
        actionDuration: 0,
        moving: false,
        active: true,
        seed: 0
      };

      const workers = [player];
      const staffStartPositions = {
        tonik: { x: 320, y: 315 },
        anicka: { x: 750, y: 244 },
        kuba: { x: 640, y: 246 }
      };

      this.data.STAFF.forEach((st, idx) => {
        const staffLvl = this.save.staff[st.id] || 0;
        const enabled = this.save.staffEnabled[st.id] !== false;
        const startPos = staffStartPositions[st.id] || { x: 580, y: 335 };
        workers.push({
          id: st.id,
          isPlayer: false,
          label: st.shortName,
          role: st.id,
          level: staffLvl,
          x: startPos.x,
          y: startPos.y,
          speed: staffLvl <= 1 ? 82 : staffLvl === 2 ? 130 : 185,
          color: st.color,
          hatColor: st.hatColor,
          held: [],
          maxCarry: 2,
          currentTask: null,
          taskQueue: [],
          waypoints: [],
          actionTimer: 0,
          actionDuration: 0,
          moving: false,
          active: staffLvl > 0 && enabled,
          seed: idx + 1.7
        });
      });

      this.levelState = {
        level,
        save: this.save,
        time: 0,
        earnedCoins: 0,
        servedCount: 0,
        angryCount: 0,
        spawnedCount: 0,
        spawnTimer: 1.1,
        aiTimer: 0.25,
        nextEntityId: 1,
        cars: [],
        customers: [],
        racks,
        spills: [],
        particles: [],
        workers,
        player,
        hoveredTarget: null,
        mouseX: 0,
        mouseY: 0,
        paused: false,
        ended: false,
        buildPath: this._buildPath.bind(this)
      };

      this._updateGameHUD();
      this.audio.init();
      this.audio.startAmbient();

      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.lastFrameTime = performance.now();
      const loop = (now) => {
        const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
        this.lastFrameTime = now;
        if (this.screen === 'game' && this.levelState) {
          if (!this.paused && !this.levelState.ended) {
            this._updateLevel(dt);
          }
          this.renderer.render(this.levelState);
          this.rafId = requestAnimationFrame(loop);
        }
      };
      this.rafId = requestAnimationFrame(loop);
    }

    togglePause() {
      this.paused = !this.paused;
      if (this.levelState) {
        this.levelState.paused = this.paused;
      }
      document.getElementById('pause-btn').textContent = this.paused ? '▶️ Pokračovat' : '⏸️ Pauza';
    }

    exitLevelToMap() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.audio.stopAmbient();
      this.levelState = null;
      this.screen = 'map';
      document.getElementById('game-screen').classList.add('hidden');
      document.getElementById('map-screen').classList.remove('hidden');
      this.renderMap();
    }

    _getCanvasPoint(e) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    _hitTest(x, y) {
      const state = this.levelState;
      if (!state) return null;

      // 1. Cars (waiting at pumps)
      for (let i = state.cars.length - 1; i >= 0; i--) {
        const car = state.cars[i];
        if (car.state === 'waiting') {
          if (Math.abs(x - car.x) <= 64 && y >= car.y - 88 && y <= car.y + 34) {
            return {
              kind: 'car',
              id: car.id,
              obj: car,
              hint: `🚗 Auto u stojanu ${car.pumpIndex + 1} (${this._describeOrders(car.orders)})`
            };
          }
        }
      }

      // 2. Walk-in Customers
      for (let i = state.customers.length - 1; i >= 0; i--) {
        const cust = state.customers[i];
        if (
          cust.state === 'waiting' ||
          cust.state === 'shopping' ||
          cust.state === 'arriving' ||
          cust.state === 'paying'
        ) {
          if (Math.abs(x - cust.x) <= 32 && y >= cust.y - 72 && y <= cust.y + 28) {
            const hint =
              cust.state === 'paying'
                ? '💰 Zákazník čeká u pokladny'
                : cust.state === 'shopping'
                ? `🛒 Vybírá z regálu · Objednávka: ${this._describeOrders(cust.orders)}`
                : `🧑 Zákazník (${this._describeOrders(cust.orders)})`;
            return { kind: 'customer', id: cust.id, obj: cust, hint };
          }
        }
      }

      // 3. Spills
      for (let i = state.spills.length - 1; i >= 0; i--) {
        const spill = state.spills[i];
        const dist = Math.hypot(x - spill.x, y - spill.y);
        if (dist <= 32) {
          return { kind: 'spill', id: spill.id, obj: spill, hint: '🧹 Uklidit louži (+12 Kč)' };
        }
      }

      // 4. Restockable Display Stands (Racks)
      for (const rack of state.racks) {
        if (Math.abs(x - rack.x) <= rack.radius + 6 && Math.abs(y - rack.y) <= rack.radius) {
          const hint =
            rack.stock === 0
              ? `⚠️ ${rack.label} je prázdný! Klikni pro doplnění 📦`
              : `${rack.icon} ${rack.label} (${rack.stock}/${rack.maxStock}) – klikni pro doplnění`;
          return { kind: 'rack', id: rack.id, obj: rack, hint };
        }
      }

      // 5. Stations
      const pumpsLvl = this.save.upgrades.pumps || 1;
      for (const st of Object.values(this.data.STATIONS)) {
        if (st.id === 'pump_2' && pumpsLvl < 2) continue;
        const dist = Math.hypot(x - st.x, y - st.y);
        if (dist <= st.radius) {
          return {
            kind: 'station',
            id: st.id,
            obj: st,
            hint: `${st.icon} ${st.label}`
          };
        }
      }

      return null;
    }

    _getZone(x, y) {
      if (x > 1076 && y <= 388) return 'storage';
      if (x >= 520 && x <= 1076 && y <= 478) {
        return y < 295 ? 'behind_counter' : 'shop_floor';
      }
      return 'outside';
    }

    _clampWalkTarget(rawX, rawY) {
      let x = Math.max(35, Math.min(1225, rawX));
      let y = Math.max(240, Math.min(488, rawY));

      // Keep clear of exterior left shop wall (x: 506..528, y < 480)
      if (x >= 506 && x < 532 && y < 480) {
        x = x < 519 ? 495 : 540;
      }

      // Keep clear of dividing wall between Main Shop and Storage Room (x: 1066..1092)
      if (x >= 1064 && x <= 1094 && y <= 394) {
        x = x < 1077 ? 1052 : 1102;
      }

      // Keep clear of Storage Room bottom exterior wall (y: 374..398, x >= 1076)
      if (x >= 1076 && y > 370 && y < 404) {
        y = y < 388 ? 364 : 412;
      }

      // Storage room bounds
      if (x > 1076 && y <= 388) {
        x = Math.max(1100, Math.min(1220, x));
        y = Math.max(242, Math.min(365, y));
      }

      // Main shop interior bounds
      if (x >= 520 && x <= 1076 && y <= 478) {
        y = Math.max(242, y);
        // Service counter rectangle (x: 590..1026, y: 262..314); left x=560 & right x=1044 are open
        if (x >= 584 && x <= 1030 && y >= 260 && y <= 318) {
          y = y < 288 ? 246 : 332;
        }
        // Display stands (y: 382..436)
        if (y >= 382 && y <= 436) {
          if ((x >= 635 && x <= 725) || (x >= 790 && x <= 880) || (x >= 945 && x <= 1035)) {
            y = y < 409 ? 374 : 452;
          }
        }
      }

      return { x, y };
    }

    _buildPath(fromX, fromY, toX, toY) {
      const fromZone = this._getZone(fromX, fromY);
      const toZone = this._getZone(toX, toY);
      const pts = [];

      const pushPt = (x, y) => {
        const last = pts.length > 0 ? pts[pts.length - 1] : { x: fromX, y: fromY };
        if (Math.hypot(x - last.x, y - last.y) > 4) {
          pts.push({ x, y });
        }
      };

      const routeOutside = (sx, sy, ex, ey) => {
        if ((sx < 520 && sy < 480 && ex >= 515) || (ex < 520 && ey < 480 && sx >= 515)) {
          pushPt(PATH_WAYPOINTS.CORNER_SW.x, PATH_WAYPOINTS.CORNER_SW.y);
        }
        if ((sx > 1076 && sy < 480 && ex < 1076) || (ex > 1076 && ey < 480 && sx < 1076)) {
          pushPt(1086, 488);
        }
        pushPt(ex, ey);
      };

      const routeShopFloor = (sx, sy, ex, ey) => {
        const crossesRackBand =
          (sy <= 382 && ey >= 434) ||
          (sy >= 434 && ey <= 382) ||
          (Math.min(sy, ey) < 434 && Math.max(sy, ey) > 384 && Math.abs(sx - ex) > 25);
        if (crossesRackBand) {
          const aisles = [603, 758, 912, 1044];
          let bestAisle = aisles[0];
          let bestCost = Infinity;
          aisles.forEach((ax) => {
            const cost = Math.abs(sx - ax) + Math.abs(ex - ax);
            if (cost < bestCost) {
              bestCost = cost;
              bestAisle = ax;
            }
          });
          if (sy > 384 && ey <= 384) {
            pushPt(bestAisle, Math.max(448, sy));
            pushPt(bestAisle, 368);
          } else if (sy <= 384 && ey > 384) {
            pushPt(bestAisle, 368);
            pushPt(bestAisle, Math.max(448, ey));
          } else {
            pushPt(bestAisle, 368);
          }
        }
        pushPt(ex, ey);
      };

      if (fromZone === toZone) {
        if (fromZone === 'outside') routeOutside(fromX, fromY, toX, toY);
        else if (fromZone === 'shop_floor') routeShopFloor(fromX, fromY, toX, toY);
        else pushPt(toX, toY);
        return pts;
      }

      let cx = fromX;
      let cy = fromY;
      let cz = fromZone;

      const moveStep = (nextZone, wpList) => {
        wpList.forEach((wp) => {
          if (cz === 'outside') routeOutside(cx, cy, wp.x, wp.y);
          else if (cz === 'shop_floor') routeShopFloor(cx, cy, wp.x, wp.y);
          else pushPt(wp.x, wp.y);
          cx = wp.x;
          cy = wp.y;
        });
        cz = nextZone;
      };

      const pickCounterGap = (sx, ex) => {
        const leftCost = Math.abs(sx - 560) + Math.abs(ex - 560);
        const rightCost = Math.abs(sx - 1044) + Math.abs(ex - 1044);
        return leftCost <= rightCost
          ? { south: PATH_WAYPOINTS.COUNTER_LEFT_SOUTH, north: PATH_WAYPOINTS.COUNTER_LEFT_NORTH }
          : { south: PATH_WAYPOINTS.COUNTER_GAP_SOUTH, north: PATH_WAYPOINTS.COUNTER_GAP_NORTH };
      };

      if (cz === 'outside') {
        moveStep('shop_floor', [PATH_WAYPOINTS.DOOR_OUT, PATH_WAYPOINTS.DOOR_IN]);
      } else if (cz === 'storage' && toZone === 'outside') {
        moveStep('shop_floor', [
          PATH_WAYPOINTS.STORAGE_DOOR_EAST,
          PATH_WAYPOINTS.STORAGE_DOOR_WEST,
          PATH_WAYPOINTS.COUNTER_GAP_SOUTH
        ]);
      } else if (cz === 'behind_counter' && toZone === 'outside') {
        const gap = pickCounterGap(cx, PATH_WAYPOINTS.DOOR_IN.x);
        moveStep('shop_floor', [gap.north, gap.south]);
      }

      if (cz === 'shop_floor') {
        if (toZone === 'outside') {
          moveStep('outside', [PATH_WAYPOINTS.DOOR_IN, PATH_WAYPOINTS.DOOR_OUT]);
        } else if (toZone === 'behind_counter') {
          const gap = pickCounterGap(cx, toX);
          moveStep('behind_counter', [gap.south, gap.north]);
        } else if (toZone === 'storage') {
          moveStep('storage', [
            PATH_WAYPOINTS.COUNTER_GAP_SOUTH,
            PATH_WAYPOINTS.STORAGE_DOOR_WEST,
            PATH_WAYPOINTS.STORAGE_DOOR_EAST
          ]);
        }
      } else if (cz === 'behind_counter') {
        if (toZone === 'shop_floor') {
          const gap = pickCounterGap(cx, toX);
          moveStep('shop_floor', [gap.north, gap.south]);
        } else if (toZone === 'storage') {
          moveStep('storage', [
            PATH_WAYPOINTS.COUNTER_GAP_NORTH,
            PATH_WAYPOINTS.STORAGE_DOOR_WEST,
            PATH_WAYPOINTS.STORAGE_DOOR_EAST
          ]);
        }
      } else if (cz === 'storage') {
        if (toZone === 'shop_floor') {
          moveStep('shop_floor', [
            PATH_WAYPOINTS.STORAGE_DOOR_EAST,
            PATH_WAYPOINTS.STORAGE_DOOR_WEST,
            PATH_WAYPOINTS.COUNTER_GAP_SOUTH
          ]);
        } else if (toZone === 'behind_counter') {
          moveStep('behind_counter', [
            PATH_WAYPOINTS.STORAGE_DOOR_EAST,
            PATH_WAYPOINTS.STORAGE_DOOR_WEST,
            PATH_WAYPOINTS.COUNTER_GAP_NORTH
          ]);
        }
      }

      if (cz === 'outside') routeOutside(cx, cy, toX, toY);
      else if (cz === 'shop_floor') routeShopFloor(cx, cy, toX, toY);
      else pushPt(toX, toY);

      return pts;
    }

    _setCustomerTarget(cust, tx, ty) {
      cust.targetX = tx;
      cust.targetY = ty;
      cust.waypoints = this._buildPath(cust.x, cust.y, tx, ty);
      cust.moving = cust.waypoints.length > 0 || Math.hypot(tx - cust.x, ty - cust.y) > 4;
    }

    _describeOrders(orders) {
      return orders
        .filter((o) => !o.done)
        .map((o) => {
          const item = this.data.ITEMS[o.itemId];
          return item ? `${item.icon} ${item.name}` : o.itemId;
        })
        .join(', ');
    }

    _onCanvasMouseMove(e) {
      if (!this.levelState) return;
      const pt = this._getCanvasPoint(e);
      this.levelState.mouseX = pt.x;
      this.levelState.mouseY = pt.y;
      this.levelState.hoveredTarget = this._hitTest(pt.x, pt.y);
      this.canvas.style.cursor = this.levelState.hoveredTarget ? 'pointer' : 'default';
    }

    _onCanvasClick(e) {
      if (!this.levelState || this.paused || this.levelState.ended) return;
      this.audio.init();
      const pt = this._getCanvasPoint(e);
      const hit = this._hitTest(pt.x, pt.y);
      const player = this.levelState.player;

      if (!hit) {
        const clamped = this._clampWalkTarget(pt.x, pt.y);
        player.taskQueue.push({ type: 'walk', x: clamped.x, y: clamped.y });
        this.audio.playClick();
        return;
      }

      this.audio.playClick();

      if (hit.kind === 'station') {
        this._queueStationClick(player, hit.obj);
      } else if (hit.kind === 'rack') {
        this._queueRackClick(player, hit.obj);
      } else if (hit.kind === 'car') {
        this._queueCarClick(player, hit.obj);
      } else if (hit.kind === 'customer') {
        this._queueCustomerClick(player, hit.obj);
      } else if (hit.kind === 'spill') {
        player.taskQueue.push({
          type: 'cleanSpill',
          spillId: hit.obj.id,
          x: hit.obj.x,
          y: hit.obj.y - 8
        });
      }
    }

    _getPlannedInventory(player) {
      const inv = [...player.held];
      const checkTask = (task) => {
        if (!task) return;
        if (task.type === 'prep' && task.itemId) inv.push(task.itemId);
        if ((task.type === 'serveCar' || task.type === 'serveCustomer') && task.itemId) {
          const idx = inv.indexOf(task.itemId);
          if (idx !== -1) inv.splice(idx, 1);
        }
        if (task.type === 'restockRack') {
          const idx = inv.indexOf('crate');
          if (idx !== -1) inv.splice(idx, 1);
        }
        if (task.type === 'trash' && inv.length > 0) inv.shift();
      };
      checkTask(player.currentTask);
      player.taskQueue.forEach(checkTask);
      return inv;
    }

    _queueRackClick(player, rack) {
      if (rack.stock >= rack.maxStock) {
        this._spawnParticle(rack.x, rack.y - 45, 'Stojan je plný!', '#6ba368');
        player.taskQueue.push({ type: 'walk', x: rack.walkX, y: rack.walkY });
        return;
      }
      const plannedInv = this._getPlannedInventory(player);
      if (plannedInv.includes('crate')) {
        player.taskQueue.push({
          type: 'restockRack',
          rackId: rack.id,
          x: rack.walkX,
          y: rack.walkY
        });
      } else if (!this.settings.smartAssist) {
        this._spawnParticle(player.x, player.y - 45, 'Vezmi krabici ze skladu 📦', '#d95d4a');
      } else if (plannedInv.length < player.maxCarry) {
        const storage = this.data.STATIONS.storage;
        player.taskQueue.push({
          type: 'prep',
          stationId: storage.id,
          itemId: 'crate',
          x: storage.walkX,
          y: storage.walkY
        });
        player.taskQueue.push({
          type: 'restockRack',
          rackId: rack.id,
          x: rack.walkX,
          y: rack.walkY
        });
      } else {
        this._spawnParticle(player.x, player.y - 45, 'Plný tác!', '#d95d4a');
      }
    }

    _queueStationClick(player, st) {
      if (st.type === 'prep') {
        player.taskQueue.push({
          type: 'prep',
          stationId: st.id,
          itemId: st.itemId,
          x: st.walkX,
          y: st.walkY
        });
      } else if (st.type === 'pump') {
        const carAtPump = this.levelState.cars.find(
          (c) => c.pumpIndex === st.pumpIndex && c.state === 'waiting'
        );
        if (carAtPump && carAtPump.orders.some((o) => o.itemId === 'fuel' && !o.done)) {
          player.taskQueue.push({
            type: 'fuelCar',
            carId: carAtPump.id,
            pumpIndex: st.pumpIndex,
            x: st.walkX,
            y: st.walkY
          });
        } else if (carAtPump) {
          this._queueCarClick(player, carAtPump);
        } else {
          player.taskQueue.push({ type: 'walk', x: st.walkX, y: st.walkY });
        }
      } else if (st.type === 'register') {
        player.taskQueue.push({
          type: 'register',
          x: st.walkX,
          y: st.walkY
        });
      } else if (st.type === 'trash') {
        player.taskQueue.push({
          type: 'trash',
          x: st.walkX,
          y: st.walkY
        });
      } else if (st.type === 'broom') {
        if (this.levelState.spills.length > 0) {
          const sp = this.levelState.spills[0];
          player.taskQueue.push({
            type: 'cleanSpill',
            spillId: sp.id,
            x: sp.x,
            y: sp.y - 8
          });
        } else {
          player.taskQueue.push({ type: 'walk', x: st.walkX, y: st.walkY });
        }
      }
    }

    _queueCarClick(player, car) {
      const pump = this.data.STATIONS[`pump_${car.pumpIndex}`];
      const undone = car.orders.filter((o) => !o.done);
      if (undone.length === 0) return;

      const fuelOrder = undone.find((o) => o.itemId === 'fuel');
      const plannedInv = this._getPlannedInventory(player);

      const matchingHeldOrder = undone.find((o) => o.itemId !== 'fuel' && plannedInv.includes(o.itemId));
      if (matchingHeldOrder) {
        player.taskQueue.push({
          type: 'serveCar',
          carId: car.id,
          itemId: matchingHeldOrder.itemId,
          x: pump.walkX,
          y: pump.walkY + 34
        });
        return;
      }

      if (fuelOrder) {
        player.taskQueue.push({
          type: 'fuelCar',
          carId: car.id,
          pumpIndex: car.pumpIndex,
          x: pump.walkX,
          y: pump.walkY
        });
        return;
      }

      const nextOrder = undone[0];
      const itemDef = this.data.ITEMS[nextOrder.itemId];
      const station = this.data.STATIONS[itemDef.stationId];
      if (!this.settings.smartAssist) {
        this._spawnParticle(player.x, player.y - 45, `Vezmi ${itemDef.icon} ${itemDef.name}`, '#d95d4a');
        return;
      }
      if (station && plannedInv.length < player.maxCarry) {
        player.taskQueue.push({
          type: 'prep',
          stationId: station.id,
          itemId: nextOrder.itemId,
          x: station.walkX,
          y: station.walkY
        });
        player.taskQueue.push({
          type: 'serveCar',
          carId: car.id,
          itemId: nextOrder.itemId,
          x: pump.walkX,
          y: pump.walkY + 34
        });
      } else {
        this._spawnParticle(player.x, player.y - 45, 'Plný tác!', '#d95d4a');
      }
    }

    _queueCustomerClick(player, cust) {
      if (cust.state === 'leaving' || cust.state === 'returning_to_car') {
        return;
      }
      if (cust.state === 'paying') {
        const reg = this.data.STATIONS.register;
        player.taskQueue.push({
          type: 'register',
          x: reg.walkX,
          y: reg.walkY
        });
        return;
      }

      if (cust.spotIndex < 0 || !cust.orders || cust.orders.length === 0) {
        return;
      }

      const spot = this.data.SHOP_SPOTS[cust.spotIndex];
      const undone = cust.orders.filter((o) => !o.done && !this.data.ITEMS[o.itemId].isRackItem);
      if (undone.length === 0) return;

      const plannedInv = this._getPlannedInventory(player);
      const matching = undone.find((o) => plannedInv.includes(o.itemId));
      if (matching) {
        player.taskQueue.push({
          type: 'serveCustomer',
          custId: cust.id,
          itemId: matching.itemId,
          x: spot.serveX,
          y: spot.serveY
        });
        return;
      }

      const nextOrder = undone[0];
      const itemDef = this.data.ITEMS[nextOrder.itemId];
      const station = this.data.STATIONS[itemDef.stationId];
      if (!this.settings.smartAssist) {
        this._spawnParticle(player.x, player.y - 45, `Vezmi ${itemDef.icon} ${itemDef.name}`, '#d95d4a');
        return;
      }
      if (station && plannedInv.length < player.maxCarry) {
        player.taskQueue.push({
          type: 'prep',
          stationId: station.id,
          itemId: nextOrder.itemId,
          x: station.walkX,
          y: station.walkY
        });
        player.taskQueue.push({
          type: 'serveCustomer',
          custId: cust.id,
          itemId: nextOrder.itemId,
          x: spot.serveX,
          y: spot.serveY
        });
      } else {
        this._spawnParticle(player.x, player.y - 45, 'Plný tác!', '#d95d4a');
      }
    }

    _getStaffSpeedMultiplier(worker) {
      if (!worker || worker.isPlayer) return 1.0;
      if (worker.level <= 1) return 0.48;
      if (worker.level === 2) return 0.82;
      return 1.25;
    }

    _getPrepDuration(itemId, worker) {
      const base = this.data.ITEMS[itemId].prepTime;
      let upgLevel = 1;
      if (itemId === 'fuel') upgLevel = this.save.upgrades.pumps || 1;
      else if (itemId === 'coffee') upgLevel = this.save.upgrades.coffee || 1;
      else if (itemId === 'snack') upgLevel = this.save.upgrades.grill || 1;
      else if (itemId === 'wash' || itemId === 'drink') upgLevel = this.save.upgrades.wash || 1;
      else if (itemId === 'crate') upgLevel = this.save.upgrades.racks || 1;

      const upgFactor = 1 + (upgLevel - 1) * 0.3;
      const staffFactor = this._getStaffSpeedMultiplier(worker);
      return Math.max(0.45, base / (upgFactor * staffFactor));
    }

    _getItemPrice(itemId) {
      const item = this.data.ITEMS[itemId];
      let bonus = 0;
      if (itemId === 'coffee') bonus = ((this.save.upgrades.coffee || 1) - 1) * 5;
      else if (itemId === 'snack') bonus = ((this.save.upgrades.grill || 1) - 1) * 6;
      else if (itemId === 'wash') bonus = ((this.save.upgrades.wash || 1) - 1) * 6;
      else if (itemId === 'drink') bonus = ((this.save.upgrades.wash || 1) - 1) * 5;
      else if (itemId === 'fuel') bonus = ((this.save.upgrades.pumps || 1) - 1) * 4;
      else if (item.isRackItem) bonus = ((this.save.upgrades.racks || 1) - 1) * 5;
      return item.basePrice + bonus;
    }

    _updateLevel(dt) {
      const state = this.levelState;
      state.time += dt;

      if (state.spawnedCount < state.level.customers) {
        state.spawnTimer -= dt;
        if (state.spawnTimer <= 0) {
          const spawned = this._trySpawnVisitor();
          if (spawned) {
            state.spawnedCount += 1;
            state.spawnTimer = state.level.spawnInterval * (0.85 + Math.random() * 0.3);
          } else {
            state.spawnTimer = 1.0;
          }
        }
      }

      state.aiTimer -= dt;
      if (state.aiTimer <= 0) {
        state.aiTimer = 0.35;
        this._runStaffAI();
      }

      state.workers.forEach((w) => {
        if (w.active) this._updateWorker(w, dt);
      });

      this._updateCars(dt);
      this._updateCustomers(dt);

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.life -= dt;
        p.x += (p.vx || 0) * dt;
        p.y += (p.vy || -24) * dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      this._updateGameHUD();

      if (
        state.spawnedCount >= state.level.customers &&
        state.cars.length === 0 &&
        state.customers.length === 0 &&
        !state.ended
      ) {
        state.ended = true;
        this._endLevel();
      }
    }

    _trySpawnVisitor() {
      const state = this.levelState;
      const lvl = state.level;
      const pumpsLvl = this.save.upgrades.pumps || 1;
      const maxPumps = pumpsLvl >= 2 ? 3 : 2;

      const freePumps = [];
      for (let i = 0; i < maxPumps; i++) {
        if (!state.cars.some((c) => c.pumpIndex === i)) freePumps.push(i);
      }

      const freeSpots = [];
      for (let i = 0; i < this.data.SHOP_SPOTS.length; i++) {
        if (
          !state.customers.some(
            (c) => c.spotIndex === i && c.state !== 'leaving' && c.state !== 'returning_to_car'
          )
        ) {
          freeSpots.push(i);
        }
      }

      if (freePumps.length === 0 && freeSpots.length === 0) return false;

      let spawnCar = Math.random() < lvl.carChance;
      if (spawnCar && freePumps.length === 0) spawnCar = false;
      if (!spawnCar && freeSpots.length === 0) spawnCar = true;

      const decorBonus = 1 + ((this.save.upgrades.decor || 1) - 1) * 0.25;
      const maxPatience = lvl.patienceBase * decorBonus;

      if (spawnCar) {
        const pumpIndex = freePumps[Math.floor(Math.random() * freePumps.length)];
        const pump = this.data.STATIONS[`pump_${pumpIndex}`];
        const palette = CAR_PALETTES[Math.floor(Math.random() * CAR_PALETTES.length)];

        const carAllowed = lvl.orders.filter((o) => o === 'fuel' || o === 'wash');
        const orders = [{ itemId: 'fuel', done: false }];
        if (carAllowed.length > 1 && Math.random() < lvl.multiChance) {
          orders.push({ itemId: 'wash', done: false });
        }

        state.cars.push({
          id: state.nextEntityId++,
          pumpIndex,
          x: -90,
          y: 532,
          targetX: pump.carX,
          targetY: pump.carY,
          state: 'arriving',
          orders,
          patience: maxPatience,
          maxPatience,
          color: palette.color,
          roofColor: palette.roofColor,
          variant: palette.variant
        });
      } else {
        const spotIndex = freeSpots[Math.floor(Math.random() * freeSpots.length)];
        const bistroAllowed = lvl.orders.filter(
          (o) => this.data.ITEMS[o] && !this.data.ITEMS[o].isRackItem && o !== 'fuel' && o !== 'wash'
        );
        const pool = bistroAllowed.length > 0 ? bistroAllowed : ['coffee'];

        const first = pool[Math.floor(Math.random() * pool.length)];
        const orders = [{ itemId: first, done: false }];
        if (pool.length > 1 && Math.random() < lvl.multiChance) {
          const secondOptions = pool.filter((o) => o !== first);
          const second =
            secondOptions.length > 0
              ? secondOptions[Math.floor(Math.random() * secondOptions.length)]
              : pool[0];
          orders.push({ itemId: second, done: false });
        }

        const rackAllowed = lvl.orders.filter(
          (o) => this.data.ITEMS[o] && this.data.ITEMS[o].isRackItem
        );
        const wantRackItem =
          rackAllowed.length > 0 && Math.random() < 0.75
            ? rackAllowed[Math.floor(Math.random() * rackAllowed.length)]
            : null;

        const cust = {
          id: state.nextEntityId++,
          isDriver: false,
          carId: null,
          carOrders: [],
          spotIndex,
          x: 603,
          y: 540,
          targetX: 603,
          targetY: 458,
          waypoints: [],
          state: 'arriving',
          moving: true,
          orders,
          wantRackItem,
          basket: [],
          targetRackId: null,
          grabTimer: 0,
          rackWaitTimer: 0,
          announcedEmptyRack: false,
          patience: maxPatience,
          maxPatience,
          shirtColor: SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)],
          hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
          skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)]
        };

        this._assignNextCustomerTarget(cust);
        state.customers.push(cust);
      }

      if (state.spills.length < 2 && Math.random() < lvl.spillChance) {
        const inShop = Math.random() < 0.55;
        state.spills.push({
          id: state.nextEntityId++,
          type: inShop ? 'coffee' : 'oil',
          x: inShop ? 570 + Math.random() * 440 : 80 + Math.random() * 380,
          y: inShop ? 345 + Math.random() * 25 : 325 + Math.random() * 35
        });
      }

      return true;
    }

    _assignNextCustomerTarget(cust) {
      if (cust.wantRackItem) {
        const itemDef = this.data.ITEMS[cust.wantRackItem];
        const rack = this.levelState
          ? this.levelState.racks.find((r) => r.id === itemDef.rackId)
          : this.data.RACKS[itemDef.rackId];
        cust.state = 'shopping';
        cust.targetRackId = rack.id;
        cust.grabTimer = 0.5;
        cust.rackWaitTimer = 6.0;
        cust.announcedEmptyRack = false;
        const offset = cust.spotIndex >= 0 ? (cust.spotIndex - 1.5) * 12 : ((cust.id % 3) - 1) * 14;
        this._setCustomerTarget(cust, rack.custX + offset, rack.custY);
        return;
      }

      const nextCounterOrder = cust.orders.find((o) => !o.done);

      if (nextCounterOrder && cust.spotIndex >= 0) {
        const spot = this.data.SHOP_SPOTS[cust.spotIndex];
        cust.targetRackId = null;
        if (Math.hypot(spot.x - cust.x, spot.y - cust.y) <= 4) {
          cust.state = 'waiting';
          cust.waypoints = [];
          cust.moving = false;
        } else {
          cust.state = 'arriving';
          this._setCustomerTarget(cust, spot.x, spot.y);
        }
        return;
      }

      // All orders completed! Go pay at register
      this._checkCustomerDone(cust);
    }

    _updateWorker(w, dt) {
      if (w.actionTimer > 0) {
        w.actionTimer -= dt;
        w.moving = false;
        if (w.actionTimer <= 0) {
          w.actionTimer = 0;
          w.actionDuration = 0;
          const finishedTask = w.currentTask;
          this._completeWorkerTask(w, finishedTask);
          const hasMorePaying =
            finishedTask &&
            finishedTask.type === 'register' &&
            w.taskQueue.length === 0 &&
            this.levelState.customers.some((c) => c.state === 'paying');
          if (!hasMorePaying) {
            w.currentTask = null;
          }
        }
        return;
      }

      if (!w.currentTask && w.taskQueue.length > 0) {
        w.currentTask = w.taskQueue.shift();
        w.waypoints = this._buildPath(w.x, w.y, w.currentTask.x, w.currentTask.y);
      }

      if (!w.currentTask) {
        w.moving = false;
        return;
      }

      const task = w.currentTask;
      if (!w.isPlayer) {
        if (task.type === 'serveCustomer') {
          const cust = this.levelState.customers.find((c) => c.id === task.custId);
          const stillNeeds =
            cust &&
            cust.state !== 'leaving' &&
            cust.state !== 'paying' &&
            cust.state !== 'returning_to_car' &&
            cust.state !== 'waiting_driver' &&
            cust.orders.some((o) => o.itemId === task.itemId && !o.done);
          if (!stillNeeds || !w.held.includes(task.itemId)) {
            w.currentTask = null;
            w.waypoints = [];
            w.moving = false;
            return;
          }
        } else if (task.type === 'serveCar') {
          const car = this.levelState.cars.find((c) => c.id === task.carId && c.state === 'waiting');
          const stillNeeds = car && car.orders.some((o) => o.itemId === task.itemId && !o.done);
          if (!stillNeeds || !w.held.includes(task.itemId)) {
            w.currentTask = null;
            w.waypoints = [];
            w.moving = false;
            return;
          }
        }
      }
      if (w.waypoints && w.waypoints.length > 0) {
        const wp = w.waypoints[0];
        const wdx = wp.x - w.x;
        const wdy = wp.y - w.y;
        const wdist = Math.hypot(wdx, wdy);
        if (wdist > 6) {
          w.moving = true;
          const step = Math.min(wdist, w.speed * dt);
          w.x += (wdx / wdist) * step;
          w.y += (wdy / wdist) * step;
          return;
        }
        w.x = wp.x;
        w.y = wp.y;
        w.waypoints.shift();
        if (w.waypoints.length > 0) {
          w.moving = true;
          return;
        }
      }

      const dx = task.x - w.x;
      const dy = task.y - w.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 6) {
        w.moving = true;
        const step = Math.min(dist, w.speed * dt);
        w.x += (dx / dist) * step;
        w.y += (dy / dist) * step;
        return;
      }

      w.x = task.x;
      w.y = task.y;
      w.moving = false;

      if (task.type === 'walk') {
        w.currentTask = null;
      } else if (task.type === 'prep') {
        if (w.held.length >= w.maxCarry) {
          if (w.isPlayer) this._spawnParticle(w.x, w.y - 44, 'Plný tác!', '#d95d4a');
          w.currentTask = null;
          return;
        }
        w.actionDuration = this._getPrepDuration(task.itemId, w);
        w.actionTimer = w.actionDuration;
      } else if (task.type === 'restockRack') {
        const rack = this.levelState.racks.find((r) => r.id === task.rackId);
        if (!rack || !w.held.includes('crate') || (!w.isPlayer && rack.stock >= rack.maxStock / 2)) {
          w.currentTask = null;
          return;
        }
        w.actionDuration = w.isPlayer ? 0.85 : Math.max(0.45, 0.85 / this._getStaffSpeedMultiplier(w));
        w.actionTimer = w.actionDuration;
      } else if (task.type === 'fuelCar') {
        const car = this.levelState.cars.find((c) => c.id === task.carId && c.state === 'waiting');
        if (!car || !car.orders.some((o) => o.itemId === 'fuel' && !o.done)) {
          w.currentTask = null;
          return;
        }
        w.actionDuration = this._getPrepDuration('fuel', w);
        w.actionTimer = w.actionDuration;
      } else if (task.type === 'serveCar') {
        const car = this.levelState.cars.find((c) => c.id === task.carId && c.state === 'waiting');
        const heldIdx = w.held.indexOf(task.itemId);
        if (!car || heldIdx === -1) {
          w.currentTask = null;
          return;
        }
        const order = car.orders.find((o) => o.itemId === task.itemId && !o.done);
        if (order) {
          order.done = true;
          w.held.splice(heldIdx, 1);
          if (task.itemId === 'wash') this.audio.playWash();
          else this.audio.playClick();
          this._spawnParticle(car.x, car.y - 50, `${this.data.ITEMS[task.itemId].icon} ✓`, '#4f9d69');
          this._checkCarDone(car);
        }
        w.currentTask = null;
      } else if (task.type === 'serveCustomer') {
        const cust = this.levelState.customers.find((c) => c.id === task.custId);
        const heldIdx = w.held.indexOf(task.itemId);
        if (!cust || heldIdx === -1 || cust.state === 'leaving' || cust.state === 'paying') {
          w.currentTask = null;
          return;
        }
        if (cust.state !== 'waiting') {
          // Customer is still browsing a shelf or walking up to the counter; wait gently at their counter spot
          return;
        }
        const order = cust.orders.find((o) => o.itemId === task.itemId && !o.done);
        if (order) {
          order.done = true;
          w.held.splice(heldIdx, 1);
          this.audio.playClick();
          this._spawnParticle(cust.x, cust.y - 45, `${this.data.ITEMS[task.itemId].icon} ✓`, '#4f9d69');
          this._assignNextCustomerTarget(cust);
        }
        w.currentTask = null;
      } else if (task.type === 'register') {
        const paying = this.levelState.customers.filter((c) => c.state === 'paying');
        if (paying.length === 0) {
          w.currentTask = null;
          return;
        }
        const arrivedPaying = paying.filter((c) => !c.waypoints || c.waypoints.length === 0);
        if (arrivedPaying.length === 0) {
          return;
        }
        w.actionDuration = w.isPlayer ? 0.65 : Math.max(0.35, 0.65 / this._getStaffSpeedMultiplier(w));
        w.actionTimer = w.actionDuration;
      } else if (task.type === 'cleanSpill') {
        const sp = this.levelState.spills.find((s) => s.id === task.spillId);
        if (!sp) {
          w.currentTask = null;
          return;
        }
        w.actionDuration = w.isPlayer ? 1.1 : Math.max(0.55, 1.1 / this._getStaffSpeedMultiplier(w));
        w.actionTimer = w.actionDuration;
      } else if (task.type === 'trash') {
        if (w.held.length > 0) {
          if (!w.isPlayer) {
            const icons = w.held.map((id) => (this.data.ITEMS[id] ? this.data.ITEMS[id].icon : '')).join('');
            w.held = [];
            this._spawnParticle(w.x, w.y - 35, `🗑️ ${icons}`.trim(), '#7d6b5d');
          } else {
            const removed = w.held.shift();
            const icon = this.data.ITEMS[removed] ? this.data.ITEMS[removed].icon : '';
            this._spawnParticle(w.x, w.y - 35, `🗑️ ${icon}`, '#7d6b5d');
          }
          this.audio.playClick();
        }
        w.currentTask = null;
      }
    }

    _completeWorkerTask(w, task) {
      if (!task) return;
      if (task.type === 'prep') {
        if (w.held.length < w.maxCarry) {
          w.held.push(task.itemId);
          if (task.itemId === 'coffee') this.audio.playCoffee();
          else if (task.itemId === 'snack') this.audio.playGrill();
          else if (task.itemId === 'wash') this.audio.playWash();
          else this.audio.playClick();
          this._spawnParticle(w.x, w.y - 38, `${this.data.ITEMS[task.itemId].icon}`, '#4e3629');
        }
      } else if (task.type === 'restockRack') {
        const rack = this.levelState.racks.find((r) => r.id === task.rackId);
        const crateIdx = w.held.indexOf('crate');
        if (rack && crateIdx !== -1) {
          w.held.splice(crateIdx, 1);
          rack.stock = rack.maxStock;
          this.audio.playUpgrade();
          this._spawnParticle(rack.x, rack.y - 42, `Doplněno! ${rack.icon} ${rack.stock}/${rack.maxStock}`, '#4f9d69');
        }
      } else if (task.type === 'fuelCar') {
        const car = this.levelState.cars.find((c) => c.id === task.carId && c.state === 'waiting');
        if (car) {
          const order = car.orders.find((o) => o.itemId === 'fuel' && !o.done);
          if (order) {
            order.done = true;
            this.audio.playFuel();
            this._spawnParticle(car.x, car.y - 50, '⛽ ✓', '#4f9d69');
            this._checkCarDone(car);
          }
        }
      } else if (task.type === 'register') {
        const paying = this.levelState.customers.filter(
          (c) => c.state === 'paying' && (!c.waypoints || c.waypoints.length === 0)
        );
        if (paying.length > 0) {
          const cust = paying[0];
          const carOrders = cust.carOrders || [];
          const basketOrders = (cust.basket || []).map((id) => ({ itemId: id }));
          const allPurchases = [...carOrders, ...cust.orders, ...basketOrders];
          const amount = this._calcPayment(allPurchases, cust.patience / cust.maxPatience);

          if (cust.isDriver) {
            const car = this.levelState.cars.find((c) => c.id === cust.carId);
            cust.state = 'returning_to_car';
            cust.paid = true;
            this._setCustomerTarget(cust, car ? car.x + 24 : -40, car ? car.y + 18 : 532);
          } else {
            cust.state = 'leaving';
            this._setCustomerTarget(cust, 603, 550);
            this.levelState.servedCount += 1;
          }

          this.levelState.earnedCoins += amount;
          this.audio.playCash();
          const reg = this.data.STATIONS.register;
          this._spawnParticle(reg.x, reg.y - 36, `+${amount} Kč 💰`, '#3b874b', 17);

          const remainingPaying = this.levelState.customers.filter((c) => c.state === 'paying');
          remainingPaying.forEach((remCust, idx) => {
            const tx = reg.customerX + Math.min(idx, 2) * 28;
            const ty = reg.customerY;
            if (Math.hypot(remCust.targetX - tx, remCust.targetY - ty) > 4) {
              this._setCustomerTarget(remCust, tx, ty);
            }
          });
        }
      } else if (task.type === 'cleanSpill') {
        const idx = this.levelState.spills.findIndex((s) => s.id === task.spillId);
        if (idx !== -1) {
          const sp = this.levelState.spills[idx];
          this.levelState.spills.splice(idx, 1);
          this.levelState.earnedCoins += 12;
          this.audio.playWash();
          this._spawnParticle(sp.x, sp.y - 20, '+12 Kč ✨', '#4f9d69');
        }
      }
    }

    _calcPayment(orders, patienceRatio) {
      let base = 0;
      orders.forEach((o) => {
        base += this._getItemPrice(o.itemId);
      });
      const decorLvl = this.save.upgrades.decor || 1;
      const tipBonus = 1 + (decorLvl - 1) * 0.2;
      const tip = Math.round(base * 0.28 * Math.max(0, patienceRatio) * tipBonus);
      return base + tip;
    }

    _checkCarDone(car) {
      if (car.orders.every((o) => o.done) && car.state === 'waiting') {
        const state = this.levelState;
        const lvl = state.level;
        car.state = 'waiting_driver';
        this.audio.playHappy();
        this._spawnParticle(car.x, car.y - 45, 'Jde zaplatit dovnitř 🚶', '#4e3629');

        const rackAllowed = lvl.orders.filter(
          (o) => this.data.ITEMS[o] && this.data.ITEMS[o].isRackItem
        );
        const wantRackItem =
          rackAllowed.length > 0 && Math.random() < 0.6
            ? rackAllowed[Math.floor(Math.random() * rackAllowed.length)]
            : null;

        const freeSpots = [];
        for (let i = 0; i < this.data.SHOP_SPOTS.length; i++) {
          if (
            !state.customers.some(
              (c) => c.spotIndex === i && c.state !== 'leaving' && c.state !== 'returning_to_car'
            )
          ) {
            freeSpots.push(i);
          }
        }

        let spotIndex = -1;
        let orders = [];
        const bistroAllowed = lvl.orders.filter(
          (o) => this.data.ITEMS[o] && !this.data.ITEMS[o].isRackItem && o !== 'fuel' && o !== 'wash'
        );
        if (freeSpots.length > 0 && bistroAllowed.length > 0 && Math.random() < 0.55) {
          spotIndex = freeSpots[Math.floor(Math.random() * freeSpots.length)];
          const pick = bistroAllowed[Math.floor(Math.random() * bistroAllowed.length)];
          orders = [{ itemId: pick, done: false }];
        }

        const decorBonus = 1 + ((this.save.upgrades.decor || 1) - 1) * 0.25;
        const driverPatience = Math.max(car.patience + 18, lvl.patienceBase * decorBonus);

        const driver = {
          id: state.nextEntityId++,
          isDriver: true,
          carId: car.id,
          carOrders: car.orders.map((o) => ({ itemId: o.itemId })),
          paid: false,
          spotIndex,
          x: car.x + 28,
          y: car.y + 18,
          targetX: car.x + 28,
          targetY: car.y + 18,
          waypoints: [],
          state: 'arriving',
          moving: true,
          orders,
          wantRackItem,
          basket: [],
          targetRackId: null,
          grabTimer: 0,
          rackWaitTimer: 0,
          announcedEmptyRack: false,
          patience: driverPatience,
          maxPatience: driverPatience,
          shirtColor: SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)],
          hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
          skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)]
        };

        this._assignNextCustomerTarget(driver);
        state.customers.push(driver);
      }
    }

    _checkCustomerDone(cust) {
      if (!cust.wantRackItem && cust.orders.every((o) => o.done)) {
        cust.state = 'paying';
        const reg = this.data.STATIONS.register;
        const payQueueIdx = this.levelState.customers.filter((c) => c.state === 'paying').length - 1;
        const tx = reg.customerX + Math.min(Math.max(payQueueIdx, 0), 2) * 28;
        const ty = reg.customerY;
        this._setCustomerTarget(cust, tx, ty);
        cust.patience = Math.min(cust.maxPatience, cust.patience + 10);
        this.audio.playHappy();
      }
    }

    _updateCars(dt) {
      const cars = this.levelState.cars;
      for (let i = cars.length - 1; i >= 0; i--) {
        const car = cars[i];
        if (car.state === 'arriving') {
          if (car.x < car.targetX - 36) {
            car.x = Math.min(car.targetX - 36, car.x + 250 * dt);
          } else {
            const dx = car.targetX - car.x;
            const dy = car.targetY - car.y;
            const dist = Math.hypot(dx, dy);
            if (dist <= 4) {
              car.x = car.targetX;
              car.y = car.targetY;
              car.state = 'waiting';
            } else {
              const step = Math.min(dist, 200 * dt);
              car.x += (dx / dist) * step;
              car.y += (dy / dist) * step;
            }
          }
        } else if (car.state === 'waiting') {
          car.patience -= dt;
          if (car.patience <= 0) {
            car.state = 'leaving';
            car.targetX = 1360;
            this.levelState.angryCount += 1;
            this.audio.playSad();
            this._spawnParticle(car.x, car.y - 45, 'Odjíždí bez obsluhy 😔', '#d95d4a');
          }
        } else if (car.state === 'leaving') {
          if (car.y < 532) {
            car.y = Math.min(532, car.y + 195 * dt);
            car.x += 120 * dt;
          } else {
            car.x += 275 * dt;
          }
          if (car.x > 1340) {
            cars.splice(i, 1);
          }
        }
      }
    }

    _updateCustomers(dt) {
      const custs = this.levelState.customers;
      for (let i = custs.length - 1; i >= 0; i--) {
        const cust = custs[i];
        let moved = false;

        if (cust.waypoints && cust.waypoints.length > 0) {
          const wp = cust.waypoints[0];
          const wdx = wp.x - cust.x;
          const wdy = wp.y - cust.y;
          const wdist = Math.hypot(wdx, wdy);
          if (wdist > 4) {
            cust.moving = true;
            const step = Math.min(wdist, 135 * dt);
            cust.x += (wdx / wdist) * step;
            cust.y += (wdy / wdist) * step;
            moved = true;
          } else {
            cust.x = wp.x;
            cust.y = wp.y;
            cust.waypoints.shift();
            if (cust.waypoints.length > 0) {
              cust.moving = true;
              moved = true;
            }
          }
        }

        if (!moved) {
          const dx = cust.targetX - cust.x;
          const dy = cust.targetY - cust.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 4) {
            cust.moving = true;
            const step = Math.min(dist, 135 * dt);
            cust.x += (dx / dist) * step;
            cust.y += (dy / dist) * step;
          } else {
            cust.x = cust.targetX;
            cust.y = cust.targetY;
            cust.moving = false;
            if (cust.state === 'arriving') {
              cust.state = 'waiting';
            } else if (cust.state === 'shopping') {
              const rack = this.levelState.racks.find((r) => r.id === cust.targetRackId);
              if (rack && rack.stock > 0 && cust.wantRackItem) {
                cust.grabTimer -= dt;
                if (cust.grabTimer <= 0) {
                  rack.stock -= 1;
                  cust.basket.push(cust.wantRackItem);
                  const itemDef = this.data.ITEMS[cust.wantRackItem];
                  this._spawnParticle(cust.x, cust.y - 42, `🛒 Vzal si ${itemDef.icon}`, '#4f9d69');
                  this.audio.playClick();
                  cust.wantRackItem = null;
                  this._assignNextCustomerTarget(cust);
                }
              } else if (rack && rack.stock === 0 && cust.wantRackItem) {
                if (!cust.announcedEmptyRack) {
                  cust.announcedEmptyRack = true;
                  this._spawnParticle(cust.x, cust.y - 44, `Chybí zboží v regálu!`, '#d95d4a');
                }
                cust.rackWaitTimer -= dt;
                if (cust.rackWaitTimer <= 0) {
                  this._spawnParticle(cust.x, cust.y - 44, 'Vyprodáno 🤷', '#8c6b4f');
                  cust.wantRackItem = null;
                  this._assignNextCustomerTarget(cust);
                }
              }
            } else if (cust.state === 'returning_to_car') {
              const car = this.levelState.cars.find((c) => c.id === cust.carId);
              custs.splice(i, 1);
              if (car) {
                car.state = 'leaving';
                car.targetX = 1360;
                if (cust.paid) {
                  this.levelState.servedCount += 1;
                  this._spawnParticle(car.x, car.y - 45, 'Odjíždí spokojeně ♥', '#3b874b');
                } else {
                  this.levelState.angryCount += 1;
                  this._spawnParticle(car.x, car.y - 45, 'Odjíždí bez zaplacení 😔', '#d95d4a');
                }
              } else {
                if (cust.paid) this.levelState.servedCount += 1;
                else this.levelState.angryCount += 1;
              }
              continue;
            } else if (cust.state === 'leaving') {
              custs.splice(i, 1);
              continue;
            }
          }
        }

        if (cust.state === 'waiting' || cust.state === 'shopping' || cust.state === 'paying') {
          cust.patience -= dt;
          if (cust.patience <= 0) {
            this.audio.playSad();
            if (cust.isDriver) {
              const car = this.levelState.cars.find((c) => c.id === cust.carId);
              cust.state = 'returning_to_car';
              cust.paid = false;
              this._setCustomerTarget(cust, car ? car.x + 24 : -40, car ? car.y + 18 : 532);
              this._spawnParticle(cust.x, cust.y - 45, 'Odchází bez zaplacení 😔', '#d95d4a');
            } else {
              cust.state = 'leaving';
              this._setCustomerTarget(cust, 603, 550);
              this.levelState.angryCount += 1;
              this._spawnParticle(cust.x, cust.y - 45, 'Odešel 😔', '#d95d4a');
            }
          }
        }
      }
    }

    _isTaskClaimed(field, value, excludeWorker) {
      return this.levelState.workers.some((other) => {
        if (other === excludeWorker || !other.active) return false;
        const tasks = [];
        if (other.currentTask) tasks.push(other.currentTask);
        other.taskQueue.forEach((t) => tasks.push(t));
        return tasks.some((t) => t[field] === value);
      });
    }

    _runStaffAI() {
      const state = this.levelState;
      const idleWorkers = state.workers.filter(
        (w) => !w.isPlayer && w.active && !w.currentTask && w.taskQueue.length === 0 && w.actionTimer <= 0
      );
      if (idleWorkers.length === 0) return;

      idleWorkers.forEach((w) => {
        const trash = this.data.STATIONS.trash;

        if (w.role === 'tonik') {
          if (w.held.length > 0) {
            const heldWashCar = state.cars.find(
              (c) =>
                c.state === 'waiting' &&
                !this._isTaskClaimed('carId', c.id, w) &&
                c.orders.some((o) => !o.done && w.held.includes(o.itemId))
            );
            if (heldWashCar) {
              const pump = this.data.STATIONS[`pump_${heldWashCar.pumpIndex}`];
              const heldOrd = heldWashCar.orders.find((o) => !o.done && w.held.includes(o.itemId));
              if (pump && heldOrd) {
                w.taskQueue.push({
                  type: 'serveCar',
                  carId: heldWashCar.id,
                  itemId: heldOrd.itemId,
                  x: pump.walkX,
                  y: pump.walkY + 34
                });
                return;
              }
            }
            w.taskQueue.push({ type: 'trash', x: trash.walkX, y: trash.walkY });
            return;
          }

          const targetCar = state.cars.find(
            (c) =>
              c.state === 'waiting' &&
              !this._isTaskClaimed('carId', c.id, w) &&
              c.orders.some((o) => !o.done && (o.itemId === 'fuel' || o.itemId === 'wash'))
          );
          if (!targetCar) return;
          const pump = this.data.STATIONS[`pump_${targetCar.pumpIndex}`];
          const fuelOrder = targetCar.orders.find((o) => !o.done && o.itemId === 'fuel');
          if (fuelOrder) {
            w.taskQueue.push({
              type: 'fuelCar',
              carId: targetCar.id,
              pumpIndex: targetCar.pumpIndex,
              x: pump.walkX,
              y: pump.walkY
            });
            return;
          }
          const washOrder = targetCar.orders.find((o) => !o.done && o.itemId === 'wash');
          if (washOrder) {
            const bucket = this.data.STATIONS.bucket;
            w.taskQueue.push({
              type: 'prep',
              stationId: bucket.id,
              itemId: 'wash',
              x: bucket.walkX,
              y: bucket.walkY
            });
            w.taskQueue.push({
              type: 'serveCar',
              carId: targetCar.id,
              itemId: 'wash',
              x: pump.walkX,
              y: pump.walkY + 34
            });
          }
        } else if (w.role === 'anicka') {
          if (w.held.length > 0) {
            const heldTarget =
              state.customers.find(
                (c) =>
                  c.state === 'waiting' &&
                  c.spotIndex >= 0 &&
                  !this._isTaskClaimed('custId', c.id, w) &&
                  c.orders.some((o) => !o.done && w.held.includes(o.itemId))
              ) ||
              state.customers.find(
                (c) =>
                  (c.state === 'arriving' || c.state === 'shopping') &&
                  c.spotIndex >= 0 &&
                  !this._isTaskClaimed('custId', c.id, w) &&
                  c.orders.some((o) => !o.done && w.held.includes(o.itemId))
              );
            if (heldTarget) {
              const spot = this.data.SHOP_SPOTS[heldTarget.spotIndex];
              const heldMatch = heldTarget.orders.find((o) => !o.done && w.held.includes(o.itemId));
              if (spot && heldMatch) {
                w.taskQueue.push({
                  type: 'serveCustomer',
                  custId: heldTarget.id,
                  itemId: heldMatch.itemId,
                  x: spot.serveX,
                  y: spot.serveY
                });
                return;
              }
            }
            w.taskQueue.push({ type: 'trash', x: trash.walkX, y: trash.walkY });
            return;
          }

          const shopCust = state.customers.find(
            (c) =>
              c.state === 'waiting' &&
              c.spotIndex >= 0 &&
              !this._isTaskClaimed('custId', c.id, w) &&
              c.orders.some((o) => !o.done && (o.itemId === 'coffee' || o.itemId === 'snack' || o.itemId === 'drink'))
          );
          if (shopCust) {
            const spot = this.data.SHOP_SPOTS[shopCust.spotIndex];
            const nextOrd = shopCust.orders.find(
              (o) => !o.done && (o.itemId === 'coffee' || o.itemId === 'snack' || o.itemId === 'drink')
            );
            if (spot && nextOrd) {
              const st = this.data.STATIONS[this.data.ITEMS[nextOrd.itemId].stationId];
              w.taskQueue.push({
                type: 'prep',
                stationId: st.id,
                itemId: nextOrd.itemId,
                x: st.walkX,
                y: st.walkY
              });
              w.taskQueue.push({
                type: 'serveCustomer',
                custId: shopCust.id,
                itemId: nextOrd.itemId,
                x: spot.serveX,
                y: spot.serveY
              });
              return;
            }
          }
        } else if (w.role === 'kuba') {
          const paying = state.customers.some((c) => c.state === 'paying');
          if (paying) {
            const reg = this.data.STATIONS.register;
            w.taskQueue.push({ type: 'register', x: reg.walkX, y: reg.walkY });
            return;
          }

          // Restock shop stands strictly below half stock (lowest first)
          const lowRacks = state.racks
            .filter((r) => r.stock < r.maxStock / 2 && !this._isTaskClaimed('rackId', r.id, w))
            .sort((a, b) => a.stock - b.stock);
          const lowRack = lowRacks[0];
          if (lowRack) {
            if (w.held.includes('crate')) {
              w.taskQueue.push({
                type: 'restockRack',
                rackId: lowRack.id,
                x: lowRack.walkX,
                y: lowRack.walkY
              });
            } else {
              const storage = this.data.STATIONS.storage;
              w.taskQueue.push({
                type: 'prep',
                stationId: storage.id,
                itemId: 'crate',
                x: storage.walkX,
                y: storage.walkY
              });
              w.taskQueue.push({
                type: 'restockRack',
                rackId: lowRack.id,
                x: lowRack.walkX,
                y: lowRack.walkY
              });
            }
            return;
          }

          if (w.held.length > 0) {
            w.taskQueue.push({ type: 'trash', x: trash.walkX, y: trash.walkY });
            return;
          }

          const unclaimedSpill = state.spills.find((sp) => !this._isTaskClaimed('spillId', sp.id, w));
          if (unclaimedSpill) {
            w.taskQueue.push({
              type: 'cleanSpill',
              spillId: unclaimedSpill.id,
              x: unclaimedSpill.x,
              y: unclaimedSpill.y - 8
            });
          }
        }
      });
    }

    _spawnParticle(x, y, text, color, size) {
      if (!this.levelState) return;
      this.levelState.particles.push({
        x,
        y,
        text,
        color,
        size: size || 15,
        vx: (Math.random() - 0.5) * 14,
        vy: -28,
        life: 1.3,
        maxLife: 1.3
      });
    }

    _updateGameHUD() {
      const state = this.levelState;
      if (!state) return;
      const lvl = state.level;

      document.getElementById('hud-level-name').textContent = `${lvl.id}. ${lvl.name}`;
      document.getElementById('hud-earned-coins').textContent = `${state.earnedCoins} Kč`;

      const remaining = Math.max(0, lvl.customers - state.servedCount - state.angryCount);
      document.getElementById('hud-customers-left').textContent =
        `Zákazníků zbývá: ${remaining} / ${lvl.customers}`;

      const maxTarget = lvl.stars[2];
      const pct = Math.min(100, Math.round((state.earnedCoins / maxTarget) * 100));
      document.getElementById('hud-star-fill').style.width = `${pct}%`;

      const s1 = state.earnedCoins >= lvl.stars[0] ? '⭐' : '☆';
      const s2 = state.earnedCoins >= lvl.stars[1] ? '⭐' : '☆';
      const s3 = state.earnedCoins >= lvl.stars[2] ? '⭐' : '☆';
      document.getElementById('hud-star-targets').textContent =
        `${s1} ${lvl.stars[0]} · ${s2} ${lvl.stars[1]} · ${s3} ${lvl.stars[2]} Kč`;

      const heldEl = document.getElementById('hud-held-items');
      const player = state.player;
      if (player.held.length === 0) {
        heldEl.innerHTML = `<span class="tray-empty">Prázdné ruce (0/${player.maxCarry})</span>`;
      } else {
        heldEl.innerHTML = player.held
          .map((id) => {
            const it = this.data.ITEMS[id];
            return `<span class="tray-chip">${it ? it.icon : ''} ${it ? it.name : id}</span>`;
          })
          .join('');
      }
    }

    _endLevel() {
      const state = this.levelState;
      const lvl = state.level;
      const earned = state.earnedCoins;

      let starsEarned = 0;
      if (earned >= lvl.stars[2]) starsEarned = 3;
      else if (earned >= lvl.stars[1]) starsEarned = 2;
      else if (earned >= lvl.stars[0]) starsEarned = 1;

      this.save.coins += earned;
      const prevStars = this.save.stars[lvl.id] || 0;
      if (starsEarned > prevStars) {
        this.save.stars[lvl.id] = starsEarned;
      }

      let unlockedNext = false;
      if (starsEarned >= 1 && lvl.id >= this.save.unlockedLevel && lvl.id < this.data.LEVELS.length) {
        this.save.unlockedLevel = lvl.id + 1;
        unlockedNext = true;
      }

      this.persistSave();
      this.audio.stopAmbient();
      if (starsEarned >= 1) this.audio.playWin();
      else this.audio.playSad();

      const starsStr = '⭐'.repeat(starsEarned) + '☆'.repeat(3 - starsEarned);
      document.getElementById('result-stars').textContent = starsStr;
      document.getElementById('result-title').textContent =
        starsEarned >= 1 ? `Směna v zastávce "${lvl.name}" hotová!` : 'Směna skončila těsně pod cílem';
      document.getElementById('result-summary').textContent =
        `Obslouženo: ${state.servedCount} · Odešlo bez obsluhy: ${state.angryCount} · Výdělek přidán do pokladny: +${earned} Kč`;

      const unlockNote = document.getElementById('result-unlock-note');
      if (unlockedNext) {
        const nextLvl = this.data.LEVELS.find((l) => l.id === lvl.id + 1);
        unlockNote.textContent = `🎉 Odemčena nová zastávka na mapě: ${nextLvl.id}. ${nextLvl.name}!`;
        unlockNote.classList.remove('hidden');
      } else if (starsEarned === 0) {
        unlockNote.textContent =
          '💡 Tip: Před dalším pokusem si vylepši benzínku nebo najmi zaměstnance!';
        unlockNote.classList.remove('hidden');
      } else {
        unlockNote.classList.add('hidden');
      }

      const nextBtn = document.getElementById('result-next-btn');
      if (lvl.id < this.data.LEVELS.length && this.save.unlockedLevel > lvl.id) {
        nextBtn.classList.remove('hidden');
      } else {
        nextBtn.classList.add('hidden');
      }

      document.getElementById('result-modal').classList.remove('hidden');
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.Game = new GasStationGame();
  });
})();
