import { Component, Suspense, useMemo, useRef, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import { variantById, slots, type Configuration, type Product, type Slot } from '@tracklab/domain';
const registry = { frameTrack: 'frame-track', framePursuit: 'frame-pursuit', wheelClassic: 'wheels-classic', wheelDeep: 'wheels-deep', tireBlack: 'tires-black', tireTan: 'tires-tan', cockpitDrop: 'cockpit-drop', cockpitRiser: 'cockpit-riser', saddleRace: 'saddle-race', saddleComfort: 'saddle-comfort', drivetrain: 'drivetrain' };
function Part({ asset, color, slot, onSelect }: { asset: string; color?: string; slot: Slot; onSelect: (slot: Slot) => void }) {
  const gltf = useGLTF(`/models/${asset}.glb`);
  const scene = useMemo(() => { const clone = gltf.scene.clone(true); clone.traverse(node => { if (node instanceof THREE.Mesh && node.name.startsWith('paint') && color) { node.material = node.material.clone(); node.material.color.set(color); } }); return clone; }, [gltf.scene, color]);
  return <primitive object={scene} onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onSelect(slot); }} />;
}
class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> { state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; } render() { return this.state.failed ? this.props.fallback : this.props.children; } }
export default function Bike3D({ configuration, catalog, onSelect, resetKey }: { configuration: Configuration; catalog: Product[]; onSelect: (slot: Slot) => void; resetKey: number }) {
  const get = (s: Slot) => variantById(catalog, configuration[s])?.variant;
  const controls = useRef<OrbitControlsType>(null);
  const assets: Record<Slot, string> = { frameset: get('frameset')?.specs.geometry === 'pursuit' ? registry.framePursuit : registry.frameTrack, wheels: get('wheels')?.specs.rimDepth === 60 ? registry.wheelDeep : registry.wheelClassic, tires: get('tires')?.specs.sidewall === 'tan' ? registry.tireTan : registry.tireBlack, cockpit: get('cockpit')?.specs.shape === 'riser' ? registry.cockpitRiser : registry.cockpitDrop, drivetrain: registry.drivetrain, saddle: get('saddle')?.specs.shape === 'comfort' ? registry.saddleComfort : registry.saddleRace };
  const fallback = <div className="viewer-fallback"><strong>3D preview unavailable</strong><p>Your browser could not render this assembly. Your build is still available in 2D.</p></div>;
  return <SceneBoundary fallback={fallback}><Suspense fallback={<div className="viewer-fallback">Loading the studio…</div>}><Canvas key={resetKey} camera={{ position: [1.5, .8, 2.2], fov: 36 }} dpr={[1, 1.5]} frameloop="demand" gl={{ antialias: true, powerPreference: 'low-power' }} fallback={fallback}>
    <ambientLight intensity={1.6}/><directionalLight position={[2, 5, 4]} intensity={3}/><directionalLight position={[-3, 2, -3]} intensity={1.2}/>
    <group>{slots.map(slot => <Part key={slot} slot={slot} asset={assets[slot]} color={slot === 'frameset' ? get(slot)?.color : undefined} onSelect={onSelect}/>)}</group>
    <ContactShadows position={[0, -.292, 0]} opacity={.25} scale={5} blur={2.5} far={1}/>
    <OrbitControls ref={controls} target={[0, .2, 0]} minDistance={1.3} maxDistance={5} maxPolarAngle={Math.PI / 2 + .1} enablePan/>
  </Canvas></Suspense></SceneBoundary>;
}
