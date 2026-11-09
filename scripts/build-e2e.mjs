// Production build for the e2e suite. The example .env.production points at a placeholder API,
// so pages fall back to the bundled sample listings (CONTENT_FALLBACK=seed) instead of showing none.
import { spawnSync } from "node:child_process";

const result = spawnSync("npx next build", { stdio: "inherit", shell: true, env: { ...process.env, CONTENT_FALLBACK: "seed" } });
process.exit(result.status ?? 1);
