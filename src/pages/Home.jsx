/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import Navbar from "/src/components/Navbar.jsx";
import Alert from "/src/components/Alert.jsx";
import FloorSectionBar from "../components/FloorSectionBar";
import {
  Bed_disconnect,
  Bed_alert,
  Bed_attention,
  Bed_vacant,
  Bed_default,
} from "../components/Bed_Cards";
import Bed_Sort_by_Status from "../components/Bed_Sort_by_Status";

function Home() {
  const [devices, setDevices] = useState([]);

  const fetchDeviceList = async () => {
    try {
      const response = await fetch("api/8031/devices");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.DATA);
      setDevices(data.DATA || []);
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  useEffect(() => {
    fetchDeviceList();
    const interval = setInterval(fetchDeviceList, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderDeviceComponent = (device) => {
    const { STAT, POS, MAC, HOLD } = device;

    if (STAT === 0) {
      return (
        <Bed_disconnect
          key={MAC}
          macaddress={MAC}
          hold={formatSecondsToDHMS(HOLD)}
        />
      );
    } else if (STAT === 1) {
      return POS === 4 || POS === 5 ? (
        <Bed_alert
          key={MAC}
          macaddress={MAC}
          hold={formatSecondsToDHMS(HOLD)}
        />
      ) : POS === 3 ? (
        <Bed_attention
          key={MAC}
          macaddress={MAC}
          hold={formatSecondsToDHMS(HOLD)}
        />
      ) : (
        <Bed_default
          key={MAC}
          macaddress={MAC}
          hold={formatSecondsToDHMS(HOLD)}
        />
      );
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
        <Alert />
        <div className="main">
          <div className="box">
            <h1>Monitors</h1>
          </div>
          <div className="monitors">
            <div className="top-bar">
              <FloorSectionBar />
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
              {devices.map((device) => (
                <Link
                  to={`/patient/patient-detail/patient-monitor?macaddress=${device.MAC}`}
                  key={device.MAC}
                >
                  {renderDeviceComponent(device)}{" "}
                </Link>
              ))}
            </div>
            {/* Bed Grid Sort by Status */}
            <div className={`by-status ${sort_by_status ? "active" : ""}`}>
              {/* Alert Status */}
              <div className="status">
                <div className="title">Alerts</div>
                <div className="status-grid">
                  <a href="patient-monitor.html" className="bed alert">
                    <div className="b-num">1003</div>
                    <div className="name">Chan Tai Ming</div>
                    <div className="tag">
                      <img src="" alt="" />
                      <p className="timer">02:14:42</p>
                    </div>
                    <div className="dis-tag">
                      <img src="/src/assets/link-off.svg" alt="" />
                      <p>Disconnected</p>
                    </div>
                    <img
                      className="add"
                      src="/src/assets/add.svg"
                      alt="add icon"
                    />
                  </a>
                </div>
              </div>
              {/* Attention Status */}
              <div className="status">
                <div className="title">Attention</div>
                <div className="status-grid">
                  <a href="patient-monitor.html" className="bed attention">
                    <div className="b-num">1004</div>
                    <div className="name">Chan Tai Ming</div>
                    <div className="tag">
                      <img src="" alt="" />
                      <p className="timer">02:14:42</p>
                    </div>
                    <div className="dis-tag">
                      <img src="/src/assets/link-off.svg" alt="" />
                      <p>Disconnected</p>
                    </div>
                    <img
                      className="add"
                      src="/src/assets/add.svg"
                      alt="add icon"
                    />
                  </a>
                </div>
              </div>
              {/* Disconnected Status */}
              <div className="status">
                <div className="title">Disconnected</div>
                <div className="status-grid">
                  <a href="patient-monitor.html" className="bed disconnect">
                    <div className="b-num">1011</div>
                    <div className="name">Chan Tai Ming</div>
                    <div className="tag">
                      <img src="" alt="" />
                      <p className="timer">02:14:42</p>
                    </div>
                    <div className="dis-tag">
                      <img src="/src/assets/link-off.svg" alt="" />
                      <p>Disconnected</p>
                    </div>
                    <img
                      className="add"
                      src="/src/assets/add.svg"
                      alt="add icon"
                    />
                  </a>
                </div>
              </div>
              {/* Default Status */}
              <div className="status">
                <div className="title">Normal</div>
                <div className="status-grid">
                  <a href="patient-monitor.html" className="bed">
                    <div className="b-num">1001</div>
                    <div className="name">Chan Tai Ming</div>
                    <div className="tag">
                      <img src="" alt="" />
                      <p className="timer">02:14:42</p>
                    </div>
                    <div className="dis-tag">
                      <img src="/src/assets/link-off.svg" alt="" />
                      <p>Disconnected</p>
                    </div>
                    <img
                      className="add"
                      src="/src/assets/add.svg"
                      alt="add icon"
                    />
                  </a>
                </div>
              </div>
              {/* Vacant Status */}
              <div className="status">
                <div className="title">Vacant</div>
                <div className="status-grid">
                  <a href="patient-monitor.html" className="bed vacant">
                    <div className="b-num">1028</div>
                    <div className="name">Chan Tai Ming</div>
                    <div className="tag">
                      <img src="" alt="" />
                      <p className="timer">02:14:42</p>
                    </div>
                    <div className="dis-tag">
                      <img src="/src/assets/link-off.svg" alt="" />
                      <p>Disconnected</p>
                    </div>
                    <img
                      className="add"
                      src="/src/assets/add.svg"
                      alt="add icon"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
