import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as Controls } from "three-stdlib";
import * as THREE from "three";
import {
  fitAssembly,
  shortestAngle,
  easeCamera,
  stopOrbitMotion,
} from "./studio-math";
import { motion, type CameraView } from "./studio-settings";
import {
  inspectionObject,
  type InspectionTarget,
  type CameraCommand,
} from "./inspection";
import type { TransitionCoordinator } from "./transitions";
type Journey = {
  start: THREE.Spherical;
  end: THREE.Spherical;
  startTarget: THREE.Vector3;
  target: THREE.Vector3;
  elapsed: number;
  seconds: number;
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
  inspection,
  navigation,
  coordinator,
  active = true,
}: {
  assembly: RefObject<THREE.Group | null>;
  configurationKey: string;
  view: CameraView;
  resetKey: number;
  reducedMotion: boolean;
  turntable: boolean;
  onInteract: () => void;
  onMoving: (moving: boolean) => void;
  inspection?: InspectionTarget;
  navigation?: CameraCommand;
  coordinator?: TransitionCoordinator;
  active?: boolean;
}) {
  const controls = useRef<Controls>(null),
    journey = useRef<Journey | null>(null),
    initialized = useRef(false),
    limits = useRef({ min: 1, max: 8 });
  const panBounds = useRef({
      center: new THREE.Vector3(),
      radius: 0.5,
      floor: -0.3,
    }),
    interrupted = useRef(false),
    lastNavigation = useRef(0),
    fitSignature = useRef("");
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    if (!active && controls.current) stopOrbitMotion(controls.current);
  }, [active, camera]);
  const requestFit = useCallback(() => {
    if (
      !assembly.current ||
      !controls.current ||
      !(camera instanceof THREE.PerspectiveCamera)
    )
      return;
    const fit = fitAssembly(
      inspectionObject(assembly.current, inspection),
      view,
      size.width / size.height,
      camera.fov,
      inspection?.startsWith('dev-') ? .06 : .6,
    );
    const signature = JSON.stringify([
      view,
      inspection,
      resetKey,
      size.width,
      size.height,
      ...fit.box.min.toArray().map((v) => Math.round(v * 100000)),
      ...fit.box.max.toArray().map((v) => Math.round(v * 100000)),
    ]);
    if (initialized.current && signature === fitSignature.current) return;
    fitSignature.current = signature;
    limits.current = {
      min: inspection?.startsWith('dev-') ? .06 : inspection ? 0.14 : fit.minDistance,
      max: Math.max(5, fit.distance * 2.5),
    };
    controls.current.minDistance = limits.current.min;
    controls.current.maxDistance = limits.current.max;
    panBounds.current = {
      center: fit.center.clone(),
      radius: Math.max(
        0.12,
        fit.box.getSize(new THREE.Vector3()).length() * 0.35,
      ),
      floor: inspection?.startsWith('dev-') ? fit.box.min.y-.005 : fit.box.min.y + 0.04,
    };
    camera.near = inspection?.startsWith('dev-') ? .002 : 0.025;
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
      journey.current = {
        start,
        end,
        startTarget,
        target,
        elapsed: 0,
        seconds: motion.cameraSeconds,
      };
      onMoving(true);
    }
    invalidate();
  }, [
    assembly,
    view,
    resetKey,
    reducedMotion,
    size.width,
    size.height,
    camera,
    invalidate,
    onMoving,
    inspection,
  ]);
  const lastFit = useRef<{ request: () => void; key: string } | null>(null);
  useLayoutEffect(() => {
    if (
      active &&
      (lastFit.current?.request !== requestFit ||
        lastFit.current?.key !== configurationKey)
    ) {
      interrupted.current = false;
      requestFit();
      lastFit.current = { request: requestFit, key: configurationKey };
    }
  }, [requestFit, active, configurationKey]);
  const fitRef = useRef(requestFit);
  fitRef.current = requestFit;
  useLayoutEffect(
    () =>
      coordinator?.subscribe(() => {
        const state = coordinator.getSnapshot();
        if (
          state.phase === "completed" &&
          ["morph", "replacement"].includes(state.plan.strategy) &&
          !interrupted.current
        )
          fitRef.current();
      }),
    [coordinator],
  );
  useLayoutEffect(() => {
    const control = controls.current;
    if (
      !navigation ||
      !control ||
      !active ||
      navigation.id === lastNavigation.current
    )
      return;
    lastNavigation.current = navigation.id;
    interrupted.current = true;
    onInteract();
    const target = control.target.clone(),
      startTarget = target.clone(),
      start = new THREE.Spherical().setFromVector3(
        camera.position.clone().sub(target),
      ),
      end = start.clone();
    if (navigation.action.startsWith("zoom"))
      end.radius = THREE.MathUtils.clamp(
        start.radius * (navigation.action === "zoom-in" ? 0.86 : 1.16),
        limits.current.min,
        limits.current.max,
      );
    else {
      const axis = new THREE.Vector3().setFromMatrixColumn(
          camera.matrix,
          navigation.action.endsWith("left") ||
            navigation.action.endsWith("right")
            ? 0
            : 1,
        ),
        sign =
          navigation.action.endsWith("left") ||
          navigation.action.endsWith("down")
            ? -1
            : 1;
      target.addScaledVector(axis, 0.08 * sign);
      const offset = target.clone().sub(panBounds.current.center);
      offset.clampLength(0, panBounds.current.radius);
      target.copy(panBounds.current.center).add(offset);
      target.y = Math.max(panBounds.current.floor, target.y);
    }
    if (reducedMotion) {
      control.target.copy(target);
      camera.position
        .copy(target)
        .add(new THREE.Vector3().setFromSpherical(end));
      control.update();
      journey.current = null;
      onMoving(false);
    } else {
      journey.current = {
        start,
        end,
        startTarget,
        target,
        elapsed: 0,
        seconds: 0.24,
      };
      onMoving(true);
    }
    invalidate();
  }, [
    navigation,
    active,
    camera,
    reducedMotion,
    onInteract,
    onMoving,
    invalidate,
  ]);
  useFrame((_, delta) => {
    const control = controls.current;
    if (!control || !active) return;
    const currentJourney = journey.current;
    if (currentJourney) {
      currentJourney.elapsed += Math.min(delta, 0.05);
      const t = easeCamera(currentJourney.elapsed / currentJourney.seconds);
      const spherical = new THREE.Spherical(
        THREE.MathUtils.lerp(
          currentJourney.start.radius,
          currentJourney.end.radius,
          t,
        ),
        THREE.MathUtils.lerp(
          currentJourney.start.phi,
          currentJourney.end.phi,
          t,
        ),
        THREE.MathUtils.lerp(
          currentJourney.start.theta,
          currentJourney.end.theta,
          t,
        ),
      );
      control.target.lerpVectors(
        currentJourney.startTarget,
        currentJourney.target,
        t,
      );
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
      enabled={active}
      enableDamping={!reducedMotion}
      dampingFactor={0.09}
      minDistance={limits.current.min}
      maxDistance={limits.current.max}
      minPolarAngle={0.04}
      maxPolarAngle={Math.PI / 2 - 0.01}
      enablePan
      zoomSpeed={0.8}
      rotateSpeed={0.6}
      onStart={() => {
        interrupted.current = true;
        journey.current = null;
        onMoving(false);
        onInteract();
      }}
      onChange={() => {
        const control = controls.current;
        if (!control || !active || journey.current) return;
        const target = control.target.clone(),
          bounds = panBounds.current,
          offset = target
            .clone()
            .sub(bounds.center)
            .clampLength(0, bounds.radius);
        target.copy(bounds.center).add(offset);
        target.y = Math.max(bounds.floor, target.y);
        const correction = target.sub(control.target);
        if (correction.lengthSq() > 0.00000001) {
          control.target.add(correction);
          camera.position.add(correction);
          invalidate();
        }
      }}
    />
  );
}
