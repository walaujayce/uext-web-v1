import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "../auth/authStore";

const api = axios.create({
//   baseURL: import.meta.env.VITE_WEBAPI_URL || "/api",
  withCredentials: true, // ⬅ refresh token cookie
});

// 另開一支乾淨的 axios 實例給 /refresh 使用，避免被攔截器再次攔截造成遞迴
const refreshClient = axios.create({
  withCredentials: true,
});

const REFRESH_URL = "/api/7284/auth/refresh";

// 統一做「清整個登入狀態 + 導向 /login」
// 注意：AuthContext 及 PrivateRoute 是靠 localStorage.isAuthenticated 判斷登入狀態，
// 只清 accessToken 會造成 /login -> /home -> 401 -> /login 的輪迴。
const clearSession = () => {
  clearAccessToken();
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
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

  return config;
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

    // 沒有 response（例如網路斷線）或非 401 直接 reject
    if (!error.response || error.response.status !== 401 || !originalRequest || originalRequest._retry) {
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
      const res = await refreshClient.post(REFRESH_URL, {
        userId: JSON.parse(localStorage.getItem("username")), // ⬅ 你後端目前需要
      });

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


