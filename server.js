const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;
const publicDir = path.join(root, 'public');
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, 'data');
const subscribersFile = path.join(dataDir, 'subscribers.json');
const port = Number(process.env.PORT) || 3000;
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

async function readSubscribers() {
  try { return JSON.parse(await fs.readFile(subscribersFile, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}

async function handleSignup(req, res) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 10_000) { res.writeHead(413); return res.end(JSON.stringify({ error: 'Request too large.' })); }
  }
  let input;
  try { input = JSON.parse(body); }
  catch { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Please send a valid form.' })); }

  const name = String(input.name || '').trim().slice(0, 80);
  const email = String(input.email || '').trim().toLowerCase().slice(0, 254);
  const interest = String(input.interest || '').trim().slice(0, 40);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Add your name and a valid email address.' }));
  }

  await fs.mkdir(dataDir, { recursive: true });
  const subscribers = await readSubscribers();
  if (subscribers.some((entry) => entry.email === email)) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'You’re already on the list. Watch your inbox for the next dispatch.' }));
  }
  subscribers.push({ id: crypto.randomUUID(), name, email, interest, subscribedAt: new Date().toISOString() });
  await fs.writeFile(subscribersFile, JSON.stringify(subscribers, null, 2), { encoding: 'utf8', mode: 0o600 });
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'You’re on the list. Watch your inbox for the next dispatch.' }));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify({ ok: true }));
    }
    if (req.method === 'POST' && url.pathname === '/api/subscribe') return await handleSignup(req, res);
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end('Method not allowed'); }
    const route = url.pathname === '/' ? '/index.html' : url.pathname;
    const target = path.resolve(publicDir, `.${decodeURIComponent(route)}`);
    if (!target.startsWith(publicDir + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
    let content;
    try { content = await fs.readFile(target); }
    catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Page not found'); }
    res.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Cache-Control': path.extname(target) === '.html' ? 'no-cache' : 'public, max-age=3600' });
    return res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Something went wrong. Please try again.' }));
  }
});

server.listen(port, () => console.log(`Fireside is running at http://localhost:${port}`));

