import { StudioCamera } from "./StudioCamera";
import { StudioLighting } from "./StudioLighting";
import { PartGroup, PaintMaterial } from "./MaterialMotion";
import type {
  CameraView,
  StudioEnvironment,
  QualityTier,
} from "./studio-settings";
import { useLayoutEffect, useMemo, useRef } from "react";

import { FrameKit } from "./FrameKit";

import * as THREE from "three";
import {
  assemblyGeometry,
  variantById,
  type Configuration,
  type Product,
  type Slot,
} from "@tracklab/domain";
type Point = { x: number; y: number };
function CurvedBar({ points, z }: { points: Point[]; z: number }) {
  const key = JSON.stringify(points);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        (JSON.parse(key) as Point[]).map((point) => vec(point, z)),
      ),
    [key, z],
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, 32, 0.012, 10, false]} />
      <meshStandardMaterial color="#343d49" metalness={0.2} roughness={0.72} />
    </mesh>
  );
}
const vec = (point: Point, z = 0) =>
  new THREE.Vector3(point.x / 1000, -point.y / 1000, z);
function Tube({
  a,
  b,
  radius = 12,
  color = "#424a57",
  z = 0,
  paint = false,
  reducedMotion = false,
}: {
  a: Point;
  b: Point;
  paint?: boolean;
  reducedMotion?: boolean;
  radius?: number;
  color?: string;
  z?: number;
}) {
  const transform = useMemo(() => {
    const start = vec(a, z),
      end = vec(b, z),
      delta = end.clone().sub(start);
    return {
      position: start.add(end).multiplyScalar(0.5),
      length: delta.length(),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        delta.normalize(),
      ),
    };
  }, [a, b, z]);
  return (
    <mesh position={transform.position} quaternion={transform.quaternion}>
      <cylinderGeometry
        args={[radius / 1000, radius / 1000, transform.length, 20]}
      />
      {paint ? (
        <PaintMaterial color={color} reducedMotion={reducedMotion} />
      ) : (
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.32} />
      )}
    </mesh>
  );
}
function Ring({
  center,
  radius,
  thickness,
  color,
  z = 0,
}: {
  center: Point;
  radius: number;
  thickness: number;
  color: string;
  z?: number;
}) {
  return (
    <mesh position={vec(center, z)}>
      <torusGeometry args={[radius / 1000, thickness / 1000, 12, 96]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.45} />
    </mesh>
  );
}
export function ProceduralAssembly({
  configuration,
  catalog,
  resetKey,
  onSelect,
  cameraView = "studio",
  studio = "light",
  quality = "balanced",
  reducedMotion = false,
  turntable = false,
  activeSlot,
  onInteract,
  onMoving,
}: {
  configuration: Configuration;
  catalog: Product[];
  resetKey: number;
  onSelect: (slot: Slot) => void;
  cameraView?: CameraView;
  studio?: StudioEnvironment;
  quality?: QualityTier;
  reducedMotion?: boolean;
  turntable?: boolean;
  activeSlot?: Slot;
  onInteract: () => void;
  onMoving: (moving: boolean) => void;
}) {
  const get = (slot: Slot) =>
    variantById(catalog, configuration[slot])?.variant;
  const g = assemblyGeometry(get("frameset")?.specs),
    { rear, front, bb, seat, head, headBottom, saddle, bar } = g;
  const group = useRef<THREE.Group>(null);
  const modelKey = Object.values(configuration).join("|");
  const geometryKey = JSON.stringify([
    get("frameset")?.specs,
    get("frameset")?.asset3D?.url,
    get("cockpit")?.specs,
    get("saddle")?.specs,
    get("wheels")?.specs,
    get("tires")?.specs,
  ]);
  const pick = (slot: Slot) => ({
    onClick: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      onSelect(slot);
    },
  });
  const paint = get("frameset")?.color || "#535963",
    deep = get("wheels")?.specs.rimDepth === 60;
  return (
    <>
      <group ref={group}>
        <PartGroup
          {...pick("frameset")}
          active={activeSlot === "frameset"}
          modelKey={modelKey}
        >
          {get("frameset")?.asset3D ? (
            <FrameKit
              variant={get("frameset")!}
              bb={bb}
              reducedMotion={reducedMotion}
            />
          ) : (
            <>
              {[
                [rear, seat, 7],
                [rear, bb, 9],
                [seat, head, g.frameWidth / 2],
                [bb, seat, g.frameWidth / 2],
                [bb, headBottom, g.frameWidth / 2 + 5],
                [head, headBottom, g.frameWidth / 2 + 6],
              ].map(([a, b, r], i) => (
                <Tube
                  key={i}
                  a={a as Point}
                  b={b as Point}
                  radius={r as number}
                  color={paint}
                  paint
                  reducedMotion={reducedMotion}
                />
              ))}
              {[-0.035, 0.035].map((z) => (
                <Tube key={z} a={headBottom} b={front} radius={12} z={z} />
              ))}
            </>
          )}
        </PartGroup>
        {[rear, front].map((axle, i) => (
          <PartGroup
            key={i}
            {...pick("wheels")}
            active={activeSlot === "wheels"}
            modelKey={modelKey}
          >
            <PartGroup
              {...pick("tires")}
              active={activeSlot === "tires"}
              modelKey={modelKey}
            >
              <Ring
                center={axle}
                radius={326}
                thickness={12}
                color={
                  get("tires")?.specs.sidewall === "tan" ? "#9e825a" : "#20242b"
                }
              />
            </PartGroup>
            <Ring
              center={axle}
              radius={deep ? 291 : 309}
              thickness={deep ? 27 : 10}
              color="#454e5b"
            />
            <Spokes center={axle} radius={deep ? 264 : 301} />
            <mesh position={vec(axle)} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.11, 20]} />
              <meshStandardMaterial
                color="#aab2bd"
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
          </PartGroup>
        ))}
        <PartGroup
          {...pick("saddle")}
          active={activeSlot === "saddle"}
          modelKey={modelKey}
        >
          <Tube
            a={seat}
            b={saddle}
            radius={(Number(get("saddle")?.specs.seatpost) || 22) / 2}
          />
          <mesh
            position={vec({ x: saddle.x, y: saddle.y - 10 })}
            scale={[
              0.092,
              0.014,
              get("saddle")?.specs.shape === "comfort" ? 0.06 : 0.04,
            ]}
          >
            <sphereGeometry args={[1, 32, 16]} />
            <meshStandardMaterial color="#222831" roughness={0.65} />
          </mesh>
        </PartGroup>
        <PartGroup
          {...pick("cockpit")}
          active={activeSlot === "cockpit"}
          modelKey={modelKey}
        >
          <Tube a={head} b={{ x: head.x - 7, y: head.y - 48 }} radius={13} />
          <Tube a={{ x: head.x - 7, y: head.y - 48 }} b={bar} radius={13} />
          {[-0.18, 0.18].map((z) => (
            <CurvedBar
              key={z}
              z={z}
              points={
                get("cockpit")?.specs.shape === "riser"
                  ? [
                      bar,
                      { x: bar.x + 45, y: bar.y - 25 },
                      { x: bar.x + 105, y: bar.y - 30 },
                    ]
                  : get("cockpit")?.specs.shape === "bullhorn"
                    ? [
                        bar,
                        { x: bar.x + 75, y: bar.y - 20 },
                        { x: bar.x + 110, y: bar.y - 85 },
                      ]
                    : [
                        bar,
                        { x: bar.x + 55, y: bar.y + 3 },
                        { x: bar.x + 86, y: bar.y + 24 },
                        { x: bar.x + 92, y: bar.y + 65 },
                        { x: bar.x + 65, y: bar.y + 108 },
                        { x: bar.x + 20, y: bar.y + 117 },
                      ]
              }
            />
          ))}
          <mesh position={vec(bar)} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.36, 20]} />
            <meshStandardMaterial color="#343d49" roughness={0.65} />
          </mesh>
        </PartGroup>
        <PartGroup
          {...pick("drivetrain")}
          active={activeSlot === "drivetrain"}
          modelKey={modelKey}
        >
          <Ring
            center={bb}
            radius={80}
            thickness={6}
            color="#7c8795"
            z={0.065}
          />
          {Array.from({ length: 5 }, (_, i) => {
            const angle = (i * Math.PI * 2) / 5;
            return (
              <Tube
                key={i}
                a={bb}
                b={{
                  x: bb.x + Math.cos(angle) * 76,
                  y: bb.y + Math.sin(angle) * 76,
                }}
                radius={5}
                z={0.065}
              />
            );
          })}
          <Tube
            a={bb}
            b={{ x: bb.x + 118, y: bb.y + 45 }}
            radius={11}
            z={0.08}
          />
          <Tube
            a={{ x: 0, y: -24 }}
            b={{ x: bb.x, y: bb.y - 83 }}
            radius={3}
            color="#959ba2"
            z={0.065}
          />
          <Tube
            a={{ x: 0, y: 24 }}
            b={{ x: bb.x, y: bb.y + 83 }}
            radius={3}
            color="#959ba2"
            z={0.065}
          />
          <mesh position={vec({ x: bb.x + 118, y: bb.y + 51 }, 0.08)}>
            <boxGeometry args={[0.06, 0.016, 0.08]} />
            <meshStandardMaterial color="#343d49" />
          </mesh>
        </PartGroup>
      </group>
      <StudioLighting
        studio={studio}
        quality={quality}
        modelKey={modelKey}
        centerX={front.x / 2000}
      />
      <StudioCamera
        assembly={group}
        configurationKey={geometryKey}
        view={cameraView}
        resetKey={resetKey}
        reducedMotion={reducedMotion}
        turntable={turntable}
        onInteract={onInteract}
        onMoving={onMoving}
      />
    </>
  );
}

function Spokes({ center, radius }: { center: Point; radius: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { x, y } = center;
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const dummy = new THREE.Object3D(),
      up = new THREE.Vector3(0, 1, 0),
      a = vec({ x, y });
    for (let i = 0; i < 28; i++) {
      const angle = (i * Math.PI * 2) / 28,
        b = vec({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
        }),
        delta = b.clone().sub(a);
      dummy.position.copy(a).add(b).multiplyScalar(0.5);
      dummy.quaternion.setFromUnitVectors(up, delta.clone().normalize());
      dummy.scale.set(1, delta.length(), 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [x, y, radius]);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 28]}>
      <cylinderGeometry args={[0.001, 0.001, 1, 6]} />
      <meshStandardMaterial color="#a1a9b4" metalness={0.65} roughness={0.4} />
    </instancedMesh>
  );
}
