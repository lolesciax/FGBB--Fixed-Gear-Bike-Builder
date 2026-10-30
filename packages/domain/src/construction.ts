import type { ComponentSpecs, Position } from "./components";

type XY = [number, number];
export type RearEndProfile = {
  id: string;
  source?: string;
  inserts: "none" | "outer" | "both";
  mouth: number;
  height: number;
  nose: number;
  seat: XY;
  chain: XY;
  fasteners: XY[];
};
/** Source establishes construction/pattern, not the authored millimetre coordinates below. */
export function constructionProfile(specs: ComponentSpecs) {
  const family = String(specs.renderFamily || specs.morphologyId || "");
  const cinelli =
      family.startsWith("cinelli-vigorelli") && !family.includes("steel"),
    v8 = family.startsWith("8bar-krzberg"),
    snm = family.startsWith("tsunami-snm100") && !family.includes("elite"),
    ranger = family.startsWith("skream-ranger"),
    magnum = family.startsWith("skream-magnum"),
    leader = family.startsWith("leader-735"),
    dos = family.startsWith("dosnoventa-"),
    steel = specs.material === "steel";
  const rear: RearEndProfile = cinelli
    ? {
        id: "vigorelli-2024-removable",
        source:
          "https://usa.cinelli-milano.com/blogs/news/shop-talk-9-vigorelli",
        inserts: "outer",
        mouth: 24,
        height: 16,
        nose: 15,
        seat: [15, 25],
        chain: [30, -11],
        fasteners: [
          [-14, 10],
          [-14, -10],
        ],
      }
    : v8
      ? {
          id: "krzberg-v8-double",
          source: "https://8bar-bikes.com/8bar_krzberg_v8/",
          inserts: "both",
          mouth: 28,
          height: 19,
          nose: 21,
          seat: [17, 30],
          chain: [36, -12],
          fasteners: [
            [-20, 13],
            [-20, -13],
            [14, 0],
          ],
        }
      : snm
        ? {
            id: "snm100-standard-four-hole",
            source:
              "https://tsunamibicycle.com/product/tsunami-snm100-black-red/",
            inserts: "both",
            mouth: 27,
            height: 18,
            nose: 22,
            seat: [17, 27],
            chain: [33, -12],
            fasteners: [
              [-19, 12],
              [-19, -12],
              [12, 12],
              [12, -12],
            ],
          }
        : ranger || magnum
          ? {
              id: ranger ? "ranger-track-end" : "magnum-track-end",
              inserts: "none",
              mouth: 24,
              height: 15,
              nose: 15,
              seat: [14, ranger ? 27 : 23],
              chain: [29, -10],
              fasteners: [],
            }
          : dos
            ? {
                id: steel ? "bcn-forged-track" : "dosnoventa-alloy-track",
                source:
                  "https://dosnoventabikes.com/frames/detroit/detroit-frame-true-silver-5/",
                inserts: steel ? "none" : "outer",
                mouth: 23,
                height: steel ? 12 : 15,
                nose: 14,
                seat: [13, steel ? 20 : 24],
                chain: [27, -9],
                fasteners: [],
              }
            : {
                id: steel ? "illustrative-forged-track" : "illustrative-track",
                inserts: "none",
                mouth: 22,
                height: 14,
                nose: 15,
                seat: [14, 23],
                chain: [29, -10],
                fasteners: [],
              };
  const carbon = cinelli || v8 || ranger || magnum || leader || (dos && !steel);
  const fork = {
    id: cinelli
      ? "futura-caliper"
      : ranger
        ? "ranger-clearance"
        : magnum
          ? "magnum-carbon"
          : v8
            ? "krzberg-carbon"
            : dos && !steel
              ? "dosnoventa-carbon"
              : steel
                ? "classic-steel"
                : carbon
                  ? "illustrative-carbon"
                  : "conventional-alloy",
    kind: carbon ? "carbon" : steel ? "steel" : "alloy",
    rootDrop: carbon ? 30 : steel ? 20 : 24,
    rootHalf: ranger ? 42 : carbon ? 36 : steel ? 34 : 35,
    rootWidth: ranger || magnum ? 22 : carbon ? 20 : steel ? 13 : 18,
    rootDepth: cinelli
      ? 42
      : ranger
        ? 44
        : magnum
          ? 43
          : v8
            ? 40
            : carbon
              ? 34
              : steel
                ? 16
                : 28,
    crownHalfHeight: carbon ? 6 : steel ? 4.5 : 5,
    straight:
      carbon || snm || String(specs.forkProfile || "").startsWith("straight"),
  };
  return { family, rear, fork, fidelity: "illustrative" as const };
}

