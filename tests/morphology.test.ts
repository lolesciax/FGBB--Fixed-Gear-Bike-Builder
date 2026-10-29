import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  componentGeometry,
  renderFrameSpecs,
  renderMorphologyId,
  frameMorphology,
  sectionDimensions,
  tubeSection,
  tubeSurfacePoint,
  productSchema,
  compatibility,
} from "@tracklab/domain";
import { seedCatalog, defaultConfiguration } from "../backend/src/catalog";
import { manufacturerCatalog } from "../backend/src/manufacturer-catalog";
import {
  createFrame,
  createFork,
} from "../frontend/src/features/builder/modeling/frame";
import { createSaddle } from "../frontend/src/features/builder/modeling/saddle";
import { disposeModel } from "../frontend/src/features/builder/modeling/primitives";
const profiled = manufacturerCatalog.filter(
  (p) => p.status === "published" && p.visual?.morphologyId,
);
describe("source-associated illustrative morphology", () => {
  it("keeps source frame anchors while differentiating tube, post, fork and rear plate construction", () => {
    for (const product of profiled)
      for (const variant of product.variants.filter((v) => !v.colorwayId)) {
        const specs = renderFrameSpecs(
            variant.specs,
            renderMorphologyId(product, variant),
          ),
          g = componentGeometry({ frameset: specs }),
          old = componentGeometry({ frameset: variant.specs });
        expect(g.frame).toEqual(old.frame);
        expect(g.morphology?.id).toBe(product.visual!.morphologyId);
        const frame = createFrame(g, "#777777"),
          fork = createFork(g),
          saddle = createSaddle(g);
        for (const region of ["top", "down", "seat"] as const) {
          const tube = frame.getObjectByName("paint_" + region) as THREE.Mesh;
          expect(tube.geometry.getAttribute("position").count).toBeGreaterThan(
            100,
          );
          expect(tube.userData.sectionProfile).toBe(
            g.morphology!.tubes[region].kind,
          );
        }
        expect(frame.getObjectByName("seat_collar")).toBeTruthy();
        expect(saddle.getObjectByName("seatpost_collar")).toBeUndefined();
        const positions = (
          fork.getObjectByName("fork_blade_1") as THREE.Mesh
        ).geometry.getAttribute("position");
        const crown = (
          fork.getObjectByName("fork_crown") as THREE.Mesh
        ).geometry.getAttribute("position");
        fork.updateWorldMatrix(true, true);
        for (const side of [-1, 1]) {
          const blade = fork.getObjectByName(
              `fork_blade_${side}`,
            ) as THREE.Mesh,
            ring = side === 1 ? 24 * 17 : 0;
          for (let j = 0; j < 16; j++) {
            const point = new THREE.Vector3()
              .fromBufferAttribute(positions, j)
              .applyMatrix4(blade.matrixWorld);
            const separation = Math.min(
              ...Array.from({ length: 17 }, (_, k) =>
                point.distanceTo(
                  new THREE.Vector3().fromBufferAttribute(crown, ring + k),
                ),
              ),
            );
            expect(separation).toBeLessThan(0.0007);
          }
        }
        for (let i = 0; i < positions.count; i++) {
          const r = Math.hypot(
            positions.getX(i) - g.front[0],
            positions.getY(i),
          );
          if (r > g.wheel.bsd / 2 - 0.002 && r < g.wheel.radius - 0.001)
            expect(Math.abs(positions.getZ(i))).toBeGreaterThan(
              g.wheel.width / 2 + 0.001,
            );
        }
        if (g.morphology?.seatRelief)
          for (let i = 0; i <= 32; i++)
            for (let j = 0; j < 24; j++) {
              const p = tubeSurfacePoint(g, "seat", i / 32, (j * Math.PI) / 12);
              expect(
                Math.hypot(p[0] - g.rear[0], p[1] - g.rear[1]),
              ).toBeGreaterThanOrEqual(
                g.nominalBsd / 2 + g.nominalClearance + 0.00299,
              );
            }
        disposeModel(frame);
        disposeModel(fork);
        disposeModel(saddle);
      }
  });
  it("uses outward surfaces, a real blade post and matching opening rather than a duplicated round post", () => {
    const p = profiled.find((p) => p.id === "cinelli-vigorelli")!,
      v = p.variants[2],
      g = componentGeometry({
        frameset: renderFrameSpecs(v.specs, p.visual!.morphologyId),
      }),
      frame = createFrame(g, "#555555"),
      saddle = createSaddle(g);
    const top = frame.getObjectByName("paint_top") as THREE.Mesh,
      positions = top.geometry.getAttribute("position"),
      normal = top.geometry.getAttribute("normal"),
      i = 8 * 24;
    const center = tubeSurfacePoint(g, "top", 0.5, 0).map(
      (x, k) => (x + tubeSurfacePoint(g, "top", 0.5, Math.PI)[k]) / 2,
    ) as [number, number, number];
    expect(
      new THREE.Vector3()
        .fromBufferAttribute(normal, i)
        .dot(
          new THREE.Vector3()
            .fromBufferAttribute(positions, i)
            .sub(new THREE.Vector3(...center)),
        ),
    ).toBeGreaterThan(0);
    const post = saddle.getObjectByName("seatpost") as THREE.Mesh,
      points = post.geometry.getAttribute("position"),
      depth = new THREE.Vector3(g.seatAxis[1], -g.seatAxis[0], 0),
      base = new THREE.Vector3(...g.seat).addScaledVector(
        new THREE.Vector3(...g.seatAxis),
        -0.025,
      ),
      values = [];
    for (let j = 0; j < 24; j++)
      values.push(
        new THREE.Vector3().fromBufferAttribute(points, j).sub(base).dot(depth),
      );
    expect(Math.max(...values) - Math.min(...values)).toBeCloseTo(0.044, 5);
    expect(post.userData.profile).toBe("dedicated-aero");
    expect(sectionDimensions(tubeSection(g, "seat"), 1).depth).toBeGreaterThan(
      50,
    );
    disposeModel(frame);
    disposeModel(saddle);
  });
  it("preserves listed round post diameter through normalized renderer inputs and distinguishes aero interfaces", () => {
    const p = profiled.find((p) => p.id === "skream-magnum")!,
      v = p.variants[0],
      g = componentGeometry({
        frameset: renderFrameSpecs(v.specs, p.visual!.morphologyId),
      });
    expect(g.saddle.postDiameter).toBeCloseTo(0.0316);
    expect(g.saddlePost[1] - g.seat[1]).toBeLessThan(0.13);
    const catalog = structuredClone(seedCatalog),
      s = catalog.find((p) => p.id === "studio-race")!.variants[0].specs;
    s.postDiameter = 27.2;
    const result = compatibility(
      { ...defaultConfiguration, frameset: "cinelli-vigorelli-rainbow-m" },
      catalog,
    );
    expect(result.rules.find((r) => r.id === "frame-seatpost")?.state).toBe(
      "incompatible",
    );
    expect(result.rules.find((r) => r.id === "saddle-rails")?.state).toBe(
      "unverified",
    );
  });
  it("retains edited legacy registrations and keeps unsupported generations draft", () => {
    const p = structuredClone(
        profiled.find((p) => p.id === "cinelli-vigorelli")!,
      ),
      v = p.variants[0];
    expect(renderMorphologyId(p, v)).toBe("cinelli-vigorelli-alu-v1");
    delete v.asset3D!.morphologyId;
    expect(renderMorphologyId(p, v)).toBeUndefined();
    p.visual!.morphologyId = "leader-735-2024-v1";
    expect(productSchema.safeParse(p).success).toBe(false);
    for (const id of [
      "leader-735",
      "tsunami-snm100",
      "cinelli-vigorelli-steel",
    ])
      expect(manufacturerCatalog.find((p) => p.id === id)?.status).toBe(
        "draft",
      );
    expect(frameMorphology("leader-735-2024-v1")?.tubes.top.kind).toBe(
      "custom",
    );
    expect(frameMorphology("tsunami-snm100-standard-v1")?.fork.kind).toBe(
      "alloy-straight",
    );
  });
});
