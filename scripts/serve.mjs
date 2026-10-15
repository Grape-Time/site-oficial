import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT precisa ser uma porta válida.');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }); response.end('Método não permitido.'); return;
  }
  try {
    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    // Expõe apenas a página e seus assets; documentação e scripts não são servidos.
    if (relative !== 'index.html' && !relative.startsWith('assets/')) {
      response.writeHead(404); response.end('Página não encontrada.'); return;
    }
    if (relative.includes('\\') || relative.includes('\0') || relative.split('/').some(part => part.startsWith('.'))) {
      response.writeHead(400); response.end('Caminho inválido.'); return;
    }
    const file = path.resolve(root, relative);
    const rootPrefix = root.endsWith(path.sep) ? root : root + path.sep;
    if (!file.startsWith(rootPrefix)) {
      response.writeHead(403); response.end('Acesso não permitido.'); return;
    }
    const bytes = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 400);
    response.end('Arquivo não encontrado ou caminho inválido.');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `A porta ${port} está ocupada. Feche o servidor anterior ou altere PORT.` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Grape disponível em http://localhost:${port}\nPressione Ctrl+C para encerrar.`));
