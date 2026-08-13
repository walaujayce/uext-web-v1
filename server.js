// ─────────────────────────────────────────────────────────
// Production server（正式部署用，取代 Vite dev server）
//   1. 提供 vite build 產出的靜態檔（dist/），含 SPA fallback。
//   2. 沿用 dev proxy 的動態轉發邏輯，讓前端的相對路徑一樣可用：
//        /api/7284|8031        → 依 X-Target-IP header 轉發（否則走預設主機）
//        /signalR/7284（含 ws） → 依 ?targetIp= query 轉發到後端 /notifyHub
// 只用 Node 內建模組，不裝任何套件 → image 小、攻擊面小。
//
// 可用環境變數設定（部署時覆蓋）：
//   PORT               監聽埠（預設 8080）
//   WEBAPI_HOST        7284 沒帶 X-Target-IP 時的預設後端主機
//   SOCKETSERVER_HOST  8031 沒帶 X-Target-IP 時的預設後端主機
// ─────────────────────────────────────────────────────────
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT || 8080);

const WEBAPI_HOST = process.env.VITE_WEBAPI_URL || "192.168.100.200";
const SOCKETSERVER_HOST = process.env.VITE_SOCKETSERVER_URL || "192.168.100.200";
const DEFAULT_HOST_BY_PORT = { "7284": WEBAPI_HOST, "8031": SOCKETSERVER_HOST };

// 驗證使用者提供的轉發目標(X-Target-IP header / ?targetIp= query)：
// 只允許合法 IP/hostname 字元(英數、.、:、%(IPv6 zone)、-)，長度上限 253。
// 任何含 < > " ' ; 空白、腳本片段等注入字元的值都會不符 → 直接拒絕，
// 不讓使用者輸入進到 http.request 或任何回應(擋 Server-Side Script Injection)。
const HOST_RE = /^[A-Za-z0-9.:%-]{1,253}$/;
const isValidHost = (h) =>
  typeof h === "string" && h.length > 0 && HOST_RE.test(h);

// 我方自己產生的回應都帶的安全性 headers：
//   nosniff        → 禁止瀏覽器把回應內容猜成別的型別執行(擋反射型 XSS)
//   X-Frame-Options→ 防 clickjacking
//   Referrer-Policy→ 不外洩 referrer
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

// Content-Security-Policy（套在 index.html 這份文件上）：限制資源只能來自同源，
// 大幅降低 XSS 影響面。已針對本 App 需求放寬：
//   script 'unsafe-eval' 'wasm-unsafe-eval' → OpenCV.js 內部用 new Function()/WASM
//   style 'unsafe-inline' + fonts.googleapis → MUI/emotion 行內樣式 + Google Fonts 樣式表
//   font fonts.gstatic                        → Google Fonts 字型檔
//   connect 'self'                            → API 與 SignalR 都同源(經本 server 轉發)
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "media-src 'self'",
  // 'self' → API/SignalR(同源)；data: → OpenCV.js 用 fetch 載入內嵌的 WASM(data: URL)
  "connect-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

// ── 以下轉發邏輯與 vite.config.js 的 dynamicApiProxy 完全一致 ──
const rewriteApiPath = (port, url) =>
  port === "7284"
    ? url.replace(/^\/api\/7284/, "/api")
    : url.replace(/^\/api\/(8031)/, "/api/v1");

// 回傳 null 代表「使用者提供了非法的 target」→ 呼叫端應回 400 拒絕。
const resolveApiTarget = (req, port) => {
  const headerIp = req.headers["x-target-ip"];
  const raw = Array.isArray(headerIp) ? headerIp[0] : headerIp;
  if (raw && !isValidHost(raw)) return null; // 非法輸入 → 拒絕
  const ip = raw || DEFAULT_HOST_BY_PORT[port];
  return { ip, port: Number(port), path: rewriteApiPath(port, req.url) };
};

const resolveSignalRTarget = (reqUrl) => {
  const u = new URL(reqUrl, "http://placeholder");
  const raw = u.searchParams.get("targetIp");
  if (raw && !isValidHost(raw)) return null; // 非法輸入 → 拒絕
  const ip = raw || DEFAULT_HOST_BY_PORT["7284"];
  u.searchParams.delete("targetIp");
  const path =
    u.pathname.replace(/^\/signalR\/7284/, "/notifyHub") + (u.search || "");
  return { ip, port: 7284, path };
};

