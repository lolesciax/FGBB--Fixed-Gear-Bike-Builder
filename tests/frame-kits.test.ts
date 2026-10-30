import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { registeredFrameAssets, assemblyGeometry } from "@tracklab/domain";
import { manufacturerCatalog } from "../backend/src/manufacturer-catalog";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  captureAssembly,
  prepareMorph,
} from "../frontend/src/features/builder/morph-pose";
import { disposeModel } from "../frontend/src/features/builder/modeling/primitives";
it("exports distinct metre-scale frame kits with verified anchor placement and no external resources", async () => {
  expect(registeredFrameAssets).toHaveLength(
    manufacturerCatalog
      .filter((p) => p.status === "published")
      .reduce((n, p) => n + p.variants.filter((v) => !v.colorwayId).length, 0),
  );
  const heads = new Set<string>();
  for (const asset of registeredFrameAssets) {
    const data = await readFile(
      new URL(`../frontend/public${asset.url}`, import.meta.url),
    );
    expect(data.toString("ascii", 0, 4)).toBe("glTF");
    expect(data.readUInt32LE(4)).toBe(2);
    expect(data.readUInt32LE(8)).toBe(data.length);
    expect(data.length).toBeLessThan(300000);
    const json = JSON.parse(
      data.toString("utf8", 20, 20 + data.readUInt32LE(12)),
    );
    expect(json.images || []).toHaveLength(0);
    expect(json.buffers.every((buffer: { uri?: string }) => !buffer.uri)).toBe(
      true,
    );
    const variant = manufacturerCatalog
      .flatMap((p) => p.variants)
      .find((v) => v.id === asset.variantId)!;
    const geometry = assemblyGeometry(variant.specs);
    const node = json.nodes.find(
      (node: { name: string }) => node.name === "anchor_head",
    );
    const head = node.translation || node.matrix.slice(12, 15);
    expect(head[0]).toBeCloseTo((geometry.head.x - geometry.bb.x) / 1000, 5);
    expect(head[1]).toBeCloseTo((geometry.bb.y - geometry.head.y) / 1000, 5);
    heads.add(JSON.stringify(head));
    expect(asset.fidelity).toBe("illustrative");
    expect(asset.license).toBe("CC0-1.0");
  }
  expect(heads.size).toBeGreaterThanOrEqual(10);
});
it("retains morph correspondence in the actual exported size assets, not just procedural meshes", async () => {
  const load = async (url: string) => {
    const data = await readFile(
      new URL(`../frontend/public${url}`, import.meta.url),
    );
    const gltf = await new GLTFLoader().parseAsync(
      new Uint8Array(data).buffer,
      "",
    );
    const root = new THREE.Group(),
      slot = new THREE.Group();
    slot.userData.slot = "frameset";
    slot.add(gltf.scene);
    root.add(slot);
    return root;
  };
  for (const product of manufacturerCatalog.filter(
    (p) => p.status === "published",
  )) {
    const assets = product.variants
      .filter((v) => !v.colorwayId)
      .map((v) => registeredFrameAssets.find((a) => a.variantId === v.id)!);
    const reference = await load(assets[0].url),
      pose = captureAssembly(reference, product.id);
    for (const asset of assets.slice(1)) {
      const target = await load(asset.url),
        morph = prepareMorph(target, pose, product.id);
      expect(morph, `${product.id}/${asset.variantId}`).not.toBeNull();
      expect(morph!.geometryCount).toBeGreaterThan(0);
      morph!.apply(1);
      morph!.dispose();
      disposeModel(target);
    }
    disposeModel(reference);
  }
});
