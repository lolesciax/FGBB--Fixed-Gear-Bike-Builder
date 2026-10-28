import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export function SoftboxEnvironment({
  resolution,
  intensity,
}: {
  resolution: number;
  intensity: number;
}) {
  const { gl, scene, invalidate } = useThree();
  useLayoutEffect(() => {
    // Pre-filter the original three studio panels once, then own the resulting
    // CubeUV target directly. Repeated quality changes release all GPU targets.
    const studio = new THREE.Scene();
    const plane = new THREE.PlaneGeometry(1, 1);
    const materials: THREE.MeshBasicMaterial[] = [];
    const panels = [
      {
        power: 3,
        position: [0, 4, 1],
        scale: [6, 2, 1],
        rotation: [-Math.PI / 2, 0, 0],
      },
      {
        power: 2,
        position: [-3, 1, 2],
        scale: [2, 4, 1],
        rotation: [0, Math.PI / 3, 0],
      },
      {
        power: 4,
        position: [3, 2, -3],
        scale: [1, 4, 1],
        rotation: [0, -Math.PI / 3, 0],
      },
    ];
    for (const panel of panels) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setScalar(panel.power),
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      materials.push(material);
      const mesh = new THREE.Mesh(plane, material);
      mesh.position.fromArray(panel.position);
      mesh.scale.fromArray(panel.scale);
      mesh.rotation.set(
        panel.rotation[0],
        panel.rotation[1],
        panel.rotation[2],
      );
      studio.add(mesh);
    }
    const generator = new THREE.PMREMGenerator(gl);
    const target = generator.fromScene(studio, 0, 0.1, 100, {
      size: resolution,
    });
    generator.dispose();
    plane.dispose();
    materials.forEach((material) => material.dispose());
    const previous = scene.environment,
      previousIntensity = scene.environmentIntensity;
    scene.environment = target.texture;
    scene.environmentIntensity = intensity;
    invalidate();
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = previousIntensity;
      target.dispose();
    };
  }, [gl, scene, resolution, intensity, invalidate]);
  return null;
}
