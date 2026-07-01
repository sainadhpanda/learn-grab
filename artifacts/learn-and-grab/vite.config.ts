import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Allow sensible defaults for build environments (Vercel) while still allowing
// explicit overrides during local development by setting PORT and BASE_PATH.
const rawPort = process.env.PORT ?? process.env.VITE_PORT;
let port: number | undefined;
if (rawPort !== undefined && rawPort !== "") {
  const n = Number(rawPort);
  if (Number.isNaN(n) || n <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }
  port = n;
}

const basePath = process.env.BASE_PATH ?? process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          // The replit plugins are only used in the Replit dev environment.
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    // Use a dist folder at the package level so Vercel can pick it up.
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    // Only set a port if provided; during Vercel build we don't need a dev server.
    ...(port ? { port, strictPort: true } : {}),
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    ...(port ? { port } : {}),
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
