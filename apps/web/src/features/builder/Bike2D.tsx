import { useId } from 'react';
import { variantById, type Configuration, type Product, type Slot } from '@tracklab/domain';
type Props = { configuration: Configuration; catalog: Product[]; active?: Slot; onSelect?: (slot: Slot) => void; zoom?: number; compact?: boolean };
export function Bike2D({ configuration, catalog, active, onSelect, zoom = 1, compact = false }: Props) {
  const uid = useId().replace(/:/g, '');
  const get = (s: Slot) => variantById(catalog, configuration[s])?.variant;
  const color = get('frameset')?.color || '#303432';
  const pursuit = get('frameset')?.specs.geometry === 'pursuit';
  const deep = get('wheels')?.specs.rimDepth === 60;
  const tan = get('tires')?.specs.sidewall === 'tan';
  const riser = get('cockpit')?.specs.shape === 'riser';
  const comfort = get('saddle')?.specs.shape === 'comfort';
  const a = { rx: 205, ry: 380, fx: 700, fy: 380, bx: 395, by: 398, sx: 337, sy: pursuit ? 177 : 163, hx: 617, hy: pursuit ? 190 : 163, lx: 637, ly: 228 };
  const interactive = (slot: Slot) => onSelect ? { role: 'button', tabIndex: 0, 'aria-label': `Select ${slot} on bicycle`, onClick: () => onSelect(slot), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(slot); } }, className: `bike-part ${active === slot ? 'is-active' : ''}` } : {};
  const tube = (x1: number, y1: number, x2: number, y2: number, width: number, fill = `url(#${uid}-paint)`) => <><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#182c25" strokeWidth={width + 2} /><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={fill} strokeWidth={width}/><line x1={x1 - 1} y1={y1 - 2} x2={x2 - 1} y2={y2 - 2} stroke="#ffffff" opacity=".13" strokeWidth="2"/></>;
  return <svg className={`bike-svg ${compact ? 'compact' : ''}`} viewBox="0 35 900 520" role="img" aria-label="Illustrative fixed-gear bicycle, side profile. Not manufacturer geometry.">
    <defs>
      <linearGradient id={`${uid}-paint`} gradientUnits="userSpaceOnUse" x1="200" y1="130" x2="700" y2="430"><stop stopColor={color}/><stop offset=".38" stopColor={color}/><stop offset=".5" stopColor={color} stopOpacity=".86"/><stop offset="1" stopColor={color}/></linearGradient>
      <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#777c77"/><stop offset=".35" stopColor="#353b36"/><stop offset="1" stopColor="#151b17"/></linearGradient>
      <radialGradient id={`${uid}-shadow`}><stop stopColor="#16241c" stopOpacity=".17"/><stop offset="1" stopColor="#16241c" stopOpacity="0"/></radialGradient>
    </defs>
    <g transform={`translate(450 285) scale(${zoom}) translate(-450 -285)`}>
      <ellipse cx="452" cy="520" rx="370" ry="18" fill={`url(#${uid}-shadow)`}/>
      <g {...interactive('wheels')}>
        {[a.rx, a.fx].map((x, wi) => <g key={x}>
          <circle cx={x} cy="380" r="135" fill="none" stroke="#141b17" strokeWidth="15"/>
          <circle cx={x} cy="380" r="136" fill="none" stroke={tan ? '#b69a72' : '#464b46'} strokeWidth={tan ? 5 : 2}/>
          <circle cx={x} cy="380" r={deep ? 120 : 127} fill="none" stroke={`url(#${uid}-metal)`} strokeWidth={deep ? 25 : 9}/>
          <circle cx={x} cy="380" r="129" fill="none" stroke="#939890" strokeWidth="1"/>
          {Array.from({ length: compact ? 16 : 28 }, (_, i) => { const angle = (i * Math.PI * 2) / (compact ? 16 : 28); const radius = deep ? 106 : 122; return <line key={i} x1={x + Math.cos(angle + .7) * 7} y1={380 + Math.sin(angle + .7) * 7} x2={x + Math.cos(angle) * radius} y2={380 + Math.sin(angle) * radius} stroke={wi ? '#7f857e' : '#727b71'} strokeWidth=".85"/>; })}
          <circle cx={x} cy="380" r="8" fill="#222d25" stroke="#969e93" strokeWidth="2"/>
          {!compact && <text x={x} y="264" textAnchor="middle" fontSize="7" fill="#aeb5a9" letterSpacing="3">TRACKLAB STUDIO</text>}
        </g>)}
      </g>
      <g {...interactive('tires')}><path d="M75 354 A135 135 0 0 1 335 354M570 354 A135 135 0 0 1 830 354" stroke="transparent" strokeWidth="22" fill="none"/></g>
      <g strokeLinecap="round" strokeLinejoin="round" {...interactive('frameset')}>
        {tube(a.rx, a.ry, a.sx, a.sy, 8)}{tube(a.rx, a.ry, a.bx, a.by, 11)}
        {tube(a.sx, a.sy, a.hx, a.hy, 15)}{tube(a.sx, a.sy, a.bx, a.by, 18)}
        {tube(a.bx, a.by, a.lx, a.ly, 23)}{tube(a.hx - 3, a.hy - 11, a.lx + 5, a.ly + 10, 24)}
        {tube(a.lx, a.ly, a.fx, a.fy, 16)}
        <circle cx={a.rx} cy={a.ry} r="7" fill="#2d3730" stroke="#7a8478" strokeWidth="2"/>
        <circle cx={a.fx} cy={a.fy} r="6" fill="#333d34" stroke="#7a8478" strokeWidth="2"/>
        {!compact && <text x="472" y="316" transform="rotate(-36 472 316)" fill="#e7eee2" opacity=".7" fontSize="11" fontWeight="700" letterSpacing="4">STUDIO</text>}
      </g>
      <g {...interactive('saddle')}>
        <path d={`M${a.sx} ${a.sy} L315 100`} stroke={`url(#${uid}-metal)`} strokeWidth="13"/>
        <path d="M292 86 Q337 104 366 86" fill="none" stroke="#747b70" strokeWidth="3"/>
        <path d={comfort ? 'M272 72 Q305 66 345 72 L377 77 Q389 83 371 91 L307 94 Q279 92 272 72Z' : 'M271 75 Q300 76 320 80 Q345 76 374 79 Q388 80 382 87 L316 94 Q292 91 271 80Z'} fill={`url(#${uid}-metal)`} stroke="#1c211c" strokeWidth="2"/>
        <path d="M279 77 Q315 87 375 82" fill="none" stroke="#8e958b" strokeWidth="1"/>
        <rect x={a.sx - 9} y={a.sy - 4} width="19" height="6" rx="2" fill="#303d31" transform={`rotate(-17 ${a.sx} ${a.sy})`}/>
      </g>
      <g {...interactive('cockpit')} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${a.hx} ${a.hy - 7} L${a.hx - 10} 126 L665 121`} stroke="#1b231d" strokeWidth="14"/>
        <path d={riser ? 'M664 121 L681 102 L718 102 M680 102 L651 98' : 'M663 121 Q710 121 720 146 Q733 174 709 190 L685 196'} stroke={`url(#${uid}-metal)`} strokeWidth="14"/>
        <path d={riser ? 'M692 102 L721 102' : 'M675 123 Q710 125 718 148 Q725 174 707 184 L687 190'} stroke="#31372f" strokeWidth="10"/>
        {!riser && Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${697 + Math.sin(i / 3) * 20} ${128 + i * 8} l7 -3`} stroke="#555b51" strokeWidth="1.1"/>)}
        <path d={`M${a.hx - 13} 128 l13 -3`} stroke="#626c5d" strokeWidth="3"/>
      </g>
      <g {...interactive('drivetrain')}>
        <path d="M205 365 L395 353 A45 45 0 0 1 395 443 L205 395 A15 15 0 0 1 205 365" fill="none" stroke="#6b7265" strokeWidth="4"/>
        <path d="M205 365 L395 353 A45 45 0 0 1 395 443 L205 395 A15 15 0 0 1 205 365" fill="none" stroke="#20281e" strokeWidth="2" strokeDasharray="3 3"/>
        <circle cx="395" cy="398" r="45" fill="none" stroke="#242c24" strokeWidth="9"/>
        <circle cx="395" cy="398" r="48" fill="none" stroke="#4b5547" strokeWidth="3" strokeDasharray="2 3"/>
        {Array.from({ length: 5 }, (_, i) => <path key={i} d="M395 398 L391 356 L406 356Z" transform={`rotate(${i * 72} 395 398)`} fill="#2e382b"/>)}
        <circle cx="395" cy="398" r="13" fill="#293126" stroke="#5a6652" strokeWidth="2"/>
        <path d="M395 398 L471 412" stroke="#1c241c" strokeWidth="12" strokeLinecap="round"/>
        <path d="M400 396 L470 409" stroke="#68715f" strokeWidth="2"/>
        <rect x="461" y="407" width="29" height="9" rx="2" fill="#222a20" stroke="#69725f"/>
        <circle cx="395" cy="398" r="5" fill="#11190f" stroke="#9aa58d" strokeWidth="2"/>
      </g>
    </g>
  </svg>;
}
