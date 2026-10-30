import { it, expect } from "vitest";
import * as THREE from "three";
import {
  componentGeometry,
  constructionProfile,
  renderFrameSpecs,
  staySurfacePoint,
  forkCrownDefinition,
  forkCrownSurfacePoint,
} from "@tracklab/domain";
import { manufacturerCatalog } from "../backend/src/manufacturer-catalog";
import {
  createFrame,
  createFork,
} from "../frontend/src/features/builder/modeling/frame";
import { createWheel } from "../frontend/src/features/builder/modeling/wheel";
import { disposeModel } from "../frontend/src/features/builder/modeling/primitives";
const geometries = () =>
  manufacturerCatalog
    .filter((p) => p.status === "published")
    .map((p) => ({
      id: p.id,
      g: componentGeometry({
        frameset: renderFrameSpecs(
          p.variants[0].specs,
          p.visual?.morphologyId,
          p.id,
        ),
      }),
    }));
const ray = (node: THREE.Object3D, x: number, y: number) => {
  node.updateWorldMatrix(true, true);
  return new THREE.Raycaster(
    new THREE.Vector3(x, y, 1),
    new THREE.Vector3(0, 0, -1),
  ).intersectObject(node, false);
};
it("uses the source generation plate arrangements without promoting draft products", () => {
  const cinelli = constructionProfile({
      renderFamily: "cinelli-vigorelli",
    }).rear,
    v8 = constructionProfile({ renderFamily: "8bar-krzberg-v8" }).rear,
    tsunami = constructionProfile({ renderFamily: "tsunami-snm100" }).rear;
  expect([cinelli.inserts, cinelli.fasteners.length]).toEqual(["outer", 2]);
  expect([v8.inserts, v8.fasteners.length]).toEqual(["both", 3]);
  expect([tsunami.inserts, tsunami.fasteners.length]).toEqual(["both", 4]);
  expect(
    constructionProfile({ renderFamily: "tsunami-snm100-elite" }).rear.id,
  ).not.toBe(tsunami.id);
  expect(
    manufacturerCatalog.find((p) => p.id === "tsunami-snm100")?.status,
  ).not.toBe("published");
});
it("keeps the rearward mouth open beyond the washer and attaches both stays inside the actual metal profile", () => {
  for (const { id, g } of geometries()) {
    const frame = createFrame(g, "#777777");
    const plate = frame.getObjectByName("rear_dropout_1") as THREE.Mesh;
    expect(
      ray(
        plate,
        g.rear[0] - g.construction.rear.mouth / 1000 + 0.003,
        g.rear[1],
      ),
      id,
    ).toHaveLength(0);
    expect(g.construction.rear.mouth / 1000).toBeGreaterThan(
      g.rearInterface.washerRadius + 0.01,
    );
    for (const region of ["seatstay", "chainstay"] as const)
      for (const side of [-1, 1])
        for (let i = 0; i < 16; i++) {
          const end = staySurfacePoint(g, region, side, 1, (i * Math.PI) / 8),
            body = frame.getObjectByName(`rear_dropout_${side}`)!;
          expect(
            ray(body, end[0], end[1]).length,
            `${id}/${region}/${side}/${i}`,
          ).toBeGreaterThan(0);
          expect(
            Math.abs(end[2] - side * g.rearInterface.bodyCenter),
          ).toBeLessThan(g.rearInterface.bodyThickness / 2);
          expect(
            Math.hypot(end[0] - g.rear[0], end[1] - g.rear[1]),
          ).toBeGreaterThan(g.rearInterface.washerRadius + 0.004);
        }
    if (g.construction.rear.inserts !== "none")
      for (const [i, [x, y]] of g.construction.rear.fasteners.entries()) {
        expect(
          ray(plate, g.rear[0] + x / 1000, g.rear[1] + y / 1000),
        ).toHaveLength(0);
        expect(frame.getObjectByName(`rear_plate_screw_1_${i}`)).toBeTruthy();
      }
    disposeModel(frame);
  }
});
it("uses one centred hub, one retention system and one nut per side without external bearing-seat discs", () => {
  for (const { g } of geometries())
    for (const rear of [false, true]) {
      const wheel = createWheel(g, rear),
        center = rear ? g.rear : g.front;
      expect(wheel.position.toArray()).toEqual(center);
      expect(wheel.getObjectsByProperty("name", "hub_shell")).toHaveLength(1);
      expect(wheel.getObjectsByProperty("name", "axle_retention")).toHaveLength(
        1,
      );
      expect(wheel.getObjectByName("hub_bearing_seat_1")).toBeUndefined();
      for (const side of [-1, 1]) {
        expect(
          wheel.getObjectsByProperty("name", `axle_nut_${side}`),
        ).toHaveLength(1);
        const cap = new THREE.Box3().setFromObject(
          wheel.getObjectByName(`hub_endcap_${side}`)!,
        );
        expect(side === 1 ? cap.max.z : -cap.min.z).toBeCloseTo(
          (rear ? g.wheel.rearSpacing : g.wheel.frontSpacing) / 2,
          6,
        );
      }
      disposeModel(wheel);
    }
});
it("builds QR cam/skewer and a single socket-head through axle without track nuts or extra levers", () => {
  for (const retention of ["quick-release", "through"])
    for (const rear of [false, true]) {
      const g = componentGeometry({
          frameset: {
            frontDropoutType:
              retention === "through" ? "through" : "open-vertical",
            frontAxleDiameter: retention === "through" ? 12 : 9,
          },
          wheels: {
            frontAxleType: retention,
            rearAxleType: retention,
            frontAxleDiameter: retention === "through" ? 12 : 9,
          },
        }),
        wheel = createWheel(g, rear);
      expect(wheel.getObjectByName("axle_nut_1")).toBeUndefined();
      expect(wheel.getObjectByName("axle_washer_1")).toBeUndefined();
      if (retention === "quick-release") {
        expect(wheel.getObjectByName("quick-release_cam_pivot")).toBeTruthy();
        expect(
          wheel.getObjectByName("quick-release_hollow_spindle"),
        ).toBeTruthy();
        expect(wheel.getObjectByName("through_head_1")).toBeUndefined();
      } else {
        expect(
          wheel.getObjectsByProperty("name", "through_head_1"),
        ).toHaveLength(1);
        expect(wheel.getObjectByName("through_head_-1")).toBeUndefined();
        expect(wheel.getObjectByName("through_lever")).toBeUndefined();
      }
      disposeModel(wheel);
    }
});
it("forms a flat crown seat, matching blade root rings and no crown volume above the headset contact plane", () => {
  for (const { id, g } of geometries()) {
    const fork = createFork(g),
      def = forkCrownDefinition(g),
      crown = fork.getObjectByName("fork_crown") as THREE.Mesh;
    const axis = new THREE.Vector3(...g.axis),
      origin = new THREE.Vector3(...g.crown),
      positions = crown.geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++)
      expect(
        new THREE.Vector3()
          .fromBufferAttribute(positions, i)
          .sub(origin)
          .dot(axis),
        id,
      ).toBeLessThan(0.00001);
    for (const angle of [(Math.PI * 3) / 8, Math.PI / 2, (Math.PI * 5) / 8])
      expect(
        new THREE.Vector3(...forkCrownSurfacePoint(def, 0.5, angle))
          .sub(origin)
          .dot(axis),
      ).toBeCloseTo(0, 6);
    const contactRadius = g.steering.lowerDiameter / 2 + 0.0008;
    const normal = new THREE.Vector3(g.axis[1], -g.axis[0], 0);
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI) / 12;
      const originAtSeat = origin
        .clone()
        .addScaledVector(normal, Math.cos(angle) * contactRadius);
      originAtSeat.z += Math.sin(angle) * contactRadius;
      originAtSeat.addScaledVector(axis, 0.001);
      const hit = new THREE.Raycaster(
        originAtSeat,
        axis.clone().negate(),
      ).intersectObject(crown, false)[0];
      expect(hit, `${id}/bearing seat/${i}`).toBeTruthy();
      expect(hit.distance, `${id}/bearing seat/${i}`).toBeCloseTo(0.001, 4);
    }
    fork.updateWorldMatrix(true, true);
    // Every strip advances laterally; folded shoulders backtrack and cross.
    for (let j = 0; j < 16; j++) {
      let previous = -Infinity;
      for (let i = 0; i <= 96; i++) {
        const z = forkCrownSurfacePoint(def, i / 96, (j * Math.PI) / 8)[2];
        expect(z, `${id}/unfolded crown/${i}/${j}`).toBeGreaterThanOrEqual(
          previous - 0.000001,
        );
        previous = z;
      }
    }
    for (const side of [-1, 1]) {
      const blade = fork.getObjectByName(`fork_blade_${side}`) as THREE.Mesh,
        p = blade.geometry.getAttribute("position"),
        radial = 16,
        start = side === 1 ? 24 * (radial + 1) : 0;
      for (let i = 0; i < radial; i++) {
        const point = new THREE.Vector3()
          .fromBufferAttribute(p, i)
          .applyMatrix4(blade.matrixWorld);
        const nearest = Math.min(
          ...Array.from({ length: radial + 1 }, (_, j) =>
            point.distanceTo(
              new THREE.Vector3().fromBufferAttribute(positions, start + j),
            ),
          ),
        );
        expect(nearest, `${id}/${side}/${i}`).toBeLessThan(0.00002);
      }
    }
    disposeModel(fork);
  }
});
it("seats each blade termination ring inside the real tapered dropout body", () => {
  for (const { id, g } of geometries()) {
    const fork = createFork(g);
    fork.updateWorldMatrix(true, true);
    for (const side of [-1, 1]) {
      const blade = fork.getObjectByName(`fork_blade_${side}`) as THREE.Mesh,
        plate = fork.getObjectByName(`fork_dropout_${side}`)!,
        p = blade.geometry.getAttribute("position");
      for (let j = 0; j < 16; j++) {
        const end = new THREE.Vector3()
          .fromBufferAttribute(p, 28 * 17 + j)
          .applyMatrix4(blade.matrixWorld);
        expect(
          ray(plate, end.x, end.y).length,
          `${id}/${side}/tip/${j}`,
        ).toBeGreaterThan(0);
        expect(
          Math.abs(end.z - side * g.frontInterface.bodyCenter),
        ).toBeLessThan(0.00251);
      }
    }
    disposeModel(fork);
  }
});
