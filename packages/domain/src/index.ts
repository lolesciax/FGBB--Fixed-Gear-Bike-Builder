import { z } from 'zod';
import frameAssets from './frame-assets.json';
import { colorwaySchema, selectedColorway } from './colorways';
import {appearanceSchema,componentFinishSchema,appearanceIssues} from './finishes';
export * from './finishes';
export {steeringStack,dropoutOutline,type DropoutStyle} from './steering';
export * from './colorways';
export { brandSchema, modelRecordSchema, type CatalogBrand, type ModelRecord } from './catalog-registry';
export const frameAssetSchema=z.object({variantId:z.string(),url:z.string().regex(/^\/models\/frames\/[a-z0-9-]+\.glb$/),fidelity:z.literal('illustrative'),license:z.literal('CC0-1.0'),source:z.string(),scale:z.literal(1),rotation:z.tuple([z.number(),z.number(),z.number()]),origin:z.literal('bottom-bracket'),units:z.literal('metres'),revision:z.enum(['frame-kit-v1','frame-kit-v2','frame-kit-v3'])}).strict();
export const registeredFrameAssets=z.array(frameAssetSchema).parse(frameAssets);
export { quotaPolicySchema, defaultQuotaPolicy, type QuotaPolicy } from './policy';
export { visualizationInfo } from './fidelity';
export { assemblyGeometry, assetRegistry } from './visual';
export { componentGeometry, cockpitDimensions, handlebarPoints, forkBladePoints, wheelDimensions, spokeEndpoints, pitchRadius, barTypes, type Position, type BarType, type BicycleGeometry } from './components';

