import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
// 取名 nodePath：底下有函式用 `const path = ...` 當區域變數，避免混淆
import nodePath from "node:path";

const MODE = process.env.NODE_ENV || "development";

// dev 端讀 .env（loadEnv 會把 .env 檔 + process.env 的 VITE_* 合併，process.env 優先）
const devEnv = loadEnv(MODE, process.cwd(), "VITE_");

// 前綴給空字串 → 連沒有 VITE_ 前綴的變數也讀得到（例如 SERVER_TLS_*）。
// 這份只在 Node 端使用，不會被塞進前端 bundle（只有 VITE_ 開頭的才會）。
const nodeEnv = loadEnv(MODE, process.cwd(), "");

// .env 裡的憑證路徑可以寫相對路徑（相對於專案根目錄），例如 ./certs/server.crt。
// 這樣憑證放進專案的 certs/ 之後，dev 與容器裡用同一組設定值就能通用。
const PROJECT_ROOT = process.cwd();
const resolveFromRoot = (p) => (p ? nodePath.resolve(PROJECT_ROOT, p) : "");

// .env 的值一律是字串：'false' / '' / undefined 都要當成 false
const asBool = (v, dflt = false) =>
  v === undefined || v === null || v === ""
    ? dflt
    : String(v).toLowerCase() === "true";

// 註：原本這裡在 start:dev 分支寫了 window.location.hostname，但 vite.config.js 是在
// Node 端執行的，沒有 window → 會直接拋錯。改成只在 Node 能判斷的範圍內解析，
// "localhost" 交給瀏覽器端(runtimeConfig)處理。
const resolveDefaultHost = (raw) =>
  !raw || raw === "localhost" ? "192.168.100.200" : raw;

const WebAPI = resolveDefaultHost(devEnv.VITE_WEBAPI_URL);
const SocketServer = resolveDefaultHost(devEnv.VITE_SOCKETSERVER_URL);

// ─────────────────────────────────────────────────────────
// WebAPI 的協定 / port 切換
//
//   VITE_USE_HTTPS='false'(預設) → http  + 7284   ← 原本的行為
//   VITE_USE_HTTPS='true'        → https + 8081
//
// ⚠ 重點：網址裡的 "7284"（/api/7284/*、/signalR/7284）只是**路由標籤**，
//   不是真實 port。瀏覽器永遠只打同源的這個標籤，真正連哪個 port / 用什麼協定
//   由這裡決定。所以切換 https 時，src/ 底下那上百處 /api/7284/... 完全不用動。
//
// TLS 驗證：Node 不會讀作業系統的憑證存放區，所以你在 Windows 安裝的 rootCA.crt
//   對這支 proxy 是無效的。要驗證自簽憑證，設定：
//     VITE_TLS_REJECT_UNAUTHORIZED='true'
//     SERVER_TLS_CA='./certs/rootCA.crt'   ← 我們自己讀檔並帶進請求
//   （憑證的 SAN 必須包含你連線用的那個 IP）
//   不想驗證就把 VITE_TLS_REJECT_UNAUTHORIZED 留 'false'。
//
//   註：以前要用 NODE_EXTRA_CA_CERTS 是因為那是 Node 啟動時才讀的變數，
//   放進 .env 來不及生效；改成 SERVER_TLS_CA 由我們自己讀檔後，就能寫在 .env 裡。
// ─────────────────────────────────────────────────────────
const USE_HTTPS = asBool(devEnv.VITE_USE_HTTPS, false);
const TLS_REJECT_UNAUTHORIZED = asBool(
  devEnv.VITE_TLS_REJECT_UNAUTHORIZED,
  false,
);

// 自訂 CA（rootCA.crt）。只在需要驗證時才有意義。
const TLS_CA = (() => {
  const caPath = resolveFromRoot(nodeEnv.SERVER_TLS_CA);
  if (!caPath) return undefined;
  try {
    return fs.readFileSync(caPath);
  } catch (err) {
    console.warn(`[vite] 讀取 SERVER_TLS_CA 失敗（將略過）：${err.message}`);
    return undefined;
  }
})();

// 路徑標籤 → 實際要連的後端（host 為「沒帶 X-Target-IP 時」的 fallback）
const TARGET_BY_LABEL = {
  "7284": {
    host: WebAPI,
    port: USE_HTTPS ? 8081 : 7284,
    https: USE_HTTPS,
  },
  // SocketServer 維持 http:8031，不受 VITE_USE_HTTPS 影響
  "8031": { host: SocketServer, port: 8031, https: false },
};

