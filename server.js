// ─────────────────────────────────────────────────────────
// Production server（正式部署用，取代 Vite dev server）
//   1. 提供 vite build 產出的靜態檔（dist/），含 SPA fallback。
//   2. 沿用 dev proxy 的動態轉發邏輯，讓前端的相對路徑一樣可用：
//        /api/7284|8031        → 依 X-Target-IP header 轉發（否則走預設主機）
//        /signalR/7284（含 ws） → 依 ?targetIp= query 轉發到後端 /notifyHub
// 只用 Node 內建模組，不裝任何套件 → image 小、攻擊面小。
//
// 可用環境變數設定（部署時覆蓋）：
//   PORT                          監聽埠（預設 8080）
//   VITE_WEBAPI_URL               WebAPI 沒帶 X-Target-IP 時的預設後端主機
//   VITE_SOCKETSERVER_URL         8031 沒帶 X-Target-IP 時的預設後端主機
//   VITE_USE_HTTPS                'true' → WebAPI 走 https:8081；否則 http:7284
//   VITE_TLS_REJECT_UNAUTHORIZED  'true' → 驗證後端 TLS 憑證（自簽請留 false）
// ─────────────────────────────────────────────────────────
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT || 8080);

// 環境變數一律是字串：'false' / '' / undefined 都要當成 false
const asBool = (v, dflt = false) =>
  v === undefined || v === null || v === ""
    ? dflt
    : String(v).toLowerCase() === "true";

const WEBAPI_HOST = process.env.VITE_WEBAPI_URL || "192.168.100.200";
const SOCKETSERVER_HOST = process.env.VITE_SOCKETSERVER_URL || "192.168.100.200";

// ─────────────────────────────────────────────────────────
// WebAPI 的協定 / port 切換（與 vite.config.js 的邏輯必須一致）
//
//   VITE_USE_HTTPS='false'(預設) → http  + 7284   ← 原本的行為
//   VITE_USE_HTTPS='true'        → https + 8081
//
// ⚠ 網址裡的 "7284"（/api/7284/*、/signalR/7284）只是**路由標籤**，不是真實 port。
//   所以切換 https 時，前端那上百處 /api/7284/... 完全不用動。
//
// TLS 驗證：Node 不讀作業系統的憑證存放區。要驗證自簽憑證，設定：
//   VITE_TLS_REJECT_UNAUTHORIZED=true
//   SERVER_TLS_CA=./certs/rootCA.crt   ← 我們自己讀檔並帶進請求
// （憑證 SAN 必須包含你連線用的那個 IP）不想驗證就留 false。
// ─────────────────────────────────────────────────────────
const USE_HTTPS = asBool(process.env.VITE_USE_HTTPS, false);
const TLS_REJECT_UNAUTHORIZED = asBool(
  process.env.VITE_TLS_REJECT_UNAUTHORIZED,
  false,
);

// 憑證路徑可以寫相對路徑；相對的基準是 server.js 所在目錄（容器內即 /app）。
const resolveFromRoot = (p) => (p ? path.resolve(__dirname, p) : "");

// 自訂 CA（rootCA.crt）。只在需要驗證時才有意義。
const TLS_CA = (() => {
  const caPath = resolveFromRoot(process.env.SERVER_TLS_CA);
  if (!caPath) return undefined;
  try {
    return fs.readFileSync(caPath);
  } catch (err) {
    console.warn(`[server] 讀取 SERVER_TLS_CA 失敗（將略過）：${err.message}`);
    return undefined;
  }
})();

const TARGET_BY_LABEL = {
  "7284": {
    host: WEBAPI_HOST,
    port: USE_HTTPS ? 8081 : 7284,
    https: USE_HTTPS,
  },
  // SocketServer 維持 http:8031，不受 VITE_USE_HTTPS 影響
  "8031": { host: SOCKETSERVER_HOST, port: 8031, https: false },
};

// 依目標協定挑 http / https，並在 https 時帶上自簽憑證的處理
const requestOptions = (useHttps, opts) =>
  useHttps
    ? {
        ...opts,
        rejectUnauthorized: TLS_REJECT_UNAUTHORIZED,
        ...(TLS_CA ? { ca: TLS_CA } : {}),
      }
    : opts;
const requestModule = (useHttps) => (useHttps ? https : http);

// DEBUG_PROXY=1 → 把每筆 /api 轉發的 X-Target-IP 與最終目標印到 server console
const DEBUG_PROXY = process.env.DEBUG_PROXY === "1";

