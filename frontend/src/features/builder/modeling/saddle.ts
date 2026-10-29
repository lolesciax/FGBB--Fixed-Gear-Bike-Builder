import * as THREE from "three";
import type { BicycleGeometry, Position } from "@tracklab/domain";
import { cylinder, material, mesh, tube, extrude } from "./primitives";
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
function sectionWidth(u: number) {
  let section = 1;
  while (contour[section][0] < u) section++;
  const before = contour[section - 1],
    after = contour[section];
  return THREE.MathUtils.lerp(
    before[1],
    after[1],
    THREE.MathUtils.smoothstep(u, before[0], after[0]),
  );
}

function saddleSurface(
  length: number,
  width: number,
  base: number,
  thickness: number,
) {
  const positions: number[] = [],
    indices: number[] = [],
    longitudinal = 42,
    radial = 24;
  for (let i = 0; i <= longitudinal; i++) {
    const u = i / longitudinal;
    const half = (sectionWidth(u) * width) / 2,
      y =
        base +
        0.006 * Math.cos(u * Math.PI) +
        0.004 * Math.max(0, (u - 0.7) / 0.3);
    const endRound = Math.sqrt(Math.min(1, u / 0.045, (1 - u) / 0.045));
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      positions.push(
        (u - 0.52) * length,
        y +
          Math.sin(a) * thickness * endRound -
          (thickness > 0.01 && Math.sin(a) > 0
            ? 0.0055 *
              Math.exp(-Math.pow((Math.cos(a) * half) / 0.014, 2)) *
              THREE.MathUtils.smoothstep(u, 0.15, 0.3) *
              (1 - THREE.MathUtils.smoothstep(u, 0.72, 0.9))
            : 0),
        Math.cos(a) * half,
      );
      if (i < longitudinal && j < radial) {
        const k = i * (radial + 1) + j,
          n = k + radial + 1;
        indices.push(k, n, k + 1, n, n + 1, k + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
export function createSaddle(g: BicycleGeometry) {
  const group = new THREE.Group();
  group.name = "seating_assembly";
  const metal = material("#606b79", 0.7, 0.37),
    shell = material("#222831", 0.05, 0.72),
    padding = material("#252a32", 0, 0.9);
  metal.name = "finish_seatpost";
  const railMetal = material("#8a929d", 0.82, 0.28);
  cylinder(
    group,
    "seatpost",
    g.seat,
    g.saddlePost,
    g.saddle.postDiameter / 2,
    metal,
  );
  const collarEnd = g.seat.map((v, i) => v + g.seatAxis[i] * 0.011) as Position;
  cylinder(
    group,
    "seatpost_collar",
    g.seat,
    collarEnd,
    g.saddle.postDiameter / 2 + 0.0035,
    metal,
  );
  const head = mesh(
    group,
    "seatpost_head",
    (() => {
      const shape = new THREE.Shape();
      shape.moveTo(-0.022, -0.008);
      shape.lineTo(0.022, -0.008);
      shape.lineTo(0.018, 0.009);
      shape.lineTo(-0.018, 0.009);
      shape.closePath();
      return extrude(shape, 0.05, 0.0025);
    })(),
    metal,
    g.saddlePost,
  );
  head.position.y += 0.004;
  for (const side of [-1, 1]) {
    const rail: Position[] = [
      [-0.094, 0.031, side * 0.022],
      [-0.07, 0.015, side * 0.022],
      [-0.035, 0.012, side * 0.022],
      [0.04, 0.012, side * 0.022],
      [0.08, 0.024, side * 0.012],
      [0.098, 0.031, side * 0.008],
    ].map((p) => [p[0] + g.saddlePost[0], p[1] + g.saddlePost[1], p[2]]);
    tube(group, `saddle_rail_${side}`, rail, 0.0035, railMetal, 32, 8);
  }
  mesh(
    group,
    "rail_clamp",
    new THREE.BoxGeometry(0.032, 0.009, 0.055),
    railMetal,
    g.saddleClamp,
  );
  for (const x of [-0.01, 0.01])
    cylinder(
      group,
      `rail_clamp_bolt_${x}`,
      [g.saddleClamp[0] + x, g.saddleClamp[1] - 0.008, 0],
      [g.saddleClamp[0] + x, g.saddleClamp[1] + 0.005, 0],
      0.003,
      railMetal,
      0.003,
      6,
    );
  mesh(
    group,
    "saddle_shell",
    saddleSurface(g.saddle.length * 0.99, g.saddle.width * 0.98, 0.034, 0.0035),
    shell,
    g.saddlePost,
  );
  const seam = material("#454c57", 0, 0.82);
  for (const side of [-1, 1])
    tube(
      group,
      `cover_seam_${side}`,
      Array.from({ length: 41 }, (_, i) => {
        const u = (i + 1) / 42;
        return [
          (u - 0.52) * g.saddle.length + g.saddlePost[0],
          g.saddlePost[1] +
            0.046 +
            0.006 * Math.cos(u * Math.PI) +
            0.004 * Math.max(0, (u - 0.7) / 0.3),
          side * ((sectionWidth(u) * g.saddle.width) / 2 + 0.0002),
        ] as Position;
      }),
      0.0007,
      seam,
      64,
      5,
    );
  mesh(
    group,
    "shaped_padding",
    saddleSurface(g.saddle.length, g.saddle.width, 0.046, 0.012),
    padding,
    g.saddlePost,
  );
  group.userData = {
    fidelity: "illustrative",
    length: g.saddle.length,
    width: g.saddle.width,
    postAxis: g.seatAxis,
    clamp: g.saddleClamp,
  };
  return group;
}
