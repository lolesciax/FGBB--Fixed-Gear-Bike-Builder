import { z } from 'zod';
import frameAssets from './frame-assets.json';
export { brandSchema, modelRecordSchema, type CatalogBrand, type ModelRecord } from './catalog-registry';
export const frameAssetSchema=z.object({variantId:z.string(),url:z.string().regex(/^\/models\/frames\/[a-z0-9-]+\.glb$/),fidelity:z.literal('illustrative'),license:z.literal('CC0-1.0'),source:z.string(),scale:z.literal(1),rotation:z.tuple([z.number(),z.number(),z.number()]),origin:z.literal('bottom-bracket'),units:z.literal('metres'),revision:z.literal('frame-kit-v1')}).strict();
export const registeredFrameAssets=z.array(frameAssetSchema).parse(frameAssets);
export { quotaPolicySchema, defaultQuotaPolicy, type QuotaPolicy } from './policy';
export { visualizationInfo } from './fidelity';
export { assemblyGeometry, assetRegistry } from './visual';

export const slots = ['frameset', 'wheels', 'tires', 'cockpit', 'drivetrain', 'saddle'] as const;
export const slotSchema = z.enum(slots);
export type Slot = z.infer<typeof slotSchema>;
export const configurationSchema = z.object({
  frameset: z.string().max(100), wheels: z.string().max(100), tires: z.string().max(100),
  cockpit: z.string().max(100), drivetrain: z.string().max(100), saddle: z.string().max(100),
}).strict();
export type Configuration = z.infer<typeof configurationSchema>;
export const buildInput = z.object({ name: z.string().trim().min(1).max(80), configuration: configurationSchema });
export const productSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,100}$/), brand: z.string().min(1).max(80), name: z.string().min(1).max(120),
  slot: slotSchema, description: z.string().max(1000), status: z.enum(['draft', 'published', 'archived']),
  illustrative: z.boolean(), source: z.url().refine(v => v.startsWith('https://')).optional(),
  verifiedAt: z.iso.datetime().optional(), acknowledgment: z.string().max(1000),
  catalogKind: z.enum(['demo', 'manufacturer']).optional(),
  brandId: z.string().regex(/^[a-z0-9-]{1,100}$/).optional(),
  revision: z.string().max(100).optional(), year: z.number().int().min(1900).max(2100).optional(),
  visual: z.object({ assetId: z.literal('tracklab-parametric-v2'), fidelity: z.literal('measurement-schematic'), source: z.string().max(200), license: z.literal('CC0-1.0'), reviewedAt: z.iso.datetime() }).strict().optional(),
  provenance: z.object({ reviewedAt: z.iso.datetime(), fields: z.array(z.string().max(100)).max(60), limitations: z.string().max(1000) }).strict().optional(),
  variants: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]{1,100}$/), label: z.string().max(100), color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    specs: z.record(z.string(), z.union([z.string().max(200), z.number().finite(), z.boolean()])),
    asset3D:frameAssetSchema.optional(),
  }).strict()).min(1).max(30),
}).strict();
export type Product = z.infer<typeof productSchema>;
export type Variant = Product['variants'][number];
export type State = 'compatible' | 'incompatible' | 'unverified';
export type Rule = { id: string; state: State; message: string; slots: Slot[]; missing: string[]; sources: string[] };
export function variantById(catalog: Product[], id: string) {
  for (const product of catalog) {
    const variant = product.variants.find(v => v.id === id);
    if (variant) return { product, variant };
  }
  return undefined;
}
export function withHistoricalCatalog(current: Product[], snapshot: Product[] = []): Product[] {
  return [...current, ...snapshot.filter(p => !current.some(c => c.id === p.id))];
}
export function validateConfiguration(config: Configuration, catalog: Product[], allowArchived = false) {
  for (const slot of slots) {
    const record = variantById(catalog, config[slot]);
    if (!record || record.product.slot !== slot || (record.product.status !== 'published' && !(allowArchived && record.product.status === 'archived')))
      throw new Error(`The ${slot} selection is unavailable. Choose a published variant.`);
  }
}
export function compatibility(config: Configuration, catalog: Product[]) {
  const selected = Object.fromEntries(slots.map(s => [s, variantById(catalog, config[s])])) as Record<Slot, ReturnType<typeof variantById>>;
  const rules: Rule[] = [];
  const check = (id: string, a: Slot, keyA: string, b: Slot, keyB: string, label: string, compare: (x: unknown, y: unknown) => boolean = (x, y) => x === y) => {
    const av = selected[a]?.variant.specs[keyA], bv = selected[b]?.variant.specs[keyB];
    const missing = [av === undefined ? `${a}.${keyA}` : '', bv === undefined ? `${b}.${keyB}` : ''].filter(Boolean);
    const state: State = missing.length ? 'unverified' : compare(av, bv) ? 'compatible' : 'incompatible';
    rules.push({ id, state, message: `${label}: ${state === 'unverified' ? 'manufacturer measurements needed' : state === 'compatible' ? 'listed dimensions agree' : 'dimensions do not match'}.`, slots: [a, b], missing, sources: [selected[a]?.product.source, selected[b]?.product.source].filter((v): v is string => !!v) });
  };
  check('wheel-diameter', 'wheels', 'bsd', 'tires', 'bsd', 'Rim and tire bead-seat diameter');
  check('clearance', 'frameset', 'tireClearance', 'tires', 'width', 'Frame tire clearance', (x, y) => Number(x) >= Number(y));
  check('rear-spacing', 'frameset', 'rearSpacing', 'wheels', 'rearSpacing', 'Rear hub spacing');
  check('front-spacing', 'frameset', 'frontSpacing', 'wheels', 'frontSpacing', 'Front hub spacing');
  check('axle', 'frameset', 'axle', 'wheels', 'axle', 'Axle and dropout interface');
  check('seatpost', 'frameset', 'seatpost', 'saddle', 'seatpost', 'Seatpost diameter');
  check('clamp', 'frameset', 'stemClamp', 'cockpit', 'stemClamp', 'Stem and handlebar clamp');
  check('bottom-bracket', 'frameset', 'bottomBracket', 'drivetrain', 'bottomBracket', 'Bottom bracket interface');
  check('chain-width', 'drivetrain', 'chainWidth', 'wheels', 'cogWidth', 'Chain and cog width');
  check('chainline', 'drivetrain', 'chainline', 'wheels', 'chainline', 'Chainline');
  check('brakes', 'frameset', 'brakeMount', 'cockpit', 'brakeMount', 'Brake interface');
  if (Object.values(selected).some(v => v?.product.illustrative)) rules.push({ id: 'illustrative', state: 'unverified', message: 'Demo parts use illustrative dimensions. This is not a manufacturer-verified assembly.', slots: [...slots], missing: ['verified manufacturer assembly data'], sources: [] });
  const state: State = rules.some(r => r.state === 'incompatible') ? 'incompatible' : rules.some(r => r.state === 'unverified') ? 'unverified' : 'compatible';
  const front = selected.drivetrain?.variant.specs.frontTeeth, rear = selected.drivetrain?.variant.specs.rearTeeth;
  const ratio = typeof front === 'number' && typeof rear === 'number' && rear > 0 ? front / rear : null;
  const bsd = selected.tires?.variant.specs.bsd, width = selected.tires?.variant.specs.width;
  const gearInches = ratio && typeof bsd === 'number' && typeof width === 'number' ? ((bsd + 2 * width) / 25.4) * ratio : null;
  const weights = Object.values(selected).map(v => v?.variant.specs.weightG);
  return { state, rules, unresolved: rules.filter(r => r.state !== 'compatible').length, ratio, gearInches,
    knownWeightG: weights.reduce<number>((sum, v) => sum + (typeof v === 'number' ? v : 0), 0), weightComplete: weights.every(v => typeof v === 'number'), selectedCount: Object.values(selected).filter(Boolean).length };
}
export const brandDisclaimer = 'TrackLab is an independent bicycle customization and visualization platform. TrackLab is not affiliated with, sponsored by, or officially endorsed by Cinelli, Dosnoventa, or any other bicycle brand featured in this application. All brand names, trademarks, product names, and logos remain the property of their respective owners. Brand and product references are provided for identification and informational purposes. Product specifications, visual representations, and compatibility information may be incomplete or subject to change.';
export const technicalDisclaimer = 'TrackLab provides bicycle visualization and component compatibility information for planning purposes only. Visual representations may be illustrative, and compatibility results are based on the specifications currently available. Always verify measurements, component suitability, and safe assembly requirements with the manufacturer or a qualified bicycle mechanic.';
export const stateLabel: Record<State, string> = { compatible: 'Compatible', incompatible: 'Incompatible', unverified: 'Needs verification' };
