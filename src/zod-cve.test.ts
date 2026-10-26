import { describe, expect, test } from "vitest";
import { createRequire } from "node:module";
import { buildApp } from "./app.js";

const require = createRequire(import.meta.url);

describe("GHSA-mrhx-c7xc-m3w5 (zod CVE)", () => {
  test("zod is bumped to the fixed 4.6.6 while project schema still strips unknown keys", async () => {
    // CVE fix: the installed zod must be at least 4.6.6 (GHSA-mrhx-c7xc-m3w5).
    const zodPkg = require("zod/package.json");
    const [major, minor, patch] = zodPkg.version.split(".").map(Number);
    expect(major).toBeGreaterThanOrEqual(4);
    expect(minor).toBeGreaterThanOrEqual(6);
    expect(patch).toBeGreaterThanOrEqual(6);

    // Guard: validation behaviour must not change across the major version bump.
    const app = buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/projects",
      payload: { name: "p", config: { retries: 3 }, unexpected: true },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ name: "p", config: { retries: 3 } });
  });
});
