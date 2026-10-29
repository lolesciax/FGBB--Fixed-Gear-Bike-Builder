import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { componentGeometry, dropoutOutline } from "@tracklab/domain";
import {
  createFork,
  createFrame,
} from "../frontend/src/features/builder/modeling/frame";
import { createCockpit } from "../frontend/src/features/builder/modeling/cockpit";
import { disposeModel } from "../frontend/src/features/builder/modeling/primitives";
describe("shared structural steering assembly", () => {
  it("encloses the steerer under the selected clamp and cap without fixed gaps", () => {
    for (const spacerHeight of [0, 0.1, 10, 30, 40]) {
      const g = componentGeometry({
          frameset: {
            headset: "IS42/28.6 | IS52/40",
            steerer: "tapered-28.6-38.1",
          },
          cockpit: { spacerHeight, stemClampHeight: 40 },
        }),
        s = g.steering;
      expect(s.stemBottom).toBeCloseTo(s.coverHeight + s.spacerHeight);
      expect(s.steererEnd).toBeCloseTo(s.stemTop - 0.002);
      expect(s.capTop).toBeGreaterThan(s.stemTop);
      expect(s.lowerDiameter).toBeCloseTo(0.0381);
      expect(s.headLowerRadius).toBeGreaterThan(s.headUpperRadius);
      const cockpit = createCockpit(g, { spacerHeight });
      expect(cockpit.getObjectByName("headset_upper_cover")).toBeTruthy();
      expect(cockpit.getObjectByName("stem_top_cap")).toBeTruthy();
      const fork = createFork(g),
        shaft = fork.getObjectByName("fork_steerer") as THREE.Mesh;
      fork.updateWorldMatrix(true, true);
      const positions = shaft.geometry.getAttribute("position"),
        p = new THREE.Vector3(),
        axis = new THREE.Vector3(...g.axis),
        head = new THREE.Vector3(...g.head);
      for (let i = 0; i < positions.count; i++) {
        p.fromBufferAttribute(positions, i).applyMatrix4(shaft.matrixWorld);
        expect(p.sub(head).dot(axis)).toBeLessThan(0.000001);
      }
      disposeModel(cockpit);
      disposeModel(fork);
    }
  });
  it("uses a separate quill representation for a threaded fork and joins tubes inside the head ends", () => {
    const g = componentGeometry({
        frameset: { headset: "1 inch ITA threaded", material: "steel" },
      }),
      cockpit = createCockpit(g, {}),
      frame = createFrame(g, "#444444");
    expect(g.steering.quill).toBe(true);
    expect(g.steering.upperDiameter).toBeCloseTo(0.0254);
    expect(cockpit.getObjectByName("quill_stem_shaft")).toBeTruthy();
    expect(cockpit.getObjectByName("stem_steerer_clamp")).toBeUndefined();
    const axis = new THREE.Vector3(...g.axis);
    expect(
      new THREE.Vector3(...g.topJunction)
        .sub(new THREE.Vector3(...g.head))
        .dot(axis),
    ).toBeLessThan(0);
    expect(
      new THREE.Vector3(...g.downJunction)
        .sub(new THREE.Vector3(...g.lower))
        .dot(axis),
    ).toBeGreaterThan(0);
    disposeModel(cockpit);
    disposeModel(frame);
  });
  it("keeps vertical and rearward slots open and through-axle bores distinct", () => {
    const g = componentGeometry(),
      fork = createFork(g),
      frame = createFrame(g, "#555555");
    fork.updateWorldMatrix(true, true);
    frame.updateWorldMatrix(true, true);
    const hit = (object: THREE.Object3D, x: number, y: number) =>
      new THREE.Raycaster(
        new THREE.Vector3(x, y, 1),
        new THREE.Vector3(0, 0, -1),
      ).intersectObject(object, false).length;
    const front = fork.getObjectByName("fork_dropout_1")!,
      rear = frame.getObjectByName("rear_dropout_1")!;
    expect(hit(front, g.front[0], -0.01)).toBe(0);
    expect(hit(front, g.front[0] + 0.011, 0.012)).toBeGreaterThan(0);
    expect(hit(rear, -0.01, 0)).toBe(0);
    expect(hit(rear, 0.012, 0.009)).toBeGreaterThan(0);
    expect(dropoutOutline("open-vertical", 0.01)).not.toEqual(
      dropoutOutline("through", 0.01),
    );
    disposeModel(fork);
    disposeModel(frame);
  });
});
