import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import http from "node:http";

const WebAPI =
  process.env.npm_lifecycle_event === "start:dev"
    ? process.env.VITE_WEBAPI_URL === "localhost"
      ? window.location.hostname
      : process.env.VITE_WEBAPI_URL
    : "192.168.100.200";

const SocketServer =
  process.env.npm_lifecycle_event === "start:dev"
    ? process.env.VITE_SOCKETSERVER_URL === "localhost"
      ? window.location.hostname
      : process.env.VITE_SOCKETSERVER_URL
    : "192.168.100.200";

// 每個 port 在「沒有 X-Target-IP header」時要 fallback 的預設主機（沿用原本 env 行為）
const DEFAULT_HOST_BY_PORT = {
  "7284": WebAPI,
  "7285": WebAPI,
  "8031": SocketServer,
};

// /api/<port>/* 的路徑改寫（與原本 server.proxy 的 rewrite 規則一致）
const rewritePath = (port, url) =>
  port === "7284"
    ? url.replace(/^\/api\/7284/, "/api")
    : url.replace(/^\/api\/(7285|8031)/, "/api/v1");

// ─────────────────────────────────────────────────────────
// dev-only 動態 proxy：
//   瀏覽器永遠只打 dev server（same-origin，無 CORS），
//   再由這段 middleware 依 X-Target-IP header 把請求轉發到對應樓層/區域的後端 IP。
//   沒帶 header 時 fallback 到 DEFAULT_HOST_BY_PORT。
//   只攔截 /api/7284 /api/7285 /api/8031；其它路徑（例如 /signalR）交回 Vite 處理。
// ─────────────────────────────────────────────────────────
const dynamicApiProxy = () => ({
  name: "dynamic-api-proxy",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const m = req.url && req.url.match(/^\/api\/(7284|7285|8031)(?=\/|\?|$)/);
      if (!m) return next();

      const port = m[1];
      const headerIp = req.headers["x-target-ip"];
      const ip = (Array.isArray(headerIp) ? headerIp[0] : headerIp) || DEFAULT_HOST_BY_PORT[port];
      const path = rewritePath(port, req.url);

      // 複製 headers，改寫 host（等同 changeOrigin），移除只給 proxy 用的自訂 header
      const headers = { ...req.headers, host: `${ip}:${port}` };
      delete headers["x-target-ip"];

      const proxyReq = http.request(
        { host: ip, port: Number(port), method: req.method, path, headers },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
          proxyRes.pipe(res);
        },
      );
      proxyReq.on("error", (err) => {
        if (!res.headersSent) {
          res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
        }
        res.end("dynamic-api-proxy error: " + err.message);
      });
      req.pipe(proxyReq);
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dynamicApiProxy()],
  server: {
    proxy: {
      // /api/7284、/api/7285、/api/8031 已改由 dynamicApiProxy() 處理（支援動態 IP）

      // SignalR 仍走固定 WebAPI（websocket，動態 IP 需另外處理）
      "/signalR/7284": {
        target: `ws://${WebAPI}:7284`,
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/signalR\/7284/, "/notifyHub"),
      },
    },
  },
});
