import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api/apiClient";
import { getCurrentServerIp, setCurrentServerIp } from "../api/serverStore";
import { getWebApiIp } from "../config/runtimeConfig";
import { useAuth } from "./AuthContext";

// Source of truth: /api/7284/IpAddress/all
//   每筆 { ip, section }。section → IP 仍然是唯一的（後端 Section 是唯一鍵），
//   但反過來「一個 IP 只服務一個 section」已經不成立：多個 section 會共用同一台後端。
//
// ⚠ 因此「選定單一區域」時，從該台後端抓回來的資料會夾帶其他區域的資料，
//   前端一定要再過濾一次 → 各列表頁共用底下的 matchesSection()。
//
// ⚠ 後端已移除 floor，這裡不再有樓層的概念，只剩 section。
const BASE = "/api/7284/IpAddress";

// IpAddress/all 是「主清單」端點：雖然每台 server 都能回應，但我們只允許打
// 設定的 WebAPI 主機，避免隨目前選取的 IP 改變而拿到不同來源的清單。
// 解析邏輯統一放在 runtimeConfig（runtime /config.js 優先，build time 為 fallback）：
//   - 有設定且非 localhost → 用該值當目標 IP（釘在該台）
//   - "localhost" → 用瀏覽器目前 host
//   - 未設定 → null，改用 noTargetIp 讓 proxy 走預設主機

// 把目前選取的 section 存進 localStorage，讓瀏覽器重整後仍記得選取的區域。
// 註：舊版存的是 { floor, section }，這裡只讀 section，舊資料可以自然相容。
const STORAGE_KEY = "floorSection";
const readStoredSection = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v.section ?? null;
  } catch {
    return null;
  }
};

// 區域過濾的共用判斷（Home / Bed / Patient / Device / Alert 列表都用這支）：
//   selected 未選或 "All" → 全部通過
//   資料本身沒有 section（尚未指派給任何區域）→ 一律顯示，
//     否則這種資料在每個區域都看不到，只有 All 才找得到
export const matchesSection = (selected, value) =>
  !selected || selected === "All" || !value || value === selected;

const FloorSectionContext = createContext();

export const FloorSectionProvider = ({ children }) => {
  // 登入後才需要 server 清單；未登入(登入頁)時不要打 /IpAddress/all
  const { isAuthenticated } = useAuth();

  const [servers, setServers] = useState([]); // [{ ip, section }]
  // 初始值優先讀 localStorage，重整後維持上次選取；沒有才為 null(待載入後帶預設)
  const [section, setSection] = useState(() => readStoredSection());

  const fetchServers = async () => {
    try {
      // 只允許打設定的 WebAPI 主機；有解析到就釘該台，否則用 noTargetIp 走 proxy 預設主機。
      const webApiIp = getWebApiIp();
      const res = await api.get(
        `${BASE}/all`,
        webApiIp ? { targetIp: webApiIp } : { noTargetIp: true },
      );
      // 後端可能回 PascalCase 或 camelCase，統一成小寫。
      const list = (res.data || []).map((x) => ({
        ip: x.ip ?? x.Ip ?? "",
        section: x.section ?? x.Section ?? "",
      }));
      setServers(list);

      if (list.length > 0) {
        // 優先沿用上次(localStorage)的選取；若該區域在最新清單中已不存在，
        // 才 fallback 到 response 第一筆，避免停在無效的區域。
        // "All" 是合法的選取值（代表跨所有區域），重整後要保留。
        const stored = readStoredSection();
        const sectionValid =
          stored &&
          (stored === "All" || list.some((s) => s.section === stored));
        setSection(sectionValid ? stored : list[0].section);
      }
    } catch (err) {
      console.error("GET /IpAddress/all failed:", err);
    }
  };

  useEffect(() => {
    // 只有登入後才抓 server 清單；登入頁(未登入)不呼叫 /IpAddress/all。
    // 登入成功後 isAuthenticated 變 true，會自動觸發抓取。
    if (isAuthenticated) {
      fetchServers();
    }
  }, [isAuthenticated]);

  // 選取改變時持久化，供下次重整讀回
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ section }));
  }, [section]);

  // 去重後的區域選項
  const sections = useMemo(
    () => [...new Set(servers.map((s) => s.section).filter(Boolean))],
    [servers],
  );

  // 切換區域
  const chooseSection = (nextSection) => {
    setSection(nextSection);
    return nextSection;
  };

  // 依目前 section 找出對應的 IP（section → IP 仍唯一；
  // 注意反向不成立，同一台 IP 可能同時服務其他 section）
  const selectedServer = useMemo(
    () => servers.find((s) => s.section === section) ?? null,
    [servers, section],
  );

  // 在 render 期間就同步更新 module store，讓 apiClient / SignalR 直接讀取。
  // 用 render-time 寫入(而非 effect)，是為了避免「子元件 effect 先於父元件 effect 執行」
  // 而讀到舊 IP：父元件 render 一定早於子元件 render/effect，所以這裡寫完最新值後，
  // 任何子元件後續的 fetch 都會拿到正確 IP。尚未選到時為 null → apiClient 走 proxy 預設。
  const currentIp = selectedServer?.ip ?? null;
  if (getCurrentServerIp() !== currentIp) {
    setCurrentServerIp(currentIp);
  }

  return (
    <FloorSectionContext.Provider
      value={{
        servers,
        sections,
        section,
        selectedServer,
        setSection,
        chooseSection,
        refreshServers: fetchServers,
      }}
    >
      {children}
    </FloorSectionContext.Provider>
  );
};

export const useFloorSection = () => useContext(FloorSectionContext);
