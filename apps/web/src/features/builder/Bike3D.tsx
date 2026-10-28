import {
  Component,
  Suspense,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { variantById, type Configuration, type Product, type Slot } from "@tracklab/domain";
import { useGLTF } from '@react-three/drei';
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
  cameraView?: "side" | "front" | "rear" | "three-quarter";
}) {
  const [loading, setLoading] = useState(true);
  const [attempt,setAttempt]=useState(0);
  const ready = useCallback(() => setLoading(false), []);
  const fallback = (
    <div className="viewer-fallback">
      <strong>3D preview unavailable</strong>
      <p>
        Your browser could not render this assembly. Your build is still
        available in 2D.
      </p>
      <button className="button" onClick={()=>{const url=variantById(props.catalog,props.configuration.frameset)?.variant.asset3D?.url;if(url)useGLTF.clear(url);setLoading(true);setAttempt(value=>value+1);}}>Retry 3D model</button>
    </div>
  );
  return (
    <SceneBoundary key={attempt} fallback={fallback}>
      <div
        className="bike3d-wrapper"
        data-frame-variant={props.configuration.frameset}
      >
        {loading && (
          <div className="model-loading" role="status">
            Loading frameset model...
          </div>
        )}
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
          <Suspense fallback={null}>
            <ProceduralAssembly {...props} />
            <ModelReady onReady={ready} />
          </Suspense>
        </Canvas>
      </div>
    </SceneBoundary>
  );
}
function ModelReady({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}
