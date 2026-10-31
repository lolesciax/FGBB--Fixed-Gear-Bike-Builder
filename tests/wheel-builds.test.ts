import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  componentGeometry,
  wheelBuild,
  spokeEndpoints,
  compatibility,
  wheelSpokeOptions,
} from "@tracklab/domain";
import { Bike2D } from "@tracklab/domain/svg";
import { seedCatalog, defaultConfiguration } from "../backend/src/catalog";
import { createWheel } from "../frontend/src/features/builder/modeling/wheel";
import { disposeModel } from "../frontend/src/features/builder/modeling/primitives";
const specs = seedCatalog.find((p) => p.id === "studio-20-24")!.variants[0]
  .specs;
describe("complete wheel build variants", () => {
  it("offers only registered matching designs and preserves every demo rim depth at all three counts", () => {
    for (const product of seedCatalog.filter(
      (p) => p.slot === "wheels" && p.illustrative,
    )) {
      const options = wheelSpokeOptions(product, product.variants[0]);
      expect(options.map((o) => [o.front, o.rear])).toEqual([
        [20, 24],
        [32, 32],
        [36, 36],
      ]);
      for (const { variant, front, rear } of options) {
        expect(variant.specs.rimDepth).toBe(product.variants[0].specs.rimDepth);
        const g = componentGeometry({ wheels: variant.specs });
        for (const isRear of [false, true]) {
          const root = createWheel(g, isRear),
            count = isRear ? rear : front,
            bridge = root.getObjectByName("rim_drilled_bridge") as THREE.Mesh,
            p = bridge.geometry.getAttribute("position");
          expect(
            (root.getObjectByName("laced_spokes") as THREE.InstancedMesh).count,
          ).toBe(count);
          expect(
            (root.getObjectByName("spoke_nipples") as THREE.InstancedMesh)
              .count,
          ).toBe(count);
          expect(wheelBuild(variant.specs, isRear)).toMatchObject({
            count,
            errors: [],
            missing: [],
          });
          let minimumCentroid = Infinity;
          for (let i = 0; i < p.count; i += 3)
            minimumCentroid = Math.min(
              minimumCentroid,
              Math.hypot(
                (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3,
                (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3,
              ),
            );
          expect(minimumCentroid).toBeGreaterThan(g.wheel.rimInner - 0.0002);
          root.updateWorldMatrix(true, true);
          const s = spokeEndpoints(g.wheel, isRear)[0],
            a = Math.atan2(s.rim[1], s.rim[0]),
            ray = (angle: number) =>
              new THREE.Raycaster(
                new THREE.Vector3(
                  Math.cos(angle) * (g.wheel.rimInner - 0.01),
                  Math.sin(angle) * (g.wheel.rimInner - 0.01),
                  s.rim[2],
                ).add(root.position),
                new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0),
              ).intersectObject(bridge, false);
          expect(ray(a)).toHaveLength(0);
          expect(ray(a + 0.03).length).toBeGreaterThan(0);
          const bridgeNormals = bridge.geometry.getAttribute("normal");
          let maximumNormalError = 0,
            radialVertices = 0;
          for (let i = 0; i < p.count; i++) {
            const radial =
              (p.getX(i) * bridgeNormals.getX(i) +
                p.getY(i) * bridgeNormals.getY(i)) /
              Math.hypot(p.getX(i), p.getY(i));
            if (Math.abs(radial) > 0.8) {
              maximumNormalError = Math.max(
                maximumNormalError,
                Math.abs(1 - Math.abs(radial)),
              );
              radialVertices++;
            }
          }
          expect(radialVertices).toBeGreaterThan(1000);
          expect(maximumNormalError).toBeLessThan(0.000001);
          const rim = root.getObjectByName("rim_profile") as THREE.Mesh,
            n = rim.geometry.getAttribute("normal"),
            pos = rim.geometry.getAttribute("position");
          // Outside wall normals face out; the wheel interior stays open.
          expect(
            Array.from(
              { length: n.count },
              (_, i) => pos.getX(i) * n.getX(i) + pos.getY(i) * n.getY(i),
            ).some((dot) => dot > 0.1),
          ).toBe(true);
          expect(
            new THREE.Raycaster(
              new THREE.Vector3(0.12, 0, 1).add(root.position),
              new THREE.Vector3(0, 0, -1),
            ).intersectObject(rim, false),
          ).toHaveLength(0);
          disposeModel(root);
        }
        const svg = renderToStaticMarkup(
          createElement(Bike2D, {
            catalog: seedCatalog,
            configuration: { ...defaultConfiguration, wheels: variant.id },
          }),
        );
        expect(svg.match(/data-spoke=/g)).toHaveLength(front + rear);
      }
    }
    const product = structuredClone(
      seedCatalog.find((p) => p.id === "studio-deep")!,
    );
    product.illustrative = false;
    product.variants = product.variants.filter((v) => v.id.endsWith("-20-24"));
    expect(
      wheelSpokeOptions(product, product.variants[0]).map((o) => [
        o.front,
        o.rear,
      ]),
    ).toEqual([[20, 24]]);
    product.variants.push({
      ...structuredClone(product.variants[0]),
      id: "wrong-depth",
      specs: {
        ...product.variants[0].specs,
        rimDepth: 25,
        frontSpokeCount: 36,
        rearSpokeCount: 36,
        frontHubDrilling: 36,
        frontRimDrilling: 36,
        rearHubDrilling: 36,
        rearRimDrilling: 36,
      },
    });
    expect(wheelSpokeOptions(product, product.variants[0])).toHaveLength(1);
    product.variants.push({
      ...structuredClone(product.variants[1]),
      id: "archived-build",
      status: "archived",
      specs: { ...product.variants[1].specs, rimDepth: 60 },
    });
    expect(wheelSpokeOptions(product, product.variants[0])).toHaveLength(1);
  });
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
  it("uses tapered end caps seated symmetrically against both hub contact faces", () => {
    for (const isRear of [false, true]) {
      const g = componentGeometry({ wheels: specs });
      const root = createWheel(g, isRear);
      const spacing = isRear ? g.wheel.rearSpacing : g.wheel.frontSpacing;
      root.updateWorldMatrix(true, true);
      for (const side of [-1, 1]) {
        const cap = root.getObjectByName(`hub_endcap_${side}`) as THREE.Mesh;
        const bounds = new THREE.Box3().setFromObject(cap);
        expect(side * (side === 1 ? bounds.max.z : bounds.min.z) -
          (isRear ? g.rear[2] : g.front[2])).toBeCloseTo(spacing / 2, 6);
        expect(bounds.max.x - bounds.min.x).toBeCloseTo(0.019, 5);
        const z = cap.geometry.getAttribute("position");
        const radii = Array.from({ length: z.count }, (_, i) =>
          Math.hypot(z.getX(i), z.getY(i)),
        );
        expect(Math.max(...radii)).toBeGreaterThan(0.009);
        expect(Math.min(...radii)).toBeGreaterThan(0.002);
      }
      const rim = root.getObjectByName("rim_profile") as THREE.Mesh;
      const vertices = rim.geometry.getAttribute("position");
      const radii = Array.from({ length: vertices.count }, (_, i) =>
        Math.hypot(vertices.getX(i), vertices.getY(i)),
      );
      expect(Math.min(...radii)).toBeCloseTo(g.wheel.rimInner, 5);
      expect(Math.max(...radii)).toBeCloseTo(g.wheel.rimOuter, 5);
      disposeModel(root);
    }
  });

});
