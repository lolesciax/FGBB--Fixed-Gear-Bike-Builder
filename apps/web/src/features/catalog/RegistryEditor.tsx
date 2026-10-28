import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  brandSchema,
  modelRecordSchema,
  type CatalogBrand,
  type ModelRecord,
} from "@tracklab/domain";
import { api } from "../../services/api";
import { errorMessage } from "../../app/context";
export function RegistryEditor() {
  const client = useQueryClient();
  const brands = useQuery({
    queryKey: ["brands"],
    queryFn: () => api<{ items: CatalogBrand[] }>("/brands"),
  });
  const models = useQuery({
    queryKey: ["models"],
    queryFn: () => api<{ items: ModelRecord[] }>("/models"),
  });
  const [brand, setBrand] = useState({
    id: "",
    name: "",
    description: "",
    source: "",
    categories: ["frameset"],
  } as Omit<CatalogBrand, "reviewedAt">);
  const [model, setModel] = useState({
    id: "",
    brandId: "",
    name: "",
    source: "",
    notes: "",
    specificationStatus: "unverified",
  } as Omit<ModelRecord, "checkedAt">);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function save(kind: "brands" | "models") {
    setBusy(true);
    setMessage("");
    try {
      const input =
        kind === "brands"
          ? brandSchema.parse({
              ...brand,
              reviewedAt: new Date().toISOString(),
            })
          : modelRecordSchema.parse({
              ...model,
              checkedAt: new Date().toISOString(),
            });
      await api(`/admin/${kind}/${input.id}`, { method: "PUT", body: input });
      await client.invalidateQueries({ queryKey: [kind] });
      setMessage(
        "Registry record saved and audited. Publication and rendering require separate review.",
      );
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="registry-editor">
      <summary>Manufacturers and model research</summary>
      <p>
        Register source-backed identities here. Product sizes, finishes and
        publication remain in the validated catalog editor below.
      </p>
      {(brands.isError || models.isError) && (
        <p role="alert">{errorMessage(brands.error || models.error)}</p>
      )}
      {message && <p role="status">{message}</p>}
      <div className="registry-forms">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save("brands");
          }}
        >
          <h3>Manufacturer</h3>
          <label>
            Existing manufacturer
            <select
              aria-label="Edit manufacturer"
              value={brand.id}
              onChange={(event) => {
                const found = brands.data?.items.find(
                  (b) => b.id === event.target.value,
                );
                setBrand(
                  found || {
                    id: "",
                    name: "",
                    source: "",
                    description: "",
                    categories: ["frameset"],
                  },
                );
              }}
            >
              <option value="">New manufacturer</option>
              {brands.data?.items
                .filter((b) => b.source?.startsWith("https://"))
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
          </label>
          {(["id", "name", "source", "description"] as const).map((key) => (
            <label key={key}>
              Manufacturer {key}
              <input
                required={key !== "description"}
                value={brand[key]}
                onChange={(event) =>
                  setBrand({ ...brand, [key]: event.target.value })
                }
              />
            </label>
          ))}
          <button className="button" disabled={busy}>
            Save manufacturer
          </button>
        </form>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save("models");
          }}
        >
          <h3>Model research</h3>
          <label>
            Existing model
            <select
              aria-label="Edit model research"
              value={model.id}
              onChange={(event) => {
                const found = models.data?.items.find(
                  (m) => m.id === event.target.value,
                );
                if (found) {
                  const {
                    id,
                    brandId,
                    name,
                    source,
                    notes,
                    specificationStatus,
                    productId,
                    revision,
                    year,
                  } = found;
                  setModel({
                    id,
                    brandId,
                    name,
                    source,
                    notes,
                    specificationStatus,
                    ...(productId ? { productId } : {}),
                    ...(revision ? { revision } : {}),
                    ...(year ? { year } : {}),
                  });
                } else
                  setModel({
                    id: "",
                    brandId: "",
                    name: "",
                    source: "",
                    notes: "",
                    specificationStatus: "unverified",
                  });
              }}
            >
              <option value="">New model</option>
              {models.data?.items.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brandId} / {m.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Model manufacturer
            <select
              required
              value={model.brandId}
              onChange={(event) =>
                setModel({ ...model, brandId: event.target.value })
              }
            >
              <option value="">Choose manufacturer</option>
              {brands.data?.items.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          {(["id", "name", "source", "revision", "productId"] as const).map(
            (key) => (
              <label key={key}>
                Model {key}
                <input
                  required={["id", "name", "source"].includes(key)}
                  value={model[key] || ""}
                  onChange={(event) => {
                    const next = { ...model, [key]: event.target.value };
                    if (
                      !event.target.value &&
                      (key === "revision" || key === "productId")
                    )
                      delete next[key];
                    setModel(next);
                  }}
                />
              </label>
            ),
          )}
          <label>
            Specification review
            <select
              value={model.specificationStatus}
              onChange={(event) =>
                setModel({
                  ...model,
                  specificationStatus: event.target
                    .value as ModelRecord["specificationStatus"],
                })
              }
            >
              <option value="unverified">Unverified</option>
              <option value="partial">Partial</option>
              <option value="verified">Verified reviewed facts</option>
            </select>
          </label>
          <label>
            Review notes
            <textarea
              required
              rows={3}
              value={model.notes}
              onChange={(event) =>
                setModel({ ...model, notes: event.target.value })
              }
            />
          </label>
          <button className="button" disabled={busy}>
            Save model research
          </button>
        </form>
      </div>
    </details>
  );
}
