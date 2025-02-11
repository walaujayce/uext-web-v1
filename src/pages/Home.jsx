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
} from "../components/Bed_Cards";
import { useTranslation } from "react-i18next";
import { getServerIp } from "../JS/getServerIp";

function Home() {
  const { t, i18n } = useTranslation();

  const [port, setPort] = useState("8031");
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
    console.log("section");
    setSelect_Section(section);
  };

  const [devices, setDevices] = useState([]);

  const fetchDeviceList = async () => {
    try {
      if (port === "8031") {
        const response = await fetch("/api/8031/devices");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.DATA);
        setDevices(data.DATA || []);
        // console.log("the current is ", getServerIp());
      } else if (port === "7284") {
        const response = await fetch("/api/7284/db/Device");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        setDevices(data || []);
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

  const renderDeviceComponent = (device) => {
    const { STAT, POS, MAC, HOLD, Bed, Floor, Section, UserName, TYPE, BedColor } =
      device;

    // 先以STAT去區分on/off-line，再以TYPE區分UEXT/UMAP，最後以POS區分狀態
    if (STAT === 0) {
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
          />
        </Link>
      );
    } else if (STAT === 1) {
      if (TYPE === 1) {
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
          // return POS === 4 || POS === 5 || POS === 0 ? (
          return BedColor == 1 ? (
            <Link
              to={`/patient/patient-detail/patient-monitor?macaddress=${MAC}`}
              key={MAC}
              state={{ from: "/home" }}
            >
              <Bed_alert
                key={MAC}
                macaddress={MAC}
                hold={formatSecondsToDHMS(HOLD)}
                bed={Bed}
                floor={Floor}
                section={Section}
                username={UserName}
              />
            </Link>
          // ) : POS === 8 ? (
          ) : BedColor === 2 ? (
            <Link
              to={`/patient/patient-detail/patient-monitor?macaddress=${MAC}`}
              key={MAC}
              state={{ from: "/home" }}
            >
              <Bed_attention
                key={MAC}
                macaddress={MAC}
                hold={formatSecondsToDHMS(HOLD)}
                bed={Bed}
                floor={Floor}
                section={Section}
                username={UserName}
              />
            </Link>
          ) : (
            <Link
              to={`/patient/patient-detail/patient-monitor?macaddress=${MAC}`}
              key={MAC}
              state={{ from: "/home" }}
            >
              <Bed_default
                key={MAC}
                macaddress={MAC}
                hold={formatSecondsToDHMS(HOLD)}
                bed={Bed}
                floor={Floor}
                section={Section}
                username={UserName}
              />
            </Link>
          );
        }
      } else if (TYPE === 2) {
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
              <Bed_default
                key={MAC}
                macaddress={MAC}
                hold={formatSecondsToDHMS(HOLD)}
                bed={Bed}
                floor={Floor}
                section={Section}
                username={UserName}
              />
            </Link>
          );
        }
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
            "0"
          )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
            2,
            "0"
          )}`
        : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
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
    const numA = parseInt(
      a.Bed?.replace(/[^0-9]/g, "") || "0",
      10
    );
    const numB = parseInt(
      b.Bed?.replace(/[^0-9]/g, "") || "0",
      10
    );

    return numA - numB; // Numeric ascending order
  };

  {
    /* Handle Sort by BED/STATUS */
  }
  const [sortBy, setSortBy] = useState(
    () => localStorage.getItem("sort_by") || "bed"
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
                .some(
                  (device) =>
                    device.TYPE === 1 &&
                    device.STAT === 1 &&
                    !(device.UserName === null || device.UserName === "") &&
                    // (device.POS === 4 || device.POS === 5 || device.POS === 0)
                    (device.BedColor === 1)
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
                      .filter(
                        (device) =>
                          device.TYPE === 1 &&
                          device.STAT === 1 &&
                          !(
                            device.UserName === null || device.UserName === ""
                          ) &&
                          // (device.POS === 4 || device.POS === 5 || device.POS === 0)
                          (device.BedColor === 1)
                      )
                      .sort(sortAlphabet)
                      .map((device) => (
                        <Link
                          to={`/patient/patient-detail/patient-monitor?macaddress=${device.MAC}`}
                          key={device.MAC}
                          state={{ from: "/home" }}
                        >
                          <Bed_alert
                            key={device.MAC}
                            macaddress={device.MAC}
                            hold={formatSecondsToDHMS(device.HOLD)}
                            bed={device.Bed}
                            floor={device.Floor}
                            section={device.Section}
                            username={device.UserName}
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
                .some(
                  (device) =>
                    device.TYPE === 1 &&
                    device.STAT === 1 &&
                    !(device.UserName === null || device.UserName === "") &&
                    // device.POS === 8
                    device.BedColor === 2
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
                      .filter(
                        (device) =>
                          device.TYPE === 1 &&
                          device.STAT === 1 &&
                          !(
                            device.UserName === null || device.UserName === ""
                          ) &&
                          // device.POS === 8
                          device.BedColor === 2
                      )
                      .sort(sortAlphabet)
                      .map((device) => (
                        <Link
                          to={`/patient/patient-detail/patient-monitor?macaddress=${device.MAC}`}
                          key={device.MAC}
                          state={{ from: "/home" }}
                        >
                          <Bed_attention
                            key={device.MAC}
                            macaddress={device.MAC}
                            hold={formatSecondsToDHMS(device.HOLD)}
                            bed={device.Bed}
                            floor={device.Floor}
                            section={device.Section}
                            username={device.UserName}
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
                    select_section === "" ||
                    select_section === "All" ||
                    device.Section === select_section
                  );
                })
                .some(
                  (device) =>
                    (device.TYPE === 1 &&
                      device.STAT === 1 &&
                      !(device.UserName === null || device.UserName === "") &&
                      // !(
                      //   device.POS === 4 ||
                      //   device.POS === 5 ||
                      //   device.POS === 8 ||
                      //   device.POS === 0
                      (device.BedColor === 0
                      )) ||
                    (device.TYPE === 2 &&
                      device.STAT === 1 &&
                      !(device.UserName === null || device.UserName === ""))
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
                      .filter(
                        (device) =>
                          (device.TYPE === 1 &&
                            device.STAT === 1 &&
                            !(
                              device.UserName === null || device.UserName === ""
                            ) &&
                            // !(
                              // device.POS === 4 ||
                              // device.POS === 5 ||
                              // device.POS === 8 ||
                              // device.POS === 0
                              (device.BedColor === 0
                            )) ||
                          (device.TYPE === 2 &&
                            device.STAT === 1 &&
                            !(
                              device.UserName === null || device.UserName === ""
                            ))
                      )
                      .sort(sortAlphabet)
                      .map((device) => (
                        <Link
                          to={`/patient/patient-detail/patient-monitor?macaddress=${device.MAC}`}
                          key={device.MAC}
                          state={{ from: "/home" }}
                        >
                          <Bed_default
                            key={device.MAC}
                            macaddress={device.MAC}
                            hold={formatSecondsToDHMS(device.HOLD)}
                            bed={device.Bed}
                            floor={device.Floor}
                            section={device.Section}
                            username={device.UserName}
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
                .some(
                  (device) =>
                    (device.TYPE === 1 &&
                      device.STAT === 1 &&
                      (device.UserName === null || device.UserName === "")) ||
                    (device.TYPE === 2 &&
                      device.STAT === 1 &&
                      (device.UserName === null || device.UserName === ""))
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
                      .filter(
                        (device) =>
                          (device.TYPE === 1 &&
                            device.STAT === 1 &&
                            (device.UserName === null ||
                              device.UserName === "")) ||
                          (device.TYPE === 2 &&
                            device.STAT === 1 &&
                            (device.UserName === null ||
                              device.UserName === ""))
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
                .some(
                  (device) =>
                    (device.TYPE === 1 && device.STAT === 0) ||
                    (device.TYPE === 2 && device.STAT === 0)
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
                      .filter(
                        (device) =>
                          (device.TYPE === 1 && device.STAT === 0) ||
                          (device.TYPE === 2 && device.STAT === 0)
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
