import { it, expect, vi } from "vitest";
import * as THREE from "three";
import {
  componentGeometry,
  renderFrameSpecs,
  renderMorphologyId,
  slots,
  variantById,
  type Configuration,
  selectedColorway,
  productSchema,
} from "@tracklab/domain";
import { seedCatalog, defaultConfiguration } from "../backend/src/catalog";
import {
  transitionPlan,
  TransitionCoordinator,
} from "../frontend/src/features/builder/transitions";
import {
  captureAssembly,
  prepareMorph,
  assemblyMeshes,
} from "../frontend/src/features/builder/morph-pose";
import { createFrame } from "../frontend/src/features/builder/modeling/frame";
import {
  createWheel,
  createTire,
} from "../frontend/src/features/builder/modeling/wheel";
import { createCockpit } from "../frontend/src/features/builder/modeling/cockpit";
import { createSaddle } from "../frontend/src/features/builder/modeling/saddle";
import { createDrivetrain } from "../frontend/src/features/builder/modeling/drivetrain";
import { disposeModel } from "../frontend/src/features/builder/modeling/primitives";
import { finiteBlend } from "../frontend/src/features/builder/studio-math";
it("finishes finite material interpolation exactly and continues from an interrupted value", () => {
  let value = 0,
    elapsed = 0;
  while (elapsed < 0.35) {
    const next = Math.min(0.35, elapsed + 0.016);
    value += (1 - value) * finiteBlend(elapsed, next, 0.35);
    elapsed = next;
  }
  expect(value).toBe(1);
  value = 0.4;
  elapsed = 0;
  for (let i = 0; i < 8; i++) {
    const next = elapsed + 0.02;
    value += (0 - value) * finiteBlend(elapsed, next, 0.35);
    elapsed = next;
  }
  const interrupted = value;
  expect(value).toBeGreaterThan(0);
  expect(value).toBeLessThan(0.4);
  value += (1 - value) * finiteBlend(0, 0.016, 0.35);
  expect(value).toBeGreaterThan(interrupted);
  expect(value).toBeLessThan(1);
});
const from = {
    ...defaultConfiguration,
    frameset: "cinelli-vigorelli-80s-national-blu-m-v1",
  },
  to = { ...from, frameset: "cinelli-vigorelli-80s-national-blu-xl-v1" };
