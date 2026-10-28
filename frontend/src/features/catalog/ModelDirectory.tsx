import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CatalogBrand, ModelRecord } from "@tracklab/domain";
import { api } from "../../services/api";
import { errorMessage } from "../../app/context";
export type SupportRecord = ModelRecord & {
  published: boolean;
  variants: number;
  renderingFidelity: "illustrative" | "unavailable";
  support: string[];
};
export function ModelDirectory() {
  const [brand, setBrand] = useState("");
  const brands = useQuery({
    queryKey: ["brands"],
    queryFn: () => api<{ items: CatalogBrand[] }>("/brands"),
  });
  const models = useQuery({
    queryKey: ["models"],
    queryFn: () => api<{ items: SupportRecord[] }>("/models"),
  });
  return (
    <details className="model-directory">
      <summary>Brand and model support</summary>
      <p>
        Catalog research and rendering availability are reviewed separately. No
        model currently has fully verified assembly coverage or a licensed
        authentic rendering.
      </p>
      <label>
        Research manufacturer
        <select
          aria-label="Research manufacturer"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
        >
          <option value="">All manufacturers</option>
          {brands.data?.items
            .filter((b) => b.id !== "tracklab-studio")
            .map((b) => (
              <option value={b.id} key={b.id}>
                {b.name}
              </option>
            ))}
        </select>
      </label>
      {(brands.isError || models.isError) && (
        <p role="alert">{errorMessage(brands.error || models.error)}</p>
      )}
      {models.isPending && <p role="status">Loading model support…</p>}
      <div className="model-records">
        {models.data?.items
          .filter((m) => !brand || m.brandId === brand)
          .map((model) => (
            <article key={model.id} className="model-record">
              <div>
                <span className="small muted">
                  {brands.data?.items.find((b) => b.id === model.brandId)
                    ?.name || model.brandId}
                </span>
                <h3>{model.name}</h3>
              </div>
              <p className="small">
                {model.revision || "Revision not established"} · Specifications:{" "}
                {model.specificationStatus}
              </p>
              <p className="render-support">
                {model.support.join(" / ")} ·{" "}
                {model.renderingFidelity === "unavailable"
                  ? "Visualization unavailable"
                  : "Illustrative surfaces"}
              </p>
              <p>{model.notes}</p>
              <p className="small muted">
                {model.published
                  ? `${model.variants} selectable size/finish variants`
                  : "Not selectable; further review required"}{" "}
                · Source checked {model.checkedAt.slice(0, 10)}
              </p>
              <a href={model.source} target="_blank" rel="noreferrer">
                Manufacturer reference
              </a>
            </article>
          ))}
      </div>
      {models.data &&
        !models.data.items.some((m) => !brand || m.brandId === brand) && (
          <p>No reviewed research records for this manufacturer yet.</p>
        )}
    </details>
  );
}
