const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const USERS_FILE = path.join(ROOT, 'users_data.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

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
    layout: {
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
    }
  };
}

function loadUsers() {
  let users = {};
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf8');
      users = raw ? JSON.parse(raw) : {};
    }
  } catch (_err) {
    users = {};
  }
  if (!users.admin) {
    users.admin = {
      username: 'admin',
      displayName: 'Admin',
      passwordHash: hashPassword('admin', 'admin_static_salt'),
      save: createAdminSave(),
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
  } else {
    if (!users.admin.displayName) {
      users.admin.displayName = 'Admin';
    }
    const adminUpgrades = createAdminSave().upgrades;
    if (!users.admin.save || typeof users.admin.save !== 'object') {
      users.admin.save = createAdminSave();
    } else {
      users.admin.save.upgrades = Object.assign({}, adminUpgrades, users.admin.save.upgrades || {}, {
        pump_unlock: 4,
        wash_unlock: 2,
        grill_unlock: 2,
        fridge_unlock: 2,
        rack_sweets_unlock: 2,
        rack_auto_unlock: 2
      });
      users.admin.save.unlockedStage = 4;
      if (typeof users.admin.save.currentStage !== 'number') {
        users.admin.save.currentStage = 4;
      }
      if (!users.admin.save.stageStars || typeof users.admin.save.stageStars !== 'object') {
        users.admin.save.stageStars = createAdminSave().stageStars;
      }
    }
  }
  return users;
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function hashPassword(password, salt) {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return `${usedSalt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const parts = String(storedHash || '').split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  const derivedHex = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derivedHex, 'hex'), Buffer.from(expectedHex, 'hex'));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function handleApi(req, res, reqPath) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (_err) {
    sendJson(res, 400, { ok: false, error: 'Neplatný formát požadavku.' });
    return;
  }

  const usernameRaw = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const displayNameRaw = typeof body.displayName === 'string' ? body.displayName.trim() : '';
  const key = usernameRaw.toLowerCase();

  if (!usernameRaw || !password) {
    sendJson(res, 400, { ok: false, error: 'Vyplň prosím uživatelské jméno i heslo.' });
    return;
  }

  const users = loadUsers();

  if (reqPath === '/api/register') {
    if (!displayNameRaw) {
      sendJson(res, 400, { ok: false, error: 'Vyplň prosím i své jméno pro oslovování.' });
      return;
    }
    if (users[key]) {
      sendJson(res, 409, { ok: false, error: 'Toto uživatelské jméno už existuje. Zvol jiné nebo se přihlas.' });
      return;
    }
    const saveState = body.save && typeof body.save === 'object' ? body.save : {};
    users[key] = {
      username: usernameRaw,
      displayName: displayNameRaw,
      passwordHash: hashPassword(password),
      save: saveState,
      updatedAt: new Date().toISOString()
    };
    saveUsers(users);
    sendJson(res, 200, { ok: true, username: usernameRaw, displayName: displayNameRaw, save: saveState });
    return;
  }

  if (reqPath === '/api/login') {
    const user = users[key];
    if (!user) {
      sendJson(res, 404, { ok: false, error: 'Účet s tímto uživatelským jménem nebyl nalezen.' });
      return;
    }
    if (!verifyPassword(password, user.passwordHash)) {
      sendJson(res, 401, { ok: false, error: 'Nesprávné heslo.' });
      return;
    }
    sendJson(res, 200, {
      ok: true,
      username: user.username,
      displayName: user.displayName || user.username,
      save: user.save || {}
    });
    return;
  }

  if (reqPath === '/api/save') {
    const user = users[key];
    if (!user || !verifyPassword(password, user.passwordHash)) {
      sendJson(res, 401, { ok: false, error: 'Neplatné přihlášení pro uložení postupu.' });
      return;
    }
    if (!user.displayName && displayNameRaw) {
      user.displayName = displayNameRaw;
    }
    user.save = body.save && typeof body.save === 'object' ? body.save : user.save;
    user.updatedAt = new Date().toISOString();
    saveUsers(users);
    sendJson(res, 200, { ok: true, username: user.username, displayName: user.displayName || user.username });
    return;
  }

  sendJson(res, 404, { ok: false, error: 'Neznámý API koncový bod.' });
}

const server = http.createServer((req, res) => {
  const reqPath = (req.url || '/').split('?')[0];

  if (req.method === 'POST' && reqPath.startsWith('/api/')) {
    handleApi(req, res, reqPath);
    return;
  }

  const safePath = path.normalize(reqPath === '/' ? '/index.html' : reqPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT) || path.basename(filePath) === 'users_data.json') {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(err.code === 'ENOENT' ? 'Not Found' : 'Internal Server Error');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Utulna Benzinka running at http://127.0.0.1:${PORT}`);
});
