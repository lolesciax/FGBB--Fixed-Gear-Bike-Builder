import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { makeTestEnvironment } from './test-environment';

const env = makeTestEnvironment();
const children: ChildProcess[] = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true; process.exitCode = code;
  for (const child of children) if (child.exitCode === null) child.kill('SIGTERM');
}
function launch(path: string, args: string[]) {
  const child = spawn(process.execPath, [fileURLToPath(new URL(path, import.meta.url)), ...args], { env, stdio: 'inherit', windowsHide: true });
  children.push(child);
  child.once('error', () => stop(1));
  child.once('exit', code => { if (!stopping) stop(code ?? 1); });
  return child;
}
async function assertPortAvailable(port: number) {
  await new Promise<void>((resolve, reject) => {
    const server = createServer();
    server.once('error', () => reject(new Error(`Browser-test port ${port} is in use. Stop that test server; tests never reuse the development app.`)));
    server.listen(port, '127.0.0.1', () => server.close(e => e ? reject(e) : resolve()));
  });
}
process.once('SIGTERM', () => stop()); process.once('SIGINT', () => stop());
await Promise.all([assertPortAvailable(4010), assertPortAvailable(5190)]);
const api = launch('../node_modules/tsx/dist/cli.mjs', ['apps/api/src/server.ts']);
try {
  let ready = false;
  for (let attempt = 0; attempt < 480 && !stopping; attempt++) {
    if (api.exitCode !== null) throw new Error('The isolated test API exited before becoming ready.');
    try { const response = await fetch('http://127.0.0.1:4010/api/health', { signal: AbortSignal.timeout(1000) }); ready = response.ok; } catch { /* Wait for the temporary replica set. */ }
    if (ready) break;
    await delay(250);
  }
  if (!ready) throw new Error('The isolated test API did not become ready.');
  const session = await (await fetch('http://127.0.0.1:4010/api/session')).json();
  if (session.mode !== 'ephemeral-development') throw new Error('Refusing to run browser tests against a persistent database.');
  launch('../node_modules/vite/bin/vite.js', [...(process.argv.includes('--preview') ? ['preview'] : []), '--config', 'apps/web/vite.config.ts']);
  console.info('Browser tests use isolated temporary MongoDB and ports 4010/5190. Atlas and SMTP are not used.');
} catch (error) { console.error((error as Error).message); stop(1); }
