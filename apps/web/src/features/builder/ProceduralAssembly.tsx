import { useLayoutEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { FrameKit } from "./FrameKit";
import type { OrbitControls as Controls } from "three-stdlib";
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
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((point) => vec(point, z))),
    [points, z],
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
}: {
  a: Point;
  b: Point;
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
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.32} />
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
  cameraView = "side",
}: {
  configuration: Configuration;
  catalog: Product[];
  resetKey: number;
  onSelect: (slot: Slot) => void;
  cameraView?: "side" | "front" | "rear" | "three-quarter";
}) {
  const get = (slot: Slot) =>
    variantById(catalog, configuration[slot])?.variant;
  const g = assemblyGeometry(get("frameset")?.specs),
    { rear, front, bb, seat, head, headBottom, saddle, bar } = g;
  const group = useRef<THREE.Group>(null),
    controls = useRef<Controls>(null);
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    if (!group.current || !(camera instanceof THREE.PerspectiveCamera)) return;
    const box = new THREE.Box3().setFromObject(group.current),
      center = box.getCenter(new THREE.Vector3());
    const fov = THREE.MathUtils.degToRad(camera.fov),
      aspect = size.width / size.height;
    const direction = new THREE.Vector3(
      ...((cameraView === "front"
        ? [1, 0.03, 0]
        : cameraView === "rear"
          ? [-1, 0.03, 0]
          : cameraView === "three-quarter"
            ? [1, 0.3, 1]
            : [0, 0.025, 1]) as [number, number, number]),
    ).normalize();
    const right = new THREE.Vector3()
        .crossVectors(new THREE.Vector3(0, 1, 0), direction)
        .normalize(),
      up = new THREE.Vector3().crossVectors(direction, right).normalize();
    let distance = 0;
    // Fit component bounds rather than the empty corners of one assembly-wide box.
    group.current.traverse(node=>{
      if(!(node instanceof THREE.Mesh))return;
      if(!node.geometry.boundingBox)node.geometry.computeBoundingBox();
      const part=node.geometry.boundingBox!;
      for (const x of [part.min.x, part.max.x])
      for (const y of [part.min.y, part.max.y])
        for (const z of [part.min.z, part.max.z]) {
          const delta = new THREE.Vector3(x, y, z).applyMatrix4(node.matrixWorld).sub(center);
          distance = Math.max(
            distance,
            delta.dot(direction) +
              Math.max(
                Math.abs(delta.dot(right)) / (Math.tan(fov / 2) * aspect),
                Math.abs(delta.dot(up)) / Math.tan(fov / 2),
              ),
          );
        }
    });
    camera.position.copy(center).add(direction.multiplyScalar(distance * 1.06));
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    controls.current?.target.copy(center);
    controls.current?.update();
    invalidate();
  }, [
    configuration.frameset,
    cameraView,
    resetKey,
    size.width,
    size.height,
    camera,
    invalidate,
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
        <group {...pick("frameset")}>
          {get("frameset")?.asset3D ? (
            <FrameKit variant={get("frameset")!} bb={bb} />
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
                />
              ))}
              {[-0.035, 0.035].map((z) => (
                <Tube key={z} a={headBottom} b={front} radius={12} z={z} />
              ))}
            </>
          )}
        </group>
        {[rear, front].map((axle, i) => (
          <group key={i} {...pick("wheels")}>
            <group {...pick("tires")}>
              <Ring
                center={axle}
                radius={326}
                thickness={12}
                color={
                  get("tires")?.specs.sidewall === "tan" ? "#9e825a" : "#20242b"
                }
              />
            </group>
            <Ring
              center={axle}
              radius={deep ? 291 : 309}
              thickness={deep ? 27 : 10}
              color="#454e5b"
            />
            {Array.from({ length: 28 }, (_, n) => {
              const angle = (n * Math.PI * 2) / 28;
              return (
                <Tube
                  key={n}
                  a={axle}
                  b={{
                    x: axle.x + Math.cos(angle) * (deep ? 264 : 301),
                    y: Math.sin(angle) * (deep ? 264 : 301),
                  }}
                  radius={1}
                  color="#a1a9b4"
                />
              );
            })}
            <mesh position={vec(axle)} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.11, 20]} />
              <meshStandardMaterial
                color="#aab2bd"
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
          </group>
        ))}
        <group {...pick("saddle")}>
          <Tube a={seat} b={saddle} radius={(Number(get('saddle')?.specs.seatpost)||22)/2} />
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
        </group>
        <group {...pick("cockpit")}>
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
        </group>
        <group {...pick("drivetrain")}>
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
        </group>
      </group>
      <ContactShadows
        position={[front.x / 2000, -0.35, 0]}
        opacity={0.22}
        scale={4}
        blur={2.5}
        far={1}
      />
      <OrbitControls
        ref={controls}
        minDistance={1}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2 + 0.5}
        enablePan
      />
    </>
  );
}
