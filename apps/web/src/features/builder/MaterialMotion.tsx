import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "./studio-settings";
export function PaintMaterial({
  color,
  reducedMotion,
}: {
  color: string;
  reducedMotion: boolean;
}) {
  const material = useMemo(
      () =>
        new THREE.MeshPhysicalMaterial({
          metalness: 0.35,
          roughness: 0.34,
          clearcoat: 0.22,
          clearcoatRoughness: 0.38,
        }),
      [],
    ),
    target = useMemo(() => new THREE.Color(color), [color]),
    first = useRef(true);
  const { invalidate } = useThree();
  useLayoutEffect(() => {
    if (first.current || reducedMotion) material.color.copy(target);
    first.current = false;
    invalidate();
  }, [material, target, reducedMotion, invalidate]);
  useFrame((_, delta) => {
    if (material.color.equals(target)) return;
    material.color.lerp(
      target,
      1 - Math.exp(-motion.paintDamping * Math.min(delta, 0.05)),
    );
    if (
      Math.abs(material.color.r - target.r) +
        Math.abs(material.color.g - target.g) +
        Math.abs(material.color.b - target.b) <
      0.0002
    )
      material.color.copy(target);
    else invalidate();
  });
  useEffect(() => () => material.dispose(), [material]);
  return <primitive attach="material" object={material} />;
}
export function useKitPaint(
  scene: THREE.Object3D,
  color: string,
  reducedMotion: boolean,
) {
  const target = useMemo(() => new THREE.Color(color), [color]),
    { invalidate } = useThree();
  const paints = useMemo(() => {
    const result: THREE.MeshStandardMaterial[] = [];
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh && node.name.startsWith("paint")) {
        for (const material of Array.isArray(node.material)
          ? node.material
          : [node.material])
          if (material instanceof THREE.MeshStandardMaterial) {
            material.metalness = 0.35;
            material.roughness = 0.34;
            result.push(material);
          }
      }
    });
    return result;
  }, [scene]);
  useLayoutEffect(() => {
    if (reducedMotion)
      for (const material of paints) material.color.copy(target);
    invalidate();
  }, [paints, target, reducedMotion, invalidate]);
  useFrame((_, delta) => {
    let moving = false;
    for (const material of paints) {
      const error =
        Math.abs(material.color.r - target.r) +
        Math.abs(material.color.g - target.g) +
        Math.abs(material.color.b - target.b);
      if (error > 0.0003) {
        material.color.lerp(
          target,
          1 - Math.exp(-motion.paintDamping * Math.min(delta, 0.05)),
        );
        moving = true;
      } else material.color.copy(target);
    }
    if (moving) invalidate();
  });
}
export function PartGroup({
  active,
  modelKey,
  onClick,
  children,
}: {
  active: boolean;
  modelKey: string;
  onClick: (event: { stopPropagation: () => void }) => void;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null),
    { invalidate } = useThree();
  useLayoutEffect(() => {
    const originals: {
      material: THREE.MeshStandardMaterial;
      color: THREE.Color;
      intensity: number;
    }[] = [];
    group.current?.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      for (const material of Array.isArray(node.material)
        ? node.material
        : [node.material])
        if (material instanceof THREE.MeshStandardMaterial) {
          originals.push({
            material,
            color: material.emissive.clone(),
            intensity: material.emissiveIntensity,
          });
          if (active) {
            material.emissive.set("#3659db");
            material.emissiveIntensity = 0.09;
          }
        }
    });
    invalidate();
    return () => {
      for (const { material, color, intensity } of originals) {
        material.emissive.copy(color);
        material.emissiveIntensity = intensity;
      }
    };
  }, [active, modelKey, invalidate]);
  return (
    <group ref={group} onClick={onClick}>
      {children}
    </group>
  );
}
