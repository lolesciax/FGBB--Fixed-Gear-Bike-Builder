import { useEffect, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { assemblyAnchors, type BicycleGeometry } from "@tracklab/domain";
import { useGeometryDebug } from "./geometry-debug";
import { validateAssembly } from "./modeling/validation";
import type { TransitionCoordinator } from "./transitions";

export function GeometryOverlay({
  assembly,
  g,
  revision,
  coordinator,
}: {
  assembly: RefObject<THREE.Group | null>;
  g: BicycleGeometry;
  revision: string;
  coordinator: TransitionCoordinator;
}) {
  const anchors = useGeometryDebug((s) => s.anchors),
    bounds = useGeometryDebug((s) => s.bounds),
    intersections = useGeometryDebug((s) => s.intersections),
    setReport = useGeometryDebug((s) => s.setReport);
  const { scene, invalidate } = useThree();
  useEffect(() => {
    if (!anchors && !bounds && !intersections) {
      setReport(undefined);
      return;
    }
    const overlay = new THREE.Group();
    overlay.name = "development_geometry_overlay";
    scene.add(overlay);
    const dispose = (node: THREE.Object3D) =>
      node.traverse((child) => {
        if (child instanceof THREE.Line || child instanceof THREE.Mesh) {
          child.geometry.dispose();
          for (const mat of Array.isArray(child.material)
            ? child.material
            : [child.material])
            mat.dispose();
        }
      });
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      setReport(undefined);
      timer = setTimeout(() => {
        if (!assembly.current || coordinator.busy) return;
        for (const child of [...overlay.children]) {
          overlay.remove(child);
          dispose(child);
        }
        const root = assembly.current;
        root.updateWorldMatrix(true, true);
        const marker = (p: number[], color: string, size = 0.002) => {
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(size, 8, 6),
            new THREE.MeshBasicMaterial({ color }),
          );
          dot.position.set(p[0], p[1], p[2]);
          overlay.add(dot);
        };
        if (anchors) {
          for (const p of Object.values(assemblyAnchors(g).points))
            marker(
              p.map((v) => v / 1000),
              "#297aff",
            );
          for (const [origin, axis, length] of [
            [
              g.lower,
              g.axis,
              g.crownStack +
                Math.hypot(g.head[0] - g.lower[0], g.head[1] - g.lower[1]) +
                0.1,
            ],
            [g.front, [0, 0, 1], 0.17],
            [g.rear, [0, 0, 1], 0.19],
          ] as const) {
            const direction = new THREE.Vector3(...axis);
            overlay.add(
              new THREE.ArrowHelper(
                direction,
                new THREE.Vector3(...origin),
                length,
                0x297aff,
                0.01,
                0.005,
              ),
            );
          }
        }
        if (bounds)
          for (const name of [
            "paint_head",
            "fork_crown",
            "fork_blade_1",
            "fork_blade_-1",
            "fork_dropout_1",
            "rear_dropout_1",
            "paint_chainstay_1",
            "paint_seatstay_1",
          ]) {
            const node = root.getObjectByName(name);
            if (node)
              overlay.add(
                new THREE.Box3Helper(
                  new THREE.Box3().setFromObject(node),
                  new THREE.Color("#70869f"),
                ),
              );
          }
        if (intersections) {
          const report = validateAssembly(root, g);
          setReport(report);
          for (const diagnostic of report.diagnostics)
            for (const point of diagnostic.points || [])
              marker(point, "#e14c4c", 0.003);
        } else setReport(undefined);
        invalidate();
      }, 100);
    };
    const unsubscribe = coordinator.subscribe(refresh);
    refresh();
    return () => {
      clearTimeout(timer);
      unsubscribe();
      scene.remove(overlay);
      dispose(overlay);
      invalidate();
    };
  }, [
    anchors,
    bounds,
    intersections,
    g,
    revision,
    assembly,
    scene,
    invalidate,
    setReport,
    coordinator,
  ]);
  return null;
}