export const slots = ['frameset', 'wheels', 'tires', 'cockpit', 'drivetrain', 'saddle'] as const;
export const slotSchema = z.enum(slots);
export type Slot = z.infer<typeof slotSchema>;
export const configurationSchema = z.object({
  frameset: z.string().max(100), wheels: z.string().max(100), tires: z.string().max(100),
  cockpit: z.string().max(100), drivetrain: z.string().max(100), saddle: z.string().max(100),
  appearance:appearanceSchema.optional(),
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
  colorways:z.array(colorwaySchema).max(40).optional(),
  variants: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]{1,100}$/), label: z.string().max(100), color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    specs: z.record(z.string(), z.union([z.string().max(200), z.number().finite(), z.boolean()])),
    status:z.enum(['draft','published','archived']).optional(),
    colorwayId:z.string().regex(/^[a-z0-9-]{1,100}$/).optional(),
    geometryVariantId:z.string().regex(/^[a-z0-9-]{1,100}$/).optional(),
    componentFinishes:z.array(componentFinishSchema).max(6).refine(v=>new Set(v.map(r=>r.zone)).size===v.length,'Component finish regions must be unique.').optional(),
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
  return [...current.map(product=>{
    const old=snapshot.find(p=>p.id===product.id);
    if(!old)return product;
    const pinned=new Set(old.variants.map(v=>v.colorwayId).filter(Boolean));
    return {...product,colorways:[...(product.colorways||[]).map(c=>pinned.has(c.id)?old.colorways?.find(o=>o.id===c.id)||c:c),...(old.colorways||[]).filter(c=>!product.colorways?.some(n=>n.id===c.id))],variants:[...product.variants.map(v=>{const previous=old.variants.find(o=>o.id===v.id);return previous?{...previous,asset3D:v.asset3D||previous.asset3D,status:v.status}:v;}),...old.variants.filter(v=>!product.variants.some(c=>c.id===v.id)).map(v=>({...v,status:'archived' as const}))]};
  }), ...snapshot.filter(p => !current.some(c => c.id === p.id)).map(p=>({...p,status:'archived' as const}))];
}
export function validateConfiguration(config: Configuration, catalog: Product[], allowArchived = false) {
  const finishErrors=appearanceIssues(config,catalog);if(finishErrors.length)throw new Error(finishErrors.join(' '));
  for (const slot of slots) {
    const record = variantById(catalog, config[slot]);
    const colorway=record&&selectedColorway(record.product,record.variant);
    if (!record || record.product.slot !== slot || (record.variant.colorwayId&&(!colorway||(colorway.status!=='published'&&!(allowArchived&&colorway.status==='archived')))) || (record.product.status !== 'published' && !(allowArchived && record.product.status === 'archived')) || (record.variant.status && record.variant.status!=='published' && !(allowArchived&&record.variant.status==='archived')))
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
  check('frame-wheel-diameter', 'frameset', 'wheelBsd', 'wheels', 'bsd', 'Frame wheel size');
  check('clearance', 'frameset', 'tireClearance', 'tires', 'width', 'Frame tire clearance', (x, y) => Number(x) >= Number(y));
  check('fork-clearance', 'frameset', 'forkTireClearance', 'tires', 'width', 'Fork tire clearance', (x,y)=>Number(x)>=Number(y));
  check('rear-spacing', 'frameset', 'rearSpacing', 'wheels', 'rearSpacing', 'Rear hub spacing');
  check('front-spacing', 'frameset', 'frontSpacing', 'wheels', 'frontSpacing', 'Front hub spacing');
  check('axle', 'frameset', 'axle', 'wheels', 'axle', 'Axle and dropout interface');
  check('front-axle-diameter', 'frameset', 'frontAxleDiameter', 'wheels', 'frontAxleDiameter', 'Front axle diameter');
  check('rear-axle-diameter', 'frameset', 'rearAxleDiameter', 'wheels', 'rearAxleDiameter', 'Rear axle diameter');
  // Seatpost tube diameter belongs to the frame; saddle rails meet a separate clamp.
  const seating=selected.saddle?.variant.specs,rail=seating?.railInterface,clamp=seating?.clampInterface;
  rules.push({id:'saddle-rails',state:rail!==undefined&&clamp!==undefined&&rail!==clamp?'incompatible':'compatible',message:rail!==undefined&&clamp!==undefined?(rail===clamp?'Saddle rails and post clamp: listed interfaces agree.':'Saddle rails and post clamp: listed interfaces conflict.'):'Saddle rail/clamp interface is abstracted; no documented conflict. Verify physical rail fit.',slots:['saddle'],missing:[],sources:[selected.saddle?.product.source].filter((v):v is string=>!!v)});
  check('clamp', 'frameset', 'stemClamp', 'cockpit', 'stemClamp', 'Stem and handlebar clamp');
  check('bottom-bracket', 'frameset', 'bottomBracket', 'drivetrain', 'bottomBracket', 'Bottom bracket interface');
  check('chain-width', 'drivetrain', 'chainWidth', 'wheels', 'cogWidth', 'Chain and cog width');
  check('chainline', 'drivetrain', 'chainline', 'wheels', 'chainline', 'Chainline');
  check('fixed-cog-mount', 'drivetrain', 'cogMount', 'wheels', 'cogMount', 'Fixed cog and rear hub mounting');
  check('chainring-mount', 'drivetrain', 'chainringMount', 'drivetrain', 'crankChainringMount', 'Chainring and crank mounting');
  check('brakes', 'frameset', 'brakeMount', 'cockpit', 'brakeMount', 'Brake interface');
  check('front-brake', 'frameset', 'frontBrakeType', 'wheels', 'frontBrakeType', 'Front brake and hub provision');
  check('headset', 'frameset', 'headset', 'cockpit', 'headset', 'Headset assembly');
  check('stem-steerer', 'frameset', 'stemSteerer', 'cockpit', 'stemSteerer', 'Stem steerer clamp');
  check('chainring-clearance', 'frameset', 'maxChainring', 'drivetrain', 'frontTeeth', 'Maximum chainring', (x,y)=>Number(x)>=Number(y));
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
