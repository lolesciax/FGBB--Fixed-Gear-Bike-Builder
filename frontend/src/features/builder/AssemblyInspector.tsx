import {
  variantById,
  visualizationInfo,
  wheelBuild,
  type Configuration,
  type Product,
} from "@tracklab/domain";
import {
  inspectionTargets,
  inspectionSlot,
  type InspectionTarget,
  type CameraCommand,
} from "./inspection";
export function AssemblyInspector({
  configuration,
  catalog,
  target,
  onTarget,
  onCommand,
  onReset,
  onClose,
}: {
  configuration: Configuration;
  catalog: Product[];
  target?: InspectionTarget;
  onTarget: (target: InspectionTarget | undefined) => void;
  onCommand: (action: CameraCommand["action"]) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const selected =
      target && variantById(catalog, configuration[inspectionSlot(target)]),
    v = selected && selected.variant,
    info = selected && visualizationInfo(selected.product, selected.variant);
  const fields: Record<InspectionTarget, string[]> = {
    frameset: [
      "size",
      "material",
      "seatTube",
      "headTube",
      "headAngle",
      "seatAngle",
    ],
    fork: [
      "forkLength",
      "forkRake",
      "headset",
      "frontSpacing",
      "frontAxleDiameter",
    ],
    wheels: ["rimDepth", "rimWidth", "bsd", "frontSpacing", "rearSpacing"],
    drivetrain: ["frontTeeth", "rearTeeth", "chainline", "bottomBracket"],
    cockpit: ["shape", "width", "stemLength", "stemClamp"],
    saddle: ["shape", "railType", "clampType", "postDiameter"],
  };
  const labels: Record<string, string> = {
    size: "Size",
    material: "Material",
    seatTube: "Seat tube · mm",
    headTube: "Head tube · mm",
    headAngle: "Head angle · °",
    seatAngle: "Seat angle · °",
    forkLength: "Fork length · mm",
    forkRake: "Fork offset · mm",
    headset: "Headset",
    frontSpacing: "Front spacing · mm",
    rearSpacing: "Rear spacing · mm",
    frontAxleDiameter: "Front axle · mm",
    rimDepth: "Rim depth · mm",
    rimWidth: "Rim width · mm",
    bsd: "Bead seat diameter · mm",
    frontTeeth: "Chainring teeth",
    rearTeeth: "Cog teeth",
    chainline: "Chainline · mm",
    bottomBracket: "Bottom bracket",
    shape: "Shape",
    width: "Width · mm",
    stemLength: "Stem length · mm",
    stemClamp: "Bar clamp · mm",
    railType: "Saddle rails",
    clampType: "Rail clamp",
    postDiameter: "Post diameter · mm",
  };
  return (
    <section className="assembly-inspector" aria-label="Assembly inspection">
      <p className="small muted">
        Explore the current assembly. Your build stays selected.
      </p>
      <label>
        Inspect assembly
        <select
          aria-label="Inspect assembly"
          value={target || ""}
          onChange={(e) =>
            onTarget(
              (e.target.value || undefined) as InspectionTarget | undefined,
            )
          }
        >
          <option value="">Full bicycle</option>
          {inspectionTargets.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {selected && target && v && (
        <>
          <h3>
            {selected.product.brand} / {selected.product.name}
          </h3>
          <p>{v.label}</p>
          <dl>
            {fields[target].map((key) => (
              <div key={key}>
                <dt>{labels[key]}</dt>
                <dd>{String(v.specs[key] ?? "Needs verification")}</dd>
              </div>
            ))}
            {target === "wheels" && (
              <>
                <div>
                  <dt>Front spokes</dt>
                  <dd>{wheelBuild(v.specs).label}</dd>
                </div>
                <div>
                  <dt>Rear spokes</dt>
                  <dd>{wheelBuild(v.specs, true).label}</dd>
                </div>
              </>
            )}
          </dl>
          <p className="small muted">
            {info?.fidelity}. {info?.limitations}
          </p>
        </>
      )}
      <fieldset>
        <legend>Camera navigation</legend>
        <div className="inspection-navigation">
          {[
            ["pan-left", "Pan left"],
            ["pan-up", "Pan up"],
            ["pan-right", "Pan right"],
            ["zoom-in", "Zoom in"],
            ["pan-down", "Pan down"],
            ["zoom-out", "Zoom out"],
          ].map(([action, label]) => (
            <button
              className="button"
              key={action}
              onClick={() => onCommand(action as CameraCommand["action"])}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <button className="button" onClick={onReset}>
        Reset assembly
      </button>
      <button className="text-button" onClick={onClose}>
        Return to parts
      </button>
    </section>
  );
}
