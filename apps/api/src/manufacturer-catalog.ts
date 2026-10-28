import { registeredFrameAssets, type Product } from "@tracklab/domain";

const reviewedAt = "2026-10-27T13:50:00.000Z";
const visual: Product["visual"] = {
  assetId: "tracklab-parametric-v2",
  fidelity: "measurement-schematic",
  source: "TrackLab independently authored procedural SVG/Three.js geometry",
  license: "CC0-1.0",
  reviewedAt,
};
const limits =
  "Published measurements inform assembly anchors. Tube profiles, fork shape, component fit and paint appearance are illustrative. No authentic manufacturer SVG/GLB or logos are distributed. Missing interfaces remain unverified; stock and prices are not tracked.";
function frame(
  id: string,
  brand: string,
  name: string,
  source: string,
  variants: Product["variants"],
): Product {
  return {
    id,
    brand,
    name,
    slot: "frameset",
    status: "published",
    illustrative: false,
    catalogKind: "manufacturer",
    source,
    verifiedAt: reviewedAt,
    visual,
    description: `${name}: source-reviewed frameset variants with an independent measurement-based preview.`,
    acknowledgment: `${brand} names identify the product only. TrackLab is independent. ${limits}`,
    provenance: {
      reviewedAt,
      fields: [
        ...new Set(variants.flatMap((v) => Object.keys(v.specs))),
      ].filter((key) => !["geometry", "colorApproximate"].includes(key)),
      limitations: limits,
    },
    variants: variants.map(variant=>({...variant,...(registeredFrameAssets.find(asset=>asset.variantId===variant.id)?{asset3D:registeredFrameAssets.find(asset=>asset.variantId===variant.id)}:{})})),
  };
}
const laSource =
  "https://dosnoventabikes.com/frames/los-angeles/los-angeles-jet-black-frame/";
const detSource =
  "https://dosnoventabikes.com/frames/detroit/detroit-frame-true-silver-5/";
const bcnSource =
  "https://dosnoventabikes.com/frames/barcelona/dosnoventa01-bcn-fighter-blue-frameset/";
const dos = (
  id: string,
  name: string,
  source: string,
  finish: string,
  color: string,
  rows: number[][],
  steel = false,
) =>
  frame(
    id,
    "Dosnoventa",
    name,
    source,
    ["S", "M", "L"].map((size, i) => {
      const [
        seatTube,
        headTube,
        effectiveTopTube,
        headAngle,
        seatAngle,
        stack,
        reach,
        bbDrop,
        chainstay,
      ] = rows[i];
      return {
        id: `${id}-${size.toLowerCase()}`,
        label: `${size} / ${finish}`,
        color,
        specs: {
          size,
          finish,
          colorApproximate: true,
          material: steel ? "steel" : "7005-T6 alloy",
          seatpost: 27.2,
          bottomBracket: "BSA-68",
          tireClearance: name === "02 LA" ? 32 : 28,
          seatTube,
          headTube,
          effectiveTopTube,
          headAngle,
          seatAngle,
          ...(stack ? { stack, reach } : {}),
          bbDrop,
          chainstay,
          ...(steel ? {} : { forkRake: 45 }),
          geometry: name === "03 DET" ? "pursuit" : "track",
          headset: steel
            ? "1 inch ITA threaded"
            : "Columbus Compass 1-1/8 inch",
        },
      };
    }),
  );
