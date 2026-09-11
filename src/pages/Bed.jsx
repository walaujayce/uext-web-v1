import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/panel-list.css";
import "/src/CSS/bed.css";
import AlertList from "/src/components/AlertList.jsx";
import Navbar from "../components/Navbar";
import FloorSectionBar from "../components/FloorSectionBar";
import { useTranslation } from "react-i18next";
import { useFloorSection } from "../JS/FloorSectionContext";
import api from "../api/apiClient";

// 床位列表：資料來源為 WebAPI 的 BedController（GET api/db/Bed），
// 回傳欄位為 BedGetDto → camelCase：bedId / section / patientId / deviceId / nurseId。
// 版面與 /patient 一致，沿用 panel-list.css 的 .pl 結構，床位專屬樣式放在 bed.css。
function Bed() {
  const { t } = useTranslation();

  // 所有樓層/區域對應的後端清單，供「All」模式逐台抓取所有床位
  const { servers } = useFloorSection();

  const [select_section, setSelect_Section] = useState("");
  const handleSelectSection = (section) => {
    setSelect_Section(section);
  };

  const [beds, setBeds] = useState([]);

  // 決定要抓哪些後端（與 Home / Patient 規則一致）：
  //   section === "All" → 所有 server
  //   其他              → null，走目前選取的單一 server
  const targetIps = useMemo(() => {
    if (select_section === "All") {
      return [...new Set(servers.map((s) => s.ip).filter(Boolean))];
    }
    return null;
  }, [servers, select_section]);

  // React key：All 模式下不同 server 可能有相同 bedId，用來源 IP 前綴保證唯一
  const bedKey = (bed) => (bed.__srcIp ? `${bed.__srcIp}-${bed.bedId}` : bed.bedId);

  const fetchBedsFrom = async (targetIp) => {
    const cfg = targetIp ? { targetIp } : undefined;
    const response = await api.get("/api/7284/db/Bed", cfg);
    return response.data || [];
  };

  const fetchBeds = async () => {
    try {
      if (targetIps) {
        // 「All」模式：逐台抓取後合併，並標上來源 IP，避免跨 server 資料互相覆蓋
        const results = await Promise.all(
          targetIps.map((ip) =>
            fetchBedsFrom(ip)
              .then((list) => list.map((b) => ({ ...b, __srcIp: ip })))
              .catch((err) => {
                console.error(`Error fetching beds from ${ip}:`, err);
                return [];
              }),
          ),
        );
        setBeds(results.flat());
      } else {
        setBeds(await fetchBedsFrom());
      }
    } catch (error) {
      console.error("Error fetching bed data:", error);
    }
  };

  useEffect(() => {
    fetchBeds();
    // 床位異動頻率遠低於量測資料，5 秒輪詢即可（/patient 的 1 秒是為了連線狀態）
    const interval = setInterval(fetchBeds, 5000);
    return () => clearInterval(interval);
  }, [targetIps]);

  {
    /* sort logic */
  }
  const sortTypes = ["bedId", "section", "patientId", "deviceId", "nurseId", "status"];

  const [sortType, setSortType] = useState(sortTypes[0]);
  const [sortDirection, setSortDirection] = useState(true);
  function SortType(sortTypeIndex) {
    if (sortTypes[sortTypeIndex] !== sortType) setSortDirection(true);
    setSortType(sortTypes[sortTypeIndex]);
    if (sortTypes[sortTypeIndex] === sortType) setSortDirection((prev) => !prev);
  }

  // 有指派住民 = 佔用中
  const isOccupied = (bed) => Boolean(bed.patientId);

  const filteredBeds = beds.slice().sort((a, b) => {
    const valA = (val) => val ?? "";
    const cmp = (x, y) => valA(x).localeCompare(valA(y), undefined, { numeric: true });
    switch (sortType) {
      case sortTypes[0]: // bed id
        return sortDirection ? cmp(a.bedId, b.bedId) : cmp(b.bedId, a.bedId);
      case sortTypes[1]: // section
        return sortDirection ? cmp(a.section, b.section) : cmp(b.section, a.section);
      case sortTypes[2]: // patient id
        return sortDirection ? cmp(a.patientId, b.patientId) : cmp(b.patientId, a.patientId);
      case sortTypes[3]: // device id
        return sortDirection ? cmp(a.deviceId, b.deviceId) : cmp(b.deviceId, a.deviceId);
      case sortTypes[4]: // nurse id
        return sortDirection ? cmp(a.nurseId, b.nurseId) : cmp(b.nurseId, a.nurseId);
      case sortTypes[5]: // status（佔用中優先）
        return sortDirection
          ? String(isOccupied(b)).localeCompare(String(isOccupied(a)))
          : String(isOccupied(a)).localeCompare(String(isOccupied(b)));
      default:
        return 0;
    }
  });

  const occupiedCount = filteredBeds.filter(isOccupied).length;

  // 有裝置才進得了監控頁；沒裝置的床位就顯示成不可點的列
  const monitorLink = (bed) =>
    `/patient/patient-detail/patient-monitor?macaddress=${bed.deviceId}${
      bed.__srcIp ? `&ip=${bed.__srcIp}` : ""
    }`;

  const BedRow = ({ bed }) => (
    <div className={`item ${isOccupied(bed) ? "" : "vacant-row"}`}>
      <h3 className="fg2">{bed.bedId || "N/A"}</h3>
      <h3 className="fg1">{bed.section || "N/A"}</h3>
      <h3 className="fg2">{bed.patientId || "N/A"}</h3>
      <h3 className="fg2">{bed.deviceId || "N/A"}</h3>
      <h3 className="fg2">{bed.nurseId || "N/A"}</h3>
      <div className={`bed-status ${isOccupied(bed) ? "occupied" : "vacant"} fg2`}>
        <span className="dot" />
        <h3>{isOccupied(bed) ? t("BedList.Occupied") : t("BedList.Vacant")}</h3>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="wrap">
        <AlertList />
        <div className="main">
          <div className="box">
            <h1>{t("BedList.BedList")}</h1>
          </div>
          <div className="container">
            <div className="top-bar">
              <FloorSectionBar
                selectSection={handleSelectSection}
                enableDeviceType={false}
              />
            </div>
            {/* Bed List Main body */}
            <div className="pl bed-list">
              {/* Bed List Title */}
              <div className="head">
                <h3
                  className={`fg2 ${sortType === sortTypes[0] ? "selected" : ""}`}
                  onClick={() => SortType(0)}
                >
                  {t("BedList.BedID")}{" "}
                  {sortType === sortTypes[0] && (sortDirection ? "▼" : "▲")}
                </h3>
                <h3
                  className={`fg1 ${sortType === sortTypes[1] ? "selected" : ""}`}
                  onClick={() => SortType(1)}
                >
                  {t("BedList.Section")}{" "}
                  {sortType === sortTypes[1] && (sortDirection ? "▼" : "▲")}
                </h3>
                <h3
                  className={`fg2 ${sortType === sortTypes[2] ? "selected" : ""}`}
                  onClick={() => SortType(2)}
                >
                  {t("BedList.PatientID")}{" "}
                  {sortType === sortTypes[2] && (sortDirection ? "▼" : "▲")}
                </h3>
                <h3
                  className={`fg2 ${sortType === sortTypes[3] ? "selected" : ""}`}
                  onClick={() => SortType(3)}
                >
                  {t("BedList.DeviceID")}{" "}
                  {sortType === sortTypes[3] && (sortDirection ? "▼" : "▲")}
                </h3>
                <h3
                  className={`fg2 ${sortType === sortTypes[4] ? "selected" : ""}`}
                  onClick={() => SortType(4)}
                >
                  {t("BedList.NurseID")}{" "}
                  {sortType === sortTypes[4] && (sortDirection ? "▼" : "▲")}
                </h3>
                <div className="bed-status fg2" onClick={() => SortType(5)}>
                  <h3 className={`${sortType === sortTypes[5] ? "selected" : ""}`}>
                    {t("BedList.Status")}
                    {`(${occupiedCount}/${filteredBeds.length})`}{" "}
                    {sortType === sortTypes[5] && (sortDirection ? "▼" : "▲")}
                  </h3>
                </div>
              </div>
              {/* Bed List */}
              <div className="item-list">
                {filteredBeds.map((bed) =>
                  bed.deviceId ? (
                    <Link
                      to={monitorLink(bed)}
                      key={bedKey(bed)}
                      state={{ from: "/bed" }}
                    >
                      <BedRow bed={bed} />
                    </Link>
                  ) : (
                    <BedRow bed={bed} key={bedKey(bed)} />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Bed;
