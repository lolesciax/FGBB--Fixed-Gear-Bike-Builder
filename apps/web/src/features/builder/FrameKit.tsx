import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Variant } from "@tracklab/domain";
export function FrameKit({
  variant,
  bb,
}: {
  variant: Variant;
  bb: { x: number; y: number };
}) {
  const asset = variant.asset3D!;
  const gltf = useGLTF(asset.url);
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((node) => {
      if (node instanceof THREE.Mesh && node.name.startsWith("paint")) {
        node.material = (node.material as THREE.MeshStandardMaterial).clone();
        node.material.color.set(variant.color);
      }
    });
    return clone;
  }, [gltf.scene, variant.color]);
  useEffect(
    () => () => {
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh && node.name.startsWith("paint"))
          (node.material as THREE.MeshStandardMaterial).dispose();
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