export const manufacturerCatalog: Product[] = [
  // Sizes and dimensional tables transcribed from the official Americas product page.
  // Finish swatch is a neutral placeholder: Rainbow graphics are not reproduced.
  frame(
    "cinelli-vigorelli",
    "Cinelli",
    "Vigorelli",
    "https://usa.cinelli-milano.com/products/vigorelli-track-alu-frame",
    [
      ["XS", 520, 95, 73, 73.5, 478, 359, 914],
      ["S", 550, 115, 73, 74, 497, 384, 944],
      ["M", 570, 130, 73.5, 74, 514, 410, 968],
      ["L", 590, 145, 74, 74, 530, 435, 993],
      ["XL", 605, 160, 74, 73.5, 545, 460, 1022],
    ].map((row) => {
      const [
        size,
        seatTube,
        headTube,
        headAngle,
        seatAngle,
        stack,
        reach,
        wheelbase,
      ] = row;
      return {
        id: `cinelli-vigorelli-rainbow-${String(size).toLowerCase()}`,
        label: `${size} / Rainbow`,
        color: "#999da5",
        specs: {
          size: String(size),
          finish: "Rainbow",
          colorApproximate: true,
          material: "Columbus Airplane alloy",
          seatTube: Number(seatTube),
          headTube: Number(headTube),
          headAngle: Number(headAngle),
          seatAngle: Number(seatAngle),
          stack: Number(stack),
          reach: Number(reach),
          wheelbase: Number(wheelbase),
          chainstay: 377,
          bbDrop: 50,
          forkRake: 45,
          bottomBracket: "BSA-68",
          tireClearance: 28,
          seatpostInterface:
            "Dedicated aero seatpost; demo round post not verified",
          brakeMount: "caliper",
          geometry: "track",
        },
      };
    }),
  ),
  dos("dosnoventa-02-la", "02 LA", laSource, "Jet Black Gloss", "#242629", [
    [500, 110, 510, 73.5, 75, 481, 389, 41, 382],
    [540, 140, 535, 73.5, 75, 515, 396, 41, 382],
    [580, 180, 560, 73.5, 75, 553, 411, 41, 382],
  ]),
  dos("dosnoventa-03-det", "03 DET", detSource, "Jet Black Gloss", "#242629", [
    [510, 90, 505, 74, 76, 468, 388, 41, 382],
    [550, 110, 530, 74, 76, 487, 408, 41, 382],
    [580, 140, 565, 74, 76, 516, 436, 41, 382],
  ]),
  // BCN page publishes no stack/reach table. Approximate these anchors rather than invent measurements.
  dos(
    "dosnoventa-01-bcn",
    "01 BCN",
    bcnSource,
    "Fighter Blue Matt",
    "#406280",
    [
      [490, 97, 525, 73, 74.5, 0, 0, 48.5, 400],
      [520, 112, 535, 73, 74.5, 0, 0, 48.5, 400],
      [575, 170, 560, 73, 74.5, 0, 0, 48.5, 400],
    ],
    true,
  ),
  {
    id: "cinelli-vigorelli-steel",
    brand: "Cinelli",
    name: "Vigorelli Steel",
    slot: "frameset",
    catalogKind: "manufacturer",
    status: "draft",
    illustrative: false,
    source: "https://usa.cinelli-milano.com/products/vigorelli-steel-frame-kit",
    verifiedAt: reviewedAt,
    description:
      "Research draft. Its 31.6 mm seatpost requires a supported seating assembly; the current demo post is 27.2 mm. Authentic assets are unavailable.",
    acknowledgment:
      "Cinelli product identification only. No manufacturer asset is redistributed. Further size/geometry and seating support review is required.",
    variants: [
      {
        id: "cinelli-vigorelli-steel-m-reference",
        label: "M / 80S Team Red - White (research)",
        color: "#999da5",
        specs: {
          size: "M",
          finish: "80S Team Red - White",
          material: "Cromor steel",
          seatpost: 31.6,
          bottomBracket: "BSA-68",
          tireClearance: 28,
          frontSpacing: 100,
          rearSpacing: 120,
          brakeMount: "caliper",
        },
      },
    ],
  },
];
export const seedBrands = [
  {
    id: "cinelli",
    name: "Cinelli",
    source: "https://usa.cinelli-milano.com/",
    reviewedAt,
  },
  {
    id: "dosnoventa",
    name: "Dosnoventa",
    source: "https://dosnoventabikes.com/",
    reviewedAt,
  },
  {
    id: "tracklab-studio",
    name: "TrackLab Studio",
    source: "independently-authored-demo",
    reviewedAt,
  },
];