// ─────────────────────────────────────────────────────────
// Runtime 設定注入：/config.js
//
// import.meta.env.VITE_* 是 vite build 當下就寫死進 bundle 的常數，
// `docker run -e` 改不動它。因此改由本 server 在「每次請求時」依 process.env
// 產生一小段 JS，index.html 會在載入 bundle 之前先載入它。
// 前端統一透過 src/config/runtimeConfig.js 讀取（runtime 優先，build time 為 fallback）。
//
// 改設定 = 改 -e + 重啟容器，不需要重新 build image。
// ─────────────────────────────────────────────────────────
const buildRuntimeConfigJs = () => {
  const cfg = {
    VITE_WEBAPI_URL: process.env.VITE_WEBAPI_URL ?? "",
    VITE_SOCKETSERVER_URL: process.env.VITE_SOCKETSERVER_URL ?? "",
    VITE_SIGNALR_ENABLE: process.env.VITE_SIGNALR_ENABLE ?? "false",
    VITE_MODE: process.env.VITE_MODE ?? "",
    // 前端不需要這個值（協定切換完全在 proxy 端），純粹方便在
    // console 用 __APP_CONFIG__ 確認目前跑在哪個模式
    VITE_USE_HTTPS: String(USE_HTTPS),
  };
  // JSON.stringify 已足以跳脫字串內容；再擋掉 </script> 以防萬一被塞進 HTML
  const json = JSON.stringify(cfg).replace(/</g, "\\u003c");
  return `window.__APP_CONFIG__=${json};\n`;
};

const serveRuntimeConfig = (res) => {
  const body = buildRuntimeConfigJs();
  res.writeHead(200, {
    "content-type": "text/javascript; charset=utf-8",
    // 一定要 no-store：否則瀏覽器/中間快取會拿舊環境的設定
    "cache-control": "no-store, no-cache, must-revalidate",
    ...SECURITY_HEADERS,
  });
  res.end(body);
};

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
// 新後端仍保留 /api 前綴，所以路徑改寫規則不變。
const rewriteApiPath = (label, url) =>
  label === "7284"
    ? url.replace(/^\/api\/7284/, "/api")
    : url.replace(/^\/api\/(8031)/, "/api/v1");

// 回傳 null 代表「使用者提供了非法的 target」→ 呼叫端應回 400 拒絕。
const resolveApiTarget = (req, label) => {
  const t = TARGET_BY_LABEL[label];
  const headerIp = req.headers["x-target-ip"];
  const raw = Array.isArray(headerIp) ? headerIp[0] : headerIp;
  if (raw && !isValidHost(raw)) return null; // 非法輸入 → 拒絕
  const ip = raw || t.host;
  return {
    ip,
    port: t.port,
    https: t.https,
    path: rewriteApiPath(label, req.url),
  };
};

const resolveSignalRTarget = (reqUrl) => {
  const t = TARGET_BY_LABEL["7284"];
  const u = new URL(reqUrl, "http://placeholder");
  const raw = u.searchParams.get("targetIp");
  if (raw && !isValidHost(raw)) return null; // 非法輸入 → 拒絕
  const ip = raw || t.host;
  u.searchParams.delete("targetIp");
  const path =
    u.pathname.replace(/^\/signalR\/7284/, "/notifyHub") + (u.search || "");
  return { ip, port: t.port, https: t.https, path };
};

