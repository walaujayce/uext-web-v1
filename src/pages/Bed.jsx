import React, { useState, useEffect, useMemo, useRef } from "react";
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
import AddNewBed from "../components/Modals/AddNewBed";
import { useTranslation } from "react-i18next";
import { useFloorSection, matchesSection } from "../JS/FloorSectionContext";
import api from "../api/apiClient";

// 床位列表：資料來源為 WebAPI 的 BedController（GET api/db/Bed），
// 回傳欄位為 BedGetDto → camelCase：bedId / section / patientId / nurseId。
// 裝置不在床位上，要另外從住民取：bed.patientId → patient.deviceid。
// 版面與 /patient 一致，沿用 panel-list.css 的 .pl 結構，床位專屬樣式放在 bed.css。
function Bed() {
  const { t } = useTranslation();

  // 所有樓層/區域對應的後端清單，供「All」模式逐台抓取所有床位
  // selectedServer：非 All 模式下，目前選取的區域對應到的那一台
  const { servers, selectedServer } = useFloorSection();

  const [select_section, setSelect_Section] = useState("");
  const handleSelectSection = (section) => {
    setSelect_Section(section);
  };

  const [beds, setBeds] = useState([]);
  // 住民清單：列表的「裝置編號」欄要從住民身上取（patient.deviceid）
  const [patients, setPatients] = useState([]);

  // 決定要抓哪些後端（與 Home / Patient 規則一致）：
  //   section === "All" → 所有 server
  //   其他              → null，走目前選取的單一 server
  const targetIps = useMemo(() => {
    if (select_section === "All") {
      return [...new Set(servers.map((s) => s.ip).filter(Boolean))];
    }
    return null;
  }, [servers, select_section]);

  // 篩選條件的識別字串。
  // ⚠ 不能直接把 targetIps 當 useEffect 的依賴：非 All 模式下它「恆為 null」，
  //   所以 A 區 → B 區 的切換會被 Object.is 判定成沒變，effect 不會重跑，
  //   列表要等下一次 5 秒輪詢才更新。這裡改用會真正跟著篩選變動的字串當依賴。
  const filterKey = useMemo(
    () =>
      select_section === "All"
        ? `all:${(targetIps || []).join(",")}`
        : `one:${select_section}:${selectedServer?.ip ?? ""}`,
    [select_section, targetIps, selectedServer],
  );

  // React key：All 模式下不同 server 可能有相同 bedId，用來源 IP 前綴保證唯一
  const bedKey = (bed) => (bed.__srcIp ? `${bed.__srcIp}-${bed.bedId}` : bed.bedId);

  // 多個區域共用同一台後端，所以抓回來的床位會夾帶其他區域的，前端要再過濾一次
  const inSection = (bed) => matchesSection(select_section, bed.section);

  const fetchListFrom = async (url, targetIp) => {
    const cfg = targetIp ? { targetIp } : undefined;
    const response = await api.get(url, cfg);
    return response.data || [];
  };

  // 請求序號：切換區域時，前一次還在飛的請求可能比新的晚回來，
  // 若不擋掉就會用「舊區域」的資料蓋掉剛抓到的新資料。只採用最後一次發出的請求。
  const reqSeqRef = useRef(0);

  const fetchBeds = async () => {
    const seq = ++reqSeqRef.current;
    try {
      let nextBeds;
      let nextPatients;
      if (targetIps) {
        // 「All」模式：逐台抓取後合併，並標上來源 IP，避免跨 server 資料互相覆蓋
        const fetchAllOf = (url) =>
          Promise.all(
            targetIps.map((ip) =>
              fetchListFrom(url, ip)
                .then((list) => list.map((x) => ({ ...x, __srcIp: ip })))
                .catch((err) => {
                  console.error(`Error fetching ${url} from ${ip}:`, err);
                  return [];
                }),
            ),
          ).then((results) => results.flat());

        [nextBeds, nextPatients] = await Promise.all([
          fetchAllOf("/api/7284/db/Bed"),
          fetchAllOf("/api/7284/db/Patient"),
        ]);
      } else {
        [nextBeds, nextPatients] = await Promise.all([
          fetchListFrom("/api/7284/db/Bed"),
          fetchListFrom("/api/7284/db/Patient"),
        ]);
      }
      // 已經有更新的請求發出 → 這次的結果過期，丟棄
      if (seq !== reqSeqRef.current) return;
      setBeds(nextBeds);
      setPatients(nextPatients);
    } catch (error) {
      console.error("Error fetching bed data:", error);
    }
  };

  // 開著 modal 時暫停輪詢，避免編輯中列表在背景被換掉
  const isModalOpenRef = useRef(false);

  useEffect(() => {
    // 篩選一改就立刻抓一次，不用等下一次輪詢；同時重設輪詢計時器
    fetchBeds();
    // 床位異動頻率遠低於量測資料，5 秒輪詢即可（/patient 的 1 秒是為了連線狀態）
    const interval = setInterval(() => {
      if (isModalOpenRef.current) return;
      fetchBeds();
    }, 5000);
    return () => clearInterval(interval);
  }, [filterKey]);

  {
    /* 床位的裝置：床位本身沒有裝置欄位，要透過住民取得
       （All 模式下不同後端可能有相同住民編號，key 連來源 IP 一起比） */
  }
  const patientDeviceMap = useMemo(() => {
    const map = new Map();
    patients.forEach((p) => {
      if (!p.patientid) return;
      map.set(`${p.__srcIp ?? ""}|${p.patientid}`, p.deviceid ?? "");
    });
    return map;
  }, [patients]);

  const bedDeviceId = (bed) =>
    bed.patientId
      ? patientDeviceMap.get(`${bed.__srcIp ?? ""}|${bed.patientId}`) || ""
      : "";

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

  const filteredBeds = beds.filter(inSection).sort((a, b) => {
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
        return sortDirection
          ? cmp(bedDeviceId(a), bedDeviceId(b))
          : cmp(bedDeviceId(b), bedDeviceId(a));
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

  {
    /* Handle Overlay Visible
       新增：editingBed = null + isAddVisible = true
       編輯：editingBed = 該筆床位（點列表任一列） */
  }
  const [isAddVisible, setAddVisible] = useState(false);
  const [editingBed, setEditingBed] = useState(null);

  const isModalOpen = isAddVisible || Boolean(editingBed);
  isModalOpenRef.current = isModalOpen;

  const handleAddBedClick = (e) => {
    e?.preventDefault();
    setEditingBed(null);
    setAddVisible((prev) => !prev);
  };

  const handleRowClick = (bed) => {
    setAddVisible(false);
    setEditingBed(bed);
  };

  const handleCloseModal = () => {
    setAddVisible(false);
    setEditingBed(null);
  };

  const BedRow = ({ bed }) => (
    <div className="item" onClick={() => handleRowClick(bed)}>
      <h3 className="fg2">{bed.bedId || "N/A"}</h3>
      <h3 className="fg1">{bed.section || "N/A"}</h3>
      <h3 className="fg2">{bed.patientId || "N/A"}</h3>
      <h3 className="fg2">{bedDeviceId(bed) || "N/A"}</h3>
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

              <div className="btn" id="addBed" onClick={handleAddBedClick}>
                <img src="" alt="" className="prefix" />
                <p className="btn-text">{t("BedList.NewBed")}</p>
              </div>
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
              {/* Bed List：點任一列開啟編輯 modal */}
              <div className="item-list">
                {filteredBeds.map((bed) => (
                  <BedRow bed={bed} key={bedKey(bed)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 放在 .top-bar 外面：general.css 有 .top-bar .dropdown{max-width}，
          放在裡面會讓 modal 的下拉欄位被限寬 */}
      {isModalOpen && (
        <AddNewBed
          bed={editingBed}
          callback={handleCloseModal}
          onCreated={fetchBeds}
        />
      )}
    </>
  );
}

export default Bed;
