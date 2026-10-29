import { useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GroundShadow } from "./GroundShadow";
import { SoftboxEnvironment } from "./SoftboxEnvironment";
import { useFiniteTween } from "./useFiniteTween";
import {
  studioPalettes,
  type StudioEnvironment,
  type QualityTier,
} from "./studio-settings";
export function StudioLighting({
  studio,
  quality,
  modelKey,
  centerX,
  groundY = -0.338,
  reducedMotion = false,
}: {
  studio: StudioEnvironment;
  quality: QualityTier;
  modelKey: string;
  centerX: number;
  groundY?: number;
  reducedMotion?: boolean;
}) {
  const { gl, scene } = useThree(),
    [initial] = useState(() => ({
      palette: studioPalettes[studio],
      dark: studio === "dark",
    })),
    hemi = useRef<THREE.HemisphereLight>(null),
    key = useRef<THREE.DirectionalLight>(null),
    fill = useRef<THREE.DirectionalLight>(null),
    rim = useRef<THREE.DirectionalLight>(null),
    floor = useRef<THREE.MeshBasicMaterial>(null);
  const palette = studioPalettes[studio],
    targets = {
      background: new THREE.Color(palette.background),
      floor: new THREE.Color(palette.floor),
      key: new THREE.Color(palette.key),
      fill: new THREE.Color(palette.fill),
      rim: new THREE.Color(palette.rim),
    };
  useFiniteTween(
    scene.uuid,
    studio + "/" + quality,
    reducedMotion,
    (amount) => {
      if (scene.background instanceof THREE.Color)
        scene.background.lerp(targets.background, amount);
      if (scene.fog instanceof THREE.Fog)
        scene.fog.color.lerp(targets.background, amount);
      if (hemi.current) {
        hemi.current.color.lerp(targets.key, amount);
        hemi.current.groundColor.lerp(targets.floor, amount);
        hemi.current.intensity = THREE.MathUtils.lerp(
          hemi.current.intensity,
          studio === "dark" ? 0.9 : 1.25,
          amount,
        );
      }
      for (const [light, color, intensity] of [
        [key.current, targets.key, studio === "dark" ? 2.2 : 2.6],
        [fill.current, targets.fill, 0.8],
        [rim.current, targets.rim, studio === "dark" ? 3 : 1.4],
      ] as const)
        if (light) {
          light.color.lerp(color, amount);
          light.intensity = THREE.MathUtils.lerp(
            light.intensity,
            intensity,
            amount,
          );
        }
      floor.current?.color.lerp(targets.floor, amount);
      gl.toneMappingExposure = THREE.MathUtils.lerp(
        gl.toneMappingExposure,
        palette.exposure,
        amount,
      );
      scene.environmentIntensity = THREE.MathUtils.lerp(
        scene.environmentIntensity,
        studio === "dark" ? 0.7 : 0.65,
        amount,
      );
    },
    0.45,
  );
  return (
    <>
      <color attach="background" args={[initial.palette.background]} />
      <fog attach="fog" args={[initial.palette.background, 3, 12]} />
      <hemisphereLight
        ref={hemi}
        name="studio_hemisphere"
        args={[
          initial.palette.key,
          initial.palette.floor,
          initial.dark ? 0.9 : 1.25,
        ]}
      />
      <directionalLight
        ref={key}
        name="studio_key"
        position={[1, 4, 3]}
        color={initial.palette.key}
        intensity={initial.dark ? 2.2 : 2.6}
      />
      <directionalLight
        ref={fill}
        name="studio_fill"
        position={[-3, 2, 2]}
        color={initial.palette.fill}
        intensity={0.8}
      />
      <directionalLight
        ref={rim}
        name="studio_rim"
        position={[2, 3, -4]}
        color={initial.palette.rim}
        intensity={initial.dark ? 3 : 1.4}
      />
      {quality !== "performance" && (
        <SoftboxEnvironment resolution={quality === "quality" ? 256 : 128} />
      )}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[centerX, groundY - 0.0005, 0]}
      >
        <planeGeometry args={[20, 20, 8, 8]} />
        <meshBasicMaterial
          ref={floor}
          color={initial.palette.floor}
          toneMapped={false}
        />
      </mesh>
      {quality !== "performance" && (
        <GroundShadow
          centerX={centerX}
          groundY={groundY}
          revision={quality + modelKey}
          opacity={studio === "dark" ? 0.5 : 0.3}
          resolution={quality === "quality" ? 512 : 256}
          reducedMotion={reducedMotion}
        />
      )}
    </>
  );
}
