import {
  forkBladePoints,
  type BicycleGeometry,
  type Position,
} from "./components";
export function forkCrownDefinition(g: BicycleGeometry) {
  const left = forkBladePoints(g, -1),
    right = forkBladePoints(g, 1),
    modern = g.morphology?.fork.kind === "carbon-blade",
    a = left[0],
    d = right[0];
  const control = (points: Position[]) => {
    const delta = points[0].map((v, i) => v - points[1][i]),
      length = Math.hypot(...delta);
    return points[0].map((v, i) => v + (delta[i] / length) * 0.045) as Position;
  };
  const b = modern
      ? control(left)
      : ([g.crown[0], g.crown[1] + 0.006, -0.012] as Position),
    c = modern
      ? control(right)
      : ([g.crown[0], g.crown[1] + 0.006, 0.012] as Position);
  const midpoint = a.map(
    (v, i) => (v + d[i]) * 0.125 + (b[i] + c[i]) * 0.375,
  ) as Position;
  const correction = modern
    ? g.crown[0] +
      (g.axis[0] / g.axis[1]) * (midpoint[1] - g.crown[1]) -
      midpoint[0]
    : 0;
  return {
    points: [a, b, c, d] as [Position, Position, Position, Position],
    correction,
    modern,
    rootDepth: (g.morphology?.fork.rootDepth || 22) / 2000,
    rootWidth: (g.morphology?.fork.rootWidth || 16) / 2000,
    neck: g.steering.lowerDiameter / 2 + 0.001,
  };
}
export type ForkCrownDefinition = ReturnType<typeof forkCrownDefinition>;
export function forkCrownSample(def: ForkCrownDefinition, t: number) {
  const [a, b, c, d] = def.points,
    u = 1 - t;
  const point = a.map(
    (v, i) =>
      v * u * u * u +
      3 * b[i] * u * u * t +
      3 * c[i] * u * t * t +
      d[i] * t * t * t,
  ) as Position;
  point[0] += Math.sin(Math.PI * t) ** 2 * def.correction;
  return point;
}
export function forkCrownSection(
  def: ForkCrownDefinition,
  t: number,
): [number, number] {
  if (!def.modern) return [0.011, 0.008 - 0.003 * Math.sin(t * Math.PI)];
  const blend = Math.sin(t * Math.PI) ** 2;
  return [
    def.rootDepth + (def.neck - def.rootDepth) * blend,
    def.rootWidth + (0.005 - def.rootWidth) * blend,
  ];
}
export function forkCrownSilhouette(g: BicycleGeometry): Position[] {
  const def = forkCrownDefinition(g),
    points: Position[] = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32,
      p = forkCrownSample(def, t),
      a = forkCrownSample(def, Math.max(0, t - 0.0001)),
      b = forkCrownSample(def, Math.min(1, t + 0.0001)),
      delta = b.map((v, k) => v - a[k]),
      len = Math.hypot(...delta),
      tangent = delta.map((v) => v / len),
      n = [
        1 - tangent[0] ** 2,
        -tangent[0] * tangent[1],
        -tangent[0] * tangent[2],
      ],
      nl = Math.hypot(...n),
      normal = n.map((v) => v / nl),
      binormal = [
        tangent[1] * normal[2] - tangent[2] * normal[1],
        tangent[2] * normal[0] - tangent[0] * normal[2],
        tangent[0] * normal[1] - tangent[1] * normal[0],
      ],
      r = forkCrownSection(def, t);
    for (let j = 0; j < 24; j++) {
      const angle = (j * Math.PI) / 12;
      points.push(
        p.map(
          (v, k) =>
            v +
            normal[k] * Math.cos(angle) * r[0] +
            binormal[k] * Math.sin(angle) * r[1],
        ) as Position,
      );
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