function assembly(configuration: Configuration) {
  const specs = Object.fromEntries(
      slots.map((s) => [
        s,
        variantById(seedCatalog, configuration[s])!.variant.specs,
      ]),
    ),
    r = variantById(seedCatalog, configuration.frameset)!;
  specs.frameset = renderFrameSpecs(
    r.variant.specs,
    renderMorphologyId(r.product, r.variant),
  );
  const g = componentGeometry(specs),
    root = new THREE.Group();
  const add = (slot: string, ...children: THREE.Object3D[]) => {
    const group = new THREE.Group();
    group.userData.slot = slot;
    group.add(...children);
    root.add(group);
  };
  add("frameset", createFrame(g, "#336699"));
  add("wheels", createWheel(g, false), createWheel(g, true));
  const tires = [g.front, g.rear].map((axle) => {
    const t = createTire(g);
    t.position.set(...axle);
    return t;
  });
  add("tires", ...tires);
  add("cockpit", createCockpit(g, specs.cockpit));
  add("saddle", createSaddle(g));
  add("drivetrain", createDrivetrain(g));
  return root;
}
it("uses controlled replacement for permitted artwork changes on otherwise identical geometry", () => {
  const catalog = structuredClone(seedCatalog),
    r = variantById(catalog, from.frameset)!,
    colorway = structuredClone(selectedColorway(r.product, r.variant)!);
  colorway.id = "original-graphic-fixture";
  colorway.graphics = [
    {
      id: "original-calibration",
      zone: "down",
      side: "both",
      from: 0.25,
      to: 0.65,
      width: 200,
      height: 20,
      license: "CC0-1.0",
      evidence: "https://example.com/original-calibration",
      permission: "confirmed",
      paths: [{ d: "M0 0H200V20H0Z", fill: "#ffffff" }],
    },
  ];
  r.product.colorways!.push(colorway);
  r.product.variants.push({
    ...structuredClone(r.variant),
    id: "original-graphic-fixture",
    colorwayId: colorway.id,
  });
  expect(productSchema.safeParse(r.product).success).toBe(true);
  expect(
    transitionPlan(
      from,
      { ...from, frameset: "original-graphic-fixture" },
      catalog,
    ),
  ).toMatchObject({ strategy: "replacement", slots: ["frameset"] });
});
it("selects verified family morphs, construction replacement and material-only work without inventing support", () => {
  expect(transitionPlan(from, to, seedCatalog).strategy).toBe("morph");
  expect(
    transitionPlan(
      from,
      { ...from, frameset: "dosnoventa-03-det-m" },
      seedCatalog,
    ).strategy,
  ).toBe("replacement");
  expect(
    transitionPlan(
      from,
      { ...from, frameset: "cinelli-vigorelli-rainbow-m" },
      seedCatalog,
    ).strategy,
  ).toBe("material");
  expect(
    transitionPlan(from, { ...to, wheels: "studio-deep-36-36" }, seedCatalog)
      .strategy,
  ).toBe("replacement");
  expect(transitionPlan(from, to, seedCatalog, true).strategy).toBe(
    "replacement",
  );
  expect(
    transitionPlan(
      from,
      { ...from, appearance: { wheelset: "polished" } },
      seedCatalog,
    ),
  ).toMatchObject({ strategy: "material", slots: [] });
  expect(seedCatalog.find((p) => p.id === "tsunami-snm100")?.status).toBe(
    "draft",
  );
  expect(seedCatalog.find((p) => p.id === "leader-735")?.status).toBe("draft");
});
it("cancels obsolete jobs, commits only once and cleans up on skip, completion, failure and disposal", () => {
  const c = new TransitionCoordinator(),
    events: string[] = [];
  c.subscribe(() => events.push(c.getSnapshot().phase));
  const old = c.begin(transitionPlan(from, to, seedCatalog));
  c.loading(old);
  const next = c.begin(transitionPlan(from, to, seedCatalog)),
    stale = vi.fn(),
    commit = vi.fn(),
    clean = vi.fn();
  expect(c.ready(old, stale)).toBe(false);
  c.loading(next);
  c.bindCleanup(clean);
  c.ready(next, commit);
  for (let i = 0; i < 30; i++) c.advance(0.05);
  expect(commit).toHaveBeenCalledTimes(1);
  expect(stale).not.toHaveBeenCalled();
  expect(clean).toHaveBeenCalledTimes(1);
  expect(events).toContain("cancelled");
  expect(events).toContain("settling");
  expect(c.getSnapshot().phase).toBe("completed");
  const third = c.begin(transitionPlan(from, to, seedCatalog));
  c.ready(third, commit);
  c.finish();
  expect(c.getSnapshot().phase).toBe("cancelled");
  expect(commit).toHaveBeenCalledTimes(2);
  const fourth = c.begin(transitionPlan(from, to, seedCatalog));
  c.fail(third);
  expect(c.getSnapshot().phase).toBe("preparing");
  c.fail(fourth);
  expect(c.getSnapshot().phase).toBe("failed");
  c.dispose();
  expect(c.ready(fourth, stale)).toBe(false);
});
it("morphs only corresponding procedural surfaces/instances, preserves both endpoints and restores original geometry", () => {
  const a = assembly(from),
    b = assembly(to),
    plan = transitionPlan(from, to, seedCatalog),
    source = captureAssembly(a, plan.family!),
    original = captureAssembly(b, plan.family!),
    ids = [...assemblyMeshes(b).values()].map((n) => n.geometry.uuid),
    morph = prepareMorph(b, source, plan.family!)!;
  expect(morph).not.toBeNull();
  expect(morph.geometryCount).toBeGreaterThan(10);
  expect(morph.bytes).toBeLessThan(4_000_000);
  const point = new THREE.Vector3(),
    matrix = new THREE.Matrix4();
  for (const amount of [0, 0.25, 0.5, 0.75, 1]) {
    morph.apply(amount);
    for (const [key, node] of assemblyMeshes(b)) {
      const p = node.geometry.getAttribute("position"),
        old = source.meshes.get(key)!,
        end = original.meshes.get(key)!;
      for (const i of [0, Math.floor(p.count / 2), p.count - 1]) {
        node.getVertexPosition(i, point).applyMatrix4(node.matrixWorld);
        expect(point.toArray().every(Number.isFinite)).toBe(true);
        if (!(node instanceof THREE.InstancedMesh)) {
          const expected = new THREE.Vector3()
            .fromBufferAttribute(amount === 0 ? old.position : end.position, i)
            .applyMatrix4(amount === 0 ? old.matrix : end.matrix);
          if (amount === 0 || amount === 1)
            expect(point.distanceTo(expected)).toBeLessThan(0.000001);
        }
      }
      if (node instanceof THREE.InstancedMesh) {
        node.getMatrixAt(0, matrix);
        matrix.premultiply(node.matrixWorld);
        expect(matrix.elements.every(Number.isFinite)).toBe(true);
      }
    }
  }
  morph.dispose();
  morph.dispose();
  expect([...assemblyMeshes(b).values()].map((n) => n.geometry.uuid)).toEqual(
    ids,
  );
  expect(
    [...assemblyMeshes(a).values()].every(
      (n) => !n.geometry.morphAttributes.position,
    ),
  ).toBe(true);
  expect(prepareMorph(b, source, "unrelated-family")).toBeNull();
  const bad = captureAssembly(a, plan.family!);
  bad.meshes.delete(bad.meshes.keys().next().value!);
  expect(prepareMorph(b, bad, plan.family!)).toBeNull();
  disposeModel(a);
  disposeModel(b);
});
