import { it, expect } from "vitest";
import * as THREE from "three";
import {
  componentGeometry,
  assemblyAnchors,
  renderFrameSpecs,
  tubeJointRange,
  tubeSurfacePoint,
  jointDistance,
  staySurfacePoint,
  forkBladePoints,
  forkSection,
  assemblyGeometry,
} from "@tracklab/domain";
import { manufacturerCatalog } from "../backend/src/manufacturer-catalog";
import { createFrame } from "../frontend/src/features/builder/modeling/frame";
import {
  createWheel,
  createTire,
} from "../frontend/src/features/builder/modeling/wheel";
import { createDrivetrain } from "../frontend/src/features/builder/modeling/drivetrain";
import { createCockpit } from "../frontend/src/features/builder/modeling/cockpit";
import { disposeModel } from "../frontend/src/features/builder/modeling/primitives";
import {
  meshIntersections,
  validateAssembly,
} from "../frontend/src/features/builder/modeling/validation";

it("fits flattened stay and fork tongues within dropout plates and copes stay roots", () => {
  for (const morphologyId of [
    "cinelli-vigorelli-alu-v1",
    "skream-ranger-v1",
    "8bar-krzberg-v8-v1",
  ]) {
    const g = componentGeometry({ frameset: { morphologyId } });
    for (const side of [-1, 1])
      for (const region of ["seatstay", "chainstay"] as const)
        for (let j = 0; j < 24; j++) {
          const angle = (j * Math.PI) / 12,
            start = staySurfacePoint(g, region, side, 0, angle),
            end = staySurfacePoint(g, region, side, 1, angle);
          expect(
            jointDistance(g, region === "seatstay" ? "seat" : "bb", start),
          ).toBeCloseTo(-0.00015, 6);
          expect(
            Math.abs(end[2] - side * g.rearInterface.bodyCenter),
          ).toBeLessThanOrEqual(g.rearInterface.bodyThickness / 2);
        }
    expect(forkSection(g, 1)[0]).toBeLessThan(
      g.frontInterface.bodyThickness / 2,
    );
    expect(Math.abs(forkBladePoints(g, 1)[3][2])).toBe(
      g.frontInterface.bodyCenter,
    );
  }
});
it("preserves published stack/reach and labels construction-derived fallback anchors", () => {
  const source = assemblyGeometry({ stack: 580, reach: 412, headTube: 170 });
  expect(source.head.y).toBe(source.bb.y - 580);
  expect(source.head.x).toBe(source.bb.x + 412);
  const derived = componentGeometry({
    frameset: {
      material: "steel",
      headTube: 170,
      headset: "1 inch ITA threaded",
    },
  });
  expect(derived.frame.anchorProvenance.stack).toContain("illustrative");
  expect(
    Math.hypot(derived.crown[0] - derived.front[0], derived.crown[1]),
  ).toBeGreaterThan(derived.wheel.radius + 0.01);
});