function outlineBuilder(start: XY) {
  const points: XY[] = [start];
  return {
    points,
    line(p: XY) {
      points.push(p);
    },
    quad(c: XY, p: XY, segments = 4) {
      const a = points.at(-1)!;
      for (let i = 1; i <= segments; i++) {
        const t = i / segments,
          u = 1 - t;
        points.push([
          u * u * a[0] + 2 * u * t * c[0] + t * t * p[0],
          u * u * a[1] + 2 * u * t * c[1] + t * t * p[1],
        ]);
      }
    },
  };
}
export function trackEndOutline(
  profile: RearEndProfile,
  diameter: number,
  insert = false,
): XY[] {
  const r = diameter * 500 + 0.35,
    L = profile.mouth - (insert ? 1.5 : 0),
    H = profile.height - (insert ? 2 : 0),
    N = profile.nose;
  const b = outlineBuilder([-L, H]);
  if (insert) {
    b.line([2, H]);
    b.quad([N + 5, H], [N + 5, 0], 6);
    b.quad([N + 5, -H], [2, -H], 6);
    b.line([-L, -H]);
  } else {
    const [sx, sy] = profile.seat,
      [cx, cy] = profile.chain;
    b.quad([-L / 3, H], [sx - 8, sy + 4]);
    b.quad([sx + 2, sy + 10], [sx + 9, sy + 1]);
    b.quad([sx + 10, sy - 10], [cx + 3, cy + 6]);
    b.quad([cx + 12, cy + 4], [cx + 8, cy - 4]);
    b.quad([cx + 5, cy - 10], [cx - 3, cy - 9]);
    b.quad([-L / 3, -H - 2], [-L, -H]);
  }
  b.line([-L, -r]);
  b.line([0, -r]);
  for (let i = 1; i <= 12; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 12;
    b.line([Math.cos(a) * r, Math.sin(a) * r]);
  }
  b.line([-L, r]);
  return b.points.map(([x, y]) => [x / 1000, y / 1000]);
}
export function frontEndOutline(
  diameter: number,
  through = false,
  lean = 0,
): XY[] {
  const r = diameter * 500 + 0.35,
    b = outlineBuilder([-2 + lean, 12]);
  b.line([2 + lean, 12]);
  b.quad([2, 10], [10, 5]);
  b.quad([12, 0], [10, -11]);
  if (through) {
    b.quad([0, -15], [-10, -11]);
  } else {
    b.line([r, -11]);
    b.line([r, 0]);
    for (let i = 1; i <= 12; i++) {
      const a = (i * Math.PI) / 12;
      b.line([Math.cos(a) * r, Math.sin(a) * r]);
    }
    b.line([-r, -11]);
    b.line([-10, -11]);
  }
  b.quad([-12, 0], [-10, 5]);
  b.quad([-2, 10], [-2 + lean, 12]);
  return b.points.map(([x, y]) => [x / 1000, y / 1000]);
}
export const rearJunction = (
  axle: Position,
  profile: RearEndProfile,
  region: "seatstay" | "chainstay",
  z: number,
): Position => {
  const p = region === "seatstay" ? profile.seat : profile.chain;
  return [axle[0] + p[0] / 1000, axle[1] + p[1] / 1000, z];
};
