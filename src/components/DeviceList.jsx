import React, { useState, useEffect, useRef } from "react";
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
  const [select_deviceType, setSelect_DeviceType] = useState("");
  const handleSelectDeviceType = (deviceType) => {
    setSelect_DeviceType(deviceType);
  };

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
  //     console.log(data);
  //     setDevices(data);
  //   } catch (error) {
  //     console.error("Error fetching device data:", error);
  //   }
  // };
  const fetchDeviceList = async () => {
    try {
      if (import.meta.env.VITE_MODE === "dev") {
        const [response, response8031] = await Promise.all([
          fetch("/api/7284/db/Device"),
          fetch("/api/7284/ss/SocketServer"),
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
        const data8031 = result8031;
        //console.log(data8031);
        setDevices(data);
        const macSet = new Set(data.map((device) => device.macaddress));
        const matchedMap = {};
        data8031.forEach((device) => {
          if (macSet.has(device.MAC)) {
            matchedMap[device.MAC] = {
              rssi: device.RSSI,
              ping: device.Ping,
            };
          }
        });
        //console.log("deviceMap " + JSON.stringify(matchedMap, null, 2));
        setDeviceMap(matchedMap);
      } else {
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
          if (macSet.has(device.MAC)) {
            matchedMap[device.MAC] = {
              rssi: device.RSSI,
              ping: device.Ping,
            };
          }
        });
        //console.log("deviceMap " + JSON.stringify(matchedMap, null, 2));
        setDeviceMap(matchedMap);
      }
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
          console.log("sortType: ", sortType);
          if (sortDirection) {
            return String(b.devicetype).localeCompare(String(a.devicetype));
          } else {
            return String(a.devicetype).localeCompare(String(b.devicetype));
          }
        case sortTypes[1]: // device id
          console.log("sortType: ", sortType);
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
          console.log("sortType: ", sortType);
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
          console.log("sortType: ", sortType);
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
          console.log("sortType: ", sortType);
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
          console.log("sortType: ", sortType);
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
          console.log("sortType: ", sortType);
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
          console.log("sortType: ", sortType);
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
          console.log("sortType: ", sortType);
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
            {isOverlayVisible && (
              <AddNewDevice callback={handleAddDeviceClick} />
            )}
          </div>
        </div>
        <div className="pl">
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
            <h3 className="fg3">PING(ms)</h3>
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
