@echo off
title GT3 Exploded-View // Local Server
cd /d "%~dp0\.."

echo ============================================================
echo   GT3 EXPLODED-VIEW // LOCAL HTTP SERVER
echo ============================================================
echo.
echo Launching local server on http://localhost:8080 ...
echo Press Ctrl+C in this terminal window to stop the server.
echo.

node -e "const http = require('http'); const fs = require('fs'); const path = require('path'); const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' }; const server = http.createServer((req, res) => { let reqPath = decodeURI(req.url.split('?')[0]); if (reqPath === '/') reqPath = '/index.html'; const filePath = path.join(process.cwd(), reqPath); fs.stat(filePath, (err, stats) => { if (err || !stats.isFile()) { res.writeHead(404, {'Content-Type': 'text/plain'}); return res.end('404 Not Found: ' + reqPath); } const ext = path.extname(filePath).toLowerCase(); res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate' }); fs.createReadStream(filePath).pipe(res); }); }); server.listen(8080, () => { console.log('>> Server active at http://localhost:8080'); require('child_process').exec('start http://localhost:8080'); });"

pause