const forwardHttp = (req, res, host, port, path) => {
  const headers = { ...req.headers, host: `${host}:${port}` };
  delete headers["x-target-ip"];
  const proxyReq = http.request(
    { host, port, method: req.method, path, headers },
    (proxyRes) => {
      const outHeaders = { ...proxyRes.headers };
      // 後端若動態產生 Access-Control-Allow-Origin，補上 Vary: Origin，
      // 避免快取把某個 origin 的 CORS 回應拿去共用給別的 origin。
      if (outHeaders["access-control-allow-origin"]) {
        const vary = outHeaders["vary"];
        const list = vary
          ? String(vary)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        if (!list.some((v) => v.toLowerCase() === "origin")) {
          list.push("Origin");
        }
        outHeaders["vary"] = list.join(", ");
      }
      res.writeHead(proxyRes.statusCode || 502, outHeaders);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on("error", (err) => {
    // 細節只記在 server console；回給瀏覽器的內容不夾帶任何請求輸入(避免反射注入)
    console.error("api-proxy error:", err.message);
    if (!res.headersSent) {
      res.writeHead(502, {
        "content-type": "text/plain; charset=utf-8",
        ...SECURITY_HEADERS,
      });
    }
    res.end("Bad Gateway");
  });
  req.pipe(proxyReq);
};

const forwardWs = (req, clientSocket, head, host, port, path) => {
  const headers = { ...req.headers, host: `${host}:${port}` };
  delete headers["x-target-ip"];
  const proxyReq = http.request({
    host,
    port,
    method: req.method || "GET",
    path,
    headers,
  });

  proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
    let resHead = `HTTP/1.1 ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n`;
    const raw = proxyRes.rawHeaders;
    for (let i = 0; i < raw.length; i += 2)
      resHead += `${raw[i]}: ${raw[i + 1]}\r\n`;
    resHead += "\r\n";
    clientSocket.write(resHead);

    if (proxyHead && proxyHead.length) clientSocket.write(proxyHead);
    if (head && head.length) proxySocket.write(head);

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

  proxyReq.on("response", () => clientSocket.destroy());
  proxyReq.on("error", () => clientSocket.destroy());
  proxyReq.end();
};

// ── 靜態檔服務（dist/）+ SPA fallback ──
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".wasm": "application/wasm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp3": "audio/mpeg",
  ".map": "application/json; charset=utf-8",
};

const sendFile = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const isIndex = path.basename(filePath) === "index.html";
  const headers = {
    "content-type": MIME[ext] || "application/octet-stream",
    // index.html 不快取(才能拿到新版)；其餘(hash 檔名)長快取
    "cache-control": isIndex
      ? "no-cache"
      : "public, max-age=31536000, immutable",
    ...SECURITY_HEADERS,
  };
  // CSP 套在 HTML 文件上即可
  if (isIndex) headers["Content-Security-Policy"] = CONTENT_SECURITY_POLICY;
  res.writeHead(200, headers);
  fs.createReadStream(filePath)
    .on("error", () => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    })
    .pipe(res);
};

const serveStatic = (req, res) => {
  let urlPath = "/";
  try {
    urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  } catch {
    // 網址編碼錯誤 → 直接回 index.html，交給前端路由(不讓伺服器崩)
    return sendFile(res, path.join(DIST_DIR, "index.html"));
  }
  const filePath = path.join(DIST_DIR, path.normalize(urlPath));
  // 防目錄穿越
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, {
      "content-type": "text/plain; charset=utf-8",
      ...SECURITY_HEADERS,
    });
    res.end("Forbidden");
    return;
  }
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) return sendFile(res, filePath);
    // 找不到檔 → SPA fallback：回 index.html 讓 React Router 處理
    return sendFile(res, path.join(DIST_DIR, "index.html"));
  });
};

// ── HTTP server ──
const server = http.createServer((req, res) => {
  const badRequest = () => {
    res.writeHead(400, {
      "content-type": "text/plain; charset=utf-8",
      ...SECURITY_HEADERS,
    });
    res.end("Bad Request");
  };

  const apiM = req.url && req.url.match(/^\/api\/(7284|8031)(?=\/|\?|$)/);
  if (apiM) {
    const t = resolveApiTarget(req, apiM[1]);
    if (!t) return badRequest(); // 非法 X-Target-IP → 拒絕
    return forwardHttp(req, res, t.ip, t.port, t.path);
  }
  if (req.url && /^\/signalR\/7284(?=\/|\?|$)/.test(req.url)) {
    const t = resolveSignalRTarget(req.url);
    if (!t) return badRequest(); // 非法 targetIp → 拒絕
    return forwardHttp(req, res, t.ip, t.port, t.path);
  }
  return serveStatic(req, res);
});

// ── WebSocket upgrade（只接管 /signalR/7284）──
server.on("upgrade", (req, socket, head) => {
  if (!req.url || !/^\/signalR\/7284(?=\/|\?|$)/.test(req.url)) {
    socket.destroy();
    return;
  }
  const t = resolveSignalRTarget(req.url);
  if (!t) {
    socket.destroy(); // 非法 targetIp → 拒絕連線
    return;
  }
  forwardWs(req, socket, head, t.ip, t.port, t.path);
});

server.listen(PORT, () => {
  console.log(
    `[server] listening on :${PORT} | WEBAPI_HOST=${WEBAPI_HOST} SOCKETSERVER_HOST=${SOCKETSERVER_HOST}`,
  );
});
