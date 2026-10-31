import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  saddleRailFit,
  saddleRailPoints,
  saddleSurfacePoint,
  componentGeometry,
  compatibility,
} from "@tracklab/domain";
import { seedCatalog, defaultConfiguration } from "../backend/src/catalog";
import { createSaddle } from "../frontend/src/features/builder/modeling/saddle";
import { disposeModel } from "../frontend/src/features/builder/modeling/primitives";
describe("separate post and saddle interfaces", () => {
  it("requires documented rail types and dimensions, including proprietary support", () => {
    expect(saddleRailFit({}).state).toBe("unverified");
    expect(
      saddleRailFit({ railInterface: "unknown", clampInterface: "unknown" })
        .state,
    ).toBe("unverified");
    for (const value of ["round-7", "oval-7x9", "proprietary:fixture-a"])
      expect(
        saddleRailFit({ railInterface: value, clampInterface: value }).state,
      ).toBe("compatible");
    for (const [rail, clamp] of [
      ["round-7", "oval-7x9"],
      ["oval-7x9", "oval-7x10"],
      ["proprietary:fixture-a", "proprietary:fixture-b"],
    ])
      expect(
        saddleRailFit({ railInterface: rail, clampInterface: clamp }).state,
      ).toBe("incompatible");
    expect(
      saddleRailFit({
        railType: "oval",
        clampRailType: "oval",
        railWidth: 7,
        clampRailWidth: 7,
      }).state,
    ).toBe("unverified");
  });
  it("checks an explicitly selected post against the frame without using legacy bundled saddle diameters", () => {
    const catalog = structuredClone(seedCatalog),
      s = catalog.find((p) => p.id === "studio-race")!.variants[0].specs;
    s.railInterface = s.clampInterface = "round-7";
    s.postDiameter = 31.6;
    const result = compatibility(defaultConfiguration, catalog);
    expect(result.rules.find((r) => r.id === "saddle-rails")?.state).toBe(
      "compatible",
    );
    expect(result.rules.find((r) => r.id === "frame-seatpost")?.state).toBe(
      "incompatible",
    );
    expect(
      componentGeometry({ frameset: { seatpost: 27.2 }, saddle: s }).saddle
        .postDiameter,
    ).toBe(0.0316);
    delete s.postDiameter;
    expect(
      componentGeometry({ frameset: { seatpost: 30.9 }, saddle: s }).saddle
        .postDiameter,
    ).toBeCloseTo(0.0309,10);
    expect(
      compatibility(defaultConfiguration, catalog).rules.find(
        (r) => r.id === "frame-seatpost",
      )?.state,
    ).toBe("unverified");
  });
  it("joins rails to the shell and leaves real round or oval grooves through the split clamp", () => {
    for (const railInterface of ["round-7", "oval-7x9"]) {
      const g = componentGeometry({ saddle: { railInterface } }),
        root = createSaddle(g);
      for(const u of [0,1])expect(saddleSurfacePoint(g.saddle,u,0,'cover')).toEqual(saddleSurfacePoint(g.saddle,u,0,'shell'));
      root.updateWorldMatrix(true, true);
      for (const side of [-1, 1]) {
        const points = saddleRailPoints(g.saddle, side);
        for (const p of [points[0], points.at(-1)!])
          expect(p[1] + g.saddle.railHeight / 2).toBeGreaterThan(
            saddleSurfacePoint(
              g.saddle,
              p[0] / g.saddle.length + 0.52,
              Math.PI * 1.5,
              "shell",
            )[1],
          );
        const ray = (offset: number) =>
          new THREE.Raycaster(
            new THREE.Vector3(
              g.saddleClamp[0] - 0.1,
              g.saddleClamp[1] + offset,
              side * 0.022,
            ),
            new THREE.Vector3(1, 0, 0),
          ).intersectObjects(
            [
              root.getObjectByName("rail_clamp")!,
              root.getObjectByName("rail_clamp_upper")!,
            ],
            false,
          );
        expect(ray(0)).toHaveLength(0);
        expect(ray(-g.saddle.railHeight / 2 - 0.001).length).toBeGreaterThan(0);
      }
      const cover = root.getObjectByName("shaped_padding") as THREE.Mesh;
      expect((cover.material as THREE.MeshStandardMaterial).metalness).toBe(0);
      disposeModel(root);
    }
  });
  it("supports the actual two-rail clamp footprint with the post head", () => {
    for (const railInterface of ["round-7", "oval-7x9"]) {
      const g = componentGeometry({ saddle: { railInterface } });
      const root = createSaddle(g);
      root.updateWorldMatrix(true, true);
      const head = root.getObjectByName("seatpost_head")!;
      const bounds = new THREE.Box3().setFromObject(head);
      const railOuter = 0.022 + g.saddle.railWidth / 2;
      expect(bounds.min.z).toBeLessThan(-railOuter);
      expect(bounds.max.z).toBeGreaterThan(railOuter);
      expect(bounds.max.y).toBeGreaterThan(g.saddleClamp[1] - 0.002);
      expect(head.userData.interface).toBe("two-rail-cradle");
      disposeModel(root);
    }
  });

});
