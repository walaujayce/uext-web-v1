import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api/apiClient";

// Source of truth: /api/7284/IpAddress/all
//   每筆 { ip, floor, section }，同一個樓+層只會有 1 個 IP。
const BASE = "/api/7284/IpAddress";

const FloorSectionContext = createContext();

export const FloorSectionProvider = ({ children }) => {
  const [servers, setServers] = useState([]); // [{ ip, floor, section }]
  const [floor, setFloor] = useState(null); // 目前選取的樓層
  const [section, setSection] = useState(null); // 目前選取的區域

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

      // 預設 = response 陣列的第一筆 floor / section
      if (list.length > 0) {
        setFloor((prev) => prev ?? list[0].floor);
        setSection((prev) => prev ?? list[0].section);
      }
    } catch (err) {
      console.error("GET /IpAddress/all failed:", err);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

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
