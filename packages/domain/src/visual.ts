// Independently authored assembly, millimetres in side elevation (positive y down).
// Manufacturer dimensions establish anchors, not proprietary tube/fork profiles.
type Specs = Record<string, string | number | boolean>;
export type Point = { x: number; y: number };
export const assetRegistry = {
  "tracklab-parametric-v2": {
    category: "frameset",
    fidelity: "measurement-schematic",
    license: "CC0-1.0",
    source:
      "Independently authored TrackLab procedural SVG and Three.js geometry",
    coordinates: "millimetres; rear axle origin; positive y down",
    scale: 1,
    orientation: [0, 0, 0],
    visualVariants: ["track", "pursuit", "steel"],
    attachmentAnchors: [
      "rear",
      "front",
      "bb",
      "seat",
      "head",
      "headBottom",
      "saddle",
      "bar",
    ],
    glb: null,
    verification:
      "schematic-reviewed; authentic manufacturer assets unavailable",
  },
} as const;
export function assemblyGeometry(specs: Specs = {}) {
  const num = (key: string, fallback: number) =>
    typeof specs[key] === "number" ? (specs[key] as number) : fallback;
  const rad = (value: number) => (value * Math.PI) / 180;
  const drop = num("bbDrop", 52),
    chainstay = num("chainstay", 395);
  const bb = { x: Math.sqrt(Math.max(0, chainstay ** 2 - drop ** 2)), y: drop };
  const pursuit = specs.geometry === "pursuit";
  const seatAngle = rad(num("seatAngle", pursuit ? 76 : 74));
  const headAngle = rad(num("headAngle", 73.5));
  const headLength = num("headTube", pursuit ? 100 : 135);
  const head = {
    x: bb.x + num("reach", 400),
    y: bb.y - num("stack", pursuit ? 490 : 535),
  };
  const headBottom = {
    x: head.x + Math.cos(headAngle) * headLength,
    y: head.y + Math.sin(headAngle) * headLength,
  };
  const seatLength = num("seatTube", 555);
  const seat = {
    x: bb.x - Math.cos(seatAngle) * seatLength,
    y: bb.y - Math.sin(seatAngle) * seatLength,
  };
  const saddle = {
    x: seat.x - Math.cos(seatAngle) * 145,
    y: seat.y - Math.sin(seatAngle) * 145,
  };
  const bar = { x: head.x + 102, y: head.y - 35 };
  // Without a published wheelbase, intersect the steering axis at axle height and add listed rake.
  const front = {
    x: num(
      "wheelbase",
      headBottom.x - headBottom.y / Math.tan(headAngle) + num("forkRake", 45),
    ),
    y: 0,
  };
  const rear = { x: 0, y: 0 },
    radius = 336;
  const bounds = {
    x: -radius - 8,
    y: Math.min(saddle.y - 28, bar.y - 30, -radius) - 12,
    width: front.x + radius * 2 + 16,
    height: 0,
  };
  bounds.height = radius + 12 - bounds.y;
  return {
    rear,
    front,
    bb,
    seat,
    head,
    headBottom,
    saddle,
    bar,
    radius,
    bounds,
    anchors: {
      wheels: [rear, front],
      drivetrain: bb,
      seating: saddle,
      cockpit: bar,
    },
    frameWidth: specs.material === "steel" ? 23 : 34,
  };
}
