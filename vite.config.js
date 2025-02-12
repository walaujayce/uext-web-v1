import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const WebAPI =
  process.env.npm_lifecycle_event === "start:dev"
    ? process.env.VITE_WEBAPI_URL === "localhost"
      ? window.location.hostname
      : process.env.VITE_WEBAPI_URL
    : "192.9.120.70";

const SocketServer =
  process.env.npm_lifecycle_event === "start:dev"
    ? process.env.VITE_SOCKETSERVER_URL === "localhost"
      ? window.location.hostname
      : process.env.VITE_SOCKETSERVER_URL
    : "192.9.120.70";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { 
      // Proxy for the first API 
      "/api/7284": {
        target: `http://${WebAPI}:7284`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/7284/, "/api"), // Rewrites '/api/device1' to '/api'
      },
      // Proxy for the second API
      "/api/8031": {
        target: `http://${SocketServer}:8031`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/8031/, "/api/v1"), // Rewrites '/api/device2' to '/api/v1'
      },
      // Proxy for the thrid API
      "/api/7285": {
        target: `http://${WebAPI}:7285`, // Your API server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/7285/, "/api/v1"), // Rewrite '/api' to ''
      },
      // Proxy for the SignalR
      "/signalR/7284": { 
        target: `ws://${WebAPI}:7284`,
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/signalR\/7284/, "/notifyHub"), // Rewrite '/api' to ''
      },
    },
  },
});
