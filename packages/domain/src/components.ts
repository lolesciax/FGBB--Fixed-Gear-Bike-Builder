import { assemblyGeometry, type Point } from "./visual";
import {steeringStack,type DropoutStyle} from './steering';
import {wheelBuild} from './wheels';
import {railInterface} from './seating';

export type ComponentSpecs = Record<string, string | number | boolean>;
export type Position = [number, number, number];
export type BarType = "drop" | "riser" | "flat" | "bullhorn";
export const barTypes: readonly [BarType, string][] = [
  ["drop", "Dropbar"],
  ["riser", "Riser"],
  ["flat", "Straight / Flat"],
  ["bullhorn", "Bullhorn"],
];
export const componentDefaults = {
  drop: {
    width: 400,
    reach: 85,
    drop: 125,
    rise: 0,
    sweep: 0,
    tubeDiameter: 23.8,
  },
  riser: {
    width: 620,
    reach: 0,
    drop: 0,
    rise: 35,
    sweep: 8,
    tubeDiameter: 22.2,
  },
  flat: {
    width: 600,
    reach: 0,
    drop: 0,
    rise: 0,
    sweep: 6,
    tubeDiameter: 22.2,
  },
  bullhorn: {
    width: 400,
    reach: 150,
    drop: 0,
    rise: 35,
    sweep: 0,
    tubeDiameter: 23.8,
  },
} as const;
export const numberSpec = (
  specs: ComponentSpecs,
  key: string,
  fallback: number,
) =>
  typeof specs[key] === "number" && Number.isFinite(specs[key])
    ? (specs[key] as number)
    : fallback;
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
export const world = (p: Point, z = 0): Position => [
  p.x / 1000,
  -p.y / 1000,
  z,
];
export const elevation = (p: Position): Point => ({
  x: p[0] * 1000,
  y: -p[1] * 1000,
});
export const add = (a: Position, b: Position): Position => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];
export const scale = (p: Position, n: number): Position =>
  p.map((v) => v * n) as Position;
export const distance = (a: Position, b: Position) =>
  Math.hypot(...a.map((v, i) => v - b[i]));
