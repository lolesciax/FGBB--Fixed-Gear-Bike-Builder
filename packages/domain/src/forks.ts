import type { BicycleGeometry, Position } from "./components";
export function forkCrownDefinition(g: BicycleGeometry) {
  const neck = g.steering.lowerDiameter / 2 + 0.001;
  return {
    modern: g.construction.fork.kind === "carbon",
    axis: g.axis,
    rootDepth: g.construction.fork.rootDepth / 2000,
    rootWidth: g.construction.fork.rootWidth / 2000,
    halfHeight: g.construction.fork.crownHalfHeight / 1000,
    rootDrop: g.construction.fork.rootDrop / 1000,
    rootHalf: g.construction.fork.rootHalf / 1000,
    origin: g.crown,
    neck,
    deckDepth: Math.max(neck, g.steering.headLowerRadius - 0.001),
  };
}
export type ForkCrownDefinition = ReturnType<typeof forkCrownDefinition>;
export function forkCrownSample(def: ForkCrownDefinition, t: number) {
  const z = (2 * t - 1) * def.rootHalf,
    u = crownShoulder(def, z);
  // Elliptical shoulders have the same vertical root tangent as the blades.
  // Their true normal prevents the folded inner arch caused by a rotating
  // cross-section unrelated to the centre curve's derivative.
  const h =
    -def.halfHeight -
    (def.rootDrop - def.halfHeight) * (1 - Math.sqrt(Math.max(0, 1 - u * u)));
  return [def.origin[0] + def.axis[0] * h, def.origin[1] + def.axis[1] * h, z];
}
function crownShoulder(def: ForkCrownDefinition, z: number) {
  const u = Math.max(
    0,
    Math.min(1, (Math.abs(z) - def.neck) / (def.rootHalf - def.neck)),
  );
  return u;
}
export function forkCrownSection(
  def: ForkCrownDefinition,
  t: number,
): [number, number] {
  const u = crownShoulder(def, (2 * t - 1) * def.rootHalf),
    blend = u * u * (3 - 2 * u);
  return [
    def.deckDepth + (def.rootDepth - def.deckDepth) * blend,
    def.halfHeight + (def.rootWidth - def.halfHeight) * blend,
  ];
}
export function forkCrownNormal(def: ForkCrownDefinition, t: number): Position {
  void t;
  return [def.axis[1], -def.axis[0], 0];
}
function roundedSection(a: number, b: number, angle: number): [number, number] {
  const r = Math.min(0.0015, a * 0.25, b * 0.25),
    c = Math.cos(angle),
    s = Math.sin(angle),
    u = Math.atan2(Math.abs(s), Math.abs(c)) / (Math.PI / 2);
  // Explicit face/corner samples keep the complete flat bearing deck. Uniform
  // polar rays skipped its corners and left a sloping gap under the headset.
  let x: number, y: number;
  if (u <= 0.25) {
    x = a;
    y = ((b - r) * u) / 0.25;
  } else if (u >= 0.75) {
    x = ((a - r) * (1 - u)) / 0.25;
    y = b;
  } else {
    const theta = (((u - 0.25) / 0.5) * Math.PI) / 2;
    x = a - r + r * Math.cos(theta);
    y = b - r + r * Math.sin(theta);
  }
  return [Math.sign(c) * x, Math.sign(s) * y];
}
export function forkCrownSurfacePoint(
  def: ForkCrownDefinition,
  t: number,
  angle: number,
): Position {
  const p = forkCrownSample(def, t),
    [a, b] = forkCrownSection(def, t),
    u = crownShoulder(def, p[2]),
    w = u * u * (3 - 2 * u),
    dz = (def.rootHalf - def.neck) * Math.sqrt(Math.max(0, 1 - u * u)),
    dh = (def.rootDrop - def.halfHeight) * u,
    length = Math.hypot(dz, dh),
    B = [
      (def.axis[0] * dz) / length,
      (def.axis[1] * dz) / length,
      ((t < 0.5 ? -1 : 1) * dh) / length,
    ],
    N = forkCrownNormal(def, t),
    rounded = roundedSection(a, b, angle),
    x = rounded[0] * (1 - w) + Math.cos(angle) * a * w,
    y = rounded[1] * (1 - w) + Math.sin(angle) * b * w;
  return p.map((v, i) => v + N[i] * x + B[i] * y) as Position;
}
export function forkCrownSilhouette(g: BicycleGeometry): Position[] {
  const def = forkCrownDefinition(g),
    points: Position[] = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    for (let j = 0; j < 24; j++) {
      const angle = (j * Math.PI) / 12;
      points.push(forkCrownSurfacePoint(def, t, angle));
    }
  }
  // Side elevation of the complete crown: its two shoulders overlap in projection.
  const sorted = points.sort((a, b) => a[0] - b[0] || a[1] - b[1]),
    cross = (a: Position, b: Position, c: Position) =>
      (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const half = (rows: Position[]) => {
    const result: Position[] = [];
    for (const p of rows) {
      while (result.length > 1 && cross(result.at(-2)!, result.at(-1)!, p) <= 0)
        result.pop();
      result.push(p);
    }
    return result;
  };
  const lower = half(sorted),
    upper = half([...sorted].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
