/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/index.css";
import "../components/Modals/overlay.css";
import Navbar from "/src/components/Navbar.jsx";
import AlertList from "/src/components/AlertList.jsx";
import FloorSectionBar from "../components/FloorSectionBar";
import SignalRService, { SignalRService as SignalRServiceClass } from '../JS/SignalR.js'
import {
  Bed_disconnect,
  Bed_alert,
  Bed_attention,
  Bed_vacant,
  Bed_default,
  Bed_Online,
} from "../components/Bed_Cards";
import { useTranslation } from "react-i18next";
import api from "../api/apiClient";
import api8031 from "../api/apiClient8031";
import { useFloorSection } from "../JS/FloorSectionContext";
import { isSignalREnabled } from "../config/runtimeConfig";

// ─────────────────────────────────────────────────────────
// 取得裝置列表的方式切換（開發時手動改這裡）：
//   false → 原本的 GET /api/8031/devices 輪詢（預設）
//   true  → 改用 SignalR 推播（topic: "web/notify/devices"，訊息內容與 GET response 相同）
// 兩種方式都支援指定樓層或選 All（All 會逐台連線/抓取後合併）。
// ─────────────────────────────────────────────────────────
// 走 runtimeConfig，正式環境可用 docker run -e VITE_SIGNALR_ENABLE=true 切換，不必重 build
const USE_SIGNALR_DEVICES = isSignalREnabled();
const DEVICE_TOPIC = "web/notify/devices";