export function cockpitDimensions(specs: ComponentSpecs = {}) {
  const type: BarType = barTypes.some(([t]) => t === specs.shape)
    ? (specs.shape as BarType)
    : "drop";
  const defaults = componentDefaults[type];
  return {
    type,
    width: clamp(numberSpec(specs, "width", defaults.width), 300, 800) / 1000,
    reach:
      type === "drop" || type === "bullhorn"
        ? clamp(numberSpec(specs, "reach", defaults.reach), 30, 220) / 1000
        : 0,
    drop:
      type === "drop"
        ? clamp(numberSpec(specs, "drop", defaults.drop), 70, 180) / 1000
        : 0,
    rise:
      type === "riser" || type === "bullhorn"
        ? clamp(numberSpec(specs, "rise", defaults.rise), 0, 100) / 1000
        : 0,
    sweep:
      type === "riser" || type === "flat"
        ? (clamp(numberSpec(specs, "sweep", defaults.sweep), 0, 25) * Math.PI) /
          180
        : 0,
    clamp: numberSpec(specs, "stemClamp", 31.8) / 1000,
    tubeDiameter:
      numberSpec(specs, "tubeDiameter", defaults.tubeDiameter) / 1000,
    stemLength: clamp(numberSpec(specs, "stemLength", 90), 50, 140) / 1000,
    stemAngle: (numberSpec(specs, "stemAngle", 6) * Math.PI) / 180,
    illustrative: !["width", "stemLength", "tubeDiameter"].every(
      (k) => typeof specs[k] === "number",
    ),
  };
}
export function handlebarPoints(specs: ComponentSpecs = {}) {
  const d = cockpitDimensions(specs),
    h = d.width / 2;
  let half: Position[];
  if (d.type === "drop")
    half = [
      [0, 0, 0],
      [0, 0, 0.045],
      [0.008, -0.002, h * 0.72],
      [d.reach * 0.72, -0.007, h],
      [d.reach, -d.drop * 0.3, h],
      [d.reach * 0.95, -d.drop * 0.65, h],
      [d.reach * 0.65, -d.drop * 0.96, h],
      [0.022, -d.drop, h],
    ];
  else if (d.type === "bullhorn")
    half = [
      [0, 0, 0],
      [0, 0, 0.06],
      [0.008, 0, h * 0.85],
      [d.reach * 0.28, 0, h],
      [d.reach * 0.8, d.rise * 0.15, h],
      [d.reach, d.rise, h],
    ];
  else
    half = [
      [0, 0, 0],
      [0, 0, 0.065],
      [-Math.tan(d.sweep) * h * 0.3, d.rise * 0.4, h * 0.35],
      [-Math.tan(d.sweep) * h * 0.75, d.rise, h * 0.8],
      [-Math.tan(d.sweep) * h, d.rise, h],
    ];
  return [
    ...half
      .slice(1)
      .reverse()
      .map(([x, y, z]): Position => [x, y, -z]),
    ...half,
  ];
}
export function wheelDimensions(
  wheel: ComponentSpecs = {},
  tire: ComponentSpecs = {},
) {
  const bsd = clamp(numberSpec(wheel, "bsd", 622), 350, 700) / 1000,
    width = clamp(numberSpec(tire, "width", 25), 18, 65) / 1000,
    tireHeight = numberSpec(tire, "sectionHeight", width * 1000) / 1000,
    rimDepth = clamp(numberSpec(wheel, "rimDepth", 25), 10, 90) / 1000,
    rimWidth = clamp(numberSpec(wheel, "rimWidth", 20), 14, 40) / 1000,
    frontBuild=wheelBuild(wheel,false),rearBuild=wheelBuild(wheel,true);
  return {
    bsd,
    width,
    tireHeight,
    radius: bsd / 2 + tireHeight,
    rimOuter: bsd / 2 + 0.003,
    rimInner: bsd / 2 + 0.003 - rimDepth,
    rimDepth,
    rimWidth,
    spokes:frontBuild.count,
    frontBuild,rearBuild,
    frontSpacing: numberSpec(wheel, "frontSpacing", 100) / 1000,
    rearSpacing: numberSpec(wheel, "rearSpacing", 120) / 1000,
    frontAxle: numberSpec(wheel, "frontAxleDiameter", 10) / 1000,
    rearAxle: numberSpec(wheel, "rearAxleDiameter", 10) / 1000,
    chainline:numberSpec(wheel,'chainline',42)/1000,
    sidewall: tire.sidewall === "tan" ? "tan" : "black",
  };
}
export function spokeEndpoints(
  wheel: ReturnType<typeof wheelDimensions>,
  rear: boolean,
) {
  const hubRadius = rear ? 0.028 : 0.022,
    flange = rear ? 0.032 : 0.028,
    rimRadius = wheel.rimInner + 0.002;
  const {count,crossings}=rear?wheel.rearBuild:wheel.frontBuild;
  return Array.from({ length: count }, (_, i) => {
    const side = i % 2 === 0 ? 1 : -1,
      index = Math.floor(i / 2),
      angle =
        (index * 4 * Math.PI) / count +
        (side === 1 ? 0 : (2 * Math.PI) / count) + Math.PI/count,
      lead = index % 2 === 0 ? 1 : -1,
      hubAngle = angle + (lead * crossings * 4 * Math.PI) / count;
    return {
      hub: [
        Math.cos(hubAngle) * hubRadius,
        Math.sin(hubAngle) * hubRadius,
        side * flange,
      ] as Position,
      rim: [
        Math.cos(angle) * rimRadius,
        Math.sin(angle) * rimRadius,
        side * wheel.rimWidth * 0.16,
      ] as Position,
      side,
    };
  });
}
export function pitchRadius(teeth: number, pitch = 0.0127) {
  return pitch / (2 * Math.sin(Math.PI / teeth));
}
export function crankArmOutline(length:number):[number,number][]{
 const points:[number,number][]=[];
 for(let i=0;i<=12;i++){const t=i/12;points.push([t*length,-(.016*(1-t)+.011*t)*(1-.2*Math.sin(Math.PI*t))]);}
 for(let i=1;i<=12;i++){const a=-Math.PI/2+i*Math.PI/12;points.push([length+.011*Math.cos(a),.011*Math.sin(a)]);}
 for(let i=11;i>=0;i--){const t=i/12;points.push([t*length,(.016*(1-t)+.011*t)*(1-.2*Math.sin(Math.PI*t))]);}
 for(let i=1;i<=12;i++){const a=Math.PI/2+i*Math.PI/12;points.push([.016*Math.cos(a),.016*Math.sin(a)]);}
 return points;
}
export function chainGeometry(
  rear: Position,
  bb: Position,
  frontTeeth: number,
  rearTeeth: number,
  chainline: number,
) {
  const r = pitchRadius(rearTeeth),
    R = pitchRadius(frontTeeth),
    dx = bb[0] - rear[0],
    dy = bb[1] - rear[1],
    D = Math.hypot(dx, dy),
    k = (r - R) / D;
  if (D <= Math.abs(R - r))
    throw new Error(
      "Chain pitch circles cannot overlap or contain one another.",
    );
  const root = Math.sqrt(1 - k * k),
    u = [dx / D, dy / D],
    normals = [
      [u[0] * k - u[1] * root, u[1] * k + u[0] * root],
      [u[0] * k + u[1] * root, u[1] * k - u[0] * root],
    ],
    upper = Math.atan2(normals[0][1], normals[0][0]),
    lower = Math.atan2(normals[1][1], normals[1][0]);
  const point = (center: Position, radius: number, angle: number): Position => [
    center[0] + Math.cos(angle) * radius,
    center[1] + Math.sin(angle) * radius,
    chainline,
  ];
  const rearUpper = point(rear, r, upper),
    frontUpper = point(bb, R, upper),
    frontLower = point(bb, R, lower),
    rearLower = point(rear, r, lower),
    points: Position[] = [rearUpper, frontUpper];
  let end = lower;
  while (end >= upper) end -= 2 * Math.PI;
  for (let i = 1; i <= 56; i++)
    points.push(point(bb, R, upper + ((end - upper) * i) / 56));
  points.push(rearLower);
  let rearEnd = upper;
  while (rearEnd >= lower) rearEnd -= 2 * Math.PI;
  for (let i = 1; i <= 28; i++)
    points.push(point(rear, r, lower + ((rearEnd - lower) * i) / 28));
  points[points.length - 1] = rearUpper;
  const lengths = [0];
  for (let i = 1; i < points.length; i++)
    lengths.push(lengths[i - 1] + distance(points[i - 1], points[i]));
  const length = lengths.at(-1)!;
  const at = (s: number): Position => {
    const target = ((s % length) + length) % length;
    let i = 1;
    while (lengths[i] < target) i++;
    const t = (target - lengths[i - 1]) / (lengths[i] - lengths[i - 1]);
    return points[i].map(
      (v, j) => points[i - 1][j] + (v - points[i - 1][j]) * t,
    ) as Position;
  };
  const count = Math.round(length / 0.0127 / 2) * 2;
  return {
    points,
    at,
    length,
    count,
    frontRadius: R,
    rearRadius: r,
    frontUpper,
    frontLower,
    rearUpper,
    rearLower,
  };
}
export function componentGeometry(
  parts: {
    frameset?: ComponentSpecs;
    wheels?: ComponentSpecs;
    tires?: ComponentSpecs;
    cockpit?: ComponentSpecs;
    drivetrain?: ComponentSpecs;
    saddle?: ComponentSpecs;
  } = {},
) {
  const f = parts.frameset || {},
    c = parts.cockpit || {},
    d = parts.drivetrain || {},
    s = parts.saddle || {},
    frame = assemblyGeometry(f),
    head = world(frame.head),
    lower = world(frame.headBottom),
    rear = world(frame.rear),
    front = world(frame.front),
    bb = world(frame.bb),
    seat = world(frame.seat),
    axis = scale(add(head, scale(lower, -1)), 1 / distance(head, lower)),
    seatAxis = scale(add(seat, scale(bb, -1)), 1 / distance(seat, bb)),
    cockpit = cockpitDimensions(c),
    wheel = wheelDimensions(parts.wheels, parts.tires),
    steering=steeringStack(f,c,frame.frameWidth),
    stemBase = add(head, scale(axis, steering.stemCenter)),
    barClamp = add(stemBase, [
      Math.cos(cockpit.stemAngle) * cockpit.stemLength,
      Math.sin(cockpit.stemAngle) * cockpit.stemLength,
      0,
    ]),
    saddlePost = add(
      seat,
      scale(seatAxis, numberSpec(s, "extension", 145) / 1000),
    ),
    saddleClamp = add(saddlePost, [0, 0.012, 0]);
  let crownStack = 0.012;
  const forkLength = numberSpec(f, "forkLength", 0) / 1000;
  if (forkLength) {
    const a = add(lower, scale(front, -1)),
      projection = a.reduce((n, v, i) => n + v * axis[i], 0),
      disc =
        projection * projection -
        distance(lower, front) ** 2 +
        forkLength * forkLength;
    if (disc >= 0) {
      const value = projection - Math.sqrt(disc);
      if (value >= 0.004 && value <= 0.045) crownStack = value;
    }
  }
  const crown = add(lower, scale(axis, -crownStack)),
    forkHalf = numberSpec(f, "frontSpacing", 100) / 2000,
    chainline = numberSpec(d, "chainline", 42) / 1000,
    frontTeeth = Math.round(clamp(numberSpec(d, "frontTeeth", 46), 32, 60)),
    rearTeeth = Math.round(clamp(numberSpec(d, "rearTeeth", 16), 12, 24)),
    crankLength = numberSpec(d, "crankLength", 170) / 1000,
    crankAngle = (-35 * Math.PI) / 180,
    armOffset = numberSpec(d, "qFactor", 130) / 2000,
    pedals = [1, -1].map((side, i): Position => [
      bb[0] + Math.cos(crankAngle + i * Math.PI) * crankLength,
      bb[1] + Math.sin(crankAngle + i * Math.PI) * crankLength,
      side * armOffset,
    ]);
  return {
    frame,
    rear,
    front,
    bb,
    seat,
    head,
    lower,
    axis,
    seatAxis,
    wheel,
    cockpit,
    steering,
    stemBase,
    barClamp,
    steererTop: add(head, scale(axis, steering.steererEnd)),
    stemTop:add(head,scale(axis,steering.stemTop)),
    capTop:add(head,scale(axis,steering.capTop)),
    topJunction:add(head,scale(axis,-Math.min(frame.frameWidth*.0004,distance(head,lower)*.16))),
    downJunction:add(lower,scale(axis,Math.min((frame.frameWidth+8)*.0004,distance(head,lower)*.2))),
    crown,
    forkHalf,
    rearHalf: numberSpec(f, "rearSpacing", 120) / 2000,
    frontDropoutDiameter: numberSpec(f, "frontAxleDiameter", 10) / 1000,
    rearDropoutDiameter: numberSpec(f, "rearAxleDiameter", 10) / 1000,
    frontDropoutStyle:(f.frontDropoutType==='through'||numberSpec(f,'frontAxleDiameter',10)>=12?'through':'open-vertical') as DropoutStyle,
    rearDropoutStyle:(f.rearDropoutType==='through'?'through':'rearward-track') as DropoutStyle,
    forkProfile: String(f.forkProfile || "illustrative curved blades"),
    forkLength,
    renderedForkLength: distance(crown, front),
    saddlePost,
    saddleClamp,
    saddle: {
      length: numberSpec(s, "length", s.shape === "comfort" ? 265 : 275) / 1000,
      width: numberSpec(s, "width", s.shape === "comfort" ? 175 : 142) / 1000,
      postDiameter: numberSpec(s,'postDiameter',numberSpec(f, "seatpost", 27.2)) / 1000,
      padding:numberSpec(s,'paddingHeight',s.shape==='comfort'?14:8)/1000,
      railWidth:(railInterface(s)?.width||7)/1000,
      railHeight:(railInterface(s)?.height||7)/1000,
    },
    drivetrain: {
      chainline,
      frontTeeth,
      rearTeeth,
      crankLength,
      crankAngle,
      armOffset,
      pedals,
      chain: chainGeometry(rear, bb, frontTeeth, rearTeeth, chainline),
    },
    groundY: -wheel.radius,
    assumptions:
      "Illustrative component surfaces, crown/headset stack, hub flanges/lacing, crank mounting, saddle contours and any unspecified component dimensions. Not a physical-fit certification.",
  };
}
export type BicycleGeometry = ReturnType<typeof componentGeometry>;

export function forkBladePoints(g: BicycleGeometry, side: number): Position[] {
  const start: Position = [g.crown[0], g.crown[1] - 0.007, side * 0.035];
  const end: Position = [g.front[0], g.front[1] + 0.014, side * g.forkHalf];
  const blend = (t: number): Position =>
    start.map((v, i) => v + (end[i] - v) * t) as Position;
  const a = blend(0.32),
    b = blend(0.76);
  if (!g.forkProfile.startsWith("straight")) {
    a[0] -= 0.012;
    b[0] -= 0.024;
  }
  return [start, a, b, end];
}
