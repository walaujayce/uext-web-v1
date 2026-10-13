let accessToken = localStorage.getItem("accessToken") || null;
let userId = '';
export const setAccessToken = (token, userid) => {
  accessToken = token;
  userId = userid;
  localStorage.setItem("accessToken", token);

};

export const getAccessToken = () => accessToken;
export const getUserId = () => userId;
export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem("accessToken");

};

// 解析 JWT 的 exp，判斷 access token 是否已過期（讓前端在算繪受保護頁面「之前」就能判斷，
// 不必等後端回 401 才被踢出，避免使用者先看到 /device 再被導走）。
//   - 沒有 token           → 視為已過期
//   - 有 exp 且已超過現在   → 已過期
//   - 沒有 exp / 解析失敗    → 回 false（無法在前端判斷，交回原本後端 401 流程處理）
export const isTokenExpired = (token = accessToken) => {
  if (!token) return true;
  try {
    const part = token.split(".")[1];
    if (!part) return false;
    let base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    base64 += "=".repeat((4 - (base64.length % 4)) % 4); // 補回 base64 padding
    const payload = JSON.parse(atob(base64));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
};
