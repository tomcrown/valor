import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer/",
      // Force axios resolution to prevent double bundling
      axios: path.resolve(__dirname, "node_modules/axios"),
    },
    dedupe: ["axios"], // Critical: ensure single axios instance
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
    include: ["buffer", "axios"],
    // Force pre-bundling of axios to prevent issues
    force: true,
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Isolate axios in its own chunk
            if (id.includes("axios")) {
              return "axios-vendor";
            }
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("@radix-ui")) {
              return "vendor-ui";
            }
          }
        },
      },
    },
  },
});