function Home() {
  const { t, i18n } = useTranslation();

  // 所有樓層/區域對應的後端清單（每筆 { ip, floor, section }），
  // 供「All」模式逐台抓取所有 device。
  const { servers, selectedServer } = useFloorSection();

  const [port, setPort] = useState("8031");
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
    //console.log("section");
    setSelect_Section(section);
  };

  // uneo-sd-demo

  const [fakeList, setFakeList] = useState([
    // UEXT / REST / GREEN
    {
      STAT: 1,
      POS: 1,
      MAC: "A1",
      HOLD: 0,
      Bed: "4201",
      Floor: "All",
      Section: "All",
      UserName: "UEXT/REST/GEEN",
      TYPE: 1,
      BedColor: 0,
      constant: true,
      clickable: false,
    },
    // UEXT / EDGE / YELLOW
    {
      STAT: 1,
      POS: 3,
      MAC: "A2",
      HOLD: 0,
      Bed: "4202",
      Floor: "All",
      Section: "All",
      UserName: "UEXT/EDGE/YELLOW",
      TYPE: 1,
      BedColor: 2,
      constant: false,
      clickable: false,
    },
    // UEXT / LEAVE / RED
    {
      STAT: 1,
      POS: 4,
      MAC: "A3",
      HOLD: 0,
      Bed: "4203",
      Floor: "All",
      Section: "All",
      UserName: "UEXT/LEAVE/RED",
      TYPE: 1,
      BedColor: 1,
      constant: false,
      clickable: false,
    },
    // UMAP / REST / GREEN
    {
      STAT: 1,
      POS: 1,
      MAC: "A4",
      HOLD: 0,
      Bed: "4204",
      Floor: "All",
      Section: "All",
      UserName: "UMAP/REST/GREEN",
      TYPE: 2,
      BedColor: 0,
      constant: false,
      clickable: false,
    },
    // UMAP / REST / YELLOW
    {
      STAT: 1,
      POS: 1,
      MAC: "A5",
      HOLD: 0,
      Bed: "4301",
      Floor: "All",
      Section: "All",
      UserName: "UMAP/REST/YELLOW",
      TYPE: 2,
      BedColor: 2,
      constant: true,
      clickable: false,
    },
    // UMAP / REST / RED
    {
      STAT: 1,
      POS: 1,
      MAC: "A7",
      HOLD: 0,
      Bed: "4302",
      Floor: "All",
      Section: "All",
      UserName: "UMAP/REST/RED",
      TYPE: 2,
      BedColor: 1,
      constant: false,
      clickable: false,
    },
    // UMAP / LEFT / GREEN
    {
      STAT: 1,
      POS: 6,
      MAC: "A8",
      HOLD: 0,
      Bed: "4303",
      Floor: "All",
      Section: "All",
      UserName: "UMAP/LEFT/GREEN",
      TYPE: 2,
      BedColor: 0,
      constant: false,
      clickable: false,
    },
    // UMAP / LEFT / YELLOW
    {
      STAT: 1,
      POS: 6,
      MAC: "A9",
      HOLD: 0,
      Bed: "4304",
      Floor: "All",
      Section: "All",
      UserName: "UMAP/LEFT/YELLOW",
      TYPE: 2,
      BedColor: 2,
      constant: false,
      clickable: false,
    },
    // UMAP / LEFT / RED
    {
      STAT: 1,
      POS: 6,
      MAC: "A10",
      HOLD: 0,
      Bed: "4401",
      Floor: "All",
      Section: "All",
      UserName: "UMAP/LEFT/RED",
      TYPE: 2,
      BedColor: 1,
      constant: false,
      clickable: false,
    },
    // UMAP / RIGHT / GREEN
    {
      STAT: 1,
      POS: 7,
      MAC: "A11",
      HOLD: 0,
      Bed: "4402",
      Floor: "All",
      Section: "All",
      UserName: "UMAP/RIGHT/GREEN",
      TYPE: 2,
      BedColor: 0,
      constant: true,
      clickable: false,
    },
    // UMAP / RIGHT / YELLOW
    {
      STAT: 1,
      POS: 7,
      MAC: "A12",
      HOLD: 0,
      Bed: "4403",
      Floor: "All",
      Section: "All",
      UserName: "UMAP/RIGHT/YELLOW",
      TYPE: 2,
      BedColor: 2,
      constant: false,
      clickable: false,
    },
    // UMAP / RIGHT / RED
    {
      STAT: 1,
      POS: 7,
      MAC: "A13",
      HOLD: 0,
      Bed: "4501",
      Floor: "All",
      Section: "All",
      UserName: "UMAP/RIGHT/RED",
      TYPE: 2,
      BedColor: 1,
      constant: false,
      clickable: false,
    },
    // UMAP / LEAVE / RED
    {
      STAT: 1,
      POS: 4,
      MAC: "A15",
      HOLD: 0,
      Bed: "4502",
      Floor: "All",
      Section: "All",
      UserName: "UMAP/LEAVE/RED",
      TYPE: 2,
      BedColor: 0,
      constant: false,
      clickable: false,
    },
    // UEXT VACANT
    {
      STAT: 1,
      POS: 4,
      MAC: "A16",
      HOLD: 0,
      Bed: "4503",
      Floor: "All",
      Section: "All",
      UserName: "",
      TYPE: 1,
      BedColor: 2,
      constant: false,
      clickable: false,
    },
    // UMAP VACANT
    {
      STAT: 1,
      POS: 7,
      MAC: "A17",
      HOLD: 0,
      Bed: "4601",
      Floor: "All",
      Section: "All",
      UserName: "",
      TYPE: 2,
      BedColor: 1,
      constant: false,
      clickable: false,
    },
    // UEXT DISCONNECT
    {
      STAT: 0,
      POS: 3,
      MAC: "A18",
      HOLD: 0,
      Bed: "4602",
      Floor: "All",
      Section: "All",
      UserName: "",
      TYPE: 1,
      BedColor: 2,
      constant: true,
      clickable: false,
    },
    // UMAP DISCONNECT
    {
      STAT: 0,
      POS: 4,
      MAC: "A19",
      HOLD: 0,
      Bed: "4603",
      Floor: "All",
      Section: "All",
      UserName: "",
      TYPE: 2,
      BedColor: 0,
      constant: true,
      clickable: false,
    },
  ]);

  // 2. The Logic to update colors
  useEffect(() => {
    const interval = setInterval(() => {
      setFakeList((prevList) => {
        return prevList.map((device) => {
          // check if constant is false
          if (!device.constant) {
            const newColor = Math.floor(Math.random() * 3); // 0, 1, or 2
            // //console.log(`Updating Bed ${device.Bed} color to: ${newColor}`);
            return {
              ...device,
              BedColor: newColor,
            };
          }
          return device;
        });
      });
    }, 5000); // Run every 5 seconds

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  // const [devices, setDevices] = useState([]);

  // const fetchDeviceList = async () => {
  //   try {
  //     if (port === "8031") {
  //       if (import.meta.env.VITE_MODE === "dev") {
  //         const response = await fetch("/api/7284/ss/SocketServer");
  //         if (!response.ok) {
  //           throw new Error(`HTTP error! status: ${response.status}`);
  //         }
  //         const data = await response.json();
  //         //console.log("ss/SocketServer: ", data);
  //         const devicesNonHalow = data.filter((device) => device.TYPE !== 201);
  //         const combinedDeviceList = [...devicesNonHalow, ...fakeList];

  //         setDevices(fakeList || []);
  //       } else {
  //         const response = await fetch("/api/8031/devices");
  //         if (!response.ok) {
  //           throw new Error(`HTTP error! status: ${response.status}`);
  //         }
  //         const data = await response.json();
  //         //console.log(data.DATA);
  //         const devicesNonHalow = data.DATA.filter(
  //           (device) => device.TYPE !== 201,
  //         );
  //         const combinedDeviceList = [...devicesNonHalow, ...fakeList];

  //         setDevices(combinedDeviceList || []);
  //       }
  //       // //console.log("the current is ", getServerIp());
  //     } else if (port === "7284") {
  //       const response = await fetch("/api/7284/db/Device");
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const data = await response.json();
  //       //console.log(data);
  //       setDevices(data || []);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching device data:", error);
  //   }
  // };
  // useEffect(() => {
  //   fetchDeviceList();
  //   const interval = setInterval(fetchDeviceList, 1000);
  //   return () => clearInterval(interval);
  // }, [port, fakeList]);
  const [select_deviceType, setSelect_DeviceType] = useState("");
  const handleSelectDeviceType = (deviceType) => {
    setSelect_DeviceType(deviceType);
  };

  const [devices, setDevices] = useState([]);

  // 依 select_floor / select_section 決定要抓哪些後端：
  //   - floor === "All"            → 抓「所有」server 的 device
  //   - section === "All"          → 抓該樓層底下「所有」區域的 server
  //   - 其他（指定 floor + section）→ null，維持原本走目前選取單一 server 的行為
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

  // 從「單一」server 抓 device 清單。傳入 targetIp 時，用 header 把請求釘在該台；
  // 不傳時走目前選取的 server（原本行為）。
  const fetchDevicesFrom = async (targetIp) => {
    const cfg = targetIp ? { targetIp } : undefined;
    if (port === "8031") {
      if (import.meta.env.VITE_MODE === "dev") {
        const response = await api.get("/api/7284/ss/SocketServer", cfg);
        const data = response.data || [];
        return data.filter((device) => device.TYPE !== 201);
      } else {
        const response = await api8031.get("/api/8031/devices", cfg);
        const data = response.data?.DATA || [];
        return data.filter((device) => device.TYPE !== 201);
      }
    } else if (port === "7284") {
      const response = await api.get("/api/7284/db/Device", cfg);
      return response.data || [];
    }
    return [];
  };

  const fetchDeviceList = async () => {
    try {
      if (targetIps) {
        // 「All」模式：逐台抓取後合併。單台失敗不影響其他台。
        // 把來源 IP 標在每筆 device 上（__srcIp），這樣：
        //   1. 不同 server 之間即使 MAC / 床號重複，也不會互相覆蓋而被吃掉，
        //   2. React key 可用 __srcIp+MAC 保證唯一，避免重複 key 讓第二台的裝置不顯示。
        const results = await Promise.all(
          targetIps.map((ip) =>
            fetchDevicesFrom(ip)
              .then((list) => list.map((d) => ({ ...d, __srcIp: ip })))
              .catch((err) => {
                console.error(`Error fetching devices from ${ip}:`, err);
                return [];
              }),
          ),
        );
        // setDevices([...fakeList,results.flat()]);
        setDevices(results.flat());
      } else {
        setDevices(await fetchDevicesFrom());
      }
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  // ── 方式 A：GET API 輪詢（USE_SIGNALR_DEVICES = false 時啟用，維持原本行為）──
  useEffect(() => {
    if (USE_SIGNALR_DEVICES) return; // 改用 SignalR 時不跑 GET 輪詢
    fetchDeviceList();
    const interval = setInterval(fetchDeviceList, 1000);
    return () => clearInterval(interval);
  }, [port, select_floor, select_section, servers]);

  // ── 方式 B：SignalR 推播（USE_SIGNALR_DEVICES = true 時啟用）──
  // 要連線/訂閱的後端 IP：All 模式用 targetIps（多台）；單一模式用目前選取的 server。
  const deviceSignalrIps = useMemo(() => {
    if (targetIps) return targetIps; // All 模式
    return selectedServer?.ip ? [selectedServer.ip] : [];
  }, [targetIps, selectedServer]);

  // 專用的 SignalR 實例（與 AlertList 的連線隔離，避免互相蓋掉）
  const deviceSignalRRef = useRef(null);
  if (!deviceSignalRRef.current) deviceSignalRRef.current = new SignalRServiceClass();
  // 各台推來的最新裝置清單，key = 來源 IP；合併後即為畫面上的 devices
  const deviceListByIpRef = useRef({});

  useEffect(() => {
    if (!USE_SIGNALR_DEVICES) return;
    if (!deviceSignalrIps.length) return;
    const svc = deviceSignalRRef.current;
    // 切換樓層/區域(涵蓋 IP 改變)時，先清掉舊資料再重新訂閱
    deviceListByIpRef.current = {};
    setDevices([]);

    const handleDeviceMessage = (topic, message, ip) => {
      if (topic !== DEVICE_TOPIC) return; // 只處理裝置列表推播
      // console.log(`[${new Date().toLocaleTimeString()}] | ${message}`);
      let data;
      try {
        data = typeof message === "string" ? JSON.parse(message) : message;
      } catch {
        return;
      }
      // 訊息內容與 GET response 相同：可能是陣列，或 { DATA: [...] }
      const rawList = Array.isArray(data) ? data : data?.DATA || [];
      const list = rawList
        .filter((d) => d.TYPE !== 201)
        .map((d) => ({ ...d, __srcIp: ip })); // 標來源 IP，避免跨台 MAC 重複互相覆蓋
      deviceListByIpRef.current = {
        ...deviceListByIpRef.current,
        [ip ?? "default"]: list,
      };
      setDevices(Object.values(deviceListByIpRef.current).flat());
    };

    const init = async () => {
      // handler 當參數傳進去，startConnections 會在每條連線 start() 之前先綁好。
      // 否則先連上的後端在「等其他台連完」的期間推來的訊息會被丟掉，
      // console 也會洗出 "No client method with the name 'receivemessage' found."
      await svc.startConnections(deviceSignalrIps, handleDeviceMessage);
    };
    init();

    return () => {
      svc.stopConnections();
    };
  }, [deviceSignalrIps]);

  const renderDeviceComponent = (device) => {
    const {
      STAT,
      POS,
      MAC,
      HOLD,
      Bed,
      Floor,
      Section,
      UserName,
      TYPE,
      BedColor,
      IsAlert
    } = device;
    // 「All」模式下不同 server 可能有相同 MAC，用來源 IP 前綴保證 React key 唯一
    const rowKey = deviceKey(device);

    // 先以STAT去區分on/off-line，再以TYPE區分UEXT/UMAP，最後以POS區分狀態
    if (STAT === 0) {
      if (TYPE !== 0) {
        return (
          <Link
            to={`/device/device-settings?macaddress=${MAC}${ipQuery(device)}`}
            key={rowKey}
            state={{ from: "/home" }}
          >
            <Bed_disconnect
              key={MAC}
              macaddress={MAC}
              hold={formatSecondsToDHMS(HOLD)}
              bed={Bed}
              floor={Floor}
              section={Section}
              username={UserName}
              deviceType={TYPE}
            />
          </Link>
        );
      }
    } else if (STAT === 1) {
      if (UserName === null || UserName === "") {
        return (
          <Bed_vacant
            key={rowKey}
            macaddress={MAC}
            bed={Bed}
            floor={Floor}
            section={Section}
          />
        );
      } else {
        return (
          <Link
            to={`/patient/patient-detail/patient-monitor?macaddress=${MAC}${ipQuery(device)}`}
            key={rowKey}
            state={{ from: "/home" }}
          >
            <Bed_Online
              key={MAC}
              macaddress={MAC}
              hold={formatSecondsToDHMS(HOLD)}
              bed={Bed}
              username={UserName}
              pos={POS}
              color={BedColor}
              deviceType={TYPE}
              isAlertSet = {IsAlert}
            />
          </Link>
        );
      }
    }

    return null; // Handle any unexpected case if necessary
  };

  // React key / 唯一識別：「All」模式下同 MAC 可能來自不同 server，前綴來源 IP 以避免衝突
  const deviceKey = (device) =>
    device.__srcIp ? `${device.__srcIp}-${device.MAC}` : device.MAC;

  // 「All」模式下，把裝置所屬 server 的 IP 帶進詳情頁網址，
  // 讓 PatientDetail / DeviceSettings 能把後續請求釘在正確那台（否則會 fallback 到預設台）。
  const ipQuery = (device) => (device.__srcIp ? `&ip=${device.__srcIp}` : "");

  const formatSecondsToDHMS = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    const dateTime =
      days > 0
        ? `${String(days).padStart(2, "0")}:${String(hours).padStart(
            2,
            "0",
          )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
            2,
            "0",
          )}`
        : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0",
          )}:${String(seconds).padStart(2, "0")}`;

    return dateTime;
  };

  const sortAlphabet = (a, b) => {
    const aDigits = a.Bed?.toUpperCase() || "";
    const bDigits = b.Bed?.toUpperCase() || "";
    // Sort alphabetically first
    if (aDigits < bDigits) return -1;
    if (aDigits > bDigits) return 1;
    // If alphabetical order is the same, sort numerically
    const numA = parseInt(a.Bed?.replace(/[^0-9]/g, "") || "0", 10);
    const numB = parseInt(b.Bed?.replace(/[^0-9]/g, "") || "0", 10);

    return numA - numB; // Numeric ascending order
  };

  {
    /* Handle Sort by BED/STATUS */
  }
  const [sortBy, setSortBy] = useState(
    () => localStorage.getItem("sort_by") || "bed",
  );

  const handleToggleSort = (type) => {
    setSortBy(type);
    localStorage.setItem("sort_by", type); // Persist the selected sort type
  };

  // Sync with localStorage on mount
  useEffect(() => {
    const storedSort = localStorage.getItem("sort_by");
    if (storedSort) {
      setSortBy(storedSort);
    }
    console.log("USE_SIGNALR_DEVICES:", USE_SIGNALR_DEVICES);
  }, []);

  {
    /* 依目前 deviceType 篩選後，各狀態的裝置數量（顯示在 status 分類標題旁）。
       每個判斷式與下方各狀態 grid 的 filter 條件一致。 */
  }
  const matchesDeviceType = (device) =>
    select_deviceType === "" ||
    select_deviceType === "All" ||
    device.TYPE === select_deviceType;

  const isBedType = (device) => device.TYPE === 1 || device.TYPE === 2;
  const hasUser = (device) =>
    !(device.UserName === null || device.UserName === "");

  const statusCounts = {
    alerts: devices.filter(
      (d) =>
        matchesDeviceType(d) &&
        isBedType(d) &&
        d.STAT === 1 &&
        d.BedColor === 1 &&
        hasUser(d),
    ).length,
    attention: devices.filter(
      (d) =>
        matchesDeviceType(d) &&
        isBedType(d) &&
        d.STAT === 1 &&
        hasUser(d) &&
        d.BedColor === 2,
    ).length,
    normal: devices.filter(
      (d) =>
        matchesDeviceType(d) &&
        isBedType(d) &&
        d.STAT === 1 &&
        hasUser(d) &&
        d.BedColor === 0,
    ).length,
    vacant: devices.filter(
      (d) => matchesDeviceType(d) && isBedType(d) && d.STAT === 1 && !hasUser(d),
    ).length,
    disconnected: devices.filter(
      (d) => matchesDeviceType(d) && isBedType(d) && d.STAT === 0,
    ).length,
  };

  return (
    <>
      <Navbar />
      <div className="wrap">
        <AlertList />
        <div className="main">
          <div className="box">
            <h1>{t("Home.Monitor")}</h1>
          </div>
          <div className="monitors">
            <div className="top-bar">
              <FloorSectionBar
                selectFloor={handleSelectFloor}
                selectSection={handleSelectSection}
                selectDeviceType={handleSelectDeviceType}
                enableDeviceType={true}
              />
              <div className="sort">
                <div className="label">{t("Home.Sortby")}</div>
                <div className="opt-box">
                  <div
                    className={`opt s1 ${sortBy === "bed" ? "active" : ""}`}
                    onClick={() => handleToggleSort("bed")}
                  >
                    {t("Home.Bed")}
                  </div>
                  <div
                    className={`opt s2 ${sortBy === "bed" ? "" : "active"}`}
                    onClick={() => handleToggleSort("status")}
                  >
                    {t("Home.Status")}
                  </div>
                  <div
                    className={`bg-bk ${sortBy === "bed" ? "s1" : "s2"}`}
                  ></div>
                </div>
              </div>
            </div>
            {/* Bed Grid Sort by Bed */}
            <div className={`grid ${sortBy === "bed" ? "active" : ""}`}>
              {devices
                .slice()
                .filter((device) => {
                  return (
                    select_deviceType === "" ||
                    select_deviceType === "All" ||
                    device.TYPE === select_deviceType
                  );
                })
                // .filter((device) => {
                //   return (
                //     select_floor === "" ||
                //     select_floor === "All" ||
                //     device.Floor === select_floor
                //   );
                // })
                // .filter((device) => {
                //   return (
                //     select_section === "" ||
                //     select_section === "All" ||
                //     device.Section === select_section
                //   );
                // })
                .sort(sortAlphabet)
                .map((device) => renderDeviceComponent(device))}
            </div>
            {/* Bed Grid Sort by Status */}
            <div className={`by-status ${sortBy === "bed" ? "" : "active"}`}>
              {/* Alert Status */}
              {devices
                // .filter((device) => {
                //   return (
                //     select_floor === "" ||
                //     select_floor === "All" ||
                //     device.Floor === select_floor
                //   );
                // })
                // .filter((device) => {
                //   return (
                //     select_section === "" ||
                //     select_section === "All" ||
                //     device.Section === select_section
                //   );
                // })
                .filter((device) => {
                  return (
                    select_deviceType === "" ||
                    select_deviceType === "All" ||
                    device.TYPE === select_deviceType
                  );
                })
                .some(
                  (device) =>
                    (device.TYPE === 1 || device.TYPE === 2) &&
                    device.STAT === 1 &&
                    device.BedColor === 1 &&
                    !(device.UserName === null || device.UserName === ""),
                ) && (
                <div className="status">
                  <div className="title">
                    {t("Home.Alerts")} ({statusCounts.alerts})
                  </div>
                  <div className="status-grid">
                    {devices
                      // .filter((device) => {
                      //   return (
                      //     select_floor === "" ||
                      //     select_floor === "All" ||
                      //     device.Floor === select_floor
                      //   );
                      // })
                      // .filter((device) => {
                      //   return (
                      //     select_section === "" ||
                      //     select_section === "All" ||
                      //     device.Section === select_section
                      //   );
                      // })
                      .filter((device) => {
                        return (
                          select_deviceType === "" ||
                          select_deviceType === "All" ||
                          device.TYPE === select_deviceType
                        );
                      })
                      .filter(
                        (device) =>
                          (device.TYPE === 1 || device.TYPE === 2) &&
                          device.STAT === 1 &&
                          device.BedColor === 1 &&
                          !(device.UserName === null || device.UserName === ""),
                      )
                      .sort(sortAlphabet)
                      .map((device) => (
                        <Link
                          to={`/patient/patient-detail/patient-monitor?macaddress=${device.MAC}${ipQuery(device)}`}
                          key={deviceKey(device)}
                          state={{ from: "/home" }}
                        >
                          <Bed_Online
                            key={device.MAC}
                            macaddress={device.MAC}
                            hold={formatSecondsToDHMS(device.HOLD)}
                            bed={device.Bed}
                            floor={device.Floor}
                            section={device.Section}
                            username={device.UserName}
                            pos={device.POS}
                            color={device.BedColor}
                            deviceType={device.TYPE}
                            isAlertSet = {device.IsAlert}
                          />
                        </Link>
                      ))}
                  </div>
                </div>
              )}
              {/* Attention Status */}
              {devices
                // .filter((device) => {
                //   return (
                //     select_floor === "" ||
                //     select_floor === "All" ||
                //     device.Floor === select_floor
                //   );
                // })
                // .filter((device) => {
                //   return (
                //     select_section === "" ||
                //     select_section === "All" ||
                //     device.Section === select_section
                //   );
                // })
                .filter((device) => {
                  return (
                    select_deviceType === "" ||
                    select_deviceType === "All" ||
                    device.TYPE === select_deviceType
                  );
                })
                .some(
                  (device) =>
                    (device.TYPE === 1 || device.TYPE === 2) &&
                    device.STAT === 1 &&
                    !(device.UserName === null || device.UserName === "") &&
                    device.BedColor === 2,
                ) && (
                <div className="status">
                  <div className="title">
                    {t("Home.Attention")} ({statusCounts.attention})
                  </div>
                  <div className="status-grid">
                    {devices
                      // .filter((device) => {
                      //   return (
                      //     select_floor === "" ||
                      //     select_floor === "All" ||
                      //     device.Floor === select_floor
                      //   );
                      // })
                      // .filter((device) => {
                      //   return (
                      //     select_section === "" ||
                      //     select_section === "All" ||
                      //     device.Section === select_section
                      //   );
                      // })
                      .filter((device) => {
                        return (
                          select_deviceType === "" ||
                          select_deviceType === "All" ||
                          device.TYPE === select_deviceType
                        );
                      })
                      .filter(
                        (device) =>
                          (device.TYPE === 1 || device.TYPE === 2) &&
                          device.STAT === 1 &&
                          !(
                            device.UserName === null || device.UserName === ""
                          ) &&
                          device.BedColor === 2,
                      )
                      .sort(sortAlphabet)
                      .map((device) => (
                        <Link
                          to={`/patient/patient-detail/patient-monitor?macaddress=${device.MAC}${ipQuery(device)}`}
                          key={deviceKey(device)}
                          state={{ from: "/home" }}
                        >
                          <Bed_Online
                            key={device.MAC}
                            macaddress={device.MAC}
                            hold={formatSecondsToDHMS(device.HOLD)}
                            bed={device.Bed}
                            floor={device.Floor}
                            section={device.Section}
                            username={device.UserName}
                            pos={device.POS}
                            deviceType={device.TYPE}
                            color={device.BedColor}
                            isAlertSet = {device.IsAlert}
                          />
                        </Link>
                      ))}
                  </div>
                </div>
              )}
              {/* Default Status */}
              {devices
                // .filter((device) => {
                //   return (
                //     select_floor === "" ||
                //     select_floor === "All" ||
                //     device.Floor === select_floor
                //   );
                // })
                // .filter((device) => {
                //   return (
                //     select_section === "" ||
                //     select_section === "All" ||
                //     device.Section === select_section
                //   );
                // })
                .filter((device) => {
                  return (
                    select_deviceType === "" ||
                    select_deviceType === "All" ||
                    device.TYPE === select_deviceType
                  );
                })
                .some(
                  (device) =>
                    (device.TYPE === 1 || device.TYPE === 2) &&
                    device.STAT === 1 &&
                    !(device.UserName === null || device.UserName === "") &&
                    device.BedColor === 0,
                ) && (
                <div className="status">
                  <div className="title">
                    {t("Home.Normal")} ({statusCounts.normal})
                  </div>
                  <div className="status-grid">
                    {devices
                      // .filter((device) => {
                      //   return (
                      //     select_floor === "" ||
                      //     select_floor === "All" ||
                      //     device.Floor === select_floor
                      //   );
                      // })
                      // .filter((device) => {
                      //   return (
                      //     select_section === "" ||
                      //     select_section === "All" ||
                      //     device.Section === select_section
                      //   );
                      // })
                      .filter((device) => {
                        return (
                          select_deviceType === "" ||
                          select_deviceType === "All" ||
                          device.TYPE === select_deviceType
                        );
                      })
                      .filter(
                        (device) =>
                          (device.TYPE === 1 || device.TYPE === 2) &&
                          device.STAT === 1 &&
                          !(
                            device.UserName === null || device.UserName === ""
                          ) &&
                          device.BedColor === 0,
                      )
                      .sort(sortAlphabet)
                      .map((device) => (
                        <Link
                          to={`/patient/patient-detail/patient-monitor?macaddress=${device.MAC}${ipQuery(device)}`}
                          key={deviceKey(device)}
                          state={{ from: "/home" }}
                        >
                          <Bed_Online
                            key={device.MAC}
                            macaddress={device.MAC}
                            hold={formatSecondsToDHMS(device.HOLD)}
                            bed={device.Bed}
                            floor={device.Floor}
                            section={device.Section}
                            username={device.UserName}
                            pos={device.POS}
                            color={device.BedColor}
                            deviceType={device.TYPE}
                            isAlertSet = {device.IsAlert}
                          />
                        </Link>
                      ))}
                  </div>
                </div>
              )}
              {/* Vacant Status */}
              {devices
                // .filter((device) => {
                //   return (
                //     select_floor === "" ||
                //     select_floor === "All" ||
                //     device.Floor === select_floor
                //   );
                // })
                // .filter((device) => {
                //   return (
                //     select_section === "" ||
                //     select_section === "All" ||
                //     device.Section === select_section
                //   );
                // })
                .filter((device) => {
                  return (
                    select_deviceType === "" ||
                    select_deviceType === "All" ||
                    device.TYPE === select_deviceType
                  );
                })
                .some(
                  (device) =>
                    (device.TYPE === 1 || device.TYPE === 2) &&
                    device.STAT === 1 &&
                    (device.UserName === null || device.UserName === ""),
                ) && (
                <div className="status">
                  <div className="title">
                    {t("Home.Vacant")} ({statusCounts.vacant})
                  </div>
                  <div className="status-grid">
                    {devices
                      // .filter((device) => {
                      //   return (
                      //     select_floor === "" ||
                      //     select_floor === "All" ||
                      //     device.Floor === select_floor
                      //   );
                      // })
                      // .filter((device) => {
                      //   return (
                      //     select_section === "" ||
                      //     select_section === "All" ||
                      //     device.Section === select_section
                      //   );
                      // })
                      .filter((device) => {
                        return (
                          select_deviceType === "" ||
                          select_deviceType === "All" ||
                          device.TYPE === select_deviceType
                        );
                      })
                      .filter(
                        (device) =>
                          (device.TYPE === 1 || device.TYPE === 2) &&
                          device.STAT === 1 &&
                          (device.UserName === null || device.UserName === ""),
                      )
                      .sort(sortAlphabet)
                      .map((device) => (
                        <Bed_vacant
                          key={deviceKey(device)}
                          macaddress={device.MAC}
                          bed={device.Bed}
                          floor={device.Floor}
                          section={device.Section}
                        />
                      ))}
                  </div>
                </div>
              )}
              {/* Disconnected Status */}
              {devices
                // .filter((device) => {
                //   return (
                //     select_floor === "" ||
                //     select_floor === "All" ||
                //     device.Floor === select_floor
                //   );
                // })
                // .filter((device) => {
                //   return (
                //     select_section === "" ||
                //     select_section === "All" ||
                //     device.Section === select_section
                //   );
                // })
                .filter((device) => {
                  return (
                    select_deviceType === "" ||
                    select_deviceType === "All" ||
                    device.TYPE === select_deviceType
                  );
                })
                .some(
                  (device) =>
                    (device.TYPE === 1 || device.TYPE === 2) &&
                    device.STAT === 0,
                ) && (
                <div className="status">
                  <div className="title">
                    {t("Home.Disconnected")} ({statusCounts.disconnected})
                  </div>
                  <div className="status-grid">
                    {devices
                      // .filter((device) => {
                      //   return (
                      //     select_floor === "" ||
                      //     select_floor === "All" ||
                      //     device.Floor === select_floor
                      //   );
                      // })
                      // .filter((device) => {
                      //   return (
                      //     select_section === "" ||
                      //     select_section === "All" ||
                      //     device.Section === select_section
                      //   );
                      // })
                      .filter((device) => {
                        return (
                          select_deviceType === "" ||
                          select_deviceType === "All" ||
                          device.TYPE === select_deviceType
                        );
                      })
                      .filter(
                        (device) =>
                          (device.TYPE === 1 || device.TYPE === 2) &&
                          device.STAT === 0,
                      )
                      .sort(sortAlphabet)
                      .map((device) => (
                        <Link
                          to={`/device/device-settings?macaddress=${device.MAC}${ipQuery(device)}`}
                          key={deviceKey(device)}
                          state={{ from: "/home" }}
                        >
                          <Bed_disconnect
                            key={device.MAC}
                            macaddress={device.MAC}
                            hold={formatSecondsToDHMS(device.HOLD)}
                            bed={device.Bed}
                            floor={device.Floor}
                            section={device.Section}
                            username={device.UserName}
                            deviceType={device.TYPE}
                          />
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
