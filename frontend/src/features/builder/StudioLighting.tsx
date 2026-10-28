import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
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
}: {
  studio: StudioEnvironment;
  quality: QualityTier;
  modelKey: string;
  centerX: number;
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
        <Environment
          key={studio + quality}
          frames={1}
          resolution={quality === "quality" ? 256 : 128}
          environmentIntensity={studio === "dark" ? 0.7 : 0.65}
        >
          <Lightformer
            form="rect"
            intensity={3}
            position={[0, 4, 1]}
            scale={[6, 2, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={2}
            position={[-3, 1, 2]}
            scale={[2, 4, 1]}
            rotation={[0, Math.PI / 3, 0]}
          />
          <Lightformer
            form="rect"
            intensity={4}
            position={[3, 2, -3]}
            scale={[1, 4, 1]}
            rotation={[0, -Math.PI / 3, 0]}
          />
        </Environment>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.343, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color={palette.floor} toneMapped={false} />
      </mesh>
      {quality !== "performance" && (
        <ContactShadows
          key={studio + quality + modelKey}
          position={[centerX, -0.34, 0]}
          opacity={studio === "dark" ? 0.5 : 0.3}
          scale={5}
          blur={3}
          far={1.2}
          resolution={quality === "quality" ? 512 : 256}
          frames={1}
        />
      )}
    </>
  );
}
