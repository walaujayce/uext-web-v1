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

// 每個 port 在「沒有指定目標 IP」時要 fallback 的預設主機（沿用原本 env 行為）
const DEFAULT_HOST_BY_PORT = {
  "7284": WebAPI,
  "8031": SocketServer,
};

// /api/<port>/* 的路徑改寫（與原本 server.proxy 的 rewrite 規則一致）
const rewriteApiPath = (port, url) =>
  port === "7284"
    ? url.replace(/^\/api\/7284/, "/api")
    : url.replace(/^\/api\/(8031)/, "/api/v1");

// 解析 /api/<port>/* 請求 → 目標 host(來自 X-Target-IP header) / port / path
const resolveApiTarget = (req, port) => {
  const headerIp = req.headers["x-target-ip"];
  const ip =
    (Array.isArray(headerIp) ? headerIp[0] : headerIp) ||
    DEFAULT_HOST_BY_PORT[port];
  return { ip, port: Number(port), path: rewriteApiPath(port, req.url) };
};

// 解析 /signalR/7284* 請求 → 目標 host(來自 targetIp query) / port 7284 / path(/notifyHub)
// negotiate(HTTP) 與 ws 握手都會帶 query，故兩邊共用同一套解析。
const resolveSignalRTarget = (reqUrl) => {
  const u = new URL(reqUrl, "http://placeholder");
  const ip = u.searchParams.get("targetIp") || DEFAULT_HOST_BY_PORT["7284"];
  u.searchParams.delete("targetIp"); // 只給 proxy 用，不往後端送
  const path =
    u.pathname.replace(/^\/signalR\/7284/, "/notifyHub") + (u.search || "");
  return { ip, port: 7284, path };
};

// 一般 HTTP 轉發（/api 與 SignalR 的 negotiate / long-polling 都走這裡）
const forwardHttp = (req, res, host, port, path) => {
  const headers = { ...req.headers, host: `${host}:${port}` };
  delete headers["x-target-ip"];
  const proxyReq = http.request(
    { host, port, method: req.method, path, headers },
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
};

// WebSocket upgrade 轉發（SignalR 的 ws transport 走這裡）
const forwardWs = (req, clientSocket, head, host, port, path) => {
  const headers = { ...req.headers, host: `${host}:${port}` };
  delete headers["x-target-ip"];
  const proxyReq = http.request({ host, port, method: req.method || "GET", path, headers });

  proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
    // 把後端的 101 + headers 回給瀏覽器
    let resHead = `HTTP/1.1 ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n`;
    const raw = proxyRes.rawHeaders;
    for (let i = 0; i < raw.length; i += 2) resHead += `${raw[i]}: ${raw[i + 1]}\r\n`;
    resHead += "\r\n";
    clientSocket.write(resHead);

    if (proxyHead && proxyHead.length) clientSocket.write(proxyHead); // 後端先送的位元組
    if (head && head.length) proxySocket.write(head); // 瀏覽器先送的位元組

    proxySocket.pipe(clientSocket);
    clientSocket.pipe(proxySocket);

    const cleanup = () => {
      proxySocket.destroy();
      clientSocket.destroy();
    };
    proxySocket.on("error", cleanup);
    clientSocket.on("error", cleanup);
    proxySocket.on("close", () => clientSocket.destroy());
    clientSocket.on("close", () => proxySocket.destroy());
  });

  // 後端沒有 upgrade（例如回 404）→ 收掉連線
  proxyReq.on("response", () => clientSocket.destroy());
  proxyReq.on("error", () => clientSocket.destroy());
  proxyReq.end();
};

// ─────────────────────────────────────────────────────────
// dev-only 動態 proxy：
//   瀏覽器永遠只打 dev server（same-origin，無 CORS），再依目標 IP 動態轉發：
//     /api/7284|8031        → 目標 IP 來自 X-Target-IP header
//     /signalR/7284 (含 ws) → 目標 IP 來自 ?targetIp= query
//   沒指定 IP 時 fallback 到 env 預設主機。
// ─────────────────────────────────────────────────────────
const dynamicApiProxy = () => ({
  name: "dynamic-api-proxy",
  configureServer(server) {
    // 一般 HTTP：/api 與 SignalR negotiate / long-polling
    server.middlewares.use((req, res, next) => {
      const apiM = req.url && req.url.match(/^\/api\/(7284|8031)(?=\/|\?|$)/);
      if (apiM) {
        const { ip, port, path } = resolveApiTarget(req, apiM[1]);
        return forwardHttp(req, res, ip, port, path);
      }
      if (req.url && /^\/signalR\/7284(?=\/|\?|$)/.test(req.url)) {
        const { ip, port, path } = resolveSignalRTarget(req.url);
        return forwardHttp(req, res, ip, port, path);
      }
      return next();
    });

    // WebSocket upgrade：只接管 /signalR/7284，其餘(例如 Vite HMR)交回 Vite 處理
    server.httpServer?.on("upgrade", (req, socket, head) => {
      if (!req.url || !/^\/signalR\/7284(?=\/|\?|$)/.test(req.url)) return;
      const { ip, port, path } = resolveSignalRTarget(req.url);
      forwardWs(req, socket, head, ip, port, path);
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dynamicApiProxy()],
});
