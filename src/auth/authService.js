import api from "../api/apiClient";
import { setAccessToken, clearAccessToken } from "./authStore";
import {
  setAuthSession,
  clearAuthSession,
  AUTH_SOURCE_LOCAL,
} from "./nurseStore";

export const login_auth = async (userId, password) => {
  try {
    const res = await api.post("/api/7284/auth/login", { userId, password });
    console.log("login result: ", res.data);
    if (res.data.code === 200) {
      setAccessToken(res.data.data.accessToken, userId);
      // 醫院 NSCALL 登入時，後端會一併回傳護理師資料（含排班的 CostCode），
      // 存起來供首頁「我的排班」篩選床位使用；本地帳號則只記 authSource。
      setAuthSession(
        res.data.data.authSource ?? AUTH_SOURCE_LOCAL,
        res.data.data.nurse ?? null,
      );
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
  clearAuthSession();
};