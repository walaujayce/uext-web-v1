import React, { useState, useEffect, useRef, useMemo } from "react";
import { Outlet, Link } from "react-router-dom";
import dayjs from "dayjs";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/panel-list.css";
import FloorSectionBar from "../components/FloorSectionBar";
import AddNewDevice from "../components/Modals/AddNewDevice";
import { useTranslation } from "react-i18next";
import { useAuth } from "../JS/AuthContext";
import { useFloorSection } from "../JS/FloorSectionContext";
import api from "../api/apiClient"
import api8031 from "../api/apiClient8031";

const DeviceList = () => {
  const { t, i18n } = useTranslation();

  const { role } = useAuth();

  // 所有樓層/區域對應的後端清單，供「All」模式逐台抓取
  const { servers } = useFloorSection();

  const [devices, setDevices] = useState([]);

  const [deviceMap, setDeviceMap] = useState({}); // key: (ip-)mac, value: { rssi, ping }

  const [port, setPort] = useState("7284");
  const handleSelectPort = (port) => {
    //console.log(port);
    setPort(port);
  };

  const [select_floor, setSelect_Floor] = useState("");
  const handleSelectFloor = (floor) => {
    setSelect_Floor(floor);
  };
  const [select_section, setSelect_Section] = useState("");
  const handleSelectSection = (section) => {
    setSelect_Section(section);
  };
  const [select_deviceType, setSelect_DeviceType] = useState("");
  const handleSelectDeviceType = (deviceType) => {
    setSelect_DeviceType(deviceType);
  };

  // 決定要抓哪些後端（與 Home 規則一致）：
  //   floor === "All"   → 所有 server
  //   section === "All" → 該樓層底下所有 server
  //   其他              → null，走目前選取的單一 server
  const targetIps = useMemo(() => {
    if (select_floor === "All") {
      return [...new Set(servers.map((s) => s.ip).filter(Boolean))];
    }
    if (select_section === "All") {
      return [
        ...new Set(
          servers
            .filter((s) => s.floor === select_floor)
            .map((s) => s.ip)
            .filter(Boolean),
        ),
      ];
    }
    return null;
  }, [servers, select_floor, select_section]);

  // ping/rssi map 的 key、React key、詳情頁連結：All 模式下同 MAC 可能來自不同 server，
  // 一律用來源 IP 前綴避免衝突。
  const mapKey = (ip, mac) => (ip ? `${ip}-${mac}` : mac);
  const deviceKey = (device) =>
    device.__srcIp ? `${device.__srcIp}-${device.macaddress}` : device.macaddress;
  const ipQuery = (device) => (device.__srcIp ? `&ip=${device.__srcIp}` : "");

  {
    /* sort logic */
  }
  const sortTypes = [
    "deviceType",
    "deviceId",
    "mac",
    "ip",
    "bed",
    "section",
    "floor",
    "updateDate",
    "status",
  ];

  const [sortType, setSortType] = useState(sortTypes[1]);
  const [sortDirection, setSortDirection] = useState(true);
  function SortType(sortTypeIndex) {
    if (sortTypes[sortTypeIndex] !== sortType) setSortDirection(true);
    setSortType(sortTypes[sortTypeIndex]);
    if (sortTypes[sortTypeIndex] === sortType)
      setSortDirection((prev) => !prev);
  }

  // const fetchDeviceList = async () => {
  //   try {
  //     const response = await fetch("/api/7284/db/Device");
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     //console.log(data);
  //     setDevices(data);
  //   } catch (error) {
  //     console.error("Error fetching device data:", error);
  //   }
  // };
  // 從「單一」server 抓 db/Device + socketserver/8031，並在「同一台」內比對出 ping/rssi。
  // 傳入 ip 時把請求釘在該台（All 模式逐台抓取）；不傳則走目前選取的 server。
  const fetchFromServer = async (ip) => {
    const cfg = ip ? { targetIp: ip } : undefined;
    let data = [];
    let data8031 = [];
    if (import.meta.env.VITE_MODE === "dev") {
      const [response, response8031] = await Promise.all([
        api.get("/api/7284/db/Device", cfg),
        api.get("/api/7284/ss/SocketServer", cfg),
      ]);
      data = response.data || [];
      data8031 = response8031.data || [];
    } else {
      const [response, response8031] = await Promise.all([
        api.get("/api/7284/db/Device", cfg),
        api8031.get("/api/8031/devices", cfg),
      ]);
      data = response.data || [];
      data8031 = (response8031.data && response8031.data.DATA) || [];
    }

    const macSet = new Set(data.map((device) => device.macaddress));
    const matchedMap = {};
    data8031.forEach((device) => {
      if (macSet.has(device.MAC)) {
        matchedMap[mapKey(ip, device.MAC)] = {
          rssi: device.RSSI,
          // ping: device.Ping,
        };
      }
    });

    return { devices: data.map((d) => ({ ...d, __srcIp: ip })), deviceMap: matchedMap };
  };

  const fetchDeviceList = async () => {
    try {
      if (targetIps) {
        // 「All」模式：逐台抓取後合併。單台失敗不影響其他台。
        const results = await Promise.all(
          targetIps.map((ip) =>
            fetchFromServer(ip).catch((err) => {
              console.error(`Error fetching devices from ${ip}:`, err);
              return { devices: [], deviceMap: {} };
            }),
          ),
        );
        setDevices(results.flatMap((r) => r.devices));
        setDeviceMap(Object.assign({}, ...results.map((r) => r.deviceMap)));
      } else {
        const r = await fetchFromServer();
        setDevices(r.devices);
        setDeviceMap(r.deviceMap);
      }
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  useEffect(() => {
    fetchDeviceList();
    const interval = setInterval(fetchDeviceList, 1000);
    return () => clearInterval(interval);
  }, [port, targetIps]);

  const filteredDevices = devices
    .filter((device) => device.used === true) // Only used devices
    // .filter(
    //   (device) =>
    //     select_floor === "" ||
    //     select_floor === "All" ||
    //     device.floor === select_floor
    // ) // Filter by floor
    // .filter(
    //   (device) =>
    //     select_section === "" ||
    //     select_section === "All" ||
    //     device.section === select_section
    // ) // Filter by section
    .filter(
      (device) =>
        select_deviceType === "" ||
        select_deviceType === "All" ||
        device.devicetype === select_deviceType
    ) // Filter by device type
    .sort((a, b) => {
      const valA = (val) => val ?? "";
      switch (sortType) {
        case sortTypes[0]: // device type
          //console.log("sortType: ", sortType);
          if (sortDirection) {
            return String(b.devicetype).localeCompare(String(a.devicetype));
          } else {
            return String(a.devicetype).localeCompare(String(b.devicetype));
          }
        case sortTypes[1]: // device id
          //console.log("sortType: ", sortType);
          // const macA = a.macaddress?.toUpperCase() || "";
          // const macB = b.macaddress?.toUpperCase() || "";
          // if (macA < macB) return -1;
          // if (macA > macB) return 1;
          // const numA = parseInt(a.macaddress?.replace(/[^0-9]/g, "") || "0", 10);
          // const numB = parseInt(b.macaddress?.replace(/[^0-9]/g, "") || "0", 10);
          // return numA - numB;
          if (sortDirection) {
            return valA(a.macaddress).localeCompare(
              valA(b.macaddress),
              undefined,
              { numeric: true }
            );
          } else {
            return valA(b.macaddress).localeCompare(
              valA(a.macaddress),
              undefined,
              { numeric: true }
            );
          }
        case sortTypes[2]: //device mac
          //console.log("sortType: ", sortType);
          if (sortDirection) {
            return valA(a.macaddress).localeCompare(
              valA(b.macaddress),
              undefined,
              { numeric: true }
            );
          } else {
            return valA(b.macaddress).localeCompare(
              valA(a.macaddress),
              undefined,
              { numeric: true }
            );
          }
        case sortTypes[3]: //device ip
          //console.log("sortType: ", sortType);
          if (sortDirection) {
            return valA(a.ipaddress).localeCompare(
              valA(b.ipaddress),
              undefined,
              {
                numeric: true,
              }
            );
          } else {
            return valA(b.ipaddress).localeCompare(
              valA(a.ipaddress),
              undefined,
              {
                numeric: true,
              }
            );
          }
        case sortTypes[4]: // bed
          //console.log("sortType: ", sortType);
          if (sortDirection) {
            return valA(a.bed).localeCompare(valA(b.bed), undefined, {
              numeric: true,
            });
          } else {
            return valA(b.bed).localeCompare(valA(a.bed), undefined, {
              numeric: true,
            });
          }
        case sortTypes[5]: // section
          //console.log("sortType: ", sortType);
          if (sortDirection) {
            return valA(a.section).localeCompare(valA(b.section), undefined, {
              numeric: true,
            });
          } else {
            return valA(b.section).localeCompare(valA(a.section), undefined, {
              numeric: true,
            });
          }
        case sortTypes[6]: // floor
          //console.log("sortType: ", sortType);
          if (sortDirection) {
            return valA(a.floor).localeCompare(valA(b.floor), undefined, {
              numeric: true,
            });
          } else {
            return valA(b.floor).localeCompare(valA(a.floor), undefined, {
              numeric: true,
            });
          }
        case sortTypes[7]: // date
          //console.log("sortType: ", sortType);
          if (sortDirection) {
            const dateA = a.Updatedat ? new Date(a.Updatedat) : new Date(0);
            const dateB = b.Updatedat ? new Date(b.Updatedat) : new Date(0);
            return dateB - dateA; // Subtracting dates sorts by timestamp
          } else {
            const dateA = b.Updatedat ? new Date(b.Updatedat) : new Date(0);
            const dateB = a.Updatedat ? new Date(a.Updatedat) : new Date(0);
            return dateB - dateA; // Subtracting dates sorts by timestamp
          }
        case sortTypes[8]: // status
          //console.log("sortType: ", sortType);
          if (sortDirection) {
            return String(b.devicestatus).localeCompare(String(a.devicestatus));
          } else {
            return String(a.devicestatus).localeCompare(String(b.devicestatus));
          }
      }
    });

  const connectedDevicesCount = filteredDevices.filter(
    (device) => device.devicestatus
  ).length;

  {
    /* Handle Overlay Visible */
  }
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const handleAddDeviceClick = (e) => {
    if (["administrator", "engineer"].includes(role)) {
      e.preventDefault();
      setOverlayVisible(!isOverlayVisible);
    }
  };

  return (
    <>
      <div className="box">
        <h1>{t("DeviceList.DeviceList")}</h1>
      </div>
      <div className="container">
        <div className="top-bar">
          <FloorSectionBar
            selectFloor={handleSelectFloor}
            selectSection={handleSelectSection}
            selectDeviceType={handleSelectDeviceType}
            enableDeviceType={true}
          />

          <div className="btn" id="addDevice" onClick={handleAddDeviceClick}>
            <img src="" alt="" className="prefix" />
            <p className="btn-text">{t("DeviceList.NewDevice")}</p>
          </div>
          {isOverlayVisible && (
            <AddNewDevice callback={handleAddDeviceClick} />
          )}
        </div>
        <div className="pl device-list">
          <div className="head">
            <h3
              className={`fg1 ${sortType === sortTypes[0] ? "selected" : ""}`}
              onClick={() => SortType(0)}
            >
              {t("DeviceList.DeviceType")}{" "}
              {sortType === sortTypes[0] &&
                (sortDirection ? "\u25BC" : "\u25B2")}
            </h3>
            <h3
              className={`fg2 ${sortType === sortTypes[1] ? "selected" : ""}`}
              onClick={() => SortType(1)}
            >
              {t("DeviceList.DeviceID")}{" "}
              {sortType === sortTypes[1] &&
                (sortDirection ? "\u25BC" : "\u25B2")}
            </h3>
            <h3
              className={`fg2 ${sortType === sortTypes[2] ? "selected" : ""}`}
              onClick={() => SortType(2)}
            >
              {t("DeviceList.MACAddress")}{" "}
              {sortType === sortTypes[2] &&
                (sortDirection ? "\u25BC" : "\u25B2")}
            </h3>
            <h3
              className={`fg2 ${sortType === sortTypes[3] ? "selected" : ""}`}
              onClick={() => SortType(3)}
            >
              {t("DeviceList.IPAddress")}{" "}
              {sortType === sortTypes[3] &&
                (sortDirection ? "\u25BC" : "\u25B2")}
            </h3>
            <h3
              className={`fg3 ${sortType === sortTypes[4] ? "selected" : ""}`}
              onClick={() => SortType(4)}
            >
              {t("DeviceList.Bed")}{" "}
              {sortType === sortTypes[4] &&
                (sortDirection ? "\u25BC" : "\u25B2")}
            </h3>
            <h3
              className={`fg3 ${sortType === sortTypes[5] ? "selected" : ""}`}
              onClick={() => SortType(5)}
            >
              {t("DeviceList.Section")}{" "}
              {sortType === sortTypes[5] &&
                (sortDirection ? "\u25BC" : "\u25B2")}
            </h3>
            <h3
              className={`fg3 ${sortType === sortTypes[6] ? "selected" : ""}`}
              onClick={() => SortType(6)}
            >
              {t("DeviceList.Floor")}{" "}
              {sortType === sortTypes[6] &&
                (sortDirection ? "\u25BC" : "\u25B2")}
            </h3>
            <h3
              className={`fg1 ${sortType === sortTypes[7] ? "selected" : ""}`}
              onClick={() => SortType(7)}
            >
              {t("DeviceList.SettingDate")}{" "}
              {sortType === sortTypes[7] &&
                (sortDirection ? "\u25BC" : "\u25B2")}
            </h3>
            {/* <h3 className="fg3">PING(ms)</h3> */}
            <h3 className="fg3">RSSI(dBm)</h3>
            <div className="connection fg2" onClick={() => SortType(8)}>
              <h3 className={`${sortType === sortTypes[8] ? "selected" : ""}`}>
                {t("DeviceList.DeviceStatus")}
                {`(${connectedDevicesCount})`}
                {sortType === sortTypes[8] &&
                  (sortDirection ? "\u25BC" : "\u25B2")}
              </h3>
            </div>
          </div>
          <div className="item-list">
            {port === "7284" &&
              filteredDevices.map((device) =>
                ["administrator", "engineer"].includes(role) ? (
                  <Link
                    to={`/device/device-settings?macaddress=${device.macaddress}${ipQuery(device)}`}
                    key={deviceKey(device)}
                  >
                    <div className="item">
                      <h3 className="fg1">
                        {device.devicetype === 0
                          ? "Not Specified"
                          : device.devicetype === 1
                          ? "UEXT"
                          : device.devicetype === 2
                          ? "UMAP"
                          : device.devicetype === 3
                          ? "UNC"
                          : device.devicetype === 201
                          ? "HaLow-R"
                          : "Not Specified"}
                      </h3>
                      <h3 className="fg2">{device.deviceid || "N/A"}</h3>
                      <h3 className="fg2">{device.macaddress || "N/A"}</h3>
                      <h3 className="fg2">{device.ipaddress || "N/A"}</h3>
                      <h3 className="fg3">{device.bed || "N/A"}</h3>
                      <h3 className="fg3">{device.section || "N/A"}</h3>
                      <h3 className="fg3">{device.floor || "N/A"}</h3>
                      <h3 className="fg1">
                        {dayjs(device.Updatedat).format("YYYY-MM-DD") || "N/A"}
                      </h3>
                      {/* <h3 className="fg3">
                        {deviceMap[mapKey(device.__srcIp, device.macaddress)]?.ping ?? "----"}
                      </h3> */}
                      <h3 className="fg3">
                        {deviceMap[mapKey(device.__srcIp, device.macaddress)]?.rssi ?? "----"}
                      </h3>
                      <div
                        className={`connection ${
                          device.devicestatus ? "connected" : "disconnected"
                        } fg2`}
                      >
                        <img src="" alt="" />
                        {/* <h3>
                          {device.devicestatus ? "Connected" : "Disconnected"}
                        </h3> */}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="item" key={deviceKey(device)}>
                    <h3 className="fg1">
                      {device.devicetype === 0
                        ? "Not Specified"
                        : device.devicetype === 1
                        ? "UEXT"
                        : device.devicetype === 2
                        ? "UMAP"
                        : device.devicetype === 3
                        ? "UNC"
                        : device.devicetype === 201
                        ? "HaLow-R"
                        : "Not Specified"}
                    </h3>
                    <h3 className="fg2">{device.deviceid || "N/A"}</h3>
                    <h3 className="fg2">{device.macaddress || "N/A"}</h3>
                    <h3 className="fg2">{device.ipaddress || "N/A"}</h3>
                    <h3 className="fg3">{device.bed || "N/A"}</h3>
                    <h3 className="fg3">{device.section || "N/A"}</h3>
                    <h3 className="fg3">{device.floor || "N/A"}</h3>
                    <h3 className="fg1">
                      {dayjs(device.Updatedat).format("YYYY-MM-DD") || "N/A"}
                    </h3>
                    {/* <h3 className="fg3">
                      {deviceMap[device.macaddress]?.ping ?? "----"}
                    </h3> */}
                    <h3 className="fg3">
                      {deviceMap[device.macaddress]?.rssi ?? "----"}
                    </h3>
                    <div
                      className={`connection ${
                        device.devicestatus ? "connected" : "disconnected"
                      } fg2`}
                    >
                      <img src="" alt="" />
                      {/* <h3>
                          {device.devicestatus ? "Connected" : "Disconnected"}
                        </h3> */}
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DeviceList;
