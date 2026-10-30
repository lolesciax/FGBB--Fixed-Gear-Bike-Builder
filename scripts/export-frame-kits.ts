// Original illustrative meshes from reviewed dimensions. No manufacturer scans or graphics.
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { mkdir, writeFile } from "node:fs/promises";
import {
  assemblyGeometry,
  componentGeometry,
  renderFrameSpecs,
  frameMorphology,
  frameAssetSchema,
  assemblyAnchors,
} from "@tracklab/domain";
import { createFrame } from "../frontend/src/features/builder/modeling/frame";
import { disposeModel } from "../frontend/src/features/builder/modeling/primitives";
import { manufacturerCatalog } from "../backend/src/manufacturer-catalog";

Object.defineProperty(globalThis, "FileReader", {
  value: class {
    result: ArrayBuffer | string | null = null;
    onloadend?: () => void;
    readAsArrayBuffer(blob: Blob) {
      void blob.arrayBuffer().then((value) => {
        this.result = value;
        this.onloadend?.();
      });
    }
    readAsDataURL(blob: Blob) {
      void blob.arrayBuffer().then((value) => {
        this.result = `data:application/octet-stream;base64,${Buffer.from(value).toString("base64")}`;
        this.onloadend?.();
      });
    }
  },
});
const out = new URL("../frontend/public/models/frames/", import.meta.url);
await mkdir(out, { recursive: true });
const manifest = [];
for (const product of manufacturerCatalog.filter(
  (p) => p.status === "published",
))
  for (const variant of product.variants) {
    if (variant.colorwayId) continue; // Finish variants reuse reviewed geometry or the procedural fallback.
    const g = assemblyGeometry(variant.specs),
      group = new THREE.Group();
    group.name = `illustrative_${variant.id}`;
    const v = (p: { x: number; y: number }, z = 0) =>
      new THREE.Vector3((p.x - g.bb.x) / 1000, (g.bb.y - p.y) / 1000, z);
    const model = createFrame(
      componentGeometry({ frameset: renderFrameSpecs(variant.specs,product.visual?.morphologyId) }),
      variant.color,
    );
    model.position.set(-g.bb.x / 1000, g.bb.y / 1000, 0);
    group.add(model);
    for (const [name, p] of Object.entries({
      rear: g.rear,
      front: g.front,
      seat: g.seat,
      head: g.head,
      headBottom: g.headBottom,
      bb: g.bb,
    })) {
      const anchor = new THREE.Object3D();
      anchor.name = `anchor_${name}`;
      anchor.position.copy(v(p));
      group.add(anchor);
    }
    group.userData = {
      fidelity: "illustrative",
      variant: variant.id,
      source: product.source,
      license: "CC0-1.0",
      units: "metres",
      origin: "bottom-bracket",
      ...(product.visual?.morphologyId?{morphologyId:product.visual.morphologyId,surfaceSource:frameMorphology(product.visual.morphologyId)?.source}:{}),
      assumptions:
        "Tube profiles, widths and fork shapes are approximations; no manufacturer graphics.",
    };
    const buffer = await new GLTFExporter().parseAsync(group, { binary: true });
    await writeFile(
      new URL(`${variant.id}.glb`, out),
      Buffer.from(buffer as ArrayBuffer),
    );
    const bounds = new THREE.Box3().setFromObject(group);
    await writeFile(
      new URL(`${variant.id}.model.json`, out),
      JSON.stringify(
        {
          variantId: variant.id,
          source: product.source,
          geometry: variant.specs,
          assembly: assemblyAnchors(componentGeometry({frameset:renderFrameSpecs(variant.specs,product.visual?.morphologyId)})),
          ...(product.visual?.morphologyId?{morphology:{id:product.visual.morphologyId,source:frameMorphology(product.visual.morphologyId)?.source,dimensions:'Authored illustrative sections; no proprietary section measurements claimed.'}}:{}),
          anchors: Object.fromEntries(
            group.children
              .filter((c) => c.name.startsWith("anchor"))
              .map((c) => [c.name, c.position.toArray()]),
          ),
          bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
          fidelity: "illustrative",
          license: "CC0-1.0",
        },
        null,
        2,
      ) + "\n",
    );
    manifest.push(
      frameAssetSchema.parse({
        variantId: variant.id,
        url: `/models/frames/${variant.id}.glb`,
        fidelity: "illustrative",
        license: "CC0-1.0",
        source: "Independently authored TrackLab frame-kit geometry",
        scale: 1,
        rotation: [0, 0, 0],
        origin: "bottom-bracket",
        units: "metres",
        revision: "frame-kit-v5",
        ...(product.visual?.morphologyId?{morphologyId:product.visual.morphologyId}:{}),
      }),
    );
    disposeModel(group);
  }
await writeFile(
  new URL("../packages/domain/src/frame-assets.json", import.meta.url),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.info(
  `Exported ${manifest.length} independent illustrative frame kits with per-variant geometry, anchors and provenance.`,
);
