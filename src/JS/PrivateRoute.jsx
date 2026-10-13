import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { isTokenExpired } from "../auth/authStore";
import { ensureAccessToken } from "../api/apiClient";
import SimpleBackdrop from "../components/LoadingOverlay";

// ─────────────────────────────────────────────────────────
// 受保護路由的守衛。
//
// ⚠ 之前的寫法是：
//     const authed = isAuthenticated && !isTokenExpired();
//     if (!authed) return <Navigate to="/" replace />;
//   問題在於「access token 過期」被直接當成「已登出」。但 access token 過期
//   本來就是正常的，只要 refresh token 還有效就該換一張新的繼續用。
//
//   這正是使用者觀察到的現象：
//     - 停在 Device 頁一直輪詢 → 有請求 → 401 → 攔截器 refresh → 續命 ✅
//     - 停在 Alert 頁沒有請求 → token 靜靜過期 → 一切頁，PrivateRoute 在
//       算繪之前就判定過期並導回登入頁，全程沒送出任何請求 → 沒機會 refresh ❌
//
// 現在改成三態：token 過期時先「嘗試 refresh」，期間顯示 loading，
// 換到新 token 才算繪頁面，真的換不到（refresh token 也過期/被撤銷）才導回登入頁。
// ─────────────────────────────────────────────────────────
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isDevMode, role } = useAuth();

  // "checking" → 正在用 refresh token 換新的 access token，先不要導走
  // "ok"       → 可以算繪
  // "denied"   → 換不到 → 導回登入頁
  const [status, setStatus] = useState(() => {
    if (isDevMode) return "ok";
    if (!isAuthenticated) return "denied";
    return isTokenExpired() ? "checking" : "ok";
  });

  useEffect(() => {
    if (isDevMode) return;

    let cancelled = false;

    if (!isAuthenticated) {
      setStatus("denied");
      return;
    }
    if (!isTokenExpired()) {
      setStatus("ok");
      return;
    }

    // access token 過期 ≠ 要登出：先打 /auth/refresh，
    // 用 HttpOnly 的 refresh token cookie 換一張新的 access token。
    setStatus("checking");
    ensureAccessToken().then((token) => {
      if (cancelled) return;
      setStatus(token ? "ok" : "denied");
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (isDevMode) return children;

  // 換 token 中：先顯示 loading，不要跳轉也不要算繪內容
  if (status === "checking") return <SimpleBackdrop open />;

  if (status === "denied") return <Navigate to="/" replace />;

  return allowedRoles.includes(role) || allowedRoles.includes("all") ? (
    children
  ) : (
    <Navigate to="/home" replace />
  );
};

export default PrivateRoute;
