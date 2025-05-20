import React, { useState, useEffect } from "react";
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

const DeviceList = () => {
  const { t, i18n } = useTranslation();

  const { role } = useAuth();

  const [devices, setDevices] = useState([]);

  const [deviceMap, setDeviceMap] = useState({}); // key: mac, value: { rssi, ping }

  const [port, setPort] = useState("7284");
  const handleSelectPort = (port) => {
    console.log(port);
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
  const fetchDeviceList = async () => {
    try {
      const [response, response8031] = await Promise.all([
        fetch("/api/7284/db/Device"),
        fetch("/api/8031/devices"),
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!response8031.ok) {
        throw new Error(`HTTP error! status: ${response8031.status}`);
      }
      const data = await response.json();
      console.log(data);
      const result8031 = await response8031.json();
      const data8031 = result8031.DATA;
      //console.log(data8031);
      setDevices(data);
      const macSet = new Set(data.map((device) => device.macaddress));
      const matchedMap = {};
      data8031.forEach((device) => {
        if (macSet.has(device.MAC)) {;
          matchedMap[device.MAC] = {
            rssi: device.RSSI,
            ping: device.Ping,
          };
        }
      });
      //console.log("deviceMap " + JSON.stringify(matchedMap, null, 2));
      setDeviceMap(matchedMap);
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  useEffect(() => {
    fetchDeviceList();
    const interval = setInterval(fetchDeviceList, 1000);
    return () => clearInterval(interval);
  }, [port]);

  const filteredDevices = devices
    .filter((device) => device.used === true) // Only used devices
    .filter(
      (device) =>
        select_floor === "" ||
        select_floor === "All" ||
        device.floor === select_floor
    ) // Filter by floor
    .filter(
      (device) =>
        select_section === "" ||
        select_section === "All" ||
        device.section === select_section
    ) // Filter by section
    .sort((a, b) => {
      const macA = a.macaddress?.toUpperCase() || "";
      const macB = b.macaddress?.toUpperCase() || "";
      if (macA < macB) return -1;
      if (macA > macB) return 1;
      const numA = parseInt(a.macaddress?.replace(/[^0-9]/g, "") || "0", 10);
      const numB = parseInt(b.macaddress?.replace(/[^0-9]/g, "") || "0", 10);
      return numA - numB;
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
          />
          <div className="btn" id="addDevice" onClick={handleAddDeviceClick}>
            <img src="" alt="" className="prefix" />
            <p className="btn-text">{t("DeviceList.NewDevice")}</p>
            {isOverlayVisible && (
              <AddNewDevice callback={handleAddDeviceClick} />
            )}
          </div>
        </div>
        <div className="pl">
          <div className="head">
            <h3 className="fg1">{t("DeviceList.DeviceType")}</h3>
            <h3 className="fg2">{t("DeviceList.DeviceID")}</h3>
            <h3 className="fg2">{t("DeviceList.MACAddress")}</h3>
            <h3 className="fg2">{t("DeviceList.IPAddress")}</h3>
            <h3 className="fg3">{t("DeviceList.Bed")}</h3>
            <h3 className="fg3">{t("DeviceList.Section")}</h3>
            <h3 className="fg3">{t("DeviceList.Floor")}</h3>
            <h3 className="fg1">{t("DeviceList.SettingDate")}</h3>
            <h3 className="fg3">PING(ms)</h3>
            <h3 className="fg3">RSSI(dBm)</h3>
            <div className="connection fg2">
              <h3>
                {t("DeviceList.DeviceStatus")}
                {`(${connectedDevicesCount})`}
              </h3>
            </div>
          </div>
          <div className="item-list">
            {port === "7284" &&
              filteredDevices.map((device) =>
                ["administrator", "engineer"].includes(role) ? (
                  <Link
                    to={`/device/device-settings?macaddress=${device.macaddress}`}
                    key={device.macaddress}
                  >
                    <div className="item">
                      <h3 className="fg1">
                        {device.devicetype === 0
                          ? "Not Specified"
                          : device.devicetype === 1
                          ? "UEXT"
                          : device.devicetype === 2
                          ? "UMAP"
                          : "UNC"}
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
                      <h3 className="fg3">
                        {deviceMap[device.macaddress]?.ping ?? "----"}
                      </h3>
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
                  </Link>
                ) : (
                  <div className="item">
                    <h3 className="fg1">
                      {device.devicetype === 0
                        ? "Not Specified"
                        : device.devicetype === 1
                        ? "UEXT"
                        : device.devicetype === 2
                        ? "UMAP"
                        : "UNC"}
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
                    <h3 className="fg3">
                      {deviceMap[device.macaddress]?.ping ?? "----"}
                    </h3>
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
