import * as THREE from "three";
import {
  assemblyAnchors,
  type BicycleGeometry,
  type Position,
} from "@tracklab/domain";

type Face = {
  points: THREE.Vector3[];
  box: THREE.Box3;
  normal: THREE.Vector3;
  edges: THREE.Vector3[];
};
function faces(mesh: THREE.Mesh): Face[] {
  mesh.updateWorldMatrix(true, false);
  const position = mesh.geometry.getAttribute("position"),
    index = mesh.geometry.index,
    result: Face[] = [];
  for (let i = 0; i < (index?.count || position.count); i += 3) {
    const points = Array.from({ length: 3 }, (_, j) =>
      new THREE.Vector3()
        .fromBufferAttribute(position, index ? index.getX(i + j) : i + j)
        .applyMatrix4(mesh.matrixWorld),
    );
    const edges = points.map((p, j) => points[(j + 1) % 3].clone().sub(p)),
      normal = new THREE.Vector3().crossVectors(edges[0], edges[1]);
    if (normal.lengthSq() > 1e-22)
      result.push({
        points,
        edges,
        normal: normal.normalize(),
        box: new THREE.Box3().setFromPoints(points),
      });
  }
  return result;
}
function overlap(a: Face, b: Face) {
  if (!a.box.intersectsBox(b.box)) return false;
  const axes = [
    a.normal,
    b.normal,
    ...a.edges.flatMap((e) =>
      b.edges.map((f) => new THREE.Vector3().crossVectors(e, f)),
    ),
  ];
  // Coplanar triangles also need axes in their common plane. AABB alone would
  // report separated triangles on that plane as intersections.
  if (Math.abs(a.normal.dot(b.normal)) > 0.999999)
    for (const e of [...a.edges, ...b.edges])
      axes.push(new THREE.Vector3().crossVectors(a.normal, e));
  for (const axis of axes) {
    if (axis.lengthSq() < 1e-20) continue;
    axis.normalize();
    const ap = a.points.map((p) => p.dot(axis)),
      bp = b.points.map((p) => p.dot(axis));
    if (
      Math.max(...ap) < Math.min(...bp) - 1e-8 ||
      Math.max(...bp) < Math.min(...ap) - 1e-8
    )
      return false;
  }
  return true;
}
/** Broad spatial bins followed by triangle/triangle SAT, including coplanar separation. */
export function meshIntersections(
  a: THREE.Mesh,
  b: THREE.Mesh,
  maxSamples = 4,
) {
  const left = faces(a),
    right = faces(b),
    bins = new Map<string, number[]>(),
    cell = 0.025;
  const cells = (box: THREE.Box3) => {
    const keys: string[] = [];
    for (
      let x = Math.floor(box.min.x / cell);
      x <= Math.floor(box.max.x / cell);
      x++
    )
      for (
        let y = Math.floor(box.min.y / cell);
        y <= Math.floor(box.max.y / cell);
        y++
      )
        for (
          let z = Math.floor(box.min.z / cell);
          z <= Math.floor(box.max.z / cell);
          z++
        )
          keys.push(`${x},${y},${z}`);
    return keys;
  };
  right.forEach((face, i) => {
    for (const key of cells(face.box)) {
      const list = bins.get(key) || [];
      list.push(i);
      bins.set(key, list);
    }
  });
  let triangleTests = 0;
  const samples: { point: Position; coplanar: boolean }[] = [];
  outer: for (const face of left) {
    const candidates = new Set(
      cells(face.box).flatMap((key) => bins.get(key) || []),
    );
    for (const i of candidates) {
      const other = right[i];
      if (!face.box.intersectsBox(other.box)) continue;
      triangleTests++;
      if (overlap(face, other)) {
        const box = face.box.clone().intersect(other.box);
        samples.push({
          point: box.getCenter(new THREE.Vector3()).toArray() as Position,
          coplanar: Math.abs(face.normal.dot(other.normal)) > 0.999999,
        });
        if (samples.length >= maxSamples) break outer;
      }
    }
  }
  return { samples, triangleTests };
}
export type AssemblyDiagnostic = {
  id: string;
  classification:
    "alignment" | "clearance" | "penetration" | "z-fighting" | "intentional";
  severity: "pass" | "warning" | "error";
  message: string;
  points?: Position[];
};
export type AssemblyReport = {
  diagnostics: AssemblyDiagnostic[];
  triangleTests: number;
  testedPairs: number;
  anchors: ReturnType<typeof assemblyAnchors>;
  disclaimer: string;
};
export function validateAssembly(
  root: THREE.Object3D,
  g: BicycleGeometry,
): AssemblyReport {
  root.updateWorldMatrix(true, true);
  const diagnostics: AssemblyDiagnostic[] = [],
    find = (name: string) =>
      root.getObjectByName(name) as THREE.Mesh | undefined;
  for (const rear of [false, true]) {
    const label = rear ? "rear" : "front",
      spacing = rear ? g.wheel.rearSpacing : g.wheel.frontSpacing,
      mount = rear ? g.rearInterface : g.frontInterface;
    const difference = Math.abs(spacing - mount.spacing) * 1000;
    diagnostics.push({
      id: `${label}-spacing`,
      classification: "alignment",
      severity: difference < 0.01 ? "pass" : "error",
      message: `${label} hub/dropout contact spacing difference: ${difference.toFixed(3)} mm.`,
    });
    const diameter = rear ? g.wheel.rearAxle : g.wheel.frontAxle,
      bore = rear ? g.rearDropoutDiameter : g.frontDropoutDiameter;
    diagnostics.push({
      id: `${label}-axle`,
      classification: "alignment",
      severity: diameter <= bore + 0.00001 ? "pass" : "error",
      message: `${label} axle ${diameter * 1000} mm / nominal slot ${bore * 1000} mm; slot running allowance 0.6 mm per side.`,
    });
  }
  const tires = root.getObjectsByProperty(
    "name",
    "rubber_section",
  ) as THREE.Mesh[];
  const tire = (rear: boolean) =>
    tires.find(
      (m) =>
        Math.abs(
          new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()).x -
            (rear ? g.rear : g.front)[0],
        ) < 0.01,
    );
  const pairs: [THREE.Mesh | undefined, THREE.Mesh | undefined, string][] = [];
  for (const side of [-1, 1]) {
    pairs.push([
      find(`fork_blade_${side}`),
      tire(false),
      `front-tire/blade-${side}`,
    ]);
    pairs.push([
      find(`paint_seatstay_${side}`),
      tire(true),
      `rear-tire/seatstay-${side}`,
    ]);
    pairs.push([
      find(`paint_chainstay_${side}`),
      tire(true),
      `rear-tire/chainstay-${side}`,
    ]);
    pairs.push([
      find(`paint_chainstay_${side}`),
      find(`crank_arm_${side}`),
      `crank/chainstay-${side}`,
    ]);
  }
  pairs.push(
    [find("fork_crown"), tire(false), "front-tire/crown"],
    [find("paint_seat"), tire(true), "rear-tire/seat-tube"],
    [find("paint_head"), find("fork_steerer"), "head-tube/steerer"],
    [find("stem_extension"), find("continuous_handlebar"), "stem/bar-bore"],
    [
      find("stem_extension"),
      g.steering.quill ? find("paint_head") : find("cockpit_internal_steerer"),
      g.steering.quill ? "stem/head-tube" : "stem/steerer-bore",
    ],
    [
      find("toothed_chainring"),
      find("paint_chainstay_1"),
      "chainring/chainstay",
    ],
  );
  let triangleTests = 0,
    testedPairs = 0;
  for (const [a, b, id] of pairs) {
    if (!a || !b) {
      diagnostics.push({
        id,
        classification: "clearance",
        severity: "warning",
        message: `${id}: mesh unavailable; not tested.`,
      });
      continue;
    }
    const result = meshIntersections(a, b);
    triangleTests += result.triangleTests;
    testedPairs++;
    diagnostics.push({
      id,
      classification: result.samples.some((s) => s.coplanar)
        ? "z-fighting"
        : result.samples.length
          ? "penetration"
          : "clearance",
      severity: result.samples.length ? "error" : "pass",
      message: result.samples.length
        ? `${id}: triangle intersections found.`
        : `${id}: no triangle intersections.`,
      points: result.samples.map((s) => s.point),
    });
  }
  diagnostics.push({
    id: "assembly-joins",
    classification: "intentional",
    severity: "pass",
    message:
      "Excluded mating pairs: coped frame welds (0.15 mm insertion allowance), crown/blade shared seam, steerer bearings/clamps, axle/washer/nut contacts, spokes/flanges and chain/teeth. These designed joins are not free-part clearance tests.",
  });
  return {
    diagnostics,
    triangleTests,
    testedPairs,
    anchors: assemblyAnchors(g),
    disclaimer:
      "Development mesh diagnostics only. Surface intersection checks do not certify internal containment, tolerances, strength or physical compatibility.",
  };
}
