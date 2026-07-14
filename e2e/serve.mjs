// Minimal zero-dependency static file server for the e2e suite. Serves the
// repository root so the app runs exactly as deployed (no bundling step).
// Playwright starts/stops this via the webServer option in the config.
import {createServer} from 'node:http';
import {createReadStream, statSync} from 'node:fs';
import {join, normalize, extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.env.PORT || 8947);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

createServer((req, res) => {
  // Strip query/hash, resolve inside ROOT only.
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end();
    return;
  }
  let st;
  try {
    st = statSync(file);
  } catch {
    res.writeHead(404).end('not found: ' + path);
    return;
  }
  if (st.isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    'Content-Type': MIME[extname(file)] || 'application/octet-stream',
    'Content-Length': st.size,
    'Cache-Control': 'no-store',
  });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`e2e server on :${PORT}, root ${ROOT}`));
