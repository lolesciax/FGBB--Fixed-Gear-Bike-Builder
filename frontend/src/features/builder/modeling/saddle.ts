import * as THREE from "three";
import {
  saddleSurfacePoint,
  saddleHalfWidth,
  saddleRailPoints,
  type BicycleGeometry,
  type Position,
} from "@tracklab/domain";
import {
  cylinder,
  material,
  mesh,
  tube,
  extrude,
  curve,
  sweptSection,
} from "./primitives";

function saddleSurface(g: BicycleGeometry, layer: "shell" | "cover") {
  const positions: number[] = [],
    indices: number[] = [],
    longitudinal = 42,
    radial = 24;
  for (let i = 0; i <= longitudinal; i++) {
    const u = i / longitudinal;
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      positions.push(...saddleSurfacePoint(g.saddle, u, a, layer));
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
function railCradle(g: BicycleGeometry, upper = false) {
  const shape = new THREE.Shape(),
    rz = g.saddle.railWidth / 2 + 0.0002,
    rh = g.saddle.railHeight / 2 + 0.0002;
  shape.moveTo(-0.03, -0.007);
  shape.lineTo(0.03, -0.007);
  shape.lineTo(0.03, 0);
  for (const z of [0.022, -0.022]) {
    shape.lineTo(z + rz, 0);
    for (let i = 1; i <= 16; i++) {
      const a = (i * Math.PI) / 16;
      shape.lineTo(z + Math.cos(a) * rz, -Math.sin(a) * rh);
    }
  }
  shape.lineTo(-0.03, 0);
  shape.closePath();
  const geometry = extrude(shape, 0.032, 0);
  if (upper) geometry.rotateX(Math.PI);
  geometry.rotateY(Math.PI / 2);
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
      return extrude(shape, 0.032, 0.0025);
    })(),
    metal,
    g.saddlePost,
  );
  head.position.y += 0.004;
  for (const side of [-1, 1]) {
    const rail: Position[] = saddleRailPoints(g.saddle, side).map((p) => [
      p[0] + g.saddlePost[0],
      p[1] + g.saddlePost[1],
      p[2],
    ]);
    mesh(
      group,
      `saddle_rail_${side}`,
      sweptSection(
        curve(rail),
        40,
        12,
        () => [g.saddle.railWidth / 2, g.saddle.railHeight / 2],
        true,
      ),
      railMetal,
    );
    for (const [i, p] of [rail[0], rail.at(-1)!].entries())
      mesh(
        group,
        `rail_shell_anchor_${side}_${i}`,
        new THREE.SphereGeometry(0.005, 12, 8).scale(1.5, 0.8, 1.2),
        shell,
        p,
      );
  }
  mesh(group, "rail_clamp", railCradle(g), metal, g.saddleClamp);
  mesh(group, "rail_clamp_upper", railCradle(g, true), metal, g.saddleClamp);
  for (const x of [-0.01, 0.01])
    cylinder(
      group,
      `rail_clamp_bolt_${x}`,
      [g.saddleClamp[0] + x, g.saddleClamp[1] - 0.008, 0],
      [g.saddleClamp[0] + x, g.saddleClamp[1] + 0.009, 0],
      0.003,
      railMetal,
      0.003,
      6,
    );
  mesh(group, "saddle_shell", saddleSurface(g, "shell"), shell, g.saddlePost);
  const seam = material("#454c57", 0, 0.82);
  for (const side of [-1, 1])
    tube(
      group,
      `cover_seam_${side}`,
      Array.from({ length: 41 }, (_, i) => {
        const u = (i + 1) / 42;
        const point=saddleSurfacePoint(g.saddle,u,0,'cover');
        return [point[0]+g.saddlePost[0],point[1]+g.saddlePost[1],side*(saddleHalfWidth(g.saddle,u)+.0002)] as Position;
      }),
      0.0007,
      seam,
      64,
      5,
    );
  mesh(
    group,
    "shaped_padding",
    saddleSurface(g, "cover"),
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
