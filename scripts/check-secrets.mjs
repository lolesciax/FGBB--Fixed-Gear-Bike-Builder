import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { parse } from 'dotenv';

const paths = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
let localSecrets = [];
try {
  const env = parse(await readFile(new URL('../.env', import.meta.url)));
  localSecrets = ['MONGODB_URI', 'SESSION_SECRET', 'REDIS_URL', 'SMTP_PASS', 'STORAGE_SECRET_KEY'].map(key => env[key]).filter(value => value && value.length >= 8);
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const problems = [];
for (const path of paths) {
  if ((/(^|\/)\.env(?:\.|$)/.test(path) && !path.endsWith('.env.example')) || path.startsWith('.local/')) {
    problems.push(`${path}: private runtime file is staged`);
    continue;
  }
  const bytes = execFileSync('git', ['show', `:${path}`], { maxBuffer: 20 * 1024 * 1024 });
  if (bytes.includes(0) || /\.(png|jpg|jpeg|webp|glb|woff2?)$/i.test(path)) continue;
  const content = bytes.toString('utf8');
  if (localSecrets.some(value => content.includes(value))) problems.push(`${path}: contains a configured local secret`);
  if (/mongodb(?:\+srv)?:\/\/[^\s:<]+:[^\s@<]+@/i.test(content)) problems.push(`${path}: contains a MongoDB URI with inline credentials`);
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) problems.push(`${path}: contains a private key`);
}
if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
else console.info(`Checked ${paths.length} staged files. No configured local credentials or private runtime files found.`);
