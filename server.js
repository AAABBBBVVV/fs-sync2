const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'server-data.json');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

// ---------- Helpers ----------

function readJSON(file) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return null; }
}

function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// ---------- Server ----------

const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    var url = new URL(req.url, 'http://localhost');
    var p = url.pathname;

    // ==================== Sync API ====================

    // Save: POST /api/sync/save
    if (p === '/api/sync/save' && req.method === 'POST') {
        let body = '';
        await new Promise(function(resolve) { req.on('data', function(c) { body += c; }); req.on('end', resolve); });
        try {
            var data = JSON.parse(body);
            // Merge: read existing, overwrite keys from client, write back
            var existing = readJSON(DATA_FILE) || {};
            for (var k of Object.keys(data)) { existing[k] = data[k]; }
            writeJSON(DATA_FILE, existing);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('{"ok":true}');
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // Load: GET /api/sync/load
    if (p === '/api/sync/load') {
        var existing = readJSON(DATA_FILE) || {};
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(existing));
        return;
    }

    // ==================== Feishu Proxy ====================

    if (p.startsWith('/api/feishu/')) {
        var fp = p.replace('/api/feishu/', '');
        var fu = 'https://open.feishu.cn/open-apis/' + fp + url.search;
        try {
            var opts = { method: req.method, headers: { 'Content-Type': 'application/json' } };
            if (req.headers['authorization']) opts.headers['Authorization'] = req.headers['authorization'];
            if (req.method === 'POST') {
                var body = '';
                await new Promise(function(resolve) { req.on('data', function(c) { body += c; }); req.on('end', resolve); });
                opts.body = body;
            }
            var resp = await fetch(fu, opts);
            var data = await resp.text();
            res.writeHead(resp.status, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
        return;
    }

    // ==================== Static Files (with sync injection for HTML) ====================

    var f = p === '/' ? '/3.0.0.html' : p;
    f = path.join(PUBLIC, f);
    if (!f.startsWith(PUBLIC)) { res.writeHead(403); res.end('Forbidden'); return; }

    try {
        // Read the requested file
        var content = fs.readFileSync(f);

        // If serving the main HTML, inject sync data & script
        if (p === '/' || p === '/3.0.0.html') {
            var html = content.toString('utf8');

            // Build injection script
            var injectHtml = '';
            var serverData = readJSON(DATA_FILE);
            if (serverData) {
                injectHtml += '<script>window.__SERVER_DATA__=' + JSON.stringify(serverData) + ';</script>';
            }
            injectHtml += '<script src="/sync-client.js"></script>';

            // Inject before </head> (before main app scripts)
            html = html.replace('</head>', injectHtml + '</head>');
            content = Buffer.from(html, 'utf8');
        }

        res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        res.end(content);
    } catch (e) {
        // Fallback: serve 3.0.0.html for SPA client-side routing
        try {
            var html = fs.readFileSync(path.join(PUBLIC, '3.0.0.html'), 'utf8');
            // Also inject for fallback
            var injectHtml = '';
            var serverData = readJSON(DATA_FILE);
            if (serverData) {
                injectHtml += '<script>window.__SERVER_DATA__=' + JSON.stringify(serverData) + ';</script>';
            }
            injectHtml += '<script src="/sync-client.js"></script>';
            html = html.replace('</head>', injectHtml + '</head>');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        } catch (f) { res.writeHead(404); res.end('Not found'); }
    }
});

server.listen(PORT, function() { console.log('Server running on port ' + PORT); });
