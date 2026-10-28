import { useLayoutEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as Controls } from "three-stdlib";
import * as THREE from "three";
import { fitAssembly, shortestAngle, easeCamera } from "./studio-math";
import { motion, type CameraView } from "./studio-settings";
type Journey = {
  start: THREE.Spherical;
  end: THREE.Spherical;
  startTarget: THREE.Vector3;
  target: THREE.Vector3;
  elapsed: number;
};
export function StudioCamera({
  assembly,
  configurationKey,
  view,
  resetKey,
  reducedMotion,
  turntable,
  onInteract,
  onMoving,
}: {
  assembly: RefObject<THREE.Group | null>;
  configurationKey: string;
  view: CameraView;
  resetKey: number;
  reducedMotion: boolean;
  turntable: boolean;
  onInteract: () => void;
  onMoving: (moving: boolean) => void;
}) {
  const controls = useRef<Controls>(null),
    journey = useRef<Journey | null>(null),
    initialized = useRef(false),
    limits = useRef({ min: 1, max: 8 });
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    if (
      !assembly.current ||
      !controls.current ||
      !(camera instanceof THREE.PerspectiveCamera)
    )
      return;
    const fit = fitAssembly(
      assembly.current,
      view,
      size.width / size.height,
      camera.fov,
    );
    limits.current = {
      min: fit.minDistance,
      max: Math.max(5, fit.distance * 2.5),
    };
    controls.current.minDistance = limits.current.min;
    controls.current.maxDistance = limits.current.max;
    camera.near = 0.025;
    camera.far = 50;
    camera.updateProjectionMatrix();
    const target = fit.center,
      startTarget = controls.current.target.clone();
    const end = new THREE.Spherical().setFromVector3(
      fit.direction.multiplyScalar(fit.distance),
    );
    const start = new THREE.Spherical().setFromVector3(
      camera.position.clone().sub(startTarget),
    );
    // A short dolly reveal on first load; no model distortion or replay on category changes.
    if (!initialized.current) {
      start.copy(end);
      start.radius *= reducedMotion ? 1 : 1.08;
      startTarget.copy(target);
      camera.position
        .copy(target)
        .add(new THREE.Vector3().setFromSpherical(start));
      controls.current.target.copy(target);
      initialized.current = true;
    }
    end.theta = shortestAngle(start.theta, end.theta);
    if (reducedMotion) {
      camera.position
        .copy(target)
        .add(new THREE.Vector3().setFromSpherical(end));
      controls.current.target.copy(target);
      controls.current.update();
      journey.current = null;
      onMoving(false);
    } else {
      journey.current = { start, end, startTarget, target, elapsed: 0 };
      onMoving(true);
    }
    invalidate();
  }, [
    assembly,
    configurationKey,
    view,
    resetKey,
    reducedMotion,
    size.width,
    size.height,
    camera,
    invalidate,
    onMoving,
  ]);
  useFrame((_, delta) => {
    const control = controls.current;
    if (!control) return;
    const active = journey.current;
    if (active) {
      active.elapsed += Math.min(delta, 0.05);
      const t = easeCamera(active.elapsed / motion.cameraSeconds);
      const spherical = new THREE.Spherical(
        THREE.MathUtils.lerp(active.start.radius, active.end.radius, t),
        THREE.MathUtils.lerp(active.start.phi, active.end.phi, t),
        THREE.MathUtils.lerp(active.start.theta, active.end.theta, t),
      );
      control.target.lerpVectors(active.startTarget, active.target, t);
      camera.position
        .copy(control.target)
        .add(new THREE.Vector3().setFromSpherical(spherical));
      control.update();
      if (t >= 1) {
        journey.current = null;
        onMoving(false);
      } else invalidate();
    } else if (turntable && !reducedMotion) {
      const offset = camera.position.clone().sub(control.target);
      offset.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        Math.min(delta, 0.05) * motion.turntableRadiansPerSecond,
      );
      camera.position.copy(control.target).add(offset);
      control.update();
      invalidate();
    }
  });
  useLayoutEffect(() => {
    if (turntable) invalidate();
  }, [turntable, invalidate]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping={!reducedMotion}
      dampingFactor={0.09}
      minDistance={limits.current.min}
      maxDistance={limits.current.max}
      minPolarAngle={0.04}
      maxPolarAngle={Math.PI / 2 - 0.01}
      enablePan={false}
      zoomSpeed={0.8}
      rotateSpeed={0.6}
      onStart={() => {
        journey.current = null;
        onMoving(false);
        onInteract();
      }}
    />
  );
}
