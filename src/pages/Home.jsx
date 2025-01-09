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
        console.log("the current is ", getServerIp());
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
    const { STAT, POS, MAC, HOLD, Bed, Floor, Section, UserName, ER } = device;

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
        /></Link>
      );
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
        return POS === 4 || POS === 5 || POS === 0 ? (
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
        ) : POS === 8 ? (
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
    }

    return null; // Handle any unexpected case if necessary
  };

  const renderDeviceComponent_7284 = (device) => {
    const { connect, macaddress } = device;

    if (connect === false) {
      return <Bed_disconnect key={macaddress} macaddress={macaddress} />;
    } else if (connect === true) {
      return <Bed_default key={macaddress} macaddress={macaddress} />;
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
                .sort((a, b) => {
                  // Compare the number of digits in the bed number
                  const aDigits = a.Bed?.toString().length;
                  const bDigits = b.Bed?.toString().length;

                  if (aDigits !== bDigits) {
                    return aDigits - bDigits; // Ascending order of digits count
                  }

                  // If the digits count is the same, compare the bed numbers
                  return a.Bed - b.Bed; // Ascending order of bed numbers
                })
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
                    device.STAT === 1 &&
                    !(device.UserName === null || device.UserName === "") &&
                    (device.POS === 4 || device.POS === 5 || device.POS === 0)
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
                          device.STAT === 1 &&
                          !(
                            device.UserName === null || device.UserName === ""
                          ) &&
                          (device.POS === 4 ||
                            device.POS === 5 ||
                            device.POS === 0)
                      )
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
                    device.STAT === 1 &&
                    !(device.UserName === null || device.UserName === "") &&
                    device.POS === 8
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
                          device.STAT === 1 &&
                          !(
                            device.UserName === null || device.UserName === ""
                          ) &&
                          device.POS === 8
                      )
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
                .some((device) => device.STAT === 0) && (
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
                      .filter((device) => device.STAT === 0)
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
                    device.STAT === 1 &&
                    !(device.UserName === null || device.UserName === "") &&
                    !(
                      device.POS === 4 ||
                      device.POS === 5 ||
                      device.POS === 8 ||
                      device.POS === 0
                    )
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
                          device.STAT === 1 &&
                          !(
                            device.UserName === null || device.UserName === ""
                          ) &&
                          !(
                            device.POS === 4 ||
                            device.POS === 5 ||
                            device.POS === 8 ||
                            device.POS === 0
                          )
                      )
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
                    device.STAT === 1 &&
                    (device.UserName === null || device.UserName === "")
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
                          device.STAT === 1 &&
                          (device.UserName === null || device.UserName === "")
                      )
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
