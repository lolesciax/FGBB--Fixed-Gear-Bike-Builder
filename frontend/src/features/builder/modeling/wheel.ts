import * as THREE from "three";
import {
  spokeEndpoints,
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
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.0018,
    bevelEnabled: false,
    curveSegments: 8,
  });
  const p = geometry.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    const a = p.getX(i) / w.rimInner,
      z = p.getY(i),
      r = w.rimInner + p.getZ(i);
    p.setXYZ(i, Math.cos(a) * r, Math.sin(a) * r, z);
  }
  geometry.computeVertexNormals();
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
    axleRadius = (rear ? w.rearAxle : w.frontAxle) / 2;
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
      [0, 0, side * (spacing / 2 - 0.005)],
      0.009,
      0.012,
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
    axle(
      group,
      `axle_nut_${side}`,
      [0, 0, side * (spacing / 2 + 0.006)],
      0.008,
      0.007,
      alloy,
      6,
    );
  }
  axle(group, "axle", [0, 0, 0], axleRadius, spacing + 0.025, alloy);
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
