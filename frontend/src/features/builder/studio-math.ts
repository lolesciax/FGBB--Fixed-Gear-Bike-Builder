import * as THREE from "three";
import type { CameraView } from "./studio-settings";
export function viewDirection(view: CameraView) {
  const xyz: Record<CameraView, [number, number, number]> = {
    studio: [0.65, 0.24, 1],
    side: [0, 0.025, 1],
    "opposite-side": [0, 0.025, -1],
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
    const positions = node.geometry.getAttribute("position"),
      matrix = new THREE.Matrix4(),
      instance = new THREE.Matrix4(),
      delta = new THREE.Vector3();
    if (!positions) return;
    // Project actual vertices: diagonal tubes and round wheels are much tighter than
    // their box corners. Include every instance, including pedals/chain hardware.
    const count = node instanceof THREE.InstancedMesh ? node.count : 1;
    for (let i = 0; i < count; i++) {
      matrix.copy(node.matrixWorld);
      if (node instanceof THREE.InstancedMesh) {
        node.getMatrixAt(i, instance);
        matrix.multiply(instance);
      }
      for (let j = 0; j < positions.count; j++) {
        delta
          .fromBufferAttribute(positions, j)
          .applyMatrix4(matrix)
          .sub(center);
        distance = Math.max(
          distance,
          delta.dot(direction) +
            Math.max(
              Math.abs(delta.dot(right)) / (tan * Math.max(0.1, aspect) * 0.82),
              Math.abs(delta.dot(up)) / (tan * 0.9),
            ),
        );
      }
    }
  });
  const minDistance = Math.max(0.6, sphere.radius * 1.15 + 0.08);
  return {
    center,
    direction,
    distance: Math.max(distance, minDistance),
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
