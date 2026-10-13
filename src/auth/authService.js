import api from "../api/apiClient";
import { setAccessToken, clearAccessToken } from "./authStore";

export const login_auth = async (userId, password) => {
  try {
    const res = await api.post("/api/7284/auth/login", { userId, password });
    console.log("login result: ", res.data);
    if (res.data.code === 200) {
      setAccessToken(res.data.data.accessToken, userId);
    }
    return res.data;
  } catch (err) {
    // 失敗(例如 401)時的後端回應在 err.response
    console.log("login failed: ", err.response?.data ?? err.message);
    return err.response?.data ?? { code: err.response?.status ?? -1 };
  }
};
export const logout = async () => {
  await api.post("/auth/logout");
  clearAccessToken();
};