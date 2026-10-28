import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Variant } from "@tracklab/domain";
import { useKitPaint } from "./MaterialMotion";
import { frameRequestUrl } from "./studio-settings";
export function FrameKit({
  variant,
  bb,
  reducedMotion = false,
}: {
  variant: Variant;
  bb: { x: number; y: number };
  reducedMotion?: boolean;
}) {
  const asset = variant.asset3D!;
  const gltf = useGLTF(frameRequestUrl(asset));
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((node) => {
      if (node instanceof THREE.Mesh)
        node.material = Array.isArray(node.material)
          ? node.material.map((material) => material.clone())
          : node.material.clone();
    });
    return clone;
  }, [gltf.scene]);
  useKitPaint(scene, variant.color, reducedMotion);
  useEffect(
    () => () => {
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh)
          for (const material of Array.isArray(node.material)
            ? node.material
            : [node.material])
            material.dispose();
      });
    },
    [scene],
  );
  return (
    <primitive
      object={scene}
      position={[bb.x / 1000, -bb.y / 1000, 0]}
      scale={asset.scale}
      rotation={asset.rotation}
    />
  );
}