const forwardHttp = (req, res, host, port, path, useHttps) => {
  const headers = { ...req.headers, host: `${host}:${port}` };
  delete headers["x-target-ip"];
  const proxyReq = requestModule(useHttps).request(
    requestOptions(useHttps, { host, port, method: req.method, path, headers }),
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

const forwardWs = (req, clientSocket, head, host, port, path, useHttps) => {
  const headers = { ...req.headers, host: `${host}:${port}` };
  delete headers["x-target-ip"];
  // useHttps 時這裡就是 wss：TLS 之上再做 HTTP upgrade
  const proxyReq = requestModule(useHttps).request(
    requestOptions(useHttps, {
      host,
      port,
      method: req.method || "GET",
      path,
      headers,
    }),
  );

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

// ─────────────────────────────────────────────────────────
// VITE_USE_HTTPS 一個開關同時決定「兩段連線」的協定（與 vite.config.js 一致）：
//
//     瀏覽器 ──(A)──▶ 本 server ──(B)──▶ WebAPI
//
//   VITE_USE_HTTPS=false → (A) http://<host>:PORT   (B) http://<ip>:7284
//   VITE_USE_HTTPS=true  → (A) https://<host>:PORT  (B) https://<ip>:8081
//
// 為什麼要綁在一起：後端的 BuildRefreshCookieOptions 是 Secure = Request.IsHttps。
// (B) 走 TLS 時後端就會發出 Secure 的 refreshToken cookie，而瀏覽器在 http 頁面
// 會拒收它 → /auth/refresh 永遠讀不到 → 一路 401。兩段必須同進同出。
//
// true 時需要站台憑證，缺少或讀不到都直接結束，不會默默退回 http：
//   SERVER_TLS_CERT        憑證檔路徑（PEM，可含中繼憑證鏈）
//   SERVER_TLS_KEY         私鑰檔路徑（PEM）
//   SERVER_TLS_PASSPHRASE  私鑰密碼（有加密才需要）
// 憑證的 SAN 必須包含使用者實際連線用的名稱／IP。
// ─────────────────────────────────────────────────────────
const TLS_CERT_PATH = resolveFromRoot(process.env.SERVER_TLS_CERT);
const TLS_KEY_PATH = resolveFromRoot(process.env.SERVER_TLS_KEY);

const loadServerTls = () => {
  if (!USE_HTTPS) return null; // http 模式 → 站台也走 http

  if (!TLS_CERT_PATH || !TLS_KEY_PATH) {
    console.error(
      "[server] VITE_USE_HTTPS=true 但沒有設定站台憑證。\n" +
        "         請提供（路徑可相對於 server.js 所在目錄，容器內即 /app）：\n" +
        "           -e SERVER_TLS_CERT=./certs/server.crt\n" +
        "           -e SERVER_TLS_KEY=./certs/server.key\n" +
        "         並記得把憑證掛進容器：-v /path/to/certs:/app/certs:ro",
    );
    process.exit(1);
  }

  try {
    const opts = {
      cert: fs.readFileSync(TLS_CERT_PATH),
      key: fs.readFileSync(TLS_KEY_PATH),
    };
    if (process.env.SERVER_TLS_PASSPHRASE) {
      opts.passphrase = process.env.SERVER_TLS_PASSPHRASE;
    }
    return opts;
  } catch (err) {
    // 讀不到就直接讓它爆，不要默默退回 http ——
    // 否則你以為站台是 https，實際上是 http，Secure cookie 會整個失效。
    console.error(
      `[server] 讀取 TLS 憑證失敗：${err.message}\n` +
        `         SERVER_TLS_CERT=${TLS_CERT_PATH}\n` +
        `         SERVER_TLS_KEY=${TLS_KEY_PATH}`,
    );
    process.exit(1);
  }
};

const serverTls = loadServerTls();
const SITE_IS_HTTPS = Boolean(serverTls);

const requestHandler = (req, res) => {
  const badRequest = () => {
    res.writeHead(400, {
      "content-type": "text/plain; charset=utf-8",
      ...SECURITY_HEADERS,
    });
    res.end("Bad Request");
  };

  // runtime 設定（必須排在靜態檔之前）
  if (req.url && req.url.split("?")[0] === "/config.js") {
    return serveRuntimeConfig(res);
  }

  const apiM = req.url && req.url.match(/^\/api\/(7284|8031)(?=\/|\?|$)/);
  if (apiM) {
    const t = resolveApiTarget(req, apiM[1]);
    if (DEBUG_PROXY) {
      const raw = req.headers["x-target-ip"];
      console.log(
        `[proxy] ${req.method} ${req.url} | X-Target-IP=${raw ?? "(未帶)"} → ${
          t
            ? `${t.https ? "https" : "http"}://${t.ip}:${t.port}${t.path}`
            : "REJECTED(非法 host)"
        }`,
      );
    }
    if (!t) return badRequest(); // 非法 X-Target-IP → 拒絕
    return forwardHttp(req, res, t.ip, t.port, t.path, t.https);
  }
  if (req.url && /^\/signalR\/7284(?=\/|\?|$)/.test(req.url)) {
    const t = resolveSignalRTarget(req.url);
    if (!t) return badRequest(); // 非法 targetIp → 拒絕
    return forwardHttp(req, res, t.ip, t.port, t.path, t.https);
  }
  return serveStatic(req, res);
};

// 有憑證 → https server；沒有 → 維持原本的 http server
const server = SITE_IS_HTTPS
  ? https.createServer(serverTls, requestHandler)
  : http.createServer(requestHandler);

// ── WebSocket upgrade（只接管 /signalR/7284）──
// 註：https server 的 upgrade 事件用法與 http server 完全相同，
//     瀏覽器端會自動從 ws:// 變成 wss://（SignalR 依頁面協定決定）。
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
  forwardWs(req, socket, head, t.ip, t.port, t.path, t.https);
});

server.listen(PORT, () => {
  const w = TARGET_BY_LABEL["7284"];
  const scheme = SITE_IS_HTTPS ? "https" : "http";
  console.log(
    `[server] 站台 (A) → ${scheme}://<host>:${PORT}` +
      (SITE_IS_HTTPS
        ? `  (cert: ${TLS_CERT_PATH})`
        : "  (VITE_USE_HTTPS=false)"),
  );
  console.log(
    `[server] listening on :${PORT} | WEBAPI_HOST=${WEBAPI_HOST} SOCKETSERVER_HOST=${SOCKETSERVER_HOST}`,
  );
  console.log(
    `[server] WebAPI → ${w.https ? "https" : "http"}://${w.host}:${w.port}` +
      (w.https
        ? `  (TLS 驗證: ${TLS_REJECT_UNAUTHORIZED ? "開啟" : "關閉"})`
        : ""),
  );
  console.log(`[server] /config.js → ${buildRuntimeConfigJs().trim()}`);
  // 註：(A) 與 (B) 現在都由 VITE_USE_HTTPS 決定，不會再出現
  //     「站台 http + 後端 https」這種讓 Secure cookie 失效的組合。
});
