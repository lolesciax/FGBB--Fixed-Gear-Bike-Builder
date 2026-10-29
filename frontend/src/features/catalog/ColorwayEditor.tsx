import { useState } from "react";
import { colorwaySchema, productSchema, type Colorway } from "@tracklab/domain";
export function ColorwayEditor({
  text,
  onChange,
}: {
  text: string;
  onChange: (text: string) => void;
}) {
  const [draft, setDraft] = useState<Colorway>(),
    [bases, setBases] = useState<string[]>([]),
    [graphics, setGraphics] = useState("[]"),
    [regions, setRegions] = useState("[]"),
    [message, setMessage] = useState("");
  let parsed;
  try {
    parsed = productSchema.safeParse(JSON.parse(text));
  } catch {
    return null;
  }
  if (!parsed.success || parsed.data.slot !== "frameset") return null;
  const product = parsed.data;
  const load = (c: Colorway) => {
    setDraft(structuredClone(c));
    setRegions(JSON.stringify(c.regions, null, 2));
    setGraphics(JSON.stringify(c.graphics, null, 2));
    setBases(
      product.variants
        .filter((v) => !v.colorwayId && c.sizes.includes(String(v.specs.size)))
        .map((v) => v.id),
    );
    setMessage("");
  };
  function apply() {
    if (!draft) return;
    try {
      const selected = product.variants.filter((v) => bases.includes(v.id));
      const c = colorwaySchema.parse({
        ...draft,
        sizes: selected.map((v) => String(v.specs.size)),
        regions: JSON.parse(regions),
        graphics: JSON.parse(graphics),
      });
      const next = structuredClone(product);
      next.colorways = [
        ...(next.colorways || []).filter((v) => v.id !== c.id),
        c,
      ];
      next.variants = next.variants.map((v) =>
        v.colorwayId === c.id
          ? {
              ...v,
              label: `${v.specs.size} / ${c.name}`,
              color: c.paint.color,
              specs: { ...v.specs, finish: c.name, colorApproximate: true },
            }
          : v,
      );
      for (const base of selected)
        if (
          !next.variants.some(
            (v) => v.colorwayId === c.id && v.specs.size === base.specs.size,
          )
        )
          next.variants.push({
            ...base,
            id: `${c.id}-${String(base.specs.size).toLowerCase()}`,
            colorwayId: c.id,
            geometryVariantId: base.id,
            label: `${base.specs.size} / ${c.name}`,
            color: c.paint.color,
            specs: { ...base.specs, finish: c.name, colorApproximate: true },
          });
      onChange(JSON.stringify(next, null, 2));
      setMessage(
        "Colorway staged in this catalog record. Save the record to validate and persist it.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Check the colorway fields.",
      );
    }
  }
  return (
    <details className="colorway-admin">
      <summary>Colorway definitions and permissions</summary>
      <p>
        Register one exact model/revision and reviewed size association. Changes
        are staged in the catalog record below. Saved appearance revisions are
        immutable; create a new revision to change used definitions.
      </p>
      <label>
        Review colorway
        <select
          aria-label="Edit colorway"
          value={draft?.id || ""}
          onChange={(e) => {
            const c = product.colorways?.find((c) => c.id === e.target.value);
            if (c) load(c);
          }}
        >
          <option value="">Choose a colorway</option>
          {product.colorways?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} / revision {c.revision} / {c.status}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="button"
        onClick={() =>
          load({
            id: `${product.id}-new-finish-v1`,
            revision: 1,
            productId: product.id,
            name: "New finish draft",
            modelRevision: product.revision || "Model year/revision unverified",
            sizes: [String(product.variants[0].specs.size)],
            status: "draft",
            availability: "unknown",
            source: {
              url: product.source || "https://example.com/",
              verifiedAt: new Date().toISOString(),
              references: [],
            },
            fidelity: "approximate",
            paint: {
              color: "#808080",
              finish: "unknown",
              roughness: 0.4,
              metalness: 0.2,
              clearcoat: 0.1,
              clearcoatRoughness: 0.3,
            },
            regions: [],
            graphics: [],
            missingGraphics: [
              "Artwork permissions and exact finish require review.",
            ],
            limitations:
              "Draft: source, paint regions, model revision and rights require review.",
            license: "original-paint-approximation",
          })
        }
      >
        Add colorway draft
      </button>
      {draft && (
        <section
          className="colorway-admin-fields"
          aria-label="Colorway draft fields"
        >
          {(["id", "name", "modelRevision", "limitations"] as const).map(
            (key) => (
              <label key={key}>
                {key}
                <input
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                />
              </label>
            ),
          )}
          <label>
            Official colorway source
            <input
              type="url"
              value={draft.source.url}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  source: { ...draft.source, url: e.target.value },
                })
              }
            />
          </label>
          <label>
            Finish review status
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  status: e.target.value as Colorway["status"],
                })
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>
            Primary paint HEX
            <input
              value={draft.paint.color}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  paint: { ...draft.paint, color: e.target.value },
                })
              }
            />
          </label>
          <label>
            Surface finish
            <select
              value={draft.paint.finish}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  paint: {
                    ...draft.paint,
                    finish: e.target.value as Colorway["paint"]["finish"],
                  },
                })
              }
            >
              {[
                "unknown",
                "gloss",
                "matte",
                "satin",
                "metallic",
                "exposed-metal",
              ].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          {(
            [
              "roughness",
              "metalness",
              "clearcoat",
              "clearcoatRoughness",
            ] as const
          ).map((key) => (
            <label key={key}>
              {key}
              <input
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={draft.paint[key]}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    paint: { ...draft.paint, [key]: Number(e.target.value) },
                  })
                }
              />
            </label>
          ))}
          <fieldset>
            <legend>Reviewed geometry sizes</legend>
            {product.variants
              .filter((v) => !v.colorwayId && !v.geometryVariantId)
              .map((v) => (
                <label className="demo-toggle" key={v.id}>
                  <input
                    type="checkbox"
                    checked={bases.includes(v.id)}
                    onChange={(e) =>
                      setBases(
                        e.target.checked
                          ? [...bases, v.id]
                          : bases.filter((id) => id !== v.id),
                      )
                    }
                  />
                  {v.label}
                </label>
              ))}
          </fieldset>
          <label>
            Paint regions JSON
            <textarea
              rows={5}
              value={regions}
              onChange={(e) => setRegions(e.target.value)}
            />
          </label>
          <label>
            Prepared vector / reviewed raster layers JSON
            <textarea
              rows={5}
              value={graphics}
              onChange={(e) => setGraphics(e.target.value)}
            />
          </label>
          <label>
            Missing graphics (one per line)
            <textarea
              rows={2}
              value={draft.missingGraphics.join("\n")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  missingGraphics: e.target.value.split("\n").filter(Boolean),
                })
              }
            />
          </label>
          <div className="dialog-actions">
            <button
              type="button"
              className="button"
              onClick={() => {
                const c = {
                  ...draft,
                  id:
                    draft.id.replace(/-v\d+$/, "") + `-v${draft.revision + 1}`,
                  revision: draft.revision + 1,
                  status: "draft" as const,
                };
                setDraft(c);
              }}
            >
              Create next revision
            </button>
            <button type="button" className="button primary" onClick={apply}>
              Stage colorway in record
            </button>
          </div>
        </section>
      )}
      {message && <p role="status">{message}</p>}
    </details>
  );
}
