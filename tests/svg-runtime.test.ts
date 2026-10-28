import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { it, expect } from "vitest";
it("renders exports with the actual API JSX runtime rather than only the Vitest transform", async () => {
  const { stdout } = await promisify(execFile)(
    process.execPath,
    ["--import", "tsx", "scripts/check-svg-rendering.ts"],
    { cwd: process.cwd(), windowsHide: true },
  );
  expect(stdout).toContain(
    "Verified shared SVG rendering under the API tsx runtime.",
  );
});
