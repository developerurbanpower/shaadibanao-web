const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

// Client connections for live-reloading
const sseClients = new Set();

// Watch for file changes to auto-reload browser
fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  // Ignore server.js or git/system files
  if (filename.includes('server.js') || filename.includes('.git') || filename.includes('node_modules')) return;

  // Notify connected browsers
  for (const client of sseClients) {
    client.write('data: reload\n\n');
  }
});

const LIVE_RELOAD_SNIPPET = `
<!-- ShaadiBanao Dev Live Reload -->
<script>
  (function() {
    if (window.location.protocol === 'file:') return;
    const evtSource = new EventSource('/__livereload');
    evtSource.onmessage = function(e) {
      if (e.data === 'reload') {
        console.log('[ShaadiBanao LiveReload] Refreshing...');
        window.location.reload();
      }
    };
  })();
</script>
`;

const server = http.createServer((req, res) => {
  // SSE endpoint for live reload
  if (req.url === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // Parse path
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Bad Request');
  }

  // Default to index.html
  if (decodedPath === '/' || decodedPath === '') {
    decodedPath = '/index.html';
  }

  // Support clean URLs (e.g. /privacy-policy -> /privacy-policy.html)
  let filePath = path.join(ROOT_DIR, decodedPath);
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // Prevent directory traversal attacks
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>404 Not Found - ShaadiBanao</title><link rel="stylesheet" href="/styles.css"></head>
        <body style="text-align:center; padding:100px 20px; font-family:sans-serif;">
          <h1 style="color:#7A1528; font-size:48px;">404</h1>
          <h2>Page Not Found</h2>
          <p>The requested page <code>${decodedPath}</code> could not be found.</p>
          <p><a href="/" style="color:#D4AF37; font-weight:bold;">Return to Home</a></p>
        </body>
        </html>
      `);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // If it's HTML, inject live reload script
    if (ext === '.html') {
      fs.readFile(filePath, 'utf8', (readErr, content) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          return res.end('Internal Server Error');
        }
        const injected = content.includes('</body>')
          ? content.replace('</body>', LIVE_RELOAD_SNIPPET + '</body>')
          : content + LIVE_RELOAD_SNIPPET;
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(injected);
      });
    } else {
      // Stream static assets (images, css, js)
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log('\n======================================================');
  console.log('   ShaadiBanao Matrimony Local Dev Server Started');
  console.log('======================================================');
  console.log(`   - Home Page:         http://localhost:${PORT}`);
  console.log(`   - About Us:          http://localhost:${PORT}/about.html`);
  console.log(`   - Contact & Support: http://localhost:${PORT}/contact.html`);
  console.log(`   - Privacy Policy:    http://localhost:${PORT}/privacy-policy.html`);
  console.log(`   - Terms of Service:  http://localhost:${PORT}/terms.html`);
  console.log(`   - Refund Policy:     http://localhost:${PORT}/refund-policy.html`);
  console.log(`   - Account Deletion:  http://localhost:${PORT}/delete-account.html`);
  console.log('======================================================');
  console.log('   [Live Reload Active] Saving any file reloads browser.\n');
});
