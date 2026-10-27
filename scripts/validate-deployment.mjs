import { readFile } from 'node:fs/promises';
import Ajv from 'ajv';
import Ajv2020 from 'ajv/dist/2020.js';
import AjvDraft04 from 'ajv-draft-04';
import addFormats from 'ajv-formats';
import YAML from 'yaml';
for (const [file, url] of [['render.yaml', 'https://render.com/schema/render.yaml.json'], ['vercel.json', 'https://openapi.vercel.sh/vercel.json']]) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Schema download failed for ${file}: ${response.status}`);
  const schema = await response.json();
  const dialect = String(schema.$schema);
  const Validator = dialect.includes('2020-12') ? Ajv2020 : dialect.includes('draft-04') ? AjvDraft04 : Ajv;
  const ajv = new Validator({ strict: false, allErrors: true });
  addFormats(ajv);
  const raw = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
  const data = file.endsWith('.yaml') ? YAML.parse(raw) : JSON.parse(raw);
  const validate = ajv.compile(schema);
  if (!validate(data)) { console.error(JSON.stringify(validate.errors, null, 2)); process.exitCode = 1; }
  else console.info(`${file}: valid against ${url}`);
}
