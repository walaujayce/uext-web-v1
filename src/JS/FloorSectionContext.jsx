import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api/apiClient";
import { getCurrentServerIp, setCurrentServerIp } from "../api/serverStore";

// Source of truth: /api/7284/IpAddress/all
//   每筆 { ip, floor, section }，同一個樓+層只會有 1 個 IP。
const BASE = "/api/7284/IpAddress";

// 把目前選取的 floor / section 存進 localStorage，讓瀏覽器重整後仍記得選取的樓層。
const STORAGE_KEY = "floorSection";
const readStoredFloorSection = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { floor: null, section: null };
    const v = JSON.parse(raw);
    return { floor: v.floor ?? null, section: v.section ?? null };
  } catch {
    return { floor: null, section: null };
  }
};

const FloorSectionContext = createContext();

export const FloorSectionProvider = ({ children }) => {
  const [servers, setServers] = useState([]); // [{ ip, floor, section }]
  // 初始值優先讀 localStorage，重整後維持上次選取；沒有才為 null(待載入後帶預設)
  const [floor, setFloor] = useState(() => readStoredFloorSection().floor);
  const [section, setSection] = useState(() => readStoredFloorSection().section);

  const fetchServers = async () => {
    try {
      const res = await api.get(`${BASE}/all`);
      // 後端可能回 PascalCase 或 camelCase，統一成小寫。
      const list = (res.data || []).map((x) => ({
        ip: x.ip ?? x.Ip ?? "",
        floor: x.floor ?? x.Floor ?? "",
        section: x.section ?? x.Section ?? "",
      }));
      setServers(list);

      if (list.length > 0) {
        // 優先沿用上次(localStorage)的選取；若該樓層/區域在最新清單中已不存在，
        // 才 fallback 到 response 第一筆，避免停在無效的樓層。
        const stored = readStoredFloorSection();
        const floorValid = stored.floor && list.some((s) => s.floor === stored.floor);
        const nextFloor = floorValid ? stored.floor : list[0].floor;
        const sectionValid =
          stored.section &&
          list.some((s) => s.floor === nextFloor && s.section === stored.section);
        const nextSection = sectionValid
          ? stored.section
          : (list.find((s) => s.floor === nextFloor)?.section ?? null);

        setFloor(nextFloor);
        setSection(nextSection);
      }
    } catch (err) {
      console.error("GET /IpAddress/all failed:", err);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  // 選取改變時持久化，供下次重整讀回
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ floor, section }));
  }, [floor, section]);

  // 去重後的樓層選項
  const floors = useMemo(
    () => [...new Set(servers.map((s) => s.floor).filter(Boolean))],
    [servers],
  );

  // 區域選項：只顯示「目前選取樓層」底下的區域（cascade）
  const sections = useMemo(
    () => [
      ...new Set(
        servers
          .filter((s) => (floor ? s.floor === floor : true))
          .map((s) => s.section)
          .filter(Boolean),
      ),
    ],
    [servers, floor],
  );

  // 切換樓層：同時把區域重設成該樓層的第一個區域
  const chooseFloor = (nextFloor) => {
    setFloor(nextFloor);
    const firstSection =
      servers.find((s) => s.floor === nextFloor)?.section ?? null;
    setSection(firstSection);
    return firstSection;
  };

  // 依目前 floor + section 找出對應的 IP（同一個樓+層唯一）
  const selectedServer = useMemo(
    () =>
      servers.find((s) => s.floor === floor && s.section === section) ?? null,
    [servers, floor, section],
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
        floors,
        sections,
        floor,
        section,
        selectedServer,
        setFloor,
        setSection,
        chooseFloor,
        refreshServers: fetchServers,
      }}
    >
      {children}
    </FloorSectionContext.Provider>
  );
};

export const useFloorSection = () => useContext(FloorSectionContext);
