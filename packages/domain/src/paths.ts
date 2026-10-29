import type { Position, BicycleGeometry } from "./components";
export function chainstayPoints(g: BicycleGeometry, side: number): Position[] {
  return [
    [g.bb[0], g.bb[1], side * 0.024],
    [g.bb[0] - 0.12, g.bb[1] + 0.01, side * 0.026],
    [g.rear[0] + 0.12, g.rear[1] - 0.012, side * g.rearHalf],
    [g.rear[0] + 0.012, g.rear[1] - 0.01, side * g.rearHalf],
  ];
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
