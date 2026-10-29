import React, { useId, type KeyboardEvent } from "react";
import {
  componentGeometry,
  selectedColorway,
  handlebarPoints,
  spokeEndpoints,
  variantById,
  slots,
  finishZones,
  finishSlots,
  componentPaint,
  finishGradient,
  type FinishZone,
  type Configuration,
  type Product,
  type Slot,
  type Position,
} from "@tracklab/domain";
import { FrameFinish2D } from "./FrameFinish2D";
export { FrameFinish2D } from "./FrameFinish2D";
type Point = { x: number; y: number };
type Props = {
  configuration: Configuration;
  catalog: Product[];
  active?: Slot;
  onSelect?: (slot: Slot) => void;
  zoom?: number;
  compact?: boolean;
  rasterData?: Record<string, string>;
};
const project = (p: Position): Point => ({ x: p[0] * 1000, y: -p[1] * 1000 });
const add = (a: Position, b: Position): Position =>
  a.map((v, i) => v + b[i]) as Position;
const line = (points: Point[], close = false) =>
  points.map((p, i) => (i ? "L" : "M") + p.x + " " + p.y).join(" ") +
  (close ? "Z" : "");
function smooth(points: Point[]) {
  const p = points.filter(
    (v, i) =>
      !i || Math.hypot(v.x - points[i - 1].x, v.y - points[i - 1].y) > 0.01,
  );
  let d = "M" + p[0].x + " " + p[0].y;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i],
      b = p[i],
      c = p[i + 1],
      e = p[i + 2] || c;
    d +=
      " C" +
      (b.x + (c.x - a.x) / 6) +
      " " +
      (b.y + (c.y - a.y) / 6) +
      " " +
      (c.x - (e.x - b.x) / 6) +
      " " +
      (c.y - (e.y - b.y) / 6) +
      " " +
      c.x +
      " " +
      c.y;
  }
  return d;
}
function gear(teeth: number, radius: number, inner: number, center: Point) {
  const p: Point[] = [];
  for (let i = 0; i < teeth; i++)
    for (const [o, r] of [
      [-0.5, radius - 3.8],
      [-0.17, radius + 2.7],
      [0.17, radius + 2.7],
      [0.5, radius - 3.8],
    ]) {
      const a = ((i + o) * Math.PI * 2) / teeth;
      p.push({ x: center.x + Math.cos(a) * r, y: center.y + Math.sin(a) * r });
    }
  return (
    line(p, true) +
    " M" +
    (center.x - inner) +
    " " +
    center.y +
    "a" +
    inner +
    " " +
    inner +
    " 0 1 0 " +
    inner * 2 +
    " 0a" +
    inner +
    " " +
    inner +
    " 0 1 0 " +
    -inner * 2 +
    " 0Z"
  );
}
export function Bike2D({
  configuration,
  catalog,
  active,
  onSelect,
  zoom = 1,
  compact = false,
  rasterData,
}: Props) {
  const uid = useId().replace(/:/g, ""),
    get = (slot: Slot) => variantById(catalog, configuration[slot])?.variant;
  const m = componentGeometry(
      Object.fromEntries(slots.map((slot) => [slot, get(slot as Slot)?.specs])),
    ),
    g = m.frame,
    { rear, front, bb, seat } = g,
    saddle = project(m.saddlePost),
    bar = project(m.barClamp),
    stem = project(m.stemBase),
    radius = m.wheel.radius * 1000;
  const paint = get("frameset")?.color || "#535963",
    highlight =
      "#" +
      [1, 3, 5]
        .map((i) =>
          Math.round(parseInt(paint.slice(i, i + 2), 16) * 0.86 + 255 * 0.14)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("");
  const barPoints = handlebarPoints(get("cockpit")?.specs)
    .slice(Math.floor(handlebarPoints(get("cockpit")?.specs).length / 2))
    .map((p) => project(add(m.barClamp, p)));
  const bounds = {
    x: -radius - 8,
    y: Math.min(g.bounds.y, saddle.y - 65, ...barPoints.map((p) => p.y - 18)),
    width: front.x + radius * 2 + 16,
    height: 0,
  };
  bounds.height = radius + 12 - bounds.y;
  const margin = compact ? 12 : 16;
  const interactive = (slot: Slot) =>
    onSelect
      ? {
          role: "button",
          tabIndex: 0,
          "aria-label": "Select " + slot + " on bicycle",
          onClick: () => onSelect(slot),
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(slot);
            }
          },
          className: "bike-part " + (active === slot ? "is-active" : ""),
        }
      : {};
  const metal = "url(#" + uid + "-metal)",
    framePaint = "url(#" + uid + "-paint)";
  const componentPaints = Object.fromEntries(
    finishZones.map((zone) => {
      const selected = variantById(catalog, configuration[finishSlots[zone]]);
      return [
        zone,
        selected &&
          componentPaint(
            selected.product,
            selected.variant,
            zone,
            configuration.appearance?.[zone],
          ),
      ];
    }),
  );
  const finish = (zone: FinishZone) =>
    componentPaints[zone] ? `url(#${uid}-${zone})` : metal;
  const tube = (a: Point, b: Point, width: number, color = framePaint) => (
    <g>
      <path
        d={line([a, b])}
        fill="none"
        stroke="#21252b"
        strokeWidth={width + 1.5}
      />
      <path d={line([a, b])} fill="none" stroke={color} strokeWidth={width} />
      <path
        d={line([
          { x: a.x, y: a.y - 2 },
          { x: b.x, y: b.y - 2 },
        ])}
        fill="none"
        stroke="#fff"
        opacity=".16"
        strokeWidth="2"
      />
    </g>
  );
  const frameRecord = variantById(catalog, configuration.frameset)!;
  const stack = m.steering,
    stackAt = (height: number) =>
      project(m.head.map((v, i) => v + m.axis[i] * height) as Position);
  const stackTube = (
    from: number,
    to: number,
    r1: number,
    r2: number,
    color: string,
  ) => {
    const a = stackAt(from),
      b = stackAt(to),
      nx = m.axis[1],
      ny = m.axis[0];
    return (
      <path
        d={line(
          [
            { x: a.x + nx * r1 * 1000, y: a.y + ny * r1 * 1000 },
            { x: b.x + nx * r2 * 1000, y: b.y + ny * r2 * 1000 },
            { x: b.x - nx * r2 * 1000, y: b.y - ny * r2 * 1000 },
            { x: a.x - nx * r1 * 1000, y: a.y - ny * r1 * 1000 },
          ],
          true,
        )}
        fill={color}
        stroke="#39424f"
        strokeWidth=".7"
      />
    );
  };
  const colorway = selectedColorway(frameRecord.product, frameRecord.variant);
  const d = m.drivetrain,
    chain = line(d.chain.points.map(project), true),
    frontRadius = d.chain.frontRadius * 1000,
    rearRadius = d.chain.rearRadius * 1000;
  const finishAxes: Record<FinishZone, [number, number]> = {
    wheelset: [-radius, radius],
    crankArms: [bb.y - d.crankLength * 1000, bb.y + d.crankLength * 1000],
    chainring: [bb.y - frontRadius, bb.y + frontRadius],
    handlebar: [
      bar.y - m.cockpit.rise * 1000 - 15,
      bar.y + m.cockpit.drop * 1000 + 15,
    ],
    stem: [Math.min(stem.y, bar.y) - 20, Math.max(stem.y, bar.y) + 20],
    seatpost: [saddle.y, seat.y],
  };
  return (
    <svg
      className={"bike-svg " + (compact ? "compact" : "")}
      data-colorway-id={colorway?.id || "legacy"}
      data-component-finishes={JSON.stringify(configuration.appearance || {})}
      data-colorway-revision={colorway?.revision || 0}
      viewBox={[
        bounds.x - margin,
        bounds.y - margin,
        bounds.width + margin * 2,
        bounds.height + margin * 2,
      ].join(" ")}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Illustrative fixed-gear bicycle, side profile. Not manufacturer geometry."
      data-frame-variant={configuration.frameset}
      data-cockpit-variant={configuration.cockpit}
      data-cockpit-shape={m.cockpit.type}
      data-geometry-revision="components-v2"
      data-steering-profile={stack.profile}
      data-stem-style={stack.quill ? "quill" : "ahead"}
    >
      <defs>
        {finishZones.map(
          (zone) =>
            componentPaints[zone] && (
              <linearGradient
                id={`${uid}-${zone}`}
                key={zone}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={finishAxes[zone][0]}
                x2="20"
                y2={finishAxes[zone][1]}
              >
                {finishGradient(componentPaints[zone]).map((stop, i) => (
                  <stop key={i} offset={stop.at} stopColor={stop.color} />
                ))}
              </linearGradient>
            ),
        )}
        <linearGradient id={uid + "-paint"} x1="0" y1="0" x2=".2" y2="1">
          <stop stopColor={paint} />
          <stop offset=".35" stopColor={paint} />
          <stop offset=".5" stopColor={highlight} />
          <stop offset=".65" stopColor={paint} />
          <stop offset="1" stopColor="#272c33" />
        </linearGradient>
        <linearGradient id={uid + "-metal"} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#8b94a0" />
          <stop offset=".3" stopColor="#444d59" />
          <stop offset="1" stopColor="#202630" />
        </linearGradient>
      </defs>
      <g
        transform={
          "translate(" +
          front.x / 2 +
          " " +
          (bounds.y + bounds.height / 2) +
          ") scale(" +
          zoom +
          ") translate(" +
          -front.x / 2 +
          " " +
          -(bounds.y + bounds.height / 2) +
          ")"
        }
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse
          cx={front.x / 2}
          cy={radius + 3}
          rx={front.x / 2 + radius - 30}
          ry="7"
          fill="#171c26"
          opacity=".08"
        />
        <g {...interactive("wheels")} data-finish-zone="wheelset">
          {[rear, front].map((axle, i) => (
            <g key={i} transform={"translate(" + axle.x + " 0)"}>
              <circle
                r={(m.wheel.bsd / 2 + m.wheel.tireHeight / 2) * 1000}
                fill="none"
                stroke="#1c2027"
                strokeWidth={m.wheel.tireHeight * 1000}
              />
              {m.wheel.sidewall === "tan" && (
                <circle
                  r={(m.wheel.bsd / 2 + m.wheel.tireHeight * 0.5) * 1000}
                  fill="none"
                  stroke="#a98b61"
                  strokeWidth={m.wheel.tireHeight * 450}
                />
              )}
              <circle
                r={(m.wheel.rimOuter + m.wheel.rimInner) * 500}
                fill="none"
                stroke={finish("wheelset")}
                strokeWidth={m.wheel.rimDepth * 1000}
              />
              <circle
                r={m.wheel.rimOuter * 1000}
                fill="none"
                stroke={
                  componentPaints.wheelset ? finish("wheelset") : "#a7afba"
                }
                strokeWidth="1.5"
              />
              {spokeEndpoints(m.wheel, i === 0).map((s, n) => (
                <line
                  key={n}
                  x1={s.hub[0] * 1000}
                  y1={-s.hub[1] * 1000}
                  x2={s.rim[0] * 1000}
                  y2={-s.rim[1] * 1000}
                  stroke={
                    componentPaints.wheelset ? finish("wheelset") : "#858f9e"
                  }
                  strokeWidth="1.3"
                />
              ))}
              <circle r={i === 0 ? 28 : 22} fill={finish("wheelset")} />
              <circle
                r="10"
                fill="none"
                stroke={finish("wheelset")}
                strokeWidth="3"
              />
              <circle
                r="6"
                fill={componentPaints.wheelset ? finish("wheelset") : "#c0c7d1"}
                stroke="#353e4b"
                strokeWidth="2"
              />
              <path
                d={`M0 ${-m.wheel.rimInner * 1000 + 3}v16`}
                stroke={finish("wheelset")}
                strokeWidth="4"
              />
            </g>
          ))}
        </g>
        <g {...interactive("tires")}>
          <path
            d={
              "M" +
              (rear.x - radius + 5) +
              " -45 A" +
              radius +
              " " +
              radius +
              " 0 0 1 " +
              (rear.x + radius - 5) +
              " -45 M" +
              (front.x - radius + 5) +
              " -45 A" +
              radius +
              " " +
              radius +
              " 0 0 1 " +
              (front.x + radius - 5) +
              " -45"
            }
            fill="none"
            stroke="transparent"
            strokeWidth="28"
          />
        </g>
        <g {...interactive("frameset")}>
          <FrameFinish2D
            product={frameRecord.product}
            variant={frameRecord.variant}
            metal={metal}
            rasterData={rasterData}
          />
        </g>
        <g {...interactive("saddle")}>
          <g data-finish-zone="seatpost">
            {tube(
              seat,
              saddle,
              m.saddle.postDiameter * 1000,
              finish("seatpost"),
            )}
          </g>
          <path
            d={smooth([
              { x: saddle.x - 94, y: saddle.y - 31 },
              { x: saddle.x - 70, y: saddle.y - 15 },
              { x: saddle.x + 40, y: saddle.y - 12 },
              { x: saddle.x + 98, y: saddle.y - 31 },
            ])}
            fill="none"
            stroke="#87919e"
            strokeWidth="7"
          />
          <rect
            x={saddle.x - 23}
            y={saddle.y - 17}
            width="46"
            height="18"
            rx="5"
            fill={finish("seatpost")}
          />
          <path
            d={`M${saddle.x - 13} ${saddle.y - 11}h26`}
            stroke="#8993a0"
            strokeWidth="3"
          />
          {[-10, 10].map((x) => (
            <circle
              key={x}
              cx={saddle.x + x}
              cy={saddle.y - 10}
              r="3"
              fill="#bbc3cd"
              stroke="#313a46"
              strokeWidth="1"
            />
          ))}
          <path
            d={
              "M" +
              (saddle.x - m.saddle.length * 520) +
              " " +
              (saddle.y - 48) +
              " Q" +
              (saddle.x - m.saddle.length * 350) +
              " " +
              (saddle.y - 67) +
              " " +
              saddle.x +
              " " +
              (saddle.y - 54) +
              " L" +
              (saddle.x + m.saddle.length * 430) +
              " " +
              (saddle.y - 52) +
              " Q" +
              (saddle.x + m.saddle.length * 490) +
              " " +
              (saddle.y - 39) +
              " " +
              (saddle.x + m.saddle.length * 390) +
              " " +
              (saddle.y - 34) +
              " L" +
              (saddle.x - m.saddle.length * 410) +
              " " +
              (saddle.y - 32) +
              "Z"
            }
            fill="#252c36"
            stroke="#555f6e"
            strokeWidth="2"
          />
          <path
            d={`M${saddle.x - m.saddle.length * 450} ${saddle.y - 46}Q${saddle.x - 45} ${saddle.y - 58} ${saddle.x + m.saddle.length * 38} ${saddle.y - 46}L${saddle.x + m.saddle.length * 420} ${saddle.y - 44}`}
            fill="none"
            stroke="#626b77"
            strokeWidth="1.4"
          />
        </g>
        <g {...interactive("cockpit")}>
          <g data-steering-assembly="upper">
            {stackTube(
              0,
              stack.steererEnd,
              stack.upperDiameter / 2,
              stack.upperDiameter / 2,
              metal,
            )}
            {stackTube(
              0,
              stack.coverHeight,
              stack.headUpperRadius + 0.001,
              stack.upperDiameter / 2 + 0.0048,
              finish("stem"),
            )}
            {stack.quill ? (
              <>
                {stackTube(
                  stack.coverHeight - 0.004,
                  stack.coverHeight,
                  stack.upperDiameter / 2 + 0.0055,
                  stack.upperDiameter / 2 + 0.0055,
                  finish("stem"),
                )}
                {stackTube(
                  stack.coverHeight,
                  stack.stemCenter + 0.012,
                  (stack.upperDiameter - 0.0032) / 2,
                  (stack.upperDiameter - 0.0032) / 2,
                  finish("stem"),
                )}
              </>
            ) : (
              <>
                {Array.from(
                  { length: Math.ceil(stack.spacerHeight / 0.005) },
                  (_, i) =>
                    stackTube(
                      stack.coverHeight + i * 0.005,
                      stack.coverHeight +
                        Math.min(stack.spacerHeight, (i + 1) * 0.005),
                      stack.upperDiameter / 2 + 0.0039,
                      stack.upperDiameter / 2 + 0.0039,
                      finish("stem"),
                    ),
                ).map((part, i) => (
                  <React.Fragment key={i}>{part}</React.Fragment>
                ))}
                {stackTube(
                  stack.stemBottom,
                  stack.stemTop,
                  stack.upperDiameter / 2 + 0.0048,
                  stack.upperDiameter / 2 + 0.0048,
                  finish("stem"),
                )}
                {stackTube(
                  stack.stemTop,
                  stack.capTop,
                  stack.upperDiameter / 2 + 0.0038,
                  stack.upperDiameter / 2 + 0.0038,
                  finish("stem"),
                )}
              </>
            )}
          </g>
          <g data-finish-zone="stem">
            {tube(stem, bar, 28, finish("stem"))}
            {stack.quill && (
              <circle cx={stem.x} cy={stem.y} r="14" fill={finish("stem")} />
            )}
            <circle
              cx={bar.x}
              cy={bar.y}
              r={m.cockpit.clamp * 500 + 4}
              fill={finish("stem")}
            />
          </g>
          <path
            d={smooth(barPoints)}
            fill="none"
            stroke={componentPaints.handlebar ? finish("handlebar") : "#242c37"}
            strokeWidth={m.cockpit.tubeDiameter * 1000}
            data-finish-zone="handlebar"
          />
          <path
            d={smooth(
              barPoints.slice(Math.max(0, Math.floor(barPoints.length * 0.55))),
            )}
            fill="none"
            stroke="#202630"
            strokeWidth={m.cockpit.tubeDiameter * 1000 + 2.8}
          />
        </g>
        <g {...interactive("drivetrain")}>
          {tube(bb, project(d.pedals[1]), 22, finish("crankArms"))}
          <rect
            x={project(d.pedals[1]).x - 43}
            y={project(d.pedals[1]).y - 6}
            width="86"
            height="12"
            rx="4"
            fill="#404a58"
          />
          <path d={chain} fill="none" stroke="#88929e" strokeWidth="6.4" />
          <path
            d={chain}
            fill="none"
            stroke="#3c4552"
            strokeWidth="3"
            strokeDasharray="4 8.7"
          />
          <path
            d={gear(d.rearTeeth, rearRadius, 12, rear)}
            fill={metal}
            fillRule="evenodd"
            data-teeth={d.rearTeeth}
          />
          <path
            d={gear(d.frontTeeth, frontRadius, frontRadius - 26, bb)}
            fill={finish("chainring")}
            data-finish-zone="chainring"
            fillRule="evenodd"
            data-teeth={d.frontTeeth}
          />
          {Array.from({ length: 5 }, (_, i) => {
            const a = (i * Math.PI * 2) / 5 + d.crankAngle,
              p = {
                x: bb.x + Math.cos(a) * (frontRadius - 20),
                y: bb.y - Math.sin(a) * (frontRadius - 20),
              };
            return (
              <g key={i}>
                <path
                  d={line(
                    [
                      {
                        x: bb.x + Math.cos(a) * 14 - Math.sin(a) * 14,
                        y: bb.y - Math.sin(a) * 14 - Math.cos(a) * 14,
                      },
                      { x: p.x - Math.sin(a) * 7, y: p.y - Math.cos(a) * 7 },
                      { x: p.x + Math.sin(a) * 7, y: p.y + Math.cos(a) * 7 },
                      {
                        x: bb.x + Math.cos(a) * 14 + Math.sin(a) * 14,
                        y: bb.y - Math.sin(a) * 14 + Math.cos(a) * 14,
                      },
                    ],
                    true,
                  )}
                  fill={
                    componentPaints.crankArms ? finish("crankArms") : "#4a5463"
                  }
                />
                <circle cx={p.x} cy={p.y} r="3.7" fill="#b8c1ce" />
              </g>
            );
          })}
          <g data-finish-zone="crankArms">
            {tube(bb, project(d.pedals[0]), 23, finish("crankArms"))}
          </g>
          <rect
            x={project(d.pedals[0]).x - 44}
            y={project(d.pedals[0]).y - 7}
            width="88"
            height="14"
            rx="4"
            fill="#333d4b"
            stroke="#858f9e"
            strokeWidth="2"
          />
          <circle cx={bb.x} cy={bb.y} r="8" fill="#a9b3c0" />
        </g>
        <g data-layer="outer-axle-hardware">
          {[rear, front].map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="7.5"
              fill={finish("wheelset")}
              stroke="#323b47"
              strokeWidth="1"
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
