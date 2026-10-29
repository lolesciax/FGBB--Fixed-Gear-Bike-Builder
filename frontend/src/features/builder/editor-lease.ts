type Lease = { token: string; version: string; expiresAt: number };
const fallback = new Map<string, Lease>();
const key = (owner: string, id: string) => `tracklab-editor:${owner}:${id}`;
function read(k: string) {
  try {
    return JSON.parse(sessionStorage.getItem(k) || "null") as Lease | null;
  } catch {
    return fallback.get(k);
  }
}
function write(k: string, value: Lease) {
  fallback.set(k, value);
  try {
    sessionStorage.setItem(k, JSON.stringify(value));
  } catch {
    /* Memory-only fallback when tab storage is unavailable. */
  }
}
export function editorNonce(owner: string, id: string) {
  const k = key(owner, id),
    existing = read(k);
  const token =
    existing &&
    existing.expiresAt > Date.now() &&
    /^[a-f0-9]{64}$/.test(existing.token)
      ? existing.token
      : Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
          n.toString(16).padStart(2, "0"),
        ).join("");
  write(k, { token, version: "pending", expiresAt: Date.now() + 5 * 60000 });
  return token;
}
export function rememberLease(
  owner: string,
  id: string,
  value: { editorToken: string; leaseVersion: string; expiresAt: string },
) {
  write(key(owner, id), {
    token: value.editorToken,
    version: value.leaseVersion,
    expiresAt: Date.parse(value.expiresAt),
  });
}
export const currentLeaseVersion = (owner: string, id: string) =>
  read(key(owner, id))?.version || "";
export function forgetLease(owner: string, id: string, version: string) {
  const k = key(owner, id);
  if (read(k)?.version !== version) return;
  fallback.delete(k);
  try {
    sessionStorage.removeItem(k);
  } catch {
    /* No persisted lease. */
  }
}
