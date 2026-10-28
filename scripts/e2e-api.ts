// Test-only entrypoint. This file is never imported by production or npm run dev.
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
if (
  process.env.NODE_ENV !== "test" ||
  process.env.DEVELOPMENT_EPHEMERAL !== "true" ||
  process.env.MONGODB_URI ||
  process.env.MONGODB_DB_NAME !== "tracklab_e2e" ||
  process.env.PORT !== "4010"
)
  throw new Error(
    "Admin browser fixtures require the isolated ephemeral test environment.",
  );
await import("../backend/src/server");
const { User } = await import("../backend/src/models");
const { default: argon2 } = await import("argon2");
const email = "admin-browser@example.test",
  password = randomBytes(32).toString("base64url");
await User.create({
  email,
  name: "Isolated Browser Admin",
  passwordHash: await argon2.hash(password),
  role: "admin",
  verified: true,
});
await mkdir(".local", { recursive: true });
await writeFile(".local/e2e-admin.json", JSON.stringify({ email, password }), {
  mode: 0o600,
});
