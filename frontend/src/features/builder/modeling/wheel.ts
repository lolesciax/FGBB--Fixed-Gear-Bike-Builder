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
} from "./primitives";

export function createWheel(g: BicycleGeometry, rear: boolean) {
  const group = new THREE.Group();
  group.name = rear ? "rear_wheel" : "front_wheel";
  const w = g.wheel,
    alloy = material("#737d89", 0.75, 0.29),
    rim = material(w.rimDepth > 0.04 ? "#343c47" : "#697482", 0.65, 0.32);
  alloy.name = rim.name = "finish_wheelset";
  const profile: [number, number][] = [
    [w.rimInner, -w.rimWidth * 0.22],
    [w.rimInner + 0.002, -w.rimWidth * 0.35],
    [w.rimOuter - 0.008, -w.rimWidth * 0.5],
    [w.rimOuter - 0.001, -w.rimWidth * 0.51],
    [w.rimOuter, w.rimWidth * 0.51],
    [w.rimOuter - 0.008, w.rimWidth * 0.5],
    [w.rimInner + 0.002, w.rimWidth * 0.35],
    [w.rimInner, w.rimWidth * 0.22],
    [w.rimInner, -w.rimWidth * 0.22],
  ];
  mesh(group, "rim_profile", revolved(profile), rim);
  for (const side of [-1, 1])
    mesh(
      group,
      `rim_bead_edge_${side}`,
      revolved([
        [w.rimOuter - 0.002, side * w.rimWidth * 0.505],
        [w.rimOuter, side * w.rimWidth * 0.515],
        [w.rimOuter + 0.0005, side * w.rimWidth * 0.46],
      ]),
      alloy,
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
    axle(
      group,
      `hub_flange_${side}`,
      [0, 0, side * flange],
      hubRadius,
      0.003,
      alloy,
      28,
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
    alloy,
  );
  instancedSegments(
    group,
    "spoke_nipples",
    spokes.map((s) => ({
      a: [s.rim[0] * 0.98, s.rim[1] * 0.98, s.rim[2]] as Position,
      b: s.rim,
    })),
    0.0015,
    alloy,
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
    spokes: w.spokes,
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