// /api/<label>/* 的路徑改寫（與原本 server.proxy 的 rewrite 規則一致）
// 新後端仍保留 /api 前綴，所以這裡不用改。
const rewriteApiPath = (label, url) =>
  label === "7284"
    ? url.replace(/^\/api\/7284/, "/api")
    : url.replace(/^\/api\/(8031)/, "/api/v1");

// 解析 /api/<label>/* 請求 → 目標 host(來自 X-Target-IP header) / port / 協定 / path
const resolveApiTarget = (req, label) => {
  const t = TARGET_BY_LABEL[label];
  const headerIp = req.headers["x-target-ip"];
  const ip = (Array.isArray(headerIp) ? headerIp[0] : headerIp) || t.host;
  return {
    ip,
    port: t.port,
    https: t.https,
    path: rewriteApiPath(label, req.url),
  };
};

// 解析 /signalR/7284* 請求 → 目標 host(來自 targetIp query) / WebAPI 的 port / path(/notifyHub)
// negotiate(HTTP) 與 ws 握手都會帶 query，故兩邊共用同一套解析。
// USE_HTTPS 時自動變成 https negotiate + wss。
const resolveSignalRTarget = (reqUrl) => {
  const t = TARGET_BY_LABEL["7284"];
  const u = new URL(reqUrl, "http://placeholder");
  const ip = u.searchParams.get("targetIp") || t.host;
  u.searchParams.delete("targetIp"); // 只給 proxy 用，不往後端送
  const path =
    u.pathname.replace(/^\/signalR\/7284/, "/notifyHub") + (u.search || "");
  return { ip, port: t.port, https: t.https, path };
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

// 一般 HTTP 轉發（/api 與 SignalR 的 negotiate / long-polling 都走這裡）
const forwardHttp = (req, res, host, port, path, useHttps) => {
  const headers = { ...req.headers, host: `${host}:${port}` };
  delete headers["x-target-ip"];
  const proxyReq = requestModule(useHttps).request(
    requestOptions(useHttps, { host, port, method: req.method, path, headers }),
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
    // 一般 HTTP：/config.js、/api 與 SignalR negotiate / long-polling
    server.middlewares.use((req, res, next) => {
      // 與 server.js 同一支 /config.js，讓 dev 與正式環境行為一致
      // （dev 沒有這支的話，index.html 的 <script src="/config.js"> 會 404）
      if (req.url && req.url.split("?")[0] === "/config.js") {
        const cfg = {
          VITE_WEBAPI_URL: devEnv.VITE_WEBAPI_URL ?? "",
          VITE_SOCKETSERVER_URL: devEnv.VITE_SOCKETSERVER_URL ?? "",
          VITE_SIGNALR_ENABLE: devEnv.VITE_SIGNALR_ENABLE ?? "false",
          VITE_MODE: devEnv.VITE_MODE ?? "",
          // 前端不需要這個值（協定切換完全在 proxy 端），純粹方便在
          // console 用 __APP_CONFIG__ 確認目前跑在哪個模式
          VITE_USE_HTTPS: String(USE_HTTPS),
        };
        res.writeHead(200, {
          "content-type": "text/javascript; charset=utf-8",
          "cache-control": "no-store",
        });
        res.end(
          `window.__APP_CONFIG__=${JSON.stringify(cfg).replace(/</g, "\\u003c")};\n`,
        );
        return;
      }

      const apiM = req.url && req.url.match(/^\/api\/(7284|8031)(?=\/|\?|$)/);
      if (apiM) {
        const { ip, port, https: useHttps, path } = resolveApiTarget(
          req,
          apiM[1],
        );
        return forwardHttp(req, res, ip, port, path, useHttps);
      }
      if (req.url && /^\/signalR\/7284(?=\/|\?|$)/.test(req.url)) {
        const { ip, port, https: useHttps, path } = resolveSignalRTarget(
          req.url,
        );
        return forwardHttp(req, res, ip, port, path, useHttps);
      }
      return next();
    });

    // WebSocket upgrade：只接管 /signalR/7284，其餘(例如 Vite HMR)交回 Vite 處理
    server.httpServer?.on("upgrade", (req, socket, head) => {
      if (!req.url || !/^\/signalR\/7284(?=\/|\?|$)/.test(req.url)) return;
      const { ip, port, https: useHttps, path } = resolveSignalRTarget(req.url);
      forwardWs(req, socket, head, ip, port, path, useHttps);
    });

    // 啟動時把目前的轉發設定印出來，一眼確認跑在哪個模式
    const t = TARGET_BY_LABEL["7284"];
    console.log(
      `[dynamic-api-proxy] WebAPI → ${t.https ? "https" : "http"}://${t.host}:${t.port}` +
        (t.https
          ? `  (TLS 驗證: ${TLS_REJECT_UNAUTHORIZED ? "開啟" : "關閉"})`
          : ""),
    );
  },
});

