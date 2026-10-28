import { manufacturerCatalog } from './manufacturer-catalog';
import type { Product, Configuration, Slot } from '@tracklab/domain';

const colors = [{ name: 'Forest', hex: '#294f40' }, { name: 'Graphite', hex: '#303432' }, { name: 'Silver', hex: '#b7b9b5' }, { name: 'Chalk', hex: '#e9e8df' }, { name: 'Acid', hex: '#d9ed85' }];
const demo = (id: string, name: string, slot: Slot, description: string, specs: Record<string, string | number | boolean>, finishes = false): Product => ({
  id, name, slot, description, brand: 'TrackLab Studio', status: 'published', illustrative: true, catalogKind: 'demo',
  acknowledgment: 'An independently created illustrative demo, not a product for sale. Dimensions are demonstration data, not verified manufacturer specifications.',
  variants: finishes ? colors.map(c => ({ id: `${id}-${c.name.toLowerCase()}`, label: c.name, color: c.hex, specs })) : [{ id, label: 'Standard', color: '#303432', specs }],
});
export const seedCatalog: Product[] = [
  demo('studio-track', 'Studio Track', 'frameset', 'Classic track proportions. A clean starting point for your next idea.', { rearSpacing: 120, frontSpacing: 100, axle: 'solid-10', tireClearance: 28, seatpost: 27.2, stemClamp: 31.8, bottomBracket: 'BSA-68', brakeMount: 'caliper', geometry: 'track' }, true),
  demo('studio-pursuit', 'Studio Pursuit', 'frameset', 'A sloping top tube and a more assertive silhouette. Illustrative geometry.', { rearSpacing: 120, frontSpacing: 100, axle: 'solid-10', tireClearance: 25, seatpost: 27.2, stemClamp: 31.8, bottomBracket: 'BSA-68', brakeMount: 'caliper', geometry: 'pursuit' }, true),
  demo('studio-classic', 'Classic spokes', 'wheels', 'A traditional spoked profile with shallow rims.', { bsd: 622, rearSpacing: 120, frontSpacing: 100, axle: 'solid-10', cogWidth: '1/8', chainline: 42, rimDepth: 25 }),
  demo('studio-deep', 'Deep section', 'wheels', 'A deeper rim profile for a different visual rhythm.', { bsd: 622, rearSpacing: 120, frontSpacing: 100, axle: 'solid-10', cogWidth: '1/8', chainline: 42, rimDepth: 60 }),
  demo('studio-tire25', 'Road 25', 'tires', 'A slim black tire profile. Demo dimensions only.', { bsd: 622, width: 25, sidewall: 'black' }),
  demo('studio-tire28', 'Road 28 · tan wall', 'tires', 'A wider profile with a warm tan sidewall. Requires sufficient clearance.', { bsd: 622, width: 28, sidewall: 'tan' }),
  demo('studio-drop', 'Track drops', 'cockpit', 'Curved drop bars with black wrap.', { stemClamp: 31.8, brakeMount: 'caliper', shape: 'drop' }),
  demo('studio-riser', 'City riser', 'cockpit', 'An upright riser profile for a relaxed visual setup.', { stemClamp: 31.8, brakeMount: 'caliper', shape: 'riser' }),
  demo('studio-46', 'Fixed 46 / 16', 'drivetrain', 'A complete illustrative crank, chain and sprocket selection.', { frontTeeth: 46, rearTeeth: 16, chainWidth: '1/8', chainline: 42, bottomBracket: 'BSA-68' }),
  demo('studio-48', 'Fixed 48 / 17', 'drivetrain', 'An alternative illustrative chainring and sprocket combination.', { frontTeeth: 48, rearTeeth: 17, chainWidth: '1/8', chainline: 42, bottomBracket: 'BSA-68' }),
  demo('studio-race', 'Track saddle', 'saddle', 'A slim racing silhouette with a matching seatpost.', { seatpost: 27.2, shape: 'race' }),
  demo('studio-comfort', 'Everyday saddle', 'saddle', 'A broader, softer-looking silhouette with a matching seatpost.', { seatpost: 27.2, shape: 'comfort' }),
  ...manufacturerCatalog,
];
export const defaultConfiguration: Configuration = { frameset: 'studio-track-graphite', wheels: 'studio-classic', tires: 'studio-tire25', cockpit: 'studio-drop', drivetrain: 'studio-46', saddle: 'studio-race' };
