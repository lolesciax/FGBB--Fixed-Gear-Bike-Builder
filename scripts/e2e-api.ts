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
    "Browser account fixtures require the isolated ephemeral test environment.",
  );
await import("../backend/src/server");
const { User } = await import("../backend/src/models");
const { default: argon2 } = await import("argon2");
await mkdir(".local", { recursive: true });
for (const fixture of [
  {
    id: "admin",
    email: "admin-browser@example.test",
    name: "Isolated Browser Admin",
    role: "admin",
  },
  {
    id: "rider",
    email: "rider-browser@example.test",
    name: "Isolated Browser Rider",
    role: "user",
  },
] as const) {
  const { email, name, role } = fixture,
    password = randomBytes(32).toString("base64url");
  await User.create({
    email,
    name,
    role,
    passwordHash: await argon2.hash(password),
    verified: true,
  });
  await writeFile(
    `.local/e2e-${fixture.id}.json`,
    JSON.stringify({ email, password }),
    { mode: 0o600 },
  );
}
