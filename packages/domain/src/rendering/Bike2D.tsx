import React, { useId, type KeyboardEvent } from "react";
import {
  assemblyGeometry,
  variantById,
  type Configuration,
  type Product,
  type Slot,
} from "@tracklab/domain";
type Props = {
  configuration: Configuration;
  catalog: Product[];
  active?: Slot;
  onSelect?: (slot: Slot) => void;
  zoom?: number;
  compact?: boolean;
};
export function Bike2D({
  configuration,
  catalog,
  active,
  onSelect,
  zoom = 1,
  compact = false,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const get = (slot: Slot) =>
    variantById(catalog, configuration[slot])?.variant;
  const frame = get("frameset"),
    g = assemblyGeometry(frame?.specs);
  const paint=frame?.color||'#535963';
  const highlight='#'+[1,3,5].map(index=>Math.round(parseInt(paint.slice(index,index+2),16)*.86+255*.14).toString(16).padStart(2,'0')).join('');
  const {
    rear,
    front,
    bb,
    seat,
    head,
    headBottom,
    saddle,
    bar,
    radius,
    bounds:frameBounds,
  } = g;
  const deep = get("wheels")?.specs.rimDepth === 60,
    tan = get("tires")?.specs.sidewall === "tan";
  const bullhorn=get('cockpit')?.specs.shape==='bullhorn';
  const riser = get("cockpit")?.specs.shape === "riser",
    comfort = get("saddle")?.specs.shape === "comfort";
  const bounds={...frameBounds,y:Math.min(frameBounds.y,bar.y-(bullhorn?110:riser?45:30)-12)};
  bounds.height=radius+12-bounds.y;
  const margin = compact ? 12 : 16;
  const interactive = (slot: Slot) =>
    onSelect
      ? {
          role: "button",
          tabIndex: 0,
          "aria-label": `Select ${slot} on bicycle`,
          onClick: () => onSelect(slot),
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(slot);
            }
          },
          className: `bike-part ${active === slot ? "is-active" : ""}`,
        }
      : {};
  const tube = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    width: number,
    paint = `url(#${uid}-paint)`,
  ) => (
    <g>
      <path
        d={`M${a.x} ${a.y}L${b.x} ${b.y}`}
        stroke="#21252b"
        strokeWidth={width + 1.5}
      />
      <path
        d={`M${a.x} ${a.y}L${b.x} ${b.y}`}
        stroke={paint}
        strokeWidth={width}
      />
      <path
        d={`M${a.x} ${a.y - 2}L${b.x} ${b.y - 2}`}
        stroke="#fff"
        opacity=".22"
        strokeWidth="2"
      />
    </g>
  );
  return (
    <svg
      className={`bike-svg ${compact ? "compact" : ""}`}
      viewBox={`${bounds.x - margin} ${bounds.y - margin} ${bounds.width + margin * 2} ${bounds.height + margin * 2}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Illustrative fixed-gear bicycle, side profile. Not manufacturer geometry."
      data-frame-variant={configuration.frameset}
    >
      <defs>
        <linearGradient id={`${uid}-paint`} x1="0" y1="0" x2=".2" y2="1">
          <stop stopColor={frame?.color || "#535963"} />
          <stop offset=".35" stopColor={frame?.color || "#535963"} />
          <stop offset=".5" stopColor={highlight} />
          <stop offset=".63" stopColor={frame?.color || "#535963"} />
          <stop offset="1" stopColor="#272c33" />
        </linearGradient>
        <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#868d98" />
          <stop offset=".3" stopColor="#363c46" />
          <stop offset="1" stopColor="#171b22" />
        </linearGradient>
      </defs>
      <g
        transform={`translate(${front.x / 2} ${bounds.y + bounds.height / 2}) scale(${zoom}) translate(${-front.x / 2} ${-(bounds.y + bounds.height / 2)})`}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse
          cx={front.x / 2}
          cy={radius + 3}
          rx={front.x / 2 + radius - 30}
          ry="9"
          fill="#171c26"
          opacity=".08"
        />
        <g {...interactive("wheels")}>
          {[rear, front].map((axle, i) => (
            <g key={i} transform={`translate(${axle.x} 0)`}>
              <circle
                r={radius - 10}
                fill="none"
                stroke="#1c2027"
                strokeWidth="21"
              />
              <circle
                r={radius - 8}
                fill="none"
                stroke={tan ? "#ae8d5b" : "#565d68"}
                strokeWidth={tan ? 7 : 2}
              />
              <circle
                r={deep ? radius - 49 : radius - 28}
                fill="none"
                stroke={`url(#${uid}-metal)`}
                strokeWidth={deep ? 56 : 24}
              />
              <circle
                r={radius - 18}
                fill="none"
                stroke="#9aa2ae"
                strokeWidth="2"
              />
              {Array.from({ length: compact ? 20 : 32 }, (_, n) => {
                const angle = (n * Math.PI * 2) / (compact ? 20 : 32);
                return (
                  <line
                    key={n}
                    x1={Math.cos(angle + 0.5) * 14}
                    y1={Math.sin(angle + 0.5) * 14}
                    x2={Math.cos(angle) * (radius - (deep ? 78 : 42))}
                    y2={Math.sin(angle) * (radius - (deep ? 78 : 42))}
                    stroke="#7e8794"
                    strokeWidth="1.4"
                  />
                );
              })}
              <circle r="17" fill="#353c46" stroke="#b1b8c3" strokeWidth="3" />
              <circle r="7" fill="#c8ccd2" stroke="#343a44" strokeWidth="2" />
            </g>
          ))}
        </g>
        <g {...interactive("tires")}>
          <path
            d={`M${rear.x - radius + 5} -45 A${radius} ${radius} 0 0 1 ${rear.x + radius - 5} -45 M${front.x - radius + 5} -45 A${radius} ${radius} 0 0 1 ${front.x + radius - 5} -45`}
            fill="none"
            stroke="transparent"
            strokeWidth="25"
          />
        </g>
        <g {...interactive("frameset")}>
          {tube(rear, seat, 13)}
          {tube(rear, bb, 18)}
          {tube(seat, head, g.frameWidth)}
          {tube(bb, seat, g.frameWidth + 2)}
          {tube(bb, headBottom, g.frameWidth + 10)}
          {tube(head, headBottom, g.frameWidth + 9)}
          <path
            d={String(frame?.specs.forkProfile||'').startsWith('straight')?`M${headBottom.x} ${headBottom.y} L${front.x} 0`:`M${headBottom.x} ${headBottom.y} Q${headBottom.x + 38} ${headBottom.y + 110} ${front.x} 0`}
            fill="none"
            stroke="#20252d"
            strokeWidth="25"
          />
          <path
            d={String(frame?.specs.forkProfile||'').startsWith('straight')?`M${headBottom.x+1} ${headBottom.y+10} L${front.x+1} -8`:`M${headBottom.x + 1} ${headBottom.y + 10} Q${headBottom.x + 40} ${headBottom.y + 110} ${front.x + 1} -8`}
            fill="none"
            stroke="#636c78"
            strokeWidth="6"
          />
          <circle cx={rear.x} cy="0" r="8" fill="#abb3bf" />
          <circle cx={front.x} cy="0" r="8" fill="#abb3bf" />
        </g>
        <g {...interactive("saddle")}>
          {tube(seat, saddle, Number(get('saddle')?.specs.seatpost)||22, `url(#${uid}-metal)`)}
          <path
            d={`M${saddle.x - 44} ${saddle.y - 3} Q${saddle.x} ${saddle.y + 15} ${saddle.x + 62} ${saddle.y - 4}`}
            fill="none"
            stroke="#848b94"
            strokeWidth="5"
          />
          <path
            d={`M${saddle.x - 83} ${saddle.y - 21} Q${saddle.x - 48} ${saddle.y - 30} ${saddle.x - 5} ${saddle.y - 20} L${saddle.x + 85} ${saddle.y - 18} Q${saddle.x + 98} ${saddle.y - 8} ${saddle.x + 58} ${saddle.y - 4} L${saddle.x - 38} ${saddle.y + (comfort ? 8 : 0)} Q${saddle.x - 72} ${saddle.y + 1} ${saddle.x - 83} ${saddle.y - 21}Z`}
            fill={`url(#${uid}-metal)`}
            stroke="#20252b"
            strokeWidth="3"
          />
        </g>
        <g {...interactive("cockpit")}>
          {tube(
            head,
            { x: head.x - 7, y: head.y - 48 },
            26,
            `url(#${uid}-metal)`,
          )}
          {tube(
            { x: head.x - 7, y: head.y - 48 },
            bar,
            25,
            `url(#${uid}-metal)`,
          )}
          <path
            d={
              bullhorn ? `M${bar.x-12} ${bar.y} Q${bar.x+70} ${bar.y-5} ${bar.x+110} ${bar.y-85}` : riser
                ? `M${bar.x - 12} ${bar.y}L${bar.x + 40} ${bar.y - 28}L${bar.x + 108} ${bar.y - 28}`
                : `M${bar.x - 10} ${bar.y} C${bar.x + 75} ${bar.y - 8} ${bar.x + 112} ${bar.y + 18} ${bar.x + 109} ${bar.y + 65} Q${bar.x + 111} ${bar.y + 114} ${bar.x + 50} ${bar.y + 121} L${bar.x + 20} ${bar.y + 118}`
            }
            fill="none"
            stroke="#222831"
            strokeWidth="24"
          />
          <path
            d={
              riser
                ? `M${bar.x + 58} ${bar.y - 28}L${bar.x + 108} ${bar.y - 28}`
                : `M${bar.x + 15} ${bar.y + 1} Q${bar.x + 101} ${bar.y - 3} ${bar.x + 102} ${bar.y + 61} Q${bar.x + 104} ${bar.y + 106} ${bar.x + 31} ${bar.y + 112}`
            }
            fill="none"
            stroke="#57616e"
            strokeWidth="4"
          />
        </g>
        <g {...interactive("drivetrain")}>
          <path
            d={`M0 -24 L${bb.x} ${bb.y - 83} A83 83 0 0 1 ${bb.x} ${bb.y + 83} L0 24 A24 24 0 0 1 0 -24Z`}
            fill="none"
            stroke="#979b9d"
            strokeWidth="7"
          />
          <path
            d={`M0 -24 L${bb.x} ${bb.y - 83} A83 83 0 0 1 ${bb.x} ${bb.y + 83} L0 24 A24 24 0 0 1 0 -24Z`}
            fill="none"
            stroke="#30363f"
            strokeWidth="3"
            strokeDasharray="4 5"
          />
          <circle
            cx={bb.x}
            cy={bb.y}
            r="80"
            fill="#303741"
            stroke="#9099a5"
            strokeWidth="4"
          />
          {Array.from({ length: 5 }, (_, i) => (
            <path
              key={i}
              d={`M${bb.x + 13} ${bb.y - 22} L${bb.x + 30} ${bb.y - 61} Q${bb.x + 49} ${bb.y - 56} ${bb.x + 58} ${bb.y - 37} L${bb.x + 29} ${bb.y - 11}Z`}
              fill="#dde1e7"
              transform={`rotate(${i * 72} ${bb.x} ${bb.y})`}
            />
          ))}
          <circle
            cx={bb.x}
            cy={bb.y}
            r="83"
            fill="none"
            stroke="#65707c"
            strokeWidth="5"
            strokeDasharray="2 7"
          />
          {tube(bb, { x: bb.x + 118, y: bb.y + 45 }, 22, `url(#${uid}-metal)`)}
          <rect
            x={bb.x + 93}
            y={bb.y + 42}
            width="63"
            height="17"
            rx="4"
            fill="#303741"
            stroke="#88929f"
            strokeWidth="2"
          />
          <circle
            cx={bb.x}
            cy={bb.y}
            r="13"
            fill="#b9c1cc"
            stroke="#363e49"
            strokeWidth="5"
          />
        </g>
      </g>
    </svg>
  );
}
