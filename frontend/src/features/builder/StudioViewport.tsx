import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Bike3DProps } from "./Bike3D";
const Bike3D = lazy(() => import("./Bike3D"));
export function StudioViewport({
  mode,
  available,
  expiresAt,
  scene,
  plan,
}: {
  mode: "2d" | "3d";
  available: boolean;
  expiresAt: number;
  scene: Omit<Bike3DProps, "active" | "onReady">;
  plan: ReactNode;
}) {
  const studioLayer = useRef<HTMLDivElement>(null),
    studioSize = useRef<{ width: number; height: number } | undefined>(
      undefined,
    ),
    currentMode = useRef(mode);
  currentMode.current = mode;
  const [opened, setOpened] = useState(false),
    [prepared, setPrepared] = useState(false),
    [showPlan, setShowPlan] = useState(true),
    [expired, setExpired] = useState(false),
    [visible, setVisible] = useState(() => !document.hidden);
  const allowed = available && !expired && expiresAt > Date.now();
  useLayoutEffect(() => {
    const layer = studioLayer.current;
    if (!layer) return;
    const observer = new ResizeObserver((entries) => {
      if (currentMode.current === "3d") {
        const rect = entries[0].contentRect;
        if (rect.width && rect.height)
          studioSize.current = { width: rect.width, height: rect.height };
      }
    });
    observer.observe(layer);
    return () => observer.disconnect();
  }, [opened, allowed]);
  useEffect(() => {
    setExpired(expiresAt <= Date.now());
    if (!available) return;
    const timer = setTimeout(
      () => setExpired(true),
      Math.max(0, expiresAt - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [available, expiresAt]);
  useEffect(() => {
    if (allowed && mode === "3d") setOpened(true);
    if (!allowed) {
      setOpened(false);
      setPrepared(false);
    }
  }, [mode, allowed]);
  useEffect(() => {
    const change = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  useEffect(() => {
    if (mode === "2d" || !prepared) {
      setShowPlan(true);
      return;
    }
    const timer = setTimeout(() => setShowPlan(false), 240);
    return () => clearTimeout(timer);
  }, [mode, prepared]);
  const ready = useCallback(() => setPrepared(true), []);
  return (
    <div
      className="renderer-stack"
      data-renderer-mode={mode}
      data-studio-prepared={prepared}
    >
      {(showPlan || mode === "2d") && (
        <div
          className="renderer-plan"
          data-visible={mode === "2d" || !prepared}
          aria-hidden={mode !== "2d"}
          inert={mode !== "2d"}
        >
          {plan}
        </div>
      )}
      {opened && allowed && (
        <div
          className="renderer-studio"
          ref={studioLayer}
          style={
            mode === "2d" && studioSize.current ? studioSize.current : undefined
          }
          data-visible={mode === "3d" && prepared}
          aria-hidden={mode !== "3d" || !prepared}
          inert={mode !== "3d" || !prepared}
        >
          <Suspense fallback={null}>
            <Bike3D
              {...scene}
              active={mode === "3d" && visible}
              onReady={ready}
            />
          </Suspense>
        </div>
      )}
      {mode === "3d" && !prepared && (
        <div className="model-loading" role="status">
          Preparing the 3D studio…
        </div>
      )}
    </div>
  );
}
