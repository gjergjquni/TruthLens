import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("recharts")) return "vendor-charts";
            if (id.includes("axios")) return "vendor-http";
            if (id.includes("react") || id.includes("react-dom")) return "vendor-react";
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true
      },
      "/webhook": {
        target: "http://localhost:5678",
        changeOrigin: true
      },
      "/webhook-test": {
        target: "http://localhost:5678",
        changeOrigin: true
      }
    }
  }
});
