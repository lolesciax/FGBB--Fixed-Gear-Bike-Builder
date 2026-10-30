import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  assemblyGeometry,
  componentGeometry,
  cockpitDimensions,
  handlebarPoints,
  wheelDimensions,
  spokeEndpoints,
  pitchRadius,
  barTypes,
  type Position,
} from "@tracklab/domain";
import { manufacturerCatalog } from "../backend/src/manufacturer-catalog";
import {
  createFrame,
  createFork,
} from "../frontend/src/features/builder/modeling/frame";
import {
  createWheel,
  createTire,
} from "../frontend/src/features/builder/modeling/wheel";
import { createCockpit } from "../frontend/src/features/builder/modeling/cockpit";
import { createSaddle } from "../frontend/src/features/builder/modeling/saddle";
import { createDrivetrain } from "../frontend/src/features/builder/modeling/drivetrain";
import { disposeModel } from "../frontend/src/features/builder/modeling/primitives";
import { fitAssembly } from "../frontend/src/features/builder/studio-math";
import { cameraPresets } from "../frontend/src/features/builder/studio-settings";

const variants = manufacturerCatalog
  .filter((p) => p.status === "published")
  .flatMap((p) => p.variants);
const v = (p: Position) => new THREE.Vector3(...p);
function complete(shape: string) {
  const g = componentGeometry({ cockpit: { shape } }),
    root = new THREE.Group();
  root.add(
    createFrame(g, "#303432"),
    createWheel(g, false),
    createWheel(g, true),
    createCockpit(g, { shape }),
    createSaddle(g),
    createDrivetrain(g),
  );
  for (const axle of [g.rear, g.front]) {
    const tire = createTire(g);
    tire.position.set(...axle);
    root.add(tire);
  }
  return { g, root };
}
function vertices(root: THREE.Object3D, visit: (p: THREE.Vector3) => void) {
  root.updateWorldMatrix(true, true);
  const matrix = new THREE.Matrix4(),
    local = new THREE.Matrix4(),
    point = new THREE.Vector3();
  root.traverse((n) => {
    if (!(n instanceof THREE.Mesh)) return;
    const positions = n.geometry.getAttribute("position");
    for (let i = 0; i < (n instanceof THREE.InstancedMesh ? n.count : 1); i++) {
      matrix.copy(n.matrixWorld);
      if (n instanceof THREE.InstancedMesh) {
        n.getMatrixAt(i, local);
        matrix.multiply(local);
      }
      for (let j = 0; j < positions.count; j++) {
        point.fromBufferAttribute(positions, j).applyMatrix4(matrix);
        visit(point);
      }
    }
  });
}

