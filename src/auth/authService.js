import api from "../api/apiClient";
import { setAccessToken, clearAccessToken } from "./authStore";

export const login_auth = async (userId, password) => {
  const res = await api.post("/api/7284/auth/login", {
    userId,
    password,
  });
  console.log("login result: ", res);
  // console.log("login token: ", res.data.data.accessToken);
  if(res.data.code === 200){
    setAccessToken(res.data.data.accessToken, userId);
    console.log("authService: ", userId);
  }
  if(res.data.code === 401){
    alert("aaa");
  }
  return res.data;
};
export const logout = async (userId) => {
  await api.post("/auth/logout", { userId });
  clearAccessToken();
};