import { useLayoutEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  componentPaint,
  finishSlots,
  variantById,
  type FinishZone,
  type Configuration,
  type Product,
} from "@tracklab/domain";
export function useComponentFinishes(
  scene: THREE.Object3D,
  configuration: Configuration,
  catalog: Product[],
  reducedMotion: boolean,
) {
  const { invalidate } = useThree();
  const materials = useMemo(() => {
    const seen = new Set<THREE.Material>(),
      items: {
        material: THREE.MeshStandardMaterial;
        zone: FinishZone;
        original: { color: THREE.Color; roughness: number; metalness: number };
      }[] = [];
    scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      for (const material of Array.isArray(node.material)
        ? node.material
        : [node.material])
        if (
          material instanceof THREE.MeshStandardMaterial &&
          material.name.startsWith("finish_") &&
          !seen.has(material)
        ) {
          seen.add(material);
          items.push({
            material,
            zone: material.name.slice(7) as FinishZone,
            original: {
              color: material.color.clone(),
              roughness: material.roughness,
              metalness: material.metalness,
            },
          });
        }
    });
    return items;
  }, [scene]);
  const targets = materials.map((item) => {
    const selected = variantById(
        catalog,
        configuration[finishSlots[item.zone]],
      ),
      paint =
        selected &&
        componentPaint(
          selected.product,
          selected.variant,
          item.zone,
          configuration.appearance?.[item.zone],
        );
    return paint
      ? {
          color: new THREE.Color(paint.color),
          roughness: paint.roughness,
          metalness: paint.metalness,
        }
      : item.original;
  });
  const apply = (amount: number) => {
    let error = 0;
    for (const [index, item] of materials.entries()) {
      const m = item.material,
        t = targets[index];
      error +=
        Math.abs(m.color.r - t.color.r) +
        Math.abs(m.color.g - t.color.g) +
        Math.abs(m.color.b - t.color.b) +
        Math.abs(m.roughness - t.roughness) +
        Math.abs(m.metalness - t.metalness);
      m.color.lerp(t.color, amount);
      m.roughness = THREE.MathUtils.lerp(m.roughness, t.roughness, amount);
      m.metalness = THREE.MathUtils.lerp(m.metalness, t.metalness, amount);
    }
    return error;
  };
  useLayoutEffect(() => {
    if (reducedMotion) apply(1);
    invalidate();
  });
  useFrame((_, delta) => {
    if (
      apply(reducedMotion ? 1 : 1 - Math.exp(-12 * Math.min(delta, 0.05))) >
      0.0003
    )
      invalidate();
    else apply(1);
  });
}
