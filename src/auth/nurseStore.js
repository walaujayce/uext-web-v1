// 登入來源與醫院 NSCALL 護理師資料的保存處。
//
// /api/7284/auth/login 成功時由 authService 寫入，登出時清掉。
// 用 localStorage（而非 sessionStorage）是為了跟 isAuthenticated / role 一致：
// 重新整理、或 refresh token 續期後回到首頁，排班區域都還要在。
//
// 讀寫一律包 try/catch：無痕模式、或瀏覽器把站台資料關掉時，
// localStorage 的存取會直接丟錯，不能讓它炸掉登入流程。

const AUTH_SOURCE_KEY = "authSource";
const NURSE_KEY = "nurseProfile";

export const AUTH_SOURCE_LOCAL = "LOCAL";
export const AUTH_SOURCE_NSCALL = "NSCALL";

const safeGet = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** 登入成功後保存：authSource = "LOCAL" | "NSCALL"，nurse 為醫院回傳的護理師資料。 */
export const setAuthSession = (authSource, nurse) => {
  try {
    localStorage.setItem(AUTH_SOURCE_KEY, authSource || AUTH_SOURCE_LOCAL);
    if (nurse) {
      localStorage.setItem(NURSE_KEY, JSON.stringify(nurse));
    } else {
      localStorage.removeItem(NURSE_KEY);
    }
  } catch (err) {
    console.warn("cannot persist auth session:", err);
  }
};

export const clearAuthSession = () => {
  try {
    localStorage.removeItem(AUTH_SOURCE_KEY);
    localStorage.removeItem(NURSE_KEY);
  } catch {
    /* 讀寫不到就算了 */
  }
};

export const getAuthSource = () => safeGet(AUTH_SOURCE_KEY) || AUTH_SOURCE_LOCAL;

/**
 * 醫院 CheckNurseAuth 回傳的那一筆資料（camelCase）：
 *   { authStatus, operId, nurseND, nurseJob, nurseName, costCode, costName }
 */
export const getNurseProfile = () => {
  const raw = safeGet(NURSE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * 是不是透過醫院 API 登入的。
 * 後端目前回 "hospital"（users.jlog.Auth_Source 的值），
 * 這裡只要「不是 LOCAL 的任何值」都算，避免哪天後端換個字串就整個失效。
 */
export const isNurseLogin = () => {
  const src = getAuthSource();
  return Boolean(src) && src.toUpperCase() !== AUTH_SOURCE_LOCAL;
};

/**
 * 護理師的員編（醫院端的 Oper_id，也就是本地 users.userid）。
 * 首頁用它比對 bed.nurseId（字串完全相等），只顯示自己負責的床位。
 * 本地帳號 → null（代表不限制）。
 *
 * 判斷依據是「有沒有 nurseProfile」而不是 authSource ——
 * 只有醫院登入才會存 nurseProfile，所以這個判準最直接也最不會誤判。
 */
export const getNurseOperId = () => {
  const id = getNurseProfile()?.operId;
  return id ? String(id).trim() : null;
};

/**
 * 護理師的排班成本中心代碼（7B病房 = 877B 這種）。
 * 目前首頁的床位篩選改用 nurseId，這支留著給其他地方顯示用。
 */
export const getNurseCostCode = () => {
  const code = getNurseProfile()?.costCode;
  return code ? String(code).trim() : null;
};
