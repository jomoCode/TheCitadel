import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// ISR pages (revalidate = 60) work without extra setup, but their cache lives
// only in memory per Worker instance. For a shared, persistent cache, create an
// R2 bucket and enable the incremental cache:
//   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
//   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
export default defineCloudflareConfig({});
