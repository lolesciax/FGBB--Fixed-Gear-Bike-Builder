import * as THREE from "three";
import {
  tubeSurfacePoint,
  postSection,
  sectionContour,
  sectionDimensions,
  tubeSection,
  staySurfacePoint,type StayRegion,
  type BicycleGeometry,
  type TubeRegion,
  type Position,
  type TubeSection,
} from "@tracklab/domain";
import { extrude, vector } from "./primitives";
function skin(
  point: (at: number, angle: number) => Position,
  segments = 12,
  radial = 24,
  closeEnd: boolean | 'none' = true,
) {
  const positions: number[] = [],
    indices: number[] = [];
  for (let i = 0; i <= segments; i++)
    for (let j = 0; j < radial; j++)
      positions.push(...point(i / segments, (j * Math.PI * 2) / radial));
  for (let i = 0; i < segments; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j,
        b = i * radial + ((j + 1) % radial),
        c = a + radial,
        d = b + radial;
      indices.push(a, c, b, b, c, d);
    }
  for (const end of closeEnd==='none' ? [] : closeEnd ? [0, segments] : [0]) {
    const base = positions.length / 3,
      ring = Array.from({ length: radial }, (_, j) =>
        point(end / segments, (j * Math.PI * 2) / radial),
      );
    const center = ring.reduce(
      (a, p) => a.map((v, k) => v + p[k] / radial) as Position,
      [0, 0, 0] as Position,
    );
    positions.push(...center);
    for (const p of ring) positions.push(...p);
    for (let j = 0; j < radial; j++) {
      const a = base + 1 + j,
        b = base + 1 + ((j + 1) % radial);
      indices.push(...(end === 0 ? [base, a, b] : [base, b, a]));
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
export const frameTubeGeometry = (g: BicycleGeometry, region: TubeRegion) =>
  skin((t, a) => tubeSurfacePoint(g, region, t, a), 16, 24, 'none');
export const stayGeometry=(g:BicycleGeometry,region:StayRegion,side:number)=>skin((t,a)=>staySurfacePoint(g,region,side,t,a),region==='seatstay'?16:24,region==='seatstay'?8:10,'none');
export function seatpostGeometry(g: BicycleGeometry) {
  const profile = postSection(g),
    a = g.seat.map((v, i) => v - g.seatAxis[i] * 0.025) as Position,
    b = g.saddlePost;
  return skin((t, angle) => {
    const size = sectionDimensions(profile, t),
      [side, depth] = sectionContour(profile, angle);
    return [
      a[0] + (b[0] - a[0]) * t + (g.seatAxis[1] * depth * size.depth) / 1000,
      a[1] + (b[1] - a[1]) * t - (g.seatAxis[0] * depth * size.depth) / 1000,
      (side * size.width) / 1000,
    ];
  }, 2);
}
export function seatCollarGeometry(g: BicycleGeometry) {
  const shape = new THREE.Shape(),
    outer = tubeSection(g, "seat"),
    size = sectionDimensions(outer, 1),
    inner = postSection(g),
    post = sectionDimensions(inner, 1);
  const path = (
    target: THREE.Path,
    profile: TubeSection,
    width: number,
    depth: number,
    reverse = false,
  ) => {
    for (let i = 0; i <= 48; i++) {
      const [x, y] = sectionContour(
        profile,
        ((reverse ? 48 - i : i) * Math.PI) / 24,
      );
      if (i === 0) target.moveTo((x * width) / 1000, (y * depth) / 1000);
      else target.lineTo((x * width) / 1000, (y * depth) / 1000);
    }
    target.closePath();
  };
  path(shape, outer, size.width + 4, size.depth + 4);
  const hole = new THREE.Path();
  path(hole, inner, post.width + 0.6, post.depth + 0.6, true);
  shape.holes.push(hole);
  const geometry = extrude(shape, 0.012, 0.0005),
    axis = vector(g.seatAxis),
    depth = new THREE.Vector3(axis.y, -axis.x, 0);
  geometry.applyMatrix4(
    new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), depth, axis),
  );
  return geometry;
}
