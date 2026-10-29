import { expect, it } from "vitest";
import {
  assemblyGeometry,
  compatibility,
  visualizationInfo,
  productSchema,
} from "@tracklab/domain";
import { seedCatalog, defaultConfiguration } from "../backend/src/catalog";
import { researchModels } from "../backend/src/modules/catalog/research-records";
import { expandedFramesets } from "../backend/src/modules/catalog/expanded-framesets";
it("uses distinct sourced Magnum and Ranger anchors and preserves uncertain interfaces", () => {
  const mag = expandedFramesets.find((p) => p.id === "skream-magnum")!,
    ranger = expandedFramesets.find((p) => p.id === "skream-ranger")!;
  const m = mag.variants.find((v) => v.specs.size === "M")!,
    r = ranger.variants.find((v) => v.specs.size === "M")!;
  expect(m.specs).toMatchObject({
    wheelbase: 974,
    chainstay: 393,
    tireClearance: 35,
    seatpost: 31.6,
  });
  expect(r.specs).toMatchObject({
    wheelbase: 1036,
    chainstay: 425,
    tireClearance: 43,
    frontBrakeType: "disc",
  });
  expect(m.specs.forkRake).toBeUndefined();
  expect(r.specs.axle).toBeUndefined();
  expect(assemblyGeometry(m.specs).front.x).toBe(974);
  expect(assemblyGeometry(r.specs).front.x).toBe(1036);
  expect(
    compatibility(
      { ...defaultConfiguration, frameset: m.id },
      seedCatalog,
    ).rules.find((r) => r.id === "saddle-rails")?.state,
  ).toBe("unverified");
  const repaired = compatibility(
    { ...defaultConfiguration, frameset: r.id, saddle: "studio-race-316" },
    seedCatalog,
  );
  expect(repaired.state).toBe("unverified");
  expect(repaired.rules.find((r) => r.id === "front-brake")?.state).toBe(
    "unverified",
  );
});
it("retains source boundaries, disputed values and explicit illustrative fidelity", () => {
  expect(researchModels).toHaveLength(30);
  for (const product of seedCatalog)
    expect(productSchema.safeParse(product).success).toBe(true);
  for (const product of expandedFramesets) {
    expect(
      new Set(
        product.variants.map((v) =>
          JSON.stringify(assemblyGeometry(v.specs).head),
        ),
      ).size,
    ).toBeGreaterThan(1);
    for (const variant of product.variants) {
      expect(variant.asset3D).toBeTruthy();
      expect(visualizationInfo(product, variant).fidelity).toBe(
        "Approximate illustrative model",
      );
    }
  }
  const state = expandedFramesets.find((p) => p.id === "state-black-label-v3")!
    .variants[2];
  expect(state.specs).toMatchObject({
    effectiveTopTube: 555,
    chainstay: 415,
    bbDrop: 68,
    tireClearance: 35,
  });
  expect(
    researchModels.find((m) => m.id === "tsunami-snm200")?.specificationStatus,
  ).toBe("unverified");
  expect(seedCatalog.find((p) => p.id === "engine11-crit-d")?.status).toBe(
    "draft",
  );
  expect(
    seedCatalog.find((p) => p.id === "leader-735")?.variants[0].specs.chainstay,
  ).toBeUndefined();
});
it("checks known wheel, axle, fork and chainring conflicts without approving unknown headset/brake standards", () => {
  const catalog = structuredClone(seedCatalog),
    frame = catalog
      .find((p) => p.id === "studio-track")!
      .variants.find((v) => v.id === defaultConfiguration.frameset)!;
  Object.assign(frame.specs, {
    wheelBsd: 584,
    frontAxleDiameter: 9,
    forkTireClearance: 23,
    maxChainring: 44,
  });
  catalog.find(
    (p) => p.id === "studio-classic",
  )!.variants[0].specs.frontAxleDiameter = 10;
  const result = compatibility(defaultConfiguration, catalog);
  for (const id of [
    "frame-wheel-diameter",
    "front-axle-diameter",
    "fork-clearance",
    "chainring-clearance",
  ])
    expect(result.rules.find((r) => r.id === id)?.state).toBe("incompatible");
  expect(result.rules.find((r) => r.id === "headset")?.state).toBe(
    "unverified",
  );
});
