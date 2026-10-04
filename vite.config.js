import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Tauri expects a fixed dev server port
  server: {
    port: 1420,
    strictPort: true,
    // Cargo locks files under src-tauri/target while building; watching it
    // crashes the Vite file watcher with EBUSY during Rust builds.
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});
