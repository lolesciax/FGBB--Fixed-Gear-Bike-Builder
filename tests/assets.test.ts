import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import registry from '../apps/web/public/models/registry.json';
describe('registered schematic assets', () => {
  it('registers complete, original GLB v2 parts in a shared coordinate system', async () => { expect(registry.units).toBe('metres'); expect(registry.authenticManufacturerGeometry).toBe(false); expect(registry.assets).toHaveLength(11); for (const asset of registry.assets) { const data = await readFile(new URL(`../apps/web/public/models/${asset}`, import.meta.url)); expect(data.toString('ascii', 0, 4)).toBe('glTF'); expect(data.readUInt32LE(4)).toBe(2); expect(data.readUInt32LE(8)).toBe(data.length); } });
});
