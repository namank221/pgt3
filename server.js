const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let currentPort = 8080;
const MAX_PORT_ATTEMPTS = 10;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath);
  if (!path.resolve(filePath).startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found: ' + reqPath);
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

let launched = false;
function onListening(port) {
  if (launched) return;
  launched = true;
  console.log(`====================================================`);
  console.log(`[GT3 Server] Active at http://localhost:${port}`);
  console.log(`====================================================`);
  exec(`start http://localhost:${port}`);
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const busyPort = currentPort;
    console.log(`[GT3 Server] Port ${busyPort} is in use.`);
    
    // Check if the running server is already our GT3 server
    const req = http.get(`http://localhost:${busyPort}/tier1/js/main.js`, (probeRes) => {
      if (probeRes.statusCode === 200) {
        console.log(`[GT3 Server] GT3 site is ALREADY running on http://localhost:${busyPort}`);
        console.log(`[GT3 Server] Opening browser window...`);
        exec(`start http://localhost:${busyPort}`);
        return;
      }
      tryNextPort();
    });
    
    req.on('error', () => {
      tryNextPort();
    });
    
    req.setTimeout(800, () => {
      req.destroy();
      tryNextPort();
    });
  } else {
    console.error('[GT3 Server] Server error:', err.message);
  }
});

function tryNextPort() {
  currentPort++;
  if (currentPort < 8080 + MAX_PORT_ATTEMPTS) {
    console.log(`[GT3 Server] Trying alternative port http://localhost:${currentPort}...`);
    server.listen(currentPort, () => onListening(currentPort));
  } else {
    console.error(`[GT3 Server] Could not bind to any port between 8080 and ${currentPort}.`);
  }
}

server.listen(currentPort, () => onListening(currentPort));
