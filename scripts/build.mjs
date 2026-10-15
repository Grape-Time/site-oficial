import { mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const project = new URL('../', import.meta.url);
const dist = new URL('dist/', project);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(new URL('index.html', project), new URL('index.html', dist));
await cp(new URL('assets/', project), new URL('assets/', dist), { recursive: true });
console.log(`Arquivos estáticos gerados em ${fileURLToPath(dist)}`);
