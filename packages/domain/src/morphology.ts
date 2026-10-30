import { z } from "zod";
import { dropoutOutline } from "./steering";
import { trackEndOutline, frontEndOutline } from "./construction";
import type { Product, Variant } from "./index";
import {
  forkBladePoints,
  type BicycleGeometry,
  type Position,
} from "./components";
export const morphologyIdSchema = z.enum([
  "cinelli-vigorelli-alu-v1",
  "skream-magnum-v1",
  "skream-ranger-v1",
  "8bar-krzberg-v8-v1",
  "leader-735-2024-v1",
  "tsunami-snm100-standard-v1",
]);
export type MorphologyId = z.infer<typeof morphologyIdSchema>;
export type SectionKind = "circular" | "elliptical" | "blade" | "custom";
export type TubeRegion = "top" | "down" | "seat";
export type TubeSection = {
  kind: SectionKind;
  stations: { at: number; width: number; depth: number }[];
  custom?: [number, number][];
};
export type FrameMorphology = {
  id: MorphologyId;
  source: string;
  description: string;
  tubes: Record<TubeRegion, TubeSection>;
  seatJunction: number;
  stayJunction: number;
  seatRelief?: boolean;
  post: {
    kind: "round" | "dedicated-aero";
    interface?: string;
    width?: number;
    depth?: number;
    exposure: number;
  };
  fork: {
    kind: "carbon-blade" | "alloy-straight";
    rootHalf: number;
    rootWidth: number;
    rootDepth: number;
    tipWidth: number;
    tipDepth: number;
  };
  rearPlate: "integrated" | "replaceable" | "double-sided-inserts";
  steeringReference?: {
    upperSteererDiameter: number;
    lowerSteererDiameter: number;
    source: string;
    headset?: string;
  };
};
export const morphologyBindings: Record<string, MorphologyId> = {
  "cinelli-vigorelli": "cinelli-vigorelli-alu-v1",
  "skream-magnum": "skream-magnum-v1",
  "skream-ranger": "skream-ranger-v1",
  "8bar-krzberg-v8": "8bar-krzberg-v8-v1",
  "leader-735": "leader-735-2024-v1",
  "tsunami-snm100": "tsunami-snm100-standard-v1",
};
const section = (
  kind: SectionKind,
  ...sizes: [number, number, number][]
): TubeSection => ({
  kind,
  stations: sizes.map(([at, width, depth]) => ({ at, width, depth })),
});
const carbon = {
  kind: "carbon-blade" as const,
  rootHalf: 36,
  rootWidth: 20,
  rootDepth: 38,
  tipWidth: 9,
  tipDepth: 15,
};
/** Qualitative construction is sourced; every section dimension below is an authored approximation, not a proprietary measurement. */
export const frameMorphologies: Record<MorphologyId, FrameMorphology> = {
  "cinelli-vigorelli-alu-v1": {
    id: "cinelli-vigorelli-alu-v1",
    source: "https://usa.cinelli-milano.com/products/vigorelli-track-alu-frame",
    description:
      "Aluminum family: blade seat tube, dedicated aero post and tapered carbon fork. Approximate sections.",
    tubes: {
      top: section("elliptical", [0, 32, 28], [1, 36, 32]),
      down: section("elliptical", [0, 38, 42], [0.55, 40, 52], [1, 40, 48]),
      seat: section("blade", [0, 30, 36], [0.35, 30, 52], [1, 30, 58]),
    },
    seatJunction: 18,
    stayJunction: 30,
    seatRelief: true,
    post: {
      kind: "dedicated-aero",
      interface: "cinelli-vigorelli-alu-aero",
      width: 24,
      depth: 44,
      exposure: 110,
    },
    fork: { ...carbon, rootDepth: 42 },
    rearPlate: "replaceable",
    steeringReference: {
      upperSteererDiameter: 28.6,
      lowerSteererDiameter: 38.1,
      headset: "IS42/28.6 | IS52/40",
      source: "https://usa.cinelli-milano.com/blogs/news/shop-talk-9-vigorelli",
    },
  },
  "skream-magnum-v1": {
    id: "skream-magnum-v1",
    source: "https://skreambikes.com/products/magnum_dune",
    description:
      "Magnum alloy frame/carbon fork family; authored oval transitions and blade surfaces.",
    tubes: {
      top: section("elliptical", [0, 34, 30], [1, 38, 33]),
      down: section("elliptical", [0, 40, 42], [0.6, 42, 50], [1, 40, 48]),
      seat: section("circular", [0, 36, 36], [1, 36, 36]),
    },
    seatJunction: 16,
    stayJunction: 22,
    post: { kind: "round", exposure: 115 },
    fork: { ...carbon, rootWidth: 22, rootDepth: 43 },
    rearPlate: "integrated",
  },
  "skream-ranger-v1": {
    id: "skream-ranger-v1",
    source: "https://skreambikes.com/products/ranger-forest-frameset",
    description:
      "Longer Ranger rear triangle and clearance-oriented carbon fork; exact mount positions unverified.",
    tubes: {
      top: section("elliptical", [0, 33, 31], [1, 37, 34]),
      down: section("elliptical", [0, 39, 42], [0.6, 41, 48], [1, 40, 46]),
      seat: section("circular", [0, 36, 36], [1, 36, 36]),
    },
    seatJunction: 16,
    stayJunction: 24,
    post: { kind: "round", exposure: 110 },
    fork: {
      ...carbon,
      rootHalf: 42,
      rootWidth: 22,
      rootDepth: 44,
      tipWidth: 10,
      tipDepth: 18,
    },
    rearPlate: "integrated",
  },
  "8bar-krzberg-v8-v1": {
    id: "8bar-krzberg-v8-v1",
    source: "https://8bar-bikes.com/8bar_krzberg_v8/",
    description:
      "V8 oval top tube and stainless plates on both dropout faces. Logos omitted.",
    tubes: {
      top: section("elliptical", [0, 38, 26], [1, 42, 29]),
      down: section("elliptical", [0, 38, 42], [0.6, 40, 48], [1, 40, 46]),
      seat: section("circular", [0, 33, 33], [1, 33, 33]),
    },
    seatJunction: 16,
    stayJunction: 24,
    post: { kind: "round", exposure: 110 },
    fork: { ...carbon, rootDepth: 40 },
    rearPlate: "double-sided-inserts",
  },
  "leader-735-2024-v1": {
    id: "leader-735-2024-v1",
    source:
      "https://www.leaderbikesusa.com/products/2023-leader-735-with-carbon-aero-seat-post",
    description:
      "2024 USA 735 hammerhead/aero construction and CASP6 post. Research profile only; anchor gaps keep product draft.",
    tubes: {
      top: {
        ...section("custom", [0, 34, 34], [0.75, 42, 44], [1, 50, 55]),
        custom: [
          [0, 0.5],
          [0.35, 0.5],
          [0.5, 0.3],
          [0.5, -0.35],
          [0.35, -0.5],
          [0, -0.5],
          [-0.35, -0.5],
          [-0.5, -0.35],
          [-0.5, 0.3],
          [-0.35, 0.5],
        ],
      },
      down: section("blade", [0, 40, 48], [0.6, 42, 68], [1, 44, 64]),
      seat: section("blade", [0, 32, 40], [0.4, 32, 64], [1, 32, 68]),
    },
    seatJunction: 18,
    stayJunction: 32,
    seatRelief: true,
    post: {
      kind: "dedicated-aero",
      interface: "leader-casp6",
      width: 25,
      depth: 50,
      exposure: 105,
    },
    fork: { ...carbon, rootWidth: 23, rootDepth: 46 },
    rearPlate: "integrated",
  },
  "tsunami-snm100-standard-v1": {
    id: "tsunami-snm100-standard-v1",
    source: "https://tsunamibicycle.com/product/tsunami-snm100-black/",
    description:
      "Standard alloy frame and alloy fork, distinct from Elite. Geometry review still required before publication.",
    tubes: {
      top: section("elliptical", [0, 33, 30], [1, 35, 32]),
      down: section("elliptical", [0, 37, 40], [1, 38, 44]),
      seat: section("circular", [0, 32, 32], [1, 32, 32]),
    },
    seatJunction: 14,
    stayJunction: 20,
    post: { kind: "round", exposure: 110 },
    fork: {
      kind: "alloy-straight",
      rootHalf: 35,
      rootWidth: 18,
      rootDepth: 30,
      tipWidth: 10,
      tipDepth: 16,
    },
    rearPlate: "replaceable",
  },
};
export function frameMorphology(id: unknown): FrameMorphology | undefined {
  return typeof id === "string" && Object.hasOwn(frameMorphologies, id)
    ? frameMorphologies[id as MorphologyId]
    : undefined;
}
export function sectionDimensions(profile: TubeSection, at: number) {
  const b = profile.stations.findIndex((s) => s.at >= at);
  if (b <= 0)
    return profile.stations[b === 0 ? 0 : profile.stations.length - 1];
  const a = profile.stations[b - 1],
    next = profile.stations[b],
    t = (at - a.at) / (next.at - a.at);
  return {
    at,
    width: a.width + (next.width - a.width) * t,
    depth: a.depth + (next.depth - a.depth) * t,
  };
}
export function sectionContour(
  profile: TubeSection,
  angle: number,
): [number, number] {
  if (profile.kind === "custom" && profile.custom?.length) {
    const t = ((((angle / (2 * Math.PI)) % 1) + 1) % 1) * profile.custom.length,
      i = Math.floor(t),
      u = t - i,
      a = profile.custom[i],
      b = profile.custom[(i + 1) % profile.custom.length];
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  }
  return [
    Math.sin(angle) *
      0.5 *
      (profile.kind === "blade"
        ? 0.35 + 0.65 * Math.sqrt((1 + Math.cos(angle)) / 2)
        : 1),
    Math.cos(angle) * 0.5,
  ];
}
export function tubeSection(
  g: BicycleGeometry,
  region: TubeRegion,
): TubeSection {
  return (
    g.morphology?.tubes[region] ||
    section(
      "circular",
      [
        0,
        g.frame.frameWidth + (region === "down" ? 8 : 0),
        g.frame.frameWidth + (region === "down" ? 8 : 0),
      ],
      [
        1,
        g.frame.frameWidth + (region === "down" ? 8 : 0),
        g.frame.frameWidth + (region === "down" ? 8 : 0),
      ],
    )
  );
}
export function tubeEnds(
  g: BicycleGeometry,
  region: TubeRegion,
): [Position, Position] {
  return region === "top"
    ? [g.seatJunction, g.topJunction]
    : region === "down"
      ? [g.bb, g.downJunction]
      : [g.bb, g.seat];
}
export function rawTubeSurfacePoint(
  g: BicycleGeometry,
  region: TubeRegion,
  at: number,
  angle: number,
): Position {
  const [a, b] = tubeEnds(g, region),
    dx = b[0] - a[0],
    dy = b[1] - a[1],
    length = Math.hypot(dx, dy),
    d = sectionDimensions(tubeSection(g, region), at),
    [side, depth] = sectionContour(tubeSection(g, region), angle);
  // An authored junction transition fits the mating seat tube. Mid-tube
  // sections and the published centreline anchors are unchanged.
  const seatWidth =
    sectionDimensions(tubeSection(g, "seat"), 0.96).width * 0.95;
  const width =
    region === "top"
      ? d.width +
        (Math.min(d.width, seatWidth) - d.width) *
          Math.max(0, 1 - (at * length) / 0.03) ** 2
      : d.width;
  const p: Position = [
    a[0] + dx * at + ((dy / length) * depth * d.depth) / 1000,
    a[1] + dy * at - ((dx / length) * depth * d.depth) / 1000,
    (side * width) / 1000,
  ];
  if (region === "seat" && g.morphology?.seatRelief) {
    const radius = g.nominalBsd / 2 + g.nominalClearance + 0.003,
      y = p[1] - g.rear[1];
    if (Math.abs(y) < radius)
      p[0] = Math.max(p[0], g.rear[0] + Math.sqrt(radius * radius - y * y));
  }
  return p;
}
export function headOuterRadius(g: BicycleGeometry, height: number) {
  const length = Math.hypot(g.head[0] - g.lower[0], g.head[1] - g.lower[1]);
  const t = Math.max(0, Math.min(1, (height - 0.003) / (length - 0.007)));
  return g.steering.headLowerRadius * (1 - t) + g.steering.headUpperRadius * t;
}
/** Signed outer-envelope distances used to cope only welded mating surfaces. */
export function jointDistance(
  g: BicycleGeometry,
  receiver: "head" | "seat" | "bb",
  p: Position,
) {
  if (receiver === "bb")
    return Math.max(
      Math.hypot(p[0] - g.bb[0], p[1] - g.bb[1]) - 0.023,
      Math.abs(p[2]) - 0.034,
    );
  const a = receiver === "head" ? g.lower : g.bb,
    axis = receiver === "head" ? g.axis : g.seatAxis;
  const delta = p.map((v, i) => v - a[i]),
    height = delta.reduce((sum, v, i) => sum + v * axis[i], 0);
  const depth = delta[0] * axis[1] - delta[1] * axis[0];
  if (receiver === "head")
    return Math.hypot(depth, p[2]) - headOuterRadius(g, height);
  const size = sectionDimensions(
    tubeSection(g, "seat"),
    Math.max(
      0,
      Math.min(
        1,
        height / Math.hypot(g.seat[0] - g.bb[0], g.seat[1] - g.bb[1]),
      ),
    ),
  );
  // Exact polygonal section contour, including the asymmetric aero section.
  const profile = tubeSection(g, "seat"),
    x = (p[2] * 1000) / size.width,
    y = (depth * 1000) / size.depth;
  let inside = false,
    nearest = Infinity;
  for (let i = 0; i < 48; i++) {
    const a = sectionContour(profile, (i * Math.PI) / 24),
      b = sectionContour(profile, ((i + 1) * Math.PI) / 24);
    if (
      a[1] > y !== b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      t = Math.max(
        0,
        Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)),
      );
    nearest = Math.min(
      nearest,
      (Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy) *
        Math.min(size.width, size.depth)) /
        1000,
    );
  }
  return inside ? -nearest : nearest;
}
const copeCache = new WeakMap<BicycleGeometry, Map<string, [number, number]>>();
export function tubeJointRange(
  g: BicycleGeometry,
  region: TubeRegion,
  angle: number,
): [number, number] {
  let cache = copeCache.get(g);
  if (!cache) {
    cache = new Map();
    copeCache.set(g, cache);
  }
  const key = `${region}/${angle.toFixed(8)}`,
    found = cache.get(key);
  if (found) return found;
  const receiverStart = region === "top" ? "seat" : "bb",
    receiverEnd = region === "seat" ? undefined : "head";
  const boundary = (end: boolean, receiver: "head" | "seat" | "bb") => {
    let inside = end ? 1 : 0,
      outside = 0.5;
    if (
      jointDistance(
        g,
        receiver,
        rawTubeSurfacePoint(g, region, inside, angle),
      ) > 0
    )
      return inside;
    for (let i = 0; i < 28; i++) {
      const t = (inside + outside) / 2;
      if (
        jointDistance(g, receiver, rawTubeSurfacePoint(g, region, t, angle)) <
        -0.00015
      )
        inside = t;
      else outside = t;
    }
    return inside;
  };
  const result: [number, number] = [
    boundary(false, receiverStart),
    receiverEnd ? boundary(true, receiverEnd) : 1,
  ];
  cache.set(key, result);
  return result;
}
export function tubeSurfacePoint(
  g: BicycleGeometry,
  region: TubeRegion,
  at: number,
  angle: number,
): Position {
  const [a, b] = tubeJointRange(g, region, angle);
  return rawTubeSurfacePoint(g, region, a + (b - a) * at, angle);
}
export function tubeSilhouette(
  g: BicycleGeometry,
  region: TubeRegion,
): Position[] {
  const first: Position[] = [],
    second: Position[] = [];
  for (let i = 0; i <= 32; i++) {
    first.push(tubeSurfacePoint(g, region, i / 32, 0));
    second.push(tubeSurfacePoint(g, region, i / 32, Math.PI));
  }
  return [...first, ...second.reverse()];
}
export function postSection(g: BicycleGeometry): TubeSection {
  return g.morphology?.post.kind === "dedicated-aero"
    ? section(
        "blade",
        [0, g.morphology.post.width!, g.morphology.post.depth!],
        [1, g.morphology.post.width!, g.morphology.post.depth!],
      )
    : section(
        "circular",
        [0, g.saddle.postDiameter * 1000, g.saddle.postDiameter * 1000],
        [1, g.saddle.postDiameter * 1000, g.saddle.postDiameter * 1000],
      );
}
export function postSilhouette(g: BicycleGeometry): Position[] {
  const d = sectionDimensions(postSection(g), 1),
    axis = g.seatAxis,
    offset = (center: Position, sign: number): Position => [
      center[0] + ((axis[1] * d.depth) / 2000) * sign,
      center[1] - ((axis[0] * d.depth) / 2000) * sign,
      0,
    ];
  return [
    offset(g.seat, 1),
    offset(g.saddlePost, 1),
    offset(g.saddlePost, -1),
    offset(g.seat, -1),
  ];
}
export function forkSection(g: BicycleGeometry, t: number): [number, number] {
  const f = g.construction.fork;
  const section: [number, number] = [
    (f.rootWidth * (1 - t) + 9 * t) / 2000,
    (f.rootDepth * (1 - t) + 13 * t) / 2000,
  ];
  const blend = Math.max(0, Math.min(1, (t - 0.92) / 0.08)),
    smooth = blend * blend * (3 - 2 * blend);
  return [
    section[0] + (0.0024 - section[0]) * smooth,
    section[1] + (Math.min(section[1], 0.002) - section[1]) * smooth,
  ];
}
export function rearDropoutOutline(
  g: BicycleGeometry,
  insert = false,
): [number, number][] {
  if (g.rearDropoutStyle === "through")
    return dropoutOutline(g.rearDropoutStyle, g.rearDropoutDiameter);
  return trackEndOutline(g.construction.rear, g.rearDropoutDiameter, insert);
}
export function frontDropoutOutline(g: BicycleGeometry) {
  const [, , control, end] = forkBladePoints(g, 1);
  // Follow the actual terminal tangent up to the lug's 12 mm upper tip.
  const lean =
    ((0.012 - (end[1] - g.front[1])) * 1000 * (end[0] - control[0])) /
    (end[1] - control[1]);
  return frontEndOutline(
    g.frontDropoutDiameter,
    g.frontDropoutStyle === "through",
    lean,
  );
}
export function renderMorphologyId(product: Product, variant: Variant) {
  const id = product.visual?.morphologyId;
  return !variant.asset3D || variant.asset3D.morphologyId === id
    ? id
    : undefined;
}
