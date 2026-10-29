type Specs = Record<string, string | number | boolean>;
const number = (s: Specs, k: string, f: number, min: number, max: number) =>
  typeof s[k] === "number" ? Math.max(min, Math.min(max, s[k] as number)) : f;
export function steeringStack(
  frame: Specs,
  cockpit: Specs,
  frameWidth: number,
) {
  const headset = String(frame.headset || ""),
    steerer = String(frame.steerer || ""),
    threaded = /threaded/i.test(headset),
    quill = cockpit.stemType === "quill" || (!cockpit.stemType && threaded);
  const upper =
      number(
        frame,
        "upperSteererDiameter",
        /1 inch/i.test(headset) ? 25.4 : 28.6,
        22,
        40,
      ) / 1000,
    lower =
      number(
        frame,
        "lowerSteererDiameter",
        steerer.includes("38.1") ? 38.1 : upper * 1000,
        22,
        45,
      ) / 1000;
  const bearings = [...headset.matchAll(/IS([\d.]+)/g)].map(
    (m) => Number(m[1]) / 1000,
  );
  if (bearings.length === 1) {
    const second = headset.match(/^IS[\d.]+\/([\d.]+)$/);
    if (second) bearings.push(Number(second[1]) / 1000);
  }
  const upperRadius = bearings.length
      ? bearings[0] / 2 + 0.0025
      : frameWidth / 2000 + 0.004,
    lowerRadius =
      bearings.length > 1
        ? bearings[1] / 2 + 0.0025
        : Math.max(upperRadius, lower / 2 + 0.003);
  const cover =
      number(cockpit, "headsetCoverHeight", threaded ? 12 : 8, 4, 24) / 1000,
    spacer = quill ? 0 : number(cockpit, "spacerHeight", 10, 0, 40) / 1000,
    clampHeight = number(cockpit, "stemClampHeight", 40, 30, 50) / 1000;
  const stemBottom = cover + spacer,
    stemCenter = quill
      ? cover + number(cockpit, "quillRise", 40, 15, 90) / 1000
      : stemBottom + clampHeight / 2,
    stemTop = quill ? stemCenter + 0.016 : stemBottom + clampHeight;
  return {
    upperDiameter: upper,
    lowerDiameter: lower,
    headUpperRadius: upperRadius,
    headLowerRadius: lowerRadius,
    coverHeight: cover,
    spacerHeight: spacer,
    clampHeight,
    stemBottom,
    stemCenter,
    stemTop,
    steererEnd: quill ? cover : stemTop - 0.002,
    capTop: quill ? stemCenter + 0.014 : stemTop + 0.0025,
    quill,
    threaded,
    profile: lower > upper ? "tapered" : "straight",
    sourceDefined: !!frame.steerer || bearings.length > 0,
    assumptions:
      "Covers, spacers, tube walls and unspecified stem dimensions are illustrative; verify actual headset/stem interfaces.",
  };
}
export type DropoutStyle = "open-vertical" | "rearward-track" | "through";
export function dropoutOutline(
  style: DropoutStyle,
  diameter: number,
): [number, number][] {
  const r = diameter / 2 + 0.0006;
  if (style === "through")
    return Array.from({ length: 25 }, (_, i) => {
      const a = (i * Math.PI) / 12;
      return [Math.cos(a) * 0.014, Math.sin(a) * 0.016] as [number, number];
    });
  const points: [number, number][] = [
    [-0.014, 0.018],
    [0.014, 0.018],
    [0.014, -0.014],
    [r, -0.014],
    ...Array.from({ length: 13 }, (_, i): [number, number] => [
      Math.cos((i * Math.PI) / 12) * r,
      Math.sin((i * Math.PI) / 12) * r,
    ]),
    [-r, -0.014],
    [-0.014, -0.014],
  ];
  return style === "rearward-track" ? points.map(([x, y]) => [y, -x]) : points;
}
