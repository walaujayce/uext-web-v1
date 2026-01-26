import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "../auth/authStore";

const api = axios.create({
//   baseURL: import.meta.env.VITE_WEBAPI_URL || "/api",
  withCredentials: true, // ⬅ refresh token cookie
});
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

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const res = await api.post("/api/7284/auth/refresh", {
          userId: JSON.parse(localStorage.getItem("username")), // ⬅ 你後端目前需要
        });

        const newToken = res.data.accessToken;
        setAccessToken(newToken);

        refreshQueue.forEach(p => p.resolve(newToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;


