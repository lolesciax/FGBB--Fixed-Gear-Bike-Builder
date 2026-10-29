import * as THREE from "three";
import { frameTubeGeometry, seatCollarGeometry } from "./sections";
import { chainstayPoints } from "@tracklab/domain";
import {
  forkBladePoints,
  forkSection,
  forkCrownDefinition,
  forkCrownSample,
  forkCrownSection,
  rearDropoutOutline,
  dropoutOutline,
  type DropoutStyle,
  type BicycleGeometry,
  type Position,
} from "@tracklab/domain";
import {
  axle,
  axialProfile,
  cylinder,
  extrude,
  material,
  mesh,
  sweptSection,
  tube,
  vector,
} from "./primitives";
function dropout(style: DropoutStyle, diameter: number) {
  const shape = new THREE.Shape(
    dropoutOutline(style, diameter).map(([x, y]) => new THREE.Vector2(x, y)),
  );
  if (style === "through") {
    const hole = new THREE.Path();
    hole.absarc(0, 0, diameter / 2 + 0.0006, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  return extrude(shape, 0.005, 0.0005);
}

export function createFork(g: BicycleGeometry) {
  const group = new THREE.Group();
  group.name = "fork_assembly";
  const metal = material("#444d59", 0.65, 0.35),
    surface = new THREE.MeshPhysicalMaterial({
      color: "#303945",
      metalness: 0.3,
      roughness: 0.38,
    });
  // The cockpit owns the visible upper stack; kits never bake an exposed stem extension.
  cylinder(
    group,
    "fork_steerer",
    g.crown,
    g.head,
    g.steering.lowerDiameter / 2,
    metal,
    g.steering.upperDiameter / 2,
  );
  const bore = g.steering.lowerDiameter / 2 + 0.0004,
    race = g.steering.headLowerRadius + 0.001;
  axialProfile(
    group,
    "fork_headset_lower",
    g.lower,
    g.axis,
    [
      [bore, -0.011],
      [race - 0.002, -0.008],
      [race, -0.003],
      [race, 0],
      [bore, 0],
      [bore, -0.011],
    ],
    metal,
  );
  const roots = [-1, 1].map((side) => forkBladePoints(g, side)[0]),
    legacyCrown = new THREE.CubicBezierCurve3(
      vector(roots[0]),
      new THREE.Vector3(g.crown[0], g.crown[1] + 0.006, -0.012),
      new THREE.Vector3(g.crown[0], g.crown[1] + 0.006, 0.012),
      vector(roots[1]),
    );
  const def = forkCrownDefinition(g);
  class CrownCurve extends THREE.Curve<THREE.Vector3> {
    constructor(){super();}
    getPoint(t: number, target = new THREE.Vector3()) {
      return target.fromArray(forkCrownSample(def, t));
    }
  }
  const crownPath = def.modern ? new CrownCurve() : legacyCrown;
  mesh(
    group,
    "fork_crown",
    sweptSection(
      crownPath,
      24,
      16,
      (t) =>
        forkCrownSection(
          def,
          def.modern ? crownPath.getUtoTmapping(t, 0) : t,
        ),
      false,
      def.modern ? { normal: new THREE.Vector3(1, 0, 0) } : {},
    ),
    surface.clone(),
  );
  const dropoutGeometry = dropout(g.frontDropoutStyle, g.frontDropoutDiameter);
  let bladeGeometry: THREE.BufferGeometry | undefined;
  for (const side of [1, -1]) {
    const [start, control1, control2, end] = forkBladePoints(g, 1).map(vector);
    const path = new THREE.CubicBezierCurve3(start, control1, control2, end);
    const blade = mesh(
      group,
      `fork_blade_${side}`,
      (bladeGeometry ||= sweptSection(
        path,
        28,
        def.modern ? 16 : 12,
        (t) => forkSection(g, t),
        true,
        { caps: "end" },
      )),
      surface,
    );
    if (side === -1) blade.scale.z = -1;
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
  const paint = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.35,
      roughness: 0.34,
    }),
    metal = material("#6c7583", 0.7, 0.33),
    radius = g.frame.frameWidth / 2000;
  for (const [name, a, b, r] of [
    ["top", g.seatJunction, g.topJunction, radius],
    ["down", g.bb, g.downJunction, radius + 0.004],
    ["seat", g.bb, g.seat, radius],
  ] as const)
    if (g.morphology) {
      const part = mesh(
        group,
        `paint_${name}`,
        frameTubeGeometry(g, name),
        paint.clone(),
      );
      part.userData.sectionProfile = g.morphology.tubes[name].kind;
    } else cylinder(group, `paint_${name}`, a, b, r, paint.clone());
  const headLength = vector(g.head).distanceTo(vector(g.lower)),
    upper = g.steering.headUpperRadius,
    lower = g.steering.headLowerRadius;
  axialProfile(
    group,
    "paint_head",
    g.lower,
    g.axis,
    [
      [lower, 0],
      [lower, 0.003],
      [upper, headLength - 0.004],
      [upper, headLength],
      [g.steering.upperDiameter / 2 + 0.001, headLength],
      [g.steering.lowerDiameter / 2 + 0.001, 0],
      [lower, 0],
    ],
    paint.clone(),
  );
  const inserted = g.morphology && g.morphology.rearPlate !== "integrated",
    rearGeometry = inserted
      ? extrude(
          new THREE.Shape(
            rearDropoutOutline(g).map((p) => new THREE.Vector2(...p)),
          ),
          0.005,
          0.0005,
        )
      : dropout(g.rearDropoutStyle, g.rearDropoutDiameter);
  const insertGeometry = inserted
      ? extrude(
          new THREE.Shape(
            rearDropoutOutline(g, true).map((p) => new THREE.Vector2(...p)),
          ),
          0.0012,
          0.0002,
        )
      : undefined,
    steel = inserted ? material("#b1bac5", 0.85, 0.3) : undefined;
  for (const side of [-1, 1]) {
    const rear: Position = [g.rear[0], g.rear[1], side * g.rearHalf],
      seat: Position = [g.stayJunction[0], g.stayJunction[1], side * 0.012],
      upperEnd: Position = [rear[0] + 0.012, rear[1] + 0.01, rear[2]];
    cylinder(
      group,
      `paint_seatstay_${side}`,
      seat,
      upperEnd,
      0.007,
      paint.clone(),
    );
    tube(
      group,
      `paint_chainstay_${side}`,
      chainstayPoints(g, side),
      0.008,
      paint.clone(),
      24,
      10,
    );
    mesh(group, `rear_dropout_${side}`, rearGeometry, metal, rear);
    if (g.morphology && g.morphology.rearPlate !== "integrated") {
      for (const face of g.morphology.rearPlate === "double-sided-inserts"
        ? [-1, 1]
        : [1])
        mesh(group, `rear_insert_${side}_${face}`, insertGeometry!, steel!, [
          rear[0],
          rear[1],
          rear[2] + side * face * 0.0034,
        ]);
    }
  }
  axle(group, "paint_bottom_bracket", g.bb, 0.023, 0.068, paint);
  if (g.morphology)
    mesh(group, "seat_collar", seatCollarGeometry(g), metal, g.seat);
  else {
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
  }
  group.add(createFork(g));
  return group;
}
