import { cameraPresets } from "../features/builder/studio-settings";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Bike,
  Circle,
  CircleDot,
  Cog,
  Frame,
  Hand,
  Info,
  List,
  Maximize,
  Expand,
  Minus,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  Undo2,
} from "lucide-react";
import {
  compatibility,
  slots,
  stateLabel,
  technicalDisclaimer,
  variantById,
  withHistoricalCatalog,
  type Configuration,
  type Slot,
} from "@tracklab/domain";
import { api, loadCatalog, type SavedBuild } from "../services/api";
import { errorMessage, useApp } from "../app/context";
import { useBuilder } from "../features/builder/store";
import { Bike2D } from "../features/builder/Bike2D";
import { PartsInspector } from "../features/builder/PartsInspector";
import { PartsSheet } from "../features/builder/PartsSheet";
import { FrameChangeReview } from "../features/builder/FrameChangeReview";
import { useMediaQuery } from "../components/useMediaQuery";
const Bike3D = lazy(() => import("../features/builder/Bike3D"));
const categories = {
  frameset: {
    label: "Frameset",
    icon: Frame,
    description:
      "The foundation of your ride. Choose a silhouette and make it your own.",
  },
  wheels: {
    label: "Wheels",
    icon: CircleDot,
    description: "Set the rhythm. Explore classic spokes and deeper profiles.",
  },
  tires: {
    label: "Tires",
    icon: Circle,
    description:
      "Your connection to the road. Check frame clearance before selecting.",
  },
  cockpit: {
    label: "Cockpit",
    icon: Bike,
    description: "A different perspective. Find the bar shape for your build.",
  },
  drivetrain: {
    label: "Drivetrain",
    icon: Cog,
    description:
      "One gear. All yours. Explore chainring and sprocket combinations.",
  },
  saddle: {
    label: "Seating",
    icon: SlidersHorizontal,
    description:
      "The finishing touch. Choose your saddle and seatpost assembly.",
  },
};
export function BuilderPage() {
  const { session, refresh, auth, notify } = useApp(),
    { id } = useParams(),
    navigate = useNavigate(),
    client = useQueryClient();
  const catalog = useQuery({ queryKey: ["catalog"], queryFn: loadCatalog });
  const [frameReview, setFrameReview] = useState<Configuration | null>(null);
  const userId = session.user?.id;
  const workspaceKey = session.workspaceKey;
  const compact = useMediaQuery("(max-width: 1100px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    const stop = () => {
      if (document.hidden) useBuilder.getState().set({ turntable: false });
    };
    if (reducedMotion) useBuilder.getState().set({ turntable: false });
    document.addEventListener("visibilitychange", stop);
    return () => document.removeEventListener("visibilitychange", stop);
  }, [reducedMotion]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const previewRef = useRef<HTMLElement>(null);
  const b = useBuilder(),
    [loadError, setLoadError] = useState(""),
    [actionError, setActionError] = useState(""),
    [resetKey, setResetKey] = useState(0),
    [info, setInfo] = useState(false),
    [panning, setPanning] = useState(false),
    [pan, setPan] = useState({ x: 0, y: 0 });
  const [reconnect, setReconnect] = useState(0),
    [saving, setSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [showIntro, setShowIntro] = useState(
    () => sessionStorage.getItem("tracklab-frame-intro") !== "dismissed",
  );
  const infoRef = useRef<HTMLDialogElement>(null),
    drag = useRef<{
      x: number;
      y: number;
      startX: number;
      startY: number;
    } | null>(null);
  const selectionLocked =
    !session.developmentUnlimited &&
    !session.user &&
    session.usage.changes >= session.limits.changes;
  useEffect(() => {
    if (b.mode !== "3d" || !b.previewGrant) return;
    const stop = () => {
      useBuilder
        .getState()
        .set({ mode: "2d", previewExpiresAt: 0, previewGrant: "" });
      setActionError(
        "Your 3D session ended. Start another available session to continue.",
      );
    };
    const end = () => {
      if (!session.developmentUnlimited) {
        stop();
        return;
      }
      const current = useBuilder.getState();
      void api<{ grant: string; expiresAt: string }>("/workspace/preview", {
        method: "POST",
        body: { token: current.token },
      })
        .then((next) => {
          if (useBuilder.getState().ownerKey === current.ownerKey)
            current.set({
              previewGrant: next.grant,
              previewExpiresAt: Date.parse(next.expiresAt),
            });
        })
        .catch(stop);
    };
    const expiry = setTimeout(
      end,
      Math.max(0, b.previewExpiresAt - Date.now()),
    );
    const validation = setInterval(() => {
      void api("/workspace/preview/validate", {
        method: "POST",
        body: { grant: b.previewGrant },
      }).catch(end);
    }, 30000);
    return () => {
      clearTimeout(expiry);
      clearInterval(validation);
    };
  }, [
    b.mode,
    b.previewGrant,
    b.previewExpiresAt,
    session.developmentUnlimited,
  ]);
  const hasEditorLease = Boolean(b.editorToken);
  useEffect(() => {
    if (!compact) setSheetOpen(false);
  }, [compact]);
  useEffect(() => {
    if (!catalog.data) return;
    const memory = useBuilder.getState();
    if (
      !id &&
      !memory.saved &&
      memory.configuration &&
      memory.token &&
      memory.ownerKey === workspaceKey
    )
      return;
    let cancelled = false;
    setLoadError("");
    useBuilder.getState().set({ pending: true });
    async function open() {
      try {
        let saved: SavedBuild | undefined,
          editorToken = "";
        if (id) {
          saved = await api<SavedBuild>(`/builds/${id}`);
          const lease = await api<{ editorToken: string }>(
            `/builds/${id}/lease`,
            { method: "POST" },
          );
          editorToken = lease.editorToken;
        }
        const current = useBuilder.getState();
        const workspace = await api<{
          configuration: Configuration;
          token: string;
        }>("/workspace", {
          method: "POST",
          body: {
            configuration:
              saved?.configuration ||
              (userId && !current.saved
                ? current.configuration || undefined
                : undefined),
          },
        });
        if (!cancelled) {
          const carryDraft =
            !!userId && !saved && !current.saved && !!current.configuration;
          current.init(
            workspace.configuration,
            workspace.token,
            workspaceKey,
            saved,
            editorToken,
          );
          if (carryDraft)
            current.set({
              name: current.name,
              dirty: current.dirty,
              past: current.past,
              future: current.future,
            });
        }
      } catch (error) {
        if (!cancelled) setLoadError(errorMessage(error));
      } finally {
        if (!cancelled) useBuilder.getState().set({ pending: false });
      }
    }
    void open();
    return () => {
      cancelled = true;
    };
  }, [id, userId, workspaceKey, catalog.data, reconnect]);
  useEffect(() => {
    if (!b.saved?._id || !hasEditorLease) return;
    const buildId = b.saved._id;
    let leaseToken = useBuilder.getState().editorToken;
    const timer = setInterval(() => {
      void api<{ editorToken: string }>(`/builds/${buildId}/lease`, {
        method: "POST",
        editorToken: leaseToken,
      })
        .then((r) => {
          leaseToken = r.editorToken;
          if (useBuilder.getState().saved?._id === buildId)
            useBuilder.getState().set({ editorToken: r.editorToken });
        })
        .catch((e) => setActionError(errorMessage(e)));
    }, 4 * 60000);
    return () => {
      clearInterval(timer);
      void api(`/builds/${buildId}/lease`, {
        method: "DELETE",
        editorToken: leaseToken,
      }).catch(() => undefined);
    };
  }, [b.saved?._id, hasEditorLease]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (useBuilder.getState().dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);
  useEffect(() => {
    if (info) infoRef.current?.showModal();
  }, [info]);
  useEffect(() => {
    if (!selectionLocked || !session.usage.changesResetAt) return;
    const timer = setTimeout(
      () => {
        void refresh().catch((error) => setActionError(errorMessage(error)));
      },
      Math.max(
        1000,
        Date.parse(session.usage.changesResetAt) - Date.now() + 100,
      ),
    );
    return () => clearTimeout(timer);
  }, [selectionLocked, session.usage.changesResetAt, refresh]);
  const data = withHistoricalCatalog(
    catalog.data?.items || [],
    b.saved?.catalogSnapshot,
  );
  const result = b.configuration ? compatibility(b.configuration, data) : null;
  async function change(
    slot: Slot,
    variantId: string,
    direction?: "undo" | "redo",
    replacements?: Partial<Configuration>,
  ) {
    const current = useBuilder.getState();
    if (
      !current.configuration ||
      current.pending ||
      (current.configuration[slot] === variantId && !replacements)
    )
      return;
    if (selectionLocked) return;
    if (slot === "frameset" && !direction && !replacements) {
      const proposed = { ...current.configuration, frameset: variantId };
      if (compatibility(proposed, data).state === "incompatible") {
        setFrameReview(proposed);
        return;
      }
    }
    current.set({ pending: true });
    setActionError("");
    try {
      const next = await api<{ configuration: Configuration; token: string }>(
        "/workspace/change",
        {
          method: "POST",
          body: {
            token: current.token,
            slot,
            variantId,
            ...(replacements ? { replacements } : {}),
          },
        },
      );
      current.accept(
        next.configuration,
        next.token,
        {
          slot,
          before: current.configuration[slot],
          after: variantId,
          beforeConfiguration: current.configuration,
          afterConfiguration: next.configuration,
        },
        direction,
      );
      setFrameReview(null);
      await refresh();
    } catch (error) {
      setActionError(errorMessage(error));
      await refresh();
    } finally {
      current.set({ pending: false });
    }
  }
  async function setMode(mode: "2d" | "3d") {
    if (mode === "2d") {
      b.set({ mode, turntable: false });
      return;
    }
    if (b.pending) return;
    const testCanvas = document.createElement("canvas");
    const gl =
      testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
    if (!gl) {
      setActionError(
        "WebGL is not available on this device. Your 2D workspace remains available.",
      );
      return;
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    b.set({ pending: true });
    setActionError("");
    try {
      if (b.previewGrant && b.previewExpiresAt > Date.now()) {
        const valid = await api<{ expiresAt: string }>(
          "/workspace/preview/validate",
          { method: "POST", body: { grant: b.previewGrant } },
        );
        b.set({ mode: "3d", previewExpiresAt: Date.parse(valid.expiresAt) });
        return;
      }
      const r = await api<{ expiresAt: string; grant: string }>(
        "/workspace/preview",
        {
          method: "POST",
          body: { token: b.token },
        },
      );
      b.set({
        mode: "3d",
        previewGrant: r.grant,
        previewExpiresAt: new Date(r.expiresAt).getTime(),
      });
      await refresh();
    } catch (error) {
      b.set({ mode: "2d", previewExpiresAt: 0, previewGrant: "" });
      setActionError(errorMessage(error));
    } finally {
      b.set({ pending: false });
    }
  }
  async function save() {
    if (!session.user) {
      auth("register");
      return;
    }
    if (!b.configuration || saving) return;
    setSaveFailed(false);
    setSaving(true);
    setActionError("");
    try {
      const saved = await api<SavedBuild>(
        b.saved ? `/builds/${b.saved._id}` : "/builds",
        {
          method: b.saved ? "PATCH" : "POST",
          editorToken: b.editorToken,
          body: {
            name: b.name,
            configuration: b.configuration,
            ...(b.saved
              ? { revision: b.saved.revision, visibility: b.saved.visibility }
              : {}),
          },
        },
      );
      b.set({ saved, dirty: false });
      await refresh();
      await client.invalidateQueries({ queryKey: ["builds"] });
      notify("Build saved to your garage.");
      if (!id) navigate(`/builder/${saved._id}`, { replace: true });
    } catch (error) {
      setAutoSave(false);
      setSaveFailed(true);
      setActionError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }
  // Debounce current editor state. New unsaved drafts always require an explicit Save.
  useEffect(() => {
    if (
      !autoSave ||
      !session.user ||
      !b.saved ||
      !b.dirty ||
      b.pending ||
      saving ||
      !b.editorToken
    )
      return;
    const timer = setTimeout(() => {
      void save().catch(() => setAutoSave(false));
    }, 2500);
    return () => clearTimeout(timer);
  });
  const quotaNotice = selectionLocked ? (
    <div className="notice quota-notice" role="status">
      <strong>Daily customization limit reached.</strong>
      <p>
        Your current bicycle stays here. You can keep browsing specifications
        and moving the view.
        {session.usage.changesResetAt
          ? ` Changes reset ${new Date(session.usage.changesResetAt).toLocaleString()}.`
          : ""}
      </p>
      <button className="text-button" onClick={() => auth("register")}>
        Create an account to keep building
      </button>
    </div>
  ) : null;
  const inspectorContents = (
    <PartsInspector
      key={b.slot}
      products={data}
      configuration={b.configuration}
      slot={b.slot}
      pending={b.pending}
      locked={selectionLocked}
      loading={catalog.isPending}
      onSelect={(slot, variant) => void change(slot, variant)}
      notice={
        <>
          {quotaNotice}
          {showIntro && b.slot === "frameset" && !selectionLocked && (
            <div className="frame-intro">
              <p>
                Choose a real brand, model and size below. Dimension-based
                previews remain illustrative.
              </p>
              <button
                className="text-button"
                aria-label="Dismiss frameset introduction"
                onClick={() => {
                  setShowIntro(false);
                  sessionStorage.setItem("tracklab-frame-intro", "dismissed");
                }}
              >
                Got it
              </button>
            </div>
          )}
        </>
      }
      onCategory={compact ? (slot) => b.set({ slot }) : undefined}
    />
  );
  return (
    <main className="builder-page compact-workshop">
      <div className="workspace-heading">
        <div>
          <h1>Bike Builder</h1>
          <p className="current-frame">
            {b.configuration
              ? `${variantById(data, b.configuration.frameset)?.product.brand} / ${variantById(data, b.configuration.frameset)?.product.name} / ${variantById(data, b.configuration.frameset)?.variant.label}`
              : "Preparing your frame..."}
          </p>
        </div>

        <details className="quota-menu">
          <summary>
            {session.developmentUnlimited ? (
              "Development access"
            ) : session.user ? (
              "Your workshop"
            ) : (
              <>
                <span>Guest Mode / </span>
                {Math.max(
                  0,
                  session.limits.changes - session.usage.changes,
                )}{" "}
                changes remaining
              </>
            )}
          </summary>
          <div className="quota-popover">
            {session.developmentUnlimited ? (
              <p>
                Development usage quotas are disabled. Guest builds stay in
                memory; sign in to save permanently.
              </p>
            ) : session.user ? (
              <>
                <p>
                  Up to {session.policy.builds} saved builds. Creation and
                  update limits apply.
                </p>
                <button
                  className="text-button"
                  onClick={() => navigate("/garage")}
                >
                  Open my garage
                </button>
              </>
            ) : (
              <>
                <p>
                  Temporary build - refresh or closing may discard it.{" "}
                  {session.policy.guestPreviews} 3D sessions per rolling day, up
                  to {session.policy.guestPreviewMinutes} minutes each.
                </p>
                <p>
                  {session.usage.changesResetAt
                    ? "Changes reset " +
                      new Date(session.usage.changesResetAt).toLocaleString()
                    : "The rolling reset starts with your first change."}
                </p>
                <button
                  className="text-button"
                  onClick={() => auth("register")}
                >
                  Create an account
                </button>
              </>
            )}
          </div>
        </details>
        <div className="workspace-actions">
          {session.user && b.saved && (
            <label className="autosave-control">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
              />
              Autosave
            </label>
          )}
          <label className="build-name">
            <span className="build-name-label">Build name</span>
            <input
              aria-label="Build name"
              maxLength={80}
              value={b.name}
              onChange={(e) => b.set({ name: e.target.value, dirty: true })}
            />
            <span
              className="unsaved-dot"
              title={b.dirty ? "Unsaved changes" : "No unsaved changes"}
              data-dirty={b.dirty}
            />
          </label>
          <button
            className="button primary"
            onClick={() => void save()}
            disabled={saving || b.pending || !b.configuration || !b.name.trim()}
          >
            <Save size={17} />
            {saving
              ? "Saving…"
              : session.user
                ? saveFailed
                  ? "Retry save"
                  : "Save build"
                : "Create account to save"}
          </button>
        </div>
      </div>
      {loadError || catalog.isError ? (
        <div className="error-box" role="alert">
          {loadError || errorMessage(catalog.error)}{" "}
          <button
            className="text-button"
            onClick={() => {
              setReconnect((v) => v + 1);
              void catalog.refetch();
            }}
          >
            Try again
          </button>
        </div>
      ) : null}
      <div className="workbench">
        <aside className="category-rail" aria-label="Component categories">
          {slots.map((slot) => {
            const I = categories[slot].icon;
            return (
              <button
                key={slot}
                className={b.slot === slot ? "active" : ""}
                onClick={() => {
                  b.set({ slot, turntable: false });
                  if (compact) setSheetOpen(true);
                }}
                aria-pressed={b.slot === slot}
              >
                <I size={23} strokeWidth={1.6} />
                <span>{categories[slot].label}</span>
              </button>
            );
          })}
          <button className="help-button" onClick={() => setInfo(true)}>
            <Info size={20} />
            <span>Builder guide</span>
          </button>
        </aside>
        <section
          ref={previewRef}
          data-studio={b.mode === "3d" ? b.studio : undefined}
          className="viewer"
          aria-label="Bicycle preview"
        >
          <div className="viewer-top">
            <div className="segmented" aria-label="Viewer mode">
              <button
                onClick={() => void setMode("2d")}
                className={b.mode === "2d" ? "selected" : ""}
                aria-pressed={b.mode === "2d"}
              >
                2D
              </button>
              <button
                onClick={() => void setMode("3d")}
                className={b.mode === "3d" ? "selected" : ""}
                disabled={b.pending}
                aria-pressed={b.mode === "3d"}
              >
                3D
              </button>
            </div>
            <span className="viewer-label">
              {b.configuration &&
              variantById(data, b.configuration.frameset)?.product.visual
                ? "Measurement-based illustration / authentic assets unavailable"
                : "Illustrative assembly"}
            </span>
            <button
              className="icon-button bordered"
              aria-label="Full-screen preview"
              onClick={() => {
                const node = previewRef.current;
                if (document.fullscreenElement) void document.exitFullscreen();
                else void node?.requestFullscreen?.();
              }}
            >
              <Expand size={17} />
            </button>
            <button
              className="icon-button bordered"
              aria-label="Fit bicycle to view"
              onClick={() => {
                b.set({ zoom: 1 });
                setPan({ x: 0, y: 0 });
                setResetKey((k) => k + 1);
              }}
            >
              <Maximize size={17} />
            </button>
          </div>
          <div
            className={`canvas-area ${panning ? "panning" : ""}`}
            onPointerDown={(e) => {
              if (!panning || b.mode !== "2d") return;
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = {
                x: e.clientX,
                y: e.clientY,
                startX: pan.x,
                startY: pan.y,
              };
            }}
            onPointerMove={(e) => {
              if (drag.current)
                setPan({
                  x: Math.max(
                    -200,
                    Math.min(
                      200,
                      drag.current.startX + e.clientX - drag.current.x,
                    ),
                  ),
                  y: Math.max(
                    -120,
                    Math.min(
                      120,
                      drag.current.startY + e.clientY - drag.current.y,
                    ),
                  ),
                });
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            {b.configuration && !loadError ? (
              b.mode === "2d" ? (
                <div
                  className="pan-layer"
                  style={{ transform: `translate(${pan.x}px,${pan.y}px)` }}
                >
                  <Bike2D
                    configuration={b.configuration}
                    catalog={data}
                    zoom={b.zoom}
                    active={b.slot}
                    onSelect={
                      panning
                        ? undefined
                        : (slot) => {
                            b.set({ slot });
                            if (compact) setSheetOpen(true);
                          }
                    }
                  />
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="studio-loading-plan">
                      <Bike2D configuration={b.configuration} catalog={data} />
                      <span className="model-loading" role="status">
                        Loading the studio…
                      </span>
                    </div>
                  }
                >
                  <Bike3D
                    configuration={b.configuration}
                    catalog={data}
                    onSelect={(slot) => {
                      b.set({ slot, turntable: false });
                      if (compact) setSheetOpen(true);
                    }}
                    studio={b.studio}
                    graphicsQuality={b.graphicsQuality}
                    turntable={b.turntable}
                    activeSlot={b.slot}
                    onInteract={() => b.set({ turntable: false })}
                    cameraView={b.cameraView}
                    resetKey={resetKey}
                  />
                </Suspense>
              )
            ) : (
              <div className="viewer-fallback">
                <div className="loader" />
                Preparing your bicycle…
              </div>
            )}
          </div>
          <div
            className={`viewer-controls ${b.mode === "3d" ? "studio-controls" : ""}`}
          >
            {b.mode === "3d" && (
              <label className="camera-preset">
                <span>Camera</span>
                <select
                  aria-label="Camera view"
                  value={b.cameraView}
                  onChange={(e) =>
                    b.set({
                      cameraView: e.target.value as typeof b.cameraView,
                      turntable: false,
                    })
                  }
                >
                  {cameraPresets.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {b.mode === "3d" && (
              <>
                <label className="studio-setting">
                  <span>Environment</span>
                  <select
                    aria-label="Studio environment"
                    value={b.studio}
                    onChange={(event) =>
                      b.set({ studio: event.target.value as typeof b.studio })
                    }
                  >
                    <option value="light">Studio Light</option>
                    <option value="dark">Studio Dark</option>
                  </select>
                </label>
                <label className="studio-setting">
                  <span>Graphics</span>
                  <select
                    aria-label="Graphics quality"
                    value={b.graphicsQuality}
                    onChange={(event) =>
                      b.set({
                        graphicsQuality: event.target
                          .value as typeof b.graphicsQuality,
                      })
                    }
                  >
                    <option value="auto">Auto</option>
                    <option value="performance">Performance</option>
                    <option value="balanced">Balanced</option>
                    <option value="quality">Quality</option>
                  </select>
                </label>
                <button
                  className="button turntable-control"
                  aria-label="Toggle turntable"
                  aria-pressed={b.turntable}
                  disabled={reducedMotion}
                  title={
                    reducedMotion
                      ? "Turntable is disabled by your reduced-motion preference"
                      : "Turntable pauses when you interact"
                  }
                  onClick={() => b.set({ turntable: !b.turntable })}
                >
                  {b.turntable ? "Pause turntable" : "Turntable"}
                </button>
              </>
            )}
            <div className="history-controls">
              <button
                className="icon-button"
                aria-label="Undo last selection"
                title="Undo (uses a component change for guests)"
                disabled={!b.past.length || b.pending || selectionLocked}
                onClick={() => {
                  const h = b.past.at(-1)!;
                  void change(h.slot, h.before, "undo", h.beforeConfiguration);
                }}
              >
                <Undo2 size={16} />
              </button>
              <button
                className="icon-button"
                aria-label="Redo selection"
                disabled={!b.future.length || b.pending || selectionLocked}
                onClick={() => {
                  const h = b.future.at(-1)!;
                  void change(h.slot, h.after, "redo", h.afterConfiguration);
                }}
              >
                <Redo2 size={16} />
              </button>
            </div>
            <span className="control-divider" />
            <button
              className="reset-button"
              onClick={() => {
                b.set({ zoom: 1, turntable: false });
                setPan({ x: 0, y: 0 });
                setResetKey((k) => k + 1);
              }}
            >
              <RotateCcw size={14} />
              <span>Reset view</span>
            </button>
            {b.mode === "2d" && (
              <>
                <button
                  className={`icon-button ${panning ? "active" : ""}`}
                  aria-label="Pan bicycle"
                  aria-pressed={panning}
                  onClick={() => setPanning((v) => !v)}
                >
                  <Hand size={15} />
                </button>
                <span className="control-divider" />
                <button
                  className="icon-button bordered"
                  aria-label="Zoom out"
                  disabled={b.zoom <= 0.65}
                  onClick={() => b.set({ zoom: Math.max(0.65, b.zoom - 0.1) })}
                >
                  <Minus size={13} />
                </button>
                <span className="zoom-value">{Math.round(b.zoom * 100)}%</span>
                <button
                  className="icon-button bordered"
                  aria-label="Zoom in"
                  disabled={b.zoom >= 1.5}
                  onClick={() => b.set({ zoom: Math.min(1.5, b.zoom + 0.1) })}
                >
                  <Plus size={13} />
                </button>
              </>
            )}
          </div>
        </section>
        {!compact && (
          <aside className="parts-inspector">
            <div className="inspector-heading">
              <h2>{categories[b.slot].label}</h2>
            </div>
            <p className="muted">{categories[b.slot].description}</p>
            {inspectorContents}
          </aside>
        )}
        <section className="compact-summary" aria-label="Build summary">
          <span>
            <List size={17} />
            Selected parts{" "}
            <b>
              {result?.selectedCount ?? 0}/{slots.length}
            </b>
          </span>
          <span>
            <Cog size={17} />
            Gear ratio <b>{result?.ratio?.toFixed(2) || "?"}:1</b>
          </span>
          <span className={result?.state || "unverified"}>
            <ShieldCheck size={17} />
            {result ? stateLabel[result.state] : "Checking?"} (
            {result?.unresolved ?? "?"})
          </span>
          <button className="text-button" onClick={() => setInfo(true)}>
            View details
          </button>
          <button className="text-button" onClick={() => setInfo(true)}>
            Review checks
          </button>
        </section>
      </div>
      {compact && (
        <div className="mobile-parts-bar">
          <div>
            <strong>{categories[b.slot].label}</strong>
            <span>
              {session.user
                ? "Your workshop"
                : session.developmentUnlimited
                  ? "Development access"
                  : `${Math.max(0, session.limits.changes - session.usage.changes)} changes remaining`}
            </span>
          </div>
          <button
            className="button primary"
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            onClick={() => setSheetOpen(true)}
          >
            Choose parts
          </button>
        </div>
      )}
      {compact && sheetOpen && (
        <PartsSheet
          title={categories[b.slot].label}
          preview={previewRef}
          onClose={() => setSheetOpen(false)}
        >
          {inspectorContents}
        </PartsSheet>
      )}
      {actionError && (
        <div className="error-box action-error" role="alert">
          {actionError}
        </div>
      )}
      {info && (
        <dialog
          className="dialog info-dialog"
          ref={infoRef}
          onCancel={() => setInfo(false)}
        >
          <h2>Know your build.</h2>
          <p>{technicalDisclaimer}</p>
          <p className="notice">
            This assembly uses illustrative demo parts. A green dimensional
            check is not proof of safe real-world assembly.
          </p>
          <section className="build-summary" aria-label="Build specifications">
            <div className="selected-parts">
              <h3>
                <List size={19} />
                Selected parts
              </h3>
              <dl>
                {slots.map((slot) => (
                  <div key={slot}>
                    <dt>{categories[slot].label}</dt>
                    <dd>
                      {b.configuration
                        ? variantById(data, b.configuration[slot])?.product
                            .name || "Unavailable"
                        : "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="ratio-summary">
              <h3>
                <Cog size={20} />
                Gear ratio
              </h3>
              <strong>
                {result?.ratio?.toFixed(2) || "—"} <span>: 1</span>
              </strong>
              <span className="mono small">
                {result?.gearInches
                  ? `${result.gearInches.toFixed(1)} gear inches · illustrative`
                  : "Effective wheel diameter unknown"}
              </span>
              <p>
                Known weight:{" "}
                {result?.knownWeightG
                  ? `${(result.knownWeightG / 1000).toFixed(2)} kg`
                  : "not available"}
                {result && !result.weightComplete ? " · incomplete" : ""}
              </p>
            </div>
            <div className="compatibility-summary">
              <h3>
                <ShieldCheck size={20} />
                Compatibility
              </h3>
              <button
                className={`compatibility-status ${result?.state || "unverified"}`}
                onClick={() => setInfo(true)}
              >
                <TriangleAlert size={18} />
                {result ? stateLabel[result.state] : "Checking…"}
              </button>
              <p>
                {result?.unresolved ?? "—"} unresolved checks. Review fitment
                details before finalizing your build.
              </p>
              <button
                className="text-button small"
                onClick={() => setInfo(true)}
              >
                Review checks <ArrowRight size={13} />
              </button>
            </div>
          </section>
          <ul className="rule-list">
            {result?.rules.map((rule) => (
              <li key={rule.id}>
                <span className={`rule-dot ${rule.state}`} />
                <div>
                  <strong>{stateLabel[rule.state]}</strong>
                  <p>{rule.message}</p>
                  {rule.missing.length > 0 && (
                    <span className="small muted">
                      Needed: {rule.missing.join(", ")}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <h3>Guest workspace</h3>
          <p className="small muted">
            {session.developmentUnlimited ? (
              <>
                Development usage quotas are disabled. Your guest draft stays in
                memory. Sign in to save builds.
              </>
            ) : (
              <>
                {session.policy.guestChanges} accepted component changes and{" "}
                {session.policy.guestPreviews} 3D sessions of up to{" "}
                {session.policy.guestPreviewMinutes} minutes per rolling 24
                hours. Undo and redo are component changes. Browsing and
                rejected incompatible selections use no component allowance.
                Your guest build stays only in memory.
              </>
            )}
          </p>
          <button
            className="button primary full"
            onClick={() => setInfo(false)}
          >
            Back to the build
          </button>
        </dialog>
      )}
      {frameReview && b.configuration && (
        <FrameChangeReview
          guest={!session.user && !session.developmentUnlimited}
          current={b.configuration}
          proposed={frameReview}
          catalog={data}
          pending={b.pending}
          onClose={() => setFrameReview(null)}
          onApply={(configuration) =>
            void change(
              "frameset",
              configuration.frameset,
              undefined,
              configuration,
            )
          }
        />
      )}
    </main>
  );
}
