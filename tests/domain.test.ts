import { describe, expect, it } from 'vitest';
import { withHistoricalCatalog,assemblyGeometry, compatibility, validateConfiguration, productSchema } from '@tracklab/domain';
import { defaultConfiguration, seedCatalog } from '../backend/src/catalog';
describe('compatibility engine', () => {
  it('keeps unknown fixed-cog and crank mounts unverified and rejects a known mounting mismatch', () => {
    const initial=compatibility(defaultConfiguration,seedCatalog);
    expect(initial.rules.find(r=>r.id==='fixed-cog-mount')?.state).toBe('unverified');
    expect(initial.rules.find(r=>r.id==='chainring-mount')?.state).toBe('unverified');
    const catalog=structuredClone(seedCatalog);
    catalog.find(p=>p.id==='studio-classic')!.variants[0].specs.cogMount='threaded';
    const drive=catalog.find(p=>p.id==='studio-46')!.variants[0].specs;
    drive.cogMount='splined';drive.chainringMount='144BCD';drive.crankChainringMount='direct';
    const result=compatibility(defaultConfiguration,catalog);
    expect(result.rules.find(r=>r.id==='fixed-cog-mount')?.state).toBe('incompatible');
    expect(result.rules.find(r=>r.id==='chainring-mount')?.state).toBe('incompatible');
  });
  it('merges a saved retired variant into an existing product without exposing it for new selections',()=>{
    const snapshot=structuredClone(seedCatalog.find(p=>p.id==='studio-track')!);
    const current={...snapshot,variants:snapshot.variants.filter(v=>v.id!==defaultConfiguration.frameset)};
    const merged=withHistoricalCatalog([current],[snapshot]);
    expect(merged[0].variants.find(v=>v.id===defaultConfiguration.frameset)?.status).toBe('archived');
    const all=[...seedCatalog.filter(p=>p.id!==current.id),...merged];
    expect(()=>validateConfiguration(defaultConfiguration,all)).toThrow();
    expect(()=>validateConfiguration(defaultConfiguration,all,true)).not.toThrow();
  });
  it('uses reviewed size geometry while leaving unknown manufacturer interfaces unresolved',()=>{
    const la=seedCatalog.find(p=>p.id==='dosnoventa-02-la')!;
    const medium=la.variants.find(v=>v.specs.size==='M')!;
    const g=assemblyGeometry(medium.specs);
    expect(g.head.x-g.bb.x).toBe(396);expect(g.bb.y-g.head.y).toBe(515);
    expect(g.head).not.toEqual(assemblyGeometry(la.variants[0].specs).head);
    expect(medium.specs.frontSpacing).toBeUndefined();
    expect(compatibility({...defaultConfiguration,frameset:medium.id},seedCatalog).state).toBe('unverified');
    const bcn=seedCatalog.find(p=>p.id==='dosnoventa-01-bcn')!;
    expect(bcn.variants[0].specs.stack).toBeUndefined();expect(bcn.variants[0].specs.forkRake).toBeUndefined();
  });
  it('never calls demo geometry a verified compatible assembly', () => { const result = compatibility(defaultConfiguration, seedCatalog); expect(result.state).toBe('unverified'); expect(result.rules.find(r => r.id === 'illustrative')?.state).toBe('unverified'); expect(result.ratio).toBeCloseTo(46 / 16); expect(result.weightComplete).toBe(false); });
  it('rejects a known tire-clearance conflict and identifies the affected parts', () => { const result = compatibility({ ...defaultConfiguration, frameset: 'studio-pursuit-forest', tires: 'studio-tire28' }, seedCatalog); expect(result.state).toBe('incompatible'); expect(result.rules.find(r => r.id === 'clearance')?.slots).toEqual(['frameset', 'tires']); });
  it('reports missing measurements including unknown saddle rail and clamp interfaces', () => { const data = structuredClone(seedCatalog).map(p => ({ ...p, illustrative: false, variants: p.variants.map(v => ({ ...v, specs: {} })) })); const result = compatibility(defaultConfiguration, data); expect(result.state).toBe('unverified'); expect(result.rules.every(r => r.missing.length > 0)).toBe(true);expect(result.rules.find(r=>r.id==='saddle-rails')?.state).toBe('unverified'); expect(result.ratio).toBeNull(); });
  it('rejects variants in the wrong slot, unknown variants, and draft products', () => { expect(() => validateConfiguration({ ...defaultConfiguration, frameset: 'studio-classic' }, seedCatalog)).toThrow(); expect(() => validateConfiguration({ ...defaultConfiguration, frameset: 'missing' }, seedCatalog)).toThrow(); expect(() => validateConfiguration({ ...defaultConfiguration, frameset: 'cinelli-vigorelli-reference' }, seedCatalog)).toThrow(); });
  it('validates the entire seed catalog', () => { for (const p of seedCatalog) expect(productSchema.safeParse(p).success).toBe(true); });
});
