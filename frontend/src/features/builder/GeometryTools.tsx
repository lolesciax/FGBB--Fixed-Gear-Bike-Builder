import { developmentTargets, type InspectionTarget } from "./inspection";
import { useGeometryDebug } from "./geometry-debug";
export function GeometryTools({
  target,
  onTarget,
}: {
  target?: InspectionTarget;
  onTarget: (target: InspectionTarget | undefined) => void;
}) {
  const { anchors, bounds, intersections, report, toggle } = useGeometryDebug();
  return (
    <details className="geometry-tools">
      <summary>Development geometry tools</summary>
      <label>
        Structural close-up
        <select
          aria-label="Structural close-up"
          value={target?.startsWith("dev-") ? target : ""}
          onChange={(e) =>
            onTarget(
              (e.target.value || undefined) as InspectionTarget | undefined,
            )
          }
        >
          <option value="">Full bicycle</option>
          {developmentTargets.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {(
        [
          ["anchors", "Anchors and axes", anchors],
          ["bounds", "Mesh bounds", bounds],
          ["intersections", "Mesh intersections", intersections],
        ] as const
      ).map(([key, label, checked]) => (
        <label className="geometry-toggle" key={key}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggle(key)}
          />
          {label}
        </label>
      ))}
      {report && (
        <div data-geometry-report aria-live="polite">
          <p>
            {report.testedPairs} mesh pairs checked ·{" "}
            {report.diagnostics.filter((d) => d.severity === "error").length}{" "}
            intersections or alignment errors.
          </p>
          <details>
            <summary>Check results</summary>
            <ul>
              {report.diagnostics.map((d) => (
                <li
                  key={d.id}
                  data-diagnostic={d.id}
                  data-severity={d.severity}
                >
                  {d.severity}: {d.message}
                </li>
              ))}
            </ul>
          </details>
          <p className="small muted">{report.disclaimer}</p>
        </div>
      )}
    </details>
  );
}
