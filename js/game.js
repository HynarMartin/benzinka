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
        air_unlock: 1,
        vacuum_unlock: 1,
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
        air: 1,
        air_price: 1,
        vacuum: 1,
        vacuum_price: 1,
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
      staffWage: {
        tonik: 14,
        anicka: 14,
        kuba: 14
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
      machineStock: null,
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
        pump_unlock: 4,
        wash_unlock: 2,
        air_unlock: 2,
        vacuum_unlock: 2,
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
        air: 4,
        air_price: 4,
        vacuum: 4,
        vacuum_price: 4,
        drink_speed: 4,
        drink_price: 4,
        racks: 4,
        racks_price: 4,
        decor: 4,
        decor_tips: 4,
        shoes: 2,
        carry: 3
      },
      staff: {
        tonik: 1,
        anicka: 1,
        kuba: 1
      },
      staffWage: {
        tonik: 42,
        anicka: 42,
        kuba: 42
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
      machineStock: null,
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
    const rawUpgrades = Object.assign({}, def.upgrades, raw.upgrades || {});
    if (typeof rawUpgrades.shoes === 'number') {
      rawUpgrades.shoes = Math.max(1, Math.min(2, rawUpgrades.shoes >= 2 ? 2 : 1));
    }
    const wageCfg = (typeof window !== 'undefined' && window.GAME_DATA && window.GAME_DATA.STAFF_WAGE_CONFIG) || {
      min: 0,
      max: 42,
      step: 7,
      defaultWage: 14
    };
    const normStaff = {};
    const normStaffWage = {};
    ['tonik', 'anicka', 'kuba'].forEach((id) => {
      const oldLvl = raw.staff && typeof raw.staff[id] === 'number' ? raw.staff[id] : 0;
      normStaff[id] = oldLvl > 0 ? 1 : 0;
      if (raw.staffWage && typeof raw.staffWage[id] === 'number') {
        const clamped = Math.max(
          wageCfg.min,
          Math.min(wageCfg.max, Math.round(raw.staffWage[id] / wageCfg.step) * wageCfg.step)
        );
        normStaffWage[id] = clamped;
      } else if (raw.staffEnabled && raw.staffEnabled[id] === false) {
        normStaffWage[id] = 0;
      } else if (oldLvl >= 3) {
        normStaffWage[id] = 35;
      } else if (oldLvl === 2) {
        normStaffWage[id] = 21;
      } else {
        normStaffWage[id] = def.staffWage[id];
      }
    });
    return {
      coins: typeof raw.coins === 'number' ? raw.coins : def.coins,
      currentStage: rawStage,
      unlockedStage: rawUnlockedStage,
      unlockedLevel: typeof raw.unlockedLevel === 'number' ? raw.unlockedLevel : def.unlockedLevel,
      stars: raw.stars && typeof raw.stars === 'object' ? raw.stars : {},
      stageStars: raw.stageStars && typeof raw.stageStars === 'object' ? Object.assign({}, raw.stageStars) : {},
      upgrades: rawUpgrades,
      staff: normStaff,
      staffWage: normStaffWage,
      stats: Object.assign({}, def.stats, raw.stats || {}),
      rackStock: raw.rackStock && typeof raw.rackStock === 'object' ? Object.assign({}, raw.rackStock) : null,
      machineStock: raw.machineStock && typeof raw.machineStock === 'object' ? Object.assign({}, raw.machineStock) : null,
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
            pump_unlock: 4,
            wash_unlock: 2,
            air_unlock: 2,
            vacuum_unlock: 2,
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
        if (this.levelState.selectedWorkerId) {
          this.levelState.selectedWorkerId = null;
          this._spawnParticle(this.levelState.player.x, this.levelState.player.y - 42, 'Výběr zrušen', '#6d5846');
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
          if (e.code === 'Escape' && this.levelState.selectedWorkerId) {
            this.levelState.selectedWorkerId = null;
            return;
          }
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
      this._syncStageStations(stage ? stage.id : 1);
    }

    _syncStageStations(stageId) {
      const base = this.data.BASE_FORECOURT_STATIONS;
      const byStage = this.data.STAGE_FORECOURT_OVERRIDES;
      const stageOverrides =
        (byStage && byStage[stageId]) || (stageId === 4 ? this.data.STAGE4_FORECOURT_OVERRIDES : null);
      if (!base || !this.data.STATIONS) return;
      Object.keys(base).forEach((id) => {
        if (this.data.STATIONS[id]) {
          Object.assign(this.data.STATIONS[id], base[id]);
        }
      });
      if (stageOverrides) {
        Object.keys(stageOverrides).forEach((id) => {
          if (this.data.STATIONS[id]) {
            Object.assign(this.data.STATIONS[id], stageOverrides[id]);
          }
        });
      }
    }

    getUpgradeCap(upgradeId) {
      const stage = this.getCurrentStage();
      const lim = (stage && stage.limits) || {
        maxPumps: 3,
        allowedUnlocks: ['pump_unlock', 'wash_unlock', 'air_unlock', 'vacuum_unlock', 'rack_sweets_unlock', 'fridge_unlock', 'grill_unlock', 'rack_auto_unlock'],
        maxUpgradeLevel: 4,
        maxCarryLevel: 3
      };
      if (upgradeId === 'pump_unlock') {
        return lim.allowedUnlocks.includes('pump_unlock') ? Math.min(4, lim.maxPumps || 3) : 1;
      }
      if (
        upgradeId === 'wash_unlock' ||
        upgradeId === 'air_unlock' ||
        upgradeId === 'vacuum_unlock' ||
        upgradeId === 'rack_sweets_unlock' ||
        upgradeId === 'fridge_unlock' ||
        upgradeId === 'grill_unlock' ||
        upgradeId === 'rack_auto_unlock'
      ) {
        return lim.allowedUnlocks.includes(upgradeId) ? 2 : 1;
      }
      if (upgradeId === 'shoes') {
        return 2;
      }
      if (upgradeId === 'carry') {
        return 3;
      }
      return Math.min(4, lim.maxUpgradeLevel || 4);
    }

    getStaffCap(staffId) {
      const stage = this.getCurrentStage();
      const lim = (stage && stage.limits) || {
        allowedStaff: ['tonik', 'anicka', 'kuba']
      };
      return lim.allowedStaff.includes(staffId) ? 1 : 0;
    }

    _getStaffWagePerformance(wage) {
      const cfg = (this.data && this.data.STAFF_WAGE_CONFIG) || { min: 0, max: 42, step: 7, defaultWage: 14 };
      const w = Math.max(cfg.min, Math.min(cfg.max, Math.round((Number(wage) || 0) / cfg.step) * cfg.step));
      if (w <= 0) {
        return { wage: 0, active: false, walkSpeed: 0, workMultiplier: 0, spawnReduction: 0, tierLabel: '💤 Odpočívá (0 Kč/den)' };
      }
      if (w <= cfg.step) {
        return { wage: cfg.step, active: true, walkSpeed: 78, workMultiplier: 0.75, spawnReduction: 0.14, tierLabel: '🚶 Klidné tempo' };
      }
      if (w <= cfg.step * 2) {
        return { wage: cfg.step * 2, active: true, walkSpeed: 108, workMultiplier: 1.0, spawnReduction: 0.24, tierLabel: '🙂 Standardní tempo' };
      }
      if (w <= cfg.step * 3) {
        return { wage: cfg.step * 3, active: true, walkSpeed: 135, workMultiplier: 1.25, spawnReduction: 0.34, tierLabel: '⚡ Svižné tempo' };
      }
      if (w <= cfg.step * 4) {
        return { wage: cfg.step * 4, active: true, walkSpeed: 162, workMultiplier: 1.48, spawnReduction: 0.42, tierLabel: '🔥 Rychlé tempo' };
      }
      if (w <= cfg.step * 5) {
        return { wage: cfg.step * 5, active: true, walkSpeed: 186, workMultiplier: 1.68, spawnReduction: 0.48, tierLabel: '🚀 Vysoké tempo' };
      }
      return { wage: cfg.max, active: true, walkSpeed: 210, workMultiplier: 1.9, spawnReduction: 0.54, tierLabel: '🏆 Špičkové tempo' };
    }

    _getPlannedDailyPayroll() {
      let total = 0;
      const items = [];
      const staff = (this.save && this.save.staff) || {};
      const wages = (this.save && this.save.staffWage) || {};
      const defWage = (this.data && this.data.STAFF_WAGE_CONFIG && this.data.STAFF_WAGE_CONFIG.defaultWage) || 14;
      (this.data.STAFF || []).forEach((st) => {
        if (this.getStaffCap(st.id) <= 0 || (staff[st.id] || 0) > 0 === false) return;
        const rawW = typeof wages[st.id] === 'number' ? wages[st.id] : defWage;
        const perf = this._getStaffWagePerformance(rawW);
        if (perf.active) {
          total += perf.wage;
          items.push({ id: st.id, shortName: st.shortName, wage: perf.wage });
        }
      });
      return { total, items };
    }

    _getActiveShiftPayroll() {
      if (!this.levelState || !Array.isArray(this.levelState.workers)) {
        return this._getPlannedDailyPayroll();
      }
      let total = 0;
      const items = [];
      this.levelState.workers.forEach((w) => {
        if (w.isPlayer || !w.active) return;
        const wage = Math.max(0, Number(w.wage) || 0);
        if (wage > 0) {
          total += wage;
          items.push({ id: w.id, shortName: w.label, wage });
        }
      });
      return { total, items };
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
      const keptShoes = (this.save.upgrades && this.save.upgrades.shoes) || 1;
      const keptCarry = (this.save.upgrades && this.save.upgrades.carry) || 1;
      this.save.upgrades = Object.assign({}, fresh.upgrades, {
        shoes: keptShoes,
        carry: keptCarry
      });
      this.save.staff = fresh.staff;
      this.save.staffWage = fresh.staffWage;
      this.save.rackStock = null;
      this.save.machineStock = null;
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
            actionTxt = `🏢 Koupit větší pumpu za všechny peníze (${st.unlockCost} Kč)`;
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
              }>🏢 Koupit větší pumpu za všechny peníze</button>`
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

    setStaffWage(staffId, rawWage) {
      const defWage = (this.data && this.data.STAFF_WAGE_CONFIG && this.data.STAFF_WAGE_CONFIG.defaultWage) || 14;
      if (!this.save.staffWage || typeof this.save.staffWage !== 'object') {
        this.save.staffWage = { tonik: defWage, anicka: defWage, kuba: defWage };
      }
      const perf = this._getStaffWagePerformance(rawWage);
      this.save.staffWage[staffId] = perf.wage;
      this.persistSave();
      this._syncPrepState();
    }

    _buildStaffWageControl(st, onUpdated) {
      const cfg = (this.data && this.data.STAFF_WAGE_CONFIG) || { min: 0, max: 42, step: 7, defaultWage: 14 };
      const rawWage =
        this.save.staffWage && typeof this.save.staffWage[st.id] === 'number'
          ? this.save.staffWage[st.id]
          : cfg.defaultWage;
      const perf = this._getStaffWagePerformance(rawWage);
      const midWage = Math.round(cfg.max / 2);

      const box = document.createElement('div');
      box.className = 'staff-wage-box';
      box.innerHTML = `
        <div class="staff-wage-top">
          <span>💸 Výplata za směnu: <strong class="wage-amount">${perf.wage} Kč</strong></span>
          <span class="staff-wage-tier">${perf.tierLabel}</span>
        </div>
        <input type="range" class="staff-wage-slider" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${perf.wage}" aria-label="Výplata pro ${st.shortName}" />
        <div class="staff-wage-scale">
          <span>0 Kč (odpočívá)</span>
          <span>${midWage} Kč</span>
          <span>${cfg.max} Kč (max tempo)</span>
        </div>
      `;

      const slider = box.querySelector('.staff-wage-slider');
      const amountEl = box.querySelector('.wage-amount');
      const tierEl = box.querySelector('.staff-wage-tier');
      if (slider) {
        slider.addEventListener('input', () => {
          const nextPerf = this._getStaffWagePerformance(slider.value);
          amountEl.textContent = `${nextPerf.wage} Kč`;
          tierEl.textContent = nextPerf.tierLabel;
          this.setStaffWage(st.id, nextPerf.wage);
          if (typeof onUpdated === 'function') onUpdated(nextPerf);
        });
      }
      return box;
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
        const isHired = staffCap > 0 && (this.save.staff[st.id] || 0) > 0;
        const defWage = (this.data && this.data.STAFF_WAGE_CONFIG && this.data.STAFF_WAGE_CONFIG.defaultWage) || 14;
        const rawWage =
          this.save.staffWage && typeof this.save.staffWage[st.id] === 'number' ? this.save.staffWage[st.id] : defWage;
        const perf = this._getStaffWagePerformance(rawWage);

        iconEl.textContent = st.icon;
        titleEl.textContent = st.name;
        descEl.textContent = `${st.description} Zaměstnanci nemají úrovně – jejich tempo i zapojení řídíš posuvníkem výplaty, která se na konci dne strhne z tržeb.`;
        pipsEl.innerHTML = `<span class="lvl-text">${
          !isHired
            ? 'Zatím nenajatý'
            : perf.active
            ? `💸 Výplata: ${perf.wage} Kč / den (${perf.tierLabel})`
            : '💤 Odpočívá (0 Kč / den)'
        }</span>`;

        if (!isHired) {
          const canAfford = staffCap > 0 && this.save.coins >= st.hireCost;
          const row = document.createElement('div');
          row.className = 'staff-actions';
          const buyBtn = document.createElement('button');
          buyBtn.type = 'button';
          buyBtn.className = 'btn-buy';
          buyBtn.disabled = !canAfford;
          buyBtn.textContent = `Najmout do týmu (${st.hireCost} Kč)`;
          buyBtn.addEventListener('click', () => {
            this.hireOrUpgradeStaff(st.id);
          });
          row.appendChild(buyBtn);
          actionsEl.appendChild(row);
        } else {
          const wageCtrl = this._buildStaffWageControl(st, (nextPerf) => {
            pipsEl.innerHTML = `<span class="lvl-text">${
              nextPerf.active
                ? `💸 Výplata: ${nextPerf.wage} Kč / den (${nextPerf.tierLabel})`
                : '💤 Odpočívá (0 Kč / den)'
            }</span>`;
            const payrollNote = actionsEl.querySelector('.obj-payroll-summary');
            if (payrollNote) {
              const pr = this._getPlannedDailyPayroll();
              payrollNote.textContent = `Celková výplata týmu za směnu: ${pr.total} Kč (strhne se na konci dne z tržby).`;
            }
          });
          actionsEl.appendChild(wageCtrl);

          const pr = this._getPlannedDailyPayroll();
          const summaryNote = document.createElement('p');
          summaryNote.className = 'obj-upg-note obj-payroll-summary';
          summaryNote.textContent = `Celková výplata týmu za směnu: ${pr.total} Kč (strhne se na konci dne z tržby).`;
          actionsEl.appendChild(summaryNote);
        }
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
                <h4>${upg.name}${upg.permanent ? '<span class="perm-badge">♾️ Trvalé</span>' : ''}</h4>
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
      const stg = this.getCurrentStage();
      const lim = (stg && stg.limits) || {};
      const heavyIndices = lim.heavyPumpIndices || (lim.hasHeavyPump ? [3] : []);
      if (stationId === 'pump_0') return true;
      if (stationId === 'pump_1') return this.getUpgradeCap('pump_unlock') >= 2 && (upgs.pump_unlock || 1) >= 2;
      if (stationId === 'pump_2') return this.getUpgradeCap('pump_unlock') >= 3 && (upgs.pump_unlock || 1) >= 3;
      if (stationId === 'pump_3') {
        if ((lim.maxPumps || 3) >= 4) {
          return this.getUpgradeCap('pump_unlock') >= 4 && (upgs.pump_unlock || 1) >= 4;
        }
        return heavyIndices.includes(3);
      }
      if (stationId === 'pump_4') return heavyIndices.includes(4);
      if (stationId === 'pump_5') return heavyIndices.includes(5);
      if (stationId === 'bucket') return this.getUpgradeCap('wash_unlock') >= 2 && (upgs.wash_unlock || 1) >= 2;
      if (stationId === 'air') return this.getUpgradeCap('air_unlock') >= 2 && (upgs.air_unlock || 1) >= 2;
      if (stationId === 'vacuum') return this.getUpgradeCap('vacuum_unlock') >= 2 && (upgs.vacuum_unlock || 1) >= 2;
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
      if (itemId === 'air') return this._isStationUnlocked('air');
      if (itemId === 'vacuum') return this._isStationUnlocked('vacuum');
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
      const intervalStr = this._getEffectiveSpawnInterval(level).toFixed(1).replace('.', ',');
      document.getElementById('prep-level-meta').textContent =
        `Zákazníků ve směně: ${level.customers} (příchod ~${intervalStr} s) · Cíl: ⭐ ${level.stars[0]} Kč · ⭐⭐ ${level.stars[1]} Kč · ⭐⭐⭐ ${level.stars[2]} Kč`;
      document.getElementById('prep-coins').textContent = `${this.save.coins} Kč`;

      const payrollBanner = document.getElementById('staff-payroll-banner');
      const updatePayrollBanner = () => {
        if (!payrollBanner) return;
        const pr = this._getPlannedDailyPayroll();
        const who = pr.items.length > 0 ? pr.items.map((x) => `${x.shortName} ${x.wage} Kč`).join(' · ') : 'nikdo nemá nastavenou výplatu';
        payrollBanner.innerHTML = `
          <span>👷 Výplaty zaměstnanců se strhnou na konci dne z tržeb směny (${who}).</span>
          <strong>Celková výplata za směnu: ${pr.total} Kč</strong>
        `;
      };
      updatePayrollBanner();

      const staffGrid = document.getElementById('staff-list');
      staffGrid.innerHTML = '';

      this.data.STAFF.forEach((st) => {
        const staffCap = this.getStaffCap(st.id);
        const isStageLocked = staffCap === 0;
        const isHired = !isStageLocked && (this.save.staff[st.id] || 0) > 0;
        const canAffordHire = !isStageLocked && !isHired && this.save.coins >= st.hireCost;
        const defWage = (this.data && this.data.STAFF_WAGE_CONFIG && this.data.STAFF_WAGE_CONFIG.defaultWage) || 14;
        const rawWage =
          this.save.staffWage && typeof this.save.staffWage[st.id] === 'number' ? this.save.staffWage[st.id] : defWage;
        const perf = this._getStaffWagePerformance(rawWage);

        const card = document.createElement('div');
        card.className = `prep-card ${isHired ? 'hired-card' : ''}`;
        card.innerHTML = `
          <div class="prep-card-head">
            <span class="prep-icon">${st.icon}</span>
            <div>
              <h4>${st.name}</h4>
              <div class="lvl-pips"><span class="lvl-text staff-status-line">${
                isStageLocked
                  ? '🔒 Až u větší benzínky'
                  : isHired
                  ? perf.active
                    ? `✅ Ve směně · ${perf.wage} Kč/den`
                    : '💤 Odpočívá (0 Kč/den)'
                  : 'Zatím nenajatý'
              }</span></div>
            </div>
          </div>
          <p class="prep-desc">${st.description}</p>
        `;

        if (isStageLocked) {
          const lockBtn = document.createElement('button');
          lockBtn.type = 'button';
          lockBtn.className = 'btn-buy';
          lockBtn.disabled = true;
          lockBtn.textContent = '🔒 Nedostupné v této benzínce';
          card.appendChild(lockBtn);
        } else if (!isHired) {
          const row = document.createElement('div');
          row.className = 'staff-actions';
          const buyBtn = document.createElement('button');
          buyBtn.type = 'button';
          buyBtn.className = 'btn-buy';
          buyBtn.dataset.staff = st.id;
          buyBtn.disabled = !canAffordHire;
          buyBtn.textContent = `Najmout (${st.hireCost} Kč)`;
          buyBtn.addEventListener('click', () => this.hireOrUpgradeStaff(st.id));
          row.appendChild(buyBtn);
          card.appendChild(row);
        } else {
          const statusLine = card.querySelector('.staff-status-line');
          const wageCtrl = this._buildStaffWageControl(st, (nextPerf) => {
            if (statusLine) {
              statusLine.textContent = nextPerf.active
                ? `✅ Ve směně · ${nextPerf.wage} Kč/den`
                : '💤 Odpočívá (0 Kč/den)';
            }
            updatePayrollBanner();
            const metaEl = document.getElementById('prep-level-meta');
            if (metaEl) {
              const iStr = this._getEffectiveSpawnInterval(level).toFixed(1).replace('.', ',');
              metaEl.textContent =
                `Zákazníků ve směně: ${level.customers} (příchod ~${iStr} s) · Cíl: ⭐ ${level.stars[0]} Kč · ⭐⭐ ${level.stars[1]} Kč · ⭐⭐⭐ ${level.stars[2]} Kč`;
            }
          });
          card.appendChild(wageCtrl);
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
        const heavyIndices = (curStage.limits && curStage.limits.heavyPumpIndices) || (hasHeavyPump ? [3] : []);
        const heavyLabel = heavyIndices.length > 1 ? `+ ${heavyIndices.length}× Kamiony` : '+ Stojan 4';

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
                    ? `✅ Postaveno: ${curLvl}/${maxLvl} ${heavyLabel}`
                    : `Postaveno: ${curLvl}/${maxLvl} ${heavyLabel}`
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

      ['wash_unlock', 'air_unlock', 'vacuum_unlock', 'rack_sweets_unlock', 'fridge_unlock', 'grill_unlock', 'rack_auto_unlock'].forEach((unlockId) => {
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
          Kliknutím přímo na kávovar (☕), gril (🌭), mytí (🧽), limonády (🧃), regály (🛒), stojany (⛽), pokladnu (📠) nebo svou postavičku si vybereš vylepšení (Pohodlné tenisky a Větší tác jsou trvalé na celou hru). Kliknutím na zaměstnance nastavíš jeho denní výplatu!
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
        if (this.levelState.prepMode && this.levelState.level) {
          const lvl = this.levelState.level;
          const intStr = this._getEffectiveSpawnInterval(lvl).toFixed(1).replace('.', ',');
          const subEl = document.getElementById('prep-bar-sub');
          if (subEl) {
            subEl.textContent =
              `Zákazníků: ${lvl.customers} (interval ~${intStr} s) · Cíl: ⭐ ${lvl.stars[0]} Kč · ⭐⭐ ${lvl.stars[1]} Kč · ⭐⭐⭐ ${lvl.stars[2]} Kč`;
          }
        }
        const shoesLvl = this._getEffectiveUpgrade('shoes');
        const carryLvl = this._getEffectiveUpgrade('carry');
        const playerSpeed = 215 * (shoesLvl >= 2 ? 1.45 : 1);
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
        this.levelState.machineState = this._createMachineState();

        this.levelState.workers.forEach((w) => {
          if (w.isPlayer) {
            w.speed = playerSpeed;
            w.maxCarry = maxCarry;
          } else {
            const staffCap = this.getStaffCap(w.id);
            const isHired = staffCap > 0 && (this.save.staff[w.id] || 0) > 0;
            const defWage = (this.data && this.data.STAFF_WAGE_CONFIG && this.data.STAFF_WAGE_CONFIG.defaultWage) || 14;
            const rawWage =
              this.save.staffWage && typeof this.save.staffWage[w.id] === 'number' ? this.save.staffWage[w.id] : defWage;
            const perf = this._getStaffWagePerformance(rawWage);
            w.wage = perf.wage;
            w.workMultiplier = perf.workMultiplier;
            w.speed = perf.walkSpeed || 78;
            w.active = this.levelState.prepMode ? isHired : isHired && perf.active;
          }
        });
      }

      const objModal = document.getElementById('object-upgrade-modal');
      if (objModal && !objModal.classList.contains('hidden') && this._activeObjectTarget && this._activeObjectTarget.targetType !== 'staff') {
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
      if (staffCap <= 0 || (this.save.staff[staffId] || 0) > 0) return;
      const cost = st.hireCost;
      if (this.save.coins < cost) return;

      this.save.coins -= cost;
      this.save.staff[staffId] = 1;
      const defWage = (this.data.STAFF_WAGE_CONFIG && this.data.STAFF_WAGE_CONFIG.defaultWage) || 14;
      if (!this.save.staffWage || typeof this.save.staffWage !== 'object') {
        this.save.staffWage = { tonik: defWage, anicka: defWage, kuba: defWage };
      }
      if (typeof this.save.staffWage[staffId] !== 'number' || this.save.staffWage[staffId] <= 0) {
        this.save.staffWage[staffId] = defWage;
      }
      this.audio.playUpgrade();
      this.persistSave();
      this._syncPrepState();
      this.renderPrepModal();
      this.renderMap();
      if (this._activeObjectTarget && this._activeObjectTarget.targetType === 'staff') {
        const modal = document.getElementById('object-upgrade-modal');
        if (modal && !modal.classList.contains('hidden')) {
          this.openObjectUpgradeModal(this._activeObjectTarget);
        }
      }
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

    _syncMachineStockToSave() {
      if (!this.levelState || !this.levelState.machineState) return;
      if (!this.save.machineStock || typeof this.save.machineStock !== 'object') {
        this.save.machineStock = {};
      }
      Object.values(this.levelState.machineState).forEach((m) => {
        if (m && m.id) this.save.machineStock[m.id] = m.stock;
      });
    }

    _createMachineState() {
      const specs = (this.data && this.data.BISTRO_MACHINES) || {};
      const saved =
        this.save && this.save.machineStock && typeof this.save.machineStock === 'object'
          ? this.save.machineStock
          : null;
      const out = {};
      Object.values(specs).forEach((spec) => {
        if (!this._isStationUnlocked(spec.id)) return;
        const maxStock = spec.maxStock || 6;
        const hasSaved = saved && typeof saved[spec.id] === 'number';
        const initialStock = hasSaved ? Math.max(0, Math.min(maxStock, saved[spec.id])) : maxStock;
        out[spec.id] = {
          id: spec.id,
          stock: initialStock,
          maxStock,
          broken: false
        };
      });
      return out;
    }

    _scheduleMachineBreakdowns(level, curStage, machineState) {
      const specs = (this.data && this.data.BISTRO_MACHINES) || {};
      const approxShiftSec = Math.max(45, (level.customers || 12) * (level.spawnInterval || 8.5));
      const minT = 14;
      const maxT = Math.max(minT + 14, approxShiftSec * 0.65);
      const dayOneScale = curStage && curStage.id === 1 && level && level.id === 1 ? 0.65 : 1;
      const events = [];
      Object.keys(machineState).forEach((mId) => {
        const spec = specs[mId];
        if (!spec || events.length >= 2) return;
        const chance = (spec.breakdownChance || 0.16) * dayOneScale;
        if (Math.random() < chance) {
          events.push({
            stationId: mId,
            atTime: minT + Math.random() * (maxT - minT),
            triggered: false
          });
        }
      });
      return events;
    }

    _createLevelEntities(prepMode) {
      this._syncStageLevels();
      this._applySavedLayout();
      const shoesLvl = this._getEffectiveUpgrade('shoes');
      const carryLvl = this._getEffectiveUpgrade('carry');
      const playerSpeed = 215 * (shoesLvl >= 2 ? 1.45 : 1);
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

      const curStageId = (this.getCurrentStage() && this.getCurrentStage().id) || 1;
      const workers = [player];
      const tonikStartByStage = {
        1: { x: 518, y: 196 },
        2: { x: 58, y: 382 },
        3: { x: 58, y: 368 },
        4: { x: 301, y: 186 }
      };
      const staffStartPositions = {
        tonik: tonikStartByStage[curStageId] || { x: 301, y: 186 },
        anicka: { x: 1138, y: 262 },
        kuba: { x: 1272, y: 412 }
      };

      this.data.STAFF.forEach((st, idx) => {
        const staffCap = this.getStaffCap(st.id);
        const isHired = staffCap > 0 && (this.save.staff[st.id] || 0) > 0;
        const defWage = (this.data && this.data.STAFF_WAGE_CONFIG && this.data.STAFF_WAGE_CONFIG.defaultWage) || 14;
        const rawWage =
          this.save.staffWage && typeof this.save.staffWage[st.id] === 'number' ? this.save.staffWage[st.id] : defWage;
        const perf = this._getStaffWagePerformance(rawWage);
        const startPos = staffStartPositions[st.id] || { x: 580, y: 335 };
        workers.push({
          id: st.id,
          isPlayer: false,
          label: st.shortName,
          role: st.id,
          wage: perf.wage,
          workMultiplier: perf.workMultiplier,
          x: startPos.x,
          y: startPos.y,
          homeX: startPos.x,
          homeY: startPos.y,
          speed: perf.walkSpeed || 78,
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
          active: prepMode ? isHired : isHired && perf.active,
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

      const prepIntervalStr = this._getEffectiveSpawnInterval(level).toFixed(1).replace('.', ',');
      document.getElementById('prep-bar-title').textContent = `${curStage.name} · ${level.name}`;
      document.getElementById('prep-bar-sub').textContent =
        `Zákazníků: ${level.customers} (interval ~${prepIntervalStr} s) · Cíl: ⭐ ${level.stars[0]} Kč · ⭐⭐ ${level.stars[1]} Kč · ⭐⭐⭐ ${level.stars[2]} Kč`;
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
        machineState: this._createMachineState(),
        machineBreakdowns: [],
        spills: [],
        particles: [],
        workers,
        player,
        selectedWorkerId: null,
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
        '💡 <strong>Tip:</strong> Klikej na předměty, zákazníky a auta — nebo klikni na <strong>zaměstnance</strong> a pak na činnost z jeho popisu práce, aby všeho nechal a šel ji udělat hned!';

      const { racks, workers, player } = this._createLevelEntities(false);
      const machineState = this._createMachineState();
      const machineBreakdowns = this._scheduleMachineBreakdowns(level, curStage, machineState);

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
        machineState,
        machineBreakdowns,
        spills: [],
        particles: [],
        workers,
        player,
        selectedWorkerId: null,
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
              hint: `💸 Klikni pro nastavení výplaty (${w.label})`
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
        const isStage4 = ((this.getCurrentStage() && this.getCurrentStage().id) || 1) === 4;
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
            icon: isStage4 ? '⛽' : '🚛',
            title: isStage4 ? 'Tankovací stojany' : 'Stojan 4',
            desc: 'Zrychli tankování paliva nebo navyš jeho prodejní cenu pro všechny stojany:',
            hint: isStage4
              ? '⛽ Klikni pro vylepšení rychlosti a ceny paliva (Stojan 4)'
              : '🚛 Klikni pro vylepšení rychlosti a ceny paliva (Stojan 4)'
          },
          pump_4: {
            upgradeIds: ['pumps', 'pumps_price'],
            icon: '🚛',
            title: 'Stojan pro kamiony',
            desc: 'Zrychli tankování paliva nebo navyš jeho prodejní cenu pro všechny stojany:',
            hint: '🚛 Klikni pro vylepšení rychlosti a ceny paliva (Kamiony 1)'
          },
          pump_5: {
            upgradeIds: ['pumps', 'pumps_price'],
            icon: '🚛',
            title: 'Stojan pro kamiony',
            desc: 'Zrychli tankování paliva nebo navyš jeho prodejní cenu pro všechny stojany:',
            hint: '🚛 Klikni pro vylepšení rychlosti a ceny paliva (Kamiony 2)'
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
          air: {
            upgradeIds: ['air', 'air_price'],
            icon: '💨',
            title: 'Dofukování aut',
            desc: 'Zrychli dofukování pneumatik nebo navyš odměnu:',
            hint: '💨 Klikni pro vylepšení dofukování pneumatik'
          },
          vacuum: {
            upgradeIds: ['vacuum', 'vacuum_price'],
            icon: '🌀',
            title: 'Vysavač',
            desc: 'Zrychli vysávání aut nebo navyš odměnu:',
            hint: '🌀 Klikni pro vylepšení vysavače'
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

      // 0. Active hired staff workers (selectable to force a priority task)
      for (let i = state.workers.length - 1; i >= 0; i--) {
        const w = state.workers[i];
        if (w.isPlayer || !w.active) continue;
        if (Math.abs(x - w.x) <= 24 && y >= w.y - 44 && y <= w.y + 28) {
          const isSel = state.selectedWorkerId === w.id;
          return {
            kind: 'worker',
            id: w.id,
            obj: w,
            hint: isSel
              ? `❌ Zrušit výběr (${w.label})`
              : `👆 Vybrat zaměstnance: ${w.label} – klikni a přikaž mu práci`
          };
        }
      }

      const selWorker = state.selectedWorkerId
        ? state.workers.find((w) => w.id === state.selectedWorkerId && !w.isPlayer && w.active)
        : null;
      const decorateHint = (target) => {
        if (selWorker && target) {
          target.hint = this._getWorkerCommandHint(selWorker, target);
        }
        return target;
      };

      // 1. Cars (waiting at pumps)
      for (let i = state.cars.length - 1; i >= 0; i--) {
        const car = state.cars[i];
        if (car.state === 'waiting') {
          let hit = false;
          if (car.topDown) {
            const box = this._getCarHalfExtents(car, car.angle || 0);
            hit = Math.abs(x - car.x) <= box.hw + 12 && Math.abs(y - car.y) <= box.hh + 12;
          } else {
            const halfW = car.isHeavy ? 76 : 64;
            hit = Math.abs(x - car.x) <= halfW && y >= car.y - 88 && y <= car.y + 34;
          }
          if (hit) {
            const serviceSt = car.serviceBayId ? this.data.STATIONS[car.serviceBayId] : null;
            const pump = !serviceSt && car.pumpIndex >= 0 ? this.data.STATIONS[`pump_${car.pumpIndex}`] : null;
            const pumpLabel = serviceSt ? serviceSt.label : pump ? pump.label : `Stojan ${car.pumpIndex + 1}`;
            return decorateHint({
              kind: 'car',
              id: car.id,
              obj: car,
              hint: car.isHeavy
                ? `🚛 Velké vozidlo (${pumpLabel}) · ${this._describeOrders(car.orders)}`
                : `🚗 Auto (${pumpLabel}) · ${this._describeOrders(car.orders)}`
            });
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
            return decorateHint({ kind: 'customer', id: cust.id, obj: cust, hint });
          }
        }
      }

      // 3. Spills
      for (let i = state.spills.length - 1; i >= 0; i--) {
        const spill = state.spills[i];
        const dist = Math.hypot(x - spill.x, y - spill.y);
        if (dist <= 32) {
          return decorateHint({ kind: 'spill', id: spill.id, obj: spill, hint: '🧹 Uklidit louži (+2 Kč)' });
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
          return decorateHint({ kind: 'rack', id: rack.id, obj: rack, hint });
        }
      }

      // 5. Stations
      for (const st of Object.values(this.data.STATIONS)) {
        if (!this._isStationUnlocked(st.id)) continue;
        const dist = Math.hypot(x - st.x, y - st.y);
        if (dist <= st.radius) {
          let hint = st.type === 'service' ? st.label : `${st.icon} ${st.label}`;
          const ms = state.machineState && state.machineState[st.id];
          const spec = this.data.BISTRO_MACHINES && this.data.BISTRO_MACHINES[st.id];
          if (ms && spec) {
            if (ms.broken) {
              hint = `🔧 ${st.label} je porouchaný! Klikni pro opravu (pouze hráč)`;
            } else if (ms.stock <= 0) {
              hint = `⚠️ ${spec.emptyLabel} (${ms.stock}/${ms.maxStock}) – klikni pro doplnění ze skladu`;
            } else {
              hint = `${st.icon} ${st.label} (${ms.stock}/${ms.maxStock})`;
            }
          }
          return decorateHint({
            kind: 'station',
            id: st.id,
            obj: st,
            hint
          });
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

    _getCarPedestrianBounds(car, padL = 1.5, padW = 4) {
      let halfL = car.variant === 'truck' ? 56 : car.variant === 'bus' ? 55 : car.variant === 'van' ? 34 : 31;
      let halfW = car.isHeavy ? 19 : car.variant === 'van' ? 17 : 16;
      if (!car.topDown) {
        halfL = car.isHeavy ? 68 : 50;
        halfW = car.isHeavy ? 26 : 22;
      }
      halfL += padL;
      halfW += padW;
      const a = car.topDown ? car.angle || 0 : 0;
      const c = Math.abs(Math.cos(a));
      const s = Math.abs(Math.sin(a));
      return { hw: c * halfL + s * halfW, hh: s * halfL + c * halfW };
    }

    _getDriverCarDoorPos(car) {
      if (!car) return { x: -40, y: 648 };
      const stageId = (this.getCurrentStage() && this.getCurrentStage().id) || 1;
      if (car.serviceBayId) {
        const baySt = this.data.STATIONS[car.serviceBayId];
        if (baySt) {
          if (stageId === 3) {
            return { x: baySt.carX - 42, y: baySt.carY };
          }
          return { x: baySt.carX + 42, y: baySt.carY };
        }
      }
      const pump = car.pumpIndex >= 0 ? this.data.STATIONS[`pump_${car.pumpIndex}`] : null;
      if (pump && pump.carAngle === Math.PI / 2) {
        // Vertical TIR bay in Stage 4: exit beside front cab door at bottom-right
        return { x: car.x + 34, y: car.y + 52 };
      }
      if (pump && pump.carAngle === Math.PI) {
        // Horizontal TIR bay in Stage 3: exit below cab onto driveway
        return { x: car.x - 24, y: car.y + 28 };
      }
      if (stageId === 4 && car.pumpIndex >= 0 && car.pumpIndex <= 3) {
        // Right-side car bays in Stage 4: exit on road side (left of vehicle) clear of pumps & adjacent cars
        return { x: car.x - 40, y: car.y + 8 };
      }
      if (pump && Math.abs((pump.carAngle || 0) + Math.PI / 2) < 0.05) {
        // Stages 1..3 vertical red bays: exit beside driver door on left side away from right-hand fuel dispenser
        return { x: car.x - 28, y: car.y + 4 };
      }
      // Fallback driveway exit directly below vehicle
      return { x: car.x, y: car.y + 28 };
    }

    _getOutsideObstacles(options = {}) {
      const boxes = [];
      const includeBuilding = options.includeBuilding !== false;
      const stationPad = typeof options.stationPad === 'number' ? options.stationPad : 0;
      const carPadL = typeof options.carPadL === 'number' ? options.carPadL : 1.5;
      const carPadW = typeof options.carPadW === 'number' ? options.carPadW : 4;
      const includeMovingCars = Boolean(options.includeMovingCars);

      if (includeBuilding) {
        // Main shop & storage exterior footprint with doorway gap at x: 690..740 (DOOR_OUT 715,592 -> DOOR_IN 715,554)
        boxes.push({ x1: 604, y1: 120, x2: 690, y2: 583, kind: 'building', id: 'shop_left' });
        boxes.push({ x1: 740, y1: 120, x2: 1525, y2: 583, kind: 'building', id: 'shop_right' });
        boxes.push({ x1: 688, y1: 120, x2: 742, y2: 545, kind: 'building', id: 'shop_back' });
      }

      const stage = this.getCurrentStage();
      const stageId = (stage && stage.id) || 1;
      const stageMaxPumps = (stage && stage.limits && stage.limits.maxPumps) || 2;
      const heavyIndices = (stage && stage.limits && stage.limits.heavyPumpIndices) ||
        (stage && stage.limits && stage.limits.hasHeavyPump ? [3] : []);
      const stationIds = ['bucket'];
      for (let i = 0; i < stageMaxPumps; i++) stationIds.push(`pump_${i}`);
      heavyIndices.forEach((idx) => stationIds.push(`pump_${idx}`));
      if (stageId >= 2) {
        stationIds.push('air', 'vacuum');
      }

      stationIds.forEach((id) => {
        const st = this.data.STATIONS[id];
        if (!st) return;
        let hw = 24;
        let hh = 26;
        if (id === 'bucket') {
          hw = 18;
          hh = 18;
        } else if (id === 'air' || id === 'vacuum') {
          hw = 21;
          hh = 24;
        } else if (st.isHeavyPump) {
          if (stageId === 4) {
            hw = 28;
            hh = 26;
          } else {
            hw = 22;
            hh = 28;
          }
        } else if (stageId < 4) {
          hw = 18;
          hh = 26;
        }
        boxes.push({
          x1: st.x - hw - stationPad,
          y1: st.y - hh - stationPad,
          x2: st.x + hw + stationPad,
          y2: st.y + hh + stationPad,
          kind: 'station',
          id
        });
      });

      const cars = this.levelState && this.levelState.cars ? this.levelState.cars : [];
      cars.forEach((car) => {
        const isStatic =
          car.state === 'waiting' ||
          car.state === 'waiting_driver' ||
          car.state === 'waiting_for_pump' ||
          car.blocked;
        if (!isStatic && !includeMovingCars) return;
        const ext = this._getCarPedestrianBounds(car, carPadL, carPadW);
        boxes.push({
          x1: car.x - ext.hw,
          y1: car.y - ext.hh,
          x2: car.x + ext.hw,
          y2: car.y + ext.hh,
          kind: 'car',
          id: car.id
        });
      });

      return boxes;
    }

    _pointInBox(x, y, b, eps = 0) {
      return x > b.x1 - eps && x < b.x2 + eps && y > b.y1 - eps && y < b.y2 + eps;
    }

    _segmentHitsAABB(x1, y1, x2, y2, b) {
      const eps = 1e-3;
      const minX = b.x1 + eps;
      const maxX = b.x2 - eps;
      const minY = b.y1 + eps;
      const maxY = b.y2 - eps;
      if (minX >= maxX || minY >= maxY) return false;
      const dx = x2 - x1;
      const dy = y2 - y1;
      let t0 = 0;
      let t1 = 1;
      const clip = (p, q) => {
        if (Math.abs(p) < 1e-9) return q >= 0;
        const r = q / p;
        if (p < 0) {
          if (r > t1) return false;
          if (r > t0) t0 = r;
        } else {
          if (r < t0) return false;
          if (r < t1) t1 = r;
        }
        return true;
      };
      if (
        clip(-dx, x1 - minX) &&
        clip(dx, maxX - x1) &&
        clip(-dy, y1 - minY) &&
        clip(dy, maxY - y1)
      ) {
        return t0 <= t1;
      }
      return false;
    }

    _pushPointOutsideBoxes(rawX, rawY, boxes, bounds) {
      let x = bounds ? Math.max(bounds.x1, Math.min(bounds.x2, rawX)) : rawX;
      let y = bounds ? Math.max(bounds.y1, Math.min(bounds.y2, rawY)) : rawY;
      for (let pass = 0; pass < 3; pass++) {
        let moved = false;
        for (let i = 0; i < boxes.length; i++) {
          const b = boxes[i];
          if (x > b.x1 && x < b.x2 && y > b.y1 && y < b.y2) {
            const cands = [
              { x: b.x1 - 3, y },
              { x: b.x2 + 3, y },
              { x, y: b.y1 - 3 },
              { x, y: b.y2 + 3 }
            ];
            let bestPt = null;
            let bestDist = Infinity;
            for (let k = 0; k < cands.length; k++) {
              const cx = bounds ? Math.max(bounds.x1, Math.min(bounds.x2, cands[k].x)) : cands[k].x;
              const cy = bounds ? Math.max(bounds.y1, Math.min(bounds.y2, cands[k].y)) : cands[k].y;
              if (cx > b.x1 && cx < b.x2 && cy > b.y1 && cy < b.y2) continue;
              const d = Math.hypot(cx - x, cy - y);
              if (d < bestDist) {
                bestDist = d;
                bestPt = { x: cx, y: cy };
              }
            }
            if (bestPt) {
              x = bestPt.x;
              y = bestPt.y;
              moved = true;
            }
          }
        }
        if (!moved) break;
      }
      return { x, y };
    }

    _routeAroundBoxes(sx, sy, ex, ey, boxes, bounds, extraNodes, pushPt) {
      const segHitsAny = (x1, y1, x2, y2, skipSet) => {
        for (let i = 0; i < boxes.length; i++) {
          if (skipSet && skipSet.has(i)) continue;
          if (this._segmentHitsAABB(x1, y1, x2, y2, boxes[i])) return true;
        }
        return false;
      };

      if (!segHitsAny(sx, sy, ex, ey, null)) {
        pushPt(ex, ey);
        return;
      }

      const cornerPad = 4;
      const inBounds = (pt) =>
        pt.x >= bounds.x1 && pt.x <= bounds.x2 && pt.y >= bounds.y1 && pt.y <= bounds.y2;
      const isFree = (pt) => {
        for (let i = 0; i < boxes.length; i++) {
          if (this._pointInBox(pt.x, pt.y, boxes[i], 0)) return false;
        }
        return true;
      };

      const safeStart = isFree({ x: sx, y: sy }) ? { x: sx, y: sy } : this._pushPointOutsideBoxes(sx, sy, boxes, bounds);
      const safeGoal = isFree({ x: ex, y: ey }) ? { x: ex, y: ey } : this._pushPointOutsideBoxes(ex, ey, boxes, bounds);

      if (!segHitsAny(safeStart.x, safeStart.y, safeGoal.x, safeGoal.y, null)) {
        if (Math.hypot(safeStart.x - sx, safeStart.y - sy) > 2) pushPt(safeStart.x, safeStart.y);
        if (Math.hypot(safeGoal.x - ex, safeGoal.y - ey) > 2) {
          pushPt(safeGoal.x, safeGoal.y);
        }
        pushPt(ex, ey);
        return;
      }

      const nodes = [safeStart, safeGoal];
      const addUniqueNode = (pt) => {
        if (!inBounds(pt) || !isFree(pt)) return;
        for (let i = 0; i < nodes.length; i++) {
          if (Math.hypot(nodes[i].x - pt.x, nodes[i].y - pt.y) < 3) return;
        }
        nodes.push(pt);
      };

      boxes.forEach((b) => {
        addUniqueNode({ x: b.x1 - cornerPad, y: b.y1 - cornerPad });
        addUniqueNode({ x: b.x2 + cornerPad, y: b.y1 - cornerPad });
        addUniqueNode({ x: b.x1 - cornerPad, y: b.y2 + cornerPad });
        addUniqueNode({ x: b.x2 + cornerPad, y: b.y2 + cornerPad });
      });
      if (Array.isArray(extraNodes)) {
        extraNodes.forEach(addUniqueNode);
      }

      const n = nodes.length;
      const gScore = new Array(n).fill(Infinity);
      const fScore = new Array(n).fill(Infinity);
      const parent = new Array(n).fill(-1);
      const closed = new Array(n).fill(false);
      gScore[0] = 0;
      fScore[0] = Math.hypot(nodes[1].x - nodes[0].x, nodes[1].y - nodes[0].y);

      let foundGoal = false;
      for (let iter = 0; iter < n; iter++) {
        let u = -1;
        let bestF = Infinity;
        for (let i = 0; i < n; i++) {
          if (!closed[i] && fScore[i] < bestF) {
            bestF = fScore[i];
            u = i;
          }
        }
        if (u === -1 || gScore[u] === Infinity) break;
        if (u === 1) {
          foundGoal = true;
          break;
        }
        closed[u] = true;
        const nu = nodes[u];
        for (let v = 1; v < n; v++) {
          if (closed[v] || v === u) continue;
          const nv = nodes[v];
          const edgeCost = Math.hypot(nv.x - nu.x, nv.y - nu.y);
          const tentativeG = gScore[u] + edgeCost;
          if (tentativeG >= gScore[v]) continue;
          if (!segHitsAny(nu.x, nu.y, nv.x, nv.y, null)) {
            gScore[v] = tentativeG;
            fScore[v] = tentativeG + Math.hypot(nodes[1].x - nv.x, nodes[1].y - nv.y);
            parent[v] = u;
          }
        }
      }

      if (foundGoal) {
        const rawPath = [];
        let cur = 1;
        while (cur !== -1) {
          rawPath.push(nodes[cur]);
          cur = parent[cur];
        }
        rawPath.reverse();

        // String-pull smoothing so characters take natural diagonal shortcuts clear of corners
        const smooth = [rawPath[0]];
        let anchorIdx = 0;
        while (anchorIdx < rawPath.length - 1) {
          let farthest = anchorIdx + 1;
          for (let probe = rawPath.length - 1; probe > anchorIdx + 1; probe--) {
            if (!segHitsAny(rawPath[anchorIdx].x, rawPath[anchorIdx].y, rawPath[probe].x, rawPath[probe].y, null)) {
              farthest = probe;
              break;
            }
          }
          smooth.push(rawPath[farthest]);
          anchorIdx = farthest;
        }

        for (let i = 0; i < smooth.length; i++) {
          if (i === 0 && Math.hypot(smooth[i].x - sx, smooth[i].y - sy) <= 2) continue;
          pushPt(smooth[i].x, smooth[i].y);
        }
        if (Math.hypot(safeGoal.x - ex, safeGoal.y - ey) > 2) {
          pushPt(ex, ey);
        }
        return;
      }

      pushPt(ex, ey);
    }

    _clampWalkTarget(rawX, rawY) {
      let x = Math.max(35, Math.min(1505, rawX));
      let y = Math.max(175, Math.min(592, rawY));

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
        return { x, y };
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
        const rackBoxes = activeRacks.map((r) => {
          const isVert = (r.rot || 0) % 2 === 1;
          const hw = isVert ? 30 : 48;
          const hh = isVert ? 48 : 30;
          return { x1: r.x - hw, y1: r.y - hh, x2: r.x + hw, y2: r.y + hh };
        });
        return this._pushPointOutsideBoxes(x, y, rackBoxes, { x1: 636, y1: 245, x2: 1296, y2: 580 });
      }

      // Outside forecourt bounds: avoid walking straight into stationary pumps, equipment, or parked cars
      const outsideBoxes = this._getOutsideObstacles({
        includeBuilding: true,
        stationPad: 2,
        carPadL: 2,
        carPadW: 4
      });
      return this._pushPointOutsideBoxes(x, y, outsideBoxes, { x1: 28, y1: 168, x2: 1505, y2: 598 });
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
          // Use clean Visibility A* around all outdoor pumps, equipment, parked cars, and the shop building
          const outsideBoxes = this._getOutsideObstacles();
          const bounds = {
            x1: Math.min(20, sx - 8, ex - 8),
            y1: Math.min(162, sy - 8, ey - 8),
            x2: Math.max(760, sx + 8, ex + 8),
            y2: Math.max(614, sy + 8, ey + 8)
          };
          const extra = [
            PATH_WAYPOINTS.CORNER_SW,
            { x: 301, y: 588 },
            { x: 301, y: 380 },
            { x: 392, y: 540 },
            { x: 392, y: 270 }
          ];
          this._routeAroundBoxes(sx, sy, ex, ey, outsideBoxes, bounds, extra, pushPt);
          return;
        }
        if ((sx > 1310 && sy < 582 && ex < 1310) || (ex > 1310 && ey < 582 && sx < 1310)) {
          pushPt(1322, 592);
          pushPt(ex, ey);
          return;
        }
        const outsideBoxes = this._getOutsideObstacles();
        const bounds = {
          x1: Math.min(20, sx - 8, ex - 8),
          y1: Math.min(162, sy - 8, ey - 8),
          x2: Math.max(760, sx + 8, ex + 8),
          y2: Math.max(660, sy + 8, ey + 8)
        };
        const extra = [
          PATH_WAYPOINTS.CORNER_SW,
          { x: 301, y: 588 },
          { x: 301, y: 380 },
          { x: 392, y: 540 },
          { x: 392, y: 270 }
        ];
        this._routeAroundBoxes(sx, sy, ex, ey, outsideBoxes, bounds, extra, pushPt);
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
        const bounds = { x1: 636, y1: 368, x2: 1296, y2: 576 };
        const extra = [
          { x: 665, y: 400 },
          { x: 715, y: 400 },
          { x: 890, y: 400 },
          { x: 1090, y: 400 },
          { x: 1272, y: 400 },
          { x: 715, y: 562 },
          { x: 990, y: 562 },
          { x: 1272, y: 562 }
        ];
        this._routeAroundBoxes(sx, sy, ex, ey, boxes, bounds, extra, pushPt);
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

      if (hit && hit.kind === 'worker') {
        this.audio.playClick();
        if (this.levelState.selectedWorkerId === hit.id) {
          this.levelState.selectedWorkerId = null;
          this._spawnParticle(hit.obj.x, hit.obj.y - 44, 'Výběr zrušen', '#6d5846');
        } else {
          this.levelState.selectedWorkerId = hit.id;
          this._spawnParticle(hit.obj.x, hit.obj.y - 44, `👆 ${hit.obj.label} – klikni na jeho úkol`, '#2a9d8f');
        }
        this.levelState.hoveredTarget = this._hitTest(pt.x, pt.y);
        return;
      }

      if (this.levelState.selectedWorkerId) {
        const selWorker = this.levelState.workers.find(
          (w) => w.id === this.levelState.selectedWorkerId && !w.isPlayer && w.active
        );
        if (!selWorker) {
          this.levelState.selectedWorkerId = null;
        } else if (!hit) {
          this.audio.playClick();
          this.levelState.selectedWorkerId = null;
          this._spawnParticle(selWorker.x, selWorker.y - 42, 'Výběr zrušen', '#6d5846');
          this.levelState.hoveredTarget = null;
          return;
        } else {
          this.audio.playClick();
          const result = this._commandWorker(selWorker, hit);
          if (result.ok) {
            this.levelState.selectedWorkerId = null;
            this._spawnParticle(selWorker.x, selWorker.y - 46, result.feedback, '#2a9d8f');
          } else {
            this._spawnParticle(pt.x, pt.y - 24, result.reason, '#d95d4a');
          }
          this.levelState.hoveredTarget = this._hitTest(pt.x, pt.y);
          return;
        }
      }

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

    _getWorkerCommandHint(w, hit) {
      const plan = this._buildForcedWorkerTasks(w, hit);
      if (plan.ok) {
        return `👉 Přikázat (${w.label}): ${plan.shortHint || plan.feedback}`;
      }
      return `⛔ ${w.label}: ${plan.reason}`;
    }

    _buildForcedWorkerTasks(w, hit) {
      if (!w || !hit || !this.levelState) return { ok: false, reason: 'Neplatný cíl.' };
      const state = this.levelState;
      const role = w.role;

      if (role === 'tonik') {
        if (hit.kind === 'car') {
          const car = hit.obj;
          if (car.state !== 'waiting') {
            return { ok: false, reason: 'Auto teď nestojí na místě k obsluze.' };
          }
          if (car.serviceBayId) {
            const baySt = this.data.STATIONS[car.serviceBayId];
            const bayOrd = car.orders.find(
              (o) => !o.done && (o.itemId === car.serviceBayId || (baySt && o.itemId === baySt.itemId))
            );
            if (baySt && bayOrd && this._isStationUnlocked(baySt.id)) {
              const feedback = bayOrd.itemId === 'vacuum' ? '🌀 Toník jde vysát auto!' : '💨 Toník jde dofouknout kola!';
              return {
                ok: true,
                clearBroom: true,
                tasks: [
                  {
                    type: 'serviceCarBay',
                    carId: car.id,
                    stationId: baySt.id,
                    itemId: bayOrd.itemId,
                    x: baySt.walkX,
                    y: baySt.walkY
                  }
                ],
                feedback,
                shortHint: bayOrd.itemId === 'vacuum' ? 'Vysát auto' : 'Dofouknout kola'
              };
            }
            return { ok: false, reason: 'Toník u tohoto auta teď nemá co obsloužit.' };
          }

          const pump = this.data.STATIONS[`pump_${car.pumpIndex}`];
          if (!pump) return { ok: false, reason: 'Neplatný stojan.' };
          const fuelOrd = car.orders.find((o) => !o.done && o.itemId === 'fuel');
          if (fuelOrd) {
            return {
              ok: true,
              clearBroom: true,
              tasks: [
                {
                  type: 'fuelCar',
                  carId: car.id,
                  pumpIndex: car.pumpIndex,
                  x: pump.walkX,
                  y: pump.walkY
                }
              ],
              feedback: '⛽ Toník jde hned natankovat!',
              shortHint: `Natankovat (${pump.label})`
            };
          }
          const washOrd = this._isStationUnlocked('bucket')
            ? car.orders.find((o) => !o.done && o.itemId === 'wash')
            : null;
          if (washOrd) {
            if (w.held.includes('wash')) {
              return {
                ok: true,
                tasks: [
                  {
                    type: 'serveCar',
                    carId: car.id,
                    itemId: 'wash',
                    x: pump.walkX,
                    y: Math.min(558, pump.walkY + 24)
                  }
                ],
                feedback: '🧽 Toník jde hned umýt sklo!',
                shortHint: `Umýt sklo (${pump.label})`
              };
            }
            const bucket = this.data.STATIONS.bucket;
            return {
              ok: true,
              needsSlot: 'wash',
              tasks: [
                {
                  type: 'prep',
                  stationId: bucket.id,
                  itemId: 'wash',
                  x: bucket.walkX,
                  y: bucket.walkY
                },
                {
                  type: 'serveCar',
                  carId: car.id,
                  itemId: 'wash',
                  x: pump.walkX,
                  y: Math.min(558, pump.walkY + 24)
                }
              ],
              feedback: '🧽 Toník jde pro vodu a umýt sklo!',
              shortHint: `Umýt sklo (${pump.label})`
            };
          }
          return { ok: false, reason: 'Auto už má vše na nádvoří hotové.' };
        }

        if (hit.kind === 'station') {
          const st = hit.obj;
          if (st.type === 'pump') {
            const carAtPump = state.cars.find((c) => c.pumpIndex === st.pumpIndex && c.state === 'waiting');
            if (!carAtPump) return { ok: false, reason: 'U tohoto stojanu teď nestojí auto.' };
            return this._buildForcedWorkerTasks(w, { kind: 'car', id: carAtPump.id, obj: carAtPump });
          }
          if (st.type === 'service') {
            const carAtBay = state.cars.find((c) => c.serviceBayId === st.id && c.state === 'waiting');
            if (!carAtBay) return { ok: false, reason: 'U tohoto stanoviště teď nestojí auto.' };
            return this._buildForcedWorkerTasks(w, { kind: 'car', id: carAtBay.id, obj: carAtBay });
          }
          if (st.id === 'bucket') {
            if (w.held.includes('wash')) {
              const washCar = state.cars.find(
                (c) => c.state === 'waiting' && !c.serviceBayId && c.orders.some((o) => !o.done && o.itemId === 'wash')
              );
              if (washCar) {
                return this._buildForcedWorkerTasks(w, { kind: 'car', id: washCar.id, obj: washCar });
              }
              return { ok: false, reason: 'Toník už má vodu na okna v ruce.' };
            }
            return {
              ok: true,
              needsSlot: 'wash',
              tasks: [
                {
                  type: 'prep',
                  stationId: st.id,
                  itemId: 'wash',
                  x: st.walkX,
                  y: st.walkY
                }
              ],
              feedback: '🧽 Toník jde nabrat vodu na okna!',
              shortHint: 'Nabrat vodu na okna'
            };
          }
          if (st.id === 'trash' && w.held.length > 0) {
            return {
              ok: true,
              tasks: [{ type: 'trash', x: st.walkX, y: st.walkY }],
              feedback: '🗑️ Toník jde vysypat ruce!',
              shortHint: 'Vyhodit věci do koše'
            };
          }
        }
        return { ok: false, reason: 'Toník jen tankuje, myje skla, dofukuje pneu a vysává auta!' };
      }

      if (role === 'anicka') {
        if (hit.kind === 'station') {
          const st = hit.obj;
          if (st.id === 'coffee' || st.id === 'grill' || st.id === 'fridge') {
            const ms = state.machineState && state.machineState[st.id];
            const spec = this.data.BISTRO_MACHINES && this.data.BISTRO_MACHINES[st.id];
            if (ms && ms.broken) {
              return { ok: false, reason: 'Porouchaný stroj musí opravit jedině hráč!' };
            }
            if (!ms || !spec || ms.stock >= ms.maxStock) {
              return { ok: false, reason: 'Tento stroj už má plné suroviny!' };
            }
            if (w.held.includes(spec.supplyItemId)) {
              return {
                ok: true,
                tasks: [
                  {
                    type: 'restockMachine',
                    stationId: st.id,
                    machineRestockId: st.id,
                    supplyItemId: spec.supplyItemId,
                    forced: true,
                    x: st.walkX,
                    y: st.walkY
                  }
                ],
                feedback: `${this.data.ITEMS[spec.supplyItemId].icon} Anička jde hned doplnit ${st.label}!`,
                shortHint: `Doplnit ${st.label}`
              };
            }
            const storage = this.data.STATIONS.storage;
            return {
              ok: true,
              needsSlot: spec.supplyItemId,
              tasks: [
                {
                  type: 'prep',
                  stationId: storage.id,
                  itemId: spec.supplyItemId,
                  x: storage.walkX,
                  y: storage.walkY
                },
                {
                  type: 'restockMachine',
                  stationId: st.id,
                  machineRestockId: st.id,
                  supplyItemId: spec.supplyItemId,
                  forced: true,
                  x: st.walkX,
                  y: st.walkY
                }
              ],
              feedback: `${this.data.ITEMS[spec.supplyItemId].icon} Anička jde pro zásoby a doplní ${st.label}!`,
              shortHint: `Doplnit ${st.label} ze skladu`
            };
          }
          if (st.id === 'storage') {
            const needList = Object.values((state && state.machineState) || {})
              .filter((m) => m && m.stock < m.maxStock)
              .sort((a, b) => a.stock - b.stock);
            const targetM = needList[0];
            if (!targetM) {
              return { ok: false, reason: 'Kávovar, gril i limonády mají plné suroviny!' };
            }
            const spec = this.data.BISTRO_MACHINES[targetM.id];
            const mSt = this.data.STATIONS[targetM.id];
            const tasks = [];
            if (!w.held.includes(spec.supplyItemId)) {
              tasks.push({
                type: 'prep',
                stationId: st.id,
                itemId: spec.supplyItemId,
                x: st.walkX,
                y: st.walkY
              });
            }
            tasks.push({
              type: 'restockMachine',
              stationId: mSt.id,
              machineRestockId: mSt.id,
              supplyItemId: spec.supplyItemId,
              forced: true,
              x: mSt.walkX,
              y: mSt.walkY
            });
            return {
              ok: true,
              needsSlot: w.held.includes(spec.supplyItemId) ? null : spec.supplyItemId,
              tasks,
              feedback: `${this.data.ITEMS[spec.supplyItemId].icon} Anička jde doplnit ${mSt.label}!`,
              shortHint: `Doplnit ${mSt.label} ze skladu`
            };
          }
          if (st.id === 'trash' && w.held.length > 0) {
            return {
              ok: true,
              tasks: [{ type: 'trash', x: st.walkX, y: st.walkY }],
              feedback: '🗑️ Anička jde odložit věci do koše!',
              shortHint: 'Vyhodit věci do koše'
            };
          }
          return { ok: false, reason: 'Anička obsluhuje jen kávovar, gril, limonády a doplňuje jejich suroviny!' };
        }
        if (hit.kind === 'customer') {
          const cust = hit.obj;
          if (cust.state === 'leaving' || cust.state === 'returning_to_car' || cust.state === 'waiting_driver') {
            return { ok: false, reason: 'Tento zákazník už odchází.' };
          }
          if (cust.state === 'paying') {
            return { ok: false, reason: 'Pokladnu obsluhuje Kuba (Anička připravuje bistro)!' };
          }
          if (cust.spotIndex < 0) {
            return { ok: false, reason: 'Zákazník si jen bere zboží z regálu.' };
          }
          const spot = this.data.SHOP_SPOTS[cust.spotIndex];
          const bistroItems = ['coffee', 'snack', 'drink'];
          const undone = cust.orders.filter(
            (o) => !o.done && bistroItems.includes(o.itemId) && this._isItemUnlocked(o.itemId)
          );
          if (undone.length === 0 || !spot) {
            return { ok: false, reason: 'Zákazník nechce kávu, gril ani limonádu.' };
          }
          const heldMatch = undone.find((o) => w.held.includes(o.itemId));
          if (heldMatch) {
            const itemDef = this.data.ITEMS[heldMatch.itemId];
            return {
              ok: true,
              tasks: [
                {
                  type: 'serveCustomer',
                  custId: cust.id,
                  itemId: heldMatch.itemId,
                  x: spot.serveX,
                  y: spot.serveY
                }
              ],
              feedback: `${itemDef.icon} Anička to hned nese zákazníkovi!`,
              shortHint: `Obsloužit (${itemDef.name})`
            };
          }
          // Prefer non-broken machine first
          const nextOrd =
            undone.find((o) => {
              const sid = this.data.ITEMS[o.itemId].stationId;
              const m = state.machineState && state.machineState[sid];
              return !m || !m.broken;
            }) || undone[0];
          const itemDef = this.data.ITEMS[nextOrd.itemId];
          const st = this.data.STATIONS[itemDef.stationId];
          const ms = state.machineState && state.machineState[st.id];
          if (ms && ms.broken) {
            return { ok: false, reason: `${st.label} je porouchaný – opravit ho musí hráč!` };
          }
          if (ms && ms.stock <= 0) {
            const spec = this.data.BISTRO_MACHINES[st.id];
            const storage = this.data.STATIONS.storage;
            const tasks = [];
            if (!w.held.includes(spec.supplyItemId)) {
              tasks.push({
                type: 'prep',
                stationId: storage.id,
                itemId: spec.supplyItemId,
                x: storage.walkX,
                y: storage.walkY
              });
            }
            tasks.push({
              type: 'restockMachine',
              stationId: st.id,
              machineRestockId: st.id,
              supplyItemId: spec.supplyItemId,
              forced: true,
              x: st.walkX,
              y: st.walkY
            });
            tasks.push({
              type: 'prep',
              stationId: st.id,
              itemId: nextOrd.itemId,
              x: st.walkX,
              y: st.walkY
            });
            tasks.push({
              type: 'serveCustomer',
              custId: cust.id,
              itemId: nextOrd.itemId,
              x: spot.serveX,
              y: spot.serveY
            });
            return {
              ok: true,
              needsSlot: w.held.includes(spec.supplyItemId) ? nextOrd.itemId : spec.supplyItemId,
              tasks,
              feedback: `${this.data.ITEMS[spec.supplyItemId].icon} Anička doplní ${st.label} a obslouží!`,
              shortHint: `Doplnit a obsloužit (${itemDef.name})`
            };
          }
          return {
            ok: true,
            needsSlot: nextOrd.itemId,
            tasks: [
              {
                type: 'prep',
                stationId: st.id,
                itemId: nextOrd.itemId,
                x: st.walkX,
                y: st.walkY
              },
              {
                type: 'serveCustomer',
                custId: cust.id,
                itemId: nextOrd.itemId,
                x: spot.serveX,
                y: spot.serveY
              }
            ],
            feedback: `${st.icon} Anička jde připravit a donést ${itemDef.name}!`,
            shortHint: `Připravit a donést (${itemDef.name})`
          };
        }
        return { ok: false, reason: 'Anička jen připravuje kávu, občerstvení, limonády a doplňuje jejich suroviny!' };
      }

      if (role === 'kuba') {
        const buildSpillCleanPlan = (firstSpill) => {
          const broom = this.data.STATIONS.broom;
          const tasks = [];
          const hasBroom = w.held.includes('broom');
          if (!hasBroom) {
            tasks.push({ type: 'takeBroom', x: broom.walkX, y: broom.walkY });
          }
          let refX = hasBroom ? w.x : broom.walkX;
          let refY = hasBroom ? w.y : broom.walkY;
          const remaining = state.spills.filter((s) => s.id !== firstSpill.id);
          tasks.push({ type: 'cleanSpill', spillId: firstSpill.id, x: firstSpill.x, y: firstSpill.y - 8 });
          refX = firstSpill.x;
          refY = firstSpill.y - 8;
          while (remaining.length > 0) {
            let bestIdx = 0;
            let bestDist = Infinity;
            for (let i = 0; i < remaining.length; i++) {
              const d = Math.hypot(remaining[i].x - refX, remaining[i].y - refY);
              if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
              }
            }
            const nextSp = remaining.splice(bestIdx, 1)[0];
            tasks.push({ type: 'cleanSpill', spillId: nextSp.id, x: nextSp.x, y: nextSp.y - 8 });
            refX = nextSp.x;
            refY = nextSp.y - 8;
          }
          tasks.push({ type: 'returnBroom', x: broom.walkX, y: broom.walkY });
          return {
            ok: true,
            needsSlot: hasBroom ? null : 'broom',
            tasks,
            feedback: '🧹 Kuba jde hned uklidit louže!',
            shortHint: 'Uklidit louže'
          };
        };

        if (hit.kind === 'rack') {
          const rack = hit.obj;
          if (rack.stock >= rack.maxStock) {
            return { ok: false, reason: 'Tento regál už je úplně plný!' };
          }
          if (w.held.includes('crate')) {
            return {
              ok: true,
              clearBroom: true,
              tasks: [
                {
                  type: 'restockRack',
                  rackId: rack.id,
                  forced: true,
                  x: rack.walkX,
                  y: rack.walkY
                }
              ],
              feedback: `📦 Kuba jde hned doplnit ${rack.label}!`,
              shortHint: `Doplnit ${rack.label}`
            };
          }
          const storage = this.data.STATIONS.storage;
          return {
            ok: true,
            clearBroom: true,
            needsSlot: 'crate',
            tasks: [
              {
                type: 'prep',
                stationId: storage.id,
                itemId: 'crate',
                x: storage.walkX,
                y: storage.walkY
              },
              {
                type: 'restockRack',
                rackId: rack.id,
                forced: true,
                x: rack.walkX,
                y: rack.walkY
              }
            ],
            feedback: `📦 Kuba jde pro krabici a doplnit ${rack.label}!`,
            shortHint: `Doplnit ${rack.label}`
          };
        }

        if (hit.kind === 'spill') {
          return buildSpillCleanPlan(hit.obj);
        }

        if (hit.kind === 'customer') {
          if (hit.obj.state === 'paying') {
            const reg = this.data.STATIONS.register;
            return {
              ok: true,
              clearBroom: true,
              tasks: [{ type: 'register', x: reg.walkX, y: reg.walkY }],
              feedback: '📠 Kuba běží na pokladnu!',
              shortHint: 'Obsloužit pokladnu'
            };
          }
          return { ok: false, reason: 'Kuba obsluhuje zákazníky až u pokladny!' };
        }

        if (hit.kind === 'station') {
          const st = hit.obj;
          if (st.id === 'register') {
            const hasPaying = state.customers.some((c) => c.state === 'paying');
            return {
              ok: true,
              clearBroom: true,
              tasks: [
                hasPaying
                  ? { type: 'register', x: st.walkX, y: st.walkY }
                  : { type: 'walk', x: st.walkX, y: st.walkY }
              ],
              feedback: hasPaying ? '📠 Kuba běží na pokladnu!' : '📠 Kuba jde hlídat pokladnu!',
              shortHint: hasPaying ? 'Obsloužit pokladnu' : 'Stoupnout si k pokladně'
            };
          }
          if (st.id === 'storage') {
            const nonFullRack = state.racks
              .filter((r) => r.stock < r.maxStock)
              .sort((a, b) => a.stock - b.stock)[0];
            if (!nonFullRack) {
              return { ok: false, reason: 'Všechny regály v obchodě jsou už plné!' };
            }
            if (w.held.includes('crate')) {
              return {
                ok: true,
                clearBroom: true,
                tasks: [
                  {
                    type: 'restockRack',
                    rackId: nonFullRack.id,
                    forced: true,
                    x: nonFullRack.walkX,
                    y: nonFullRack.walkY
                  }
                ],
                feedback: `📦 Kuba jde doplnit ${nonFullRack.label}!`,
                shortHint: `Doplnit ${nonFullRack.label}`
              };
            }
            return {
              ok: true,
              clearBroom: true,
              needsSlot: 'crate',
              tasks: [
                {
                  type: 'prep',
                  stationId: st.id,
                  itemId: 'crate',
                  x: st.walkX,
                  y: st.walkY
                },
                {
                  type: 'restockRack',
                  rackId: nonFullRack.id,
                  forced: true,
                  x: nonFullRack.walkX,
                  y: nonFullRack.walkY
                }
              ],
              feedback: `📦 Kuba jde do skladu a doplní ${nonFullRack.label}!`,
              shortHint: `Vzít krabici a doplnit ${nonFullRack.label}`
            };
          }
          if (st.id === 'broom') {
            if (state.spills.length > 0) {
              return buildSpillCleanPlan(state.spills[0]);
            }
            if (w.held.includes('broom')) {
              return {
                ok: true,
                tasks: [{ type: 'returnBroom', x: st.walkX, y: st.walkY }],
                feedback: '🧹 Kuba jde vrátit koště!',
                shortHint: 'Vrátit koště'
              };
            }
            return { ok: false, reason: 'Venku teď není žádná louže k úklidu.' };
          }
          if (st.id === 'trash' && w.held.length > 0) {
            return {
              ok: true,
              tasks: [{ type: 'trash', x: st.walkX, y: st.walkY }],
              feedback: '🗑️ Kuba jde vysypat ruce!',
              shortHint: 'Vyhodit věci do koše'
            };
          }
        }
        return { ok: false, reason: 'Kuba jen obsluhuje pokladnu, doplňuje regály a uklízí louže!' };
      }

      return { ok: false, reason: `${w.label} tuto činnost nemá v popisu práce.` };
    }

    _commandWorker(w, hit) {
      const plan = this._buildForcedWorkerTasks(w, hit);
      if (!plan.ok) return plan;

      // Cancel whatever the employee is currently doing right now
      w.actionTimer = 0;
      w.actionDuration = 0;
      w.currentTask = null;
      w.taskQueue = [];
      w.waypoints = [];
      w.moving = false;

      if (plan.clearBroom) {
        const bIdx = w.held.indexOf('broom');
        if (bIdx !== -1) w.held.splice(bIdx, 1);
      }
      if (plan.needsSlot && w.held.length >= w.maxCarry) {
        const dropIdx = w.held.findIndex((id) => id !== plan.needsSlot);
        if (dropIdx !== -1) w.held.splice(dropIdx, 1);
        else w.held.shift();
      }

      plan.tasks.forEach((t) => w.taskQueue.push(t));
      return plan;
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
        if (task.type === 'restockMachine' && task.supplyItemId) {
          const idx = inv.indexOf(task.supplyItemId);
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
        const ms = this.levelState.machineState && this.levelState.machineState[st.id];
        const spec = this.data.BISTRO_MACHINES && this.data.BISTRO_MACHINES[st.id];
        if (ms && spec) {
          if (ms.broken) {
            player.taskQueue.push({
              type: 'repairMachine',
              stationId: st.id,
              x: st.walkX,
              y: st.walkY
            });
            return;
          }
          const plannedInv = this._getPlannedInventory(player);
          if (ms.stock <= 0 || (plannedInv.includes(spec.supplyItemId) && ms.stock < ms.maxStock)) {
            if (plannedInv.includes(spec.supplyItemId)) {
              player.taskQueue.push({
                type: 'restockMachine',
                stationId: st.id,
                machineRestockId: st.id,
                supplyItemId: spec.supplyItemId,
                forced: true,
                x: st.walkX,
                y: st.walkY
              });
            } else if (!this.settings.smartAssist) {
              const supIt = this.data.ITEMS[spec.supplyItemId];
              this._spawnParticle(player.x, player.y - 45, `Vezmi ${supIt ? supIt.icon : '📦'} ze skladu!`, '#d95d4a');
            } else if (plannedInv.length < player.maxCarry) {
              const storage = this.data.STATIONS.storage;
              player.taskQueue.push({
                type: 'prep',
                stationId: storage.id,
                itemId: spec.supplyItemId,
                x: storage.walkX,
                y: storage.walkY
              });
              player.taskQueue.push({
                type: 'restockMachine',
                stationId: st.id,
                machineRestockId: st.id,
                supplyItemId: spec.supplyItemId,
                forced: true,
                x: st.walkX,
                y: st.walkY
              });
            } else {
              this._spawnParticle(player.x, player.y - 45, 'Plný tác!', '#d95d4a');
            }
            return;
          }
        }
        if (st.id === 'storage') {
          const plannedInv = this._getPlannedInventory(player);
          const anyRackEmpty = this.levelState.racks && this.levelState.racks.some((r) => r.stock <= 0);
          const emptyMachine = Object.values(this.levelState.machineState || {}).find((m) => m && m.stock <= 0);
          if (emptyMachine && !anyRackEmpty) {
            const spec = this.data.BISTRO_MACHINES[emptyMachine.id];
            if (spec && !plannedInv.includes(spec.supplyItemId)) {
              player.taskQueue.push({
                type: 'prep',
                stationId: st.id,
                itemId: spec.supplyItemId,
                x: st.walkX,
                y: st.walkY
              });
              return;
            }
          }
        }
        player.taskQueue.push({
          type: 'prep',
          stationId: st.id,
          itemId: st.itemId,
          x: st.walkX,
          y: st.walkY
        });
      } else if (st.type === 'service') {
        const carAtBay = this.levelState.cars.find(
          (c) => c.serviceBayId === st.id && c.state === 'waiting'
        );
        if (carAtBay && carAtBay.orders.some((o) => o.itemId === st.itemId && !o.done)) {
          player.taskQueue.push({
            type: 'serviceCarBay',
            carId: carAtBay.id,
            stationId: st.id,
            itemId: st.itemId,
            x: st.walkX,
            y: st.walkY
          });
        } else {
          player.taskQueue.push({ type: 'walk', x: st.walkX, y: st.walkY });
        }
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
      const undone = car.orders.filter((o) => !o.done);
      if (undone.length === 0) return;

      if (car.serviceBayId) {
        const baySt = this.data.STATIONS[car.serviceBayId];
        const bayOrder = undone.find((o) => o.itemId === car.serviceBayId || (baySt && o.itemId === baySt.itemId));
        if (baySt && bayOrder) {
          player.taskQueue.push({
            type: 'serviceCarBay',
            carId: car.id,
            stationId: baySt.id,
            itemId: bayOrder.itemId,
            x: baySt.walkX,
            y: baySt.walkY
          });
          return;
        }
      }

      const pump = this.data.STATIONS[`pump_${car.pumpIndex}`];
      if (!pump) return;

      const fuelOrder = undone.find((o) => o.itemId === 'fuel');
      const plannedInv = this._getPlannedInventory(player);

      const matchingHeldOrder = undone.find((o) => o.itemId !== 'fuel' && plannedInv.includes(o.itemId));
      if (matchingHeldOrder) {
        player.taskQueue.push({
          type: 'serveCar',
          carId: car.id,
          itemId: matchingHeldOrder.itemId,
          x: pump.walkX,
          y: Math.min(558, pump.walkY + 24)
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
      if (!station || station.type === 'service') return;
      if (!this.settings.smartAssist) {
        this._spawnParticle(player.x, player.y - 45, `Vezmi ${itemDef.icon} ${itemDef.name}`, '#d95d4a');
        return;
      }
      if (plannedInv.length < player.maxCarry) {
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
          y: Math.min(558, pump.walkY + 24)
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
        const ms = this.levelState.machineState && this.levelState.machineState[station.id];
        const spec = this.data.BISTRO_MACHINES && this.data.BISTRO_MACHINES[station.id];
        if (ms && ms.broken) {
          this._spawnParticle(station.x, station.y - 46, `🔧 Oprav nejprve ${station.label}!`, '#d95d4a');
          return;
        }
        if (ms && ms.stock <= 0) {
          this._spawnParticle(
            station.x,
            station.y - 46,
            `⚠️ ${(spec && spec.emptyLabel) || 'Došly suroviny!'} Doplň ze skladu 📦`,
            '#d95d4a'
          );
          return;
        }
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
      if (typeof worker.workMultiplier === 'number' && worker.workMultiplier > 0) {
        return worker.workMultiplier;
      }
      const defWage = (this.data && this.data.STAFF_WAGE_CONFIG && this.data.STAFF_WAGE_CONFIG.defaultWage) || 14;
      const rawWage =
        this.save && this.save.staffWage && typeof this.save.staffWage[worker.id] === 'number'
          ? this.save.staffWage[worker.id]
          : defWage;
      return Math.max(0.5, this._getStaffWagePerformance(rawWage).workMultiplier || 1.0);
    }

    _getPrepDuration(itemId, worker) {
      const base = this.data.ITEMS[itemId].prepTime;
      let upgLevel = 1;
      if (itemId === 'fuel') upgLevel = this._getEffectiveUpgrade('pumps');
      else if (itemId === 'coffee') upgLevel = this._getEffectiveUpgrade('coffee');
      else if (itemId === 'snack') upgLevel = this._getEffectiveUpgrade('grill');
      else if (itemId === 'wash') upgLevel = this._getEffectiveUpgrade('wash');
      else if (itemId === 'air') upgLevel = this._getEffectiveUpgrade('air');
      else if (itemId === 'vacuum') upgLevel = this._getEffectiveUpgrade('vacuum');
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
      else if (itemId === 'air') bonus = (this._getEffectiveUpgrade('air_price') - 1) * 1;
      else if (itemId === 'vacuum') bonus = (this._getEffectiveUpgrade('vacuum_price') - 1) * 1;
      else if (itemId === 'drink') bonus = (this._getEffectiveUpgrade('drink_price') - 1) * 1;
      else if (itemId === 'fuel') bonus = (this._getEffectiveUpgrade('pumps_price') - 1) * 1;
      else if (item.isRackItem) bonus = (this._getEffectiveUpgrade('racks_price') - 1) * 1;
      return item.basePrice + bonus;
    }

    _getEffectiveSpawnInterval(level) {
      const base = (level && level.spawnInterval) || 6.8;
      if (!this.save) return base;
      const staff = this.save.staff || {};
      const staffWage = this.save.staffWage || {};

      const shoesExtra = this._getEffectiveUpgrade('shoes') >= 2 ? 1 : 0;
      const carryExtra = Math.max(0, this._getEffectiveUpgrade('carry') - 1);
      let upgradeReduction = shoesExtra * 0.35 + carryExtra * 0.2;

      const pumpExtra = Math.max(0, this._getEffectiveUpgrade('pump_unlock') - 1);
      upgradeReduction += pumpExtra * 0.12;

      const speedKeys = ['pumps', 'coffee', 'grill', 'wash', 'air', 'vacuum', 'drink_speed'];
      let speedSum = 0;
      speedKeys.forEach((k) => {
        speedSum += Math.max(0, this._getEffectiveUpgrade(k) - 1);
      });
      upgradeReduction += (speedSum / speedKeys.length) * 0.25;

      const defWage = (this.data && this.data.STAFF_WAGE_CONFIG && this.data.STAFF_WAGE_CONFIG.defaultWage) || 14;
      ['tonik', 'anicka', 'kuba'].forEach((sid) => {
        const cap = this.getStaffCap(sid);
        const isHired = cap > 0 && (staff[sid] || 0) > 0;
        if (isHired) {
          const rawW = typeof staffWage[sid] === 'number' ? staffWage[sid] : defWage;
          const perf = this._getStaffWagePerformance(rawW);
          if (perf.active) {
            upgradeReduction += perf.spawnReduction;
          }
        }
      });

      const maxShiftReduction = Math.min(1.85, base * 0.22);
      const effective = base - Math.min(maxShiftReduction, upgradeReduction);
      return Math.max(5.5, Number(effective.toFixed(2)));
    }

    _updateLevel(dt) {
      const state = this.levelState;
      state.time += dt;

      if (state.machineBreakdowns && state.machineBreakdowns.length > 0 && state.machineState) {
        state.machineBreakdowns.forEach((bd) => {
          if (bd.triggered || state.time < bd.atTime) return;
          const ms = state.machineState[bd.stationId];
          if (!ms || ms.broken) {
            bd.triggered = true;
            return;
          }
          const inUse = state.workers.some(
            (w) => w.active && w.actionTimer > 0 && w.currentTask && w.currentTask.stationId === bd.stationId
          );
          if (inUse) {
            bd.atTime = state.time + 0.6;
            return;
          }
          bd.triggered = true;
          ms.broken = true;
          const st = this.data.STATIONS[bd.stationId];
          const spec = this.data.BISTRO_MACHINES && this.data.BISTRO_MACHINES[bd.stationId];
          this.audio.playSad();
          if (st) {
            this._spawnParticle(
              st.x,
              st.y - 46,
              `🔧 Porucha: ${(spec && spec.label) || st.label}! Oprav ho!`,
              '#c94436',
              15
            );
          }
        });
      }

      if (state.spawnedCount < state.level.customers) {
        state.spawnTimer -= dt;
        if (state.spawnTimer <= 0) {
          const spawned = this._trySpawnVisitor();
          if (spawned) {
            state.spawnedCount += 1;
            const effectiveInterval = this._getEffectiveSpawnInterval(state.level);
            state.spawnTimer = effectiveInterval * (0.85 + Math.random() * 0.3);
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
      const heavyIndices = (stage.limits && stage.limits.heavyPumpIndices) || (hasHeavyPump ? [3] : []);
      const freeHeavyPumps = heavyIndices.filter((idx) => !state.cars.some((c) => c.pumpIndex === idx));
      const heavyPumpFree = freeHeavyPumps.length > 0;
      const anyPumpFree = freeNormalPumps.length > 0 || heavyPumpFree;
      const curStageId = (stage && stage.id) || 1;
      const freeServiceBays = [];
      ['air', 'vacuum'].forEach((bayId) => {
        if (!this._isStationUnlocked(bayId)) return;
        const baySt = this.data.STATIONS[bayId];
        const busy = state.cars.some((c) => {
          if (c.serviceBayId === bayId) {
            return c.state !== 'leaving' || !baySt || c.y <= baySt.carY + 55;
          }
          if (c.prevServiceBayId === bayId && c.state === 'arriving') {
            return curStageId === 3 ? c.x > 350 : c.x < 330;
          }
          return false;
        });
        if (!busy) {
          freeServiceBays.push(bayId);
        }
      });
      const anyVehicleBayFree = anyPumpFree || freeServiceBays.length > 0;

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

      if (!anyVehicleBayFree && freeSpots.length === 0) return false;

      const spawnPos = { x: -110, y: 738 };
      const entranceClear = !state.cars.some(
        (c) => Math.hypot(c.x - spawnPos.x, c.y - spawnPos.y) < 145
      );

      let spawnCar = Math.random() < lvl.carChance;
      if (spawnCar && (!anyVehicleBayFree || !entranceClear)) spawnCar = false;
      if (!spawnCar && freeSpots.length === 0) {
        if (!anyVehicleBayFree || !entranceClear) return false;
        spawnCar = true;
      }

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
        } else if (!isHeavy && freeNormalPumps.length === 0 && freeServiceBays.length === 0 && heavyPumpFree) {
          const bChance = stage.busChance || 0;
          const tChance = stage.truckChance || 0;
          if (bChance > 0 && Math.random() < bChance / Math.max(0.01, bChance + tChance)) {
            wantBus = true;
          } else {
            wantTruck = true;
          }
          isHeavy = true;
        }

        // Non-heavy passenger cars can start at unlocked air/vacuum bays (either service-only or service -> fuel -> pay)
        let serviceBayId = null;
        if (!isHeavy && freeServiceBays.length > 0 && (freeNormalPumps.length === 0 || Math.random() < 0.42)) {
          serviceBayId = freeServiceBays[Math.floor(Math.random() * freeServiceBays.length)];
        }

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

        const orders = [];
        let pumpIndex = -1;
        let targetDest = null;

        if (serviceBayId) {
          const serviceSt = this.data.STATIONS[serviceBayId];
          orders.push({ itemId: serviceBayId, done: false });
          // Half of service-bay cars also want fuel afterwards!
          if (Math.random() < 0.55) {
            orders.push({ itemId: 'fuel', done: false });
            if (this._isItemUnlocked('wash') && lvl.orders.includes('wash') && Math.random() < lvl.multiChance * 0.5) {
              orders.push({ itemId: 'wash', done: false });
            }
          }
          targetDest = serviceSt;
        } else {
          pumpIndex = isHeavy
            ? freeHeavyPumps[Math.floor(Math.random() * freeHeavyPumps.length)]
            : freeNormalPumps[Math.floor(Math.random() * freeNormalPumps.length)];
          targetDest = this.data.STATIONS[`pump_${pumpIndex}`];
          orders.push({ itemId: 'fuel', done: false });
          if (this._isItemUnlocked('wash') && lvl.orders.includes('wash') && Math.random() < lvl.multiChance) {
            orders.push({ itemId: 'wash', done: false });
          }
        }

        const carPatience = isHeavy ? Math.round(maxPatience + 8) : maxPatience;
        const carObj = {
          id: state.nextEntityId++,
          pumpIndex,
          serviceBayId,
          x: spawnPos.x,
          y: spawnPos.y,
          targetX: targetDest.carX,
          targetY: targetDest.carY,
          angle: 0,
          targetAngle: typeof targetDest.carAngle === 'number' ? targetDest.carAngle : 0,
          topDown: true,
          reversing: false,
          waypoints: [],
          pauseTimer: 0,
          blocked: false,
          blockedTimer: 0,
          state: 'arriving',
          orders,
          patience: carPatience,
          maxPatience: carPatience,
          color,
          roofColor,
          variant,
          isHeavy
        };
        carObj.waypoints = serviceBayId
          ? this._buildCarBayArrivalPlan(carObj, targetDest, stage.id)
          : this._buildCarArrivalPlan(carObj, targetDest, stage.id);
        state.cars.push(carObj);
      } else {
        const spotIndex = freeSpots[Math.floor(Math.random() * freeSpots.length)];
        const bistroAllowed = lvl.orders.filter(
          (o) =>
            this.data.ITEMS[o] &&
            !this.data.ITEMS[o].isRackItem &&
            o !== 'fuel' &&
            o !== 'wash' &&
            o !== 'air' &&
            o !== 'vacuum' &&
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
        let sx = 700 + Math.random() * 540;
        let sy = 412 + Math.random() * 28;
        if (!inShop) {
          if (stage.id === 4) {
            if (Math.random() < 0.5) {
              sx = 74 + Math.random() * 140;
              sy = 435 + Math.random() * 105;
            } else {
              sx = 410 + Math.random() * 85;
              sy = 230 + Math.random() * 270;
            }
          } else {
            sx = 395 + Math.random() * 135;
            sy = 392 + Math.random() * 140;
          }
        }
        state.spills.push({
          id: state.nextEntityId++,
          type: inShop ? 'coffee' : 'oil',
          x: sx,
          y: sy
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

    _stepPedestrian(ent, finalX, finalY, speed, arriveThreshold, dt) {
      if (ent._rerouteCooldown > 0) {
        ent._rerouteCooldown = Math.max(0, ent._rerouteCooldown - dt);
      }
      const nextPt =
        ent.waypoints && ent.waypoints.length > 0 ? ent.waypoints[0] : { x: finalX, y: finalY };
      const dx = nextPt.x - ent.x;
      const dy = nextPt.y - ent.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= arriveThreshold) {
        ent.x = nextPt.x;
        ent.y = nextPt.y;
        if (ent.waypoints && ent.waypoints.length > 0) {
          ent.waypoints.shift();
          ent.moving = true;
          return true;
        }
        ent.moving = false;
        return false;
      }

      const step = Math.min(dist, speed * dt);
      let nx = ent.x + (dx / dist) * step;
      let ny = ent.y + (dy / dist) * step;

      if (this._getZone(ent.x, ent.y) === 'outside' || this._getZone(nx, ny) === 'outside') {
        const boxes = this._getOutsideObstacles({
          includeBuilding: true,
          stationPad: -1,
          carPadL: 0.5,
          carPadW: 2
        });
        let hit = false;
        for (let i = 0; i < boxes.length; i++) {
          if (this._segmentHitsAABB(ent.x, ent.y, nx, ny, boxes[i]) || this._pointInBox(nx, ny, boxes[i], 0)) {
            hit = true;
            break;
          }
        }
        if (hit) {
          if (!ent._rerouteCooldown || ent._rerouteCooldown <= 0) {
            ent._rerouteCooldown = 0.25;
            const repath = this._buildPath(ent.x, ent.y, finalX, finalY);
            if (repath.length > 0) {
              ent.waypoints = repath;
              const rw = ent.waypoints[0];
              const rdx = rw.x - ent.x;
              const rdy = rw.y - ent.y;
              const rdist = Math.hypot(rdx, rdy);
              if (rdist > 1) {
                const rstep = Math.min(rdist, speed * dt);
                nx = ent.x + (rdx / rdist) * rstep;
                ny = ent.y + (rdy / rdist) * rstep;
              }
            }
          }
          const safe = this._pushPointOutsideBoxes(nx, ny, boxes, {
            x1: 20,
            y1: 162,
            x2: 1520,
            y2: 658
          });
          nx = safe.x;
          ny = safe.y;
        }
      }

      ent.x = nx;
      ent.y = ny;
      ent.moving = true;
      return true;
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
        } else if (task.type === 'returnBroom' && w.held.includes('broom') && this.levelState.spills.length > 0) {
          const unclaimed = this.levelState.spills.filter((sp) => !this._isTaskClaimed('spillId', sp.id, w));
          if (unclaimed.length > 0) {
            unclaimed.sort((a, b) => Math.hypot(a.x - w.x, a.y - w.y) - Math.hypot(b.x - w.x, b.y - w.y));
            const nextSp = unclaimed[0];
            w.taskQueue.unshift({ type: 'returnBroom', x: task.x, y: task.y });
            w.taskQueue.unshift({ type: 'cleanSpill', spillId: nextSp.id, x: nextSp.x, y: nextSp.y - 8 });
            w.currentTask = null;
            w.waypoints = [];
            w.moving = false;
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
      if (this._stepPedestrian(w, task.x, task.y, w.speed, 6, dt)) {
        return;
      }

      w.x = task.x;
      w.y = task.y;
      w.moving = false;

      if (task.type === 'walk' || task.type === 'returnHome') {
        w.currentTask = null;
      } else if (task.type === 'prep') {
        const ms = this.levelState.machineState && this.levelState.machineState[task.stationId];
        if (ms && ms.broken) {
          if (w.isPlayer) this._spawnParticle(w.x, w.y - 44, '🔧 Stroj je porouchaný – oprav ho!', '#d95d4a');
          w.currentTask = null;
        } else if (ms && ms.stock <= 0) {
          if (w.isPlayer) this._spawnParticle(w.x, w.y - 44, '⚠️ Došly suroviny – doplň je ze skladu!', '#d95d4a');
          w.currentTask = null;
        } else if (w.held.length >= w.maxCarry) {
          if (w.isPlayer) this._spawnParticle(w.x, w.y - 44, 'Plný tác!', '#d95d4a');
          w.currentTask = null;
        } else {
          w.actionDuration = this._getPrepDuration(task.itemId, w);
          w.actionTimer = w.actionDuration;
        }
      } else if (task.type === 'restockRack') {
        const rack = this.levelState.racks.find((r) => r.id === task.rackId);
        if (!rack || !w.held.includes('crate') || rack.stock >= rack.maxStock || (!w.isPlayer && !task.forced && rack.stock >= rack.maxStock / 2)) {
          w.currentTask = null;
        } else {
          w.actionDuration = w.isPlayer ? 0.85 : Math.max(0.45, 0.85 / this._getStaffSpeedMultiplier(w));
          w.actionTimer = w.actionDuration;
        }
      } else if (task.type === 'restockMachine') {
        const ms = this.levelState.machineState && this.levelState.machineState[task.stationId];
        const spec = this.data.BISTRO_MACHINES && this.data.BISTRO_MACHINES[task.stationId];
        if (!ms || !spec || !w.held.includes(spec.supplyItemId) || ms.stock >= ms.maxStock) {
          w.currentTask = null;
        } else {
          const baseDur = spec.restockTime || 1.55;
          w.actionDuration = w.isPlayer ? baseDur : Math.max(0.85, baseDur / this._getStaffSpeedMultiplier(w));
          w.actionTimer = w.actionDuration;
        }
      } else if (task.type === 'repairMachine') {
        const ms = this.levelState.machineState && this.levelState.machineState[task.stationId];
        const spec = this.data.BISTRO_MACHINES && this.data.BISTRO_MACHINES[task.stationId];
        if (!w.isPlayer || !ms || !ms.broken) {
          w.currentTask = null;
        } else {
          w.actionDuration = (spec && spec.repairTime) || 1.9;
          w.actionTimer = w.actionDuration;
        }
      } else if (task.type === 'fuelCar') {
        const car = this.levelState.cars.find((c) => c.id === task.carId && c.state === 'waiting');
        if (!car || !car.orders.some((o) => o.itemId === 'fuel' && !o.done)) {
          w.currentTask = null;
        } else {
          const baseFuelDur = this._getPrepDuration('fuel', w);
          w.actionDuration = car.isHeavy ? baseFuelDur * 3 : baseFuelDur;
          w.actionTimer = w.actionDuration;
        }
      } else if (task.type === 'serviceCarBay') {
        const car = this.levelState.cars.find(
          (c) => c.id === task.carId && c.state === 'waiting' && c.serviceBayId === task.stationId
        );
        if (!car || !car.orders.some((o) => o.itemId === task.itemId && !o.done)) {
          w.currentTask = null;
        } else {
          w.actionDuration = this._getPrepDuration(task.itemId, w);
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
        if (!w.isPlayer && w.held.includes('broom') && this.levelState.spills.length > 0) {
          const nextSpill = this.levelState.spills.find((sp) => !this._isTaskClaimed('spillId', sp.id, w));
          if (nextSpill) {
            w.taskQueue.unshift({
              type: 'returnBroom',
              x: task.x,
              y: task.y
            });
            w.taskQueue.unshift({
              type: 'cleanSpill',
              spillId: nextSpill.id,
              x: nextSpill.x,
              y: nextSpill.y - 8
            });
            w.currentTask = null;
            return;
          }
        }
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
        const ms = this.levelState.machineState && this.levelState.machineState[task.stationId];
        const spec = this.data.BISTRO_MACHINES && this.data.BISTRO_MACHINES[task.stationId];
        if (ms && (ms.broken || ms.stock <= 0)) {
          return;
        }
        if (w.held.length < w.maxCarry) {
          w.held.push(task.itemId);
          if (ms) {
            ms.stock = Math.max(0, ms.stock - 1);
            this._syncMachineStockToSave();
            if (ms.stock === 0) {
              const st = this.data.STATIONS[task.stationId];
              if (st) {
                this._spawnParticle(
                  st.x,
                  st.y - 46,
                  `⚠️ ${(spec && spec.emptyLabel) || 'Došly suroviny!'}`,
                  '#d95d4a'
                );
              }
            }
          }
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
      } else if (task.type === 'restockMachine') {
        const ms = this.levelState.machineState && this.levelState.machineState[task.stationId];
        const spec = this.data.BISTRO_MACHINES && this.data.BISTRO_MACHINES[task.stationId];
        const st = this.data.STATIONS[task.stationId];
        const sIdx = spec ? w.held.indexOf(spec.supplyItemId) : -1;
        if (ms && spec && sIdx !== -1) {
          w.held.splice(sIdx, 1);
          ms.stock = ms.maxStock;
          this._syncMachineStockToSave();
          this.audio.playUpgrade();
          const supIt = this.data.ITEMS[spec.supplyItemId];
          if (st) {
            this._spawnParticle(
              st.x,
              st.y - 44,
              `Doplněno! ${supIt ? supIt.icon : '📦'} ${ms.stock}/${ms.maxStock}`,
              '#4f9d69'
            );
          }
        }
      } else if (task.type === 'repairMachine') {
        const ms = this.levelState.machineState && this.levelState.machineState[task.stationId];
        const st = this.data.STATIONS[task.stationId];
        if (w.isPlayer && ms && ms.broken) {
          ms.broken = false;
          this.audio.playUpgrade();
          if (st) {
            this._spawnParticle(st.x, st.y - 46, `🔧 Opraveno! (${st.label})`, '#4f9d69');
          }
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
      } else if (task.type === 'serviceCarBay') {
        const car = this.levelState.cars.find((c) => c.id === task.carId && c.state === 'waiting');
        if (car) {
          const order = car.orders.find((o) => o.itemId === task.itemId && !o.done);
          if (order) {
            order.done = true;
            this.audio.playClick();
            const label = task.itemId === 'vacuum' ? 'Vysáto ✓' : 'Dofoukáno ✓';
            this._spawnParticle(car.x, car.y - 50, label, '#4f9d69');
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
            const doorPos = car ? this._getDriverCarDoorPos(car) : { x: -40, y: 648 };
            cust.state = 'returning_to_car';
            cust.paid = true;
            this._setCustomerTarget(cust, doorPos.x, doorPos.y);
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

    _findFreeNormalPump() {
      const state = this.levelState;
      const stage = this.getCurrentStage();
      const stageMaxPumps = (stage && stage.limits && stage.limits.maxPumps) || 3;
      const maxPumps = Math.min(stageMaxPumps, Math.max(1, this.save.upgrades.pump_unlock || 1));
      const free = [];
      for (let i = 0; i < maxPumps; i++) {
        if (!state.cars.some((c) => c.pumpIndex === i)) free.push(i);
      }
      return free.length > 0 ? free[Math.floor(Math.random() * free.length)] : -1;
    }

    _tryMoveCarToPump(car) {
      const pIdx = this._findFreeNormalPump();
      if (pIdx < 0) return false;
      const stageId = (this.getCurrentStage() && this.getCurrentStage().id) || 1;
      const fromBayId = car.serviceBayId;
      const fromSt = this.data.STATIONS[fromBayId];
      const pump = this.data.STATIONS[`pump_${pIdx}`];
      if (!fromSt || !pump) return false;

      car.pumpIndex = pIdx;
      car.prevServiceBayId = fromBayId;
      car.serviceBayId = null;
      car.targetX = pump.carX;
      car.targetY = pump.carY;
      car.targetAngle = typeof pump.carAngle === 'number' ? pump.carAngle : 0;
      car.state = 'arriving';
      car.blocked = false;
      car.blockedTimer = 0;
      car.patience = Math.max(car.patience, car.maxPatience * 0.78);
      car.waypoints = this._buildCarBayToPumpPlan(car, fromSt, pump, stageId);
      this._spawnParticle(car.x, car.y - 45, 'Jede natankovat ⛽', '#4e3629');
      return true;
    }

    _checkCarDone(car) {
      if (car.state !== 'waiting') return;
      if (car.serviceBayId) {
        const bayDone = !car.orders.some((o) => o.itemId === car.serviceBayId && !o.done);
        if (!bayDone) return;
        const needsPumpOrder = car.orders.some((o) => (o.itemId === 'fuel' || o.itemId === 'wash') && !o.done);
        if (needsPumpOrder) {
          if (!this._tryMoveCarToPump(car)) {
            car.state = 'waiting_for_pump';
            this._spawnParticle(car.x, car.y - 45, 'Čeká na volný stojan ⛽', '#8c6b4f');
          }
          return;
        }
      }
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
            o !== 'air' &&
            o !== 'vacuum' &&
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

        const startDoorPos = this._getDriverCarDoorPos(car);
        const driver = {
          id: state.nextEntityId++,
          isDriver: true,
          carId: car.id,
          carOrders,
          paid: false,
          spotIndex,
          x: startDoorPos.x,
          y: startDoorPos.y,
          targetX: startDoorPos.x,
          targetY: startDoorPos.y,
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

    _buildCarBayArrivalPlan(_car, baySt, stageId) {
      if (stageId === 3) {
        // Stage 3 right-side bay (x=494, carAngle=0)
        return [
          { x: 340, y: 738, speed: 250 },
          { x: 340, y: baySt.carY, speed: 195 },
          { x: 402, y: baySt.carY, speed: 165, bayCrossRight: true },
          { x: baySt.carX, y: baySt.carY, speed: 135, fixedAngle: 0 }
        ];
      }
      // Stage 2 & Stage 4 left-side bay (x=122 or x=108, carAngle=Math.PI)
      return [
        { x: 340, y: 738, speed: 250 },
        { x: 340, y: baySt.carY, speed: 195 },
        { x: 262, y: baySt.carY, speed: 165, bayCrossLeft: true },
        { x: baySt.carX, y: baySt.carY, speed: 135, bayCrossLeft: true, fixedAngle: Math.PI }
      ];
    }

    _buildCarBayToPumpPlan(_car, fromBaySt, pump, stageId) {
      if (stageId === 4) {
        // Left-side bottom bay (108, 498/548) -> hold cleanly inside bay pocket (x=136) -> reverse east onto northbound lane (340) -> right into pump_0..3
        return [
          { x: 136, y: fromBaySt.carY, speed: 135, reverse: true, fixedAngle: Math.PI },
          { x: 340, y: fromBaySt.carY, speed: 160, reverse: true, fixedAngle: Math.PI, pause: 0.12, bayToStemCommit: true, bayHoldMax: 144 },
          { x: 340, y: Math.min(548, pump.carY + 18), speed: 205 },
          { x: 392, y: pump.carY, speed: 175 },
          { x: pump.carX, y: pump.carY, speed: 150, fixedAngle: 0 }
        ];
      }
      if (stageId === 3) {
        // Right-side bay (494, 416/514) -> reverse west to northbound lane (340) -> up T-bar -> pull nose-up into vertical bay
        return [
          { x: 432, y: fromBaySt.carY, speed: 135, reverse: true, fixedAngle: 0 },
          { x: 340, y: fromBaySt.carY, speed: 155, reverse: true, fixedAngle: 0, pause: 0.12, bayToStemCommit: true, bayHoldMin: 424 },
          { x: 340, y: 298, speed: 195, tBarEnter: true },
          { x: pump.carX, y: 298, speed: 175 },
          { x: pump.carX, y: pump.carY, speed: 140, fixedAngle: -Math.PI / 2 }
        ];
      }
      // Stage 2 left-side bay (122, 456/532) -> reverse east to northbound lane (340) -> up T-bar -> pull nose-up into vertical bay
      return [
        { x: 185, y: fromBaySt.carY, speed: 135, reverse: true, fixedAngle: Math.PI },
        { x: 340, y: fromBaySt.carY, speed: 160, reverse: true, fixedAngle: Math.PI, pause: 0.12, bayToStemCommit: true, bayHoldMax: 190 },
        { x: 340, y: 298, speed: 195, tBarEnter: true },
        { x: pump.carX, y: 298, speed: 175 },
        { x: pump.carX, y: pump.carY, speed: 140, fixedAngle: -Math.PI / 2 }
      ];
    }

    _buildCarArrivalPlan(car, pump, stageId) {
      if (stageId === 4) {
        if (car.isHeavy) {
          // Stage 4 Truck/Bus: turn onto apron at y=400 -> stage at y=406 (well clear above y=498 air bay) -> reverse up into y=282 bay
          return [
            { x: 340, y: 738, speed: 235 },
            { x: 340, y: 400, speed: 195 },
            { x: 230, y: 404, speed: 165, stage4ApronEnter: true },
            { x: Math.round((226 + pump.carX) / 2), y: 406, speed: 155, stage4ApronBusy: true },
            { x: pump.carX, y: 406, speed: 140, stage4ApronBusy: true, fixedAngle: Math.PI / 2, pause: 0.25 },
            { x: pump.carX, y: pump.carY, speed: 120, reverse: true, fixedAngle: Math.PI / 2 }
          ];
        }
        // Stage 4 Car: bottom eastbound lane -> northbound central road -> right into car bay
        return [
          { x: 340, y: 738, speed: 260 },
          { x: 340, y: Math.min(548, pump.carY + 18), speed: 215 },
          { x: 392, y: pump.carY, speed: 175 },
          { x: pump.carX, y: pump.carY, speed: 150, fixedAngle: 0 }
        ];
      }

      if (stageId === 3 && (car.isHeavy || car.pumpIndex === 3)) {
        // Stage 3 Truck: highway eastbound -> northbound central stem -> left directly into horizontal blue truck bay
        return [
          { x: 340, y: 738, speed: 235 },
          { x: 340, y: 468, speed: 185 },
          { x: 262, y: 468, speed: 155, stage3TruckCross: true },
          { x: pump.carX, y: pump.carY, speed: 135, fixedAngle: Math.PI, stage3TruckCross: true }
        ];
      }

      // Stages 1..3 Cars: bottom eastbound lane -> northbound central stem -> T-bar upper lane (y=298) -> pull nose-up into vertical bay (y=224, -PI/2)
      return [
        { x: 340, y: 738, speed: 255 },
        { x: 340, y: 298, speed: 200, tBarEnter: true },
        { x: pump.carX, y: 298, speed: 175 },
        { x: pump.carX, y: pump.carY, speed: 140, fixedAngle: -Math.PI / 2 }
      ];
    }

    _startCarLeaving(car) {
      if (!car) return;
      const stageId = (this.getCurrentStage() && this.getCurrentStage().id) || 1;
      car.state = 'leaving';
      car.targetX = -170;
      car.pauseTimer = 0.08;
      car.blocked = false;
      car.blockedTimer = 0;

      if (car.serviceBayId) {
        const baySt = this.data.STATIONS[car.serviceBayId];
        if (baySt) {
          if (stageId === 3) {
            car.waypoints = [
              { x: 432, y: baySt.carY, speed: 135, reverse: true, fixedAngle: 0 },
              { x: 262, y: baySt.carY, speed: 155, reverse: true, fixedAngle: 0, pause: 0.1, bayExitCommit: true, bayHoldMin: 424 },
              { x: 262, y: 628, speed: 205 },
              { x: -165, y: 628, speed: 260 }
            ];
          } else {
            const holdX = stageId === 4 ? 136 : 185;
            const holdMax = stageId === 4 ? 144 : 190;
            car.waypoints = [
              { x: holdX, y: baySt.carY, speed: 135, reverse: true, fixedAngle: Math.PI },
              { x: 262, y: baySt.carY, speed: 155, reverse: true, fixedAngle: Math.PI, pause: 0.1, bayExitCommit: true, bayHoldMax: holdMax },
              { x: 262, y: 628, speed: 205 },
              { x: -165, y: 628, speed: 260 }
            ];
          }
          return;
        }
      }

      if (stageId === 4) {
        if (car.isHeavy) {
          // Pull forward straight out of y=282 bay to apron (y=404/394) -> hold clear of x=262 -> turn strictly west of x=301 onto southbound lane -> westbound highway
          const bayPullY = car.pumpIndex === 4 ? 404 : 394;
          const holdX = car.pumpIndex === 4 ? 148 : 162;
          car.waypoints = [
            { x: car.x, y: bayPullY, speed: 150, fixedAngle: Math.PI / 2 },
            { x: holdX, y: bayPullY, speed: 160, stage4ApronExitHold: true },
            { x: 222, y: Math.max(408, bayPullY + 8), speed: 175, stage4ApronCommit: true },
            { x: 260, y: 474, speed: 185, stage4ApronCommit: true },
            { x: 262, y: 628, speed: 205 },
            { x: -170, y: 628, speed: 250 }
          ];
        } else {
          // Back gently out to bay threshold (x=424) -> wait cleanly outside central road if needed -> swing down southbound lane -> westbound highway
          car.waypoints = [
            { x: 424, y: car.y + 8, speed: 135, reverse: true, fixedAngle: 0, pause: 0.14 },
            { x: 262, y: Math.min(552, car.y + 42), speed: 185, stage4Merge: true },
            { x: 262, y: 628, speed: 215 },
            { x: -160, y: 628, speed: 265 }
          ];
        }
        return;
      }

      if (stageId === 3 && (car.isHeavy || car.pumpIndex === 3)) {
        // Stage 3 Truck: reverse out east to southbound central stem -> drive south to westbound highway
        car.waypoints = [
          { x: 262, y: 468, speed: 135, reverse: true, fixedAngle: Math.PI, pause: 0.16, stage3TruckExit: true },
          { x: 262, y: 628, speed: 195 },
          { x: -170, y: 628, speed: 250 }
        ];
        return;
      }

      // Stages 1..3 Cars: reverse straight out of vertical bay onto lower T-bar lane (y=338) -> southbound lane (x=262) -> westbound highway
      car.waypoints = [
        { x: car.x, y: 338, speed: 135, reverse: true, tBarExit: true, fixedAngle: -Math.PI / 2, pause: 0.1 },
        { x: 262, y: 338, speed: 175 },
        { x: 262, y: 628, speed: 210 },
        { x: -165, y: 628, speed: 260 }
      ];
    }

    _obbsOverlap(ax, ay, aAng, aHL, aHW, bx, by, bAng, bHL, bHW) {
      const ca = Math.cos(aAng || 0);
      const sa = Math.sin(aAng || 0);
      const cb = Math.cos(bAng || 0);
      const sb = Math.sin(bAng || 0);
      const axes = [
        { x: ca, y: sa },
        { x: -sa, y: ca },
        { x: cb, y: sb },
        { x: -sb, y: cb }
      ];
      const dx = bx - ax;
      const dy = by - ay;
      for (let i = 0; i < 4; i++) {
        const axX = axes[i].x;
        const axY = axes[i].y;
        const dist = Math.abs(dx * axX + dy * axY);
        const rA = aHL * Math.abs(ca * axX + sa * axY) + aHW * Math.abs(-sa * axX + ca * axY);
        const rB = bHL * Math.abs(cb * axX + sb * axY) + bHW * Math.abs(-sb * axX + cb * axY);
        if (dist >= rA + rB) return false;
      }
      return true;
    }

    _getCarHalfExtents(car, angle) {
      if (car.topDown) {
        const halfL = car.variant === 'truck' ? 58 : car.variant === 'bus' ? 56 : car.variant === 'van' ? 35 : 32;
        const halfW = car.isHeavy ? 20 : 17;
        const c = Math.abs(Math.cos(angle || 0));
        const s = Math.abs(Math.sin(angle || 0));
        return { hw: c * halfL + s * halfW, hh: s * halfL + c * halfW };
      }
      return { hw: car.isHeavy ? 68 : 52, hh: car.isHeavy ? 28 : 24 };
    }

    _getCarMoveDir(car) {
      if (car.waypoints && car.waypoints.length > 0) {
        const wp = car.waypoints[0];
        const dx = wp.x - car.x;
        const dy = wp.y - car.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.5) return { x: dx / dist, y: dy / dist };
      }
      const a = car.angle || 0;
      const sign = car.reversing ? -1 : 1;
      return { x: Math.cos(a) * sign, y: Math.sin(a) * sign };
    }

    _hasVehicleConflict(car, nextX, nextY, nextAngle, dirX, dirY) {
      const cars = this.levelState.cars;
      const boxA = this._getCarHalfExtents(car, nextAngle);

      const wp0Turn = car.waypoints && car.waypoints[0];
      const wp1Turn = car.waypoints && car.waypoints[1];
      let cornerLookCap = Infinity;
      let cornerDist = Infinity;
      if (wp0Turn && wp1Turn) {
        const d0 = Math.hypot(wp0Turn.x - car.x, wp0Turn.y - car.y);
        const d1 = Math.hypot(wp1Turn.x - wp0Turn.x, wp1Turn.y - wp0Turn.y);
        if (d0 > 0.5 && d1 > 0.5) {
          const turnDot = ((wp0Turn.x - car.x) / d0) * ((wp1Turn.x - wp0Turn.x) / d1) +
            ((wp0Turn.y - car.y) / d0) * ((wp1Turn.y - wp0Turn.y) / d1);
          if (turnDot < 0.35) {
            cornerDist = d0;
            cornerLookCap = Math.max(4, d0 - 2);
          }
        }
      }

      const hitsWithMargin = (other, boxB, look, pad) => {
        const effLook = Math.min(look, cornerLookCap);
        const effPad = cornerDist < 24 ? Math.min(pad, 6) : pad;
        const dxToOther = other.x - car.x;
        const dyToOther = other.y - car.y;
        const fwd = dxToOther * dirX + dyToOther * dirY;
        const minFront = -Math.max(8, Math.min(boxB.hw, boxB.hh) * 0.4);
        if (fwd < minFront) return false;
        const latPad = 8;
        const padX = Math.abs(dirX) * effPad + Math.abs(dirY) * latPad;
        const padY = Math.abs(dirY) * effPad + Math.abs(dirX) * latPad;
        const fracList = effLook > 24 ? [0.25, 0.6, 1.0] : [0.5, 1.0];
        const curOv =
          Math.abs(car.x - other.x) < boxA.hw + boxB.hw + padX &&
          Math.abs(car.y - other.y) < boxA.hh + boxB.hh + padY;
        if (curOv) return true;
        for (let k = 0; k < fracList.length; k++) {
          const px = nextX + dirX * (effLook * fracList[k]);
          const py = nextY + dirY * (effLook * fracList[k]);
          if (
            Math.abs(px - other.x) < boxA.hw + boxB.hw + padX &&
            Math.abs(py - other.y) < boxA.hh + boxB.hh + padY
          ) {
            return true;
          }
        }
        return false;
      };

      const nearLook = car.isHeavy ? 18 : 14;
      const yieldLook = car.isHeavy ? 72 : 64;

      for (let j = 0; j < cars.length; j++) {
        const other = cars[j];
        if (other.id === car.id) continue;
        // Highway exit lane (y >= 615) never yields to cars still inside the station apron/bays (y < 595)
        if (car.topDown && car.state === 'leaving' && car.y >= 615 && other.y < 595) continue;
        const boxB = this._getCarHalfExtents(other, other.angle || 0);
        const otherParked =
          other.state === 'waiting' || other.state === 'waiting_driver' || other.state === 'waiting_for_pump';

        if (otherParked) {
          if (hitsWithMargin(other, boxB, nearLook, 10)) {
            if (car.topDown && other.topDown) {
              const aHL = car.variant === 'truck' ? 58 : car.variant === 'bus' ? 56 : car.variant === 'van' ? 35 : 32;
              const aHW = car.isHeavy ? 20 : 17;
              const bHL = other.variant === 'truck' ? 58 : other.variant === 'bus' ? 56 : other.variant === 'van' ? 35 : 32;
              const bHW = other.isHeavy ? 20 : 17;
              const lookDist = Math.min(nearLook, cornerLookCap);
              let realHit = false;
              const steps = [0, 0.5, 1.0];
              for (let s = 0; s < steps.length; s++) {
                const px = nextX + dirX * (lookDist * steps[s]);
                const py = nextY + dirY * (lookDist * steps[s]);
                if (this._obbsOverlap(px, py, nextAngle, aHL + 3, aHW + 3, other.x, other.y, other.angle || 0, bHL + 3, bHW + 3)) {
                  realHit = true;
                  break;
                }
              }
              if (realHit) return true;
              continue;
            }
            return true;
          }
          continue;
        }

        // Main southbound exit lane (245 <= x <= 288 or stage4ApronCommit, y < 620) has right-of-way over side hold-lines
        const curWp0Self = car.waypoints && car.waypoints[0];
        const carOnMainExit =
          car.topDown &&
          car.state === 'leaving' &&
          car.y < 620 &&
          ((car.x >= 245 && car.x <= 288) || Boolean(curWp0Self && curWp0Self.stage4ApronCommit));
        if (carOnMainExit) {
          const oWp0 = other.waypoints && other.waypoints[0];
          const otherCommittedApron =
            other.isHeavy && other.x < 245 && oWp0 && oWp0.stage4ApronCommit;
          const otherCommittedServiceBay =
            Boolean(oWp0 && (oWp0.bayExitCommit || oWp0.bayToStemCommit)) &&
            ((other.x > 195 && other.x < 415));
          const otherHoldingLeft = other.x < 245 && !otherCommittedApron && !otherCommittedServiceBay;
          const otherHoldingRight = other.x >= 416 && !otherCommittedServiceBay;
          if (other.state === 'leaving' && (otherHoldingLeft || otherHoldingRight)) {
            continue;
          }
          if (
            other.state === 'leaving' &&
            (otherCommittedApron || otherCommittedServiceBay || (other.x >= 245 && other.x < 414)) &&
            other.y > car.y - 25 &&
            (hitsWithMargin(other, boxB, nearLook + 12, 18) ||
              (other.y <= car.y + (other.isHeavy ? 145 : 120) && (otherCommittedApron || otherCommittedServiceBay || other.x > 295)))
          ) {
            return true;
          }
          if (other.state === 'arriving') {
            if (oWp0 && (oWp0.stage4ApronEnter || oWp0.stage4ApronBusy) && other.x < 332 && hitsWithMargin(other, boxB, nearLook, 14)) {
              return true;
            }
            if (oWp0 && oWp0.stage3TruckCross && other.x >= 185 && other.x < 332 && hitsWithMargin(other, boxB, yieldLook, 18)) {
              return true;
            }
            if (oWp0 && oWp0.bayCrossLeft && other.x >= 200 && other.x < 332 && hitsWithMargin(other, boxB, yieldLook, 18)) {
              return true;
            }
            if (
              otherCommittedServiceBay &&
              hitsWithMargin(other, boxB, nearLook + 10, 14)
            ) {
              return true;
            }
            continue;
          }
        }

        // Stage 4 parked car waiting to reverse out of bay (x >= 425) yields if an arriving truck is swinging its rear trailer near (340, 422)
        if (
          car.topDown &&
          car.state === 'leaving' &&
          !car.isHeavy &&
          car.x >= 425 &&
          other.state === 'arriving' &&
          other.isHeavy &&
          other.x >= 255 &&
          other.x <= 365 &&
          Math.abs(other.y - car.y) < 125
        ) {
          return true;
        }
        // Disjoint x=416 gate: leaving car waits cleanly at x>=416 if central road, active leaving apron truck, or an upstream lower-ID leaving car is exiting; once inside (<416), arriving cars yield
        const curWp = car.waypoints && car.waypoints[0];
        if (curWp && curWp.stage4Merge && car.x >= 416) {
          const oWpL = other.waypoints && other.waypoints[0];
          const otherCommittedLeftBay = Boolean(oWpL && oWpL.bayExitCommit && other.x > (oWpL.bayHoldMax || 144));
          if (
            other.state === 'leaving' &&
            (other.id < car.id || (other.x >= 210 && other.x <= 295) || otherCommittedLeftBay || (other.isHeavy && other.x >= 135 && other.x <= 295 && other.y >= 325)) &&
            (other.x >= 135 || (other.x >= 50 && other.y >= 320) || otherCommittedLeftBay) &&
            (other.x <= 416 || (other.id < car.id && other.y < car.y - 30)) &&
            other.y <= car.y + 135
          ) {
            return true;
          }
          const oWpM = other.waypoints && other.waypoints[0];
          if (
            other.state === 'arriving' &&
            ((other.x >= 250 &&
              other.x <= 416 &&
              other.y >= car.y - (other.isHeavy ? 115 : 85) &&
              other.y <= car.y + (other.isHeavy ? 155 : 130)) ||
              (oWpM &&
                oWpM.bayToStemCommit &&
                other.x > (oWpM.bayHoldMax || 144) &&
                other.x <= 360 &&
                other.y >= car.y - 110 &&
                other.y <= car.y + 120))
          ) {
            return true;
          }
        }

        // Truck leaving Stage 4 apron yields BEFORE committing (not stage4ApronCommit); once stage4ApronCommit is active it has right-of-way over x=262 merge traffic
        const curWpTruck = car.waypoints && car.waypoints[0];
        const truckAtOrBeforeHold = Boolean(curWpTruck && !curWpTruck.stage4ApronCommit);
        if (
          car.topDown &&
          car.state === 'leaving' &&
          car.isHeavy &&
          car.x <= 185 &&
          car.y <= 575 &&
          truckAtOrBeforeHold &&
          other.state === 'leaving' &&
          ((other.x >= 215 &&
            other.x < 414 &&
            other.y >= 200 &&
            other.y <= 595) ||
            (other.isHeavy &&
              other.y >= 275 &&
              other.y <= 565 &&
              other.x <= 240 &&
              ((other.y > 390 && car.y <= 390) || (car.y <= 390 && other.y <= 390 && other.id < car.id))))
        ) {
          return true;
        }

        // Side air/vacuum service bay entrance/exit hold-lines (Stages 2..4)
        const bayWp = car.waypoints && car.waypoints[0];
        if (car.state === 'arriving' && bayWp && bayWp.bayCrossLeft && car.x >= 332) {
          const oBayCrossWp = other.waypoints && other.waypoints[0];
          if (
            other.state === 'leaving' &&
            ((other.x >= 235 && other.x <= 360) ||
              (oBayCrossWp && (oBayCrossWp.bayExitCommit || oBayCrossWp.stage4ApronCommit) && other.x >= 145)) &&
            other.y >= car.y - 210 &&
            other.y <= car.y + 75
          ) {
            return true;
          }
        }
        // Northbound arriving car on central stem (x=340) yields cleanly south of an already-committed bayToStemCommit car finishing its merge onto x=340
        const oBayCommit = other.waypoints && other.waypoints[0];
        if (
          car.topDown &&
          car.state === 'arriving' &&
          car.x >= 315 &&
          car.x <= 365 &&
          oBayCommit &&
          oBayCommit.bayToStemCommit &&
          ((oBayCommit.bayHoldMax && other.x > oBayCommit.bayHoldMax && other.x <= 344) ||
            (oBayCommit.bayHoldMin && other.x < oBayCommit.bayHoldMin && other.x >= 336)) &&
          car.y >= other.y + 40 &&
          car.y <= other.y + 150
        ) {
          return true;
        }
        if (bayWp && (bayWp.bayExitCommit || bayWp.bayToStemCommit)) {
          const leftHoldMax = bayWp.bayHoldMax || 190;
          const rightHoldMin = bayWp.bayHoldMin || 415;
          const holdingLeftBay = bayWp.x <= 345 && car.x <= leftHoldMax;
          const holdingRightBay = car.x >= rightHoldMin;
          if (holdingLeftBay || holdingRightBay) {
            const minLaneX = holdingLeftBay ? 215 : 215;
            const maxLaneX = holdingLeftBay && bayWp.bayExitCommit && bayWp.x <= 275 ? 310 : 380;
            if (
              other.state === 'leaving' &&
              ((other.x >= minLaneX && other.x < (holdingLeftBay ? 416 : maxLaneX + 20)) ||
                (other.isHeavy && other.x >= 165 && other.x <= 320)) &&
              other.y >= Math.min(200, car.y - 130) &&
              other.y <= car.y + 85
            ) {
              return true;
            }
            if (
              other.state === 'arriving' &&
              other.x >= minLaneX + 20 &&
              other.x <= maxLaneX &&
              other.y >= car.y - 80 &&
              other.y <= car.y + 135
            ) {
              return true;
            }
          }
        }

        // Stages 1..3 T-bar & Stage 3 horizontal truck bay right-of-way rules (disjoint y=415 stem hold boundary)
        const curWp0 = car.waypoints && car.waypoints[0];
        if (car.state === 'leaving' && curWp0 && curWp0.tBarExit && car.y < 268) {
          // Exiting car from top vertical bay (y=224) waits inside bay until upper/lower T-bar & merge toward x=262 are clear
          if (
            (other.state === 'arriving' && other.y >= 265 && other.y < 414 && (Math.abs(other.x - car.x) < 155 || (other.x >= 240 && other.x <= 420))) ||
            (other.state === 'leaving' &&
              other.y >= 220 &&
              other.y <= 415 &&
              other.x >= 150 &&
              other.x <= 510 &&
              (other.y >= 265 || other.id < car.id))
          ) {
            return true;
          }
        }
        if (car.state === 'arriving' && curWp0 && curWp0.tBarEnter && car.x >= 305 && car.y >= 415 && car.y <= 550) {
          // Arriving car on stem waits below T-junction (y >= 415) if ANY leaving traffic is in bays/T-bar/upper stem
          if (other.state === 'leaving' && other.y >= 220 && other.y <= 415 && other.x >= 150 && other.x <= 510) {
            return true;
          }
          if (other.state === 'arriving' && other.isHeavy && other.x <= 325 && other.y >= 410 && other.y <= 520) {
            return true;
          }
        }
        if (car.state === 'leaving' && car.isHeavy && curWp0 && curWp0.stage3TruckExit && car.x <= 185) {
          // Stage 3 truck reversing out of pump_3 waits inside bay until southbound stem x=262 & right-bay merge zone are clear
          if (other.state === 'leaving' && other.x >= 235 && other.x <= 414 && other.y >= 320 && other.y <= 555) {
            return true;
          }
          if (other.state === 'arriving' && other.x >= 245 && other.x <= 414 && other.y >= 390 && other.y <= 555) {
            return true;
          }
        }
        if (car.state === 'arriving' && car.isHeavy && curWp0 && curWp0.stage3TruckCross && car.x >= 332) {
          // Stage 3 arriving truck turning West at (340, 468) yields strictly clear on x=340 before rotating toward x=262
          if (other.state === 'leaving' && other.x >= 235 && other.x <= 300 && other.y >= 260 && other.y <= 535) {
            return true;
          }
        }
        if (car.state === 'leaving' && car.x >= 240 && car.x <= 295 && car.y <= 415) {
          // Southbound leaving traffic waits above y=415 while Stage 3 arriving truck has committed across x=185..330 into pump_3
          if (
            other.state === 'arriving' &&
            other.isHeavy &&
            other.y >= 430 &&
            other.y <= 505 &&
            other.x >= 185 &&
            other.x < 330
          ) {
            return true;
          }
        }

        // Wait behind a leaving vehicle actively clearing the southbound-to-westbound exit turn at (266, 634)
        if (
          car.topDown &&
          car.state === 'leaving' &&
          other.state === 'leaving' &&
          car.x >= 245 &&
          car.x <= 290 &&
          other.x >= 210 &&
          other.x <= 295 &&
          other.y > car.y + 24 &&
          hitsWithMargin(other, boxB, nearLook + 8, 12)
        ) {
          return true;
        }

        // Arriving vehicle waits horizontal on lower lane y>=730 before turning north onto x=336 if a leaving vehicle is clearing bottom turn (262, 628)
        if (
          car.topDown &&
          car.state === 'arriving' &&
          car.y >= 730 &&
          car.x >= 250 &&
          other.state === 'leaving' &&
          other.x >= 210 &&
          other.x <= 295 &&
          other.y >= 530 &&
          other.y <= 645
        ) {
          return true;
        }

        // Arriving truck waits cleanly in northbound lane (x >= 332) while any leaving vehicle is in either truck bay/apron or southbound exit
        if (
          curWp &&
          curWp.stage4ApronEnter &&
          car.x >= 332 &&
          other.state === 'leaving' &&
          other.x < 332 &&
          other.y >= 250 &&
          other.y <= 575
        ) {
          return true;
        }

        if (car.state === 'arriving' && other.state === 'leaving') {
          // Arriving car on central stem yields at a safe distance to let a long-waiting bay car merge out without starvation
          if (
            car.topDown &&
            !(curWp && curWp.bayToStemCommit) &&
            other.x >= 416 &&
            other.blocked &&
            (other.blockedTimer || 0) >= 2.5 &&
            car.x >= 325 &&
            car.y >= other.y + 170 &&
            car.y <= other.y + 250
          ) {
            return true;
          }
          const oWpCheck = other.waypoints && other.waypoints[0];
          const oLeftMax = (oWpCheck && oWpCheck.bayHoldMax) || 190;
          const oRightMin = (oWpCheck && oWpCheck.bayHoldMin) || 415;
          const otherWaitingInSideBay =
            other.x >= 416 ||
            (oWpCheck && (oWpCheck.bayExitCommit || oWpCheck.bayToStemCommit) && (other.x <= oLeftMax || other.x >= oRightMin)) ||
            (other.isHeavy && other.x < 245 && !(oWpCheck && oWpCheck.stage4ApronCommit));
          const carOutsideYieldTarget =
            (car.x > 195 && car.x < 415) ||
            (car.isHeavy && car.y <= 450 && !(other.isHeavy && other.y > 390));
          // Wait only for leaving vehicles actually outside bay thresholds (x < 416 in Stage 4, y >= 275 in Stages 1..3, not holding inside side bay)
          if (car.topDown && (other.y < 275 || (otherWaitingInSideBay && carOutsideYieldTarget))) continue;
          if (
            (curWp && (curWp.stage4ApronEnter || curWp.stage4ApronBusy) && car.x < 332) ||
            (curWp && curWp.bayCrossLeft && car.x < 332) ||
            (curWp && curWp.bayToStemCommit && car.x > ((curWp.bayHoldMax || 190)) && car.x < 415)
          ) {
            if (hitsWithMargin(other, boxB, nearLook, 12)) return true;
            continue;
          }
          if (hitsWithMargin(other, boxB, yieldLook, 24)) return true;
          continue;
        }
        if (car.state === 'leaving' && other.state === 'arriving') {
          const oWp = other.waypoints && other.waypoints[0];
          // Stage 4 heavy truck parked in bay waits before pulling down onto apron if another heavy vehicle is actively entering/reversing in the apron
          if (
            car.topDown &&
            car.isHeavy &&
            car.y < 380 &&
            other.isHeavy &&
            other.x < 335 &&
            other.y >= 340 &&
            other.y <= 550
          ) {
            return true;
          }
          if (
            ((other.isHeavy && other.x < 332 && ((oWp && (oWp.stage4ApronEnter || oWp.stage4ApronBusy)) || (other.topDown && other.reversing))) ||
              (oWp && oWp.stage3TruckCross && other.x < 330)) &&
            hitsWithMargin(other, boxB, nearLook, 14)
          ) {
            return true;
          }
          if (
            oWp &&
            oWp.bayToStemCommit &&
            other.x > 195 &&
            other.x < 415 &&
            hitsWithMargin(other, boxB, yieldLook, 18)
          ) {
            return true;
          }
          continue;
        }

        // Committed main-road & apron vehicles never yield to vehicles still holding inside/behind their Stage 4/service bay hold-lines
        const oWpHold = other.waypoints && other.waypoints[0];
        const oLeftHoldMax = (oWpHold && oWpHold.bayHoldMax) || 190;
        const oRightHoldMin = (oWpHold && oWpHold.bayHoldMin) || 415;
        const carOutsideOtherHold =
          (car.x > 195 && car.x < 415) ||
          (car.isHeavy && car.y <= 450 && !(other.isHeavy && other.y <= 450)) ||
          (other.x >= 416 && car.x < 416);
        const otherWaitingAtHold =
          (other.state === 'leaving' && other.x >= 416) ||
          (other.state === 'leaving' && other.isHeavy && other.x < 245 && !(oWpHold && oWpHold.stage4ApronCommit)) ||
          Boolean(oWpHold && (oWpHold.bayExitCommit || oWpHold.bayToStemCommit) && (other.x <= oLeftHoldMax || other.x >= oRightHoldMin));
        if (car.topDown && carOutsideOtherHold && otherWaitingAtHold) {
          continue;
        }

        const oDir = this._getCarMoveDir(other);
        const headingDot = dirX * oDir.x + dirY * oDir.y;
        const forwardDot = (other.x - car.x) * dirX + (other.y - car.y) * dirY;
        const revForwardOther = (car.x - other.x) * oDir.x + (car.y - other.y) * oDir.y;
        const otherAheadClearing = forwardDot > 22 && headingDot > -0.35 && revForwardOther < 12;

        if ((headingDot > 0.45 && forwardDot > 6) || otherAheadClearing) {
          if (hitsWithMargin(other, boxB, nearLook, 16)) return true;
        } else if (headingDot <= 0.45 && other.id < car.id) {
          // Strict DAG ordering across merges/intersections: lower ID always proceeds, higher ID yields well clear of junction
          if (hitsWithMargin(other, boxB, yieldLook, 32)) return true;
        }
      }
      return false;
    }

    _updateCars(dt) {
      const cars = this.levelState.cars;
      const turnAngleToward = (cur, target, maxStep) => {
        let diff = target - cur;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) <= maxStep) return target;
        return cur + Math.sign(diff) * maxStep;
      };

      for (let i = cars.length - 1; i >= 0; i--) {
        const car = cars[i];
        if (car.state === 'arriving' || car.state === 'leaving') {
          if (car.pauseTimer > 0) {
            car.pauseTimer = Math.max(0, car.pauseTimer - dt);
            car.reversing = false;
            continue;
          }

          const wp =
            car.waypoints && car.waypoints.length > 0
              ? car.waypoints[0]
              : {
                  x: car.state === 'leaving' ? car.targetX : car.targetX,
                  y: car.state === 'leaving' ? 720 : car.targetY,
                  speed: car.state === 'leaving' ? 265 : 220
                };

          const dx = wp.x - car.x;
          const dy = wp.y - car.y;
          const dist = Math.hypot(dx, dy);
          car.reversing = Boolean(wp.reverse);

          if (dist <= 4) {
            car.x = wp.x;
            car.y = wp.y;
            if (car.topDown && typeof wp.fixedAngle === 'number') {
              car.angle = wp.fixedAngle;
            }
            if (wp.pause && wp.pause > 0) {
              car.pauseTimer = wp.pause;
            }
            if (car.waypoints && car.waypoints.length > 0) {
              car.waypoints.shift();
            }
            if (!car.waypoints || car.waypoints.length === 0) {
              car.reversing = false;
              car.blocked = false;
              car.blockedTimer = 0;
              if (car.state === 'arriving') {
                if (car.topDown && typeof car.targetAngle === 'number') {
                  car.angle = car.targetAngle;
                }
                car.state = 'waiting';
              } else {
                cars.splice(i, 1);
              }
            }
            continue;
          }

          const dirX = dx / dist;
          const dirY = dy / dist;
          const desiredAngle =
            typeof wp.fixedAngle === 'number'
              ? wp.fixedAngle
              : wp.reverse
              ? Math.atan2(-dy, -dx)
              : Math.atan2(dy, dx);
          const nextAngle = car.topDown ? turnAngleToward(car.angle || 0, desiredAngle, 6.2 * dt) : 0;
          let moveSpeed = wp.speed || 220;

          const conflict = this._hasVehicleConflict(car, car.x + dirX * Math.min(dist, moveSpeed * dt), car.y + dirY * Math.min(dist, moveSpeed * dt), nextAngle, dirX, dirY);
          if (conflict) {
            car.blocked = true;
            car.blockedTimer = (car.blockedTimer || 0) + dt;
            continue;
          } else {
            car.blocked = false;
            car.blockedTimer = 0;
          }

          const step = Math.min(dist, moveSpeed * dt);
          car.x += dirX * step;
          car.y += dirY * step;
          if (car.topDown) car.angle = nextAngle;

          if (car.state === 'leaving' && (car.x > 1620 || car.x < -150)) {
            cars.splice(i, 1);
          }
        } else if (car.state === 'waiting') {
          car.reversing = false;
          car.patience -= dt;
          if (car.patience <= 0) {
            this._startCarLeaving(car);
            this.levelState.angryCount += 1;
            this.audio.playSad();
            this._spawnParticle(car.x, car.y - 45, 'Odjíždí bez obsluhy 😔', '#d95d4a');
          }
        } else if (car.state === 'waiting_for_pump') {
          car.reversing = false;
          this._tryMoveCarToPump(car);
        }
      }
    }

    _updateCustomers(dt) {
      const custs = this.levelState.customers;
      for (let i = custs.length - 1; i >= 0; i--) {
        const cust = custs[i];
        const stillWalking = this._stepPedestrian(cust, cust.targetX, cust.targetY, 135, 4, dt);

        if (!stillWalking) {
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
              this._startCarLeaving(car);
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

        if (cust.state === 'waiting' || cust.state === 'shopping' || cust.state === 'paying') {
          cust.patience -= dt;
          if (cust.patience <= 0) {
            this.audio.playSad();
            if (cust.isDriver) {
              const car = this.levelState.cars.find((c) => c.id === cust.carId);
              const doorPos = car ? this._getDriverCarDoorPos(car) : { x: -40, y: 648 };
              cust.state = 'returning_to_car';
              cust.paid = false;
              this._setCustomerTarget(cust, doorPos.x, doorPos.y);
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
          const heldServiceCar = state.cars.find(
            (c) =>
              c.state === 'waiting' &&
              !this._isTaskClaimed('carId', c.id, w) &&
              c.orders.some((o) => !o.done && w.held.includes(o.itemId))
          );
          if (heldServiceCar) {
            const pump = this.data.STATIONS[`pump_${heldServiceCar.pumpIndex}`];
            const heldOrd = heldServiceCar.orders.find((o) => !o.done && w.held.includes(o.itemId));
            if (pump && heldOrd) {
              w.taskQueue.push({
                type: 'serveCar',
                carId: heldServiceCar.id,
                itemId: heldOrd.itemId,
                x: pump.walkX,
                y: Math.min(558, pump.walkY + 24)
              });
              return;
            }
          }
          w.taskQueue.push({ type: 'trash', x: trash.walkX, y: trash.walkY });
          return;
        }

        const canWash = this._isStationUnlocked('bucket');
        const canAir = this._isStationUnlocked('air');
        const canVacuum = this._isStationUnlocked('vacuum');
        const canServeItem = (c, itemId) =>
          (itemId === 'fuel' && !c.serviceBayId) ||
          (itemId === 'wash' && canWash && !c.serviceBayId) ||
          (itemId === 'air' && canAir && c.serviceBayId === 'air') ||
          (itemId === 'vacuum' && canVacuum && c.serviceBayId === 'vacuum');

        const targetCar = state.cars.find(
          (c) =>
            c.state === 'waiting' &&
            !this._isTaskClaimed('carId', c.id, w) &&
            c.orders.some((o) => !o.done && canServeItem(c, o.itemId))
        );
        if (!targetCar) return;

        if (targetCar.serviceBayId) {
          const baySt = this.data.STATIONS[targetCar.serviceBayId];
          const bayOrd = targetCar.orders.find((o) => !o.done && canServeItem(targetCar, o.itemId));
          if (baySt && bayOrd) {
            w.taskQueue.push({
              type: 'serviceCarBay',
              carId: targetCar.id,
              stationId: baySt.id,
              itemId: bayOrd.itemId,
              x: baySt.walkX,
              y: baySt.walkY
            });
          }
          return;
        }

        const pump = this.data.STATIONS[`pump_${targetCar.pumpIndex}`];
        const fuelOrder = targetCar.orders.find((o) => !o.done && o.itemId === 'fuel');
        if (fuelOrder && pump) {
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
        if (washOrder && pump) {
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
            y: Math.min(558, pump.walkY + 24)
          });
        }
      } else if (w.role === 'anicka') {
        const machines = state.machineState || {};
        const specs = this.data.BISTRO_MACHINES || {};

        if (w.held.length > 0) {
          const heldSupplyId = w.held.find((id) => this.data.ITEMS[id] && this.data.ITEMS[id].isSupply);
          if (heldSupplyId) {
            const supItem = this.data.ITEMS[heldSupplyId];
            const mId = supItem && supItem.machineId;
            const mSt = mId && this.data.STATIONS[mId];
            const ms = mId && machines[mId];
            if (mSt && ms && ms.stock < ms.maxStock) {
              w.taskQueue.push({
                type: 'restockMachine',
                stationId: mSt.id,
                machineRestockId: mSt.id,
                supplyItemId: heldSupplyId,
                x: mSt.walkX,
                y: mSt.walkY
              });
              return;
            }
          }

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

        const isMachineReady = (itemId) => {
          const stId = this.data.ITEMS[itemId] && this.data.ITEMS[itemId].stationId;
          const ms = stId && machines[stId];
          return !ms || (!ms.broken && ms.stock > 0);
        };
        const isMachineOutOfStockOnly = (itemId) => {
          const stId = this.data.ITEMS[itemId] && this.data.ITEMS[itemId].stationId;
          const ms = stId && machines[stId];
          return Boolean(ms && !ms.broken && ms.stock <= 0);
        };

        // 1. If a waiting customer wants a bistro item whose machine is ready, serve them first
        const readyShopCust = state.customers.find(
          (c) =>
            c.state === 'waiting' &&
            c.spotIndex >= 0 &&
            !this._isTaskClaimed('custId', c.id, w) &&
            c.orders.some(
              (o) =>
                !o.done &&
                (o.itemId === 'coffee' || o.itemId === 'snack' || o.itemId === 'drink') &&
                this._isItemUnlocked(o.itemId) &&
                isMachineReady(o.itemId)
            )
        );
        if (readyShopCust) {
          const spot = this.data.SHOP_SPOTS[readyShopCust.spotIndex];
          const nextOrd = readyShopCust.orders.find(
            (o) =>
              !o.done &&
              (o.itemId === 'coffee' || o.itemId === 'snack' || o.itemId === 'drink') &&
              this._isItemUnlocked(o.itemId) &&
              isMachineReady(o.itemId)
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
              custId: readyShopCust.id,
              itemId: nextOrd.itemId,
              x: spot.serveX,
              y: spot.serveY
            });
            return;
          }
        }

        // 2. Otherwise restock any bistro machine that ran out of ingredients (prefer one a waiting customer needs)
        const neededEmptyStationIds = new Set();
        state.customers.forEach((c) => {
          if (c.state !== 'waiting') return;
          c.orders.forEach((o) => {
            if (!o.done && (o.itemId === 'coffee' || o.itemId === 'snack' || o.itemId === 'drink') && isMachineOutOfStockOnly(o.itemId)) {
              neededEmptyStationIds.add(this.data.ITEMS[o.itemId].stationId);
            }
          });
        });
        const emptyMachineList = Object.values(machines)
          .filter((m) => m && m.stock <= 0 && !this._isTaskClaimed('machineRestockId', m.id, w))
          .sort((a, b) => (neededEmptyStationIds.has(b.id) ? 1 : 0) - (neededEmptyStationIds.has(a.id) ? 1 : 0));
        const emptyMachine = emptyMachineList[0];
        if (emptyMachine) {
          const spec = specs[emptyMachine.id];
          const mSt = this.data.STATIONS[emptyMachine.id];
          const storage = this.data.STATIONS.storage;
          if (spec && mSt && storage) {
            w.taskQueue.push({
              type: 'prep',
              stationId: storage.id,
              itemId: spec.supplyItemId,
              x: storage.walkX,
              y: storage.walkY
            });
            w.taskQueue.push({
              type: 'restockMachine',
              stationId: mSt.id,
              machineRestockId: mSt.id,
              supplyItemId: spec.supplyItemId,
              x: mSt.walkX,
              y: mSt.walkY
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
          const remaining = state.spills.filter((sp) => !this._isTaskClaimed('spillId', sp.id, w));
          let refX = w.x;
          let refY = w.y;
          while (remaining.length > 0) {
            let bestIdx = 0;
            let bestDist = Infinity;
            for (let i = 0; i < remaining.length; i++) {
              const d = Math.hypot(remaining[i].x - refX, remaining[i].y - refY);
              if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
              }
            }
            const nextSpill = remaining.splice(bestIdx, 1)[0];
            w.taskQueue.push({
              type: 'cleanSpill',
              spillId: nextSpill.id,
              x: nextSpill.x,
              y: nextSpill.y - 8
            });
            refX = nextSpill.x;
            refY = nextSpill.y - 8;
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

        const unclaimedSpills = state.spills.filter((sp) => !this._isTaskClaimed('spillId', sp.id, w));
        if (unclaimedSpills.length > 0) {
          const broom = this.data.STATIONS.broom;
          w.taskQueue.push({
            type: 'takeBroom',
            x: broom.walkX,
            y: broom.walkY
          });
          let refX = broom.walkX;
          let refY = broom.walkY;
          const pending = unclaimedSpills.slice();
          while (pending.length > 0) {
            let bestIdx = 0;
            let bestDist = Infinity;
            for (let i = 0; i < pending.length; i++) {
              const d = Math.hypot(pending[i].x - refX, pending[i].y - refY);
              if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
              }
            }
            const nextSpill = pending.splice(bestIdx, 1)[0];
            w.taskQueue.push({
              type: 'cleanSpill',
              spillId: nextSpill.id,
              x: nextSpill.x,
              y: nextSpill.y - 8
            });
            refX = nextSpill.x;
            refY = nextSpill.y - 8;
          }
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
        const grossPart =
          typeof lastShift.grossEarned === 'number'
            ? ` · Tržby ${lastShift.grossEarned} Kč${lastShift.starBonus > 0 ? ` +${lastShift.starBonus} Kč ⭐` : ''}${lastShift.totalWages > 0 ? ` − ${lastShift.totalWages} Kč výplaty` : ''}`
            : '';
        shiftBanner.textContent = `Poslední směna (${finalStage.name} – ${finalLvl.name}): +${lastShift.earned} Kč čistého${grossPart} · Obslouženo: ${lastShift.served} · Čas: ${this._formatDuration(lastShift.time)}`;
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
      const plannedPayroll = this._getPlannedDailyPayroll();

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
          label: '💰 Celkový čistý výdělek',
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
          sub: `Najato: ${hiredStaff}/${this.data.STAFF.length} (výplata ${plannedPayroll.total} Kč/směnu)`
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
      const grossEarned = Math.max(0, Math.round(state.earnedCoins || 0));

      let starsEarned = 0;
      if (grossEarned >= lvl.stars[2]) starsEarned = 3;
      else if (grossEarned >= lvl.stars[1]) starsEarned = 2;
      else if (grossEarned >= lvl.stars[0]) starsEarned = 1;

      const starMultiplier = starsEarned === 3 ? 1.2 : starsEarned === 2 ? 1.1 : 1.0;
      const grossWithBonus = Math.round(grossEarned * starMultiplier);
      const starBonus = grossWithBonus - grossEarned;
      const payroll = this._getActiveShiftPayroll();
      const totalWages = payroll.total;
      const earned = Math.max(0, grossWithBonus - totalWages);

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
      this._syncMachineStockToSave();
      this.persistSave();
      this.updateGlobalHUD();
      this.audio.stopAmbient();
      if (starsEarned >= 1) this.audio.playWin();
      else this.audio.playSad();

      if (isFinalVictory) {
        this.showVictoryModal({
          earned,
          grossEarned,
          starBonus,
          starMultiplier,
          totalWages,
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
        `Obslouženo: ${state.servedCount} · Odešlo bez obsluhy: ${state.angryCount} · Čas směny: ${this._formatDuration(state.time)}`;

      const breakdownEl = document.getElementById('result-breakdown');
      if (breakdownEl) {
        const multText = starMultiplier.toFixed(1).replace('.', ',');
        const wageDetails =
          payroll.items.length > 0
            ? ` (${payroll.items.map((x) => `${x.shortName} ${x.wage} Kč`).join(', ')})`
            : ' (nikdo nepracoval)';
        breakdownEl.innerHTML = `
          <div class="result-row">
            <span>💵 Hrubé tržby (podle nich se hodnotí ⭐)</span>
            <strong>${grossEarned} Kč</strong>
          </div>
          <div class="result-row bonus">
            <span>⭐ Bonus za ${starsEarned} ⭐ (×${multText})</span>
            <strong>+${starBonus} Kč</strong>
          </div>
          <div class="result-row wage">
            <span>👷 Výplata zaměstnanců${wageDetails}</span>
            <strong>−${totalWages} Kč</strong>
          </div>
          <div class="result-row total">
            <span>💰 Čistý výdělek do pokladny</span>
            <strong>+${earned} Kč</strong>
          </div>
        `;
      }

      const unlockNote = document.getElementById('result-unlock-note');
      const nextBtn = document.getElementById('result-next-btn');
      const stageComplete = lvl.id === this.data.LEVELS.length && starsEarned >= 1 && nextStage;

      if (stageComplete) {
        if (this.save.coins >= nextStage.unlockCost) {
          unlockNote.textContent = `🏢 Všech 8 směn hotovo! Můžeš přejít na novou benzínku: ${nextStage.id}. ${nextStage.name} (potřeba min. ${nextStage.unlockCost} Kč, novou větší pumpu kupuješ za všechny své peníze a začínáš s 0 Kč)!`;
          nextBtn.textContent = '🏢 Koupit větší pumpu za všechny peníze';
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
