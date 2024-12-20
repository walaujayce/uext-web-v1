import React, { useState, useEffect } from "react";
import SignalRService from "../JS/SignalR";
import AlertConfirmOverlay from "./Modals/AlertConfirmOverlay";

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
  const deleteAlert = (mac) => {
    setAlertsMap((prevAlertsMap) => {
      const newAlertsMap = new Map(prevAlertsMap);
      newAlertsMap.delete(mac);

      // Save updated map to localStorage
      saveToLocalStorage(newAlertsMap);

      return newAlertsMap;
    });
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

            // Update or add the latest message for this MAC
            newAlertsMap.set(mac, {
              topic,
              id: parsedMessage.Id,
              mac: mac,
              userName: parsedMessage.UserName,
              bedNo: parsedMessage.BedNo,
              alertTime: new Date(parsedMessage.AlertTime).toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }
              ),
              status: parsedMessage.Status,
              eventName: parsedMessage.EventName,
            });
            saveToLocalStorage(newAlertsMap);

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
  useEffect(() => {
    const storedAlerts = localStorage.getItem("alerts");
    if (storedAlerts) {
      const parsedAlerts = JSON.parse(storedAlerts);
      const alertsMapFromStorage = new Map(
        parsedAlerts.map((alert) => [alert.mac, alert])
      );
      setAlertsMap(alertsMapFromStorage);
    }
  }, []);

  const alertsArray = Array.from(alertsMap.values());

  {
    /* Handle Alert Overlay Visible */
  }
  const [isAlertOverlayVisible, setAlertOverlayVisible] = useState(false);

  const handleAlertVisibleClick = (e) => {
    e.preventDefault();
    setAlertOverlayVisible(!isAlertOverlayVisible);
  };

  const handleConfirmAlertOverlay = () => {
    setAlertOverlayVisible(!isAlertOverlayVisible);
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
        {isAlertOverlayVisible && (
          <AlertConfirmOverlay
            callback={handleAlertVisibleClick}
            confirmAlert_callback={handleConfirmAlertOverlay}
          />
        )}

        <div
          className={`container new ${expandAlertList ? "min" : ""}`}
          onClick={handleAlertVisibleClick}
        >
          <div className="title">
            <img src="/src/assets/alert.svg" alt="red rectangular alert icon" />
            <h2>Exit Bed Alert</h2>
          </div>
          <div className="info">
            <div className="item">
              <div className="caption">Section</div>
              <p>9F-01</p>
            </div>
            <div className="item">
              <div className="caption">Bed</div>
              <p>1024</p>
            </div>
            <div className="item">
              <div className="caption">Name</div>
              <p>Chan Tai Ming</p>
            </div>
            <div className="time">08:41</div>
          </div>
        </div>
        {alertsArray.map((alert, index) => (
          <div
            className={`container new ${expandAlertList ? "min" : ""}`}
            key={index}
            onClick={() => deleteAlert(alert.mac)}
          >
            <div className="title">
              <img
                src="/src/assets/alert.svg"
                alt="red rectangular alert icon"
              />
              <h2>Exit Bed Alert</h2>
            </div>
            <div className="info">
              <div className="item">
                <div className="caption">Section</div>
                <p>9F-01</p>
              </div>
              <div className="item">
                <div className="caption">Bed</div>
                <p>1024</p>
              </div>
              <div className="item">
                <div className="caption">Name</div>
                <p>{alert.userName}</p>
              </div>
              <div className="time">{alert.alertTime}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertList;
