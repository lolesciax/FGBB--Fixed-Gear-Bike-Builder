import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const destination = new URL('../.env', import.meta.url);
const contents = [
  '# Local TrackLab development. This file is ignored by Git.',
  '# Paste the Atlas Drivers connection URI below, including the database user credentials.',
  '# Keep this URI private. Do not put it in a VITE_ variable.',
  'MONGODB_URI=',
  'MONGODB_DB_NAME=tracklab_dev',
  'NODE_ENV=development',
  'PORT=4000',
  'FRONTEND_URL=http://127.0.0.1:5180',
  `SESSION_SECRET=${randomBytes(48).toString('base64url')}`,
  'COOKIE_SAME_SITE=lax',
  'TRUST_PROXY_HOPS=0',
  'DEVELOPMENT_EPHEMERAL=false',
  '# Development only: business quota history persists in Atlas; request counters reset.',
  'DEVELOPMENT_MEMORY_RATE_LIMITS=true',
  'PRICING_ENABLED=false',
  '# No SMTP needed yet: local verification/recovery links go to .local/mail/.',
  '',
].join('\n');
try {
  await writeFile(destination, contents, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
  console.info('Prepared the ignored root .env with a random session secret. Add your Atlas URI to MONGODB_URI, then run npm run db:check.');
} catch (error) {
  if (error.code === 'EEXIST') console.info('Existing .env retained without changes.');
  else throw error;
}
