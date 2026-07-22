// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      proxy: {
        "/auth": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/admin_books": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/book_requests": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/update_book_request": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/delete_book": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/create_book": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/all_books": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
});
