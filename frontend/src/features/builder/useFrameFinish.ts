import { useLayoutEffect, useMemo } from "react";
import { useFiniteTween } from "./useFiniteTween";
import * as THREE from "three";
import {
  selectedColorway,
  renderFrameSpecs,
  renderMorphologyId,
  type Product,
  type Variant,
} from "@tracklab/domain";
import { prepareFinish, enableFinish, finishTargets } from "./finish-materials";
export function useFrameFinish(
  scene: THREE.Object3D,
  product: Product | undefined,
  variant: Variant | undefined,
  reducedMotion: boolean,
) {
  const geometryKey = JSON.stringify(
    renderFrameSpecs(
      variant?.specs || {},
      product && variant ? renderMorphologyId(product, variant) : undefined,
      product?.id,
    ),
  );
  const materials = useMemo(
    () => prepareFinish(scene, JSON.parse(geometryKey)),
    [scene, geometryKey],
  );
  const colorway =
    product && variant ? selectedColorway(product, variant) : undefined;
  const targets = useMemo(
    () =>
      materials.map((item) => {
        const target = finishTargets(
          item,
          colorway,
          variant?.color || "#535963",
        );
        return {
          ...target,
          colors: target.stops.map((s) => new THREE.Color(s.color)),
        };
      }),
    [materials, colorway, variant?.color],
  );
  const apply = (amount: number) => {
    let error = 0;
    for (const [index, item] of materials.entries()) {
      const t = targets[index],
        u = item.uniforms,
        m = item.material;
      for (let i = 0; i < 8; i++) {
        const target = t.colors[Math.min(i, t.colors.length - 1)],
          c = u.colors.value[i];
        error +=
          Math.abs(c.r - target.r) +
          Math.abs(c.g - target.g) +
          Math.abs(c.b - target.b);
        c.lerp(target, amount);
        u.stops.value[i] = THREE.MathUtils.lerp(
          u.stops.value[i],
          t.stops[Math.min(i, t.stops.length - 1)].at,
          amount,
        );
      }
      u.count.value = 8;
      for (const key of [
        "roughness",
        "metalness",
        "clearcoat",
        "clearcoatRoughness",
      ] as const) {
        const target =
          key === "clearcoat" ? Math.max(0.00001, t.paint[key]) : t.paint[key];
        error += Math.abs(m[key] - target);
        m[key] = THREE.MathUtils.lerp(m[key], target, amount);
      }
    }
    return error;
  };
  useLayoutEffect(() => {
    materials.forEach(enableFinish);
  }, [materials]);
  useFiniteTween(scene.uuid, JSON.stringify(targets), reducedMotion, apply);
}
