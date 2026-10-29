import { useLayoutEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Configuration } from "@tracklab/domain";
import { assemblyMeshes, prepareMorph, type AssemblyPose } from "./morph-pose";
import type { TransitionCoordinator } from "./transitions";
export type PresentationBridge = {
  root: THREE.Group | null;
  source: AssemblyPose | null;
};
export function AssemblyPresentation({
  assembly,
  configuration,
  coordinator,
  bridge,
  active,
}: {
  assembly: RefObject<THREE.Group | null>;
  configuration: Configuration;
  coordinator: TransitionCoordinator;
  bridge: PresentationBridge;
  active: boolean;
}) {
  const { invalidate } = useThree(),
    resources = useRef<{
      apply: (progress: number) => void;
      dispose: () => void;
    } | null>(null);
  const id = coordinator.getSnapshot().id;
  useLayoutEffect(
    () => coordinator.subscribe(invalidate),
    [coordinator, invalidate],
  );
  useLayoutEffect(() => {
    const root = assembly.current;
    if (!root) return;
    bridge.root = root;
    resources.current?.dispose();
    const targetRoot = coordinator.committed;
    const plan = coordinator.getSnapshot().plan,
      materials = new Map<
        THREE.Material,
        { opacity: number; transparent: boolean; depthWrite: boolean }
      >();
    for (const [key, node] of assemblyMeshes(root))
      if (plan.slots.some((s) => key.startsWith(s + "/")))
        for (const m of Array.isArray(node.material)
          ? node.material
          : [node.material])
          if (!materials.has(m))
            materials.set(m, {
              opacity: m.opacity,
              transparent: m.transparent,
              depthWrite: m.depthWrite,
            });
    const morph =
      coordinator.busy && bridge.source && plan.family
        ? prepareMorph(root, bridge.source, plan.family)
        : null;
    bridge.source = null;
    if (targetRoot && plan.strategy === "morph" && !morph && coordinator.busy)
      coordinator.replacement();
    root.userData.transitionStrategy =
      plan.strategy === "morph" && !morph && coordinator.committed
        ? "replacement"
        : plan.strategy;
    root.userData.morphBuffers = morph?.geometryCount || 0;
    root.userData.morphBytes = morph?.bytes || 0;
    const apply = (progress: number) => {
      const incoming = Math.max(0, Math.min(1, (progress - 0.24) / 0.61)),
        ease = 1 - (1 - incoming) ** 3;
      const actualMorph = plan.strategy === "morph" && (!targetRoot || !!morph);
      const opacity = actualMorph
        ? 1
        : progress < 0.24
          ? 1 - 0.88 * (progress / 0.24)
          : 0.12 + 0.88 * ease;
      if (plan.strategy !== "material" && plan.strategy !== "initial")
        for (const [m, original] of materials) {
          const transparent = opacity < 0.999 || original.transparent;
          if (m.transparent !== transparent) {
            m.transparent = transparent;
            m.needsUpdate = true;
          }
          m.opacity = original.opacity * opacity;
          m.depthWrite = opacity > 0.6 && original.depthWrite;
        }
      morph?.apply(ease);
      root.userData.transitionProgress = progress;
    };
    let disposed = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      morph?.dispose();
      for (const [m, o] of materials) {
        if (m.transparent !== o.transparent) m.needsUpdate = true;
        m.opacity = o.opacity;
        m.transparent = o.transparent;
        m.depthWrite = o.depthWrite;
      }
      root.userData.morphBuffers = 0;
      root.userData.morphBytes = 0;
      root.userData.transitionProgress = 1;
    };
    resources.current = { apply, dispose };
    coordinator.bindCleanup(dispose);
    if (coordinator.busy && coordinator.committed) apply(0.24);
    invalidate();
    return () => {
      dispose();
      if (bridge.root === root) bridge.root = null;
    };
  }, [assembly, configuration, coordinator, bridge, id, invalidate]);
  useFrame((_, delta) => {
    if (!active) return;
    const progress = coordinator.advance(delta);
    if (progress === null) return;
    if (progress < 1) resources.current?.apply(progress);
    if (coordinator.busy) invalidate();
  });
  useLayoutEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);
  return null;
}
