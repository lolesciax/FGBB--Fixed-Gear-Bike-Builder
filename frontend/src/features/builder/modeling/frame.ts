import * as THREE from "three";
import {
  frameTubeGeometry,
  seatCollarGeometry,
  stayGeometry,
} from "./sections";
import {
  forkBladePoints,
  forkSection,
  forkCrownDefinition,
  forkCrownSurfacePoint,
  rearDropoutOutline,
  dropoutOutline,
  frontDropoutOutline,
  type BicycleGeometry,
  type Position,
} from "@tracklab/domain";
import {
  annulus,
  axialProfile,
  cylinder,
  extrude,
  material,
  mesh,
  sweptSection,
  vector,
} from "./primitives";
function dropout(g: BicycleGeometry) {
  const style = g.frontDropoutStyle,
    diameter = g.frontDropoutDiameter;
  const shape = new THREE.Shape(
    (style === "rearward-track"
      ? dropoutOutline(style, diameter)
      : frontDropoutOutline(g)
    ).map(([x, y]) => new THREE.Vector2(x, y)),
  );
  if (style === "through") {
    const hole = new THREE.Path();
    hole.absarc(0, 0, diameter / 2 + 0.00035, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const geometry = extrude(shape, 0.0046, 0.0002),
    p = geometry.getAttribute("position");
  // The lug enters the blade; its upper neck tapers inside the blade wall.
  // Keep the complete five-millimetre contact body around the axle/end ring.
  for (let i = 0; i < p.count; i++) {
    const t = Math.max(0, Math.min(1, (p.getY(i) - 0.010) / 0.002));
    p.setZ(i, p.getZ(i) * (1 - 0.45 * t));
  }
  geometry.computeVertexNormals();
  return geometry;
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
    g.crown.map((v, i) => v - g.axis[i] * 0.003) as Position,
    g.head,
    g.steering.lowerDiameter / 2,
    metal,
    g.steering.upperDiameter / 2,
  );
  const bore = g.steering.lowerDiameter / 2 + 0.0004,
    race = g.steering.headLowerRadius + 0.001,
    seat = bore + 0.0006;
  axialProfile(
    group,
    "fork_headset_lower",
    g.lower,
    g.axis,
    [
      [bore, -g.crownStack],
      [seat, -g.crownStack],
      [race - 0.002, -g.crownStack * 0.75],
      [race, -Math.min(0.003, g.crownStack * 0.25)],
      [race, 0],
      [bore, 0],
      [bore, -g.crownStack],
    ],
    metal,
  );
  const def = forkCrownDefinition(g);
  const radial = 16,
    positions: number[] = [],
    indices: number[] = [];
  for (let i = 0; i <= 24; i++)
    for (let j = 0; j <= radial; j++) {
      positions.push(
        ...forkCrownSurfacePoint(def, i / 24, (j * Math.PI * 2) / radial),
      );
      if (i < 24 && j < radial) {
        const a = i * (radial + 1) + j,
          b = a + radial + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  const crownGeometry = new THREE.BufferGeometry();
  crownGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  crownGeometry.setIndex(indices);
  crownGeometry.computeVertexNormals();
  mesh(group, "fork_crown", crownGeometry, surface.clone());
  const dropoutGeometry = dropout(g);
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
        radial,
        (t) => forkSection(g, path.getUtoTmapping(t, 0)),
        true,
        { caps: "end" },
      )),
      surface,
    );
    if (side === -1) blade.scale.z = -1;
    mesh(group, `fork_dropout_${side}`, dropoutGeometry, metal, [
      g.front[0],
      g.front[1],
      side * g.frontInterface.bodyCenter,
    ]);
  }
  const crownMesh = group.getObjectByName("fork_crown") as THREE.Mesh,
    crownPositions = crownMesh.geometry.getAttribute("position"),
    crownNormals = crownMesh.geometry.getAttribute("normal"),
    bladePositions = bladeGeometry!.getAttribute("position"),
    bladeNormals = bladeGeometry!.getAttribute("normal");
  // Weld the shading across the coincident open root rings, while retaining
  // named meshes and shared blade buffers for selection and size morphing.
  for (let j = 0; j <= radial; j++) {
    const point = new THREE.Vector3().fromBufferAttribute(bladePositions, j);
    for (let k = 24 * (radial + 1); k < 25 * (radial + 1); k++)
      if (
        new THREE.Vector3()
          .fromBufferAttribute(crownPositions, k)
          .distanceTo(point) < 1e-6
      ) {
        const normal = new THREE.Vector3()
          .fromBufferAttribute(bladeNormals, j)
          .add(new THREE.Vector3().fromBufferAttribute(crownNormals, k))
          .normalize();
        bladeNormals.setXYZ(j, normal.x, normal.y, normal.z);
        crownNormals.setXYZ(k, normal.x, normal.y, normal.z);
        const mirror = point.clone();
        mirror.z *= -1;
        for (let i = 0; i <= radial; i++)
          if (
            new THREE.Vector3()
              .fromBufferAttribute(crownPositions, i)
              .distanceTo(mirror) < 1e-6
          )
            crownNormals.setXYZ(i, normal.x, normal.y, -normal.z);
      }
  }
  group.userData = {
    fidelity: "illustrative",
    construction: g.construction.fork.id,
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
  for (const name of ["top", "down", "seat"] as const) {
    const part = mesh(
      group,
      `paint_${name}`,
      frameTubeGeometry(g, name),
      paint.clone(),
    );
    part.userData.sectionProfile = g.morphology?.tubes[name].kind || "circular";
  }
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
      [g.steering.upperBearingRadius, headLength],
      [g.steering.upperDiameter / 2 + 0.001, headLength - 0.006],
      [g.steering.lowerDiameter / 2 + 0.001, 0.006],
      [g.steering.lowerBearingRadius, 0],
      [lower, 0],
    ],
    paint.clone(),
  );
  const inserted = g.construction.rear.inserts !== "none";
  const plateShape = (insert = false) => {
    const shape = new THREE.Shape(
      rearDropoutOutline(g, insert).map((p) => new THREE.Vector2(...p)),
    );
    for (const [x, y] of g.construction.rear.fasteners) {
      const hole = new THREE.Path();
      hole.absarc(x / 1000, y / 1000, 0.0012, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
    if (g.rearDropoutStyle === "through") {
      const hole = new THREE.Path();
      hole.absarc(
        0,
        0,
        g.rearDropoutDiameter / 2 + 0.00035,
        0,
        Math.PI * 2,
        true,
      );
      shape.holes.push(hole);
    }
    return shape;
  };
  // Machined plates have hard face/wall boundaries. Avoid the six duplicated
  // bevel rings used by generic extrusion; these are finite-thickness profiles.
  const rearGeometry = extrude(plateShape(), 0.005, 0);
  const insertGeometry = inserted
      ? extrude(plateShape(true), 0.0012, 0)
      : undefined,
    steel = inserted ? material("#b1bac5", 0.85, 0.3) : undefined;
  const screwShape = new THREE.Shape();
  screwShape.absarc(0, 0, 0.0021, 0, Math.PI * 2, false);
  const socket = new THREE.Path(
    Array.from(
      { length: 6 },
      (_, i) =>
        new THREE.Vector2(
          Math.cos((-i * Math.PI) / 3) * 0.0008,
          Math.sin((-i * Math.PI) / 3) * 0.0008,
        ),
    ),
  );
  socket.closePath();
  screwShape.holes.push(socket);
  const screwGeometry = inserted ? extrude(screwShape, 0.0018, 0) : undefined;
  for (const side of [-1, 1]) {
    const rear: Position = [
      g.rear[0],
      g.rear[1],
      side * g.rearInterface.bodyCenter,
    ];
    mesh(
      group,
      `paint_seatstay_${side}`,
      stayGeometry(g, "seatstay", side),
      paint.clone(),
    );
    mesh(
      group,
      `paint_chainstay_${side}`,
      stayGeometry(g, "chainstay", side),
      paint.clone(),
    );
    const body = mesh(
      group,
      `rear_dropout_${side}`,
      rearGeometry,
      paint.clone(),
      rear,
    );
    body.userData.profile = g.construction.rear.id;
    if (inserted) {
      for (const face of g.construction.rear.inserts === "both" ? [-1, 1] : [1])
        mesh(group, `rear_insert_${side}_${face}`, insertGeometry!, steel!, [
          rear[0],
          rear[1],
          side *
            (face === 1
              ? g.rearInterface.outerInsertCenter
              : g.rearInterface.innerInsertCenter),
        ]);
      for (const [index, [x, y]] of g.construction.rear.fasteners.entries())
        mesh(
          group,
          `rear_plate_screw_${side}_${index}`,
          screwGeometry!,
          steel!,
          [
            rear[0] + x / 1000,
            rear[1] + y / 1000,
            side * (g.rearInterface.outerFace + 0.0009),
          ],
        );
    }
  }
  mesh(
    group,
    "paint_bottom_bracket",
    extrude(annulus(0.023, 0.017), 0.068, 0),
    paint,
    g.bb,
  );
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
  group.userData.rearEndProfile = g.construction.rear.id;
  return group;
}
