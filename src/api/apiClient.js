import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  isTokenExpired,
} from "../auth/authStore";
import { getCurrentServerIp } from "./serverStore";
import { getWebApiIp } from "../config/runtimeConfig";

const api = axios.create({
//   baseURL: import.meta.env.VITE_WEBAPI_URL || "/api",
  withCredentials: true, // ⬅ refresh token cookie
});

// 另開一支乾淨的 axios 實例給 /refresh 使用，避免被攔截器再次攔截造成遞迴
const refreshClient = axios.create({
  withCredentials: true,
});

// auth 相關端點（login / refresh）一律只打設定檔指定的 WebAPI 主機，
// 不能隨目前選取的樓層 IP 改變（登入頁尤其如此）。
//
// 值的來源改由 runtimeConfig 決定（runtime /config.js 優先，build time 為 fallback），
// 且改成「每次請求才取值」而不是模組載入時取一次 —— 這樣 /config.js 何時載入都不影響。
//   - 有設定且非 localhost → 用該值
//   - "localhost" → 用瀏覽器目前 host
//   - 未設定 → null（不帶 header，走 server 端預設主機）
const isAuthUrl = (url) => /^\/api\/7284\/auth(\/|$)/.test(url);

// ─────────────────────────────────────────────────────────
// 依「目前選取樓層/區域的 IP」決定要打哪台後端。
//
// 為了避免瀏覽器直接跨來源打 IP 造成 CORS，這裡「不」改 baseURL，
// 而是維持相對路徑 /api/<port>/*（瀏覽器仍只打 dev server，same-origin），
// 只把目標 IP 放在 X-Target-IP header。實際轉發由 vite.config.js 的
// dynamic-api-proxy middleware 在伺服器端完成（含 /api/<port> 的路徑改寫）。
//
// 若尚未選取 IP（getCurrentServerIp() 為 null）→ 不帶 header，
// proxy 會 fallback 到 env 預設 IP（例如登入前抓 /api/7284/IpAddress/all）。
//
// 注意：此機制僅在 dev（vite dev server）有效；production build 沒有這個 middleware，
// 仍需後端 CORS 或佈署端反向代理。
// ─────────────────────────────────────────────────────────
const applyTargetHeader = (config) => {
  if (!config.url) return config;
  if (!/^\/api\/(7284)(\/|$)/.test(config.url)) return config; // 其他路徑不動

  // auth 端點（login / refresh）：一律打設定的 WebAPI 主機，不看目前選取的 server IP。
  if (isAuthUrl(config.url)) {
    const webApiIp = getWebApiIp();
    if (webApiIp) {
      config.headers = config.headers || {};
      config.headers["X-Target-IP"] = webApiIp;
    }
    // 沒解析到 → 不帶 header，proxy 會 fallback 到預設(WebAPI)主機
    return config;
  }

  // 明確指定的 config.targetIp 優先（讓呼叫端把整批請求釘在同一台，
  // 不受期間使用者切換樓層影響）；否則才讀目前選取的 IP。
  const ip = config.targetIp ?? getCurrentServerIp();
  if (!ip) return config; // 尚未選取 → 不帶 header，走 proxy 預設

  config.headers = config.headers || {};
  config.headers["X-Target-IP"] = ip;
  return config;
};

// refresh 請求也帶上目前選取的 IP
refreshClient.interceptors.request.use(applyTargetHeader);

const REFRESH_URL = "/api/7284/auth/refresh";

// 統一做「清整個登入狀態 + 導向 /login」
// 注意：AuthContext 及 PrivateRoute 是靠 localStorage.isAuthenticated 判斷登入狀態，
// 只清 accessToken 會造成 /login -> /home -> 401 -> /login 的輪迴。
const clearSession = () => {
  clearAccessToken();
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("role");
  localStorage.clear();
};

// 登入頁的路徑是 "/"（見 App.jsx 的 <Route path="/" element={<Login />} />），
// 不是 "/login"。原本導去 /login 會落到 wildcard 再被 <Navigate to="/" /> 轉一次。
const LOGIN_PATH = "/";

const redirectToLogin = () => {
  clearSession();
  // 用 replace 避免在歷史紀錄中累積
  if (window.location.pathname !== LOGIN_PATH) {
    window.location.replace(LOGIN_PATH);
  }
};

// ─────────────────────────────────────────────────────────
// Refresh 的單一入口（同一時間只會有一個 /auth/refresh 在飛）。
//
// 之前 refresh 只會在「某個請求收到 401」時才被觸發，所以：
//   - 停在 Device 頁一直輪詢 → 有請求 → 收到 401 → refresh → 續命 ✅
//   - 停在 Alert 頁沒有請求 → token 靜靜過期 → 切頁時 PrivateRoute 直接判定
//     過期並導回登入頁，全程沒有任何請求 → 沒機會 refresh ❌
// 抽成獨立函式後，路由守衛(PrivateRoute)與 App 啟動時也能主動呼叫。
// ─────────────────────────────────────────────────────────
let refreshPromise = null;

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    // 用 refreshClient 送，不會被 api 的 response interceptor 再攔一次造成遞迴
    refreshPromise = refreshClient
      .post(REFRESH_URL)
      .then((res) => {
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// 確保手上有「還沒過期」的 access token：
//   - 沒過期            → 直接回傳現有 token
//   - 過期/不存在       → 先 refresh，成功回傳新 token
//   - refresh 也失敗    → 回傳 null（呼叫端自行決定要不要導回登入頁）
// 這個函式不會自己導頁，方便 UI 端決定要顯示 loading 還是跳轉。
export const ensureAccessToken = async () => {
  if (!isTokenExpired()) return getAccessToken();
  try {
    return await refreshAccessToken();
  } catch (err) {
    // refresh token 也過期/被撤銷 → 清掉本地 session（但不強制整頁跳轉）
    if (err.response?.status === 401) {
      clearSession();
    } else {
      clearAccessToken();
    }
    return null;
  }
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  // console.log("token: ", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // console.log("config: ", config);

  // 依目前選取的樓層/區域 IP，帶上 X-Target-IP header 給 dev proxy 用
  return applyTargetHeader(config);
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // 登入 / refresh 端點本身的 401 不要走「refresh + 導回登入」流程：
    // 登入密碼錯誤本來就會回 401，若還去 refresh→失敗→redirectToLogin 會整頁重整。
    // 這類 401 直接 reject，交給呼叫端（登入頁）自己顯示錯誤訊息。
    const reqUrl = originalRequest?.url || "";
    const isAuthEndpoint = /\/auth\/(login|refresh)/.test(reqUrl);

    // 沒有 response（例如網路斷線）或非 401、或是 auth 端點 → 直接 reject
    if (
      !error.response ||
      error.response.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // 併發的 401 會共用同一個 refreshPromise，不會打出多支 /auth/refresh；
      // 後到的請求 await 同一個 promise，拿到新 token 後各自重送。
      const newToken = await refreshAccessToken();

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (err) {
      // refresh token 也過期 → 強制回登入頁（整個 session 清掉）
      if (err.response?.status === 401) {
        redirectToLogin();
      } else {
        // 其他錯誤（例如 500、網路問題）只清 token，保留 isAuthenticated 讓使用者自己重試
        clearAccessToken();
      }

      return Promise.reject(err);
    }
  }
);

export default api;


