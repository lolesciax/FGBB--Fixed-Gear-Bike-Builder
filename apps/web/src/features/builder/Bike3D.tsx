import { Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import type { Configuration, Product, Slot } from "@tracklab/domain";
import { ProceduralAssembly } from "./ProceduralAssembly";
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export default function Bike3D(props: {
  configuration: Configuration;
  catalog: Product[];
  onSelect: (slot: Slot) => void;
  resetKey: number;
}) {
  const fallback = (
    <div className="viewer-fallback">
      <strong>3D preview unavailable</strong>
      <p>
        Your browser could not render this assembly. Your build is still
        available in 2D.
      </p>
    </div>
  );
  return (
    <SceneBoundary fallback={fallback}>
      <Canvas
        camera={{ position: [0, 0.3, 3], fov: 36 }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ antialias: true, powerPreference: "low-power" }}
        fallback={fallback}
      >
        <ambientLight intensity={1.6} />
        <directionalLight position={[2, 5, 4]} intensity={3} />
        <directionalLight position={[-3, 2, -3]} intensity={1.2} />
        <ProceduralAssembly {...props} />
      </Canvas>
    </SceneBoundary>
  );
}
