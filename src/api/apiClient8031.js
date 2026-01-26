import axios from "axios";

const api8031 = axios.create({
  withCredentials: true, // ⬅ refresh token cookie
});
api8031.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiQWRtaW4iLCJSb2xlIjoiQWRtaW4iLCJpc3MiOiJVTW9uaXRvclNlcnZlciIsImF1ZCI6IlVNb25pdG9yQ2xpZW50In0.JpQvxBC197LaFVrBFdjZnF-Lk_nDUd5lWL_OaybpYpc`;
  return config;
});

export default api8031;