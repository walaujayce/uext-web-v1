// ─────────────────────────────────────────────────────────
// Runtime 設定來源 —— 讓「同一份 build」可以部署到不同環境。
//
// 問題：import.meta.env.VITE_* 是 `vite build` 當下就被 Vite「字面替換」寫死進
//       dist/assets/index-xxxx.js 的常數，容器啟動時的 `docker run -e` 改不動它。
//
// 解法：正式環境由 server.js 在「啟動時」依 process.env 動態產生 /config.js
//       （內容 = window.__APP_CONFIG__ = {...}），index.html 在載入 module bundle
//       之前先用一般 <script> 載入它（classic script 一定早於 deferred module 執行）。
//       dev 模式下 vite.config.js 的 middleware 也會提供同一支 /config.js。
//
// 取值優先順序：
//   1. window.__APP_CONFIG__  ← runtime，來自 server 端 process.env（可用 -e 改）
//   2. import.meta.env        ← build time，僅作為 fallback
// ─────────────────────────────────────────────────────────

const runtimeCfg = () =>
  (typeof window !== "undefined" && window.__APP_CONFIG__) || {};

// build 時期的值（Vite 會在此處做字面替換，所以必須逐一列出，不能動態取 key）
const buildTimeCfg = {
  VITE_WEBAPI_URL: import.meta.env.VITE_WEBAPI_URL,
  VITE_SOCKETSERVER_URL: import.meta.env.VITE_SOCKETSERVER_URL,
  VITE_SIGNALR_ENABLE: import.meta.env.VITE_SIGNALR_ENABLE,
  VITE_MODE: import.meta.env.VITE_MODE,
};

// 空字串視同未設定，才能讓下一層 fallback 接手
const isEmpty = (v) => v === undefined || v === null || v === "";

export const getConfig = (key) => {
  const v = runtimeCfg()[key];
  return isEmpty(v) ? buildTimeCfg[key] : v;
};

// 把設定值解析成「要放進 X-Target-IP 的主機」
//   - 空 / 未設定 → null（不帶 header，交給 server 端的預設主機決定）
//   - "localhost" → 用瀏覽器目前的 host
const resolveHost = (raw) => {
  if (isEmpty(raw)) return null;
  if (raw === "localhost") return window.location.hostname;
  return raw;
};

export const getWebApiIp = () => resolveHost(getConfig("VITE_WEBAPI_URL"));
export const getSocketServerIp = () =>
  resolveHost(getConfig("VITE_SOCKETSERVER_URL"));
export const isSignalREnabled = () =>
  String(getConfig("VITE_SIGNALR_ENABLE")) === "true";
export const getAppMode = () => getConfig("VITE_MODE");

// debug 用：一次看到 build time 與 runtime 兩層的值
export const getAllConfig = () => ({
  buildTime: { ...buildTimeCfg },
  runtime: { ...runtimeCfg() },
  effective: {
    VITE_WEBAPI_URL: getConfig("VITE_WEBAPI_URL"),
    VITE_SOCKETSERVER_URL: getConfig("VITE_SOCKETSERVER_URL"),
    VITE_SIGNALR_ENABLE: getConfig("VITE_SIGNALR_ENABLE"),
    VITE_MODE: getConfig("VITE_MODE"),
  },
  resolvedWebApiIp: getWebApiIp(),
});
