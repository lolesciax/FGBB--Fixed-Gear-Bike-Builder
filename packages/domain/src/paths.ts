import type { Position, BicycleGeometry } from "./components";
import { jointDistance } from "./morphology";
import {rearJunction} from './construction';
export function chainstayPoints(g: BicycleGeometry, side: number): Position[] {
  return [
    [g.bb[0], g.bb[1], side * 0.024],
    [
      g.bb[0] - 0.12,
      g.bb[1] + 0.01,
      side * Math.max(0.031, g.nominalClearance / 2 + 0.012),
    ],
    [g.rear[0] + 0.12, g.rear[1] - 0.012, side * g.rearInterface.bodyCenter],
    rearJunction(g.rear,g.construction.rear,'chainstay',side*g.rearInterface.bodyCenter),
  ];
}
export function seatstayPoints(g: BicycleGeometry, side: number): Position[] {
  const a: Position = [g.stayJunction[0], g.stayJunction[1], 0];
  const b=rearJunction(g.rear,g.construction.rear,'seatstay',side*g.rearInterface.bodyCenter);
  return [
    a,
    ...[0.3, 0.65].map(
      (t) =>
        [
          a[0] + (b[0] - a[0]) * t,
          a[1] + (b[1] - a[1]) * t,
          side *
            Math.max(
              0.012 + (g.rearInterface.bodyCenter - 0.012) * t,
              g.nominalClearance / 2 + 0.011,
            ),
        ] as Position,
    ),
    b,
  ];
}
export type StayRegion = "seatstay" | "chainstay";
const stayCache = new WeakMap<
  BicycleGeometry,
  Map<
    string,
    {
      segments: ReturnType<typeof catmullRomSegments>;
      starts: Map<number, number>;
    }
  >
>();
export function staySurfacePoint(
  g: BicycleGeometry,
  region: StayRegion,
  side: number,
  at: number,
  angle: number,
): Position {
  let cache = stayCache.get(g);
  if (!cache) {
    cache = new Map();
    stayCache.set(g, cache);
  }
  const key = `${region}/${side}`;
  let entry = cache.get(key);
  if (!entry) {
    entry = {
      segments: catmullRomSegments(
        region === "seatstay"
          ? seatstayPoints(g, side)
          : chainstayPoints(g, side),
      ),
      starts: new Map(),
    };
    cache.set(key, entry);
  }
  const raw = (t: number): Position => {
    const index = Math.min(
        entry.segments.length - 1,
        Math.floor(t * entry.segments.length),
      ),
      u = t * entry.segments.length - index,
      v = 1 - u,
      [a, b, c, d] = entry.segments[index];
    const p = a.map(
        (n, i) =>
          v * v * v * n +
          3 * v * v * u * b[i] +
          3 * v * u * u * c[i] +
          u * u * u * d[i],
      ) as Position,
      delta = a.map(
        (_, i) =>
          3 * v * v * (b[i] - a[i]) +
          6 * v * u * (c[i] - b[i]) +
          3 * u * u * (d[i] - c[i]),
      ),
      length = Math.hypot(...delta),
      tangent = delta.map((n) => n / length),
      normal = [
        -tangent[0] * tangent[2],
        -tangent[1] * tangent[2],
        1 - tangent[2] ** 2,
      ],
      nl = Math.hypot(...normal),
      n = normal.map((v) => v / nl),
      binormal = [
        tangent[1] * n[2] - tangent[2] * n[1],
        tangent[2] * n[0] - tangent[0] * n[2],
        tangent[0] * n[1] - tangent[1] * n[0],
      ],
      radius = region === "seatstay" ? 0.007 : 0.008,
      blend = Math.max(0, Math.min(1, (t - 0.9) / 0.1)),
      smooth = blend * blend * (3 - 2 * blend),
      lateral = radius + (0.0024 - radius) * smooth,
      depth = radius + (0.0055 - radius) * smooth;
    return p.map(
      (v, i) =>
        v +
        n[i] * Math.cos(angle) * lateral -
        binormal[i] * Math.sin(angle) * depth,
    ) as Position;
  };
  let start = entry.starts.get(angle);
  if (start === undefined) {
    let a = 0,
      b = 0.5;
    const receiver = region === "seatstay" ? "seat" : "bb";
    for (let i = 0; i < 28; i++) {
      const t = (a + b) / 2;
      if (jointDistance(g, receiver, raw(t)) < -0.00015) a = t;
      else b = t;
    }
    start = a;
    entry.starts.set(angle, start);
  }
  return raw(start + (1 - start) * at);
}
export function staySilhouette(
  g: BicycleGeometry,
  region: StayRegion,
): Position[] {
  return [1, -1].flatMap((side) =>
    Array.from({ length: 33 }, (_, i) =>
      staySurfacePoint(
        g,
        region,
        1,
        side === 1 ? i / 32 : 1 - i / 32,
        (side * Math.PI) / 2,
      ),
    ),
  );
}
/** Cubic controls for the same open centripetal Catmull–Rom curve used by the mesh. */
export function catmullRomSegments(
  points: Position[],
): [Position, Position, Position, Position][] {
  const result: [Position, Position, Position, Position][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i],
      p2 = points[i + 1],
      p0 = points[i - 1] || (p1.map((v, k) => 2 * v - p2[k]) as Position),
      p3 = points[i + 2] || (p2.map((v, k) => 2 * v - p1[k]) as Position);
    const interval = (a: Position, b: Position) =>
      Math.pow(
        a.reduce((n, v, k) => n + (v - b[k]) ** 2, 0),
        0.25,
      );
    let d0 = interval(p0, p1),
      d1 = interval(p1, p2),
      d2 = interval(p2, p3);
    if (d1 < 0.0001) d1 = 1;
    if (d0 < 0.0001) d0 = d1;
    if (d2 < 0.0001) d2 = d1;
    const t1 = p1.map(
        (v, k) =>
          ((v - p0[k]) / d0 - (p2[k] - p0[k]) / (d0 + d1) + (p2[k] - v) / d1) *
          d1,
      ),
      t2 = p2.map(
        (v, k) =>
          ((v - p1[k]) / d1 - (p3[k] - p1[k]) / (d1 + d2) + (p3[k] - v) / d2) *
          d1,
      );
    result.push([
      p1,
      p1.map((v, k) => v + t1[k] / 3) as Position,
      p2.map((v, k) => v - t2[k] / 3) as Position,
      p2,
    ]);
  }
  return result;
}
