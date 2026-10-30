import {
  componentGeometry,
  renderFrameSpecs,
  renderMorphologyId,
  selectedColorway,
  slots,
  variantById,
  type Configuration,
  type Product,
  type Slot,
} from "@tracklab/domain";
export type TransitionPhase =
  | "idle"
  | "preparing"
  | "loading-assets"
  | "transitioning"
  | "settling"
  | "completed"
  | "cancelled"
  | "failed";
export type TransitionStrategy =
  "initial" | "material" | "morph" | "replacement";
export type TransitionPlan = {
  strategy: TransitionStrategy;
  slots: Slot[];
  seconds: number;
  family?: string;
};
export type TransitionState = {
  id: number;
  phase: TransitionPhase;
  plan: TransitionPlan;
  message: string;
};
export function geometryIdentity(
  configuration: Configuration,
  catalog: Product[],
) {
  const record = variantById(catalog, configuration.frameset);
  return JSON.stringify(
    slots.map((slot) => {
      const v = variantById(catalog, configuration[slot])?.variant;
      const specs =
        slot === "frameset"
          ? renderFrameSpecs(
              v?.specs || {},
              record && renderMorphologyId(record.product, record.variant),
            )
          : v?.specs || {};
      return [
        slot,
        Object.entries(specs).sort(([a], [b]) => a.localeCompare(b)),
        slot === "frameset" ? v?.asset3D : undefined,
      ];
    }),
  );
}
export function transitionPlan(
  from: Configuration | null,
  to: Configuration,
  catalog: Product[],
  simplified = false,
): TransitionPlan {
  if (!from) return { strategy: "initial", slots: [...slots], seconds: 0 };
  if (JSON.stringify(from) === JSON.stringify(to))
    return { strategy: "initial", slots: [], seconds: 0 };
  if (geometryIdentity(from, catalog) === geometryIdentity(to, catalog)) {
    const artwork = (c: Configuration) => {
      const r = variantById(catalog, c.frameset);
      return JSON.stringify(
        (r &&
          selectedColorway(r.product, r.variant)?.graphics.filter(
            (g) => g.permission === "confirmed",
          )) ||
          [],
      );
    };
    return artwork(from) === artwork(to)
      ? { strategy: "material", slots: [], seconds: simplified ? 0 : 0.4 }
      : {
          strategy: "replacement",
          slots: ["frameset"],
          seconds: simplified ? 0.18 : 0.48,
        };
  }
  const changed = slots.filter((s) => from[s] !== to[s]);
  const affected = changed.includes("frameset") ? [...slots] : changed;
  const a = variantById(catalog, from.frameset),
    b = variantById(catalog, to.frameset);
  const common =
    a &&
    b &&
    a.product.id === b.product.id &&
    a.product.status === "published" &&
    b.product.status === "published" &&
    a.variant.asset3D?.revision === "frame-kit-v5" &&
    b.variant.asset3D?.revision === "frame-kit-v5" &&
    renderMorphologyId(a.product, a.variant) ===
      renderMorphologyId(b.product, b.variant);
  const paintA = a && selectedColorway(a.product, a.variant),
    paintB = b && selectedColorway(b.product, b.variant);
  const samePaint =
    a?.variant.color === b?.variant.color &&
    paintA?.id === paintB?.id &&
    !(paintA?.graphics.length || paintB?.graphics.length) &&
    JSON.stringify(from.appearance) === JSON.stringify(to.appearance);
  const sameParts = slots
    .filter((s) => s !== "frameset")
    .every((s) => from[s] === to[s]);
  const geometry = (c: Configuration) =>
    componentGeometry(
      Object.fromEntries(
        slots.map((s) => [s, variantById(catalog, c[s])?.variant.specs]),
      ),
    );
  const morph =
    !simplified &&
    common &&
    samePaint &&
    sameParts &&
    geometry(from).drivetrain.chain.count ===
      geometry(to).drivetrain.chain.count;
  return {
    strategy: morph ? "morph" : "replacement",
    slots: affected,
    seconds: simplified ? 0.18 : changed.includes("frameset") ? 0.92 : 0.48,
    ...(morph
      ? {
          family: `${a.product.id}/frame-kit-v5/${renderMorphologyId(a.product, a.variant) || "round"}`,
        }
      : {}),
  };
}
const emptyPlan: TransitionPlan = {
  strategy: "initial",
  slots: [],
  seconds: 0,
};
/** Presentation transactions only. The backend-approved configuration stays outside this store. */
export class TransitionCoordinator {
  private state: TransitionState = {
    id: 0,
    phase: "idle",
    plan: emptyPlan,
    message: "",
  };
  private listeners = new Set<() => void>();
  private commit: (() => void) | undefined;
  private cleanup: (() => void) | undefined;
  private elapsed = 0;
  committed = false;
  skip = false;
  getSnapshot = () => this.state;
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  private publish(phase: TransitionPhase, message: string) {
    this.state = { ...this.state, phase, message };
    for (const listener of this.listeners) listener();
  }
  begin(plan: TransitionPlan) {
    this.cleanup?.();
    this.cleanup = undefined;
    this.commit = undefined;
    this.elapsed = 0;
    this.committed = false;
    this.skip = false;
    if (this.busy) this.publish("cancelled", "Previous transition cancelled.");
    this.state = {
      id: this.state.id + 1,
      phase: "preparing",
      plan,
      message: "Preparing preview…",
    };
    for (const listener of this.listeners) listener();
    return this.state.id;
  }
  get busy() {
    return [
      "preparing",
      "loading-assets",
      "transitioning",
      "settling",
    ].includes(this.state.phase);
  }
  loading(id: number) {
    if (id === this.state.id)
      this.publish(
        "loading-assets",
        "Loading selected model… Previous preview remains visible.",
      );
  }
  ready(id: number, commit: () => void) {
    if (id !== this.state.id) return false;
    this.commit = commit;
    if (!this.state.plan.seconds || this.skip) {
      this.commitNow();
      this.publish("completed", "Preview updated.");
    } else {
      this.elapsed = 0;
      this.publish(
        "transitioning",
        this.state.plan.strategy === "material"
          ? "Updating finish…"
          : "Updating bicycle…",
      );
      if (this.state.plan.strategy === "material") this.commitNow();
    }
    return true;
  }
  bindCleanup(fn: () => void) {
    this.cleanup?.();
    this.cleanup = fn;
  }
  replacement() {
    this.state = {
      ...this.state,
      plan: { ...this.state.plan, strategy: "replacement", family: undefined },
      message: "Updating bicycle…",
    };
    for (const listener of this.listeners) listener();
  }
  private commitNow() {
    if (this.committed) return;
    this.committed = true;
    this.commit?.();
  }
  advance(delta: number) {
    if (!["transitioning", "settling"].includes(this.state.phase)) return null;
    this.elapsed += Math.min(Math.max(delta, 0), 0.05);
    const progress = Math.min(1, this.elapsed / this.state.plan.seconds);
    if (progress >= 0.24) this.commitNow();
    if (progress >= 1) {
      this.cleanup?.();
      this.cleanup = undefined;
      this.publish(
        "completed",
        this.state.plan.strategy === "material"
          ? "Material updated."
          : "Model switched.",
      );
    } else if (progress >= 0.85 && this.state.phase !== "settling")
      this.publish("settling", "Settling preview…");
    return progress;
  }
  finish() {
    this.skip = true;
    if (this.commit) {
      this.commitNow();
      this.cleanup?.();
      this.cleanup = undefined;
      this.publish(
        "cancelled",
        "Animation skipped. Latest selection retained.",
      );
    }
  }
  fail(id: number) {
    if (id !== this.state.id) return;
    this.cleanup?.();
    this.cleanup = undefined;
    this.publish(
      "failed",
      "Selected 3D model could not load. Your build is retained.",
    );
  }
  dispose() {
    this.cleanup?.();
    this.cleanup = undefined;
    this.commit = undefined;
    this.state = { ...this.state, id: this.state.id + 1, phase: "cancelled" };
    this.listeners.clear();
  }
}
