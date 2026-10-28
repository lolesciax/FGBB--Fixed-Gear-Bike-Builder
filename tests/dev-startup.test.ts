import { createServer } from 'node:http';
import { expect, it } from 'vitest';
import { assertPortAvailable, waitForApi } from '../scripts/dev-startup';

it('waits through unavailable health responses before declaring the API ready', async () => {
  let requests = 0;
  const server = createServer((_request, response) => { response.writeHead(++requests < 3 ? 503 : 200); response.end(); });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as { port: number }).port;
  try {
    await expect(assertPortAvailable(port)).rejects.toThrow('already in use');
    await waitForApi(`http://127.0.0.1:${port}`, new AbortController().signal, 3000);
    expect(requests).toBe(3);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});

it('does not declare a stopped startup ready', async () => {
  const controller = new AbortController(); controller.abort();
  await expect(waitForApi('http://127.0.0.1:1', controller.signal)).rejects.toThrow('startup stopped');
});
