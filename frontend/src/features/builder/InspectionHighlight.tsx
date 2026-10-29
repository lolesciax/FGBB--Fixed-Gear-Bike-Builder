import { useLayoutEffect, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { inspectionObject, type InspectionTarget } from "./inspection";
export function InspectionHighlight({
  assembly,
  target,
  revision,
}: {
  assembly: RefObject<THREE.Group | null>;
  target?: InspectionTarget;
  revision: string;
}) {
  const { invalidate } = useThree();
  useLayoutEffect(() => {
    if (!target || !assembly.current) return;
    const originals = new Map<
      THREE.MeshStandardMaterial,
      { color: THREE.Color; intensity: number }
    >();
    inspectionObject(assembly.current, target).traverse((n) => {
      if (n instanceof THREE.Mesh)
        for (const m of Array.isArray(n.material) ? n.material : [n.material])
          if (m instanceof THREE.MeshStandardMaterial && !originals.has(m)) {
            originals.set(m, {
              color: m.emissive.clone(),
              intensity: m.emissiveIntensity,
            });
            m.emissive.set("#3659db");
            m.emissiveIntensity = 0.05;
          }
    });
    invalidate();
    return () => {
      for (const [m, o] of originals) {
        m.emissive.copy(o.color);
        m.emissiveIntensity = o.intensity;
      }
      invalidate();
    };
  }, [assembly, target, revision, invalidate]);
  return null;
}
