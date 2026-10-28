import {
  Component,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  variantById,
  type Configuration,
  type Product,
  type Slot,
} from "@tracklab/domain";
import { ProceduralAssembly } from "./ProceduralAssembly";
import { Bike2D } from "./Bike2D";
import {
  autoQuality,
  type CameraView,
  type StudioEnvironment,
  type GraphicsQuality,
  type QualityTier,
} from "./studio-settings";
import { useMediaQuery } from "../../components/useMediaQuery";
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
type Props = {
  configuration: Configuration;
  catalog: Product[];
  onSelect: (slot: Slot) => void;
  resetKey: number;
  cameraView?: CameraView;
  studio?: StudioEnvironment;
  graphicsQuality?: GraphicsQuality;
  turntable?: boolean;
  activeSlot?: Slot;
  onInteract?: () => void;
};
export default function Bike3D(props: Props) {
  const { onInteract } = props;
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)"),
    small = useMediaQuery("(max-width: 768px)");
  const [displayed, setDisplayed] = useState(props.configuration),
    [loading, setLoading] = useState(true),
    [ready, setReady] = useState(false),
    [attempt, setAttempt] = useState(0),
    [moving, setMoving] = useState(false),
    [degraded, setDegraded] = useState(false);
  const requested = props.graphicsQuality || "auto",
    studio = props.studio || "light";
  const device = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const quality: QualityTier =
    requested === "auto"
      ? degraded
        ? "performance"
        : autoQuality(
            small ? 768 : 1440,
            device.hardwareConcurrency,
            device.deviceMemory,
            device.connection?.saveData,
          )
      : requested;
  const frame = variantById(
      props.catalog,
      props.configuration.frameset,
    )?.variant,
    asset = frame?.asset3D?.url;
  const frameReady = useCallback(() => {
    setDisplayed(props.configuration);
    setLoading(false);
  }, [props.configuration]);
  const sceneReady = useCallback(() => setReady(true), []),
    interact = useCallback(() => onInteract?.(), [onInteract]);
  useEffect(() => {
    if (!asset) frameReady();
  }, [asset, frameReady]);
  const pending = displayed !== props.configuration || loading || !ready;
  const fallback = (
    <div className="studio-fallback">
      <Bike2D configuration={props.configuration} catalog={props.catalog} />
      <div className="studio-fallback-message">
        <strong>3D preview unavailable</strong>
        <p>Your selected build remains available in 2D.</p>
        <button
          className="button"
          onClick={() => {
            if (asset) useGLTF.clear(asset);
            setLoading(true);
            setReady(false);
            setAttempt((value) => value + 1);
          }}
        >
          Retry 3D model
        </button>
      </div>
    </div>
  );
  return (
    <SceneBoundary key={attempt} fallback={fallback}>
      {asset && (
        <Suspense fallback={null}>
          <AssetWarmup key={asset} url={asset} onReady={frameReady} />
        </Suspense>
      )}
      <div
        className="bike3d-wrapper"
        data-frame-variant={displayed.frameset}
        data-studio={studio}
        data-quality={quality}
        data-camera-moving={moving}
        data-turntable={!!props.turntable && !reducedMotion}
        data-loading={pending}
      >
        {!ready && (
          <div className="studio-loading-plan">
            <Bike2D
              configuration={props.configuration}
              catalog={props.catalog}
            />
          </div>
        )}
        {pending && (
          <div className="model-loading" role="status">
            Loading selected frameset…
            {ready ? " Previous preview remains visible." : ""}
          </div>
        )}
        <Canvas
          camera={{ position: [1.5, 0.8, 3], fov: 36, near: 0.025, far: 50 }}
          dpr={[
            1,
            quality === "performance" ? 1 : quality === "balanced" ? 1.5 : 2,
          ]}
          frameloop="demand"
          gl={{
            antialias: true,
            powerPreference: "default",
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          fallback={fallback}
        >
          <Suspense fallback={null}>
            <ProceduralAssembly
              configuration={displayed}
              catalog={props.catalog}
              onSelect={props.onSelect}
              resetKey={props.resetKey}
              cameraView={props.cameraView}
              studio={studio}
              quality={quality}
              reducedMotion={reducedMotion}
              turntable={!!props.turntable && !reducedMotion}
              activeSlot={props.activeSlot}
              onInteract={interact}
              onMoving={setMoving}
            />
            <ModelReady onReady={sceneReady} />
            {requested === "auto" && quality !== "performance" && (
              <AdaptiveBudget
                active={moving || !!props.turntable}
                onSlow={() => setDegraded(true)}
              />
            )}
          </Suspense>
        </Canvas>
        <span className="studio-quality-status">
          {requested === "auto" ? `Auto / ${quality}` : quality}
          {reducedMotion ? " / reduced motion" : ""}
        </span>
      </div>
    </SceneBoundary>
  );
}
function AssetWarmup({ url, onReady }: { url: string; onReady: () => void }) {
  useGLTF(url);
  useEffect(onReady, [onReady]);
  return null;
}
function ModelReady({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}
function AdaptiveBudget({
  active,
  onSlow,
}: {
  active: boolean;
  onSlow: () => void;
}) {
  const samples = useRef<number[]>([]);
  useFrame((_, delta) => {
    if (!active) {
      samples.current = [];
      return;
    }
    if (delta <= 0 || delta > 0.15) return;
    samples.current.push(delta);
    if (samples.current.length === 45) {
      const mean = samples.current.slice(5).reduce((a, b) => a + b, 0) / 40;
      if (mean > 1 / 28) onSlow();
      samples.current = [];
    }
  });
  return null;
}
