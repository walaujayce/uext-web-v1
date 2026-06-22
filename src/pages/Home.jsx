/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/index.css";
import "../components/Modals/overlay.css";
import Navbar from "/src/components/Navbar.jsx";
import AlertList from "/src/components/AlertList.jsx";
import FloorSectionBar from "../components/FloorSectionBar";
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

function Home() {
  const { t, i18n } = useTranslation();

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
      BedColor: 1,
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

  const fetchDeviceList = async () => {
    try {
      if (port === "8031") {
        if (import.meta.env.VITE_MODE === "dev") {
          // const response = await fetch("/api/7284/ss/SocketServer");
          // if (!response.ok) {
          //   throw new Error(`HTTP error! status: ${response.status}`);
          // }
          // const data = await response.json();
          const response = await api.get("/api/7284/ss/SocketServer");
          const data = response.data;
          //console.log("ss/SocketServer: ", data);
          const devicesNonHalow = data.filter((device) => device.TYPE !== 201);
          setDevices(devicesNonHalow || []);
        } else {
          // const response = await fetch("/api/8031/devices");
          // if (!response.ok) {
          //   throw new Error(`HTTP error! status: ${response.status}`);
          // }
          // const data = await response.json();
          // //console.log(data.DATA);
          const response = await api8031.get("/api/8031/devices");
          const data = response.data;
          const devicesNonHalow = data.DATA.filter(
            (device) => device.TYPE !== 201,
          );
          setDevices(devicesNonHalow || []);
        }
        // //console.log("the current is ", getServerIp());
      } else if (port === "7284") {
        const response = await api.get("/api/7284/db/Device");
        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const data = await response.json();
        const data = response.data;
        //console.log(data);
        setDevices(data || []);
      }
      // setDevices(fakeList); // TEST
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  useEffect(() => {
    fetchDeviceList();
    const interval = setInterval(fetchDeviceList, 1000);
    return () => clearInterval(interval);
  }, [port]);

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

    // 先以STAT去區分on/off-line，再以TYPE區分UEXT/UMAP，最後以POS區分狀態
    if (STAT === 0) {
      if (TYPE !== 0) {
        return (
          <Link
            to={`/device/device-settings?macaddress=${MAC}`}
            key={MAC}
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
            key={MAC}
            macaddress={MAC}
            bed={Bed}
            floor={Floor}
            section={Section}
          />
        );
      } else {
        return (
          <Link
            to={`/patient/patient-detail/patient-monitor?macaddress=${MAC}`}
            key={MAC}
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
                .filter((device) => {
                  return (
                    select_floor === "" ||
                    select_floor === "All" ||
                    device.Floor === select_floor
                  );
                })
                .filter((device) => {
                  return (
                    select_section === "" ||
                    select_section === "All" ||
                    device.Section === select_section
                  );
                })
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
                  <div className="title">{t("Home.Alerts")}</div>
                  <div className="status-grid">
                    {devices
                      .filter((device) => {
                        return (
                          select_floor === "" ||
                          select_floor === "All" ||
                          device.Floor === select_floor
                        );
                      })
                      .filter((device) => {
                        return (
                          select_section === "" ||
                          select_section === "All" ||
                          device.Section === select_section
                        );
                      })
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
                          to={`/patient/patient-detail/patient-monitor?macaddress=${device.MAC}`}
                          key={device.MAC}
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
                .filter((device) => {
                  return (
                    select_floor === "" ||
                    select_floor === "All" ||
                    device.Floor === select_floor
                  );
                })
                .filter((device) => {
                  return (
                    select_section === "" ||
                    select_section === "All" ||
                    device.Section === select_section
                  );
                })
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
                  <div className="title">{t("Home.Attention")}</div>
                  <div className="status-grid">
                    {devices
                      .filter((device) => {
                        return (
                          select_floor === "" ||
                          select_floor === "All" ||
                          device.Floor === select_floor
                        );
                      })
                      .filter((device) => {
                        return (
                          select_section === "" ||
                          select_section === "All" ||
                          device.Section === select_section
                        );
                      })
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
                          to={`/patient/patient-detail/patient-monitor?macaddress=${device.MAC}`}
                          key={device.MAC}
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
                .filter((device) => {
                  return (
                    select_floor === "" ||
                    select_floor === "All" ||
                    device.Floor === select_floor
                  );
                })
                .filter((device) => {
                  return (
                    select_deviceType === "" ||
                    select_deviceType === "All" ||
                    device.TYPE === select_deviceType
                  );
                })
                .filter((device) => {
                  return (
                    select_section === "" ||
                    select_section === "All" ||
                    device.Section === select_section
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
                  <div className="title">{t("Home.Normal")}</div>
                  <div className="status-grid">
                    {devices
                      .filter((device) => {
                        return (
                          select_floor === "" ||
                          select_floor === "All" ||
                          device.Floor === select_floor
                        );
                      })
                      .filter((device) => {
                        return (
                          select_section === "" ||
                          select_section === "All" ||
                          device.Section === select_section
                        );
                      })
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
                          to={`/patient/patient-detail/patient-monitor?macaddress=${device.MAC}`}
                          key={device.MAC}
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
                .filter((device) => {
                  return (
                    select_floor === "" ||
                    select_floor === "All" ||
                    device.Floor === select_floor
                  );
                })
                .filter((device) => {
                  return (
                    select_section === "" ||
                    select_section === "All" ||
                    device.Section === select_section
                  );
                })
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
                  <div className="title">{t("Home.Vacant")}</div>
                  <div className="status-grid">
                    {devices
                      .filter((device) => {
                        return (
                          select_floor === "" ||
                          select_floor === "All" ||
                          device.Floor === select_floor
                        );
                      })
                      .filter((device) => {
                        return (
                          select_section === "" ||
                          select_section === "All" ||
                          device.Section === select_section
                        );
                      })
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
                          key={device.MAC}
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
                .filter((device) => {
                  return (
                    select_floor === "" ||
                    select_floor === "All" ||
                    device.Floor === select_floor
                  );
                })
                .filter((device) => {
                  return (
                    select_section === "" ||
                    select_section === "All" ||
                    device.Section === select_section
                  );
                })
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
                  <div className="title">{t("Home.Disconnected")}</div>
                  <div className="status-grid">
                    {devices
                      .filter((device) => {
                        return (
                          select_floor === "" ||
                          select_floor === "All" ||
                          device.Floor === select_floor
                        );
                      })
                      .filter((device) => {
                        return (
                          select_section === "" ||
                          select_section === "All" ||
                          device.Section === select_section
                        );
                      })
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
                          to={`/device/device-settings?macaddress=${device.MAC}`}
                          key={device.MAC}
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
