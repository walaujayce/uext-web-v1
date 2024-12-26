import React, { useState, useEffect } from "react";
import SignalRService from "../JS/SignalR";
import AlertConfirmOverlay from "./Modals/AlertConfirmOverlay";
import dayjs from "dayjs";

function AlertList() {
  const [expandAlertList, setExpandAlertList] = useState(false);

  const handleAlertListExpandClick = () => {
    setExpandAlertList((prev) => !prev);
  };
  {
    /* Signal R Connection */
  }
  const [alertsMap, setAlertsMap] = useState(new Map());

  const saveToLocalStorage = (map) => {
    const alertsArray = Array.from(map.values());
    localStorage.setItem("alerts", JSON.stringify(alertsArray));
  };

  useEffect(() => {
    const initializeSignalR = async () => {
      await SignalRService.startConnection();
      SignalRService.onReceiveMessage((topic, message) => {
        if (topic === "uneo/notify/all") {
          const parsedMessage = JSON.parse(message);

          setAlertsMap((prevAlertsMap) => {
            const newAlertsMap = new Map(prevAlertsMap);
            const mac = parsedMessage.MAC;
            const existingAlertMessage = newAlertsMap.get(mac);
            //console.log("existingAlertsMap:", Array.from(newAlertsMap.entries()));
            if (
              existingAlertMessage &&
              new Date(existingAlertMessage.alertTime) <
                new Date(parsedMessage.AlertTime)
            ) {
              // console.log("existingAlert for MAC:", mac, existingAlertMessage);
              // console.log("existingAlert Time for MAC:", mac, existingAlertMessage.alertTime);
              // console.log("newAlert Time for MAC:", mac, parsedMessage.AlertTime);
              // console.log("existingAlertMessage ID is ", existingAlertMessage.id);
              setNotificationChecked_PUT(existingAlertMessage.id); // CHECK TRUE old message in database
              //save new message to alert list
              newAlertsMap.set(mac, {
                id: parsedMessage.Id,
                mac: mac,
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
                status: parsedMessage.Status,
                eventName: parsedMessage.EventName || "",
              });
            } else if (!existingAlertMessage) {
              newAlertsMap.set(mac, {
                id: parsedMessage.Id,
                mac: mac,
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
                status: parsedMessage.Status,
                eventName: parsedMessage.EventName || "",
              });
            }
            return newAlertsMap;
          });
        }
      });
    };
    initializeSignalR();

    return () => {
      // Cleanup the connection
      if (SignalRService.connection) {
        SignalRService.connection.stop();
      }
    };
  }, []);

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
    /* GET NOTFICATION LIST */
  }
  const fetchNoticitionList = async () => {
    try {
      const response = await fetch(`/api/7284/db/Notification`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("Content-Type");
      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error(`Expected JSON, got: ${contentType}`);
      }

      const notifications = await response.json();
      console.log("Fetched notifications:", notifications);

      // Group notifications by MAC address
      const groupedByMAC = notifications.reduce((acc, notification) => {
        const mac = notification.deviceid;
        if (!acc[mac]) {
          acc[mac] = [];
        }
        acc[mac].push(notification);
        return acc;
      }, {});

      // Process each MAC group
      for (const [mac, macNotifications] of Object.entries(groupedByMAC)) {
        const uncheckedNotifications = macNotifications.filter(
          (notification) => !notification.checkStatus
        );

        if (uncheckedNotifications.length > 0) {
          // Sort unchecked notifications by punchTime in descending order
          uncheckedNotifications.sort(
            (a, b) => new Date(b.punchTime) - new Date(a.punchTime)
          );

          // Log the latest notification for this MAC
          console.log(
            "Latest unchecked notification for MAC:",
            mac,
            uncheckedNotifications[0]
          );

          const parsedMessage = JSON.parse(
            uncheckedNotifications[0].notifyBody
          );
          console.log(parsedMessage); 

          setAlertsMap((prevAlertsMap) => {
            const newAlertsMap = new Map(prevAlertsMap);
            const mac = parsedMessage.MAC;
            const existingAlertMessage = newAlertsMap.get(mac);
            //console.log("existingAlertsMap:", Array.from(newAlertsMap.entries()));
            if (
              existingAlertMessage &&
              new Date(existingAlertMessage.alertTime) <
                new Date(parsedMessage.AlertTime)
            ) {
              // console.log("existingAlert for MAC:", mac, existingAlertMessage);
              // console.log("existingAlert Time for MAC:", mac, existingAlertMessage.alertTime);
              // console.log("newAlert Time for MAC:", mac, parsedMessage.AlertTime);
              // console.log("existingAlertMessage ID is ", existingAlertMessage.id);
              setNotificationChecked_PUT(existingAlertMessage.id); // CHECK TRUE old message in database
              //save new message to alert list
              newAlertsMap.set(mac, {
                id: parsedMessage.Id,
                mac: mac,
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
                status: parsedMessage.Status,
                eventName: parsedMessage.EventName || "",
              });
            } else if (!existingAlertMessage) {
              newAlertsMap.set(mac, {
                id: parsedMessage.Id,
                mac: mac,
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
                status: parsedMessage.Status,
                eventName: parsedMessage.EventName || "",
              });
            }
            return newAlertsMap;
          });

          // Mark all other unchecked notifications as checked
          for (let i = 1; i < uncheckedNotifications.length; i++) {
            const notification = uncheckedNotifications[i];
            await setNotificationChecked_PUT(notification.id);
          }
        } else {
          console.log(`No unchecked notifications for MAC: ${mac}`);
        }
      }
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };
  {
    /* PUT API set Checkstatus */
  }
  const requestbody_PUT = {
    checkStatus: true,
  };
  const setNotificationChecked_PUT = async (notification_Id) => {
    try {
      const response = await fetch(
        `/api/7284/db/Notification/${notification_Id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestbody_PUT), // Convert the requestBody to JSON
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.code !== 0) {
        console.log(data.message);
        return;
      }
      console.log("Notification is set CHECKED successfully:", data);
      console.log(data); // Return the response data if needed
    } catch (error) {
      console.error("Error updating device:", error.message);
    }
  };

  useEffect(() => {
    fetchNoticitionList();
  }, []);

  const deleteAlert = (mac, notificationId) => {
    setAlertsMap((prevAlertsMap) => {
      const newAlertsMap = new Map(prevAlertsMap);
      newAlertsMap.delete(mac);
      // Save updated map to localStorage
      //saveToLocalStorage(newAlertsMap);
      // PUT API to database
      setNotificationChecked_PUT(notificationId);
      console.log(notificationId);
      return newAlertsMap;
    });
  };
  {
    /* Handle Alert Overlay Visible */
  }
  const [activeAlert, setActiveAlert] = useState(null);

  const handleAlertVisibleClick = (mac) => {
    setActiveAlert(mac === activeAlert ? null : mac); // Toggle overlay visibility
    console.log("Active alert for mac:", mac);
  };

  const handleConfirmAlertOverlay = (mac, notificationId) => {
    setActiveAlert(null); // Close overlay
    deleteAlert(mac, notificationId);
  };
  return (
    <div className={`alerts ${expandAlertList ? "min" : ""}`}>
      <div className="box">
        <h1>Alerts</h1>
        <img
          id="expand"
          src="/src/assets/double-left.svg"
          alt="double chervon left arrow"
          onClick={handleAlertListExpandClick}
        />
      </div>
      <div className="alert-list">
        {alertsArray.map((alert, index) => (
          <div
            className={`container ${
              alert.status === 3 ? "in-progress" : ""
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
              />
            )}
            <div className="title">
              <img
                src={`${
                  alert.status === 3
                    ? "/src/assets/attention.svg"
                    : "/src/assets/alert.svg"
                }`}
                alt="red rectangular alert icon"
              />
              <h2>{`${
                alert.status === 3 ? "Attention Alert" : "Bed Exit Alert"
              }`}</h2>
            </div>
            <div className="info">
              <div className="item">
                <div className="caption">Section</div>
                <p>{`${alert.floor}-${alert.section.split(" ").pop()}`}</p>
              </div>
              <div className="item">
                <div className="caption">Bed</div>
                <p>{alert.bedNo}</p>
              </div>
              <div className="item">
                <div className="caption">Name</div>
                <p>{alert.userName}</p>
              </div>
              <div className="time">{dayjs(alert.alertTime).format("HH:mm")}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertList;
