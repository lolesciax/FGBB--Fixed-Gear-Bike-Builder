import * as THREE from "three";
import type { BicycleGeometry, Position } from "@tracklab/domain";
import {
  axle,
  curve,
  cylinder,
  extrude,
  material,
  mesh,
  vector,
} from "./primitives";

function gear(teeth: number, radius: number, inner: number, thickness: number) {
  const shape = new THREE.Shape();
  for (let i = 0; i < teeth; i++)
    for (const [offset, r] of [
      [-0.5, radius - 0.0038],
      [-0.17, radius + 0.0027],
      [0.17, radius + 0.0027],
      [0.5, radius - 0.0038],
    ]) {
      const a = ((i + offset) * Math.PI * 2) / teeth,
        x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      if (i === 0 && offset === -0.5) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return extrude(shape, thickness, 0.00035);
}
function arm(length: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.016);
  shape.lineTo(length, 0.011);
  shape.absarc(length, 0, 0.011, Math.PI / 2, -Math.PI / 2, true);
  shape.lineTo(0, -0.016);
  shape.absarc(0, 0, 0.016, -Math.PI / 2, Math.PI / 2, true);
  return extrude(shape, 0.012, 0.0018);
}
function pedal() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.045, -0.04);
  shape.lineTo(0.045, -0.04);
  shape.lineTo(0.045, 0.04);
  shape.lineTo(-0.045, 0.04);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-0.03, -0.026);
  hole.lineTo(-0.03, 0.026);
  hole.lineTo(0.03, 0.026);
  hole.lineTo(0.03, -0.026);
  hole.closePath();
  shape.holes.push(hole);
  const geometry = extrude(shape, 0.012, 0.0015);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}
