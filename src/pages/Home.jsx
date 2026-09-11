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
import AddNewBed from "../components/Modals/AddNewBed";
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

  // 所有區域對應的後端清單（每筆 { ip, section }），
  // 供「All」模式逐台抓取所有 device。
  const { servers, selectedServer } = useFloorSection();

  const [port, setPort] = useState("8031");
  const handleSelectPort = (port) => {
    //console.log(port);
    setPort(port);
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

  // 依 select_section 決定要抓哪些後端：
  //   - section === "All" → 抓「所有」server 的 device
  //   - 其他（指定 section）→ null，維持原本走目前選取單一 server 的行為
  const targetIps = useMemo(() => {
    if (select_section === "All") {
      return [...new Set(servers.map((s) => s.ip).filter(Boolean))];
    }
    return null;
  }, [servers, select_section]);

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
  }, [port, select_section, servers]);

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

  // ─────────────────────────────────────────────────────────
  // 床位列表：畫面上的卡片改以 /api/7284/db/Bed 為主體
  // （原本是以 /api/8031/devices 的裝置為主體）。
  // 狀態仍沿用 8031 裝置資料判斷，只是改成「先有床位、再去找它綁的裝置」。
  // ─────────────────────────────────────────────────────────
  const [beds, setBeds] = useState([]);

  const fetchBedsFrom = async (targetIp) => {
    const cfg = targetIp ? { targetIp } : undefined;
    const response = await api.get("/api/7284/db/Bed", cfg);
    return response.data || [];
  };

  const fetchBedList = async () => {
    try {
      if (targetIps) {
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

  // 床位的異動（新增/綁定/解除）頻率遠低於量測資料，5 秒輪詢即可；
  // 開著 modal 時暫停，避免編輯中列表在背景被換掉。
  const isBedModalOpenRef = useRef(false);

  useEffect(() => {
    fetchBedList();
    const interval = setInterval(() => {
      if (isBedModalOpenRef.current) return;
      fetchBedList();
    }, 5000);
    return () => clearInterval(interval);
  }, [select_section, servers]);

  {
    /* 點空床卡片 → 開 AddNewBed（編輯模式）讓使用者綁定裝置 */
  }
  const [editingBed, setEditingBed] = useState(null);
  isBedModalOpenRef.current = Boolean(editingBed);

  const handleCloseBedModal = () => setEditingBed(null);

  {
    /* 把床位和它綁定的裝置接起來：bed.deviceId ↔ 8031 裝置的 MAC。
       All 模式下不同後端可能有相同 MAC，所以 key 要連同來源 IP 一起比。 */
  }
  const deviceMapKey = (srcIp, mac) =>
    `${srcIp ?? ""}|${String(mac ?? "").toUpperCase()}`;

  const bedCards = useMemo(() => {
    const deviceMap = new Map();
    devices.forEach((d) => {
      if (!d.MAC) return;
      deviceMap.set(deviceMapKey(d.__srcIp, d.MAC), d);
    });

    return beds.map((bed) => {
      const device = bed.deviceId
        ? deviceMap.get(deviceMapKey(bed.__srcIp, bed.deviceId))
        : undefined;

      // 狀態判斷（沿用原本 8031 的邏輯）：
      //   沒綁裝置                        → vacant
      //   綁了但抓不到裝置 / STAT === 0   → disconnect
      //   STAT === 1                      → 依 BedColor：1 alert / 2 attention / 其他 default
      let status;
      if (!bed.deviceId) {
        status = "vacant";
      } else if (!device || device.STAT === 0) {
        status = "disconnect";
      } else if (device.BedColor === 1) {
        status = "alert";
      } else if (device.BedColor === 2) {
        status = "attention";
      } else {
        status = "default";
      }

      return { bed, device, status, Bed: bed.bedId };
    });
  }, [beds, devices]);

  {
    /* deviceType 篩選：空床沒有裝置，沒有 TYPE 可比，
       所以只有在「All / 未指定」時才顯示。 */
  }
  const matchesDeviceType = (card) =>
    select_deviceType === "" ||
    select_deviceType === "All" ||
    card.device?.TYPE === select_deviceType;

  const visibleCards = bedCards.filter(matchesDeviceType);

  const cardsOf = (status) =>
    visibleCards.filter((c) => c.status === status).sort(sortAlphabet);

  const statusCounts = {
    alerts: visibleCards.filter((c) => c.status === "alert").length,
    attention: visibleCards.filter((c) => c.status === "attention").length,
    normal: visibleCards.filter((c) => c.status === "default").length,
    vacant: visibleCards.filter((c) => c.status === "vacant").length,
    disconnected: visibleCards.filter((c) => c.status === "disconnect").length,
  };

  // 「All」模式下同 bedId 可能來自不同 server，前綴來源 IP 以避免 React key 衝突
  const bedKey = (bed) =>
    bed.__srcIp ? `${bed.__srcIp}-${bed.bedId}` : bed.bedId;

  const bedIpQuery = (bed) => (bed.__srcIp ? `&ip=${bed.__srcIp}` : "");

  // 卡片上顯示的住民名稱：優先用裝置回報的 UserName，沒有就退回床位綁定的住民編號
  const cardName = (card) => card.device?.UserName || card.bed.patientId || "";

  const renderBedCard = (card) => {
    const { bed, device, status } = card;
    const key = bedKey(bed);

    // 空床（沒綁裝置）→ 點擊開 modal 綁定裝置
    if (status === "vacant") {
      return (
        <Bed_vacant key={key} bed={bed.bedId} onClick={() => setEditingBed(bed)} />
      );
    }

    // 斷線 → 維持原本導到裝置設定頁
    if (status === "disconnect") {
      return (
        <Link
          to={`/device/device-settings?macaddress=${bed.deviceId}${bedIpQuery(bed)}`}
          key={key}
          state={{ from: "/home" }}
        >
          <Bed_disconnect
            macaddress={bed.deviceId}
            hold={formatSecondsToDHMS(device?.HOLD ?? 0)}
            bed={bed.bedId}
            section={bed.section}
            username={cardName(card)}
            deviceType={device?.TYPE ?? 1}
          />
        </Link>
      );
    }

    // 連線中 → 維持原本導到住民監控頁
    return (
      <Link
        to={`/patient/patient-detail/patient-monitor?macaddress=${bed.deviceId}${bedIpQuery(bed)}`}
        key={key}
        state={{ from: "/home" }}
      >
        <Bed_Online
          macaddress={bed.deviceId}
          hold={formatSecondsToDHMS(device.HOLD)}
          bed={bed.bedId}
          section={bed.section}
          username={cardName(card)}
          pos={device.POS}
          color={device.BedColor}
          deviceType={device.TYPE}
          isAlertSet={device.IsAlert}
        />
      </Link>
    );
  };

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
              {visibleCards
                .slice()
                .sort(sortAlphabet)
                .map((card) => renderBedCard(card))}
            </div>
            {/* Bed Grid Sort by Status */}
            <div className={`by-status ${sortBy === "bed" ? "" : "active"}`}>
              {/* Alert Status */}
              {statusCounts.alerts > 0 && (
                <div className="status">
                  <div className="title">
                    {t("Home.Alerts")} ({statusCounts.alerts})
                  </div>
                  <div className="status-grid">
                    {cardsOf("alert").map((card) => renderBedCard(card))}
                  </div>
                </div>
              )}
              {/* Attention Status */}
              {statusCounts.attention > 0 && (
                <div className="status">
                  <div className="title">
                    {t("Home.Attention")} ({statusCounts.attention})
                  </div>
                  <div className="status-grid">
                    {cardsOf("attention").map((card) => renderBedCard(card))}
                  </div>
                </div>
              )}
              {/* Default Status */}
              {statusCounts.normal > 0 && (
                <div className="status">
                  <div className="title">
                    {t("Home.Normal")} ({statusCounts.normal})
                  </div>
                  <div className="status-grid">
                    {cardsOf("default").map((card) => renderBedCard(card))}
                  </div>
                </div>
              )}
              {/* Vacant Status（沒綁裝置的床位） */}
              {statusCounts.vacant > 0 && (
                <div className="status">
                  <div className="title">
                    {t("Home.Vacant")} ({statusCounts.vacant})
                  </div>
                  <div className="status-grid">
                    {cardsOf("vacant").map((card) => renderBedCard(card))}
                  </div>
                </div>
              )}
              {/* Disconnected Status */}
              {statusCounts.disconnected > 0 && (
                <div className="status">
                  <div className="title">
                    {t("Home.Disconnected")} ({statusCounts.disconnected})
                  </div>
                  <div className="status-grid">
                    {cardsOf("disconnect").map((card) => renderBedCard(card))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 點空床卡片後開啟：編輯該張床位（主要用途是綁定裝置）。
          放在 .top-bar 之外，否則 general.css 的 .top-bar .dropdown{max-width}
          會把 modal 裡的下拉欄位壓窄。 */}
      {editingBed && (
        <AddNewBed
          bed={editingBed}
          callback={handleCloseBedModal}
          onCreated={fetchBedList}
        />
      )}
    </>
  );
}

export default Home;
