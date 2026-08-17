import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "../auth/authStore";
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

const redirectToLogin = () => {
  clearSession();
  // 用 replace 避免在歷史紀錄中累積
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
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

let isRefreshing = false;
let refreshQueue = [];

const flushQueue = (error, newToken = null) => {
  refreshQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(newToken);
    }
  });
  refreshQueue = [];
};

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

    // 已經有其他請求在 refresh 了，把自己排進 queue 等新 token
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      // 用 refreshClient 送，不會被 api 的 response interceptor 攔截
      const res = await refreshClient.post(REFRESH_URL);
      // const res = await refreshClient.post(REFRESH_URL, {
      //   userId: JSON.parse(localStorage.getItem("username")), // ⬅ 你後端目前需要
      // });

      const newToken = res.data.accessToken;
      setAccessToken(newToken);

      // 通知所有排隊的請求
      flushQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (err) {
      // refresh 失敗：把 queue 全部 reject，然後視情況導向 /login
      flushQueue(err, null);

      // refresh token 也過期 → 強制回登入頁（整個 session 清掉）
      if (err.response?.status === 401) {
        redirectToLogin();
      } else {
        // 其他錯誤（例如 500、網路問題）只清 token，保留 isAuthenticated 讓使用者自己重試
        clearAccessToken();
      }

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;


