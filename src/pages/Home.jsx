/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/index.css";
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

function Home() {
    const { t, i18n } = useTranslation();

  const getServerIpAddress = () => {
    return window.location.hostname;
  };

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
        const response = await fetch("api/8031/devices");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.DATA);
        setDevices(data.DATA || []);
        //console.log("the current is ", getServerIpAddress());
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
    const { STAT, POS, MAC, HOLD, Bed, Floor, Section, UserName } = device;

    if (STAT === 0) {
      return (
        <Bed_disconnect
          key={MAC}
          macaddress={MAC}
          hold={formatSecondsToDHMS(HOLD)}
          bed={Bed}
          floor={Floor}
          section={Section}
          username={UserName}
        />
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
        ) : POS === 3 ? (
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
  const [sort_by_bed, setSort_by_bed] = useState(true);
  const [sort_by_status, setSort_by_status] = useState(false);
  const handleToggleSort = (type) => {
    if (type === "bed") {
      setSort_by_bed(true);
      setSort_by_status(false);
    } else {
      setSort_by_bed(false);
      setSort_by_status(true);
    }
  };

  return (
    <>
      <Navbar />
      <div className="wrap">
        <AlertList />
        <div className="main">
          <div className="box">
            <h1>{t('Home.Monitor')}</h1>
          </div>
          <div className="monitors">
            <div className="top-bar">
              <FloorSectionBar
                selectFloor={handleSelectFloor}
                selectSection={handleSelectSection}
              />
              <div className="sort">
                <div className="label">Sort by</div>
                <div className="opt-box">
                  <div
                    className={`opt s1 ${sort_by_bed ? "active" : ""}`}
                    onClick={() => handleToggleSort("bed")}
                  >
                    Bed
                  </div>
                  <div
                    className={`opt s2 ${sort_by_status ? "active" : ""}`}
                    onClick={() => handleToggleSort("status")}
                  >
                    Status
                  </div>
                  <div className={`bg-bk ${sort_by_bed ? "s1" : "s2"}`}></div>
                </div>
              </div>
            </div>
            {/* Bed Grid Sort by Bed */}
            <div className={`grid ${sort_by_bed ? "active" : ""}`}>
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
            <div className={`by-status ${sort_by_status ? "active" : ""}`}>
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
                  <div className="title">Alerts</div>
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
                    device.POS === 3
                ) && (
                <div className="status">
                  <div className="title">Attention</div>
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
                          device.POS === 3
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
                  <div className="title">Disconnected</div>
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
                          to={`/patient/patient-detail/patient-monitor?macaddress=${device.MAC}`}
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
                      device.POS === 3 ||
                      device.POS === 4 ||
                      device.POS === 5 ||
                      device.POS === 0
                    )
                ) && (
                <div className="status">
                  <div className="title">Normal</div>
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
                            device.POS === 3 ||
                            device.POS === 4 ||
                            device.POS === 5 ||
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
                  <div className="title">Vacant</div>
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
