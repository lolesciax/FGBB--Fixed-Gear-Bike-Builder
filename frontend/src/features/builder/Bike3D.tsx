import {
  Component,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  variantById,
  selectedColorway,
  renderMorphologyId,
  type Configuration,
  type Product,
  type Slot,
} from "@tracklab/domain";
import { ProceduralAssembly } from "./ProceduralAssembly";
import { Bike2D } from "./Bike2D";
import {
  autoQuality,
  frameRequestUrl,
  type CameraView,
  type StudioEnvironment,
  type GraphicsQuality,
  type QualityTier,
} from "./studio-settings";
import { useMediaQuery } from "../../components/useMediaQuery";
import { TransitionCoordinator, transitionPlan } from "./transitions";
import { captureAssembly } from "./morph-pose";
import type { PresentationBridge } from "./AssemblyPresentation";
import type { InspectionTarget, CameraCommand } from "./inspection";
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError?.();
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
  active?: boolean;
  onReady?: () => void;
  inspection?: InspectionTarget;
  navigation?: CameraCommand;
};
export type Bike3DProps = Props;
export default function Bike3D(props: Props) {
  const { onReady } = props;
  const [job, setJob] = useState<{
    asset: string;
    id: number;
    target: Configuration;
  } | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)"),
    small = useMediaQuery("(max-width: 768px)"),
    active = props.active !== false;
  const [displayed, setDisplayed] = useState<Configuration | null>(null),
    [ready, setReady] = useState(false),
    [attempt, setAttempt] = useState(0),
    [moving, setMoving] = useState(false),
    [degraded, setDegraded] = useState(false),
    [finishFailure, setFinishFailure] = useState(false);
  const [coordinator] = useState(() => new TransitionCoordinator()),
    state = useSyncExternalStore(
      coordinator.subscribe,
      coordinator.getSnapshot,
    ),
    bridge = useRef<PresentationBridge>({ root: null, source: null }),
    displayRef = useRef(displayed);
  displayRef.current = displayed;
  const requested = props.graphicsQuality || "auto",
    studio = props.studio || "light",
    device = navigator as Navigator & {
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
    asset = frame?.asset3D ? frameRequestUrl(frame.asset3D) : undefined;
  const latest = useRef({
    configuration: props.configuration,
    catalog: props.catalog,
    quality,
    reducedMotion,
  });
  latest.current = {
    configuration: props.configuration,
    catalog: props.catalog,
    quality,
    reducedMotion,
  };
  useEffect(() => {
    if (!active) return;
    const current = latest.current,
      id = coordinator.begin(
        transitionPlan(
          displayRef.current,
          current.configuration,
          current.catalog,
          current.reducedMotion || current.quality === "performance",
        ),
      );
    const prior =
      displayRef.current &&
      variantById(current.catalog, displayRef.current.frameset)?.variant;
    const priorAsset = prior?.asset3D
      ? frameRequestUrl(prior.asset3D)
      : undefined;
    if (asset && asset !== priorAsset) {
      coordinator.loading(id);
      setJob({ asset, id, target: current.configuration });
    } else {
      setJob(null);
      coordinator.ready(id, () => setDisplayed(current.configuration));
    }
  }, [props.configuration, asset, attempt, active, coordinator]);
  const frameReady = useCallback(
    (id: number, target: Configuration) => {
      if (latest.current.configuration !== target) return;
      coordinator.ready(id, () => {
        const plan = coordinator.getSnapshot().plan;
        bridge.current.source =
          plan.strategy === "morph" && plan.family && bridge.current.root
            ? captureAssembly(bridge.current.root, plan.family)
            : null;
        setDisplayed(target);
      });
    },
    [coordinator],
  );
  const sceneReady = useCallback(() => {
    setReady(true);
  }, []);
  useEffect(() => {
    if ((ready || state.phase === "failed") && active && !coordinator.busy)
      onReady?.();
  }, [ready, active, state.phase, coordinator, onReady]);
  useEffect(() => () => coordinator.dispose(), [coordinator]);
  const retry = () => {
    if (asset) useGLTF.clear(asset);
    setAttempt((a) => a + 1);
  };
  const show = displayed || props.configuration,
    record = variantById(props.catalog, show.frameset),
    pending = !ready || coordinator.busy,
    assetPending =
      state.phase === "loading-assets" || state.phase === "preparing",
    failed = state.phase === "failed";
  const fallback = active ? (
    <div className="studio-fallback">
      <Bike2D configuration={props.configuration} catalog={props.catalog} />
      <div className="studio-fallback-message">
        <strong>3D preview unavailable</strong>
        <p>Your selected build remains available in 2D.</p>
        <button className="button" onClick={retry}>
          Retry 3D model
        </button>
      </div>
    </div>
  ) : (
    <div />
  );
  return (
    <SceneBoundary
      key={attempt}
      fallback={fallback}
      onError={() => coordinator.fail(state.id)}
    >
      {active && job && (
        <SceneBoundary
          key={job.asset + "/" + job.id}
          onError={() => {
            if (latest.current.configuration === job.target)
              coordinator.fail(job.id);
          }}
          fallback={null}
        >
          <Suspense fallback={null}>
            <AssetWarmup
              url={job.asset}
              id={job.id}
              target={job.target}
              onReady={frameReady}
            />
          </Suspense>
        </SceneBoundary>
      )}
      <div
        className="bike3d-wrapper"
        data-component-finishes={JSON.stringify(show.appearance || {})}
        data-colorway-id={
          (record && selectedColorway(record.product, record.variant)?.id) ||
          "legacy"
        }
        data-frame-variant={show.frameset}
        data-requested-frame={props.configuration.frameset}
        data-cockpit-variant={show.cockpit}
        data-cockpit-shape={
          variantById(props.catalog, show.cockpit)?.variant.specs.shape ||
          "unknown"
        }
        data-geometry-revision="components-v4"
        data-frame-morphology={
          (record && renderMorphologyId(record.product, record.variant)) ||
          "illustrative-round"
        }
        data-studio={studio}
        data-quality={quality}
        data-camera-moving={moving}
        data-turntable={
          !!props.turntable && !reducedMotion && active && !coordinator.busy
        }
        data-loading={pending && !failed}
        data-transition-phase={state.phase}
        data-transition-strategy={state.plan.strategy}
        data-transition-id={state.id}
        aria-busy={pending && !failed}
      >
        {failed && !displayed && fallback}
        {!ready && !failed && active && (
          <div className="studio-loading-plan">
            <Bike2D
              configuration={props.configuration}
              catalog={props.catalog}
            />
          </div>
        )}
        {(coordinator.busy || (failed && !!displayed)) && (
          <div className="model-loading transition-feedback" role="status">
            <span>{state.message}</span>
            {failed ? (
              <button className="text-button" onClick={retry}>
                Retry 3D model
              </button>
            ) : (
              !assetPending && (
                <button
                  className="text-button"
                  onClick={() => coordinator.finish()}
                >
                  Skip animation
                </button>
              )
            )}
          </div>
        )}
        {finishFailure && (
          <div className="model-loading" role="status">
            A finish graphic could not load. Paint remains visible; graphic
            accuracy is unavailable.
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
          fallback={<span>WebGL is unavailable.</span>}
        >
          <Suspense fallback={null}>
            {displayed && (
              <>
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
                  onInteract={() => props.onInteract?.()}
                  onMoving={setMoving}
                  onFinishFailure={setFinishFailure}
                  coordinator={coordinator}
                  bridge={bridge.current}
                  active={active}
                  inspection={props.inspection}
                  navigation={props.navigation}
                />
                <ModelReady onReady={sceneReady} />
              </>
            )}
            <ActivityVisibility active={active} />
            {requested === "auto" && quality !== "performance" && (
              <AdaptiveBudget
                active={
                  active && (moving || !!props.turntable || coordinator.busy)
                }
                onSlow={() => setDegraded(true)}
              />
            )}
          </Suspense>
        </Canvas>
        <span className="studio-quality-status">
          {requested === "auto" ? "Auto / " + quality : quality}
          {reducedMotion ? " / reduced motion" : ""}
        </span>
        <span className="sr-only" role="status">
          {["completed", "cancelled"].includes(state.phase)
            ? state.message
            : ""}
        </span>
      </div>
    </SceneBoundary>
  );
}
function AssetWarmup({
  url,
  id,
  target,
  onReady,
}: {
  url: string;
  id: number;
  target: Configuration;
  onReady: (id: number, target: Configuration) => void;
}) {
  useGLTF(url);
  useEffect(() => onReady(id, target), [id, target, onReady]);
  return null;
}
function ModelReady({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}
function ActivityVisibility({ active }: { active: boolean }) {
  const { setFrameloop, invalidate } = useThree();
  useEffect(() => {
    setFrameloop(active ? "demand" : "never");
    if (active) invalidate();
  }, [active, setFrameloop, invalidate]);
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
