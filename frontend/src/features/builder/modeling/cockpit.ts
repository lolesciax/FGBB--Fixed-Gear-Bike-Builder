import * as THREE from "three";
import {
  handlebarPoints,
  type BicycleGeometry,
  type Position,
} from "@tracklab/domain";
import {
  annulus,
  curve,
  cylinder,
  extrude,
  material,
  mesh,
  sweptSection,
  vector,
} from "./primitives";

export function createCockpit(
  g: BicycleGeometry,
  specs: Record<string, string | number | boolean>,
) {
  const group = new THREE.Group();
  group.name = `cockpit_${g.cockpit.type}`;
  const metal = material("#454f5e", 0.7, 0.32),
    tape = material("#202630", 0, 0.88),
    hardware = material("#8a929d", 0.8, 0.3),
    d = g.cockpit;
  const baseA = g.stemBase.map((v, i) => v - g.axis[i] * 0.018) as Position,
    baseB = g.stemBase.map((v, i) => v + g.axis[i] * 0.018) as Position;
  cylinder(group, "stem_steerer_clamp", baseA, baseB, 0.0195, metal);
  for (const height of [0.012, 0.022]) {
    const p = g.head.map((v, i) => v + g.axis[i] * height) as Position;
    cylinder(
      group,
      `headset_spacer_${height}`,
      p,
      p.map((v, i) => v + g.axis[i] * 0.004) as Position,
      0.018,
      metal,
    );
  }
  cylinder(
    group,
    "stem_extension",
    g.stemBase,
    g.barClamp,
    0.014,
    metal,
    0.017,
  );
  mesh(
    group,
    "bar_clamp",
    extrude(annulus(d.clamp / 2 + 0.006, d.clamp / 2 + 0.0001), 0.044, 0.0006),
    metal,
    g.barClamp,
  );
  const plate = mesh(
    group,
    "stem_faceplate",
    new THREE.BoxGeometry(0.007, 0.034, 0.036),
    metal,
    [g.barClamp[0] + 0.019, g.barClamp[1], 0],
  );
  plate.rotation.z = d.stemAngle;
  for (const y of [-0.011, 0.011])
    for (const z of [-0.012, 0.012])
      cylinder(
        group,
        `stem_bolt_${y}_${z}`,
        [g.barClamp[0] + 0.02, g.barClamp[1] + y, z],
        [g.barClamp[0] + 0.026, g.barClamp[1] + y, z],
        0.0028,
        hardware,
        0.0028,
        6,
      );
  const points = handlebarPoints(specs),
    path = curve(points);
  const geometry = sweptSection(path, 96, 12, (t) => {
    const z = Math.abs(path.getPointAt(t).z),
      blend = THREE.MathUtils.smoothstep(z, 0.025, 0.065),
      r = THREE.MathUtils.lerp(d.clamp / 2, d.tubeDiameter / 2, blend);
    return [r, r];
  });
  mesh(group, "continuous_handlebar", geometry, metal, g.barClamp);
  const wrap = Math.min(
    0.28,
    (d.type === "flat" || d.type === "riser" ? 0.12 : 0.23) / path.getLength(),
  );
  for (const side of [0, 1]) {
    const samples = Array.from({ length: 25 }, (_, i) =>
        path.getPointAt(
          side === 0 ? (i / 24) * wrap : 1 - wrap + (i / 24) * wrap,
        ),
      ),
      wrapped = new THREE.CatmullRomCurve3(samples, false, "centripetal");
    mesh(
      group,
      `bar_wrap_${side}`,
      new THREE.TubeGeometry(
        wrapped,
        32,
        d.tubeDiameter / 2 + 0.0014,
        10,
        false,
      ),
      tape,
      g.barClamp,
    );
    const end = path.getPointAt(side),
      tangent = path.getTangentAt(side).multiplyScalar(side === 0 ? -1 : 1),
      a = end.clone().add(vector(g.barClamp)),
      b = a.clone().addScaledVector(tangent, 0.002);
    cylinder(
      group,
      `bar_end_${side}`,
      a.toArray() as Position,
      b.toArray() as Position,
      d.tubeDiameter / 2 + 0.0005,
      metal,
    );
  }
  group.userData = {
    fidelity: "illustrative",
    type: d.type,
    width: d.width,
    clamp: d.clamp,
    stem: g.stemBase,
    handlebarClamp: g.barClamp,
    assumedDimensions: d.illustrative,
  };
  return group;
}
