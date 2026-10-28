// Original illustrative meshes from reviewed dimensions. No manufacturer scans or graphics.
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { mkdir, writeFile } from "node:fs/promises";
import { assemblyGeometry, frameAssetSchema } from "@tracklab/domain";
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
    const g = assemblyGeometry(variant.specs),
      group = new THREE.Group();
    group.name = `illustrative_${variant.id}`;
    const v = (p: { x: number; y: number }, z = 0) =>
      new THREE.Vector3((p.x - g.bb.x) / 1000, (g.bb.y - p.y) / 1000, z);
    const paint = new THREE.MeshStandardMaterial({
        color: variant.color,
        metalness: 0.65,
        roughness: 0.38,
      }),
      metal = new THREE.MeshStandardMaterial({
        color: "#414957",
        metalness: 0.5,
        roughness: 0.4,
      });
    function tube(
      name: string,
      a: THREE.Vector3,
      b: THREE.Vector3,
      r: number,
      material = paint,
    ) {
      const delta = b.clone().sub(a),
        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(r, r, delta.length(), 20),
          material,
        );
      mesh.name = name;
      mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        delta.normalize(),
      );
      group.add(mesh);
    }
    tube("paint_top", v(g.seat), v(g.head), g.frameWidth / 2000);
    tube("paint_down", v(g.bb), v(g.headBottom), (g.frameWidth + 8) / 2000);
    tube("paint_seat", v(g.bb), v(g.seat), g.frameWidth / 2000);
    tube("paint_head", v(g.head), v(g.headBottom), (g.frameWidth + 8) / 2000);
    for (const z of [-0.045, 0.045]) {
      tube(`paint_seatstay_${z}`, v(g.seat), v(g.rear, z), 0.007);
      tube(`paint_chainstay_${z}`, v(g.bb, z), v(g.rear, z), 0.009);
      const curve = new THREE.QuadraticBezierCurve3(
        v(g.headBottom, z),
        String(variant.specs.forkProfile||'').startsWith('straight')?v({x:(g.headBottom.x+g.front.x)/2,y:g.headBottom.y/2},z):v({ x: g.headBottom.x + 35, y: g.headBottom.y + 160 }, z),
        v(g.front, z),
      );
      const fork = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, 0.011, 12, false),
        metal,
      );
      fork.name = `fork_${z}`;
      group.add(fork);
    }
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
        revision: "frame-kit-v1",
      }),
    );
    group.traverse((node) => {
      if (node instanceof THREE.Mesh) node.geometry.dispose();
    });
    paint.dispose();
    metal.dispose();
  }
await writeFile(
  new URL("../packages/domain/src/frame-assets.json", import.meta.url),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.info(
  `Exported ${manifest.length} independent illustrative frame kits with per-variant geometry, anchors and provenance.`,
);
