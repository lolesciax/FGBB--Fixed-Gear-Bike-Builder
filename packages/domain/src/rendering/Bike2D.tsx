import React, { useId, type KeyboardEvent } from "react";
import {
  componentGeometry,
  selectedColorway,
  handlebarPoints,
  spokeEndpoints,
  crankArmOutline,
  saddleSilhouette,saddleRailPoints,saddleSurfacePoint,
  catmullRomSegments,
  postSilhouette,
  renderMorphologyId,
  variantById,
  slots,
  finishZones,
  wheelFinishRegions,type WheelFinishRegion,
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
const spline=(points:Position[])=>catmullRomSegments(points).map(([a,b,c,d],i)=>`${i?'':`M${project(a).x} ${project(a).y}`}C${project(b).x} ${project(b).y} ${project(c).x} ${project(c).y} ${project(d).x} ${project(d).y}`).join(' ');
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
  const renderingFrame=variantById(catalog,configuration.frameset),morphologyId=renderingFrame&&renderMorphologyId(renderingFrame.product,renderingFrame.variant);
  const m = componentGeometry(
      Object.fromEntries(slots.map((slot) => [slot,slot==='frameset'?{...get(slot)?.specs,...(morphologyId?{morphologyId}:{})}:get(slot)?.specs])),
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
  const barWorld = handlebarPoints(get("cockpit")?.specs)
    .slice(Math.floor(handlebarPoints(get("cockpit")?.specs).length / 2))
    .map((p) => add(m.barClamp,p));
  const barPoints=barWorld.map(project);
  const bounds = {
    x: -radius - 8,
    y: Math.min(saddle.y-72,-radius-10,-m.head[1]*1000-60,-m.seat[1]*1000-35,...barPoints.map((p) => p.y - 18)),
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
  const wheelRecord=variantById(catalog,configuration.wheels)!;
  const wheelPaints=Object.fromEntries(wheelFinishRegions.map(region=>[region,componentPaint(wheelRecord.product,wheelRecord.variant,'wheelset',configuration.appearance?.wheelset,region)]));
  const wheelFinish=(region:WheelFinishRegion)=>wheelPaints[region]?`url(#${uid}-wheel-${region})`:metal;
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
  const armPath=(angle:number)=>line(crankArmOutline(d.crankLength).map(([x,y])=>({x:bb.x+(Math.cos(angle)*x-Math.sin(angle)*y)*1000,y:bb.y-(Math.sin(angle)*x+Math.cos(angle)*y)*1000})),true);
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
      data-geometry-revision="components-v4"
      data-frame-morphology={m.morphology?.id||'illustrative-round'}
      data-steering-profile={stack.profile}
      data-stem-style={stack.quill ? "quill" : "ahead"}
    >
      <defs>
        {wheelFinishRegions.map(region=>wheelPaints[region]&&<linearGradient key={region} id={`${uid}-wheel-${region}`} gradientUnits="userSpaceOnUse" x1="0" y1={-radius} x2="20" y2={radius}>{finishGradient(wheelPaints[region]).map((stop,i)=><stop key={i} offset={stop.at} stopColor={stop.color}/>)}</linearGradient>)}
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
        <g data-layer="far-drivetrain" aria-hidden="true" pointerEvents="none">
          <path d={armPath(d.crankAngle+Math.PI)} fill={finish('crankArms')} stroke="#343d48" strokeWidth="1"/>
          <rect x={project(d.pedals[1]).x-45} y={project(d.pedals[1]).y-6} width="90" height="12" rx="4" fill="#404a58"/>
        </g>
        <g {...interactive("wheels")} data-finish-zone="wheelset">
          {[rear, front].map((axle, i) => (
            <g key={i} data-wheel={i===0?'rear':'front'} data-spoke-count={i===0?m.wheel.rearBuild.count:m.wheel.frontBuild.count} data-lacing={i===0?m.wheel.rearBuild.lacing:m.wheel.frontBuild.lacing} transform={"translate(" + axle.x + " 0)"}>
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
                stroke={wheelFinish('rim')}
                strokeWidth={m.wheel.rimDepth * 1000}
              />
              <circle
                r={m.wheel.rimOuter * 1000}
                fill="none"
                stroke={
                  componentPaints.wheelset ? wheelFinish('rim') : "#a7afba"
                }
                strokeWidth="1.5"
              />
              {spokeEndpoints(m.wheel, i === 0).map((s, n) => (
                <line
                  key={n}
                  data-spoke={n}
                  x1={s.hub[0] * 1000}
                  y1={-s.hub[1] * 1000}
                  x2={s.rim[0] * 1000}
                  y2={-s.rim[1] * 1000}
                  stroke={
                    componentPaints.wheelset ? wheelFinish('spokes') : "#858f9e"
                  }
                  strokeWidth="1.3"
                />
              ))}
              <circle r={i === 0 ? 32 : 26} fill={wheelFinish('hub')} />
              <circle
                r="10"
                fill="none"
                stroke={wheelFinish('hub')}
                strokeWidth="3"
              />
              <circle
                r="6"
                fill={componentPaints.wheelset ? wheelFinish('hub') : "#c0c7d1"}
                stroke="#353e4b"
                strokeWidth="2"
              />
              <path
                d={`M0 ${-m.wheel.rimInner * 1000 + 3}v16`}
                stroke={wheelFinish('hub')}
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
        <g {...interactive("saddle")} data-seating-profile="shared-contour">
          <g data-finish-zone="seatpost" data-post-profile={m.morphology?.post.kind||'round'}>{m.morphology?.post.kind==='dedicated-aero'?<path d={line(postSilhouette(m).map(project),true)} fill={finish('seatpost')} stroke="#394452" strokeWidth="1"/>:tube(seat,saddle,m.saddle.postDiameter*1000,finish('seatpost'))}</g>
          <path d={line([{x:saddle.x-22,y:saddle.y+4},{x:saddle.x+22,y:saddle.y+4},{x:saddle.x+18,y:saddle.y-13},{x:saddle.x-18,y:saddle.y-13}],true)} fill={finish('seatpost')} stroke="#424b59" strokeWidth=".8"/>
          <path data-saddle-rails d={spline(saddleRailPoints(m.saddle,1).map(p=>add(m.saddlePost,p)))} fill="none" stroke="#87919e" strokeWidth={m.saddle.railHeight*1000}/>
          <g data-saddle-clamp fill={finish('seatpost')} stroke="#424b59" strokeWidth=".7">
            <rect x={saddle.x-16} y={saddle.y-12} width="32" height="7" rx="2"/>
            <rect x={saddle.x-16} y={saddle.y-19} width="32" height="7" rx="2"/>
          </g>
          {[-10,10].map(x=><path key={x} d={'M'+(saddle.x+x)+' '+(saddle.y-3)+'v-18'} stroke="#a4adba" strokeWidth="3"/>)}
          <path data-saddle-shell d={line(saddleSilhouette(m.saddle,'shell').map(p=>project(add(m.saddlePost,p))),true)} fill="#222831" stroke="#3d4653" strokeWidth=".8"/>
          <path data-saddle-cover d={line(saddleSilhouette(m.saddle,'cover').map(p=>project(add(m.saddlePost,p))),true)} fill="#252a32" stroke="#555e6b" strokeWidth=".9"/>
          <path d={smooth(Array.from({length:41},(_,i)=>project(add(m.saddlePost,saddleSurfacePoint(m.saddle,(i+1)/42,0,'cover')))))} fill="none" stroke="#626b77" strokeWidth=".8"/>
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
            d={spline(barWorld)}
            fill="none"
            stroke={componentPaints.handlebar ? finish("handlebar") : "#242c37"}
            strokeWidth={m.cockpit.tubeDiameter * 1000}
            data-finish-zone="handlebar"
          />
          <path
            d={spline(barWorld.slice(Math.max(0,Math.floor(barWorld.length*.55))))}
            fill="none"
            stroke="#202630"
            strokeWidth={m.cockpit.tubeDiameter * 1000 + 2.8}
          />
        </g>
        <g {...interactive("drivetrain")}>
          <path d={chain} fill="none" stroke="#88929e" strokeWidth="6.4" />
          <path
            d={chain}
            fill="none"
            stroke="#3c4552"
            strokeWidth="3"
            strokeDasharray="4 8.7"
          />
          <path
            d={gear(d.rearTeeth, rearRadius, 17.5, rear)}
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
            <path d={armPath(d.crankAngle)} fill={finish('crankArms')} stroke="#343d48" strokeWidth="1"/>
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
              fill={wheelFinish('hub')}
              stroke="#323b47"
              strokeWidth="1"
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
