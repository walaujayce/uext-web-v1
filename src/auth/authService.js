import api from "../api/apiClient";
import { setAccessToken, clearAccessToken } from "./authStore";

export const login_auth = async (userId, password) => {
  const res = await api.post("/api/7284/auth/login", {
    userId,
    password,
  });
  console.log("login result: ", res.data);
//   setAccessToken(res.data.accessToken);
};
export const logout = async (userId) => {
  await api.post("/auth/logout", { userId });
  clearAccessToken();
};