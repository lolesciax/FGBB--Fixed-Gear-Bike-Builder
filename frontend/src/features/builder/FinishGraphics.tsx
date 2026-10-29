import { useEffect, useRef, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";
import {
  finishAnchors,
  graphicUrl,
  zoneForMesh,
  type Colorway,
  type Variant,
  type GraphicLayer,
} from "@tracklab/domain";
export function projectGraphic(
  root: THREE.Object3D,
  specs: Variant["specs"],
  layer: GraphicLayer,
  side: number,
) {
  root.updateWorldMatrix(true, true);
  const [a, b] = finishAnchors(specs)[layer.zone].map(
    (p) => new THREE.Vector3(...p),
  );
  const axis = b.clone().sub(a),
    length = axis.length() * (layer.to - layer.from),
    center = a.clone().addScaledVector(axis, (layer.from + layer.to) / 2);
  const candidates: THREE.Mesh[] = [];
  root.traverse((n) => {
    if (n instanceof THREE.Mesh && zoneForMesh(n.name) === layer.zone)
      candidates.push(n);
  });
  const ray = new THREE.Raycaster(
    new THREE.Vector3(center.x, center.y, side * 1.5),
    new THREE.Vector3(0, 0, -side),
  );
  const hit = ray.intersectObjects(candidates, false)[0];
  if (!hit) return null;
  const u = axis.normalize().multiplyScalar(side),
    normal = new THREE.Vector3(0, 0, side),
    v = new THREE.Vector3().crossVectors(normal, u).normalize();
  const rotation = new THREE.Euler().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(u, v, normal),
  );
  return new DecalGeometry(
    hit.object as THREE.Mesh,
    hit.point,
    rotation,
    new THREE.Vector3(length, (length * layer.height) / layer.width, 0.06),
  );
}
async function graphicTexture(layer: GraphicLayer) {
  const canvas = document.createElement("canvas"),
    scale = Math.min(1, 1024 / layer.width, 1024 / layer.height);
  canvas.width = Math.max(1, Math.round(layer.width * scale));
  canvas.height = Math.max(1, Math.round(layer.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw Error("Canvas unavailable");
  if (layer.paths) {
    ctx.scale(canvas.width / layer.width, canvas.height / layer.height);
    for (const p of layer.paths) {
      ctx.fillStyle = p.fill;
      ctx.fill(new Path2D(p.d));
    }
  } else {
    const image = new Image();
    image.src = graphicUrl(layer)!;
    await image.decode();
    const scale = Math.min(
      canvas.width / image.naturalWidth,
      canvas.height / image.naturalHeight,
    );
    ctx.drawImage(
      image,
      (canvas.width - image.naturalWidth * scale) / 2,
      (canvas.height - image.naturalHeight * scale) / 2,
      image.naturalWidth * scale,
      image.naturalHeight * scale,
    );
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}
export function FinishGraphics({
  assembly,
  specs,
  colorway,
  geometryKey,
  onFailure,
}: {
  assembly: RefObject<THREE.Group | null>;
  specs: Variant["specs"];
  colorway: Colorway | undefined;
  geometryKey: string;
  onFailure: (failed: boolean) => void;
}) {
  const group = useRef<THREE.Group>(null),
    { invalidate } = useThree();
  const definition = JSON.stringify(colorway?.graphics || []);
  useEffect(() => {
    let cancelled = false;
    const geometries: THREE.BufferGeometry[] = [],
      materials: THREE.Material[] = [],
      textures: THREE.Texture[] = [];
    const target = group.current,
      root = assembly.current;
    onFailure(false);
    if (!root || !target) return;
    void (async () => {
      for (const layer of JSON.parse(definition) as GraphicLayer[])
        if (layer.permission === "confirmed")
          try {
            const texture = await graphicTexture(layer);
            if (cancelled) {
              texture.dispose();
              return;
            }
            textures.push(texture);
            for (const side of layer.side === "both"
              ? [1, -1]
              : [layer.side === "drive" ? 1 : -1]) {
              const geometry = projectGraphic(root, specs, layer, side);
              if (!geometry)
                throw Error("Graphic does not intersect its model region");
              geometries.push(geometry);
              const material = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.02,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -2,
                polygonOffsetUnits: -1,
                roughness: 0.5,
              });
              materials.push(material);
              const mesh = new THREE.Mesh(geometry, material);
              mesh.name = `graphic_${layer.id}_${side}`;
              target.add(mesh);
            }
          } catch {
            if (!cancelled) onFailure(true);
          }
      if (!cancelled) invalidate();
    })();
    return () => {
      cancelled = true;
      target.clear();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    };
  }, [assembly, definition, geometryKey, specs, onFailure, invalidate]);
  return <group ref={group} name="permitted_finish_graphics" />;
}
