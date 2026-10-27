import { describe, expect, it } from 'vitest';
import { compatibility, validateConfiguration, productSchema } from '@tracklab/domain';
import { defaultConfiguration, seedCatalog } from '../apps/api/src/catalog';
describe('compatibility engine', () => {
  it('never calls demo geometry a verified compatible assembly', () => { const result = compatibility(defaultConfiguration, seedCatalog); expect(result.state).toBe('unverified'); expect(result.rules.find(r => r.id === 'illustrative')?.state).toBe('unverified'); expect(result.ratio).toBeCloseTo(46 / 16); expect(result.weightComplete).toBe(false); });
  it('rejects a known tire-clearance conflict and identifies the affected parts', () => { const result = compatibility({ ...defaultConfiguration, frameset: 'studio-pursuit-forest', tires: 'studio-tire28' }, seedCatalog); expect(result.state).toBe('incompatible'); expect(result.rules.find(r => r.id === 'clearance')?.slots).toEqual(['frameset', 'tires']); });
  it('reports missing measurements rather than treating no failure as compatibility', () => { const data = structuredClone(seedCatalog).map(p => ({ ...p, illustrative: false, variants: p.variants.map(v => ({ ...v, specs: {} })) })); const result = compatibility(defaultConfiguration, data); expect(result.state).toBe('unverified'); expect(result.rules.every(r => r.missing.length > 0)).toBe(true); expect(result.ratio).toBeNull(); });
  it('rejects variants in the wrong slot, unknown variants, and draft products', () => { expect(() => validateConfiguration({ ...defaultConfiguration, frameset: 'studio-classic' }, seedCatalog)).toThrow(); expect(() => validateConfiguration({ ...defaultConfiguration, frameset: 'missing' }, seedCatalog)).toThrow(); expect(() => validateConfiguration({ ...defaultConfiguration, frameset: 'cinelli-vigorelli-reference' }, seedCatalog)).toThrow(); });
  it('validates the entire seed catalog', () => { for (const p of seedCatalog) expect(productSchema.safeParse(p).success).toBe(true); });
});
