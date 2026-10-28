import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  fitAssembly,
  shortestAngle,
  easeCamera,
} from "../apps/web/src/features/builder/studio-math";
import {
  autoQuality,
  cameraPresets,
} from "../apps/web/src/features/builder/studio-settings";

describe("studio camera fitting", () => {
  it("keeps transformed assembly bounds inside every preset on portrait and landscape canvases", () => {
    const root = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.1, 0.48));
    mesh.position.set(0.45, 0.25, 0.1);
    mesh.rotation.z = 0.08;
    root.add(mesh);
    for (const [view] of cameraPresets)
      for (const aspect of [0.5, 1.7, 2.8]) {
        const fit = fitAssembly(root, view, aspect, 36);
        const camera = new THREE.PerspectiveCamera(36, aspect, 0.025, 50);
        camera.position
          .copy(fit.center)
          .addScaledVector(fit.direction, fit.distance);
        camera.lookAt(fit.center);
        camera.updateMatrixWorld();
        for (const x of [-0.95, 0.95])
          for (const y of [-0.55, 0.55])
            for (const z of [-0.24, 0.24]) {
              const point = new THREE.Vector3(x, y, z)
                .applyMatrix4(mesh.matrixWorld)
                .project(camera);
              expect(Math.abs(point.x)).toBeLessThan(1);
              expect(Math.abs(point.y)).toBeLessThan(1);
              expect(point.z).toBeGreaterThan(-1);
              expect(point.z).toBeLessThan(1);
            }
        expect(fit.distance).toBeGreaterThanOrEqual(fit.minDistance);
      }
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  });
  it("crosses the angle seam by the short route and clamps easing", () => {
    expect(shortestAngle(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(
      Math.PI + 0.1,
    );
    expect(easeCamera(-1)).toBe(0);
    expect(easeCamera(2)).toBe(1);
  });
  it("uses a conservative automatic budget on mobile, low memory and data saving devices", () => {
    expect(autoQuality(1440, 8, 8)).toBe("balanced");
    for (const args of [
      [375, 8, 8, false],
      [1440, 4, 8, false],
      [1440, 8, 4, false],
      [1440, 8, 8, true],
    ] as const)
      expect(autoQuality(args[0], args[1], args[2], args[3])).toBe("performance");
  });
});
