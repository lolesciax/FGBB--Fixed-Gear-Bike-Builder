import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  componentGeometry,
  wheelBuild,
  spokeEndpoints,
  compatibility,
} from "@tracklab/domain";
import { Bike2D } from "@tracklab/domain/svg";
import { seedCatalog, defaultConfiguration } from "../backend/src/catalog";
import { createWheel } from "../frontend/src/features/builder/modeling/wheel";
import { disposeModel } from "../frontend/src/features/builder/modeling/primitives";
const specs = seedCatalog.find((p) => p.id === "studio-20-24")!.variants[0]
  .specs;
describe("complete wheel build variants", () => {
  it("preserves 32/32 fallbacks and creates exactly 20 radial front and 24 two-cross rear spokes", () => {
    for (const id of ["studio-classic", "studio-deep", "studio-classic-m9"])
      for (const rear of [false, true])
        expect(
          wheelBuild(
            seedCatalog.find((p) => p.id === id)!.variants[0].specs,
            rear,
          ).count,
        ).toBe(32);
    const g = componentGeometry({ wheels: specs });
    for (const rear of [false, true]) {
      const endpoints = spokeEndpoints(g.wheel, rear),
        count = rear ? 24 : 20,
        root = createWheel(g, rear);
      expect(endpoints).toHaveLength(count);
      expect(
        (root.getObjectByName("laced_spokes") as THREE.InstancedMesh).count,
      ).toBe(count);
      expect(
        (root.getObjectByName("spoke_nipples") as THREE.InstancedMesh).count,
      ).toBe(count);
      for (const side of [-1, 1])
        expect(
          new Set(
            endpoints
              .filter((s) => s.side === side)
              .map((s) =>
                s.hub
                  .slice(0, 2)
                  .map((v) => v.toFixed(7))
                  .join(","),
              ),
          ).size,
        ).toBe(count / 2);
      if (!rear)
        for (const s of endpoints)
          expect(s.hub[0] * s.rim[1] - s.hub[1] * s.rim[0]).toBeCloseTo(0, 9);
      const first = endpoints[0],
        flange = root.getObjectByName("hub_flange_1") as THREE.Mesh;
      root.updateWorldMatrix(true, true);
      const origin = new THREE.Vector3(first.hub[0], first.hub[1], 1).add(
        root.position,
      );
      expect(
        new THREE.Raycaster(
          origin,
          new THREE.Vector3(0, 0, -1),
        ).intersectObject(flange, false),
      ).toHaveLength(0);
      const bridge = root.getObjectByName("rim_drilled_bridge")!,
        a = Math.atan2(first.rim[1], first.rim[0]);
      const ray = (angle: number) =>
        new THREE.Raycaster(
          new THREE.Vector3(
            Math.cos(angle) * (g.wheel.rimInner - 0.01),
            Math.sin(angle) * (g.wheel.rimInner - 0.01),
            first.rim[2],
          ).add(root.position),
          new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0),
        ).intersectObject(bridge, false);
      expect(ray(a)).toHaveLength(0);
      expect(ray(a + 0.03).length).toBeGreaterThan(0);
      const positions = (bridge as THREE.Mesh).geometry.getAttribute(
        "position",
      );
      for (let i = 0; i < positions.count; i += 3) {
        const x =
            (positions.getX(i) +
              positions.getX(i + 1) +
              positions.getX(i + 2)) /
            3,
          y =
            (positions.getY(i) +
              positions.getY(i + 1) +
              positions.getY(i + 2)) /
            3;
        expect(Math.hypot(x, y)).toBeGreaterThan(g.wheel.rimInner - 0.0002);
      }
      const rim = (root.getObjectByName("rim_profile") as THREE.Mesh).material,
        spokes = (root.getObjectByName("laced_spokes") as THREE.Mesh).material,
        hub = (root.getObjectByName("hub_shell") as THREE.Mesh).material;
      expect(rim).not.toBe(spokes);
      expect(spokes).not.toBe(hub);
      disposeModel(root);
    }
  });
  it("rejects drilling conflicts and unsupported counts or lacing without silently certifying defaults", () => {
    expect(wheelBuild(specs).errors).toEqual([]);
    expect(wheelBuild(specs, true).missing).toEqual([]);
    expect(
      wheelBuild({ ...specs, rearHubDrilling: 32 }, true).errors,
    ).toHaveLength(1);
    expect(
      wheelBuild({ ...specs, frontSpokeCount: 21 }).errors.length,
    ).toBeGreaterThan(0);
    expect(
      wheelBuild({ ...specs, frontLacing: "toString" }).errors,
    ).toHaveLength(1);
    expect(wheelBuild({}).missing.length).toBeGreaterThan(0);
    const catalog = structuredClone(seedCatalog);
    catalog.find(
      (p) => p.id === "studio-20-24",
    )!.variants[0].specs.frontRimDrilling = 24;
    expect(
      compatibility(
        { ...defaultConfiguration, wheels: "studio-20-24" },
        catalog,
      ).rules.find((r) => r.id === "front-wheel-build")?.state,
    ).toBe("incompatible");
  });
  it("draws actual independent spoke counts in the exported SVG", () => {
    const svg = renderToStaticMarkup(
      createElement(Bike2D, {
        catalog: seedCatalog,
        configuration: { ...defaultConfiguration, wheels: "studio-20-24" },
      }),
    );
    expect(svg.match(/data-spoke=/g)).toHaveLength(44);
    expect(svg).toContain('data-spoke-count="20"');
    expect(svg).toContain('data-spoke-count="24"');
  });
});
