import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import SignalRService from "../JS/SignalR";
import AlertConfirmOverlay from "./Modals/AlertConfirmOverlay";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "./LoadingOverlay";
import { useAuth } from "../JS/AuthContext";
import { useFloorSection } from "../JS/FloorSectionContext";
import { is } from "date-fns/locale";
import api from "../api/apiClient";

function AlertList() {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

  const [expandAlertList, setExpandAlertList] = useState(
    () => JSON.parse(localStorage.getItem("expandAlertList")) || false,
  );

  const {
    isLeftBedPlaying,
    isAboutToLeavePlaying,
    isAboutToLeave2Playing,
    playAboutToLeaveSound,
    playAboutToLeaveSound2,
    playLeaveBedSound,
    stopSound,
    isUserInteracted,
    isDarkMode,
  } = useAuth(); // Access sound management

  // 目前選取樓層/區域對應的後端 IP；變動時 SignalR 會重新連線到新的 IP
  const { selectedServer, servers, floor, section } = useFloorSection();
  const signalrTargetIp = selectedServer?.ip ?? null;

  // 選 "All" 樓層或 "All" 區域時 → 涵蓋多台後端
  const isAllMode = floor === "All" || section === "All";

  // 要涵蓋的後端 IP 清單（單一模式=1 台；All 模式=多台）。與 Home 的規則一致：
  //   floor === "All"   → 所有 server
  //   section === "All" → 該樓層底下所有 server
  //   其他              → 目前選取的單一 server
  const alertTargetIps = useMemo(() => {
    if (floor === "All") {
      return [...new Set(servers.map((s) => s.ip).filter(Boolean))];
    }
    if (section === "All") {
      return [
        ...new Set(
          servers
            .filter((s) => s.floor === floor)
            .map((s) => s.ip)
            .filter(Boolean),
        ),
      ];
    }
    return signalrTargetIp ? [signalrTargetIp] : [];
  }, [servers, floor, section, signalrTargetIp]);

  const handleAlertListExpandClick = () => {
    setExpandAlertList((prev) => {
      const newState = !prev;
      localStorage.setItem("expandAlertList", JSON.stringify(newState)); // Persist the new state
      return newState;
    });
  };
  // const [isDarkMode, setDarkMode] = useState(true); //TODO
  // const root = document.documentElement;
  useEffect(() => {
    const storedState = localStorage.getItem("expandAlertList");
    if (storedState !== null) {
      setExpandAlertList(JSON.parse(storedState)); // Restore the state from localStorage
    }
    // setDarkMode(root.classList.contains("dark"));
    // //console.log("root contain dark: ", root.classList.length);
    // //console.log("isDarkMode: ", isDarkMode);
  }, []);

  {
    /* Signal R Connection */
  }
  const [alertsMap, setAlertsMap] = useState(new Map());

  const saveToLocalStorage = (map) => {
    const alertsArray = Array.from(map.values());
    localStorage.setItem("alerts", JSON.stringify(alertsArray));
  };
  const topic_all = "uneo/notify/all";
  const topic_risk = "uneo/notify/all/risk";
  const topic_turn_over = "uneo/notify/all/turnover";
  const topic_devices = "web/notify/devices";
  const topic_allow_array = [topic_all, topic_risk, topic_turn_over];

  // 從通知訊息組出 alert 物件；srcIp 記錄「這筆通知來自哪一台後端」，
  // 之後點擊要 PUT checkStatus 時就用它把請求釘回同一台（All 模式多台時很重要）。
  const buildAlertEntry = (parsedMessage, srcIp) => ({
    id: parsedMessage.Id,
    mac: parsedMessage.MAC,
    userName: parsedMessage.UserName || "",
    bedNo: parsedMessage.Bed || "",
    floor: parsedMessage.Floor || "",
    section: parsedMessage.Section || "",
    alertTime:
      new Date(parsedMessage.AlertTime).toLocaleString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) || "",
    // 保留原始(含毫秒)時間字串供比較用；顯示用的 alertTime 已被格式化且截掉毫秒，
    // 直接拿它比較會誤判成「較舊」而觸發不必要的 PUT。
    alertTimeRaw: parsedMessage.AlertTime,
    status: parsedMessage.Status,
    eventName: parsedMessage.EventName || "",
    alertLevel: parsedMessage.AlertLevel,
    deviceType: parsedMessage.DeviceType,
    topic: parsedMessage.Topic,
    srcIp: srcIp,
  });

  // 找出某筆 alert 該打哪一台後端：優先用記錄的 srcIp；
  // 若沒有(舊資料/單一模式)，退而用 floor+section 反查 servers（同一樓+層唯一對應一台）。
  const ipForAlert = (alert) => {
    if (!alert) return undefined;
    if (alert.srcIp) return alert.srcIp;
    const match = servers.find(
      (s) => s.floor === alert.floor && s.section === alert.section,
    );
    return match?.ip;
  };

  // SignalR 收到訊息的處理邏輯，抽成共用 handler 給「單一連線」與「多台連線」共用
  const handleSignalRMessage = useCallback(
    (topic, message, sourceIp) => {
        // console.log("topic: ", topic);
        // console.log("topic include: ", topic_allow_array.includes(topic));
        if (topic_allow_array.includes(topic)) {
          const parsedMessage = JSON.parse(message);
          console.log(
            `${topic}: ${parsedMessage.MAC}|${parsedMessage.Status}|${parsedMessage.EventName}`,
          );
          if (isUserInteracted) {
            const status = parsedMessage.Status;
            if (topic === topic_all) {
              if (status === 3 && !isAboutToLeavePlaying) {
                playAboutToLeaveSound();
                if (isLeftBedPlaying) {
                  stopSound("leftBed", 0);
                }
                if (isAboutToLeave2Playing) {
                  stopSound("aboutToLeave2", 0);
                }
              } else if (status === 4 && !isLeftBedPlaying) {
                playLeaveBedSound();
                if (isAboutToLeavePlaying) {
                  stopSound("aboutToLeave", 0);
                }
                if (isAboutToLeave2Playing) {
                  stopSound("aboutToLeave2", 0);
                }
              } else if (status === 2 && !isAboutToLeave2Playing) {
                playAboutToLeaveSound2();
                if (isLeftBedPlaying) {
                  stopSound("leftBed", 0);
                }
                if (isAboutToLeavePlaying) {
                  stopSound("aboutToLeave", 0);
                }
              }
            } else if (topic === topic_turn_over || topic === topic_risk) {
              const alertLevel = parsedMessage.AlertLevel;
              if (alertLevel === 1 && !isAboutToLeavePlaying) {
                playAboutToLeaveSound();
                if (isLeftBedPlaying) {
                  stopSound("leftBed", 0);
                }
                if (isAboutToLeave2Playing) {
                  stopSound("aboutToLeave2", 0);
                }
              } else if (status === 2 && !isLeftBedPlaying) {
                playLeaveBedSound();
                if (isAboutToLeavePlaying) {
                  stopSound("aboutToLeave", 0);
                }
                if (isAboutToLeave2Playing) {
                  stopSound("aboutToLeave2", 0);
                }
              }
            }
          }

          setAlertsMap((prevAlertsMap) => {
            const newAlertsMap = new Map(prevAlertsMap);
            const mac = parsedMessage.MAC;
            const existingAlertMessage = newAlertsMap.get(mac);
            ////console.log("existingAlertsMap:", Array.from(newAlertsMap.entries()));
            // 只有在「同一 MAC 收到一筆『不同的、且較新的』通知」時，才把舊那筆標記 checked
            // 並換成新的。若是同一筆通知(同 Id)重送(REST 已載入後 SignalR 又推同一筆)，
            // 不可再 PUT，否則會把目前顯示中的這筆立刻標成已讀。
            // 比較時間用原始(含毫秒)字串，避免顯示用字串截掉毫秒造成誤判。
            const existingTimeRaw =
              existingAlertMessage?.alertTimeRaw ??
              existingAlertMessage?.alertTime;
            if (
              existingAlertMessage &&
              existingAlertMessage.id !== parsedMessage.Id &&
              new Date(existingTimeRaw) < new Date(parsedMessage.AlertTime)
            ) {
              setNotificationChecked_PUT(
                existingAlertMessage.id,
                ipForAlert(existingAlertMessage),
              ); // CHECK TRUE old message in database（釘回該筆通知的來源後端）
              //save new message to alert list
              newAlertsMap.set(mac, buildAlertEntry(parsedMessage, sourceIp));
            } else if (!existingAlertMessage) {
              newAlertsMap.set(mac, buildAlertEntry(parsedMessage, sourceIp));
            }
            return newAlertsMap;
          });
        }
        if (topic === "web/notify/update/notification") {
          const parsedMessage = JSON.parse(message);
          const idToDelete = parsedMessage.Id; // Extract the ID from the parsed message
          const macaddress = parsedMessage.Macaddress;
          setAlertsMap((prevAlertsMap) => {
            const newAlertsMap = new Map(prevAlertsMap);
            // Find and delete the entry with the matching ID
            for (const [mac, alert] of newAlertsMap.entries()) {
              if (alert.id === idToDelete && mac === macaddress) {
                newAlertsMap.delete(macaddress);
                break; // Exit the loop once the entry is found and deleted
              }
            }
            return newAlertsMap;
          });
        }
    },
    [
      isAboutToLeavePlaying,
      isAboutToLeave2Playing,
      isLeftBedPlaying,
      playAboutToLeaveSound,
      playAboutToLeaveSound2,
      playLeaveBedSound,
      isUserInteracted,
    ],
  );

  // 單一 server 模式：連一條 primary 連線（維持原本行為，sendMessage 也靠這條）
  useEffect(() => {
    if (isAllMode) return;
    const initializeSignalR = async () => {
      await SignalRService.startConnection(signalrTargetIp);
      // 單一模式：訊息一律來自 signalrTargetIp
      SignalRService.onReceiveMessage((topic, message) =>
        handleSignalRMessage(topic, message, signalrTargetIp),
      );
    };
    initializeSignalR();

    return () => {
      // Cleanup the connection
      if (SignalRService.connection) {
        SignalRService.connection.stop();
      }
    };
  }, [isAllMode, signalrTargetIp, handleSignalRMessage]);

  // All 模式：對每台後端各連一條，realtime 訊息全部匯入同一份 alertsMap
  useEffect(() => {
    if (!isAllMode) return;
    const initializeMulti = async () => {
      await SignalRService.startConnections(alertTargetIps);
      SignalRService.onReceiveMessageMulti(handleSignalRMessage);
    };
    initializeMulti();

    return () => {
      SignalRService.stopConnections();
    };
  }, [isAllMode, alertTargetIps, handleSignalRMessage]);

  // useEffect(() => {
  //   const storedAlerts = localStorage.getItem("alerts");
  //   if (storedAlerts) {
  //     const parsedAlerts = JSON.parse(storedAlerts);
  //     const alertsMapFromStorage = new Map(
  //       parsedAlerts.map((alert) => [alert.mac, alert])
  //     );
  //     setAlertsMap(alertsMapFromStorage);
  //   }
  // }, []);

  const alertsArray = Array.from(alertsMap.values()); // display alert list

  {
    /* 
  // Sort Alert List
  1. CHECK notification database that have "UNCHECK" notifications
    -YES : if same mac has multiple "UNCHECK" notifications 
      --YES: (a)set others to "CHECKED" (b)show the lastest one (c)check again if alertlist exists more latest notification , PROCEED TO STEP 2 AGAIN
      --NO : (a)show the lastest one (b)check again if alertlist exists more latest notification, PROCEED TO STEP 2 AGAIN
    -NO  : continue
  2. POP up new notification , CHECK all notifications that has the same mac on alert list
    -YES: (a)set old notification to "CHECKED" (b)show the latest notification
    -NO : (b)show this notification
  3. CLICK SET notification "CHECKED"
    (a) SEND CHECK POST API
  */
  }

  {
    /* FAKE NOTIFICATION */
  }
  const fakeNotification = [
    {
      id: "0737c54f-d709-48d5-8ed7-bf3962b3a79f1",
      deviceid: "A1",
      notifyBody:
        '{"Id":"0737c54f-d709-48d5-8ed7-bf3962b3a79f1","MAC":"A1","UserName":"A1","Bed":"UMAP","Floor":"--","Section":"--","AlertTime":"2026-05-19T05:45:13.438294Z","Status":4,"EventName":"Leaving out bed","AlertLevel":2,"DeviceType":2,"Topic":"uneo/notify/all/risk"}',
      checkStatus: false,
      punchTime: "2026-05-19T05:45:13.438294",
      createDate: "2026-05-19T05:45:13.444847",
    },
    {
      id: "91da9389-5f39-4be6-badd-fbecc708b07f2",
      deviceid: "A2",
      notifyBody:
        '{"Id":"91da9389-5f39-4be6-badd-fbecc708b07f2","MAC":"A2","UserName":"A2","Bed":"UMAP","Floor":"--","Section":"--","AlertTime":"2026-05-19T05:45:12.4555981Z","Status":4,"EventName":"Leaving out bed","AlertLevel":1,"DeviceType":2,"Topic":"uneo/notify/all/risk"}',
      checkStatus: false,
      punchTime: "2026-05-19T05:45:12.455598",
      createDate: "2026-05-19T05:45:13.460101",
    },
    {
      id: "91da9389-5f39-4be6-badd-fbecc708b07f23",
      deviceid: "A3",
      notifyBody:
        '{"Id":"91da9389-5f39-4be6-badd-fbecc708b07f23","MAC":"A3","UserName":"A3","Bed":"UMAP","Floor":"--","Section":"--","AlertTime":"2026-05-19T05:45:11.4555981Z","Status":4,"EventName":"Leaving out bed","AlertLevel":1,"DeviceType":2,"Topic":"uneo/notify/all/turnover"}',
      checkStatus: false,
      punchTime: "2026-05-19T05:45:11.455598",
      createDate: "2026-05-19T05:45:11.460101",
    },
    {
      id: "91da9389-5f39-4be6-badd-fbecc708b07f23",
      deviceid: "A4",
      notifyBody:
        '{"Id":"91da9389-5f39-4be6-badd-fbecc708b07f23","MAC":"A4","UserName":"A4","Bed":"UMAP","Floor":"--","Section":"--","AlertTime":"2026-05-19T05:45:11.4555981Z","Status":4,"EventName":"Leaving out bed","AlertLevel":2,"DeviceType":2,"Topic":"uneo/notify/all/turnover"}',
      checkStatus: false,
      punchTime: "2026-05-19T05:45:11.455598",
      createDate: "2026-05-19T05:45:11.460101",
    },
    {
      id: "91da9389-5f39-4be6-badd-fbecc708b07f23",
      deviceid: "A41",
      notifyBody:
        '{"Id":"91da9389-5f39-4be6-badd-fbecc708b07f23","MAC":"A41","UserName":"A41","Bed":"UMAP","Floor":"--","Section":"--","AlertTime":"2026-05-19T05:45:11.4555981Z","Status":2,"EventName":"Leaving out bed","AlertLevel":2,"DeviceType":1,"Topic":"uneo/notify/all"}',
      checkStatus: false,
      punchTime: "2026-05-19T05:45:11.455598",
      createDate: "2026-05-19T05:45:11.460101",
    },
    {
      id: "91da9389-5f39-4be6-badd-fbecc708b07f23",
      deviceid: "A21",
      notifyBody:
        '{"Id":"91da9389-5f39-4be6-badd-fbecc708b07f23","MAC":"A21","UserName":"A21","Bed":"UMAP","Floor":"--","Section":"--","AlertTime":"2026-05-19T05:45:11.4555981Z","Status":3,"EventName":"Leaving out bed","AlertLevel":2,"DeviceType":1,"Topic":"uneo/notify/all"}',
      checkStatus: false,
      punchTime: "2026-05-19T05:45:10.455598",
      createDate: "2026-05-19T05:45:10.460101",
    },
    {
      id: "91da9389-5f39-4be6-badd-fbecc708b07f23",
      deviceid: "A42",
      notifyBody:
        '{"Id":"91da9389-5f39-4be6-badd-fbecc708b07f23","MAC":"A42","UserName":"A42","Bed":"UMAP","Floor":"--","Section":"--","AlertTime":"2026-05-19T05:45:11.4555981Z","Status":4,"EventName":"Leaving out bed","AlertLevel":2,"DeviceType":2,"Topic":"uneo/notify/all"}',
      checkStatus: false,
      punchTime: "2026-05-19T05:45:10.455598",
      createDate: "2026-05-19T05:45:10.460101",
    },
  ];
  {
    /* GET NOTFICATION LIST */
  }
  // 用來辨識「最新一次 fetch」；切樓層會產生更新的 runId，
  // 舊的 in-flight 請求 resolve 後會因 runId 不符而被丟棄，避免寫入到已切換的樓層。
  const fetchRunIdRef = useRef(0);

  const fetchNoticitionList = async (targetIp, runId) => {
    // 這批通知都來自 targetIp，寫進 alert 物件的 srcIp，供之後 PUT 釘回同一台
    const sourceIp = targetIp;
    try {
      // const response = await fetch(`/api/7284/db/Notification`, {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });

      // const contentType = response.headers.get("Content-Type");
      // if (!response.ok || !contentType?.includes("application/json")) {
      //   throw new Error(`Expected JSON, got: ${contentType}`);
      // }

      // const notifications = await response.json();
      // console.log("[debug]targetip: ", targetIp);
      // console.log("[debug]runid: ", runId);
      // console.log("[debug]fetchRunIdRef: ", fetchRunIdRef);
      const response = await api.get(`/api/7284/db/Notification`, { targetIp });
      // 期間又切了樓層(有更新的 fetch) → 丟棄這次結果，不寫入畫面
      if (runId !== fetchRunIdRef.current) return;
      
      // console.log("[debug]response:", targetIp);
      const notifications = response.data;
      //console.log("Fetched notifications:", notifications);

      // Group notifications by MAC address
      const groupedByMAC = notifications.reduce((acc, notification) => {
        // const groupedByMAC = fakeNotification.reduce((acc, notification) => {
        const mac = notification.deviceid;
        if (!acc[mac]) {
          acc[mac] = [];
        }
        acc[mac].push(notification);
        return acc;
      }, {});

      // Process each MAC group
      for (const [mac, macNotifications] of Object.entries(groupedByMAC)) {
        // 迴圈中有多個 await，期間若切了樓層就停止，避免把舊樓層資料寫入/標記
        if (runId !== fetchRunIdRef.current) return;
        const uncheckedNotifications = macNotifications.filter(
          (notification) => !notification.checkStatus,
        );

        if (uncheckedNotifications.length > 0) {
          setLoading(true);
          // Sort unchecked notifications by punchTime in descending order
          uncheckedNotifications.sort(
            (a, b) => new Date(b.punchTime) - new Date(a.punchTime),
          );

          // Log the latest notification for this MAC
          //console.log(
          //   "Latest unchecked notification for MAC:",
          //   mac,
          //   uncheckedNotifications[0]
          // );

          const parsedMessage = JSON.parse(
            uncheckedNotifications[0].notifyBody,
          );
          //console.log(parsedMessage);

          setAlertsMap((prevAlertsMap) => {
            const newAlertsMap = new Map(prevAlertsMap);
            const mac = parsedMessage.MAC;
            const existingAlertMessage = newAlertsMap.get(mac);
            // //console.log("existingAlertsMap:", Array.from(newAlertsMap.entries()));
            if (
              existingAlertMessage &&
              new Date(existingAlertMessage.alertTime) <
                new Date(parsedMessage.AlertTime)
            ) {
              // //console.log("existingAlert for MAC:", mac, existingAlertMessage);
              // //console.log("existingAlert Time for MAC:", mac, existingAlertMessage.alertTime);
              // //console.log("newAlert Time for MAC:", mac, parsedMessage.AlertTime);
              // //console.log("existingAlertMessage ID is ", existingAlertMessage.id);
              //setNotificationChecked_PUT(existingAlertMessage.id); // CHECK TRUE old message in database
              //save new message to alert list
              newAlertsMap.set(mac, buildAlertEntry(parsedMessage, sourceIp));
            } else if (!existingAlertMessage) {
              newAlertsMap.set(mac, buildAlertEntry(parsedMessage, sourceIp));
            }
            return newAlertsMap;
          });

          // Mark all other unchecked notifications as checked（釘在同一台 IP）
          for (let i = 1; i < uncheckedNotifications.length; i++) {
            const notification = uncheckedNotifications[i];
            await setNotificationChecked_PUT(notification.id, targetIp);
          }
        } else {
          //console.log(`No unchecked notifications for MAC: ${mac}`);
        }
      }
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    } finally {
      setLoading(false);
    }
  };
  {
    /* PUT API set Checkstatus */
  }
  const requestbody_PUT = {
    checkStatus: true,
  };
  const setNotificationChecked_PUT = async (notification_Id, targetIp) => {
    try {
      // const response = await fetch(
      //   `/api/7284/db/Notification/${notification_Id}`,
      //   {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(requestbody_PUT), // Convert the requestBody to JSON
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const data = await response.json();
      const response = await api.put(
        `/api/7284/db/Notification/${notification_Id}`,
        requestbody_PUT,
        { targetIp }, // 釘在指定 IP（未傳則 interceptor fallback 到目前選取的 IP）
      );

      const data = response.data;
      if (data.code !== 0) {
        //console.log(data.message);
        return;
      }
      //console.log("Notification is set CHECKED successfully:", data);
      // //console.log(data); // Return the response data if needed
    } catch (error) {
      console.error("Error updating device:", error.message);
    }
  };

  useEffect(() => {
    // 樓層/區域(IP)切換時：先清掉舊樓層殘留的警示，再重新抓目前涵蓋範圍的通知清單。
    // 用 runId + 釘住的 targetIp 確保：只有最新一次 fetch 能寫入，且各請求都釘在對應那台。
    // All 模式會逐台抓取後匯入同一份 alertsMap。
    if (!alertTargetIps.length) return;
    const runId = ++fetchRunIdRef.current;
    setAlertsMap(new Map());
    alertTargetIps.forEach((targetIp) => fetchNoticitionList(targetIp, runId));
  }, [alertTargetIps]);

  const deleteAlert = (mac, notificationId) => {
    setAlertsMap((prevAlertsMap) => {
      const newAlertsMap = new Map(prevAlertsMap);
      const alert = newAlertsMap.get(mac); // 取得該筆 alert 以查出來源後端 IP
      newAlertsMap.delete(mac);
      // Save updated map to localStorage
      //saveToLocalStorage(newAlertsMap);
      // PUT API to database（釘回該筆通知的來源後端，否則 All 模式會打錯台而失敗）
      setNotificationChecked_PUT(notificationId, ipForAlert(alert));
      stopSound();
      //console.log(notificationId);
      return newAlertsMap;
    });
  };
  {
    /* Handle Alert Overlay Visible */
  }
  const [activeAlert, setActiveAlert] = useState(null);

  const handleAlertVisibleClick = (mac) => {
    setActiveAlert(mac === activeAlert ? null : mac); // Toggle overlay visibility
    //console.log("Active alert for mac:", mac);
  };

  const handleConfirmAlertOverlay = (mac, notificationId) => {
    setActiveAlert(null); // Close overlay
    deleteAlert(mac, notificationId);
  };

  const IsLeaveBed = {
    0: {
      imgUrl: isDarkMode
        ? "/src/assets/attention-white.svg"
        : "/src/assets/attention.svg",
      title: t("AlertList.LeavingAlert"),
      containerColor: "in-progress",
    },
    1: {
      imgUrl: isDarkMode
        ? "/src/assets/alert-white.svg"
        : "/src/assets/alert.svg",
      containerColor: "",
      title: t("AlertList.BedExitAlert"),
    },
  };

  const postureMap = {
    // 0 = Not specified
    // 1 = Resting on the bed
    // 2 = Sitting on the bed
    // 3 = Sitting on the bed edge
    // 4 = Leaving out bed
    // 5 = Unusual condition
    // 6 = Lying / Curled up on left side
    // 7 = Lying / Curled up on right side
    // 8 = Leaving out bed (bed exit rate)
    0: {
      imgUrl: isDarkMode
        ? "/src/assets/attention-white.svg"
        : "/src/assets/attention.svg",
      title: t("AlertList.NotSpecifiedAlert"),
      containerColor: "in-progress",
    },
    1: {
      imgUrl: isDarkMode
        ? "/src/assets/attention-white.svg"
        : "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("AlertList.RestOnBedAlert"),
    },
    2: {
      imgUrl: isDarkMode
        ? "/src/assets/attention-white.svg"
        : "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("AlertList.SitOnBedAlert"),
    },
    3: {
      imgUrl: isDarkMode
        ? "/src/assets/attention-white.svg"
        : "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("AlertList.SitOnBedEdgeAlert"),
    },
    4: {
      imgUrl: isDarkMode
        ? "/src/assets/alert-white.svg"
        : "/src/assets/alert.svg",
      containerColor: "",
      title: t("AlertList.BedExitAlert"),
    },
    5: {
      imgUrl: isDarkMode
        ? "/src/assets/alert-white.svg"
        : "/src/assets/alert.svg",
      containerColor: "",
      title: t("AlertList.UnusualConditionAlert"),
    },
    6: {
      imgUrl: isDarkMode
        ? "/src/assets/attention-white.svg"
        : "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("AlertList.LeftAlert"),
    },
    7: {
      imgUrl: isDarkMode
        ? "/src/assets/attention-white.svg"
        : "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("AlertList.RightAlert"),
    },
    8: {
      imgUrl: isDarkMode
        ? "/src/assets/attention-white.svg"
        : "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("AlertList.AttentionAlert"),
    },
  };

  const turnOverMap = {
    1: {
      imgUrl: isDarkMode
        ? "/src/assets/attention-white.svg"
        : "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("AlertList.TurnOverAlert"),
    },

    2: {
      imgUrl: isDarkMode
        ? "/src/assets/alert-white.svg"
        : "/src/assets/alert.svg",
      containerColor: "",
      title: t("AlertList.TurnOverAlert"),
    },
  };
  const PressureMap = {
    1: {
      imgUrl: isDarkMode
        ? "/src/assets/attention-white.svg"
        : "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("AlertList.RiskAlert"),
    },

    2: {
      imgUrl: isDarkMode
        ? "/src/assets/alert-white.svg"
        : "/src/assets/alert.svg",
      containerColor: "",
      title: t("AlertList.RiskAlert"),
    },
  };

  return (
    <>
      <SimpleBackdrop open={loading} />
      <div className={`alerts ${expandAlertList ? "min" : ""}`}>
        <div className="box">
          <h1>{t("AlertList.Alerts")}</h1>
          <img
            id="expand"
            src="/src/assets/double-left.svg"
            alt="double chervon left arrow"
            onClick={handleAlertListExpandClick}
          />
        </div>
        <div className="alert-list">
          {alertsArray
            .slice()
            .sort((a, b) => new Date(b.alertTime) - new Date(a.alertTime))
            .map((alert, index) => {
              switch (alert.topic) {
                case topic_all:
                  return (
                    <div
                      className={`container ${
                        alert.status === 4
                          ? IsLeaveBed[1].containerColor
                          : IsLeaveBed[0].containerColor
                        // postureMap[alert.status].containerColor
                      } new ${expandAlertList ? "min" : ""}`}
                      key={index}
                      onClick={() => handleAlertVisibleClick(alert.mac)}
                    >
                      {activeAlert === alert.mac && (
                        <AlertConfirmOverlay
                          key={index}
                          callback={() => handleAlertVisibleClick(alert.mac)}
                          confirmAlert_callback={() =>
                            handleConfirmAlertOverlay(alert.mac, alert.id)
                          }
                          alertDetail={alert}
                          confirmTitle={
                            alert.status === 4
                              ? IsLeaveBed[1].title
                              : IsLeaveBed[0].title
                          }
                          imgUrl={
                            alert.status === 4
                              ? IsLeaveBed[1].imgUrl
                              : IsLeaveBed[0].imgUrl
                          }
                          // confirmTitle={postureMap[alert.status].title}
                          // imgUrl={postureMap[alert.status].imgUrl}
                        />
                      )}
                      <div className="title">
                        <img
                          src={
                            alert.status === 4
                              ? IsLeaveBed[1].imgUrl
                              : IsLeaveBed[0].imgUrl
                          }
                          // src={postureMap[alert.status].imgUrl}
                          alt="red rectangular alert icon"
                        />
                        <h2>
                          {alert.status === 4
                            ? IsLeaveBed[1].title
                            : IsLeaveBed[0].title}
                        </h2>
                        {/* <h2>{postureMap[alert.status].title}</h2> */}
                      </div>
                      <div className="info">
                        <div className="item">
                          <div className="caption">
                            {t("AlertList.Section")}
                          </div>
                          <p>{`${alert.floor}-${alert.section
                            .split(" ")
                            .pop()}`}</p>
                        </div>
                        <div className="item">
                          <div className="caption">{t("AlertList.Bed")}</div>
                          <p>{alert.bedNo}</p>
                        </div>
                        <div className="item">
                          <div className="caption">{t("AlertList.Name")}</div>
                          <p>{alert.userName}</p>
                        </div>
                        <div className="time">
                          {dayjs(alert.alertTime).format("HH:mm")}
                        </div>
                      </div>
                    </div>
                  );
                case topic_turn_over:
                  return (
                    <div
                      className={`container ${
                        turnOverMap[alert.alertLevel].containerColor
                      } new ${expandAlertList ? "min" : ""}`}
                      key={index}
                      onClick={() => handleAlertVisibleClick(alert.mac)}
                    >
                      {activeAlert === alert.mac && (
                        <AlertConfirmOverlay
                          key={index}
                          callback={() => handleAlertVisibleClick(alert.mac)}
                          confirmAlert_callback={() =>
                            handleConfirmAlertOverlay(alert.mac, alert.id)
                          }
                          alertDetail={alert}
                          confirmTitle={turnOverMap[alert.alertLevel].title}
                          imgUrl={turnOverMap[alert.alertLevel].imgUrl}
                        />
                      )}
                      <div className="title">
                        <img
                          src={turnOverMap[alert.alertLevel].imgUrl}
                          alt="red rectangular alert icon"
                        />
                        <h2>{turnOverMap[alert.alertLevel].title}</h2>
                      </div>
                      <div className="info">
                        <div className="item">
                          <div className="caption">
                            {t("AlertList.Section")}
                          </div>
                          <p>{`${alert.floor}-${alert.section
                            .split(" ")
                            .pop()}`}</p>
                        </div>
                        <div className="item">
                          <div className="caption">{t("AlertList.Bed")}</div>
                          <p>{alert.bedNo}</p>
                        </div>
                        <div className="item">
                          <div className="caption">{t("AlertList.Name")}</div>
                          <p>{alert.userName}</p>
                        </div>
                        <div className="time">
                          {dayjs(alert.alertTime).format("HH:mm")}
                        </div>
                      </div>
                    </div>
                  );
                case topic_risk:
                  return (
                    <div
                      className={`container ${
                        PressureMap[alert.alertLevel].containerColor
                      } new ${expandAlertList ? "min" : ""}`}
                      key={index}
                      onClick={() => handleAlertVisibleClick(alert.mac)}
                    >
                      {activeAlert === alert.mac && (
                        <AlertConfirmOverlay
                          key={index}
                          callback={() => handleAlertVisibleClick(alert.mac)}
                          confirmAlert_callback={() =>
                            handleConfirmAlertOverlay(alert.mac, alert.id)
                          }
                          alertDetail={alert}
                          confirmTitle={PressureMap[alert.alertLevel].title}
                          imgUrl={PressureMap[alert.alertLevel].imgUrl}
                        />
                      )}
                      <div className="title">
                        <img
                          src={PressureMap[alert.alertLevel].imgUrl}
                          alt="red rectangular alert icon"
                        />
                        <h2>{PressureMap[alert.alertLevel].title}</h2>
                      </div>
                      <div className="info">
                        <div className="item">
                          <div className="caption">
                            {t("AlertList.Section")}
                          </div>
                          <p>{`${alert.floor}-${alert.section
                            .split(" ")
                            .pop()}`}</p>
                        </div>
                        <div className="item">
                          <div className="caption">{t("AlertList.Bed")}</div>
                          <p>{alert.bedNo}</p>
                        </div>
                        <div className="item">
                          <div className="caption">{t("AlertList.Name")}</div>
                          <p>{alert.userName}</p>
                        </div>
                        <div className="time">
                          {dayjs(alert.alertTime).format("HH:mm")}
                        </div>
                      </div>
                    </div>
                  );
                default:
                  return (
                    <div
                      className={`container ${
                        alert.status === 4
                          ? IsLeaveBed[1].containerColor
                          : IsLeaveBed[0].containerColor
                        // postureMap[alert.status].containerColor
                      } new ${expandAlertList ? "min" : ""}`}
                      key={index}
                      onClick={() => handleAlertVisibleClick(alert.mac)}
                    >
                      {activeAlert === alert.mac && (
                        <AlertConfirmOverlay
                          key={index}
                          callback={() => handleAlertVisibleClick(alert.mac)}
                          confirmAlert_callback={() =>
                            handleConfirmAlertOverlay(alert.mac, alert.id)
                          }
                          alertDetail={alert}
                          imgUrl={alert.status === 4 ? IsLeaveBed[1].imgUrl : IsLeaveBed[0].imgUrl}
                          // imgUrl={postureMap[alert.status].imgUrl}
                          confirmTitle={t("AlertList.NotSpecifiedAlert")}
                        />
                      )}
                      <div className="title">
                        <img
                          src={alert.status === 4 ? IsLeaveBed[1].imgUrl : IsLeaveBed[0].imgUrl}
                          // src={postureMap[alert.status].imgUrl}
                          alt="red rectangular alert icon"
                        />
                        <h2>{t("AlertList.NotSpecifiedAlert")}</h2>
                      </div>
                      <div className="info">
                        <div className="item">
                          <div className="caption">
                            {t("AlertList.Section")}
                          </div>
                          <p>{`${alert.floor}-${alert.section
                            .split(" ")
                            .pop()}`}</p>
                        </div>
                        <div className="item">
                          <div className="caption">{t("AlertList.Bed")}</div>
                          <p>{alert.bedNo}</p>
                        </div>
                        <div className="item">
                          <div className="caption">{t("AlertList.Name")}</div>
                          <p>{alert.userName}</p>
                        </div>
                        <div className="time">
                          {dayjs(alert.alertTime).format("HH:mm")}
                        </div>
                      </div>
                    </div>
                  );
              }
            })}
        </div>
      </div>
    </>
  );
}

export default AlertList;
