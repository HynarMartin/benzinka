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

function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return {};
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch (_err) {
    return {};
  }
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
  const key = usernameRaw.toLowerCase();

  if (!usernameRaw || !password) {
    sendJson(res, 400, { ok: false, error: 'Vyplň prosím jméno hráče i heslo.' });
    return;
  }

  const users = loadUsers();

  if (reqPath === '/api/register') {
    if (users[key]) {
      sendJson(res, 409, { ok: false, error: 'Toto jméno už existuje. Zvol jiné nebo se přihlas.' });
      return;
    }
    const saveState = body.save && typeof body.save === 'object' ? body.save : {};
    users[key] = {
      username: usernameRaw,
      passwordHash: hashPassword(password),
      save: saveState,
      updatedAt: new Date().toISOString()
    };
    saveUsers(users);
    sendJson(res, 200, { ok: true, username: usernameRaw, save: saveState });
    return;
  }

  if (reqPath === '/api/login') {
    const user = users[key];
    if (!user) {
      sendJson(res, 404, { ok: false, error: 'Účet s tímto jménem nebyl nalezen.' });
      return;
    }
    if (!verifyPassword(password, user.passwordHash)) {
      sendJson(res, 401, { ok: false, error: 'Nesprávné heslo.' });
      return;
    }
    sendJson(res, 200, { ok: true, username: user.username, save: user.save || {} });
    return;
  }

  if (reqPath === '/api/save') {
    const user = users[key];
    if (!user || !verifyPassword(password, user.passwordHash)) {
      sendJson(res, 401, { ok: false, error: 'Neplatné přihlášení pro uložení postupu.' });
      return;
    }
    user.save = body.save && typeof body.save === 'object' ? body.save : user.save;
    user.updatedAt = new Date().toISOString();
    saveUsers(users);
    sendJson(res, 200, { ok: true, username: user.username });
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