function chainPlate() {
  const shape = new THREE.Shape(),
    half = 0.00635,
    r = 0.0036;
  shape.moveTo(-half, r);
  shape.lineTo(half, r);
  shape.absarc(half, 0, r, Math.PI / 2, -Math.PI / 2, true);
  shape.lineTo(-half, -r);
  shape.absarc(-half, 0, r, -Math.PI / 2, Math.PI / 2, true);
  return extrude(shape, 0.001, 0);
}
export function createDrivetrain(g: BicycleGeometry) {
  const group = new THREE.Group();
  group.name = "fixed_drivetrain";
  const silver = material("#87919d", 0.8, 0.3),
    crank = material("#424b57", 0.7, 0.33),
    chainMat = material("#84909c", 0.72, 0.4),
    pedalMat = material("#343d48", 0.4, 0.58),
    d = g.drivetrain,
    c = d.chain;
  crank.name = "finish_crankArms";
  const chainring = crank.clone();
  chainring.name = "finish_chainring";
  axle(group, "crank_spindle", g.bb, 0.011, 0.145, silver);
  for (const side of [-1, 1])
    axle(
      group,
      `bb_cup_${side}`,
      [g.bb[0], g.bb[1], side * 0.035],
      0.02,
      0.007,
      crank,
    );
  const ring = mesh(
    group,
    "toothed_chainring",
    gear(
      d.frontTeeth,
      c.frontRadius,
      Math.max(0.035, c.frontRadius - 0.026),
      0.0035,
    ),
    chainring,
    [g.bb[0], g.bb[1], d.chainline],
  );
  ring.userData.teeth = d.frontTeeth;
  const cog = mesh(
    group,
    "fixed_rear_cog",
    gear(d.rearTeeth, c.rearRadius, 0.012, 0.0035),
    silver,
    [g.rear[0], g.rear[1], d.chainline],
  );
  cog.userData.teeth = d.rearTeeth;
  axle(
    group,
    "fixed_cog_lockring",
    [g.rear[0], g.rear[1], d.chainline + 0.004],
    0.021,
    0.004,
    silver,
  );
  const boltRadius = c.frontRadius - 0.02;
  axle(
    group,
    "spider_boss",
    [g.bb[0], g.bb[1], d.chainline],
    0.025,
    0.008,
    crank,
  );
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 + d.crankAngle,
      p: Position = [
        g.bb[0] + Math.cos(angle) * boltRadius,
        g.bb[1] + Math.sin(angle) * boltRadius,
        d.chainline,
      ];
    const web = new THREE.Shape();
    web.moveTo(0.014, -0.014);
    web.lineTo(boltRadius + 0.006, -0.007);
    web.quadraticCurveTo(boltRadius + 0.014, 0, boltRadius + 0.006, 0.007);
    web.lineTo(0.014, 0.014);
    web.closePath();
    const spider = mesh(
      group,
      `spider_arm_${i}`,
      extrude(web, 0.0055, 0.001),
      crank,
      [g.bb[0], g.bb[1], d.chainline],
    );
    spider.rotation.z = angle;
    axle(
      group,
      `chainring_bolt_${i}`,
      [p[0], p[1], p[2] + 0.004],
      0.0037,
      0.005,
      silver,
      6,
    );
  }
  const armGeometry = arm(d.crankLength),
    pedalGeometry = pedal();
  for (const [i, side] of [1, -1].entries()) {
    const part = mesh(group, `crank_arm_${side}`, armGeometry, crank, [
      g.bb[0],
      g.bb[1],
      side * d.armOffset,
    ]);
    part.rotation.z = d.crankAngle + i * Math.PI;
    axle(
      group,
      `crank_bolt_${side}`,
      [g.bb[0], g.bb[1], side * (d.armOffset + 0.008)],
      0.008,
      0.004,
      silver,
      6,
    );
    const p = d.pedals[i],
      center: Position = [p[0], p[1], p[2] + side * 0.05];
    cylinder(group, `pedal_spindle_${side}`, p, center, 0.0045, silver);
    mesh(group, `pedal_cage_${side}`, pedalGeometry, pedalMat, center);
    for (const x of [-0.025, 0, 0.025]) {
      mesh(
        group,
        `pedal_crossbar_${side}_${x}`,
        new THREE.BoxGeometry(0.006, 0.009, 0.058),
        pedalMat,
        [center[0] + x, center[1], center[2]],
      );
    }
  }
  const plateGeometry = chainPlate(),
    plates = new THREE.InstancedMesh(plateGeometry, chainMat, c.count * 2),
    rollers = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.0033, 0.0033, 0.0058, 8).rotateX(
        Math.PI / 2,
      ),
      silver,
      c.count,
    ),
    dummy = new THREE.Object3D();
  for (let i = 0; i < c.count; i++) {
    const a = c.at((i * c.length) / c.count),
      b = c.at(((i + 1) * c.length) / c.count),
      mid = vector(a).add(vector(b)).multiplyScalar(0.5),
      angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
    for (const [j, side] of [-1, 1].entries()) {
      dummy.position.set(
        mid.x,
        mid.y,
        d.chainline + side * (i % 2 === 0 ? 0.0032 : 0.0042),
      );
      dummy.rotation.set(0, 0, angle);
      dummy.updateMatrix();
      plates.setMatrixAt(i * 2 + j, dummy.matrix);
    }
    dummy.position.set(...a);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    rollers.setMatrixAt(i, dummy.matrix);
  }
  plates.name = "chain_link_plates";
  rollers.name = "chain_rollers";
  for (const item of [plates, rollers]) {
    item.instanceMatrix.needsUpdate = true;
    item.computeBoundingBox();
    item.computeBoundingSphere();
    group.add(item);
  }
  const frontPin = c.points.find(
    (p) =>
      p[0] > g.bb[0] &&
      Math.abs(Math.hypot(p[0] - g.bb[0], p[1] - g.bb[1]) - c.frontRadius) <
        0.0005,
  );
  if (frontPin)
    ring.rotation.z =
      Math.atan2(frontPin[1] - g.bb[1], frontPin[0] - g.bb[0]) +
      Math.PI / d.frontTeeth;
  // A thin continuous inner band keeps the simplified closed chain readable at mobile scale.
  const line = curve(c.points.slice(0, -1), true);
  mesh(
    group,
    "chain_inner_band",
    new THREE.TubeGeometry(line, 160, 0.0011, 5, true),
    chainMat,
  );
  group.userData = {
    fidelity: "illustrative",
    chainline: d.chainline,
    frontTeeth: d.frontTeeth,
    rearTeeth: d.rearTeeth,
    crankLength: d.crankLength,
    pedalAnchors: d.pedals,
    assumptions:
      "Illustrative mounting, tooth profiles and link closure; not a chain-length or assembly-fit calculator.",
  };
  return group;
}
