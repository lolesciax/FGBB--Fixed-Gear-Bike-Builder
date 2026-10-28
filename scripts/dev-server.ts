import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseConfig } from '../apps/api/src/config';
import { assertPortAvailable, waitForApi } from './dev-startup';

const config = parseConfig(process.env);
const webPort = Number(process.env.TRACKLAB_WEB_PORT || 5180);
const apiUrl = `http://127.0.0.1:${config.PORT}`;
const children: ChildProcess[] = [];
const startup = new AbortController();
let stopping = false;

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  startup.abort();
  process.exitCode = code;
  await Promise.all(children.map(async child => {
    if (child.exitCode !== null || !child.pid) return;
    if (process.platform === 'win32') {
      // Kill only a process tree created by this launcher, including tsx's watch child.
      await new Promise<void>(resolve => {
        const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
        killer.once('error', () => { child.kill(); resolve(); });
        killer.once('exit', () => resolve());
      });
    } else child.kill('SIGTERM');
  }));
}

function launch(path: string, args: string[]) {
  const child = spawn(process.execPath, [fileURLToPath(new URL(path, import.meta.url)), ...args], {
    stdio: 'inherit', windowsHide: true,
    env: { ...process.env, TRACKLAB_API_PROXY: apiUrl },
  });
  children.push(child);
  child.once('error', error => { console.error(`Unable to start development process: ${error.message}`); void stop(1); });
  child.once('exit', code => {
    if (!stopping) {
      console.error(`A development process exited (${code ?? 'signal'}). Both servers are stopping; restart npm run dev after resolving the error above.`);
      void stop(code || 1);
    }
  });
}

process.once('SIGINT', () => { void stop(); });
process.once('SIGTERM', () => { void stop(); });

try {
  if (config.NODE_ENV === 'production') throw new Error('npm run dev requires a development environment.');
  const frontend = new URL(config.FRONTEND_URL);
  if (frontend.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(frontend.hostname))
    throw new Error('Local development requires FRONTEND_URL to use http://localhost or http://127.0.0.1.');
  if (Number(new URL(config.FRONTEND_URL).port || 80) !== webPort)
    throw new Error(`FRONTEND_URL must use Vite's port ${webPort}. Correct the local .env before starting.`);
  await Promise.all([assertPortAvailable(config.PORT), assertPortAvailable(webPort)]);
  console.info('Starting the API. Waiting for the database and catalog before opening the frontend...');
  launch('../node_modules/tsx/dist/cli.mjs', ['watch', 'apps/api/src/server.ts']);
  await waitForApi(apiUrl, startup.signal);
  if (!stopping) {
    launch('../node_modules/vite/bin/vite.js', ['--config', 'apps/web/vite.config.ts', '--host', frontend.hostname, '--clearScreen', 'false']);
    console.info(`API ready. TrackLab: ${new URL(config.FRONTEND_URL).origin}`);
    console.info('Keep this terminal open while using TrackLab. Ctrl+C stops both servers.');
  }
} catch (error) {
  if (!stopping) { console.error((error as Error).message); await stop(1); }
}
