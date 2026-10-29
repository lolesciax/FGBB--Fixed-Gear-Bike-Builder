import * as THREE from "three";
import {
  handlebarPoints,
  type BicycleGeometry,
  type Position,
} from "@tracklab/domain";
import {
  annulus,
  axialProfile,
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
  metal.name = "finish_stem";
  const barMetal = metal.clone();
  barMetal.name = "finish_handlebar";
  const at = (height: number) =>
      g.head.map((v, i) => v + g.axis[i] * height) as Position,
    s = g.steering,
    bore = s.upperDiameter / 2 + 0.0003;
  axialProfile(
    group,
    "headset_upper_cover",
    g.head,
    g.axis,
    [
      [bore, 0],
      [s.headUpperRadius + 0.001, 0],
      [s.headUpperRadius + 0.001, 0.002],
      [bore + 0.0045, s.coverHeight],
      [bore, s.coverHeight],
      [bore, 0],
    ],
    metal,
  );
  if (s.quill) {
    cylinder(
      group,
      "threaded_headset_locknut",
      at(s.coverHeight - 0.004),
      at(s.coverHeight),
      bore + 0.0055,
      metal,
      bore + 0.0055,
      6,
    );
    cylinder(
      group,
      "quill_stem_shaft",
      at(s.coverHeight),
      at(s.stemCenter + 0.012),
      (s.upperDiameter - 0.0032) / 2,
      metal,
    );
  } else {
    cylinder(
      group,
      "cockpit_internal_steerer",
      g.head,
      g.steererTop,
      s.upperDiameter / 2,
      hardware,
    );
    for (
      let offset = 0, index = 0;
      offset < s.spacerHeight - 0.00001;
      index++
    ) {
      const h = Math.min(0.005, s.spacerHeight - offset),
        bottom = s.coverHeight + offset,
        bevel = Math.min(0.0005, h * 0.2);
      axialProfile(
        group,
        `headset_spacer_${index}`,
        at(bottom),
        g.axis,
        [
          [bore, 0],
          [bore + 0.0032, 0],
          [bore + 0.0036, bevel],
          [bore + 0.0036, h - bevel],
          [bore + 0.0032, h],
          [bore, h],
          [bore, 0],
        ],
        metal,
      );
      offset += h;
    }
    axialProfile(
      group,
      "stem_steerer_clamp",
      at(s.stemBottom),
      g.axis,
      [
        [bore, 0],
        [bore + 0.0045, 0],
        [bore + 0.0045, s.clampHeight],
        [bore, s.clampHeight],
        [bore, 0],
      ],
      metal,
    );
    for (const offset of [0.011, s.clampHeight - 0.011]) {
      const center = at(s.stemBottom + offset),
        r = bore + 0.0045,
        back = r * 0.88,
        half = Math.sqrt(r * r - back * back) + 0.002,
        x = center[0] - g.axis[1] * back,
        y = center[1] + g.axis[0] * back;
      cylinder(
        group,
        `stem_pinch_bolt_${offset}`,
        [x, y, -half],
        [x, y, half],
        0.0025,
        hardware,
        0.0025,
        6,
      );
    }
  }
  const stemLength = Math.hypot(
      g.barClamp[0] - g.stemBase[0],
      g.barClamp[1] - g.stemBase[1],
    ),
    body = new THREE.Shape();
  body.moveTo(0, -0.014);
  body.lineTo(stemLength, -0.017);
  body.lineTo(stemLength, 0.017);
  body.lineTo(0, 0.014);
  body.closePath();
  const extension = mesh(
    group,
    "stem_extension",
    extrude(body, 0.032, 0.002),
    metal,
    g.stemBase,
  );
  extension.rotation.z = Math.atan2(
    g.barClamp[1] - g.stemBase[1],
    g.barClamp[0] - g.stemBase[0],
  );
  if (!s.quill)
    cylinder(group, "stem_top_cap", g.stemTop, g.capTop, bore + 0.0035, metal);
  cylinder(
    group,
    "stem_top_bolt",
    g.capTop,
    g.capTop.map((v, i) => v + g.axis[i] * 0.0015) as Position,
    0.003,
    hardware,
    0.003,
    6,
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
  mesh(group, "continuous_handlebar", geometry, barMetal, g.barClamp);
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
      barMetal,
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
    steering: s,
  };
  return group;
}
