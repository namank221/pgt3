const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let currentPort = 8080;
const MAX_PORT_ATTEMPTS = 20;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.hdr': 'application/octet-stream',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(__dirname, reqPath);
  if (!path.resolve(filePath).startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found: ' + reqPath);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const isMediaOrAsset = ['.mp4', '.mp3', '.wav', '.glb', '.hdr', '.jpg', '.png'].includes(ext);
    const cacheHeader = 'no-store, no-cache, must-revalidate';

    const range = req.headers.range;
    if (range && (ext === '.mp4' || ext === '.mp3' || ext === '.wav')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;

      if (isNaN(start) || isNaN(end) || start >= stats.size || end >= stats.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        return res.end();
      }

      const chunksize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': cacheHeader
      });
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': cacheHeader
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
    tryNextPort();
  } else {
    console.error('[GT3 Server] Server error:', err.message);
  }
});

function tryNextPort() {
  currentPort++;
  if (currentPort < 8080 + MAX_PORT_ATTEMPTS) {
    server.listen(currentPort, () => onListening(currentPort));
  } else {
    console.error(`[GT3 Server] Could not bind to any port.`);
  }
}

server.listen(currentPort, () => onListening(currentPort));