describe("mechanical assembly geometry", () => {
  it("preserves reviewed frame anchors and a concentric steering axis in every published variant", () => {
    for (const item of variants) {
      const g = componentGeometry({ frameset: item.specs }),
        old = assemblyGeometry(item.specs);
      expect(g.frame).toEqual(old);
      expect(g.front[0]).toBeCloseTo(old.front.x / 1000, 10);
      expect(g.bb[1]).toBeCloseTo(-old.bb.y / 1000, 10);
      for (const p of [g.crown, g.stemBase, g.steererTop])
        expect(v(p).sub(v(g.head)).cross(v(g.axis)).length()).toBeLessThan(
          1e-10,
        );
      expect(g.front[2]).toBe(0);
      expect(g.forkHalf).toBeGreaterThan(g.wheel.width / 2 + 0.012);
    }
  });
  it("keeps fork surfaces outside the tire envelope and both axle interfaces attached", () => {
    for (const item of variants) {
      const g = componentGeometry({ frameset: item.specs }),
        fork = createFork(g);
      fork.updateWorldMatrix(true, true);
      for (const side of [-1, 1]) {
        const dropout = fork.getObjectByName(`fork_dropout_${side}`)!;
        expect(dropout.position.x).toBeCloseTo(g.front[0], 10);
        expect(dropout.position.y).toBeCloseTo(0,10);
        expect(Math.abs(dropout.position.z)-g.frontInterface.bodyThickness/2).toBeCloseTo(g.forkHalf, 10);
      }
      vertices(fork, (p) => {
        const r = Math.hypot(p.x - g.front[0], p.y - g.front[1]);
        if (r > g.wheel.bsd / 2 - 0.002 && r < g.wheel.radius - 0.001)
          expect(Math.abs(p.z)).toBeGreaterThan(g.wheel.width / 2 + 0.001);
      });
      disposeModel(fork);
    }
  });
  it("uses BSD and section dimensions without stretching wheel diameter to fit a frame", () => {
    const narrow = wheelDimensions({ bsd: 622, rimDepth: 25 }, { width: 25 }),
      wide = wheelDimensions({ bsd: 622, rimDepth: 60 }, { width: 28 });
    expect(narrow.radius).toBeCloseTo(0.336);
    expect(wide.radius).toBeCloseTo(0.339);
    expect(wide.rimOuter).toBe(narrow.rimOuter);
    expect(narrow.rimInner - wide.rimInner).toBeCloseTo(0.035);
    const a = componentGeometry({
        frameset: variants[0].specs,
        tires: { width: 28 },
      }),
      b = componentGeometry({
        frameset: variants.at(-1)!.specs,
        tires: { width: 28 },
      });
    expect(a.wheel.radius).toBe(b.wheel.radius);
    expect(a.groundY).toBe(-a.wheel.radius);
  });
  it("laces both hub flanges to rim interfaces with coherent counts and no tire penetration", () => {
    const w = wheelDimensions();
    for (const rear of [false, true]) {
      const spokes = spokeEndpoints(w, rear);
      expect(spokes).toHaveLength(32);
      expect(spokes.filter((s) => s.side === 1)).toHaveLength(16);
      for (const s of spokes) {
        expect(Math.hypot(s.hub[0], s.hub[1])).toBeCloseTo(
          rear ? 0.028 : 0.022,
        );
        expect(Math.hypot(s.rim[0], s.rim[1])).toBeCloseTo(w.rimInner + 0.002);
        expect(Math.sign(s.hub[2])).toBe(s.side);
        expect(Math.abs(s.rim[2])).toBeLessThan(w.rimWidth / 2);
      }
    }
  });
  it("phases crank arms 180 degrees apart and derives pitch circles and a closed tangent chain", () => {
    for (const frontTeeth of [46, 48]) {
      const g = componentGeometry({
          drivetrain: {
            frontTeeth,
            rearTeeth: 16,
            crankLength: 170,
            chainline: 42,
          },
        }),
        d = g.drivetrain,
        c = d.chain;
      const a = v(d.pedals[0]).sub(v(g.bb)).setZ(0),
        b = v(d.pedals[1]).sub(v(g.bb)).setZ(0);
      expect(a.length()).toBeCloseTo(0.17);
      expect(a.clone().normalize().dot(b.clone().normalize())).toBeCloseTo(-1);
      expect(c.frontRadius).toBeCloseTo(pitchRadius(frontTeeth));
      expect(c.points[0]).toEqual(c.points.at(-1));
      expect(c.points.every((p) => p[2] === 0.042)).toBe(true);
      const run = v(c.frontUpper).sub(v(c.rearUpper)).normalize();
      expect(run.dot(v(c.frontUpper).sub(v(g.bb)))).toBeCloseTo(0, 8);
      expect(run.dot(v(c.rearUpper).sub(v(g.rear)))).toBeCloseTo(0, 8);
      expect(c.at(0)).toEqual(c.at(c.length));
      expect(c.count % 2).toBe(0);
    }
  });
  it('connects the cog seat and crank roots rather than leaving floating annuli',()=>{
    const g=componentGeometry(),wheel=createWheel(g,true),drive=createDrivetrain(g);
    wheel.updateWorldMatrix(true,true);drive.updateWorldMatrix(true,true);
    const box=(root:THREE.Object3D,name:string)=>new THREE.Box3().setFromObject(root.getObjectByName(name)!);
    const seat=box(wheel,'fixed_hub_cog_seat'),cog=box(drive,'fixed_rear_cog');
    expect(seat.max.z).toBeGreaterThan(cog.min.z);expect(seat.min.z).toBeLessThan(cog.min.z);
    for(const side of [-1,1])expect(box(drive,`crank_root_boss_${side}`).intersectsBox(box(drive,`crank_arm_${side}`))).toBe(true);
    expect(box(drive,'crank_root_boss_1').intersectsBox(box(drive,'spider_boss'))).toBe(true);
    const lock=drive.getObjectByName('fixed_cog_lockring')!;
    expect(new THREE.Raycaster(new THREE.Vector3(g.rear[0],g.rear[1],1),new THREE.Vector3(0,0,-1)).intersectObject(lock,false)).toHaveLength(0);
    disposeModel(wheel);disposeModel(drive);
  });
  it("builds a shaped full-length saddle supported by rails and a seat-axis post", () => {
    const g = componentGeometry(),
      saddle = createSaddle(g);
    const pad = saddle.getObjectByName("shaped_padding") as THREE.Mesh;
    pad.geometry.computeBoundingBox();
    const size = pad.geometry.boundingBox!.getSize(new THREE.Vector3());
    expect(size.x).toBeCloseTo(0.275, 3);
    expect(size.z).toBeGreaterThan(0.13);
    expect(size.z).toBeLessThan(0.15);
    expect(size.y).toBeGreaterThan(0.02);
    expect(
      v(g.saddlePost).sub(v(g.seat)).normalize().dot(v(g.seatAxis)),
    ).toBeCloseTo(1);
    expect(saddle.getObjectByName("saddle_rail_-1")).toBeDefined();
    expect(saddle.getObjectByName("rail_clamp")).toBeDefined();
    disposeModel(saddle);
  });
  it("constructs four symmetric, dimensioned bars with one continuous clamp path", () => {
    const signatures = new Set<string>();
    for (const [shape] of barTypes) {
      const points = handlebarPoints({ shape }),
        d = cockpitDimensions({ shape });
      expect(points[Math.floor(points.length / 2)]).toEqual([0, 0, 0]);
      expect(points[0][2]).toBeCloseTo(-d.width / 2);
      expect(points.at(-1)![2]).toBeCloseTo(d.width / 2);
      for (let i = 0; i < points.length; i++) {
        const p = points[i],
          q = points[points.length - 1 - i];
        expect(p[0]).toBe(q[0]);
        expect(p[1]).toBe(q[1]);
        expect(p[2]).toBeCloseTo(-q[2]);
      }
      if (shape === "flat") expect(points.every((p) => p[1] === 0)).toBe(true);
      if (shape === "riser")
        expect(Math.max(...points.map((p) => p[1]))).toBeCloseTo(0.035);
      if (shape === "drop")
        expect(Math.min(...points.map((p) => p[1]))).toBeCloseTo(-0.125);
      signatures.add(JSON.stringify(points));
    }
    expect(signatures.size).toBe(4);
  });
  it("keeps complete assemblies, including all instances, inside every camera preset", () => {
    for (const [shape] of barTypes) {
      const { root } = complete(shape);
      let count = 0;
      vertices(root, (p) => {
        expect([p.x, p.y, p.z].every(Number.isFinite)).toBe(true);
        count++;
      });
      expect(count).toBeGreaterThan(10000);
      for (const [view] of cameraPresets)
        for (const aspect of [0.58, 1.6]) {
          const fit = fitAssembly(root, view, aspect, 36),
            camera = new THREE.PerspectiveCamera(36, aspect, 0.025, 50);
          camera.position
            .copy(fit.center)
            .addScaledVector(fit.direction, fit.distance);
          camera.lookAt(fit.center);
          camera.updateMatrixWorld();
          let maxX = 0,
            maxY = 0;
          vertices(root, (p) => {
            const q = p.clone().project(camera);
            maxX = Math.max(maxX, Math.abs(q.x));
            maxY = Math.max(maxY, Math.abs(q.y));
          });
          expect(maxX).toBeLessThan(0.825);
          expect(maxY).toBeLessThan(0.905);
        }
      disposeModel(root);
    }
  });
  it("fits instanced parts extending beyond the non-instanced assembly", () => {
    const root = new THREE.Group(),
      part = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.MeshBasicMaterial(),
        2,
      );
    part.setMatrixAt(1, new THREE.Matrix4().makeTranslation(3, 1, 0));
    part.computeBoundingBox();
    root.add(part);
    const fit = fitAssembly(root, "side", 1.5, 36);
    expect(fit.box.max.x).toBeGreaterThan(3);
    expect(fit.center.x).toBeGreaterThan(1);
    disposeModel(root);
  });
});
