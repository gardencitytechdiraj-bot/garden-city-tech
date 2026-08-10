import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import {
  handleApplicationsRequest,
  handleHealthRequest,
} from "./server/application-handler";

function localApiPlugin(): Plugin {
  return {
    name: "garden-city-local-api",
    configureServer(server) {
      server.middlewares.use("/api/health", (request, response) => {
        void handleHealthRequest(request, response);
      });
      server.middlewares.use("/api/applications", (request, response) => {
        void handleApplicationsRequest(request, response);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    reportCompressedSize: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
