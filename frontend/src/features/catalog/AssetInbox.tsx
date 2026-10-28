import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { errorMessage } from "../../app/context";
export function AssetInbox() {
  const [file, setFile] = useState<File | null>(null),
    [productId, setProduct] = useState(""),
    [license, setLicense] = useState(""),
    [evidence, setEvidence] = useState(""),
    [permission, setPermission] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const inbox = useQuery({
    queryKey: ["asset-reviews"],
    queryFn: () =>
      api<{
        items: {
          _id: string;
          status: string;
          bytes: number;
          metadata: { filename: string; productId: string; license: string };
        }[];
      }>("/admin/asset-reviews"),
  });
  async function upload() {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      if (file.size > 2 * 1024 * 1024)
        throw new Error("Choose a file smaller than 2 MB.");
      const query = new URLSearchParams({
        productId,
        filename: file.name,
        license,
        evidence,
        permission: permission ? "confirmed" : "",
      });
      const result = await api<{ message: string }>(
        "/admin/asset-reviews?" + query,
        { method: "POST", raw: file },
      );
      setMessage(result.message);
      await inbox.refetch();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="registry-editor">
      <summary>Permitted asset review inbox</summary>
      <p>
        Upload original or permitted PNG/JPEG/WebP images and self-contained GLB
        files, up to 2 MB each. Files stay private and pending; uploads do not
        establish fidelity, publish a product or change its renderer. SVG
        uploads are not accepted.
      </p>
      <p className="small muted">
        Local development storage only. Publication still requires dimensions,
        transforms, provenance and rights review through the documented asset
        workflow.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void upload();
        }}
      >
        <label>
          Catalog product ID
          <input
            required
            value={productId}
            onChange={(event) => setProduct(event.target.value)}
          />
        </label>
        <label>
          Asset file
          <input
            type="file"
            required
            accept=".glb,image/png,image/jpeg,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>
        <label>
          License or permission
          <input
            required
            value={license}
            onChange={(event) => setLicense(event.target.value)}
          />
        </label>
        <label>
          Rights evidence URL
          <input
            type="url"
            required
            value={evidence}
            onChange={(event) => setEvidence(event.target.value)}
          />
        </label>
        <label className="demo-toggle">
          <input
            type="checkbox"
            checked={permission}
            onChange={(event) => setPermission(event.target.checked)}
          />
          I have confirmed permission to submit this asset for review.
        </label>
        <button className="button" disabled={busy || !permission || !file}>
          {busy ? "Uploading…" : "Upload for review"}
        </button>
      </form>
      {message && <p role="status">{message}</p>}
      {inbox.isError && <p role="alert">{errorMessage(inbox.error)}</p>}
      <ul>
        {inbox.data?.items.map((item) => (
          <li key={item._id}>
            {item.metadata.productId} / {item.metadata.filename} /{" "}
            {item.metadata.license} / {item.status} /{" "}
            {Math.ceil(item.bytes / 1024)} KB{" "}
            <a
              href={`${import.meta.env.VITE_API_URL || ""}/api/admin/asset-reviews/${item._id}/file`}
            >
              Download for review
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
