// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import clientBuildEnv from "./client-build-env.json";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Client code keeps using only VITE_* vars (injected by the shared config).
// Server routes also need non-prefixed vars (e.g. SUPABASE_SERVICE_ROLE_KEY,
// LOVABLE_API_KEY); load them into process.env for server-side code only.
// Never add these to a define block — that would leak secrets to the client.
const serverEnv = loadEnv(process.env["NODE_ENV"] ?? "development", rootDir, "");
Object.assign(process.env, serverEnv);

// Client defaults are public by design and are also checked into the root .env.
// Refuse to expose anything that is not explicitly VITE_-prefixed.
for (const [key, value] of Object.entries(clientBuildEnv)) {
  if (!key.startsWith("VITE_")) throw new Error("Only public VITE build defaults are allowed");
  if (!process.env[key]) process.env[key] = value;
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // Explicitly replace these public variables in both dev and production client bundles.
    // This avoids relying on the editor's process.env-to-import.meta.env behavior.
    define: Object.fromEntries(
      Object.entries(clientBuildEnv).map(([key, value]) => [
        `import.meta.env.${key}`,
        JSON.stringify(process.env[key] || value),
      ]),
    ),
    resolve: {
      alias: {
        // A nested entities v7 copy breaks SSR (it removed the legacy decode/encode subpaths);
        // pin every entities import to the hoisted v4.5.0 copy.
        "entities/decode": path.resolve(rootDir, "node_modules/entities/lib/decode.js"),
        "entities/decode.js": path.resolve(rootDir, "node_modules/entities/lib/decode.js"),
        "entities/encode": path.resolve(rootDir, "node_modules/entities/lib/encode.js"),
        "entities/encode.js": path.resolve(rootDir, "node_modules/entities/lib/encode.js"),
        "entities/lib/decode.js": path.resolve(rootDir, "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(rootDir, "node_modules/entities/lib/encode.js"),
        entities: path.resolve(rootDir, "node_modules/entities"),
      },
    },
  },
});
