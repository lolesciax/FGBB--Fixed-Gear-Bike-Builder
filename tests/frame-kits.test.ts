import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { registeredFrameAssets, assemblyGeometry } from "@tracklab/domain";
import { manufacturerCatalog } from "../backend/src/manufacturer-catalog";
it("exports distinct metre-scale frame kits with verified anchor placement and no external resources", async () => {
  expect(registeredFrameAssets).toHaveLength(manufacturerCatalog.filter(p=>p.status==='published').reduce((n,p)=>n+p.variants.filter(v=>!v.colorwayId).length,0));
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
