import { describe, it, expect } from "vitest";
import {
  configurationSchema,
  compatibility,
  componentGeometry,
  finishOptions,
  appearanceIssues,
  validateConfiguration,
  componentPaint,
  finishGradient,
  productSchema,
  componentPresets,
} from "@tracklab/domain";
import { seedCatalog, defaultConfiguration } from "../backend/src/catalog";
describe("controlled component appearances", () => {
  it("keeps old six-slot configurations valid and restricts overrides to actual product support", () => {
    expect(configurationSchema.parse(defaultConfiguration)).toEqual(
      defaultConfiguration,
    );
    const wheel = seedCatalog.find((p) => p.id === "studio-classic")!;
    expect(finishOptions(wheel, wheel.variants[0], "wheelset")).toEqual([
      "polished",
      "pure-black",
    ]);
    expect(
      appearanceIssues(
        { ...defaultConfiguration, appearance: { wheelset: "brand" } },
        seedCatalog,
      ),
    ).toHaveLength(1);
    expect(() =>
      validateConfiguration(
        { ...defaultConfiguration, appearance: { wheelset: "brand" } },
        seedCatalog,
      ),
    ).toThrow("does not support");
    expect(
      configurationSchema.safeParse({
        ...defaultConfiguration,
        appearance: { frame: "polished" },
      }).success,
    ).toBe(false);
    const fixed = { ...wheel, illustrative: false };
    expect(finishOptions(fixed, fixed.variants[0], "wheelset")).toEqual([]);
    const registered = structuredClone(fixed);
    registered.variants[0].componentFinishes = [
      {
        zone: "wheelset",
        options: ["brand"],
        brand: {
          ...componentPresets.polished,
          color: "#645e89",
          name: "Source-reviewed fixture",
          source: "https://example.com/exact-variant",
        },
      },
    ];
    expect(
      finishOptions(registered, registered.variants[0], "wheelset"),
    ).toEqual(["brand"]);
    expect(
      componentPaint(registered, registered.variants[0], "wheelset", "brand")
        ?.color,
    ).toBe("#645e89");
    expect(
      componentPaint(registered, registered.variants[0], "wheelset")?.color,
    ).toBe("#645e89");
    delete registered.variants[0].componentFinishes[0].brand;
    expect(productSchema.safeParse(registered).success).toBe(false);
  });
  it("changes cosmetic material/shading while preserving structural validation", () => {
    const configuration = {
      ...defaultConfiguration,
      appearance: {
        wheelset: "polished" as const,
        crankArms: "pure-black" as const,
        chainring: "polished" as const,
        stem: "polished" as const,
        handlebar: "pure-black" as const,
        seatpost: "polished" as const,
      },
    };
    expect(() =>
      validateConfiguration(configuration, seedCatalog),
    ).not.toThrow();
    expect(compatibility(configuration, seedCatalog)).toEqual(
      compatibility(defaultConfiguration, seedCatalog),
    );
    expect(finishGradient(componentPresets.polished)).not.toEqual(
      finishGradient(componentPresets["pure-black"]),
    );
    for(const stop of finishGradient(componentPresets['pure-black']))expect(Math.max(...[1,3,5].map(i=>parseInt(stop.color.slice(i,i+2),16)))).toBeLessThan(100);
  });
  it("separates saddle rails from every frame post diameter and renders the correct post", () => {
    for (const seatpost of [27.2, 30.9, 31.6])
      for (const saddle of [
        "studio-race",
        "studio-race-316",
        "studio-comfort",
      ]) {
        const catalog = structuredClone(seedCatalog),
          frame = catalog
            .find((p) => p.id === "studio-track")!
            .variants.find((v) => v.id === defaultConfiguration.frameset)!;
        frame.specs.seatpost = seatpost;
        const config = { ...defaultConfiguration, saddle },
          result = compatibility(config, catalog);
        expect(result.rules.find((r) => r.id === "saddle-rails")?.state).toBe(
          "unverified",
        );
        const spec = catalog.find((p) =>
          p.variants.some((v) => v.id === saddle),
        )!.variants[0].specs;
        expect(
          componentGeometry({ frameset: frame.specs, saddle: spec }).saddle
            .postDiameter,
        ).toBe(seatpost / 1000);
      }
    const catalog = structuredClone(seedCatalog),
      saddle = catalog.find((p) => p.id === "studio-race")!.variants[0];
    saddle.specs.railInterface = "oval-7x9";
    saddle.specs.clampInterface = "round-7";
    expect(
      compatibility(defaultConfiguration, catalog).rules.find(
        (r) => r.id === "saddle-rails",
      )?.state,
    ).toBe("incompatible");
  });
});