it("uses millimetre technical anchors with centred axles and contiguous hardware contact faces", () => {
  for (const product of manufacturerCatalog.filter(
    (p) => p.status === "published",
  )) {
    const g = componentGeometry({
        frameset: renderFrameSpecs(
          product.variants[0].specs,
          product.visual?.morphologyId,product.id,
        ),
      }),
      frame = createFrame(g, "#888888");
    expect(assemblyAnchors(g).points.frontAxle).toEqual(
      g.front.map((v) => v * 1000),
    );
    expect(assemblyAnchors(g).origin).toBe('rear-axle');
    for (const rear of [false, true]) {
      const mount = rear ? g.rearInterface : g.frontInterface,
        wheel = createWheel(g, rear),
        sign = 1;
      const box = (name: string) =>
        new THREE.Box3().setFromObject(wheel.getObjectByName(name)!);
      expect(box("hub_endcap_1").max.z).toBeCloseTo(
        (rear ? g.wheel.rearSpacing : g.wheel.frontSpacing) / 2,
        6,
      );
      expect(box("axle_washer_1").min.z).toBeCloseTo(mount.outerFace, 6);
      expect(box("axle_nut_1").min.z).toBeCloseTo(
        box("axle_washer_1").max.z,
        6,
      );
      const plate = new THREE.Box3().setFromObject(
        frame.getObjectByName(rear ? "rear_dropout_1" : "fork_dropout_1")!,
      );
      expect(plate.min.z).toBeCloseTo(mount.bodyInner, 6);
      if (rear && g.morphology?.rearPlate === "double-sided-inserts") {
        const inner = new THREE.Box3().setFromObject(
          frame.getObjectByName(`rear_insert_${sign}_-1`)!,
        );
        expect(inner.min.z).toBeCloseTo(mount.innerFace, 6);
        expect(inner.max.z).toBeCloseTo(plate.min.z, 6);
      }
      disposeModel(wheel);
    }
    disposeModel(frame);
  }
});
it("represents quick release and through axles without track nuts or washers", () => {
  for (const retention of ["quick-release", "through"]) {
    const g = componentGeometry({
      wheels: { frontAxleType: retention, rearAxleType: retention },
    });
    for (const rear of [false, true]) {
      const wheel = createWheel(g, rear);
      expect(wheel.getObjectByName("axle_nut_1")).toBeUndefined();
      expect(wheel.getObjectByName("axle_washer_1")).toBeUndefined();
      if(retention==='quick-release')expect(wheel.getObjectByName('quick-release_lever')).toBeTruthy();else expect(wheel.getObjectByName('through_lever')).toBeUndefined();
      disposeModel(wheel);
    }
  }
  expect(
    componentGeometry({ frameset: { morphologyId: "skream-magnum-v1" } })
      .steering.lowerDiameterVerified,
  ).toBe(false);
  expect(
    componentGeometry({
      frameset: { morphologyId: "cinelli-vigorelli-alu-v1" },
    }).steering.lowerDiameterVerified,
  ).toBe(true);
  expect(
    componentGeometry({
      frameset: {
        headset: "ZS44/28.6 | EC44/40",
        steerer: "tapered-28.6-38.1",
      },
    }).steering.headsetType,
  ).toBe("zero-stack");
});
it("copes head junction rings to the mating surface rather than capping at the head axis", () => {
  const g = componentGeometry({
    frameset: {
      headset: "IS42/28.6 | IS52/40",
      steerer: "tapered-28.6-38.1",
      morphologyId: "cinelli-vigorelli-alu-v1",
    },
  });
  for (const region of ["top", "down"] as const)
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI) / 12,
        range = tubeJointRange(g, region, angle);
      expect(range[1]).toBeLessThan(1);
      expect(
        jointDistance(g, "head", tubeSurfacePoint(g, region, 1, angle)),
      ).toBeCloseTo(-0.00015, 6);
    }
});
it("uses detailed triangle tests after broad bounds, detecting crossing and coplanar surfaces", () => {
  const make = (points: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return new THREE.Mesh(g, new THREE.MeshBasicMaterial());
  };
  const a = make([0, 0, 0, 1, 0, 0, 0, 1, 0]),
    separate = make([0.8, 0.8, 0, 1, 0.8, 0, 0.8, 1, 0]),
    crossing = make([0.2, 0.2, -0.1, 0.2, 0.2, 0.1, 0.3, 0.3, 0.1]),
    coplanar = make([0.1, 0.1, 0, 0.3, 0.1, 0, 0.1, 0.3, 0]);
  expect(
    new THREE.Box3()
      .setFromObject(a)
      .intersectsBox(new THREE.Box3().setFromObject(separate)),
  ).toBe(true);
  expect(meshIntersections(a, separate).samples).toHaveLength(0);
  expect(meshIntersections(a, crossing).samples[0].coplanar).toBe(false);
  expect(meshIntersections(a, coplanar).samples[0].coplanar).toBe(true);
  for (const mesh of [a, separate, crossing, coplanar]) disposeModel(mesh);
});
it("checks critical actual assembly meshes across published frame families", () => {
  for (const product of manufacturerCatalog.filter(
    (p) => p.status === "published",
  ))
    for (const variant of product.variants.filter((v) => !v.colorwayId)) {
      const specs = variant.specs;
      const g = componentGeometry({
          frameset: renderFrameSpecs(specs, product.visual?.morphologyId,product.id),
          wheels: {
            frontAxleDiameter: Number(specs.frontAxleDiameter || 10),
            rearAxleDiameter: Number(specs.rearAxleDiameter || 10),
          },
        }),
        root = new THREE.Group();
      root.add(
        createFrame(g, "#888888"),
        createWheel(g, false),
        createWheel(g, true),
        createDrivetrain(g),
        createCockpit(g, {}),
      );
      for (const axle of [g.front, g.rear]) {
        const tire = createTire(g);
        tire.position.set(...axle);
        root.add(tire);
      }
      const report = validateAssembly(root, g);
      expect(report.testedPairs, product.id).toBe(14);
      expect(
        report.diagnostics.filter((d) => d.severity !== "pass"),
        variant.id,
      ).toEqual([]);
      disposeModel(root);
    }
});
it("keeps the head and stem bores open and the hardware holes concentric", () => {
  const g = componentGeometry(),
    frame = createFrame(g, "#888888"),
    cockpit = createCockpit(g, {}),
    wheel = createWheel(g, false);
  const ray = (
    name: string,
    root: THREE.Object3D,
    origin: number[],
    direction: number[],
  ) => {
    root.updateWorldMatrix(true, true);
    return new THREE.Raycaster(
      new THREE.Vector3(...origin),
      new THREE.Vector3(...direction),
    ).intersectObject(root.getObjectByName(name)!, false);
  };
  expect(
    ray(
      "paint_head",
      frame,
      g.head.map((v, i) => v + g.axis[i] * 0.1),
      g.axis.map((v) => -v),
    ),
  ).toHaveLength(0);
  expect(
    ray(
      "stem_extension",
      cockpit,
      g.stemBase.map((v, i) => v + g.axis[i] * 0.1),
      g.axis.map((v) => -v),
    ),
  ).toHaveLength(0);
  for (const name of ["axle_nut_1", "axle_washer_1"])
    expect(
      ray(name, wheel, [g.front[0], g.front[1], 1], [0, 0, -1]),
    ).toHaveLength(0);
  for (const root of [frame, cockpit, wheel]) disposeModel(root);
});

it("reports an unresolved nominal-width envelope instead of silently resizing it to fit", () => {
  const product = manufacturerCatalog.find((p) => p.id === "skream-magnum")!,
    variant = product.variants[0];
  const g = componentGeometry({
      frameset: renderFrameSpecs(variant.specs, product.visual?.morphologyId,product.id),
      tires: { width: 35, sectionHeight: 35 },
    }),
    root = new THREE.Group();
  root.add(
    createFrame(g, "#888888"),
    createCockpit(g, {}),
    createDrivetrain(g),
  );
  for (const axle of [g.front, g.rear]) {
    const tire = createTire(g);
    tire.position.set(...axle);
    root.add(tire);
  }
  expect(g.wheel.radius).toBeCloseTo(0.346, 8);
  expect(
    validateAssembly(root, g).diagnostics.find(
      (d) => d.id === "rear-tire/seat-tube",
    ),
  ).toMatchObject({ classification: "penetration", severity: "error" });
  expect(g.frame).toEqual(assemblyGeometry(variant.specs));
  disposeModel(root);
});
