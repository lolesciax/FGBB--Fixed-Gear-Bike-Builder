import type { BicycleGeometry, ComponentSpecs, Position } from "./components";

export type AxleRetention = "nutted" | "quick-release" | "through";
/** All dimensions here are authored illustration dimensions in metres, not product specifications. */
export function axleInterface(
  spacing: number,
  inserts: "none" | "outer" | "both" = "none",
) {
  const bodyThickness = 0.005,
    insertThickness = 0.0012;
  const innerInsert = inserts === "both" ? insertThickness : 0;
  const outerInsert = inserts === "none" ? 0 : insertThickness;
  const innerFace = spacing / 2,
    bodyInner = innerFace + innerInsert;
  const bodyCenter = bodyInner + bodyThickness / 2;
  const outerFace = bodyInner + bodyThickness + outerInsert;
  const washerThickness = 0.0015,
    nutThickness = 0.007;
  return {
    spacing,
    bodyThickness,
    insertThickness,
    innerFace,
    bodyInner,
    bodyCenter,
    innerInsertCenter: innerFace + insertThickness / 2,
    outerInsertCenter: bodyInner + bodyThickness + insertThickness / 2,
    outerFace,
    washerThickness,
    washerCenter: outerFace + washerThickness / 2,
    nutThickness,
    nutCenter: outerFace + washerThickness + nutThickness / 2,
    axleEnd: outerFace + washerThickness + nutThickness + 0.002,
  };
}
export function axleRetention(
  specs: ComponentSpecs,
  rear: boolean,
  through: boolean,
): AxleRetention {
  const value = specs[rear ? "rearAxleType" : "frontAxleType"];
  return value === "quick-release"
    ? value
    : value === "through" || through
      ? "through"
      : "nutted";
}
export function assemblyAnchors(g: BicycleGeometry) {
  const offset = (p: Position, axis: Position, amount: number) =>
    p.map((v, i) => v + axis[i] * amount) as Position;
  const paired = (p: Position, z: number) =>
    [-1, 1].map((side) => [p[0], p[1], side * z] as Position);
  const metres = {
    headUpper: g.head,
    headLower: g.lower,
    upperBearing: g.head,
    lowerBearing: g.lower,
    crownSeat: g.crown,
    frontAxle: g.front,
    rearAxle: g.rear,
    bottomBracket: g.bb,
    seatTubeTop: g.seat,
    seatpostClamp: g.saddlePost,
    saddleRails: g.saddleClamp,
    stemClamp: g.stemBase,
    barClamp: g.barClamp,
    steererEnd: g.steererTop,
    coverTop: offset(g.head, g.axis, g.steering.coverHeight),
    stemBottom: offset(g.head, g.axis, g.steering.stemBottom),
    stemTop: g.stemTop,
    topCap: g.capTop,
    frontDropoutLeft: paired(g.front, g.frontInterface.bodyCenter)[0],
    frontDropoutRight: paired(g.front, g.frontInterface.bodyCenter)[1],
    rearDropoutLeft: paired(g.rear, g.rearInterface.bodyCenter)[0],
    rearDropoutRight: paired(g.rear, g.rearInterface.bodyCenter)[1],
    frontHubLeft: paired(g.front, g.wheel.frontSpacing / 2)[0],
    frontHubRight: paired(g.front, g.wheel.frontSpacing / 2)[1],
    rearHubLeft: paired(g.rear, g.wheel.rearSpacing / 2)[0],
    rearHubRight: paired(g.rear, g.wheel.rearSpacing / 2)[1],
    frontWasher: paired(g.front, g.frontInterface.washerCenter)[1],
    rearWasher: paired(g.rear, g.rearInterface.washerCenter)[1],
    frontNut: paired(g.front, g.frontInterface.nutCenter)[1],
    rearNut: paired(g.rear, g.rearInterface.nutCenter)[1],
  };
  return {
    units: "mm" as const,
    origin: 'rear-axle' as const,
    axes: { forward: "x", up: "y", lateral: "z" },
    points: Object.fromEntries(
      Object.entries(metres).map(([name, p]) => [
        name,
        p.map((v) => v * 1000) as Position,
      ]),
    ),
    steeringAxis: g.axis,
    axleAxis: [0, 0, 1] as Position,
  };
}
