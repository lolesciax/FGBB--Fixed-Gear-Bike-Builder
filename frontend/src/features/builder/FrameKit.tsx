import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Variant,Product } from "@tracklab/domain";
import { useFrameFinish } from "./useFrameFinish";
import {physicalCopy} from './finish-materials';
import { frameRequestUrl } from "./studio-settings";
export function FrameKit({
  variant,
  product,
  bb,
  reducedMotion = false,
}: {
  variant: Variant;
  product:Product;
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
          ? node.material.map(physicalCopy)
          : physicalCopy(node.material);
    });
    return clone;
  }, [gltf.scene]);
  useFrameFinish(scene, product,variant, reducedMotion);
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
