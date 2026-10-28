import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { quotaPolicySchema, type QuotaPolicy } from "@tracklab/domain";
import { api } from "../services/api";
import { errorMessage, useApp } from "../app/context";
const labels: Record<keyof QuotaPolicy, string> = {
  guestChanges: "Guest changes / day",
  guestPreviews: "Guest 3D sessions / day",
  guestPreviewMinutes: "Minutes / guest 3D session",
  builds: "Active saved builds",
  createDaily: "Creations / day",
  createMonthly: "Creations / 30 days",
  publish: "Published builds",
  exports: "Combined image / information exports per day",
  saveHourly: "Save writes / hour",
};
export function PolicyEditor() {
  const { refresh } = useApp(),
    [draft, setDraft] = useState<QuotaPolicy | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const current = useQuery({
    queryKey: ["admin-policy"],
    queryFn: () =>
      api<{ policy: QuotaPolicy; version: number }>("/admin/policy"),
  });
  const policy = draft || current.data?.policy;
  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const input = quotaPolicySchema.parse(policy);
      await api("/admin/policy", {
        method: "PUT",
        body: { policy: input, version: current.data?.version },
      });
      await current.refetch();
      setDraft(null);
      await refresh();
      setMessage("Policy updated and audited. Existing builds are retained.");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="policy-editor">
      <h2>Access policy</h2>
      <p>
        Guests keep one temporary build. Registered users and administrators
        share storage limits; only administrators can change these bounded
        values. No paid plans.
      </p>
      {current.isError && <p role="alert">{errorMessage(current.error)}</p>}
      {policy && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <div className="policy-fields">
            {(Object.keys(labels) as (keyof QuotaPolicy)[]).map((key) => (
              <label key={key}>
                {labels[key]}
                <input
                  type="number"
                  min={1}
                  required
                  value={policy[key]}
                  onChange={(event) =>
                    setDraft({ ...policy, [key]: Number(event.target.value) })
                  }
                />
              </label>
            ))}
          </div>
          <button className="button primary" disabled={busy || !draft}>
            {busy ? "Saving..." : "Save audited policy"}
          </button>
        </form>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
