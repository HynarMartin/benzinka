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
    CORNER_SW: { x: 585, y: 592 },
    DOOR_OUT: { x: 715, y: 592 },
    DOOR_IN: { x: 715, y: 554 },
    AISLE_WEST: { x: 715, y: 432 },
    COUNTER_LEFT_SOUTH: { x: 665, y: 382 },
    COUNTER_LEFT_NORTH: { x: 665, y: 278 },
    COUNTER_GAP_SOUTH: { x: 1272, y: 395 },
    COUNTER_GAP_NORTH: { x: 1272, y: 278 },
    STORAGE_DOOR_WEST: { x: 1280, y: 315 },
    STORAGE_DOOR_EAST: { x: 1345, y: 315 }
  };

  function createDefaultLayout() {
    return {
      racks: {
        rack_snacks: { x: 790, y: 500, rot: 0 },
        rack_sweets: { x: 990, y: 500, rot: 0 },
        rack_auto: { x: 1190, y: 500, rot: 0 }
      },
      stations: {
        coffee: { x: 700, y: 185 },
        grill: { x: 875, y: 185 },
        fridge: { x: 1050, y: 185 }
      }
    };
  }

  function createDefaultSave() {
    return {
      coins: 0,
      currentStage: 1,
      unlockedStage: 1,
      unlockedLevel: 1,
      stars: {},
      stageStars: {},
      upgrades: {
        pump_unlock: 1,
        wash_unlock: 1,
        grill_unlock: 1,
        fridge_unlock: 1,
        rack_sweets_unlock: 1,
        rack_auto_unlock: 1,
        pumps: 1,
        pumps_price: 1,
        coffee: 1,
        coffee_price: 1,
        grill: 1,
        grill_price: 1,
        wash: 1,
        wash_price: 1,
        drink_speed: 1,
        drink_price: 1,
        racks: 1,
        racks_price: 1,
        decor: 1,
        decor_tips: 1,
        shoes: 1,
        carry: 1
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
      },
      stats: {
        totalPlayTime: 0,
        totalEarnedCoins: 0,
        totalServedCustomers: 0,
        totalAngryCustomers: 0,
        shiftsPlayed: 0,
        gameCompleted: false
      },
      rackStock: null,
      layout: createDefaultLayout()
    };
  }

  function createAdminSave() {
    const fullStageStars = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3 };
    return {
      coins: 99999,
      currentStage: 4,
      unlockedStage: 4,
      unlockedLevel: 8,
      stars: Object.assign({}, fullStageStars),
      stageStars: {
        1: Object.assign({}, fullStageStars),
        2: Object.assign({}, fullStageStars),
        3: Object.assign({}, fullStageStars),
        4: Object.assign({}, fullStageStars)
      },
      upgrades: {
        pump_unlock: 3,
        wash_unlock: 2,
        grill_unlock: 2,
        fridge_unlock: 2,
        rack_sweets_unlock: 2,
        rack_auto_unlock: 2,
        pumps: 4,
        pumps_price: 4,
        coffee: 4,
        coffee_price: 4,
        grill: 4,
        grill_price: 4,
        wash: 4,
        wash_price: 4,
        drink_speed: 4,
        drink_price: 4,
        racks: 4,
        racks_price: 4,
        decor: 4,
        decor_tips: 4,
        shoes: 4,
        carry: 3
      },
      staff: {
        tonik: 3,
        anicka: 3,
        kuba: 3
      },
      staffEnabled: {
        tonik: true,
        anicka: true,
        kuba: true
      },
      stats: {
        totalPlayTime: 720,
        totalEarnedCoins: 6500,
        totalServedCustomers: 115,
        totalAngryCustomers: 0,
        shiftsPlayed: 8,
        gameCompleted: true
      },
      rackStock: null,
      layout: createDefaultLayout()
    };
  }

  function normalizeSave(raw) {
    const def = createDefaultSave();
    if (!raw || typeof raw !== 'object') return def;
    const rawLayout = raw.layout && typeof raw.layout === 'object' ? raw.layout : {};
    const rawRacks = rawLayout.racks && typeof rawLayout.racks === 'object' ? rawLayout.racks : {};
    const rawStations = rawLayout.stations && typeof rawLayout.stations === 'object' ? rawLayout.stations : {};
    const normLayout = createDefaultLayout();
    ['rack_snacks', 'rack_sweets', 'rack_auto'].forEach((id) => {
      const r = rawRacks[id];
      if (r && typeof r.x === 'number' && typeof r.y === 'number') {
        normLayout.racks[id] = {
          x: r.x,
          y: r.y,
          rot: typeof r.rot === 'number' ? ((Math.round(r.rot) % 4) + 4) % 4 : 0
        };
      }
    });
    ['coffee', 'grill', 'fridge'].forEach((id) => {
      const s = rawStations[id];
      if (s && typeof s.x === 'number') {
        normLayout.stations[id] = { x: s.x, y: 185 };
      }
    });
    const rawStage =
      typeof raw.currentStage === 'number' ? Math.max(1, Math.min(4, Math.round(raw.currentStage))) : def.currentStage;
    const rawUnlockedStage =
      typeof raw.unlockedStage === 'number'
        ? Math.max(rawStage, Math.min(4, Math.round(raw.unlockedStage)))
        : Math.max(rawStage, def.unlockedStage);
    return {
      coins: typeof raw.coins === 'number' ? raw.coins : def.coins,
      currentStage: rawStage,
      unlockedStage: rawUnlockedStage,
      unlockedLevel: typeof raw.unlockedLevel === 'number' ? raw.unlockedLevel : def.unlockedLevel,
      stars: raw.stars && typeof raw.stars === 'object' ? raw.stars : {},
      stageStars: raw.stageStars && typeof raw.stageStars === 'object' ? Object.assign({}, raw.stageStars) : {},
      upgrades: Object.assign({}, def.upgrades, raw.upgrades || {}),
      staff: Object.assign({}, def.staff, raw.staff || {}),
      staffEnabled: Object.assign({}, def.staffEnabled, raw.staffEnabled || {}),
      stats: Object.assign({}, def.stats, raw.stats || {}),
      rackStock: raw.rackStock && typeof raw.rackStock === 'object' ? Object.assign({}, raw.rackStock) : null,
      layout: normLayout
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
      this.mapViewMode = 'world'; // 'world' | 'stage'
      this.paused = false;
      this._syncStageLevels();

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
          return {
            username: parsed.username,
            displayName: parsed.displayName || parsed.username,
            password: parsed.password
          };
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

    _escapeHtml(text) {
      return String(text || '').replace(/[&<>"']/g, (ch) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[ch] || ch;
      });
    }

    _getPlayerDisplayName() {
      if (this.isGuest || !this.currentUser) return '';
      return (this.currentUser.displayName || this.currentUser.username || '').trim();
    }

    _toCzechVocative(name) {
      const cleaned = String(name || '').trim();
      if (!cleaned) return '';
      const firstWord = cleaned.split(/\s+/)[0];
      const lower = firstWord.toLowerCase();

      const invariable = new Set([
        'admin', 'dagmar', 'ester', 'miriam', 'karin', 'ines', 'nikol',
        'nicole', 'rachel', 'carmen', 'ingrid', 'astrid', 'ellen', 'helen',
        'karen', 'vivien', 'rút', 'rut', 'sarah'
      ]);
      if (invariable.has(lower)) return firstWord;

      const last = lower.slice(-1);
      if ('eěiíyýouů'.includes(last)) return firstWord;

      if (last === 'a') {
        const isAllCaps = firstWord === firstWord.toUpperCase() && firstWord !== firstWord.toLowerCase();
        return firstWord.slice(0, -1) + (isAllCaps ? 'O' : 'o');
      }

      const applySuffix = (stemLen, suffix) => {
        const isAllCaps = firstWord === firstWord.toUpperCase() && firstWord !== firstWord.toLowerCase();
        return firstWord.slice(0, firstWord.length - stemLen) + (isAllCaps ? suffix.toUpperCase() : suffix);
      };

      const elExceptions = new Set(['karel', 'pavel', 'havel']);
      if (elExceptions.has(lower)) {
        return applySuffix(2, 'le');
      }
      if (lower.endsWith('el') && /(iel|uel|ael|cel)$/.test(lower)) {
        return applySuffix(0, 'i');
      }

      if (lower === 'petr' || lower === 'alexandr' || lower === 'silvestr') {
        return applySuffix(1, 'ře');
      }

      if (lower.endsWith('ek') || lower.endsWith('ěk')) {
        if (lower.endsWith('děk')) return applySuffix(3, 'ďku');
        if (lower.endsWith('těk')) return applySuffix(3, 'ťku');
        if (lower.endsWith('něk')) return applySuffix(3, 'ňku');
        if (firstWord.length > 3) return applySuffix(2, 'ku');
        return applySuffix(0, 'u');
      }

      if (lower.endsWith('ec')) {
        return applySuffix(2, 'če');
      }

      if ('kgh'.includes(last) || lower.endsWith('ch')) {
        return applySuffix(0, 'u');
      }

      if ('sxžšřčjcďťň'.includes(last)) {
        return applySuffix(0, 'i');
      }

      if ('bdflmnprtvwz'.includes(last)) {
        return applySuffix(0, 'e');
      }

      return firstWord;
    }

    _getPlayerVocative() {
      const displayName = this._getPlayerDisplayName();
      return displayName ? this._toCzechVocative(displayName) : '';
    }

    _loadLocalAccounts() {
      let accounts = {};
      try {
        const raw = localStorage.getItem(ACCOUNTS_KEY);
        accounts = raw ? JSON.parse(raw) : {};
      } catch (_err) {
        accounts = {};
      }
      if (!accounts.admin) {
        accounts.admin = {
          username: 'admin',
          displayName: 'Admin',
          password: 'admin',
          save: createAdminSave()
        };
      } else {
        if (!accounts.admin.displayName) {
          accounts.admin.displayName = 'Admin';
        }
        const adminUpgrades = createAdminSave().upgrades;
        if (!accounts.admin.save || typeof accounts.admin.save !== 'object') {
          accounts.admin.save = createAdminSave();
        } else {
          accounts.admin.save.upgrades = Object.assign({}, adminUpgrades, accounts.admin.save.upgrades || {}, {
            pump_unlock: 3,
            wash_unlock: 2,
            grill_unlock: 2,
            fridge_unlock: 2,
            rack_sweets_unlock: 2,
            rack_auto_unlock: 2
          });
          accounts.admin.save.unlockedStage = 4;
          if (typeof accounts.admin.save.currentStage !== 'number') {
            accounts.admin.save.currentStage = 4;
          }
          if (!accounts.admin.save.stageStars || typeof accounts.admin.save.stageStars !== 'object') {
            accounts.admin.save.stageStars = createAdminSave().stageStars;
          }
        }
      }
      return accounts;
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
            this._saveSession({
              username: data.username,
              displayName: data.displayName || this.currentUser.displayName || data.username,
              password: this.currentUser.password
            });
            this.save = normalizeSave(data.save);
            this._syncStageLevels();
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
            this._saveSession({
              username: acc.username,
              displayName: acc.displayName || this.currentUser.displayName || acc.username,
              password: this.currentUser.password
            });
            this.save = normalizeSave(acc.save);
            this._syncStageLevels();
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
      this._syncStageLevels();
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

      const displayName = this.currentUser.displayName || this.currentUser.username;
      const accounts = this._loadLocalAccounts();
      const key = this.currentUser.username.toLowerCase();
      accounts[key] = {
        username: this.currentUser.username,
        displayName,
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
            displayName,
            password: this.currentUser.password,
            save: this.save
          })
        }).catch(() => {});
      }

      this.updateGlobalHUD();
    }

    openAuthModal() {
      this._clearAuthFeedback('auth-message');
      document.getElementById('register-modal').classList.add('hidden');
      document.getElementById('auth-username').value = '';
      document.getElementById('auth-password').value = '';
      document.getElementById('auth-modal').classList.remove('hidden');
    }

    closeAuthModal() {
      document.getElementById('auth-modal').classList.add('hidden');
    }

    openRegisterModal() {
      this._clearAuthFeedback('register-message');
      document.getElementById('auth-modal').classList.add('hidden');
      document.getElementById('reg-username').value = '';
      document.getElementById('reg-password').value = '';
      document.getElementById('reg-display-name').value = '';
      document.getElementById('register-modal').classList.remove('hidden');
      document.getElementById('reg-username').focus();
    }

    closeRegisterModal(returnToLogin = true) {
      document.getElementById('register-modal').classList.add('hidden');
      if (returnToLogin) {
        this.openAuthModal();
      }
    }

    _clearAuthFeedback(elementId) {
      const msgEl = document.getElementById(elementId);
      if (!msgEl) return;
      msgEl.classList.add('hidden');
      msgEl.classList.remove('success');
      msgEl.textContent = '';
    }

    _showFormMessage(elementId, text, isSuccess) {
      const msgEl = document.getElementById(elementId);
      if (!msgEl) return;
      msgEl.textContent = text;
      msgEl.classList.remove('hidden');
      if (isSuccess) msgEl.classList.add('success');
      else msgEl.classList.remove('success');
    }

    async _submitAuthRequest(endpoint, payload, msgElementId, fallbackHandler) {
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
          this._showFormMessage(msgElementId, (data && data.error) || 'Akce se nezdařila.', false);
          return;
        }
        this._completeLogin(data.username, payload.password, data.save, data.displayName || payload.displayName);
      } catch (_err) {
        fallbackHandler();
      }
    }

    async _handleLogin() {
      const username = document.getElementById('auth-username').value.trim();
      const password = document.getElementById('auth-password').value;

      if (!username || !password) {
        this._showFormMessage('auth-message', 'Zadej prosím uživatelské jméno i heslo.', false);
        return;
      }

      this.audio.playClick();
      await this._submitAuthRequest('/api/login', { username, password }, 'auth-message', () => {
        const accounts = this._loadLocalAccounts();
        const acc = accounts[username.toLowerCase()];
        if (!acc) {
          this._showFormMessage('auth-message', 'Účet s tímto uživatelským jménem nebyl nalezen.', false);
          return;
        }
        if (acc.password !== password) {
          this._showFormMessage('auth-message', 'Nesprávné heslo.', false);
          return;
        }
        this._completeLogin(acc.username, password, acc.save, acc.displayName);
      });
    }

    async _handleRegister() {
      const username = document.getElementById('reg-username').value.trim();
      const password = document.getElementById('reg-password').value;
      const displayName = document.getElementById('reg-display-name').value.trim();

      if (!username || !password || !displayName) {
        this._showFormMessage('register-message', 'Vyplň prosím uživatelské jméno, heslo i své jméno.', false);
        return;
      }

      this.audio.playClick();
      const initialSave = createDefaultSave();
      await this._submitAuthRequest(
        '/api/register',
        { username, password, displayName, save: initialSave },
        'register-message',
        () => {
          const accounts = this._loadLocalAccounts();
          const key = username.toLowerCase();
          if (accounts[key]) {
            this._showFormMessage('register-message', 'Toto uživatelské jméno už existuje. Zvol jiné nebo se přihlas.', false);
            return;
          }
          accounts[key] = { username, displayName, password, save: initialSave };
          this._saveLocalAccounts(accounts);
          this._completeLogin(username, password, initialSave, displayName);
        }
      );
    }

    _completeLogin(username, password, saveObj, displayName) {
      this.isGuest = false;
      this._saveSession({ username, displayName: displayName || username, password });
      this.save = normalizeSave(saveObj);
      this._syncStageLevels();
      this.mapViewMode = 'world';
      this.selectedLevelId = Math.min(this.save.unlockedLevel, this.data.LEVELS.length);
      document.getElementById('logout-btn').textContent = '🚪 Odhlásit / Účet';
      this.persistSave();
      this.closeAuthModal();
      this.closeRegisterModal(false);
      this.renderMap();
      this.updateGlobalHUD();
      this.audio.playHappy();
    }

    _startGuestSession() {
      this.audio.playClick();
      this.isGuest = true;
      this._saveSession(null);
      this.save = createDefaultSave();
      this._syncStageLevels();
      this.mapViewMode = 'world';
      this.selectedLevelId = 1;
      document.getElementById('logout-btn').textContent = '🔑 Přihlásit se';
      this.closeAuthModal();
      this.closeRegisterModal(false);
      this.renderMap();
      this.updateGlobalHUD();
    }

    _bindUI() {
      // Auth & Register Modal buttons
      document.getElementById('auth-login-btn').addEventListener('click', () => this._handleLogin());
      document.getElementById('auth-register-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.openRegisterModal();
      });
      document.getElementById('auth-guest-btn').addEventListener('click', () => this._startGuestSession());
      document.getElementById('auth-password').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this._handleLogin();
        }
      });

      document.getElementById('register-submit-btn').addEventListener('click', () => this._handleRegister());
      document.getElementById('register-back-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.closeRegisterModal(true);
      });
      document.getElementById('close-register-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.closeRegisterModal(true);
      });
      ['reg-username', 'reg-password', 'reg-display-name'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this._handleRegister();
          }
        });
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
          const isAdmin = this.currentUser && this.currentUser.username.toLowerCase() === 'admin';
          this.save = isAdmin ? createAdminSave() : createDefaultSave();
          this._syncStageLevels();
          this.mapViewMode = 'world';
          this.selectedLevelId = isAdmin ? Math.min(this.save.unlockedLevel, this.data.LEVELS.length) : 1;
          this.persistSave();
          this.renderMap();
        }
      });

      // Prep Mode & Buy Modal Controls
      document.getElementById('close-prep-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.closePrepModal();
      });

      document.getElementById('open-buy-modal-btn').addEventListener('click', () => {
        this.audio.playClick();
        this._finishActivePlacement();
        this.openBuyModal();
      });

      document.getElementById('prep-start-btn').addEventListener('click', () => {
        this.audio.playClick();
        this._finishActivePlacement();
        this.closePrepModal();
        this.closeObjectUpgradeModal();
        this.startLevel(this.selectedLevelId);
      });

      document.getElementById('prep-map-btn').addEventListener('click', () => {
        this.audio.playClick();
        this._finishActivePlacement();
        this.closePrepModal();
        this.closeObjectUpgradeModal();
        this.exitLevelToMap();
      });

      document.getElementById('prep-settings-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.openSettingsModal();
      });

      document.getElementById('close-obj-upg-btn').addEventListener('click', () => {
        this.audio.playClick();
        this.closeObjectUpgradeModal();
      });

      document.getElementById('prep-bonus-btn').addEventListener('click', () => {
        this.audio.playUpgrade();
        this.save.coins += 25;
        this.persistSave();
        this.renderPrepModal();
        this._syncPrepState();
        this.renderMap();
      });

      document.getElementById('start-level-btn').addEventListener('click', () => {
        this.audio.playClick();
        this._finishActivePlacement();
        this.closePrepModal();
        this.closeObjectUpgradeModal();
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
        this._syncStageLevels();
        if (this.selectedLevelId >= this.data.LEVELS.length) {
          const curStage = this.getCurrentStage();
          const nextStage = this.data.STAGES.find((s) => s.id === curStage.id + 1);
          if (nextStage && this.save.coins >= nextStage.unlockCost) {
            this.buyNextStage();
            this.exitLevelToMap();
            return;
          }
          this.mapViewMode = 'world';
          this.exitLevelToMap();
          return;
        }
        const nextId = Math.min(this.selectedLevelId + 1, this.data.LEVELS.length);
        this.selectedLevelId = nextId;
        this.mapViewMode = 'stage';
        this.exitLevelToMap();
      });

      // Victory Modal Controls
      const victoryBadgeBtn = document.getElementById('victory-badge-btn');
      if (victoryBadgeBtn) {
        victoryBadgeBtn.addEventListener('click', () => {
          this.audio.playClick();
          this.showVictoryModal(null);
        });
      }

      document.getElementById('victory-replay-btn').addEventListener('click', () => {
        this.audio.playClick();
        document.getElementById('victory-modal').classList.add('hidden');
        this.save.currentStage = this.data.STAGES.length;
        this._syncStageLevels();
        const finalId = this.data.LEVELS[this.data.LEVELS.length - 1].id;
        this.selectedLevelId = finalId;
        this.startLevel(finalId);
      });

      document.getElementById('victory-map-btn').addEventListener('click', () => {
        this.audio.playClick();
        document.getElementById('victory-modal').classList.add('hidden');
        if (this.screen === 'game') {
          this.exitLevelToMap();
        }
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
        if (!this.levelState) return;
        if (this.levelState.prepMode && this.levelState.placementMode) {
          this.rotatePlacementMode(1);
          return;
        }
        if (this.settings.rightClickCancel) {
          this.levelState.player.taskQueue = [];
        }
      });

      document.addEventListener('keydown', (e) => {
        if (!this.settings.keyShortcuts || this.screen !== 'game' || !this.levelState) return;
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
        if (!document.getElementById('settings-modal').classList.contains('hidden')) return;

        if (this.levelState.prepMode) {
          if (this.levelState.placementMode) {
            if (e.code === 'KeyR') {
              e.preventDefault();
              this.rotatePlacementMode(1);
            } else if (e.code === 'Escape') {
              e.preventDefault();
              this.cancelPlacementMode();
            }
            return;
          }
          if (e.code === 'Escape') {
            this.closeObjectUpgradeModal();
            this.closePrepModal();
          }
          return;
        }

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

    getCurrentStage() {
      const stages = this.data && this.data.STAGES ? this.data.STAGES : [];
      const curId = (this.save && this.save.currentStage) || 1;
      return stages.find((s) => s.id === curId) || stages[0];
    }

    _syncStageLevels() {
      const stage = this.getCurrentStage();
      if (stage && stage.levels) {
        this.data.LEVELS = stage.levels;
      }
    }

    getUpgradeCap(upgradeId) {
      const stage = this.getCurrentStage();
      const lim = (stage && stage.limits) || {
        maxPumps: 3,
        allowedUnlocks: ['pump_unlock', 'wash_unlock', 'rack_sweets_unlock', 'fridge_unlock', 'grill_unlock', 'rack_auto_unlock'],
        maxUpgradeLevel: 4,
        maxCarryLevel: 3
      };
      if (upgradeId === 'pump_unlock') {
        return lim.allowedUnlocks.includes('pump_unlock') ? Math.min(3, lim.maxPumps || 3) : 1;
      }
      if (
        upgradeId === 'wash_unlock' ||
        upgradeId === 'rack_sweets_unlock' ||
        upgradeId === 'fridge_unlock' ||
        upgradeId === 'grill_unlock' ||
        upgradeId === 'rack_auto_unlock'
      ) {
        return lim.allowedUnlocks.includes(upgradeId) ? 2 : 1;
      }
      if (upgradeId === 'carry') {
        return Math.min(3, lim.maxCarryLevel || 3);
      }
      return Math.min(4, lim.maxUpgradeLevel || 4);
    }

    getStaffCap(staffId) {
      const stage = this.getCurrentStage();
      const lim = (stage && stage.limits) || {
        allowedStaff: ['tonik', 'anicka', 'kuba'],
        maxStaffLevel: 3
      };
      if (!lim.allowedStaff.includes(staffId)) return 0;
      return Math.min(3, lim.maxStaffLevel || 3);
    }

    openStageMap(stageId) {
      const isAdmin = this.currentUser && this.currentUser.username.toLowerCase() === 'admin';
      const curStageId = (this.save && this.save.currentStage) || 1;
      if (isAdmin) {
        this.save.currentStage = stageId;
        this.save.unlockedStage = 4;
        this.save.unlockedLevel = 8;
        const ss = this.save.stageStars && this.save.stageStars[stageId];
        this.save.stars = ss ? Object.assign({}, ss) : { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3 };
        this._syncStageLevels();
        this.selectedLevelId = 1;
        this.mapViewMode = 'stage';
        this.persistSave();
        this.renderMap();
        return;
      }
      if (stageId === curStageId) {
        this._syncStageLevels();
        this.mapViewMode = 'stage';
        this.renderMap();
      }
    }

    buyNextStage() {
      const curStage = this.getCurrentStage();
      const nextStage = this.data.STAGES.find((s) => s.id === curStage.id + 1);
      if (!nextStage) return false;
      if ((this.save.stars[8] || 0) < 1) return false;
      if (this.save.coins < nextStage.unlockCost) return false;

      if (!this.save.stageStars || typeof this.save.stageStars !== 'object') {
        this.save.stageStars = {};
      }
      this.save.stageStars[curStage.id] = Object.assign({}, this.save.stars);
      this.save.coins = 0;
      this.save.currentStage = nextStage.id;
      this.save.unlockedStage = Math.max(this.save.unlockedStage || 1, nextStage.id);
      this.save.unlockedLevel = 1;
      this.save.stars = {};

      const fresh = createDefaultSave();
      this.save.upgrades = fresh.upgrades;
      this.save.staff = fresh.staff;
      this.save.staffEnabled = fresh.staffEnabled;
      this.save.rackStock = null;
      this.save.layout = createDefaultLayout();

      this.selectedLevelId = 1;
      this.mapViewMode = 'stage';
      this._syncStageLevels();
      this._applySavedLayout();
      this.audio.playWin();
      this.persistSave();
      this.renderMap();
      return true;
    }

    updateGlobalHUD() {
      this._syncStageLevels();
      const curStage = this.getCurrentStage();
      const stageStarsCount = Object.values(this.save.stars || {}).reduce((acc, s) => acc + s, 0);
      let allStagesStars = 0;
      this.data.STAGES.forEach((st) => {
        const stStars = st.id === curStage.id ? this.save.stars : (this.save.stageStars && this.save.stageStars[st.id]) || {};
        allStagesStars += Object.values(stStars).reduce((acc, s) => acc + s, 0);
      });
      const maxTotalStars = this.data.STAGES.length * 24;
      const playerDisplayName = this._getPlayerDisplayName();
      const userLabel = this.isGuest
        ? 'Host (neukládá se)'
        : playerDisplayName || 'Host';
      document.getElementById('user-badge-name').textContent = userLabel;
      const settingsUserEl = document.getElementById('settings-user-label');
      if (settingsUserEl) {
        settingsUserEl.textContent = `Aktivní hráč: ${userLabel}`;
      }
      document.getElementById('map-coins').textContent = `${this.save.coins} Kč`;
      document.getElementById('map-stars').textContent = `${stageStarsCount} / 24 ⭐ (Celkem ${allStagesStars} / ${maxTotalStars})`;
      document.getElementById('prep-coins').textContent = `${this.save.coins} Kč`;
      const prepBarCoins = document.getElementById('prep-bar-coins');
      if (prepBarCoins) prepBarCoins.textContent = `${this.save.coins} Kč`;
      const objUpgCoins = document.getElementById('obj-upg-coins');
      if (objUpgCoins) objUpgCoins.textContent = `${this.save.coins} Kč`;

      const finalStageId = this.data.STAGES[this.data.STAGES.length - 1].id;
      const isGameCompleted =
        Boolean(this.save.stats && this.save.stats.gameCompleted) ||
        (curStage.id === finalStageId && (this.save.stars[8] || 0) >= 1) ||
        Boolean(this.save.stageStars && this.save.stageStars[finalStageId] && (this.save.stageStars[finalStageId][8] || 0) >= 1);
      const victoryBadgeBtn = document.getElementById('victory-badge-btn');
      if (victoryBadgeBtn) {
        victoryBadgeBtn.classList.toggle('hidden', !isGameCompleted);
      }
    }

    renderMap() {
      this._syncStageLevels();
      this._applySavedLayout();
      this.updateGlobalHUD();
      const svg = document.getElementById('map-road-svg');
      const nodesLayer = document.getElementById('map-nodes-layer');
      const bannerEl = document.getElementById('map-banner');
      nodesLayer.innerHTML = '';

      const curStage = this.getCurrentStage();
      const curStageId = curStage.id;
      const nextStage = this.data.STAGES.find((s) => s.id === curStageId + 1) || null;
      const stage8Done = (this.save.stars[8] || 0) >= 1;
      const isAdmin = this.currentUser && this.currentUser.username.toLowerCase() === 'admin';
      const finalStageId = this.data.STAGES[this.data.STAGES.length - 1].id;
      const isGameCompleted =
        Boolean(this.save.stats && this.save.stats.gameCompleted) ||
        (curStageId === finalStageId && (this.save.stars[8] || 0) >= 1) ||
        Boolean(this.save.stageStars && this.save.stageStars[finalStageId] && (this.save.stageStars[finalStageId][8] || 0) >= 1);

      if (this.mapViewMode === 'world') {
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

        const worldProps = [
          [65, 290, '🌲'], [185, 445, '🌻'], [310, 210, '🍎'], [445, 470, '🌲'],
          [585, 195, '⛵'], [710, 445, '🏡'], [835, 165, '🍇'], [960, 425, '⛰️'], [1075, 125, '🚨']
        ];
        worldProps.forEach(([px, py, emoji]) => {
          pathMarkup += `<text x="${px}" y="${py}" font-size="26" text-anchor="middle">${emoji}</text>`;
        });

        if (bannerEl) {
          const vocative = this._getPlayerVocative();
          const welcomeText = vocative
            ? `Vítej, ${this._escapeHtml(vocative)}! Klikni na svou aktivní benzínku a otevři jejích 8 dní.`
            : 'Klikni na svou aktivní benzínku a otevři jejích 8 dní!';
          bannerEl.innerHTML =
            `<span>🗺️ <strong>Hlavní mapa (4 benzínky):</strong> ${welcomeText}</span>`;
        }

        const stages = this.data.STAGES;
        for (let i = 0; i < stages.length - 1; i++) {
          const a = stages[i];
          const b = stages[i + 1];
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2 + (i % 2 === 0 ? -45 : 45);
          const segOpen = b.id <= Math.max(curStageId, this.save.unlockedStage || 1);

          pathMarkup += `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="${
            segOpen ? '#8c7258' : '#b7ab98'
          }" stroke-width="26" stroke-linecap="round" opacity="${segOpen ? 0.9 : 0.45}" />`;

          pathMarkup += `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="${
            segOpen ? '#fff5dc' : '#e6decb'
          }" stroke-width="4" stroke-dasharray="12 10" stroke-linecap="round" />`;
        }

        const finalStage = stages[stages.length - 1];
        if (isGameCompleted && finalStage) {
          pathMarkup += `<text x="${finalStage.x}" y="${Math.max(36, finalStage.y - 82)}" font-size="32" text-anchor="middle">🏆</text>`;
        }

        svg.innerHTML = pathMarkup;

        stages.forEach((st) => {
          const isCurrent = st.id === curStageId;
          const isPrevCompleted = st.id < curStageId;
          const isBuyable = st.id === curStageId + 1 && stage8Done;
          const canAfford = this.save.coins >= st.unlockCost;
          const stStarsObj = isCurrent ? this.save.stars : (this.save.stageStars && this.save.stageStars[st.id]) || {};
          const stStarsCount = Object.values(stStarsObj).reduce((acc, s) => acc + s, 0);

          const card = document.createElement('button');
          card.id = `stage-node-${st.id}`;
          card.type = 'button';
          let stateCls = 'stage-locked';
          let actionTxt = `🔒 ${st.unlockCost} Kč (Dokonči 8. den)`;
          if (isCurrent) {
            stateCls = 'stage-active';
            actionTxt = '📍 Otevřít 8 dní';
          } else if (isPrevCompleted) {
            stateCls = isAdmin ? 'stage-completed stage-admin-unlocked' : 'stage-completed';
            actionTxt = isAdmin ? '🛠️ Otevřít (Admin)' : '✅ Dokončeno';
          } else if (isBuyable) {
            stateCls = 'stage-buyable';
            actionTxt = `🏢 Koupit (${st.unlockCost} Kč)`;
          } else if (isAdmin) {
            stateCls = 'stage-completed stage-admin-unlocked';
            actionTxt = '🛠️ Otevřít (Admin)';
          }

          card.className = `map-stage-node ${stateCls}`;
          card.style.left = `${(st.x / 1150) * 100}%`;
          card.style.top = `${(st.y / 560) * 100}%`;
          card.innerHTML = `
            <div class="stage-node-icon">${st.icon}</div>
            <div class="stage-node-title">${st.id}. ${st.name}</div>
            <div class="stage-node-sub">${st.subtitle}</div>
            <div class="stage-node-stars">⭐ ${stStarsCount} / 24</div>
            <div class="stage-node-action">${actionTxt}</div>
          `;

          if (isAdmin || isCurrent) {
            card.addEventListener('click', (e) => {
              e.stopPropagation();
              this.audio.playClick();
              this.openStageMap(st.id);
            });
          } else if (isBuyable) {
            card.addEventListener('click', (e) => {
              e.stopPropagation();
              if (canAfford) {
                this.buyNextStage();
              } else {
                this.audio.playSad();
                if (bannerEl) {
                  bannerEl.innerHTML = `<span>💰 Na koupi <strong>${st.id}. ${st.name}</strong> potřebuješ <strong>${st.unlockCost} Kč</strong> (v pokladně máš ${this.save.coins} Kč).</span>`;
                }
              }
            });
          } else {
            card.title = 'Dokonči předchozí benzínku (všech 8 dní).';
          }

          nodesLayer.appendChild(card);
        });
        return;
      }

      // Sub-map ('stage'): 8 levels of the active gas station with location-specific backdrop
      const stageMapThemes = {
        1: {
          skyTop: '#fff4db',
          skyBot: '#e5ebd3',
          backdrop: `
            <path d="M0,180 Q280,120 580,165 T1150,150 L1150,560 L0,560 Z" fill="#d7e4c2" opacity="0.78" />
            <path d="M0,340 Q320,290 660,335 T1150,310 L1150,560 L0,560 Z" fill="#c7d8b0" opacity="0.72" />
            <ellipse cx="520" cy="145" rx="95" ry="26" fill="#9fd0db" opacity="0.75" />
            <ellipse cx="970" cy="455" rx="110" ry="30" fill="#a4d3de" opacity="0.65" />
          `,
          props: [
            [70, 290, '🏡'], [185, 445, '🌻'], [320, 195, '🍎'], [465, 470, '🌾'],
            [610, 190, '🏡'], [755, 445, '🌻'], [885, 165, '🌾'], [1045, 360, '🌲']
          ],
          roadOpen: '#8c7258',
          roadClosed: '#b7ab98',
          dashOpen: '#fff5dc',
          dashClosed: '#e6decb'
        },
        2: {
          skyTop: '#e8eef2',
          skyBot: '#cfd8dc',
          backdrop: `
            <rect x="0" y="210" width="1150" height="350" fill="#d8dee2" opacity="0.7" />
            <rect x="45" y="130" width="180" height="90" rx="8" fill="#b4c0c9" opacity="0.55" />
            <rect x="260" y="105" width="210" height="115" rx="8" fill="#a2b0ba" opacity="0.55" />
            <rect x="520" y="135" width="220" height="95" rx="8" fill="#b0bdc7" opacity="0.55" />
            <rect x="795" y="110" width="260" height="110" rx="8" fill="#9fb0bc" opacity="0.55" />
            <rect x="130" y="340" width="220" height="150" rx="18" fill="#b9cfab" opacity="0.55" />
            <rect x="740" y="355" width="250" height="145" rx="18" fill="#b9cfab" opacity="0.55" />
          `,
          props: [
            [80, 165, '🏙️'], [215, 465, '🏢'], [345, 175, '🏛️'], [515, 465, '🚦'],
            [635, 165, '🌳'], [790, 465, '🏬'], [920, 165, '🏙️'], [1055, 455, '🚦']
          ],
          roadOpen: '#545961',
          roadClosed: '#9da3aa',
          dashOpen: '#ffffff',
          dashClosed: '#e2e6ea'
        },
        3: {
          skyTop: '#dce7ee',
          skyBot: '#c3d1c6',
          backdrop: `
            <polygon points="0,210 135,85 280,200 450,70 650,205 835,82 1015,195 1150,105 1150,245 0,245" fill="#94a5b2" opacity="0.72" />
            <polygon points="135,85 102,120 135,112 168,120" fill="#ffffff" opacity="0.72" />
            <polygon points="450,70 412,110 450,100 488,110" fill="#ffffff" opacity="0.72" />
            <polygon points="835,82 802,118 835,108 868,118" fill="#ffffff" opacity="0.72" />
            <path d="M0,255 Q290,210 610,248 T1150,235 L1150,560 L0,560 Z" fill="#89a38b" opacity="0.65" />
          `,
          props: [
            [75, 195, '⛰️'], [185, 455, '🌲'], [315, 175, '🌲'], [465, 470, '🚛'],
            [610, 180, '⛰️'], [765, 450, '🏭'], [910, 165, '⚠️'], [1065, 435, '🌲']
          ],
          roadOpen: '#4b4e54',
          roadClosed: '#96999e',
          dashOpen: '#f2c14e',
          dashClosed: '#ded7be'
        },
        4: {
          skyTop: '#d8e8f2',
          skyBot: '#c7d5e0',
          backdrop: `
            <rect x="0" y="210" width="1150" height="350" fill="#cfd9e0" opacity="0.65" />
            <path d="M0,185 L1150,185 L1150,220 L0,220 Z" fill="#8fb3bd" opacity="0.55" />
            <rect x="0" y="220" width="1150" height="8" fill="#2a9d8f" opacity="0.6" />
            <rect x="80" y="95" width="990" height="18" rx="6" fill="#3a4c57" opacity="0.28" />
          `,
          props: [
            [75, 170, '🛣️'], [200, 460, '🚛'], [350, 170, '🏙️'], [490, 465, '🚌'],
            [640, 170, '⛽'], [785, 460, '🚛'], [915, 170, '🛣️'], [1065, 445, '🚨']
          ],
          roadOpen: '#39414a',
          roadClosed: '#8d969e',
          dashOpen: '#ffffff',
          dashClosed: '#dde3e8',
          edgeAccent: '#2a9d8f'
        }
      };
      const smTheme = stageMapThemes[curStageId] || stageMapThemes[1];
      let pathMarkup = `
        <defs>
          <linearGradient id="mapSkyStage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${smTheme.skyTop}" />
            <stop offset="100%" stop-color="${smTheme.skyBot}" />
          </linearGradient>
        </defs>
        <rect width="1150" height="560" fill="url(#mapSkyStage)" rx="22" />
        ${smTheme.backdrop}
      `;
      smTheme.props.forEach(([px, py, emoji]) => {
        pathMarkup += `<text x="${px}" y="${py}" font-size="26" text-anchor="middle">${emoji}</text>`;
      });

      if (bannerEl) {
        const buyBtnHtml =
          stage8Done && nextStage
            ? `<button id="buy-next-stage-banner-btn" type="button" class="btn-start map-banner-btn" ${
                this.save.coins < nextStage.unlockCost ? 'disabled' : ''
              }>🏢 Koupit: ${nextStage.name} (${nextStage.unlockCost} Kč)</button>`
            : '';
        bannerEl.innerHTML = `
          <button id="back-to-world-map-btn" type="button" class="btn-soft map-banner-btn">⬅️ Hlavní mapa (4 benzínky)</button>
          <span>${curStage.icon} <strong>${curStage.id}. ${curStage.name}</strong> – Vyber den (1–8)</span>
          ${buyBtnHtml}
        `;
        const backBtn = document.getElementById('back-to-world-map-btn');
        if (backBtn) {
          backBtn.addEventListener('click', () => {
            this.audio.playClick();
            this.mapViewMode = 'world';
            this.renderMap();
          });
        }
        const buyNextBtn = document.getElementById('buy-next-stage-banner-btn');
        if (buyNextBtn) {
          buyNextBtn.addEventListener('click', () => {
            this.audio.playClick();
            this.buyNextStage();
          });
        }
      }

      const levels = curStage.levels;
      for (let i = 0; i < levels.length - 1; i++) {
        const a = levels[i];
        const b = levels[i + 1];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 + (i % 2 === 0 ? -38 : 38);
        const unlockedSegment = b.id <= this.save.unlockedLevel;

        if (smTheme.edgeAccent) {
          pathMarkup += `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="${smTheme.edgeAccent}" stroke-width="32" stroke-linecap="round" opacity="${unlockedSegment ? 0.55 : 0.25}" />`;
        }

        pathMarkup += `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="${
          unlockedSegment ? smTheme.roadOpen : smTheme.roadClosed
        }" stroke-width="24" stroke-linecap="round" opacity="${unlockedSegment ? 0.92 : 0.45}" />`;

        pathMarkup += `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="${
          unlockedSegment ? smTheme.dashOpen : smTheme.dashClosed
        }" stroke-width="3.5" stroke-dasharray="10 10" stroke-linecap="round" />`;
      }

      const finalLvl = levels[levels.length - 1];
      if (isGameCompleted && curStageId === finalStageId && finalLvl) {
        pathMarkup += `<text x="${finalLvl.x}" y="${Math.max(36, finalLvl.y - 44)}" font-size="30" text-anchor="middle">🏆</text>`;
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
          btn.title = 'Dokonči předchozí den alespoň na 1 hvězdu.';
        }

        nodesLayer.appendChild(btn);
      });
    }

    openPrepModal(levelId) {
      this.enterPrepMode(levelId || this.selectedLevelId);
    }

    _ensureLayout() {
      const def = createDefaultLayout();
      if (!this.save.layout || typeof this.save.layout !== 'object') {
        this.save.layout = def;
        return this.save.layout;
      }
      if (!this.save.layout.racks || typeof this.save.layout.racks !== 'object') {
        this.save.layout.racks = def.racks;
      }
      if (!this.save.layout.stations || typeof this.save.layout.stations !== 'object') {
        this.save.layout.stations = def.stations;
      }
      ['rack_snacks', 'rack_sweets', 'rack_auto'].forEach((id) => {
        const r = this.save.layout.racks[id];
        if (!r || typeof r.x !== 'number' || typeof r.y !== 'number') {
          this.save.layout.racks[id] = Object.assign({}, def.racks[id]);
        } else {
          r.rot = typeof r.rot === 'number' ? ((Math.round(r.rot) % 4) + 4) % 4 : 0;
        }
      });
      ['coffee', 'grill', 'fridge'].forEach((id) => {
        const s = this.save.layout.stations[id];
        if (!s || typeof s.x !== 'number') {
          this.save.layout.stations[id] = Object.assign({}, def.stations[id]);
        } else {
          s.y = 185;
        }
      });
      return this.save.layout;
    }

    _getRotationLabel(rot) {
      const r = ((Math.round(rot || 0) % 4) + 4) % 4;
      if (r === 1) return '90° (Čelem vlevo)';
      if (r === 2) return '180° (Čelem nahoru)';
      if (r === 3) return '270° (Čelem vpravo)';
      return '0° (Čelem dolů)';
    }

    _computeRackGeometry(id, x, y, rot) {
      const r = ((Math.round(rot || 0) % 4) + 4) % 4;
      let custX = x;
      let custY = y + 48;
      let walkX = x;
      let walkY = y - 48;
      if (r === 1) {
        custX = x - 48;
        custY = y;
        walkX = x + 48;
        walkY = y;
      } else if (r === 2) {
        custX = x;
        custY = y - 48;
        walkX = x;
        walkY = y + 48;
      } else if (r === 3) {
        custX = x + 48;
        custY = y;
        walkX = x - 48;
        walkY = y;
      }
      return { x, y, rot: r, walkX, walkY, custX, custY };
    }

    _applySavedLayout() {
      const layout = this._ensureLayout();
      ['coffee', 'grill', 'fridge'].forEach((id) => {
        const st = this.data.STATIONS[id];
        const pos = layout.stations[id];
        if (st && pos) {
          st.x = pos.x;
          st.y = 185;
          st.walkX = pos.x;
          st.walkY = 248;
        }
      });
      ['rack_snacks', 'rack_sweets', 'rack_auto'].forEach((id) => {
        const rackDef = this.data.RACKS[id];
        const pos = layout.racks[id];
        if (rackDef && pos) {
          const geom = this._computeRackGeometry(id, pos.x, pos.y, pos.rot || 0);
          Object.assign(rackDef, geom);
          if (this.levelState && this.levelState.racks) {
            const liveRack = this.levelState.racks.find((r) => r.id === id);
            if (liveRack) {
              Object.assign(liveRack, geom);
            }
          }
        }
      });
    }

    _applyPlacementPreview(pm) {
      if (!pm) return;
      if (pm.kind === 'station') {
        const st = this.data.STATIONS[pm.id];
        if (st) {
          st.x = pm.x;
          st.y = 185;
          st.walkX = pm.x;
          st.walkY = 248;
        }
      } else if (pm.kind === 'rack') {
        const geom = this._computeRackGeometry(pm.id, pm.x, pm.y, pm.rot || 0);
        if (this.data.RACKS[pm.id]) {
          Object.assign(this.data.RACKS[pm.id], geom);
        }
        if (this.levelState && this.levelState.racks) {
          const liveRack = this.levelState.racks.find((r) => r.id === pm.id);
          if (liveRack) {
            Object.assign(liveRack, geom);
          }
        }
      }
    }

    _isPlacementValid(kind, id, x, y, rot) {
      if (typeof x !== 'number' || typeof y !== 'number') return false;
      if (kind === 'station') {
        if (x < 680 || x > 1135 || y !== 185) return false;
        const others = ['coffee', 'grill', 'fridge'];
        for (let i = 0; i < others.length; i++) {
          const otherId = others[i];
          if (otherId === id || !this._isStationUnlocked(otherId)) continue;
          const other = this.data.STATIONS[otherId];
          if (other && Math.abs(x - other.x) < 95) return false;
        }
        return true;
      }
      if (kind === 'rack') {
        if (x < 725 || x > 1225 || y < 440 || y > 520) return false;
        const normRot = ((Math.round(rot || 0) % 4) + 4) % 4;
        const hw1 = normRot % 2 === 1 ? 26 : 42;
        const hh1 = normRot % 2 === 1 ? 42 : 26;
        const others = ['rack_snacks', 'rack_sweets', 'rack_auto'];
        for (let i = 0; i < others.length; i++) {
          const otherId = others[i];
          if (otherId === id || !this._isRackUnlocked(otherId)) continue;
          const other =
            (this.levelState && this.levelState.racks && this.levelState.racks.find((r) => r.id === otherId)) ||
            this.data.RACKS[otherId];
          if (!other) continue;
          const otherRot = other.rot || 0;
          const hw2 = otherRot % 2 === 1 ? 26 : 42;
          const hh2 = otherRot % 2 === 1 ? 42 : 26;
          if (Math.abs(x - other.x) < hw1 + hw2 + 22 && Math.abs(y - other.y) < hh1 + hh2 + 22) {
            return false;
          }
        }
        return true;
      }
      return false;
    }

    _findFreeDefaultPlacement(kind, id) {
      const def = createDefaultLayout();
      if (kind === 'station') {
        const prefX = (def.stations[id] && def.stations[id].x) || 700;
        const candidates = [prefX, 700, 875, 1050, 785, 965, 1130];
        for (let i = 0; i < candidates.length; i++) {
          if (this._isPlacementValid('station', id, candidates[i], 185, 0)) {
            return { x: candidates[i], y: 185 };
          }
        }
        return { x: prefX, y: 185 };
      }
      const pref = def.racks[id] || { x: 790, y: 500, rot: 0 };
      const candidates = [
        [pref.x, pref.y],
        [790, 500],
        [990, 500],
        [1190, 500],
        [890, 500],
        [1090, 500],
        [790, 448],
        [990, 448],
        [1190, 448]
      ];
      for (let i = 0; i < candidates.length; i++) {
        const [cx, cy] = candidates[i];
        if (this._isPlacementValid('rack', id, cx, cy, 0)) {
          return { x: cx, y: cy, rot: 0 };
        }
      }
      return { x: pref.x, y: pref.y, rot: 0 };
    }

    rotateRackInPlace(rackId, delta) {
      const layout = this._ensureLayout();
      const pos = layout.racks[rackId];
      if (!pos) return false;
      const nextRot = ((pos.rot || 0) + (delta || 1) + 4) % 4;
      if (!this._isPlacementValid('rack', rackId, pos.x, pos.y, nextRot)) {
        this.audio.playSad();
        const warnEl = document.getElementById('obj-place-warning');
        if (warnEl) {
          warnEl.textContent = 'Na tomto místě není dost prostoru pro otočení — použij „Změnit pozici a otočit na plátně“.';
          warnEl.classList.remove('hidden');
        }
        return false;
      }
      pos.rot = nextRot;
      this.audio.playClick();
      this._applySavedLayout();
      this.persistSave();
      if (this._activeObjectTarget && this._activeObjectTarget.placementId === rackId) {
        this.openObjectUpgradeModal(this._activeObjectTarget);
      }
      return true;
    }

    _restorePrepTipBar() {
      const tipBar = document.getElementById('game-tip-bar');
      if (!tipBar) return;
      tipBar.innerHTML =
        '🛠️ <strong>Příprava benzínky:</strong> Klikni přímo na stojan, regál, kávovar, gril, pokladnu, svou postavičku nebo zaměstnance pro vylepšení. Nové stojany a zaměstnance koupíš přes <strong>🛒 Nakupovat</strong>, pak stiskni <strong>▶️ Start hry</strong>!';
    }

    _updatePlacementTipBar() {
      const tipBar = document.getElementById('game-tip-bar');
      const pm = this.levelState && this.levelState.placementMode;
      if (!tipBar || !pm) return;
      const label =
        pm.kind === 'rack'
          ? (this.data.RACKS[pm.id] && this.data.RACKS[pm.id].label) || pm.id
          : (this.data.STATIONS[pm.id] && this.data.STATIONS[pm.id].label) || pm.id;

      if (pm.kind === 'rack') {
        tipBar.innerHTML = `🏗️ <strong>Stavění (${label}):</strong> Posuň myší po prodejně a klikni pro položení · Směr: <strong>${this._getRotationLabel(
          pm.rot
        )}</strong> <button id="place-rotate-left-btn" type="button" class="tip-action-btn">↺ Otočit -90°</button> <button id="place-rotate-right-btn" type="button" class="tip-action-btn">↻ Otočit +90° (R)</button> <button id="place-cancel-btn" type="button" class="tip-action-btn cancel">✕ Zrušit (Esc)</button>`;
        const leftBtn = document.getElementById('place-rotate-left-btn');
        const rightBtn = document.getElementById('place-rotate-right-btn');
        if (leftBtn) leftBtn.addEventListener('click', () => this.rotatePlacementMode(-1));
        if (rightBtn) rightBtn.addEventListener('click', () => this.rotatePlacementMode(1));
      } else {
        tipBar.innerHTML = `🏗️ <strong>Umístění na zadním pultu (${label}):</strong> Posuň myší podél zadního pultu a klikni pro položení <button id="place-cancel-btn" type="button" class="tip-action-btn cancel">✕ Zrušit (Esc)</button>`;
      }
      const cancelBtn = document.getElementById('place-cancel-btn');
      if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancelPlacementMode());
    }

    startPlacementMode(kind, id, isNewPurchase) {
      if (!this.levelState || !this.levelState.prepMode) return;
      this.closePrepModal();
      this.closeObjectUpgradeModal();
      const layout = this._ensureLayout();
      this._applySavedLayout();

      let pos;
      if (kind === 'rack') {
        pos = layout.racks[id] || { x: 790, y: 500, rot: 0 };
      } else {
        pos = layout.stations[id] || { x: 700, y: 185 };
      }

      const startRot = kind === 'rack' ? pos.rot || 0 : 0;
      const startY = kind === 'rack' ? pos.y : 185;
      const valid = this._isPlacementValid(kind, id, pos.x, startY, startRot);

      this.levelState.hoveredTarget = null;
      this.levelState.placementMode = {
        kind,
        id,
        x: pos.x,
        y: startY,
        rot: startRot,
        origX: pos.x,
        origY: startY,
        origRot: startRot,
        inBounds: true,
        valid,
        isNewPurchase: Boolean(isNewPurchase)
      };
      this.canvas.style.cursor = valid ? 'grabbing' : 'not-allowed';
      this._updatePlacementTipBar();
    }

    rotatePlacementMode(delta) {
      const pm = this.levelState && this.levelState.placementMode;
      if (!pm || pm.kind !== 'rack') return;
      pm.rot = ((pm.rot + (delta || 1)) % 4 + 4) % 4;
      pm.valid = Boolean(pm.inBounds !== false) && this._isPlacementValid('rack', pm.id, pm.x, pm.y, pm.rot);
      this._applyPlacementPreview(pm);
      this.canvas.style.cursor = pm.valid ? 'grabbing' : 'not-allowed';
      this._updatePlacementTipBar();
      this.audio.playClick();
    }

    confirmPlacementMode(silentForce) {
      const pm = this.levelState && this.levelState.placementMode;
      if (!pm) return false;
      if (!pm.valid) {
        if (silentForce) {
          this.cancelPlacementMode();
          return false;
        }
        this.audio.playSad();
        this._spawnParticle(pm.x, pm.y - 36, 'Sem nelze umístit!', '#d95d4a', 15, 2.0);
        return false;
      }

      const layout = this._ensureLayout();
      if (pm.kind === 'rack') {
        layout.racks[pm.id] = { x: pm.x, y: pm.y, rot: pm.rot };
      } else if (pm.kind === 'station') {
        layout.stations[pm.id] = { x: pm.x, y: 185 };
      }
      this.levelState.placementMode = null;
      this._applySavedLayout();
      this._restorePrepTipBar();
      this.canvas.style.cursor = 'default';
      this.persistSave();
      if (!silentForce) {
        this.audio.playUpgrade();
        this._spawnParticle(pm.x, pm.y - 38, 'Postaveno! ✨', '#4f9d69', 15, 2.0);
      }
      return true;
    }

    cancelPlacementMode() {
      const pm = this.levelState && this.levelState.placementMode;
      if (!pm) return;
      const layout = this._ensureLayout();
      if (pm.kind === 'rack') {
        layout.racks[pm.id] = { x: pm.origX, y: pm.origY, rot: pm.origRot };
      } else if (pm.kind === 'station') {
        layout.stations[pm.id] = { x: pm.origX, y: 185 };
      }
      this.levelState.placementMode = null;
      this._applySavedLayout();
      this._restorePrepTipBar();
      this.canvas.style.cursor = 'default';
      this.audio.playClick();
    }

    _finishActivePlacement() {
      if (this.levelState && this.levelState.placementMode) {
        this.confirmPlacementMode(true);
      }
    }

    openBuyModal() {
      this._finishActivePlacement();
      this.renderPrepModal();
      document.getElementById('prep-modal').classList.remove('hidden');
    }

    closePrepModal() {
      document.getElementById('prep-modal').classList.add('hidden');
    }

    closeObjectUpgradeModal() {
      this._activeObjectTarget = null;
      const modal = document.getElementById('object-upgrade-modal');
      if (modal) modal.classList.add('hidden');
    }

    openObjectUpgradeModal(target) {
      if (!target) return;
      this._activeObjectTarget = target;
      const modal = document.getElementById('object-upgrade-modal');
      const iconEl = document.getElementById('obj-upg-icon');
      const titleEl = document.getElementById('obj-upg-title');
      const pipsEl = document.getElementById('obj-upg-pips');
      const descEl = document.getElementById('obj-upg-desc');
      const coinsEl = document.getElementById('obj-upg-coins');
      const actionsEl = document.getElementById('obj-upg-actions');

      coinsEl.textContent = `${this.save.coins} Kč`;
      actionsEl.innerHTML = '';

      if (target.targetType === 'staff' && target.staffId) {
        const st = this.data.STAFF.find((s) => s.id === target.staffId);
        if (!st) return;
        const staffCap = this.getStaffCap(st.id);
        const curLvl = Math.min(staffCap, this.save.staff[st.id] || 0);
        const isHired = curLvl > 0;
        const isMax = staffCap === 0 || curLvl >= staffCap;
        const nextCost = !isHired ? st.hireCost : isMax ? null : st.upgradeCosts[curLvl - 1];
        const canAfford = nextCost !== null && this.save.coins >= nextCost;
        const isEnabled = this.save.staffEnabled[st.id] !== false;

        iconEl.textContent = st.icon;
        titleEl.textContent = st.name;
        descEl.textContent = st.description;

        let pips = '';
        for (let i = 1; i <= staffCap; i++) {
          pips += `<span class="lvl-pip ${i <= curLvl ? 'filled' : ''}"></span>`;
        }
        pipsEl.innerHTML = `${pips} <span class="lvl-text">${
          isHired ? `Úr. ${curLvl}/${staffCap}` : 'Nenajatý'
        }</span>`;

        const row = document.createElement('div');
        row.className = 'staff-actions';

        const buyBtn = document.createElement('button');
        buyBtn.type = 'button';
        buyBtn.className = 'btn-buy';
        buyBtn.disabled = isMax || !canAfford;
        buyBtn.textContent = !isHired
          ? `Najmout (${nextCost} Kč)`
          : isMax
          ? staffCap < st.maxLevel
            ? `✨ Max v této benzínce (${curLvl}/${staffCap})`
            : '✨ Zkušený mistr'
          : `Vylepšit – zrychlit (${nextCost} Kč)`;
        if (!isMax) {
          buyBtn.addEventListener('click', () => {
            this.hireOrUpgradeStaff(st.id);
          });
        }
        row.appendChild(buyBtn);

        if (isHired) {
          const toggleBtn = document.createElement('button');
          toggleBtn.type = 'button';
          toggleBtn.className = `btn-toggle ${isEnabled ? 'on' : 'off'}`;
          toggleBtn.textContent = isEnabled ? '✅ Ve směně' : '💤 Odpočívá';
          toggleBtn.addEventListener('click', () => {
            this.audio.playClick();
            this.save.staffEnabled[st.id] = !isEnabled;
            this.persistSave();
            this._syncPrepState();
            this.renderPrepModal();
            this.openObjectUpgradeModal(target);
          });
          row.appendChild(toggleBtn);
        }
        actionsEl.appendChild(row);
      } else {
        const upgIds = Array.isArray(target.upgradeIds)
          ? target.upgradeIds
          : target.upgradeId
          ? [target.upgradeId]
          : [];
        const firstUpg = this.data.UPGRADES.find((u) => u.id === upgIds[0]);
        if (!firstUpg) return;

        let totalBought = 0;
        let totalMax = 0;
        upgIds.forEach((uid) => {
          const u = this.data.UPGRADES.find((x) => x.id === uid);
          if (!u) return;
          const capLvl = this.getUpgradeCap(u.id);
          const effLvl = Math.min(capLvl, this.save.upgrades[u.id] || 1);
          totalBought += Math.max(0, effLvl - 1);
          totalMax += Math.max(1, capLvl - 1);
        });

        iconEl.textContent = target.icon || firstUpg.icon;
        titleEl.textContent = target.title || firstUpg.name;
        descEl.textContent = target.desc || 'Vyber si, které vylepšení chceš koupit samostatně:';
        pipsEl.innerHTML = `<span class="lvl-text">Zakoupeno vylepšení: ${totalBought}/${totalMax}</span>`;

        if (target.placementKind === 'rack' && target.placementId) {
          const layout = this._ensureLayout();
          const pos = layout.racks[target.placementId] || { x: 790, y: 500, rot: 0 };
          const curRot = pos.rot || 0;
          const rackDef = this.data.RACKS[target.placementId];
          const placeCard = document.createElement('div');
          placeCard.className = 'prep-card placement-card';
          placeCard.innerHTML = `
            <div class="prep-card-head">
              <span class="prep-icon">🏗️</span>
              <div>
                <h4>Umístění: ${rackDef ? rackDef.label : target.placementId}</h4>
                <div class="lvl-pips"><span class="lvl-text">Natočení: ${this._getRotationLabel(curRot)}</span></div>
              </div>
            </div>
            <p class="prep-desc">Přesuň regál kamkoliv po prodejně nebo změň směr, odkud k němu zákazníci přistupují:</p>
            <p id="obj-place-warning" class="auth-message hidden"></p>
            <div class="placement-btn-row">
              <button id="obj-rotate-btn" type="button" class="btn-soft">🔄 Otočit o 90°</button>
              <button id="obj-place-btn" type="button" class="btn-primary">📍 Změnit pozici a otočit na plátně</button>
            </div>
          `;
          const rotBtn = placeCard.querySelector('#obj-rotate-btn');
          const moveBtn = placeCard.querySelector('#obj-place-btn');
          if (rotBtn) {
            rotBtn.addEventListener('click', () => this.rotateRackInPlace(target.placementId, 1));
          }
          if (moveBtn) {
            moveBtn.addEventListener('click', () => {
              this.audio.playClick();
              this.closeObjectUpgradeModal();
              this.startPlacementMode('rack', target.placementId, false);
            });
          }
          actionsEl.appendChild(placeCard);
        } else if (target.placementKind === 'station' && target.placementId) {
          const layout = this._ensureLayout();
          const pos = layout.stations[target.placementId] || { x: 700, y: 185 };
          const stDef = this.data.STATIONS[target.placementId];
          const placeCard = document.createElement('div');
          placeCard.className = 'prep-card placement-card';
          placeCard.innerHTML = `
            <div class="prep-card-head">
              <span class="prep-icon">🏗️</span>
              <div>
                <h4>Umístění: ${stDef ? stDef.label : target.placementId}</h4>
                <div class="lvl-pips"><span class="lvl-text">Zadní pult · Pozice X = ${Math.round(pos.x)}</span></div>
              </div>
            </div>
            <p class="prep-desc">Vyber si libovolné volné místo na zadním pultu bistra:</p>
            <div class="placement-btn-row">
              <button id="obj-place-btn" type="button" class="btn-primary">📍 Změnit pozici na zadním pultu</button>
            </div>
          `;
          const moveBtn = placeCard.querySelector('#obj-place-btn');
          if (moveBtn) {
            moveBtn.addEventListener('click', () => {
              this.audio.playClick();
              this.closeObjectUpgradeModal();
              this.startPlacementMode('station', target.placementId, false);
            });
          }
          actionsEl.appendChild(placeCard);
        }

        upgIds.forEach((uid) => {
          const upg = this.data.UPGRADES.find((u) => u.id === uid);
          if (!upg) return;
          const capLvl = this.getUpgradeCap(upg.id);
          const curLvl = Math.min(capLvl, this.save.upgrades[upg.id] || 1);
          const isMax = curLvl >= capLvl;
          const nextCost = isMax ? null : upg.costs[curLvl - 1];
          const canAfford = nextCost !== null && this.save.coins >= nextCost;

          let pips = '';
          for (let i = 1; i <= capLvl; i++) {
            pips += `<span class="lvl-pip ${i <= curLvl ? 'filled' : ''}"></span>`;
          }

          const card = document.createElement('div');
          card.className = 'prep-card';
          card.innerHTML = `
            <div class="prep-card-head">
              <span class="prep-icon">${upg.icon}</span>
              <div>
                <h4>${upg.name}</h4>
                <div class="lvl-pips">${pips} <span class="lvl-text">Úr. ${curLvl}/${capLvl}</span></div>
              </div>
            </div>
            <p class="prep-desc">${upg.description}</p>
            <button type="button" class="btn-buy" data-upgrade="${upg.id}" ${isMax || !canAfford ? 'disabled' : ''}>
              ${isMax ? (capLvl < upg.maxLevel ? '✨ Max v této benzínce' : '✨ Na maximu') : `Vylepšit (${nextCost} Kč)`}
            </button>
          `;
          const buyBtn = card.querySelector('.btn-buy');
          if (buyBtn && !isMax) {
            buyBtn.addEventListener('click', () => {
              this.buyUpgrade(upg.id);
            });
          }
          actionsEl.appendChild(card);
        });
      }

      modal.classList.remove('hidden');
    }

    _getEffectiveUpgrade(upgradeId) {
      const raw = (this.save && this.save.upgrades && this.save.upgrades[upgradeId]) || 1;
      return Math.min(raw, this.getUpgradeCap(upgradeId));
    }

    _isStationUnlocked(stationId) {
      const upgs = (this.save && this.save.upgrades) || {};
      if (stationId === 'pump_0') return true;
      if (stationId === 'pump_1') return this.getUpgradeCap('pump_unlock') >= 2 && (upgs.pump_unlock || 1) >= 2;
      if (stationId === 'pump_2') return this.getUpgradeCap('pump_unlock') >= 3 && (upgs.pump_unlock || 1) >= 3;
      if (stationId === 'pump_3') {
        const stg = this.getCurrentStage();
        return Boolean(stg && stg.limits && stg.limits.hasHeavyPump);
      }
      if (stationId === 'bucket') return this.getUpgradeCap('wash_unlock') >= 2 && (upgs.wash_unlock || 1) >= 2;
      if (stationId === 'coffee') return true;
      if (stationId === 'grill') return this.getUpgradeCap('grill_unlock') >= 2 && (upgs.grill_unlock || 1) >= 2;
      if (stationId === 'fridge') return this.getUpgradeCap('fridge_unlock') >= 2 && (upgs.fridge_unlock || 1) >= 2;
      return true;
    }

    _isRackUnlocked(rackId) {
      const upgs = (this.save && this.save.upgrades) || {};
      if (rackId === 'rack_snacks') return true;
      if (rackId === 'rack_sweets') {
        return this.getUpgradeCap('rack_sweets_unlock') >= 2 && (upgs.rack_sweets_unlock || 1) >= 2;
      }
      if (rackId === 'rack_auto') {
        return this.getUpgradeCap('rack_auto_unlock') >= 2 && (upgs.rack_auto_unlock || 1) >= 2;
      }
      return true;
    }

    _isItemUnlocked(itemId) {
      if (
        itemId === 'fuel' ||
        itemId === 'coffee' ||
        itemId === 'chips' ||
        itemId === 'crate' ||
        itemId === 'broom'
      ) {
        return true;
      }
      if (itemId === 'wash') return this._isStationUnlocked('bucket');
      if (itemId === 'snack') return this._isStationUnlocked('grill');
      if (itemId === 'drink') return this._isStationUnlocked('fridge');
      if (itemId === 'candy') return this._isRackUnlocked('rack_sweets');
      if (itemId === 'carcare') return this._isRackUnlocked('rack_auto');
      return true;
    }

    renderPrepModal() {
      this._syncStageLevels();
      const curStage = this.getCurrentStage();
      const level = this.data.LEVELS.find((l) => l.id === this.selectedLevelId) || this.data.LEVELS[0];
      document.getElementById('prep-level-title').textContent =
        `🛒 Nakupovat – ${curStage.name} (${level.name})`;
      document.getElementById('prep-level-subtitle').textContent =
        'Dokup si další tankovací stojany, prodejní regály, vybavení bistra nebo najmi zaměstnance. Vylepšení kupuješ kliknutím přímo na věci a postavičky v benzínce!';
      document.getElementById('prep-level-meta').textContent =
        `Zákazníků ve směně: ${level.customers} · Cíl: ⭐ ${level.stars[0]} Kč · ⭐⭐ ${level.stars[1]} Kč · ⭐⭐⭐ ${level.stars[2]} Kč`;
      document.getElementById('prep-coins').textContent = `${this.save.coins} Kč`;

      const staffGrid = document.getElementById('staff-list');
      staffGrid.innerHTML = '';

      this.data.STAFF.forEach((st) => {
        const staffCap = this.getStaffCap(st.id);
        const curLvl = Math.min(staffCap, this.save.staff[st.id] || 0);
        const isStageLocked = staffCap === 0;
        const isHired = !isStageLocked && curLvl > 0;
        const canAffordHire = !isStageLocked && !isHired && this.save.coins >= st.hireCost;
        const isEnabled = this.save.staffEnabled[st.id] !== false;

        let pips = '';
        const pipTotal = Math.max(1, staffCap || st.maxLevel);
        for (let i = 1; i <= pipTotal; i++) {
          pips += `<span class="lvl-pip ${i <= curLvl ? 'filled' : ''}"></span>`;
        }

        const card = document.createElement('div');
        card.className = `prep-card ${isHired ? 'hired-card' : ''}`;
        card.innerHTML = `
          <div class="prep-card-head">
            <span class="prep-icon">${st.icon}</span>
            <div>
              <h4>${st.name}</h4>
              <div class="lvl-pips">${isStageLocked ? '<span class="lvl-text">🔒 Až u větší benzínky</span>' : `${pips} <span class="lvl-text">${
                isHired ? `Úr. ${curLvl}/${staffCap}` : 'Zatím nenajatý'
              }</span>`}</div>
            </div>
          </div>
          <p class="prep-desc">${st.description}</p>
          ${
            isStageLocked
              ? `<button type="button" class="btn-buy" disabled>🔒 Nedostupné v této benzínce</button>`
              : !isHired
              ? `<div class="staff-actions">
                  <button type="button" class="btn-buy" data-staff="${st.id}" ${!canAffordHire ? 'disabled' : ''}>
                    Najmout (${st.hireCost} Kč)
                  </button>
                </div>`
              : `<div class="staff-actions">
                  <p class="obj-upg-note">✅ Najatý v benzínce — klikni na něj v benzínce pro vylepšení</p>
                  <button type="button" class="btn-toggle ${isEnabled ? 'on' : 'off'}">${
                    isEnabled ? '✅ Ve směně' : '💤 Odpočívá'
                  }</button>
                </div>`
          }
        `;

        const buyBtn = card.querySelector('.btn-buy');
        if (buyBtn && !isHired && !isStageLocked) {
          buyBtn.addEventListener('click', () => this.hireOrUpgradeStaff(st.id));
        }
        const toggleBtn = card.querySelector('.btn-toggle');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', () => {
            this.audio.playClick();
            this.save.staffEnabled[st.id] = !isEnabled;
            this.persistSave();
            this._syncPrepState();
            this.renderPrepModal();
          });
        }

        staffGrid.appendChild(card);
      });

      const upgradesGrid = document.getElementById('upgrades-list');
      upgradesGrid.innerHTML = '';

      const pumpUnlockUpg = this.data.UPGRADES.find((u) => u.id === 'pump_unlock');
      if (pumpUnlockUpg) {
        const maxLvl = this.getUpgradeCap('pump_unlock');
        const curLvl = Math.min(maxLvl, this.save.upgrades.pump_unlock || 1);
        const pumpIsMax = curLvl >= maxLvl;
        const buyPumpCost = pumpIsMax ? null : pumpUnlockUpg.costs[curLvl - 1];
        const canBuyPump = !pumpIsMax && this.save.coins >= buyPumpCost;
        const hasHeavyPump = Boolean(curStage.limits && curStage.limits.hasHeavyPump);

        const pumpCard = document.createElement('div');
        pumpCard.className = `prep-card ${pumpIsMax ? 'hired-card' : ''}`;
        pumpCard.innerHTML = `
          <div class="prep-card-head">
            <span class="prep-icon">⛽</span>
            <div>
              <h4>${pumpUnlockUpg.name}</h4>
              <div class="lvl-pips"><span class="lvl-text">${
                hasHeavyPump
                  ? pumpIsMax
                    ? `✅ Postaveno: ${curLvl}/${maxLvl} + Stojan 4`
                    : `Postaveno: ${curLvl}/${maxLvl} + Stojan 4`
                  : pumpIsMax
                  ? `✅ Postaveno maximum (${curLvl}/${maxLvl})`
                  : `Postaveno: ${curLvl}/${maxLvl} stojanů`
              }</span></div>
            </div>
          </div>
          <p class="prep-desc">${pumpUnlockUpg.description}</p>
          ${
            !pumpIsMax
              ? `<button type="button" class="btn-buy" data-upgrade="pump_unlock" ${!canBuyPump ? 'disabled' : ''}>
                  Koupit ${curLvl + 1}. stojan (${buyPumpCost} Kč)
                </button>`
              : `<p class="obj-upg-note">✅ Všechny povolené stojany pro tuto benzínku (${maxLvl}) jsou postaveny!</p>`
          }
        `;
        const buyPumpBtn = pumpCard.querySelector('.btn-buy');
        if (buyPumpBtn && !pumpIsMax) {
          buyPumpBtn.addEventListener('click', () => this.buyUpgrade('pump_unlock'));
        }
        upgradesGrid.appendChild(pumpCard);
      }

      ['wash_unlock', 'rack_sweets_unlock', 'fridge_unlock', 'grill_unlock', 'rack_auto_unlock'].forEach((unlockId) => {
        const upg = this.data.UPGRADES.find((u) => u.id === unlockId);
        if (!upg) return;
        const capLvl = this.getUpgradeCap(upg.id);
        const isStageLocked = capLvl <= 1;
        const unlocked = !isStageLocked && (this.save.upgrades[upg.id] || 1) >= 2;
        const buyCost = upg.costs[0];
        const canBuy = !isStageLocked && !unlocked && this.save.coins >= buyCost;

        const card = document.createElement('div');
        card.className = `prep-card ${unlocked ? 'hired-card' : ''}`;
        card.innerHTML = `
          <div class="prep-card-head">
            <span class="prep-icon">${upg.icon}</span>
            <div>
              <h4>${upg.name}</h4>
              <div class="lvl-pips"><span class="lvl-text">${
                isStageLocked ? '🔒 Až u větší benzínky' : unlocked ? '✅ Postaveno v benzínce' : 'Zatím nekoupeno'
              }</span></div>
            </div>
          </div>
          <p class="prep-desc">${upg.description}</p>
          ${
            isStageLocked
              ? `<button type="button" class="btn-buy" disabled>🔒 Nedostupné v této benzínce</button>`
              : !unlocked
              ? `<button type="button" class="btn-buy" data-upgrade="${upg.id}" ${!canBuy ? 'disabled' : ''}>
                  Koupit (${buyCost} Kč)
                </button>`
              : `<p class="obj-upg-note">✅ Postaveno v benzínce! Vylepšení koupíš kliknutím přímo na objekt.</p>`
          }
        `;
        const buyBtn = card.querySelector('.btn-buy');
        if (buyBtn && !unlocked && !isStageLocked) {
          const startPlacement = Boolean(this.levelState && this.levelState.prepMode);
          buyBtn.addEventListener('click', () => this.buyUpgrade(upg.id, { startPlacement }));
        }
        upgradesGrid.appendChild(card);
      });

      const decorUpg = this.data.UPGRADES.find((u) => u.id === 'decor');
      if (decorUpg) {
        const capLvl = this.getUpgradeCap('decor');
        const curLvl = Math.min(capLvl, this.save.upgrades.decor || 1);
        const isMax = curLvl >= capLvl;
        const nextCost = isMax ? null : decorUpg.costs[curLvl - 1];
        const canAfford = nextCost !== null && this.save.coins >= nextCost;
        let pips = '';
        for (let i = 1; i <= capLvl; i++) {
          pips += `<span class="lvl-pip ${i <= curLvl ? 'filled' : ''}"></span>`;
        }
        const decorCard = document.createElement('div');
        decorCard.className = 'prep-card';
        decorCard.innerHTML = `
          <div class="prep-card-head">
            <span class="prep-icon">${decorUpg.icon}</span>
            <div>
              <h4>${decorUpg.name}</h4>
              <div class="lvl-pips">${pips} <span class="lvl-text">Úr. ${curLvl}/${capLvl}</span></div>
            </div>
          </div>
          <p class="prep-desc">${decorUpg.description}</p>
          <button type="button" class="btn-buy" data-upgrade="decor" ${isMax || !canAfford ? 'disabled' : ''}>
            ${isMax ? (capLvl < decorUpg.maxLevel ? '✨ Max v této benzínce' : '✨ Na maximu') : `Koupit / vylepšit (${nextCost} Kč)`}
          </button>
        `;
        const decorBtn = decorCard.querySelector('.btn-buy');
        if (decorBtn && !isMax) {
          decorBtn.addEventListener('click', () => this.buyUpgrade('decor'));
        }
        upgradesGrid.appendChild(decorCard);
      }

      const infoCard = document.createElement('div');
      infoCard.className = 'prep-card';
      infoCard.innerHTML = `
        <div class="prep-card-head">
          <span class="prep-icon">👆</span>
          <div>
            <h4>Samostatné upgrady v benzínce</h4>
          </div>
        </div>
        <p class="prep-desc">
          Kliknutím přímo na kávovar (☕), gril (🌭), mytí (🧽), limonády (🧃), regály (🛒), stojany (⛽), pokladnu (📠), svou postavičku nebo zaměstnance si zvlášť vybereš rychlost, kapacitu či zvýšení ceny!
        </p>
      `;
      upgradesGrid.appendChild(infoCard);
    }

    _syncPrepState() {
      this._syncStageLevels();
      this._applySavedLayout();
      this.updateGlobalHUD();
      if (this.levelState) {
        this.levelState.stageLimits = this.getCurrentStage().limits;
        const shoesLvl = this._getEffectiveUpgrade('shoes');
        const carryLvl = this._getEffectiveUpgrade('carry');
        const playerSpeed = 215 * (1 + (shoesLvl - 1) * 0.22);
        const maxCarry = 1 + carryLvl;
        const racksLvl = this._getEffectiveUpgrade('racks');
        const maxRackStock = 2 + racksLvl * 2;
        const prevById = {};
        (this.levelState.racks || []).forEach((r) => {
          prevById[r.id] = r;
        });
        const savedRacks = this.save.rackStock && typeof this.save.rackStock === 'object' ? this.save.rackStock : null;

        this.levelState.racks = Object.values(this.data.RACKS)
          .filter((r) => this._isRackUnlocked(r.id))
          .map((r) => {
            const prev = prevById[r.id];
            const hasSaved = Boolean(savedRacks && typeof savedRacks[r.id] === 'number');
            let stock;
            if (!hasSaved) {
              stock = maxRackStock;
            } else if (prev) {
              stock = Math.max(0, Math.min(maxRackStock, prev.stock));
            } else {
              stock = Math.max(0, Math.min(maxRackStock, savedRacks[r.id]));
            }
            return Object.assign({}, r, {
              stock,
              maxStock: maxRackStock
            });
          });

        this.levelState.workers.forEach((w) => {
          if (w.isPlayer) {
            w.speed = playerSpeed;
            w.maxCarry = maxCarry;
          } else {
            const staffCap = this.getStaffCap(w.id);
            const staffLvl = Math.min(staffCap, this.save.staff[w.id] || 0);
            const enabled = this.save.staffEnabled[w.id] !== false;
            w.level = staffLvl;
            w.speed = staffLvl <= 1 ? 82 : staffLvl === 2 ? 130 : 185;
            w.active = staffCap > 0 && (this.levelState.prepMode ? staffLvl > 0 : staffLvl > 0 && enabled);
          }
        });
      }

      const objModal = document.getElementById('object-upgrade-modal');
      if (objModal && !objModal.classList.contains('hidden') && this._activeObjectTarget) {
        this.openObjectUpgradeModal(this._activeObjectTarget);
      }
    }

    buyUpgrade(upgradeId, options) {
      const upg = this.data.UPGRADES.find((u) => u.id === upgradeId);
      if (!upg) return;
      const capLvl = this.getUpgradeCap(upgradeId);
      const curLvl = this.save.upgrades[upgradeId] || 1;
      if (curLvl >= capLvl) return;
      const cost = upg.costs[curLvl - 1];
      if (this.save.coins < cost) return;

      const PLACEABLE_UNLOCK_MAP = {
        rack_sweets_unlock: { kind: 'rack', id: 'rack_sweets' },
        rack_auto_unlock: { kind: 'rack', id: 'rack_auto' },
        fridge_unlock: { kind: 'station', id: 'fridge' },
        grill_unlock: { kind: 'station', id: 'grill' }
      };

      this.save.coins -= cost;
      this.save.upgrades[upgradeId] = curLvl + 1;

      const placedTarget = PLACEABLE_UNLOCK_MAP[upgradeId];
      if (placedTarget) {
        const layout = this._ensureLayout();
        const freeSpot = this._findFreeDefaultPlacement(placedTarget.kind, placedTarget.id);
        if (placedTarget.kind === 'rack') {
          layout.racks[placedTarget.id] = freeSpot;
        } else {
          layout.stations[placedTarget.id] = freeSpot;
        }
        this._applySavedLayout();
      }

      this.audio.playUpgrade();
      this.persistSave();
      this._syncPrepState();
      this.renderPrepModal();
      this.renderMap();

      if (placedTarget && options && options.startPlacement && this.levelState && this.levelState.prepMode) {
        this.closePrepModal();
        this.startPlacementMode(placedTarget.kind, placedTarget.id, true);
      }
    }

    hireOrUpgradeStaff(staffId) {
      const st = this.data.STAFF.find((s) => s.id === staffId);
      if (!st) return;
      const staffCap = this.getStaffCap(staffId);
      const curLvl = this.save.staff[staffId] || 0;
      if (curLvl >= staffCap) return;
      const cost = curLvl === 0 ? st.hireCost : st.upgradeCosts[curLvl - 1];
      if (this.save.coins < cost) return;

      this.save.coins -= cost;
      this.save.staff[staffId] = curLvl + 1;
      this.save.staffEnabled[staffId] = true;
      this.audio.playUpgrade();
      this.persistSave();
      this._syncPrepState();
      this.renderPrepModal();
      this.renderMap();
    }

    _syncRackStockToSave() {
      if (!this.levelState || !this.levelState.racks) return;
      if (!this.save.rackStock || typeof this.save.rackStock !== 'object') {
        this.save.rackStock = {};
      }
      this.levelState.racks.forEach((r) => {
        this.save.rackStock[r.id] = r.stock;
      });
    }

    _createLevelEntities(prepMode) {
      this._syncStageLevels();
      this._applySavedLayout();
      const shoesLvl = this._getEffectiveUpgrade('shoes');
      const carryLvl = this._getEffectiveUpgrade('carry');
      const playerSpeed = 215 * (1 + (shoesLvl - 1) * 0.22);
      const maxCarry = 1 + carryLvl;

      const racksLvl = this._getEffectiveUpgrade('racks');
      const maxRackStock = 2 + racksLvl * 2;
      const savedRacks = this.save.rackStock && typeof this.save.rackStock === 'object' ? this.save.rackStock : null;
      const racks = Object.values(this.data.RACKS)
        .filter((r) => this._isRackUnlocked(r.id))
        .map((r) => {
          const hasSaved = savedRacks && typeof savedRacks[r.id] === 'number';
          const initialStock = hasSaved ? Math.max(0, Math.min(maxRackStock, savedRacks[r.id])) : maxRackStock;
          return Object.assign({}, r, {
            stock: initialStock,
            maxStock: maxRackStock
          });
        });

      const player = {
        id: 'player',
        isPlayer: true,
        label: 'Ty (Obsluha)',
        x: 665,
        y: 412,
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
        tonik: { x: 210, y: 395 },
        anicka: { x: 1138, y: 262 },
        kuba: { x: 1272, y: 412 }
      };

      this.data.STAFF.forEach((st, idx) => {
        const staffCap = this.getStaffCap(st.id);
        const staffLvl = Math.min(staffCap, this.save.staff[st.id] || 0);
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
          homeX: startPos.x,
          homeY: startPos.y,
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
          active: staffCap > 0 && (prepMode ? staffLvl > 0 : staffLvl > 0 && enabled),
          seed: idx + 1.7
        });
      });

      return { racks, workers, player };
    }

    _startLoop() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.lastFrameTime = performance.now();
      const loop = (now) => {
        const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
        this.lastFrameTime = now;
        if (this.screen === 'game' && this.levelState) {
          if (this.levelState.prepMode) {
            this.levelState.time += dt;
            this._updateParticles(dt);
          } else if (!this.paused && !this.levelState.ended) {
            this._updateLevel(dt);
          }
          this.renderer.render(this.levelState);
          this.rafId = requestAnimationFrame(loop);
        }
      };
      this.rafId = requestAnimationFrame(loop);
    }

    enterPrepMode(levelId) {
      this._syncStageLevels();
      const curStage = this.getCurrentStage();
      const level = this.data.LEVELS.find((l) => l.id === levelId) || this.data.LEVELS[0];
      this.selectedLevelId = level.id;
      this.screen = 'game';
      this.paused = false;

      this.closePrepModal();
      this.closeObjectUpgradeModal();
      document.getElementById('map-screen').classList.add('hidden');
      document.getElementById('game-screen').classList.remove('hidden');
      document.getElementById('prep-topbar').classList.remove('hidden');
      document.getElementById('shift-topbar').classList.add('hidden');

      document.getElementById('prep-bar-title').textContent = `${curStage.name} · ${level.name}`;
      document.getElementById('prep-bar-sub').textContent =
        `Zákazníků: ${level.customers} · Cíl: ⭐ ${level.stars[0]} Kč · ⭐⭐ ${level.stars[1]} Kč · ⭐⭐⭐ ${level.stars[2]} Kč`;
      document.getElementById('game-tip-bar').innerHTML =
        '🛠️ <strong>Příprava benzínky:</strong> Klikni přímo na stojan, regál, kávovar, gril, pokladnu, svou postavičku nebo zaměstnance pro vylepšení. Nové stojany a zaměstnance koupíš přes <strong>🛒 Nakupovat</strong>, pak stiskni <strong>▶️ Start hry</strong>!';

      const { racks, workers, player } = this._createLevelEntities(true);

      this.levelState = {
        level,
        stageId: curStage.id,
        stageLimits: curStage.limits,
        save: this.save,
        prepMode: true,
        placementMode: null,
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

      this.updateGlobalHUD();
      this._startLoop();
    }

    startLevel(levelId) {
      this._syncStageLevels();
      const curStage = this.getCurrentStage();
      const level = this.data.LEVELS.find((l) => l.id === levelId) || this.data.LEVELS[0];
      this.selectedLevelId = level.id;
      this.screen = 'game';
      this.paused = false;

      this._finishActivePlacement();
      this.closePrepModal();
      this.closeObjectUpgradeModal();
      document.getElementById('map-screen').classList.add('hidden');
      document.getElementById('game-screen').classList.remove('hidden');
      document.getElementById('prep-topbar').classList.add('hidden');
      document.getElementById('shift-topbar').classList.remove('hidden');
      document.getElementById('pause-btn').textContent = '⏸️ Pauza';
      document.getElementById('game-tip-bar').innerHTML =
        '💡 <strong>Tip:</strong> Klikej na předměty (☕ kávovar, 🌭 gril, 🧃 limonády, 📦 sklad, 🥨 stojany v obchodě, 🧽 mytí, ⛽ stojany, 📠 pokladnu) nebo přímo na zákazníky a auta — postava si sama dojde pro suroviny i doplní regály!';

      const { racks, workers, player } = this._createLevelEntities(false);

      this.levelState = {
        level,
        stageId: curStage.id,
        stageLimits: curStage.limits,
        save: this.save,
        prepMode: false,
        placementMode: null,
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
      this._startLoop();
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
      this._finishActivePlacement();
      this.closePrepModal();
      this.closeObjectUpgradeModal();
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

      if (state.prepMode) {
        if (state.placementMode) return null;
        // 1. Workers (player & hired employees)
        for (let i = state.workers.length - 1; i >= 0; i--) {
          const w = state.workers[i];
          if (!w.active) continue;
          if (Math.abs(x - w.x) <= 30 && y >= w.y - 58 && y <= w.y + 38) {
            if (w.isPlayer) {
              return {
                kind: 'prep_target',
                id: 'player',
                targetType: 'upgrade',
                upgradeIds: ['shoes', 'carry'],
                icon: '👟',
                title: 'Obsluha – Vylepšení postavy',
                desc: 'Samostatně zlepši rychlost chůze nebo počet věcí, které uneseš:',
                hint: '👟 Klikni pro vylepšení rychlosti a nosnosti obsluhy'
              };
            }
            return {
              kind: 'prep_target',
              id: w.id,
              targetType: 'staff',
              staffId: w.id,
              hint: `🧑‍🔧 Klikni pro vylepšení zaměstnance (${w.label})`
            };
          }
        }

        // 2. Display Stands (Racks)
        for (const rack of state.racks) {
          const isVert = (rack.rot || 0) % 2 === 1;
          const hw = isVert ? 32 : rack.radius + 6;
          const hhTop = isVert ? 54 : 74;
          const hhBot = isVert ? 54 : rack.radius;
          if (Math.abs(x - rack.x) <= hw && y >= rack.y - hhTop && y <= rack.y + hhBot) {
            return {
              kind: 'prep_target',
              id: rack.id,
              targetType: 'upgrade',
              upgradeIds: ['racks', 'racks_price'],
              placementKind: 'rack',
              placementId: rack.id,
              icon: '🛒',
              title: 'Prodejní regály',
              desc: 'Samostatně rozšiř kapacitu regálů, zvedni cenu zboží nebo regál přesuň a otoč:',
              hint: `🛒 Klikni pro vylepšení a přesun (${rack.label})`
            };
          }
        }

        // 3. Stations
        const stationUpgradeMap = {
          pump_0: {
            upgradeIds: ['pumps', 'pumps_price'],
            icon: '⛽',
            title: 'Tankovací stojany',
            desc: 'Zrychli tankování paliva nebo navyš jeho prodejní cenu:',
            hint: '⛽ Klikni pro vylepšení rychlosti a ceny paliva'
          },
          pump_1: {
            upgradeIds: ['pumps', 'pumps_price'],
            icon: '⛽',
            title: 'Tankovací stojany',
            desc: 'Zrychli tankování paliva nebo navyš jeho prodejní cenu:',
            hint: '⛽ Klikni pro vylepšení rychlosti a ceny paliva'
          },
          pump_2: {
            upgradeIds: ['pumps', 'pumps_price'],
            icon: '⛽',
            title: 'Tankovací stojany',
            desc: 'Zrychli tankování paliva nebo navyš jeho prodejní cenu:',
            hint: '⛽ Klikni pro vylepšení rychlosti a ceny paliva'
          },
          pump_3: {
            upgradeIds: ['pumps', 'pumps_price'],
            icon: '🚛',
            title: 'Stojan 4',
            desc: 'Zrychli tankování paliva nebo navyš jeho prodejní cenu pro všechny stojany:',
            hint: '🚛 Klikni pro vylepšení rychlosti a ceny paliva (Stojan 4)'
          },
          coffee: {
            upgradeIds: ['coffee', 'coffee_price'],
            placementKind: 'station',
            icon: '☕',
            title: 'Kávovar',
            desc: 'Zrychli vaření kávy, navyš její cenu nebo posuň kávovar po pultu:',
            hint: '☕ Klikni pro vylepšení a přesun kávovaru'
          },
          grill: {
            upgradeIds: ['grill', 'grill_price'],
            placementKind: 'station',
            icon: '🌭',
            title: 'Gril & Pečivo',
            desc: 'Zrychli přípravu párků a pečiva, navyš cenu nebo posuň gril po pultu:',
            hint: '🌭 Klikni pro vylepšení a přesun grilu a pečiva'
          },
          bucket: {
            upgradeIds: ['wash', 'wash_price'],
            icon: '🧽',
            title: 'Mytí oken',
            desc: 'Zrychli mytí čelních skel nebo navyš odměnu:',
            hint: '🧽 Klikni pro vylepšení mytí oken'
          },
          fridge: {
            upgradeIds: ['drink_speed', 'drink_price'],
            placementKind: 'station',
            icon: '🧃',
            title: 'Chladnička s limonádou',
            desc: 'Zrychli čepování limonád, navyš cenu nebo posuň chladničku po pultu:',
            hint: '🧃 Klikni pro vylepšení a přesun limonád'
          },
          storage: {
            upgradeIds: ['racks', 'racks_price'],
            icon: '📦',
            title: 'Prodejní regály',
            desc: 'Samostatně rozšiř kapacitu regálů nebo zvedni cenu zboží:',
            hint: '📦 Klikni pro vylepšení regálů'
          },
          register: {
            upgradeIds: ['decor', 'decor_tips'],
            icon: '🌸',
            title: 'Pokladna & Výzdoba',
            desc: 'Zvyš trpělivost zákazníků nebo spropitné za obsluhu:',
            hint: '🌸 Klikni pro vylepšení trpělivosti a spropitného'
          },
          broom: {
            upgradeIds: ['decor', 'decor_tips'],
            icon: '🌸',
            title: 'Pokladna & Výzdoba',
            desc: 'Zvyš trpělivost zákazníků nebo spropitné za obsluhu:',
            hint: '🌸 Klikni pro vylepšení trpělivosti a spropitného'
          }
        };
        for (const st of Object.values(this.data.STATIONS)) {
          if (!this._isStationUnlocked(st.id)) continue;
          const mapped = stationUpgradeMap[st.id];
          if (!mapped) continue;
          const dist = Math.hypot(x - st.x, y - st.y);
          if (dist <= st.radius || (Math.abs(x - st.x) <= 36 && y >= st.y - 64 && y <= st.y + st.radius)) {
            return {
              kind: 'prep_target',
              id: st.id,
              targetType: 'upgrade',
              upgradeIds: mapped.upgradeIds,
              placementKind: mapped.placementKind || null,
              placementId: mapped.placementKind ? st.id : null,
              icon: mapped.icon,
              title: mapped.title,
              desc: mapped.desc,
              hint: mapped.hint
            };
          }
        }

        return null;
      }

      // 1. Cars (waiting at pumps)
      for (let i = state.cars.length - 1; i >= 0; i--) {
        const car = state.cars[i];
        if (car.state === 'waiting') {
          const halfW = car.isHeavy ? 76 : 64;
          if (Math.abs(x - car.x) <= halfW && y >= car.y - 88 && y <= car.y + 34) {
            return {
              kind: 'car',
              id: car.id,
              obj: car,
              hint:
                car.pumpIndex === 3
                  ? `🚛 Velké vozidlo u Stojanu 4 (${this._describeOrders(car.orders)})`
                  : `🚗 Auto u stojanu ${car.pumpIndex + 1} (${this._describeOrders(car.orders)})`
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
          return { kind: 'spill', id: spill.id, obj: spill, hint: '🧹 Uklidit louži (+2 Kč)' };
        }
      }

      // 4. Restockable Display Stands (Racks)
      for (const rack of state.racks) {
        const isVert = (rack.rot || 0) % 2 === 1;
        const hw = isVert ? 32 : rack.radius + 6;
        const hh = isVert ? 48 : rack.radius;
        if (Math.abs(x - rack.x) <= hw && Math.abs(y - rack.y) <= hh) {
          const hint =
            rack.stock === 0
              ? `⚠️ ${rack.label} je prázdný! Klikni pro doplnění 📦`
              : `${rack.icon} ${rack.label} (${rack.stock}/${rack.maxStock}) – klikni pro doplnění`;
          return { kind: 'rack', id: rack.id, obj: rack, hint };
        }
      }

      // 5. Stations
      for (const st of Object.values(this.data.STATIONS)) {
        if (!this._isStationUnlocked(st.id)) continue;
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
      if (x > 1310 && y <= 478) return 'storage';
      if (x >= 620 && x <= 1310 && y <= 582) {
        return y < 328 ? 'behind_counter' : 'shop_floor';
      }
      return 'outside';
    }

    _clampWalkTarget(rawX, rawY) {
      let x = Math.max(35, Math.min(1505, rawX));
      let y = Math.max(245, Math.min(592, rawY));

      // Keep clear of exterior left shop wall (x: 604..634, y < 584)
      if (x >= 604 && x < 634 && y < 584) {
        x = x < 619 ? 585 : 644;
      }

      // Keep clear of dividing wall between Main Shop and Storage Room (x: 1296..1326)
      if (x >= 1296 && x <= 1326 && y <= 482) {
        x = x < 1310 ? 1280 : 1345;
      }

      // Keep clear of Storage Room bottom exterior wall (y: 462..496, x >= 1310)
      if (x >= 1310 && y > 462 && y < 496) {
        y = y < 478 ? 454 : 506;
      }

      // Storage room bounds
      if (x > 1310 && y <= 478) {
        x = Math.max(1340, Math.min(1492, x));
        y = Math.max(255, Math.min(454, y));
      }

      // Main shop interior bounds
      if (x >= 620 && x <= 1310 && y <= 582) {
        y = Math.max(245, y);
        // Service counter rectangle (x: 698..1240, y: 298..356); left x=665 & right x=1272 are open
        if (x >= 698 && x <= 1240 && y >= 298 && y <= 356) {
          y = y < 328 ? 278 : 382;
        }
        // Display stands (dynamic positions & 4-dir rotations)
        const activeRacks =
          this.levelState && this.levelState.racks
            ? this.levelState.racks
            : Object.values(this.data.RACKS).filter((r) => this._isRackUnlocked(r.id));
        activeRacks.forEach((r) => {
          const isVert = (r.rot || 0) % 2 === 1;
          const hw = isVert ? 30 : 48;
          const hh = isVert ? 48 : 30;
          if (x >= r.x - hw && x <= r.x + hw && y >= r.y - hh && y <= r.y + hh) {
            const dxLeft = Math.abs(x - (r.x - hw));
            const dxRight = Math.abs(r.x + hw - x);
            const dyTop = Math.abs(y - (r.y - hh));
            const dyBot = Math.abs(r.y + hh - y);
            const minD = Math.min(dxLeft, dxRight, dyTop, dyBot);
            if (minD === dyTop) y = r.y - hh - 4;
            else if (minD === dyBot) y = r.y + hh + 4;
            else if (minD === dxLeft) x = r.x - hw - 4;
            else x = r.x + hw + 4;
          }
        });
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
        if ((sx < 620 && sy < 582 && ex >= 615) || (ex < 620 && ey < 582 && sx >= 615)) {
          pushPt(PATH_WAYPOINTS.CORNER_SW.x, PATH_WAYPOINTS.CORNER_SW.y);
        }
        if ((sx > 1310 && sy < 582 && ex < 1310) || (ex > 1310 && ey < 582 && sx < 1310)) {
          pushPt(1322, 592);
        }
        pushPt(ex, ey);
      };

      const routeShopFloor = (sx, sy, ex, ey) => {
        const activeRacks =
          this.levelState && this.levelState.racks
            ? this.levelState.racks
            : Object.values(this.data.RACKS).filter((r) => this._isRackUnlocked(r.id));
        const boxes = activeRacks.map((r) => {
          const isVert = (r.rot || 0) % 2 === 1;
          const hw = isVert ? 26 : 42;
          const hh = isVert ? 42 : 26;
          return { x1: r.x - hw - 10, y1: r.y - hh - 10, x2: r.x + hw + 10, y2: r.y + hh + 10 };
        });
        const segHitsBox = (x1, y1, x2, y2) => {
          for (let i = 0; i < boxes.length; i++) {
            const b = boxes[i];
            const steps = 16;
            for (let s = 1; s < steps; s++) {
              const p = s / steps;
              const px = x1 + (x2 - x1) * p;
              const py = y1 + (y2 - y1) * p;
              if (px > b.x1 && px < b.x2 && py > b.y1 && py < b.y2) return true;
            }
          }
          return false;
        };
        const isPathClear = (wps) => {
          let px = sx;
          let py = sy;
          for (let i = 0; i < wps.length; i++) {
            const wp = wps[i];
            if (segHitsBox(px, py, wp.x, wp.y)) return false;
            px = wp.x;
            py = wp.y;
          }
          return !segHitsBox(px, py, ex, ey);
        };

        if (!segHitsBox(sx, sy, ex, ey)) {
          pushPt(ex, ey);
          return;
        }

        const minRackTop = boxes.length > 0 ? Math.min(...boxes.map((b) => b.y1)) : 432;
        const maxRackBot = boxes.length > 0 ? Math.max(...boxes.map((b) => b.y2)) : 548;
        const topY = Math.max(380, Math.min(432, minRackTop - 8));
        const botY = Math.min(568, Math.max(548, maxRackBot + 8));
        const candidateXs = [665, 715, 790, 845, 890, 945, 990, 1045, 1090, 1155, 1272];

        let bestWaypoints = null;
        let bestCost = Infinity;
        const evalCandidate = (wps) => {
          if (!isPathClear(wps)) return;
          let cost = 0;
          let px = sx;
          let py = sy;
          wps.forEach((wp) => {
            cost += Math.hypot(wp.x - px, wp.y - py);
            px = wp.x;
            py = wp.y;
          });
          cost += Math.hypot(ex - px, ey - py);
          if (cost < bestCost) {
            bestCost = cost;
            bestWaypoints = wps;
          }
        };

        evalCandidate([{ x: sx, y: topY }, { x: ex, y: topY }]);
        evalCandidate([{ x: sx, y: botY }, { x: ex, y: botY }]);
        candidateXs.forEach((ax) => {
          evalCandidate([{ x: ax, y: sy }, { x: ax, y: ey }]);
          evalCandidate([{ x: ax, y: topY }]);
          evalCandidate([{ x: ax, y: botY }]);
          evalCandidate([{ x: sx, y: topY }, { x: ax, y: topY }, { x: ax, y: ey }]);
          evalCandidate([{ x: sx, y: botY }, { x: ax, y: botY }, { x: ax, y: ey }]);
          evalCandidate([{ x: ax, y: sy }, { x: ax, y: topY }, { x: ex, y: topY }]);
          evalCandidate([{ x: ax, y: sy }, { x: ax, y: botY }, { x: ex, y: botY }]);
        });

        if (bestWaypoints) {
          bestWaypoints.forEach((wp) => pushPt(wp.x, wp.y));
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
        const leftCost = Math.abs(sx - 665) + Math.abs(ex - 665);
        const rightCost = Math.abs(sx - 1272) + Math.abs(ex - 1272);
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
      if (this.levelState.prepMode && this.levelState.placementMode) {
        const pm = this.levelState.placementMode;
        if (pm.kind === 'station') {
          pm.y = 185;
          pm.x = Math.round(Math.max(680, Math.min(1135, pt.x)));
          pm.inBounds = pt.x >= 600 && pt.x <= 1315 && pt.y >= 110 && pt.y <= 350;
          pm.valid = pm.inBounds && this._isPlacementValid('station', pm.id, pm.x, pm.y, 0);
        } else if (pm.kind === 'rack') {
          pm.x = Math.round(Math.max(725, Math.min(1225, pt.x)));
          pm.y = Math.round(Math.max(440, Math.min(520, pt.y)));
          pm.inBounds = pt.x >= 620 && pt.x <= 1310 && pt.y >= 340 && pt.y <= 585;
          pm.valid = pm.inBounds && this._isPlacementValid('rack', pm.id, pm.x, pm.y, pm.rot);
        }
        this._applyPlacementPreview(pm);
        this.levelState.hoveredTarget = null;
        this.canvas.style.cursor = pm.valid ? 'grabbing' : 'not-allowed';
        return;
      }
      this.levelState.hoveredTarget = this._hitTest(pt.x, pt.y);
      this.canvas.style.cursor = this.levelState.hoveredTarget ? 'pointer' : 'default';
    }

    _onCanvasClick(e) {
      if (!this.levelState || this.paused || this.levelState.ended) return;
      this.audio.init();
      const pt = this._getCanvasPoint(e);
      if (this.levelState.prepMode) {
        if (this.levelState.placementMode) {
          this.confirmPlacementMode(false);
          return;
        }
        const hit = this._hitTest(pt.x, pt.y);
        if (hit && hit.kind === 'prep_target') {
          this.audio.playClick();
          this.openObjectUpgradeModal(hit);
        }
        return;
      }
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
        this._queueSpillClick(player, hit.obj);
      }
    }

    _getPlannedInventory(player) {
      const inv = [...player.held];
      const checkTask = (task) => {
        if (!task) return;
        if (task.type === 'prep' && task.itemId) inv.push(task.itemId);
        if (task.type === 'takeBroom') inv.push('broom');
        if (task.type === 'returnBroom') {
          const idx = inv.indexOf('broom');
          if (idx !== -1) inv.splice(idx, 1);
        }
        if (task.type === 'serveCar' || task.type === 'serveCustomer') {
          const ids =
            Array.isArray(task.itemIds) && task.itemIds.length > 0
              ? task.itemIds
              : task.itemId
              ? [task.itemId]
              : [];
          ids.forEach((id) => {
            const idx = inv.indexOf(id);
            if (idx !== -1) inv.splice(idx, 1);
          });
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

    _queueSpillClick(player, spill) {
      const broom = this.data.STATIONS.broom;
      const endsWithReturnBroom =
        player.taskQueue.length > 0 &&
        player.taskQueue[player.taskQueue.length - 1].type === 'returnBroom';
      if (endsWithReturnBroom) {
        const returnTask = player.taskQueue.pop();
        player.taskQueue.push({
          type: 'cleanSpill',
          spillId: spill.id,
          x: spill.x,
          y: spill.y - 8
        });
        player.taskQueue.push(returnTask);
        return;
      }

      const plannedInv = this._getPlannedInventory(player);
      if (plannedInv.includes('broom')) {
        player.taskQueue.push({
          type: 'cleanSpill',
          spillId: spill.id,
          x: spill.x,
          y: spill.y - 8
        });
        player.taskQueue.push({
          type: 'returnBroom',
          x: broom.walkX,
          y: broom.walkY
        });
      } else if (!this.settings.smartAssist) {
        this._spawnParticle(player.x, player.y - 45, 'Vezmi nejprve 🧹 koště v úklidu!', '#d95d4a');
      } else if (plannedInv.length < player.maxCarry) {
        player.taskQueue.push({
          type: 'takeBroom',
          x: broom.walkX,
          y: broom.walkY
        });
        player.taskQueue.push({
          type: 'cleanSpill',
          spillId: spill.id,
          x: spill.x,
          y: spill.y - 8
        });
        player.taskQueue.push({
          type: 'returnBroom',
          x: broom.walkX,
          y: broom.walkY
        });
      } else {
        this._spawnParticle(player.x, player.y - 45, 'Plný tác!', '#d95d4a');
      }
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
        const plannedInv = this._getPlannedInventory(player);
        if (plannedInv.includes('broom')) {
          player.taskQueue.push({ type: 'returnBroom', x: st.walkX, y: st.walkY });
        } else if (this.levelState.spills.length > 0 && this.settings.smartAssist) {
          this._queueSpillClick(player, this.levelState.spills[0]);
        } else if (plannedInv.length < player.maxCarry) {
          player.taskQueue.push({ type: 'takeBroom', x: st.walkX, y: st.walkY });
        } else {
          this._spawnParticle(player.x, player.y - 45, 'Plný tác!', '#d95d4a');
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
      const availInv = [...plannedInv];
      const matchingOrders = [];
      undone.forEach((o) => {
        const idx = availInv.indexOf(o.itemId);
        if (idx !== -1) {
          availInv.splice(idx, 1);
          matchingOrders.push(o);
        }
      });
      if (matchingOrders.length > 0) {
        player.taskQueue.push({
          type: 'serveCustomer',
          custId: cust.id,
          itemId: matchingOrders[0].itemId,
          itemIds: matchingOrders.map((o) => o.itemId),
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
      if (itemId === 'fuel') upgLevel = this._getEffectiveUpgrade('pumps');
      else if (itemId === 'coffee') upgLevel = this._getEffectiveUpgrade('coffee');
      else if (itemId === 'snack') upgLevel = this._getEffectiveUpgrade('grill');
      else if (itemId === 'wash') upgLevel = this._getEffectiveUpgrade('wash');
      else if (itemId === 'drink') upgLevel = this._getEffectiveUpgrade('drink_speed');
      else if (itemId === 'crate') upgLevel = this._getEffectiveUpgrade('racks');

      const upgFactor = 1 + (upgLevel - 1) * 0.3;
      const staffFactor = this._getStaffSpeedMultiplier(worker);
      return Math.max(0.45, base / (upgFactor * staffFactor));
    }

    _getItemPrice(itemId) {
      const item = this.data.ITEMS[itemId];
      let bonus = 0;
      if (itemId === 'coffee') bonus = (this._getEffectiveUpgrade('coffee_price') - 1) * 1;
      else if (itemId === 'snack') bonus = (this._getEffectiveUpgrade('grill_price') - 1) * 1;
      else if (itemId === 'wash') bonus = (this._getEffectiveUpgrade('wash_price') - 1) * 1;
      else if (itemId === 'drink') bonus = (this._getEffectiveUpgrade('drink_price') - 1) * 1;
      else if (itemId === 'fuel') bonus = (this._getEffectiveUpgrade('pumps_price') - 1) * 1;
      else if (item.isRackItem) bonus = (this._getEffectiveUpgrade('racks_price') - 1) * 1;
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
      this._updateParticles(dt);
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
      const stage = this.getCurrentStage();
      const stageMaxPumps = (stage.limits && stage.limits.maxPumps) || 3;
      const maxPumps = Math.min(stageMaxPumps, Math.max(1, this.save.upgrades.pump_unlock || 1));

      const freeNormalPumps = [];
      for (let i = 0; i < maxPumps; i++) {
        if (!state.cars.some((c) => c.pumpIndex === i)) freeNormalPumps.push(i);
      }
      const hasHeavyPump = Boolean(stage.limits && stage.limits.hasHeavyPump);
      const heavyPumpFree = hasHeavyPump && !state.cars.some((c) => c.pumpIndex === 3);
      const anyPumpFree = freeNormalPumps.length > 0 || heavyPumpFree;

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

      if (!anyPumpFree && freeSpots.length === 0) return false;

      let spawnCar = Math.random() < lvl.carChance;
      if (spawnCar && !anyPumpFree) spawnCar = false;
      if (!spawnCar && freeSpots.length === 0) spawnCar = true;

      const decorBonus = 1 + (this._getEffectiveUpgrade('decor') - 1) * 0.25;
      const maxPatience = lvl.patienceBase * decorBonus;

      if (spawnCar) {
        let wantBus = hasHeavyPump && stage.busChance > 0 && Math.random() < stage.busChance;
        let wantTruck = !wantBus && hasHeavyPump && stage.truckChance > 0 && Math.random() < stage.truckChance;
        let isHeavy = wantBus || wantTruck;
        if (isHeavy && !heavyPumpFree) {
          isHeavy = false;
          wantBus = false;
          wantTruck = false;
        } else if (!isHeavy && freeNormalPumps.length === 0 && heavyPumpFree) {
          const bChance = stage.busChance || 0;
          const tChance = stage.truckChance || 0;
          if (bChance > 0 && Math.random() < bChance / Math.max(0.01, bChance + tChance)) {
            wantBus = true;
          } else {
            wantTruck = true;
          }
          isHeavy = true;
        }

        const pumpIndex = isHeavy ? 3 : freeNormalPumps[Math.floor(Math.random() * freeNormalPumps.length)];
        const pump = this.data.STATIONS[`pump_${pumpIndex}`];
        let variant;
        let color;
        let roofColor;
        if (wantBus) {
          variant = 'bus';
          color = '#e09f3e';
          roofColor = '#fff3d6';
        } else if (wantTruck) {
          variant = 'truck';
          color = '#4e79a7';
          roofColor = '#e6eef8';
        } else {
          const palette = CAR_PALETTES[Math.floor(Math.random() * CAR_PALETTES.length)];
          variant = palette.variant;
          color = palette.color;
          roofColor = palette.roofColor;
        }

        const carAllowed = lvl.orders.filter((o) => (o === 'fuel' || o === 'wash') && this._isItemUnlocked(o));
        const orders = [{ itemId: 'fuel', done: false }];
        if (carAllowed.length > 1 && Math.random() < lvl.multiChance) {
          orders.push({ itemId: 'wash', done: false });
        }

        state.cars.push({
          id: state.nextEntityId++,
          pumpIndex,
          x: -90,
          y: 648,
          targetX: pump.carX,
          targetY: pump.carY,
          state: 'arriving',
          orders,
          patience: maxPatience,
          maxPatience,
          color,
          roofColor,
          variant,
          isHeavy
        });
      } else {
        const spotIndex = freeSpots[Math.floor(Math.random() * freeSpots.length)];
        const bistroAllowed = lvl.orders.filter(
          (o) =>
            this.data.ITEMS[o] &&
            !this.data.ITEMS[o].isRackItem &&
            o !== 'fuel' &&
            o !== 'wash' &&
            this._isItemUnlocked(o)
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
          (o) => this.data.ITEMS[o] && this.data.ITEMS[o].isRackItem && this._isItemUnlocked(o)
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
          x: 715,
          y: 650,
          targetX: 715,
          targetY: 558,
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
          x: inShop ? 700 + Math.random() * 540 : 90 + Math.random() * 430,
          y: inShop ? 412 + Math.random() * 28 : 360 + Math.random() * 45
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
        const isVert = (rack.rot || 0) % 2 === 1;
        const tx = isVert ? rack.custX : rack.custX + offset;
        const ty = isVert ? rack.custY + offset : rack.custY;
        this._setCustomerTarget(cust, tx, ty);
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
            if (!w.isPlayer && w.taskQueue.length === 0) {
              this._runStaffAI();
            }
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
            if (w.taskQueue.length === 0) this._runStaffAI();
            return;
          }
        } else if (task.type === 'serveCar') {
          const car = this.levelState.cars.find((c) => c.id === task.carId && c.state === 'waiting');
          const stillNeeds = car && car.orders.some((o) => o.itemId === task.itemId && !o.done);
          if (!stillNeeds || !w.held.includes(task.itemId)) {
            w.currentTask = null;
            w.waypoints = [];
            w.moving = false;
            if (w.taskQueue.length === 0) this._runStaffAI();
            return;
          }
        } else if (task.type === 'cleanSpill') {
          const sp = this.levelState.spills.find((s) => s.id === task.spillId);
          if (!sp) {
            w.currentTask = null;
            w.waypoints = [];
            w.moving = false;
            if (w.taskQueue.length === 0) this._runStaffAI();
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

      if (task.type === 'walk' || task.type === 'returnHome') {
        w.currentTask = null;
      } else if (task.type === 'prep') {
        if (w.held.length >= w.maxCarry) {
          if (w.isPlayer) this._spawnParticle(w.x, w.y - 44, 'Plný tác!', '#d95d4a');
          w.currentTask = null;
        } else {
          w.actionDuration = this._getPrepDuration(task.itemId, w);
          w.actionTimer = w.actionDuration;
        }
      } else if (task.type === 'restockRack') {
        const rack = this.levelState.racks.find((r) => r.id === task.rackId);
        if (!rack || !w.held.includes('crate') || (!w.isPlayer && rack.stock >= rack.maxStock / 2)) {
          w.currentTask = null;
        } else {
          w.actionDuration = w.isPlayer ? 0.85 : Math.max(0.45, 0.85 / this._getStaffSpeedMultiplier(w));
          w.actionTimer = w.actionDuration;
        }
      } else if (task.type === 'fuelCar') {
        const car = this.levelState.cars.find((c) => c.id === task.carId && c.state === 'waiting');
        if (!car || !car.orders.some((o) => o.itemId === 'fuel' && !o.done)) {
          w.currentTask = null;
        } else {
          const baseFuelDur = this._getPrepDuration('fuel', w);
          w.actionDuration = car.isHeavy ? baseFuelDur * 1.45 : baseFuelDur;
          w.actionTimer = w.actionDuration;
        }
      } else if (task.type === 'serveCar') {
        const car = this.levelState.cars.find((c) => c.id === task.carId && c.state === 'waiting');
        const heldIdx = w.held.indexOf(task.itemId);
        if (!car || heldIdx === -1) {
          w.currentTask = null;
        } else {
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
        }
      } else if (task.type === 'serveCustomer') {
        const cust = this.levelState.customers.find((c) => c.id === task.custId);
        const hasAnyNeeded = Boolean(cust && cust.orders.some((o) => !o.done && w.held.includes(o.itemId)));
        if (!cust || !hasAnyNeeded || cust.state === 'leaving' || cust.state === 'paying') {
          w.currentTask = null;
        } else {
          if (cust.state !== 'waiting') {
            // Customer is still browsing a shelf or walking up to the counter; wait gently at their counter spot
            return;
          }
          const deliveredIcons = [];
          cust.orders.forEach((ord) => {
            if (ord.done) return;
            const idx = w.held.indexOf(ord.itemId);
            if (idx !== -1) {
              ord.done = true;
              w.held.splice(idx, 1);
              const itemDef = this.data.ITEMS[ord.itemId];
              if (itemDef && itemDef.icon) deliveredIcons.push(itemDef.icon);
            }
          });
          if (deliveredIcons.length > 0) {
            this.audio.playClick();
            this._spawnParticle(cust.x, cust.y - 45, `${deliveredIcons.join(' ')} ✓`, '#4f9d69');
            w.taskQueue = w.taskQueue.filter(
              (t) =>
                !(
                  t.type === 'serveCustomer' &&
                  t.custId === cust.id &&
                  cust.orders.every((o) => o.done || !w.held.includes(o.itemId))
                )
            );
            this._assignNextCustomerTarget(cust);
          }
          w.currentTask = null;
        }
      } else if (task.type === 'register') {
        const paying = this.levelState.customers.filter((c) => c.state === 'paying');
        if (paying.length === 0) {
          w.currentTask = null;
        } else {
          const arrivedPaying = paying.filter((c) => !c.waypoints || c.waypoints.length === 0);
          if (arrivedPaying.length === 0) {
            return;
          }
          w.actionDuration = w.isPlayer ? 0.65 : Math.max(0.35, 0.65 / this._getStaffSpeedMultiplier(w));
          w.actionTimer = w.actionDuration;
        }
      } else if (task.type === 'takeBroom') {
        if (!w.held.includes('broom') && w.held.length < w.maxCarry) {
          w.held.push('broom');
          this.audio.playClick();
          this._spawnParticle(w.x, w.y - 36, '🧹', '#4e3629');
        }
        w.currentTask = null;
      } else if (task.type === 'returnBroom') {
        const broomIdx = w.held.indexOf('broom');
        if (broomIdx !== -1) {
          w.held.splice(broomIdx, 1);
          this.audio.playClick();
          this._spawnParticle(w.x, w.y - 36, '🧹 Vráceno', '#6ba368');
        }
        w.currentTask = null;
      } else if (task.type === 'cleanSpill') {
        const sp = this.levelState.spills.find((s) => s.id === task.spillId);
        if (!sp || !w.held.includes('broom')) {
          w.currentTask = null;
        } else {
          w.actionDuration = w.isPlayer ? 1.1 : Math.max(0.55, 1.1 / this._getStaffSpeedMultiplier(w));
          w.actionTimer = w.actionDuration;
        }
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

      if (!w.isPlayer && !w.currentTask && w.taskQueue.length === 0) {
        this._runStaffAI();
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
          this._syncRackStockToSave();
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
            this._setCustomerTarget(cust, car ? car.x + 24 : -40, car ? car.y + 18 : 648);
          } else {
            cust.state = 'leaving';
            this._setCustomerTarget(cust, 715, 650);
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
          this.levelState.earnedCoins += 2;
          this.audio.playWash();
          this._spawnParticle(sp.x, sp.y - 20, '+2 Kč ✨', '#4f9d69');
        }
      }
    }

    _calcPayment(orders, patienceRatio) {
      let base = 0;
      orders.forEach((o) => {
        base += this._getItemPrice(o.itemId);
      });
      const tipsLvl = this._getEffectiveUpgrade('decor_tips');
      const tipBonus = 1 + (tipsLvl - 1) * 0.15;
      const tip = Math.round(base * 0.15 * Math.max(0, patienceRatio) * tipBonus);
      return base + tip;
    }

    _checkCarDone(car) {
      if (car.orders.every((o) => o.done) && car.state === 'waiting') {
        const state = this.levelState;
        const lvl = state.level;
        car.state = 'waiting_driver';
        this.audio.playHappy();
        this._spawnParticle(car.x, car.y - 45, 'Jde zaplatit dovnitř 🚶', '#4e3629');

        const rackChance = car.variant === 'bus' ? 0.85 : car.variant === 'truck' ? 0.8 : 0.6;
        const rackAllowed = lvl.orders.filter(
          (o) => this.data.ITEMS[o] && this.data.ITEMS[o].isRackItem && this._isItemUnlocked(o)
        );
        const wantRackItem =
          rackAllowed.length > 0 && Math.random() < rackChance
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
          (o) =>
            this.data.ITEMS[o] &&
            !this.data.ITEMS[o].isRackItem &&
            o !== 'fuel' &&
            o !== 'wash' &&
            this._isItemUnlocked(o)
        );
        const bistroChance = car.variant === 'bus' ? 1.0 : car.variant === 'truck' ? 0.7 : 0.55;
        if (freeSpots.length > 0 && bistroAllowed.length > 0 && Math.random() < bistroChance) {
          spotIndex = freeSpots[Math.floor(Math.random() * freeSpots.length)];
          const pick = bistroAllowed[Math.floor(Math.random() * bistroAllowed.length)];
          orders = [{ itemId: pick, done: false }];
          if (car.variant === 'bus' && bistroAllowed.length > 1) {
            const secondOpts = bistroAllowed.filter((o) => o !== pick);
            const second = secondOpts[Math.floor(Math.random() * secondOpts.length)];
            orders.push({ itemId: second, done: false });
          }
        }

        const decorBonus = 1 + (this._getEffectiveUpgrade('decor') - 1) * 0.25;
        const driverPatience = Math.max(car.patience + 18, lvl.patienceBase * decorBonus);
        const carOrders = car.orders.map((o) => ({ itemId: o.itemId }));
        if (car.isHeavy) {
          carOrders.push({ itemId: 'fuel' });
        }

        const driver = {
          id: state.nextEntityId++,
          isDriver: true,
          carId: car.id,
          carOrders,
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
            car.targetX = 1640;
            this.levelState.angryCount += 1;
            this.audio.playSad();
            this._spawnParticle(car.x, car.y - 45, 'Odjíždí bez obsluhy 😔', '#d95d4a');
          }
        } else if (car.state === 'leaving') {
          if (car.y < 648) {
            car.y = Math.min(648, car.y + 195 * dt);
            car.x += 120 * dt;
          } else {
            car.x += 275 * dt;
          }
          if (car.x > 1620) {
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
                  this._syncRackStockToSave();
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
                car.targetX = 1640;
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
              this._setCustomerTarget(cust, car ? car.x + 24 : -40, car ? car.y + 18 : 648);
              this._spawnParticle(cust.x, cust.y - 45, 'Odchází bez zaplacení 😔', '#d95d4a');
            } else {
              cust.state = 'leaving';
              this._setCustomerTarget(cust, 715, 650);
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

    _assignStaffRoleTask(w, state) {
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

        const canWash = this._isStationUnlocked('bucket');
        const targetCar = state.cars.find(
          (c) =>
            c.state === 'waiting' &&
            !this._isTaskClaimed('carId', c.id, w) &&
            c.orders.some((o) => !o.done && (o.itemId === 'fuel' || (o.itemId === 'wash' && canWash)))
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
        const washOrder = canWash ? targetCar.orders.find((o) => !o.done && o.itemId === 'wash') : null;
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
            c.orders.some(
              (o) =>
                !o.done &&
                (o.itemId === 'coffee' || o.itemId === 'snack' || o.itemId === 'drink') &&
                this._isItemUnlocked(o.itemId)
            )
        );
        if (shopCust) {
          const spot = this.data.SHOP_SPOTS[shopCust.spotIndex];
          const nextOrd = shopCust.orders.find(
            (o) =>
              !o.done &&
              (o.itemId === 'coffee' || o.itemId === 'snack' || o.itemId === 'drink') &&
              this._isItemUnlocked(o.itemId)
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

        if (w.held.includes('broom')) {
          const broom = this.data.STATIONS.broom;
          const unclaimedSpill = state.spills.find((sp) => !this._isTaskClaimed('spillId', sp.id, w));
          if (unclaimedSpill) {
            w.taskQueue.push({
              type: 'cleanSpill',
              spillId: unclaimedSpill.id,
              x: unclaimedSpill.x,
              y: unclaimedSpill.y - 8
            });
          }
          w.taskQueue.push({
            type: 'returnBroom',
            x: broom.walkX,
            y: broom.walkY
          });
          return;
        }

        if (w.held.length > 0) {
          w.taskQueue.push({ type: 'trash', x: trash.walkX, y: trash.walkY });
          return;
        }

        const unclaimedSpill = state.spills.find((sp) => !this._isTaskClaimed('spillId', sp.id, w));
        if (unclaimedSpill) {
          const broom = this.data.STATIONS.broom;
          w.taskQueue.push({
            type: 'takeBroom',
            x: broom.walkX,
            y: broom.walkY
          });
          w.taskQueue.push({
            type: 'cleanSpill',
            spillId: unclaimedSpill.id,
            x: unclaimedSpill.x,
            y: unclaimedSpill.y - 8
          });
          w.taskQueue.push({
            type: 'returnBroom',
            x: broom.walkX,
            y: broom.walkY
          });
        }
      }
    }

    _runStaffAI() {
      const state = this.levelState;
      const idleWorkers = state.workers.filter(
        (w) =>
          !w.isPlayer &&
          w.active &&
          w.taskQueue.length === 0 &&
          w.actionTimer <= 0 &&
          (!w.currentTask || w.currentTask.type === 'returnHome')
      );
      if (idleWorkers.length === 0) return;

      idleWorkers.forEach((w) => {
        this._assignStaffRoleTask(w, state);
        if (w.taskQueue.length > 0 && w.currentTask && w.currentTask.type === 'returnHome') {
          w.currentTask = null;
          w.waypoints = [];
          w.moving = false;
        } else if (
          !w.currentTask &&
          w.taskQueue.length === 0 &&
          w.held.length === 0 &&
          typeof w.homeX === 'number' &&
          typeof w.homeY === 'number' &&
          Math.hypot(w.x - w.homeX, w.y - w.homeY) > 8
        ) {
          w.taskQueue.push({
            type: 'returnHome',
            x: w.homeX,
            y: w.homeY
          });
        }
      });
    }

    _updateParticles(dt) {
      if (!this.levelState || !this.levelState.particles) return;
      const particles = this.levelState.particles;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        p.x += (p.vx || 0) * dt;
        p.y += (p.vy || -24) * dt;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    _spawnParticle(x, y, text, color, size, duration) {
      if (!this.levelState) return;
      const life = duration || 1.3;
      this.levelState.particles.push({
        x,
        y,
        text,
        color,
        size: size || 15,
        vx: (Math.random() - 0.5) * 14,
        vy: -28,
        life,
        maxLife: life
      });
    }

    _updateGameHUD() {
      const state = this.levelState;
      if (!state) return;
      const lvl = state.level;
      const curStage = this.getCurrentStage();

      document.getElementById('hud-level-name').textContent = `${curStage.name} · ${lvl.name}`;
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

    _formatDuration(seconds) {
      const totalSec = Math.max(0, Math.round(seconds || 0));
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      if (h > 0) return `${h} h ${m} min ${s} s`;
      if (m > 0) return `${m} min ${s} s`;
      return `${s} s`;
    }

    showVictoryModal(lastShift) {
      this._syncStageLevels();
      const stats = Object.assign(
        {
          totalPlayTime: 0,
          totalEarnedCoins: 0,
          totalServedCustomers: 0,
          totalAngryCustomers: 0,
          shiftsPlayed: 0,
          gameCompleted: false
        },
        this.save.stats || {}
      );

      const finalStage = this.data.STAGES[this.data.STAGES.length - 1];
      const finalStageStarsObj =
        this.getCurrentStage().id === finalStage.id
          ? this.save.stars
          : (this.save.stageStars && this.save.stageStars[finalStage.id]) || {};
      const finalLvl = finalStage.levels[finalStage.levels.length - 1];
      const finalStars = lastShift ? lastShift.stars : finalStageStarsObj[finalLvl.id] || 3;

      let totalStars = 0;
      this.data.STAGES.forEach((st) => {
        const stObj =
          st.id === this.getCurrentStage().id ? this.save.stars : (this.save.stageStars && this.save.stageStars[st.id]) || {};
        totalStars += Object.values(stObj).reduce((acc, s) => acc + s, 0);
      });
      const maxStars = this.data.STAGES.length * 24;
      const starsStr = '⭐'.repeat(finalStars) + '☆'.repeat(Math.max(0, 3 - finalStars));
      document.getElementById('victory-stars').textContent = starsStr;
      const victoryTitleEl = document.getElementById('victory-title');
      if (victoryTitleEl) {
        const vocative = this._getPlayerVocative();
        victoryTitleEl.textContent = vocative
          ? `Gratulujeme, ${vocative}! Útulná Benzínka je kompletní!`
          : 'Gratulujeme! Útulná Benzínka je kompletní!';
      }

      const shiftBanner = document.getElementById('victory-shift-banner');
      if (lastShift) {
        shiftBanner.textContent = `Poslední směna (${finalStage.name} – ${finalLvl.name}): +${lastShift.earned} Kč · Obslouženo: ${lastShift.served} · Čas směny: ${this._formatDuration(lastShift.time)}`;
        shiftBanner.classList.remove('hidden');
      } else {
        shiftBanner.classList.add('hidden');
      }

      const totalVisitors = stats.totalServedCustomers + stats.totalAngryCustomers;
      const successRate =
        totalVisitors > 0 ? Math.round((stats.totalServedCustomers / totalVisitors) * 100) : 100;

      const boughtUpgrades = this.data.UPGRADES.reduce(
        (acc, u) => acc + Math.max(0, (this.save.upgrades[u.id] || 1) - 1),
        0
      );
      const maxUpgrades = this.data.UPGRADES.reduce((acc, u) => acc + (u.maxLevel - 1), 0);

      const hiredStaff = this.data.STAFF.filter((s) => (this.save.staff[s.id] || 0) > 0).length;
      const staffLevels = this.data.STAFF.reduce((acc, s) => acc + (this.save.staff[s.id] || 0), 0);
      const maxStaffLevels = this.data.STAFF.reduce((acc, s) => acc + s.maxLevel, 0);

      const cards = [
        {
          label: '⏱️ Celkový odehraný čas',
          value: this._formatDuration(stats.totalPlayTime),
          sub:
            stats.shiftsPlayed > 0
              ? `Průměr na směnu: ${this._formatDuration(stats.totalPlayTime / stats.shiftsPlayed)}`
              : 'Dokončený příběh benzínky'
        },
        {
          label: '👥 Obsloužení zákazníci',
          value: `${stats.totalServedCustomers} hostů`,
          sub: `Úspěšnost: ${successRate} % (odešlo ${stats.totalAngryCustomers})`
        },
        {
          label: '💰 Celkový výdělek',
          value: `${stats.totalEarnedCoins} Kč`,
          sub: `V pokladně zbývá: ${this.save.coins} Kč`
        },
        {
          label: '⭐ Nasbírané hvězdy',
          value: `${totalStars} / ${maxStars} ⭐`,
          sub: totalStars >= maxStars ? 'Plný počet hvězd na celé mapě!' : 'Lze ještě vylepšit skóre na mapě'
        },
        {
          label: '🛠️ Vylepšení a tým',
          value: `${boughtUpgrades} / ${maxUpgrades} úrovní`,
          sub: `Zaměstnanci: ${hiredStaff}/${this.data.STAFF.length} (úrovně ${staffLevels}/${maxStaffLevels})`
        },
        {
          label: '🏁 Odehrané směny',
          value: `${stats.shiftsPlayed} směn`,
          sub: `Všechny ${this.data.STAGES.length} benzínky (32 směn) pokořeny!`
        }
      ];

      const grid = document.getElementById('victory-stats-grid');
      grid.innerHTML = cards
        .map(
          (c) => `
          <div class="victory-stat-card">
            <span class="victory-stat-label">${c.label}</span>
            <strong class="victory-stat-value">${c.value}</strong>
            <span class="victory-stat-sub">${c.sub}</span>
          </div>`
        )
        .join('');

      document.getElementById('victory-modal').classList.remove('hidden');
    }

    _endLevel() {
      const state = this.levelState;
      const lvl = state.level;
      const curStage = this.getCurrentStage();
      const nextStage = this.data.STAGES.find((s) => s.id === curStage.id + 1) || null;
      const earned = state.earnedCoins;

      let starsEarned = 0;
      if (earned >= lvl.stars[2]) starsEarned = 3;
      else if (earned >= lvl.stars[1]) starsEarned = 2;
      else if (earned >= lvl.stars[0]) starsEarned = 1;

      this.save.coins += earned;
      if (!this.save.stats) {
        this.save.stats = {
          totalPlayTime: 0,
          totalEarnedCoins: 0,
          totalServedCustomers: 0,
          totalAngryCustomers: 0,
          shiftsPlayed: 0,
          gameCompleted: false
        };
      }
      this.save.stats.totalPlayTime += Math.max(0, state.time || 0);
      this.save.stats.totalEarnedCoins += earned;
      this.save.stats.totalServedCustomers += state.servedCount;
      this.save.stats.totalAngryCustomers += state.angryCount;
      this.save.stats.shiftsPlayed += 1;

      const prevStars = this.save.stars[lvl.id] || 0;
      if (starsEarned > prevStars) {
        this.save.stars[lvl.id] = starsEarned;
      }
      if (!this.save.stageStars || typeof this.save.stageStars !== 'object') {
        this.save.stageStars = {};
      }
      this.save.stageStars[curStage.id] = Object.assign({}, this.save.stars);

      let unlockedNext = false;
      if (starsEarned >= 1 && lvl.id >= this.save.unlockedLevel && lvl.id < this.data.LEVELS.length) {
        this.save.unlockedLevel = lvl.id + 1;
        unlockedNext = true;
      }

      const isFinalStage = curStage.id === this.data.STAGES.length;
      const isFinalVictory = isFinalStage && lvl.id === this.data.LEVELS.length && starsEarned >= 1;
      if (isFinalVictory) {
        this.save.stats.gameCompleted = true;
      }

      this._syncRackStockToSave();
      this.persistSave();
      this.updateGlobalHUD();
      this.audio.stopAmbient();
      if (starsEarned >= 1) this.audio.playWin();
      else this.audio.playSad();

      if (isFinalVictory) {
        this.showVictoryModal({
          earned,
          served: state.servedCount,
          angry: state.angryCount,
          time: state.time,
          stars: starsEarned
        });
        return;
      }

      const starsStr = '⭐'.repeat(starsEarned) + '☆'.repeat(3 - starsEarned);
      document.getElementById('result-stars').textContent = starsStr;
      const vocative = this._getPlayerVocative();
      document.getElementById('result-title').textContent =
        starsEarned >= 1
          ? vocative
            ? `Skvělá práce, ${vocative}! ${lvl.name} v benzínce "${curStage.name}" je hotový!`
            : `${lvl.name} v benzínce "${curStage.name}" hotový!`
          : vocative
          ? `Nevadí, ${vocative} – směna skončila těsně pod cílem`
          : 'Směna skončila těsně pod cílem';
      document.getElementById('result-summary').textContent =
        `Obslouženo: ${state.servedCount} · Odešlo bez obsluhy: ${state.angryCount} · Výdělek přidán do pokladny: +${earned} Kč`;

      const unlockNote = document.getElementById('result-unlock-note');
      const nextBtn = document.getElementById('result-next-btn');
      const stageComplete = lvl.id === this.data.LEVELS.length && starsEarned >= 1 && nextStage;

      if (stageComplete) {
        if (this.save.coins >= nextStage.unlockCost) {
          unlockNote.textContent = `🏢 Všech 8 směn hotovo! Můžeš přejít na novou benzínku: ${nextStage.id}. ${nextStage.name} (cena přechodu: ${nextStage.unlockCost} Kč, na nové pumpě začínáš od 0 Kč)!`;
          nextBtn.textContent = `🏢 Koupit: ${nextStage.name} (${nextStage.unlockCost} Kč)`;
        } else {
          unlockNote.textContent = `🏁 Všech 8 směn v této benzínce je hotových! Na koupi další (${nextStage.name}) potřebuješ ${nextStage.unlockCost} Kč (v pokladně máš ${this.save.coins} Kč).`;
          nextBtn.textContent = '🗺️ Na hlavní mapu';
        }
        unlockNote.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
      } else if (unlockedNext) {
        const nextLvl = this.data.LEVELS.find((l) => l.id === lvl.id + 1);
        unlockNote.textContent = `🎉 Odemčen další den: ${nextLvl.name}!`;
        unlockNote.classList.remove('hidden');
        nextBtn.textContent = '➡️ Další den';
        nextBtn.classList.remove('hidden');
      } else if (starsEarned === 0) {
        unlockNote.textContent =
          '💡 Tip: Před dalším pokusem si vylepši benzínku nebo najmi zaměstnance!';
        unlockNote.classList.remove('hidden');
        nextBtn.textContent = '➡️ Další den';
        nextBtn.classList.add('hidden');
      } else {
        unlockNote.classList.add('hidden');
        nextBtn.textContent = '➡️ Další den';
        if (lvl.id < this.data.LEVELS.length && this.save.unlockedLevel > lvl.id) {
          nextBtn.classList.remove('hidden');
        } else {
          nextBtn.classList.add('hidden');
        }
      }

      document.getElementById('result-modal').classList.remove('hidden');
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.Game = new GasStationGame();
  });
})();