// ─────────────────────────────────────────────────────────
// VITE_USE_HTTPS 一個開關同時決定「兩段連線」的協定：
//
//     瀏覽器 ──(A)──▶ vite dev server ──(B)──▶ WebAPI
//
//   VITE_USE_HTTPS='false' → (A) http://localhost:5173   (B) http://<ip>:7284
//   VITE_USE_HTTPS='true'  → (A) https://localhost:5173  (B) https://<ip>:8081
//
// 為什麼要綁在一起：後端的 BuildRefreshCookieOptions 是 Secure = Request.IsHttps。
// (B) 走 TLS 時後端就會發出 Secure 的 refreshToken cookie，而瀏覽器在 http 頁面
// 會拒收它 → /auth/refresh 永遠讀不到 → 一路 401。兩段必須同進同出。
//
// true 時需要站台憑證（SERVER_TLS_CERT / SERVER_TLS_KEY），
// 讀不到就直接停，不會默默退回 http。
//   註：這張憑證的 SAN 必須包含你連線用的名稱（localhost / 127.0.0.1 / 本機 IP），
//       不能直接沿用後端 8081 那張（那張的 SAN 只有後端 IP）。
// ─────────────────────────────────────────────────────────
const loadDevServerHttps = () => {
  if (!USE_HTTPS) return undefined; // http 模式 → 站台也走 http

  const certPath = resolveFromRoot(nodeEnv.SERVER_TLS_CERT);
  const keyPath = resolveFromRoot(nodeEnv.SERVER_TLS_KEY);
  if (!certPath || !keyPath) {
    console.error(
      "[vite] VITE_USE_HTTPS=true 但沒有設定站台憑證。\n" +
        "       請在 .env 補上（路徑可相對於專案根目錄）：\n" +
        "         SERVER_TLS_CERT=./certs/dev.crt\n" +
        "         SERVER_TLS_KEY=./certs/dev.key",
    );
    process.exit(1);
  }

  try {
    const opts = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };
    if (nodeEnv.SERVER_TLS_PASSPHRASE) {
      opts.passphrase = nodeEnv.SERVER_TLS_PASSPHRASE;
    }
    return opts;
  } catch (err) {
    console.error(
      `[vite] 讀取 TLS 憑證失敗：${err.message}\n` +
        `       SERVER_TLS_CERT=${certPath}\n` +
        `       SERVER_TLS_KEY=${keyPath}`,
    );
    process.exit(1);
  }
};

// https://vite.dev/config/
//
// ⚠ 用函式形式（而不是直接給物件）是必要的：憑證只在「真的要跑 dev server」
//   時才需要讀。`vite build`（含 docker build）不需要 dev server 的憑證，
//   若在設定檔載入時就無條件讀檔，容器裡讀不到 Windows 路徑就會讓 build 整個失敗。
export default defineConfig(({ command }) => {
  // command: "serve"(npm run dev) | "build"(vite build)
  const devServerHttps = command === "serve" ? loadDevServerHttps() : undefined;

  if (command === "serve") {
    console.log(
      devServerHttps
        ? `[vite] dev server (A) → https  (cert: ${resolveFromRoot(nodeEnv.SERVER_TLS_CERT)})`
        : "[vite] dev server (A) → http   (VITE_USE_HTTPS=false)",
    );
  }

  return {
    plugins: [react(), dynamicApiProxy()],
    server: {
      // 有憑證才是 https；undefined 時 vite 維持原本的 http（預設行為不變）
      https: devServerHttps,
      // 關掉 dev 模式的錯誤覆蓋層(那個紅色全螢幕堆疊)，
      // 避免開發/展示時把底層實作資訊蓋在畫面上。
      // 註：此覆蓋層本來就只有 dev(npm run dev)才有，正式 build 不會出現。
      hmr: { overlay: false },
    },
  };
});
