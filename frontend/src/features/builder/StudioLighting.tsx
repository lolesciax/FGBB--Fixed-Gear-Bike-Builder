import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { GroundShadow } from "./GroundShadow";
import { SoftboxEnvironment } from "./SoftboxEnvironment";
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
}: {
  studio: StudioEnvironment;
  quality: QualityTier;
  modelKey: string;
  centerX: number;
  groundY?: number;
}) {
  const palette = studioPalettes[studio],
    { gl, invalidate } = useThree();
  useEffect(() => {
    gl.toneMappingExposure = palette.exposure;
    invalidate();
  }, [gl, invalidate, palette.exposure]);
  return (
    <>
      <color attach="background" args={[palette.background]} />
      <fog attach="fog" args={[palette.background, 3, 12]} />
      <hemisphereLight
        args={[palette.key, palette.floor, studio === "dark" ? 0.9 : 1.25]}
      />
      <directionalLight
        position={[1, 4, 3]}
        color={palette.key}
        intensity={studio === "dark" ? 2.2 : 2.6}
      />
      <directionalLight
        position={[-3, 2, 2]}
        color={palette.fill}
        intensity={0.8}
      />
      <directionalLight
        position={[2, 3, -4]}
        color={palette.rim}
        intensity={studio === "dark" ? 3 : 1.4}
      />
      {quality !== "performance" && (
        <SoftboxEnvironment
          resolution={quality === "quality" ? 256 : 128}
          intensity={studio === "dark" ? 0.7 : 0.65}
        />
      )}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[centerX, groundY - 0.0005, 0]}
      >
        <planeGeometry args={[20, 20, 8, 8]} />
        <meshBasicMaterial color={palette.floor} toneMapped={false} />
      </mesh>
      {quality !== "performance" && (
        <GroundShadow
          centerX={centerX}
          groundY={groundY}
          revision={studio + quality + modelKey}
          opacity={studio === "dark" ? 0.5 : 0.3}
          resolution={quality === "quality" ? 512 : 256}
        />
      )}
    </>
  );
}
