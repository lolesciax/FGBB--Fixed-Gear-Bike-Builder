import { describe, it, expect } from "vitest";
import {
  colorwayIssues,
  productSchema,
  selectedColorway,
  geometrySignature,
  withHistoricalCatalog,
  stopsFor,
  finishAnchors,
  validateConfiguration,
  type GraphicLayer,
} from "@tracklab/domain";
import { manufacturerCatalog } from "../backend/src/manufacturer-catalog";
import { seedCatalog, defaultConfiguration } from "../backend/src/catalog";
import { createFrame } from "../frontend/src/features/builder/modeling/frame";
import { componentGeometry } from "@tracklab/domain";
import {
  prepareFinish,
  finishTargets,
} from "../frontend/src/features/builder/finish-materials";
import { projectGraphic } from "../frontend/src/features/builder/FinishGraphics";
import { disposeModel } from "../frontend/src/features/builder/modeling/primitives";
const cinelli = manufacturerCatalog.find((p) => p.id === "cinelli-vigorelli")!;
const ranger = manufacturerCatalog.find((p) => p.id === "skream-ranger")!;
const vector: GraphicLayer = {
  id: "original-calibration",
  zone: "down",
  side: "both",
  from: 0.25,
  to: 0.65,
  width: 200,
  height: 20,
  license: "CC0-1.0",
  evidence: "https://example.com/original-calibration",
  permission: "confirmed",
  paths: [{ d: "M0 0H200V20H0Z", fill: "#ffffff" }],
};
describe("versioned model colorways", () => {
  it("validates model-specific records and preserves every legacy variant without guessing model years", () => {
    const ids = new Set<string>();
    for (const p of manufacturerCatalog) {
      expect(productSchema.safeParse(p).success).toBe(true);
      expect(colorwayIssues(p)).toEqual([]);
      for (const v of p.variants) {
        expect(ids.has(v.id)).toBe(false);
        ids.add(v.id);
        if (v.colorwayId) {
          const c = selectedColorway(p, v)!;
          expect(c.productId).toBe(p.id);
          expect(c.sizes).toContain(String(v.specs.size));
          expect(c.missingGraphics.length).toBeGreaterThan(0);
          expect(c.graphics).toEqual([]);
          expect(c.manufacturerYear).toBe(p.year);
        }
      }
    }
    expect(
      cinelli.variants.find((v) => v.id === "cinelli-vigorelli-rainbow-m")
        ?.colorwayId,
    ).toBeUndefined();
    expect(cinelli.colorways?.map((c) => c.name)).toEqual([
      "80s National Blu",
      "Rainbow",
      "Special White",
    ]);
  });
  it("reuses only identical size geometry and keeps the sourced Falcon L discrepancy explicit", () => {
    for (const p of manufacturerCatalog)
      for (const v of p.variants)
        if (v.geometryVariantId) {
          const base = p.variants.find((b) => b.id === v.geometryVariantId)!;
          expect(geometrySignature(v)).toBe(geometrySignature(base));
          expect(v.asset3D).toEqual(base.asset3D);
        }
    const p = manufacturerCatalog.find((p) => p.id === "dosnoventa-03-det")!,
      falcon = p.variants.find(
        (v) => v.id === "dosnoventa-03-det-falcon-l-v1",
      )!;
    expect(falcon.specs.seatTube).toBe(590);
    expect(
      p.variants.find((v) => v.id === "dosnoventa-03-det-l")?.specs.seatTube,
    ).toBe(580);
    expect(falcon.geometryVariantId).toBeUndefined();
    expect(falcon.asset3D).toBeUndefined();
  });
  it("maps actual two-tone and blue/cyan paint without fabricating Rainbow graphics", () => {
    const forest = ranger.colorways!.find((c) => c.name === "Forest")!;
    expect(
      stopsFor(forest, "seat", forest.paint.color).map((s) => s.color),
    ).toContain("#b7a07b");
    expect(
      stopsFor(forest, "fork", forest.paint.color).every(
        (s) => s.color === forest.paint.color,
      ),
    ).toBe(true);
    const rainbow = cinelli.colorways!.find((c) => c.name === "Rainbow")!;
    expect(rainbow.regions).toEqual([]);
    expect(rainbow.graphics).toEqual([]);
    expect(rainbow.limitations).toContain("no full-frame rainbow");
  });
  it("rejects wrong-model/size, unsafe artwork and unsupported fidelity assertions", () => {
    const p = structuredClone(cinelli),
      c = p.colorways![0];
    c.productId = "another-model";
    expect(colorwayIssues(p).join()).toContain("wrong model");
    c.productId = p.id;
    c.sizes = ["NOT-A-SIZE"];
    expect(colorwayIssues(p).join()).toContain("size mismatch");
    c.sizes = ["XS", "S", "M", "L", "XL"];
    c.graphics = [vector, vector];
    expect(colorwayIssues(p).join()).toContain("duplicate graphic");
    c.graphics = [{ ...vector, permission: "pending" }];
    expect(colorwayIssues(p).join()).toContain("permission");
    c.graphics = [];
    c.fidelity = "licensed-authentic";
    expect(colorwayIssues(p).join()).toContain("cannot certify");
    c.fidelity = "approximate";
    c.graphics = [
      {
        ...vector,
        paths: [{ d: "<script>alert(1)</script>", fill: "#ffffff" }],
      },
    ];
    expect(productSchema.safeParse(p).success).toBe(false);
  });
  it("keeps archived appearances out of new configurations while pinning saved definitions", () => {
    const original = structuredClone(cinelli),
      v = original.variants.find(
        (v) => v.colorwayId === original.colorways![0].id,
      )!,
      old = selectedColorway(original, v)!;
    const current = structuredClone(original);
    current.colorways![0].paint.color = "#ff0000";
    current.colorways![0].status = "archived";
    const merged = withHistoricalCatalog(
      [current],
      [{ ...original, variants: [v], colorways: [old] }],
    );
    expect(
      selectedColorway(
        merged[0],
        merged[0].variants.find((n) => n.id === v.id)!,
      )?.paint.color,
    ).toBe(old.paint.color);
    const catalog = seedCatalog.map((p) => (p.id === current.id ? current : p));
    expect(() =>
      validateConfiguration(
        { ...defaultConfiguration, frameset: v.id },
        catalog,
      ),
    ).toThrow();
    expect(() =>
      validateConfiguration(
        { ...defaultConfiguration, frameset: v.id },
        catalog,
        true,
      ),
    ).not.toThrow();
  });
  it("prepares independent physical region targets and projects both-side artwork onto actual tubes", () => {
    const variant = ranger.variants.find(
        (v) => v.id === "skream-ranger-forest-m-v1",
      )!,
      c = selectedColorway(ranger, variant)!,
      frame = createFrame(
        componentGeometry({ frameset: variant.specs }),
        "#333333",
      ),
      before = frame.children[0].uuid;
    const items = prepareFinish(frame, variant.specs);
    expect(items.some((i) => i.zone === "fork")).toBe(true);
    expect(
      finishTargets(
        items.find((i) => i.zone === "seat")!,
        c,
        variant.color,
      ).stops.length,
    ).toBe(4);
    expect(
      finishTargets(
        items.find((i) => i.zone === "fork")!,
        c,
        variant.color,
      ).stops.every((s) => s.color === c.paint.color),
    ).toBe(true);
    expect(frame.children[0].uuid).toBe(before);
    for (const side of [-1, 1]) {
      const decal = projectGraphic(frame, variant.specs, vector, side);
      expect(decal).not.toBeNull();
      const pos = decal!.getAttribute("position");
      expect(pos.count).toBeGreaterThan(0);
      for (let i = 0; i < pos.count; i++)
        expect(Math.sign(pos.getZ(i))).toBe(side);
      const uv = decal!.getAttribute("uv"),
        [a, b] = finishAnchors(variant.specs).down;
      // Reading direction must reverse along the world tube axis on the back
      // side, so the same original artwork reads normally from either camera.
      const sample = Array.from({ length: pos.count }, (_, i) => ({
        u: uv.getX(i),
        along: pos.getX(i) * (b[0] - a[0]) + pos.getY(i) * (b[1] - a[1]),
      }));
      const meanU = sample.reduce((s, v) => s + v.u, 0) / sample.length,
        meanAlong = sample.reduce((s, v) => s + v.along, 0) / sample.length;
      expect(
        side *
          sample.reduce((s, v) => s + (v.u - meanU) * (v.along - meanAlong), 0),
      ).toBeGreaterThan(0);
      decal!.dispose();
    }
    disposeModel(frame);
  });
});
