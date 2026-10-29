import * as THREE from "three";
import {
  forkBladePoints,
  type BicycleGeometry,
  type Position,
} from "@tracklab/domain";
import {
  axle,
  cylinder,
  extrude,
  annulus,
  material,
  mesh,
  sweptSection,
  tube,
  vector,
} from "./primitives";

export function createFork(g: BicycleGeometry) {
  const group = new THREE.Group();
  group.name = "fork_assembly";
  const metal = material("#444d59", 0.65, 0.35),
    surface = new THREE.MeshPhysicalMaterial({color:"#303945",metalness:.3,roughness:.38});
  cylinder(group, "fork_steerer", g.crown, g.steererTop, 0.0143, metal);
  for (const [name, p] of [
    ["lower", g.lower],
    ["upper", g.head],
  ] as const) {
    const a = p.map((v, i) => v - g.axis[i] * 0.003) as Position,
      b = p.map((v, i) => v + g.axis[i] * 0.003) as Position;
    cylinder(group, `fork_headset_${name}`, a, b, 0.023, metal);
  }
  // A physical transverse crown bridges both blades to the steering axis.
  axle(group, "fork_crown", g.crown, 0.015, 0.078, surface.clone());
  const dropoutGeometry = extrude(
    annulus(0.012, g.frontDropoutDiameter / 2 + 0.0007),
    0.005,
    0.0006,
  );
  for (const side of [-1, 1]) {
    const [start, control1, control2, end] = forkBladePoints(g, side).map(
      vector,
    );
    const path = new THREE.CubicBezierCurve3(start, control1, control2, end);
    mesh(
      group,
      `fork_blade_${side}`,
      sweptSection(
        path,
        28,
        12,
        (t) => [0.009 * (1 - t) + 0.0045 * t, 0.016 * (1 - t) + 0.007 * t],
        true,
      ),
      surface,
    );
    mesh(group, `fork_dropout_${side}`, dropoutGeometry, metal, [
      g.front[0],
      g.front[1],
      side * g.forkHalf,
    ]);
  }
  group.userData = {
    fidelity: "illustrative",
    axis: g.axis,
    crown: g.crown,
    axle: g.front,
    publishedForkLength: g.forkLength,
    renderedForkLength: g.renderedForkLength,
    assumptions: g.assumptions,
  };
  return group;
}
export function createFrame(g: BicycleGeometry, color: string) {
  const group = new THREE.Group();
  group.name = "frame_and_fork";
  const paint = new THREE.MeshPhysicalMaterial({color,metalness:.35,roughness:.34}),
    metal = material("#6c7583", 0.7, 0.33),
    radius = g.frame.frameWidth / 2000;
  for (const [name, a, b, r] of [
    ["top", g.seat, g.head, radius],
    ["down", g.bb, g.lower, radius + 0.004],
    ["seat", g.bb, g.seat, radius],
    ["head", g.head, g.lower, radius + 0.004],
  ] as const)
    cylinder(group, `paint_${name}`, a, b, r, paint.clone());
  for (const side of [-1, 1]) {
    const rear: Position = [g.rear[0], g.rear[1], side * g.rearHalf],
      seat: Position = [g.seat[0], g.seat[1], side * 0.012];
    cylinder(group, `paint_seatstay_${side}`, seat, rear, 0.007, paint.clone());
    tube(
      group,
      `paint_chainstay_${side}`,
      [
        [g.bb[0], g.bb[1], side * 0.024],
        [g.bb[0] - 0.12, g.bb[1] + 0.01, side * 0.026],
        [g.rear[0] + 0.12, g.rear[1] - 0.012, side * g.rearHalf],
        rear,
      ],
      0.008,
      paint.clone(),
      24,
      10,
    );
    mesh(
      group,
      `rear_dropout_${side}`,
      extrude(
        annulus(0.012, g.rearDropoutDiameter / 2 + 0.0007),
        0.005,
        0.0005,
      ),
      metal,
      rear,
    );
  }
  axle(group, "paint_bottom_bracket", g.bb, 0.023, 0.068, paint);
  const clamp = mesh(
    group,
    "seat_collar",
    new THREE.TorusGeometry(radius + 0.001, 0.0025, 8, 24),
    metal,
    g.seat,
  );
  clamp.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    vector(g.seatAxis),
  );
  group.add(createFork(g));
  return group;
}
