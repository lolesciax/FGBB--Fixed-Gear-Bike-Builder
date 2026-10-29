import * as THREE from "three";
import type { Position } from "@tracklab/domain";

export const vector = (p: Position) => new THREE.Vector3(...p);
export function material(color: string, metalness = 0.65, roughness = 0.38) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}
export function mesh(
  group: THREE.Group,
  name: string,
  geometry: THREE.BufferGeometry,
  mat: THREE.Material,
  position: Position = [0, 0, 0],
) {
  const item = new THREE.Mesh(geometry, mat);
  item.name = name;
  item.position.set(...position);
  group.add(item);
  return item;
}
export function cylinder(
  group: THREE.Group,
  name: string,
  a: Position,
  b: Position,
  radius: number,
  mat: THREE.Material,
  endRadius = radius,
  segments = 16,
) {
  const delta = vector(b).sub(vector(a)),
    item = mesh(
      group,
      name,
      new THREE.CylinderGeometry(endRadius, radius, delta.length(), segments),
      mat,
    );
  item.position.copy(vector(a).add(vector(b)).multiplyScalar(0.5));
  item.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    delta.normalize(),
  );
  return item;
}
export function axle(
  group: THREE.Group,
  name: string,
  center: Position,
  radius: number,
  length: number,
  mat: THREE.Material,
  segments = 20,
) {
  return cylinder(
    group,
    name,
    [center[0], center[1], center[2] - length / 2],
    [center[0], center[1], center[2] + length / 2],
    radius,
    mat,
    radius,
    segments,
  );
}
export function curve(points: Position[], closed = false) {
  return new THREE.CatmullRomCurve3(points.map(vector), closed, "centripetal");
}
export function tube(
  group: THREE.Group,
  name: string,
  points: Position[],
  radius: number,
  mat: THREE.Material,
  segments = 40,
  radial = 10,
) {
  return mesh(
    group,
    name,
    new THREE.TubeGeometry(curve(points), segments, radius, radial, false),
    mat,
  );
}
export function sweptSection(
  path: THREE.Curve<THREE.Vector3>,
  segments: number,
  radial: number,
  radius: (t: number) => [number, number],
  lateral = false,
  options: {
    caps?: boolean | "start" | "end";
    normal?: THREE.Vector3;
    exponent?: number;
  } = {},
) {
  const frames = path.computeFrenetFrames(segments, false),
    positions: number[] = [],
    indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments,
      p = path.getPointAt(t),
      [ra, rb] = radius(t),
      tangent = path.getTangentAt(t),
      normal = options.normal
        ? options.normal
            .clone()
            .addScaledVector(tangent, -options.normal.dot(tangent))
            .normalize()
        : lateral
          ? new THREE.Vector3(0, 0, 1)
          : frames.normals[i],
      binormal =
        lateral || options.normal
          ? new THREE.Vector3().crossVectors(tangent, normal).normalize()
          : frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const angle = (j / radial) * Math.PI * 2,
        cosine = Math.cos(angle),
        sine = Math.sin(angle),
        v = p
          .clone()
          .addScaledVector(
            normal,
            Math.sign(cosine) *
              Math.pow(Math.abs(cosine), 2 / (options.exponent || 2)) *
              ra,
          )
          .addScaledVector(
            binormal,
            Math.sign(sine) *
              Math.pow(Math.abs(sine), 2 / (options.exponent || 2)) *
              rb,
          );
      positions.push(v.x, v.y, v.z);
      if (i < segments && j < radial) {
        const a = i * (radial + 1) + j,
          b = a + radial + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  }
  if (options.caps)
    for (const end of options.caps === "end"
      ? [segments]
      : options.caps === "start"
        ? [0]
        : [0, segments]) {
      const base = positions.length / 3,
        p = path.getPointAt(end / segments);
      positions.push(p.x, p.y, p.z);
      for (let j = 0; j < radial; j++) {
        const i = (end * (radial + 1) + j) * 3;
        positions.push(positions[i], positions[i + 1], positions[i + 2]);
      }
      for (let j = 0; j < radial; j++) {
        const a = base + 1 + j,
          b = base + 1 + ((j + 1) % radial);
        indices.push(...(end === 0 ? [base, b, a] : [base, a, b]));
      }
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
}
export function revolved(profile: [number, number][], segments = 64) {
  const geometry = new THREE.LatheGeometry(
    profile.map((p) => new THREE.Vector2(...p)),
    segments,
  );
  geometry.rotateX(Math.PI / 2);
  return geometry;
}
export function axialProfile(
  group: THREE.Group,
  name: string,
  origin: Position,
  axis: Position,
  profile: [number, number][],
  mat: THREE.Material,
  segments = 40,
) {
  const item = mesh(group, name, revolved(profile, segments), mat, origin);
  item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), vector(axis));
  return item;
}
export function instancedSegments(
  group: THREE.Group,
  name: string,
  segments: { a: Position; b: Position }[],
  radius: number,
  mat: THREE.Material,
) {
  const item = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(radius, radius, 1, 6),
      mat,
      segments.length,
    ),
    dummy = new THREE.Object3D(),
    up = new THREE.Vector3(0, 1, 0);
  segments.forEach(({ a, b }, i) => {
    const delta = vector(b).sub(vector(a));
    dummy.position.copy(vector(a).add(vector(b)).multiplyScalar(0.5));
    dummy.quaternion.setFromUnitVectors(up, delta.clone().normalize());
    dummy.scale.set(1, delta.length(), 1);
    dummy.updateMatrix();
    item.setMatrixAt(i, dummy.matrix);
  });
  item.name = name;
  item.instanceMatrix.needsUpdate = true;
  item.computeBoundingBox();
  item.computeBoundingSphere();
  group.add(item);
  return item;
}
export function extrude(shape: THREE.Shape, depth: number, bevel = 0.001) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 1,
    curveSegments: 10,
    steps: 1,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}
export function annulus(outer: number, inner: number) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}
export function disposeModel(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>();
  root.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      if (node instanceof THREE.InstancedMesh) node.dispose();
      geometries.add(node.geometry);
      for (const mat of Array.isArray(node.material)
        ? node.material
        : [node.material])
        materials.add(mat);
    }
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
}
