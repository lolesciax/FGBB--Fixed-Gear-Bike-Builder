import * as THREE from "three";
import type { CameraView } from "./studio-settings";
export function viewDirection(view: CameraView) {
  const xyz: Record<CameraView, [number, number, number]> = {
    studio: [0.65, 0.24, 1],
    side: [0, 0.025, 1],
    front: [1, 0.06, 0],
    rear: [-1, 0.06, 0],
    "three-quarter": [1, 0.3, 1],
    "rear-quarter": [-1, 0.3, 1],
    top: [0, 1, 0.035],
  };
  return new THREE.Vector3(...xyz[view]).normalize();
}
export function fitAssembly(
  root: THREE.Object3D,
  view: CameraView,
  aspect: number,
  fov: number,
) {
  root.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(root),
    center = box.getCenter(new THREE.Vector3()),
    sphere = box.getBoundingSphere(new THREE.Sphere());
  const direction = viewDirection(view),
    right = new THREE.Vector3()
      .crossVectors(new THREE.Vector3(0, 1, 0), direction)
      .normalize(),
    up = new THREE.Vector3().crossVectors(direction, right).normalize();
  let distance = 0;
  const tan = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    node.geometry.computeBoundingBox();
    const bounds = node.geometry.boundingBox!;
    // Instanced spokes stay within wheel meshes already included in the fit.
    if (node instanceof THREE.InstancedMesh) return;
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z]) {
          const delta = new THREE.Vector3(x, y, z)
            .applyMatrix4(node.matrixWorld)
            .sub(center);
          distance = Math.max(
            distance,
            delta.dot(direction) +
              Math.max(
                Math.abs(delta.dot(right)) / (tan * Math.max(0.1, aspect)),
                Math.abs(delta.dot(up)) / tan,
              ),
          );
        }
  });
  const minDistance = Math.max(0.6, sphere.radius * 1.15 + 0.08);
  return {
    center,
    direction,
    distance: Math.max(distance * 1.08, minDistance),
    minDistance,
    box,
  };
}
export function shortestAngle(from: number, to: number) {
  return from + Math.atan2(Math.sin(to - from), Math.cos(to - from));
}
export function easeCamera(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}
