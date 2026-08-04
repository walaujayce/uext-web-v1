// 目前選取的「樓層 / 區域」對應的後端 IP。
// 放在 module scope，讓非 React 模組（例如 apiClient.js 的 interceptor）也能同步讀取，
// 由 FloorSectionContext 在 floor/section 改變時更新。
let currentServerIp = null;

export const getCurrentServerIp = () => currentServerIp;

export const setCurrentServerIp = (ip) => {
  currentServerIp = ip || null;
};
