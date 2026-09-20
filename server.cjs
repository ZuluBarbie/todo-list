const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/styles.css': ['styles.css', 'text/css'], '/app.js': ['app.js', 'text/javascript'] };
http.createServer((req, res) => {
  const entry = files[new URL(req.url, 'http://localhost').pathname];
  if (!entry) { res.writeHead(404); res.end('Not found'); return; }
  fs.readFile(path.join(__dirname, 'dist', entry[0]), (err, data) => {
    if (err) { res.writeHead(500); res.end('Unable to load app'); return; }
    res.writeHead(200, { 'Content-Type': `${entry[1]}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff' }); res.end(data);
  });
}).listen(4173, '127.0.0.1', () => console.log('Done is available at http://127.0.0.1:4173'));
