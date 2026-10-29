import type { ComponentSpecs, Position } from "./components";
type Rail = {
  kind: "round" | "oval" | "proprietary";
  width?: number;
  height?: number;
  system?: string;
};
export function railInterface(
  specs: ComponentSpecs,
  clamp = false,
): Rail | undefined {
  const prefix = clamp ? "clamp" : "rail",
    value = specs[clamp ? "clampInterface" : "railInterface"];
  if (typeof value === "string") {
    const round = value.match(/^round-([\d.]+)$/),
      oval = value.match(/^oval-([\d.]+)x([\d.]+)$/),
      proprietary = value.match(/^proprietary:([a-z0-9-]+)$/i);
    if (round && Number(round[1]) > 0)
      return {
        kind: "round",
        width: Number(round[1]),
        height: Number(round[1]),
      };
    if (oval && Number(oval[1]) > 0 && Number(oval[2]) > 0)
      return { kind: "oval", width: Number(oval[1]), height: Number(oval[2]) };
    if (proprietary) return { kind: "proprietary", system: proprietary[1] };
  }
  const kind = specs[clamp ? "clampRailType" : "railType"];
  if (kind !== "round" && kind !== "oval" && kind !== "proprietary") return;
  const width =
      specs[clamp ? "clampRailWidth" : "railWidth"] ??
      specs[`${prefix}Diameter`],
    height =
      specs[clamp ? "clampRailHeight" : "railHeight"] ??
      (kind === "round" ? width : undefined);
  return {
    kind,
    width: typeof width === "number" && width > 0 ? width : undefined,
    height: typeof height === "number" && height > 0 ? height : undefined,
    system:
      typeof specs[`${prefix}System`] === "string"
        ? String(specs[`${prefix}System`])
        : undefined,
  };
}
export function saddleRailFit(specs: ComponentSpecs = {}) {
  const rail = railInterface(specs),
    clamp = railInterface(specs, true),
    missing: string[] = [];
  if (!rail) missing.push("saddle.railInterface");
  if (!clamp) missing.push("saddle.clampInterface");
  let conflict = !!rail && !!clamp && rail.kind !== clamp.kind;
  if (rail && clamp && rail.kind === clamp.kind) {
    if (rail.kind === "proprietary") {
      if (!rail.system) missing.push("saddle.railSystem");
      if (!clamp.system) missing.push("saddle.clampSystem");
      if (rail.system && clamp.system) conflict = rail.system !== clamp.system;
    } else
      for (const dimension of ["width", "height"] as const) {
        if (!rail[dimension]) missing.push(`saddle.rail${dimension}`);
        if (!clamp[dimension]) missing.push(`saddle.clamp${dimension}`);
        if (
          rail[dimension] &&
          clamp[dimension] &&
          Math.abs(rail[dimension]! - clamp[dimension]!) > 0.05
        )
          conflict = true;
      }
  }
  return {
    rail,
    clamp,
    missing,
    state: conflict
      ? ("incompatible" as const)
      : missing.length
        ? ("unverified" as const)
        : ("compatible" as const),
  };
}
const contour = [
  [0, 0],
  [0.08, 0.7],
  [0.22, 1],
  [0.38, 0.96],
  [0.54, 0.55],
  [0.68, 0.23],
  [0.86, 0.18],
  [0.97, 0.14],
  [1, 0],
];
const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export type SaddleDimensions = {
  length: number;
  width: number;
  padding: number;
};
export function saddleHalfWidth(d: SaddleDimensions, u: number) {
  let i = 1;
  while (i < contour.length - 1 && contour[i][0] < u) i++;
  const a = contour[i - 1],
    b = contour[i];
  return ((a[1] + (b[1] - a[1]) * smooth(a[0], b[0], u)) * d.width) / 2;
}
export function saddleSurfacePoint(
  d: SaddleDimensions,
  u: number,
  angle: number,
  layer: "shell" | "cover",
): Position {
  const thickness = layer === "shell" ? 0.0035 : d.padding;
  const half = saddleHalfWidth(d, u),
    round = Math.sqrt(Math.max(0, Math.min(1, u / 0.045, (1 - u) / 0.045))),
    sin = Math.sin(angle),
    z = Math.cos(angle) * half;
  const base=layer==='shell'?.034:.034+(.0035+d.padding-.001)*round;
  const relief =
    layer === "cover" && sin > 0
      ? 0.0045 *
        Math.exp(-Math.pow(z / 0.014, 2)) *
        smooth(0.15, 0.3, u) *
        (1 - smooth(0.72, 0.9, u))
      : 0;
  return [
    (u - 0.52) * d.length,
    base +
      0.006 * Math.cos(u * Math.PI) +
      0.004 * Math.max(0, (u - 0.7) / 0.3) +
      sin * thickness * round -
      relief,
    z,
  ];
}
export function saddleRailPoints(
  d: SaddleDimensions,
  side: number,
): Position[] {
  const end = (x: number, z: number): Position => {
    const u = x / d.length + 0.52;
    const bottom = saddleSurfacePoint(d, u, Math.PI * 1.5, "shell")[1];
    return [x, bottom - 0.0015, z];
  };
  return [
    end(-d.length * 0.34, side * 0.022),
    [-0.07, 0.015, side * 0.022],
    [-0.05, 0.012, side * 0.022],
    [-0.035, 0.012, side * 0.022],
    [0.04, 0.012, side * 0.022],
    [0.06, 0.012, side * 0.022],
    [0.08, 0.022, side * 0.012],
    end(d.length * 0.36, side * 0.008),
  ];
}
export function saddleSilhouette(
  d: SaddleDimensions,
  layer: "shell" | "cover",
): Position[] {
  const upper: Position[] = [],
    lower: Position[] = [];
  for (let i = 0; i <= 42; i++) {
    const u = i / 42,
      section = Array.from({ length: 49 }, (_, j) =>
        saddleSurfacePoint(d, u, (j * Math.PI) / 24, layer),
      );
    upper.push(section.reduce((a, b) => (a[1] > b[1] ? a : b)));
    lower.push(section.reduce((a, b) => (a[1] < b[1] ? a : b)));
  }
  return [...upper, ...lower.reverse()];
}
