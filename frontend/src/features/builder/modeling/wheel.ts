import * as THREE from "three";
import {
  spokeEndpoints,
  axleInterface,
  type BicycleGeometry,
  type Position,
} from "@tracklab/domain";
import {
  axle,
  cylinder,
  instancedSegments,
  material,
  mesh,
  revolved,
  annulus,
  extrude,
} from "./primitives";

function drilledBridge(g: BicycleGeometry, rear: boolean) {
  const w = g.wheel,
    circumference = Math.PI * 2 * w.rimInner,
    half = w.rimWidth * 0.35;
  const shape = new THREE.Shape();
  shape.moveTo(0, -half);
  shape.lineTo(circumference, -half);
  shape.lineTo(circumference, half);
  shape.lineTo(0, half);
  shape.closePath();
  for (const spoke of spokeEndpoints(w, rear)) {
    const a =
        (Math.atan2(spoke.rim[1], spoke.rim[0]) + Math.PI * 2) % (Math.PI * 2),
      hole = new THREE.Path();
    hole.absarc(a * w.rimInner, spoke.rim[2], 0.0015, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const flat = new THREE.ExtrudeGeometry(shape, {
    depth: 0.0018,
    bevelEnabled: false,
    curveSegments: 8,
  });
  // Subdivide the developed strip before bending it. Long triangles otherwise
  // cross the wheel's center even though every vertex lies on the rim radius.
  const source = flat.getAttribute("position"),
    sourceNormals = flat.getAttribute("normal"),
    vertices: number[] = [],
    normals: number[] = [],
    step = circumference / Math.ceil(circumference / 0.009);
  type Vertex = [number, number, number];
  const clip = (poly: Vertex[], boundary: number, greater: boolean) => {
    const out: Vertex[] = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i],
        b = poly[(i + 1) % poly.length],
        insideA = greater ? a[0] >= boundary : a[0] <= boundary,
        insideB = greater ? b[0] >= boundary : b[0] <= boundary;
      if (insideA) out.push(a);
      if (insideA !== insideB) {
        const t = (boundary - a[0]) / (b[0] - a[0]);
        out.push([
          boundary,
          a[1] + t * (b[1] - a[1]),
          a[2] + t * (b[2] - a[2]),
        ]);
      }
    }
    return out;
  };
  for (let i = 0; i < source.count; i += 3) {
    const triangle: Vertex[] = Array.from({ length: 3 }, (_, j) => [
        source.getX(i + j),
        source.getY(i + j),
        source.getZ(i + j),
      ]),
      xs = triangle.map((p) => p[0]);
    const start = Math.floor(Math.min(...xs) / step),
      end = Math.floor(Math.max(...xs) / step);
    for (let slab = start; slab <= end; slab++) {
      const polygon = clip(
        clip(triangle, slab * step, true),
        (slab + 1) * step,
        false,
      );
      for (let j = 1; j < polygon.length - 1; j++)
        for (const v of [polygon[0], polygon[j], polygon[j + 1]]) {
          vertices.push(...v);
          normals.push(
            sourceNormals.getX(i),
            sourceNormals.getY(i),
            sourceNormals.getZ(i),
          );
        }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  flat.dispose();
  const p = geometry.getAttribute("position"),
    n = geometry.getAttribute("normal"),
    normal = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    const a = p.getX(i) / w.rimInner,
      z = p.getY(i),
      r = w.rimInner + p.getZ(i);
    p.setXYZ(i, Math.cos(a) * r, Math.sin(a) * r, z);
    // Transform the extrusion normal through the bend's inverse transpose.
    // Radial caps stay smooth across angular bands; hole/side edges stay crisp.
    const tangent = (n.getX(i) * w.rimInner) / r,
      radial = n.getZ(i);
    normal
      .set(
        Math.cos(a) * radial - Math.sin(a) * tangent,
        Math.sin(a) * radial + Math.cos(a) * tangent,
        n.getY(i),
      )
      .normalize();
    n.setXYZ(i, normal.x, normal.y, normal.z);
  }
  return geometry;
}

export function createWheel(g: BicycleGeometry, rear: boolean) {
  const group = new THREE.Group();
  group.name = rear ? "rear_wheel" : "front_wheel";
  const w = g.wheel,
    alloy = material("#737d89", 0.75, 0.29),
    spokeMetal = material("#858f9e", 0.82, 0.27),
    rim = material(w.rimDepth > 0.04 ? "#343c47" : "#697482", 0.65, 0.32);
  alloy.name = rim.name = spokeMetal.name = "finish_wheelset";
  alloy.userData.finishRegion = "hub";
  rim.userData.finishRegion = "rim";
  spokeMetal.userData.finishRegion = "spokes";
  const profile: [number, number][] = [
    [w.rimInner, -w.rimWidth * 0.35],
    [w.rimOuter - 0.008, -w.rimWidth * 0.5],
    [w.rimOuter - 0.001, -w.rimWidth * 0.51],
    [w.rimOuter, w.rimWidth * 0.51],
    [w.rimOuter - 0.008, w.rimWidth * 0.5],
    [w.rimInner, w.rimWidth * 0.35],
  ];
  mesh(group, "rim_profile", revolved(profile), rim);
  mesh(group, "rim_drilled_bridge", drilledBridge(g, rear), rim);
  for (const side of [-1, 1])
    mesh(
      group,
      `rim_bead_edge_${side}`,
      revolved([
        [w.rimOuter - 0.002, side * w.rimWidth * 0.505],
        [w.rimOuter, side * w.rimWidth * 0.515],
        [w.rimOuter + 0.0005, side * w.rimWidth * 0.46],
      ]),
      rim,
    );
  const hubRadius = rear ? 0.028 : 0.022,
    flange = rear ? 0.032 : 0.028,
    spacing = rear ? w.rearSpacing : w.frontSpacing,
    axleRadius = (rear ? w.rearAxle : w.frontAxle) / 2,
    retention = rear ? g.rearRetention : g.frontRetention,
    frameInterface = rear ? g.rearInterface : g.frontInterface,
    mount = axleInterface(spacing, frameInterface.outerFace-frameInterface.bodyInner>.0051 ? (frameInterface.bodyInner-frameInterface.innerFace>.001 ? 'both' : 'outer') : 'none'),
    hardware = material('#a1aab5',.82,.28);
  hardware.name = 'axle_hardware';
  mesh(
    group,
    "hub_shell",
    revolved([
      [0.01, -flange],
      [0.015, -flange + 0.007],
      [0.012, 0],
      [0.015, flange - 0.007],
      [0.01, flange],
    ]),
    alloy,
  );
  if (rear)
    mesh(
      group,
      "fixed_hub_cog_seat",
      revolved([
        [axleRadius + 0.0015, flange - 0.005],
        [0.0173, flange - 0.005],
        [0.0173, w.chainline + 0.002],
        [axleRadius + 0.0015, w.chainline + 0.002],
        [axleRadius + 0.0015, flange - 0.005],
      ]),
      alloy,
    );
  for (const side of [-1, 1]) {
    const flangeShape = annulus(hubRadius + 0.004, 0.009);
    for (const spoke of spokeEndpoints(w, rear).filter(
      (s) => s.side === side,
    )) {
      const hole = new THREE.Path();
      hole.absarc(spoke.hub[0], spoke.hub[1], 0.0014, 0, Math.PI * 2, true);
      flangeShape.holes.push(hole);
    }
    mesh(
      group,
      `hub_flange_${side}`,
      extrude(flangeShape, 0.003, 0.0002),
      alloy,
      [0, 0, side * flange],
    );
    cylinder(
      group,
      `hub_shoulder_${side}`,
      [0, 0, side * flange],
      [0, 0, side * (spacing / 2 - 0.006)],
      0.01,
      alloy,
      0.009,
    );
    axle(
      group,
      `hub_endcap_${side}`,
      [0, 0, side * (spacing / 2 - 0.003)],
      0.009,
      0.006,
      alloy,
    );
    axle(
      group,
      `hub_bearing_seat_${side}`,
      [0, 0, side * (flange - 0.004)],
      0.017,
      0.006,
      alloy,
      28,
    );
    if(retention === 'nutted') {
      mesh(group,`axle_washer_${side}`,extrude(annulus(.009,axleRadius+.00025),mount.washerThickness,0),hardware,[0,0,side*mount.washerCenter]);
      const nut = new THREE.Shape(Array.from({length:6},(_,i)=>new THREE.Vector2(Math.cos(i*Math.PI/3)*.0085,Math.sin(i*Math.PI/3)*.0085)));
      const hole = new THREE.Path();hole.absarc(0,0,axleRadius+.00015,0,Math.PI*2,true);nut.holes.push(hole);
      mesh(group,`axle_nut_${side}`,extrude(nut,mount.nutThickness,0),hardware,[0,0,side*mount.nutCenter]);
    } else {
      mesh(group,`${retention}_head_${side}`,extrude(annulus(.008,retention==='through' ? .0025 : .002),.003,0),hardware,[0,0,side*(mount.outerFace+.0015)]);
      if(side===1) cylinder(group,`${retention}_lever`,[0,0,mount.outerFace+.004],[.024,.012,mount.outerFace+.004],.0025,hardware);
    }
  }
  axle(group, "axle", [0, 0, 0], retention==='quick-release' ? .0025 : axleRadius, retention==='nutted' ? mount.axleEnd*2 : (mount.outerFace+.003)*2, hardware);
  const spokes = spokeEndpoints(w, rear);
  instancedSegments(
    group,
    "laced_spokes",
    spokes.map((s) => ({ a: s.hub, b: s.rim })),
    0.00085,
    spokeMetal,
  );
  instancedSegments(
    group,
    "spoke_nipples",
    spokes.map((s) => ({
      a: [s.rim[0] * 0.98, s.rim[1] * 0.98, s.rim[2]] as Position,
      b: s.rim,
    })),
    0.0015,
    spokeMetal,
  );
  cylinder(
    group,
    "valve",
    [0, w.rimInner - 0.016, 0],
    [0, w.rimInner + 0.003, 0],
    0.0024,
    alloy,
  );
  group.position.set(...(rear ? g.rear : g.front));
  group.userData = {
    fidelity: "illustrative",
    bsd: w.bsd,
    width: w.width,
    outerRadius: w.radius,
    rimDepth: w.rimDepth,
    spokes: rear ? w.rearBuild.count : w.frontBuild.count,
    lacing: rear ? w.rearBuild.lacing : w.frontBuild.lacing,
    hubDrilling: rear ? w.rearBuild.count : w.frontBuild.count,
    rimDrilling: rear ? w.rearBuild.count : w.frontBuild.count,
    axleSpacing: spacing,
    retention,
    hardwareFidelity: 'Illustrative retention geometry; unspecified dimensions are not manufacturer verified.',
  };
  return group;
}

export function createTire(g: BicycleGeometry) {
  const tires = new THREE.Group();
  tires.name = "tire";
  const w = g.wheel,
    b = w.bsd / 2,
    h = w.tireHeight,
    half = w.width / 2,
    rubber = material("#171c23", 0, 0.88);
  const tireProfile: [number, number][] = [
    [b - 0.002, -w.rimWidth * 0.4],
    [b + h * 0.18, -half * 0.88],
    [b + h * 0.48, -half],
    [b + h * 0.8, -half * 0.78],
    [b + h * 0.96, -half * 0.4],
    [b + h, 0],
    [b + h * 0.96, half * 0.4],
    [b + h * 0.8, half * 0.78],
    [b + h * 0.48, half],
    [b + h * 0.18, half * 0.88],
    [b - 0.002, w.rimWidth * 0.4],
    [b - 0.002, -w.rimWidth * 0.4],
  ];
  mesh(tires, "rubber_section", revolved(tireProfile), rubber);
  if (w.sidewall === "tan") {
    const tan = material("#9c805a", 0, 0.86);
    for (const side of [-1, 1]) {
      const band: [number, number][] = [
        [b + h * 0.17, side * (half * 0.89 + 0.00015)],
        [b + h * 0.48, side * (half + 0.00015)],
        [b + h * 0.77, side * (half * 0.8 + 0.00015)],
      ];
      mesh(
        tires,
        `sidewall_${side}`,
        revolved(side === 1 ? band.reverse() : band),
        tan,
      );
    }
  }

  return tires;
}
