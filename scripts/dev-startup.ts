import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

export async function assertPortAvailable(port: number) {
  await new Promise<void>((resolve, reject) => {
    const server = createServer();
    server.once('error', () => reject(new Error(`Port ${port} is already in use. Stop the existing TrackLab terminal before starting another copy.`)));
    server.listen(port, '127.0.0.1', () => server.close(error => error ? reject(error) : resolve()));
  });
}

export async function waitForApi(url: string, signal: AbortSignal, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  while (!signal.aborted && Date.now() < deadline) {
    try {
      const response = await fetch(`${url}/api/health`, { signal: AbortSignal.any([signal, AbortSignal.timeout(1000)]) });
      if (response.ok) return;
    } catch { /* Atlas and catalog initialization may still be in progress. */ }
    await delay(200, undefined, { signal }).catch(() => undefined);
  }
  if (signal.aborted) throw new Error('Development startup stopped.');
  throw new Error('The API did not become ready. Check the API error above and the Atlas connection. The frontend was not started.');
}
