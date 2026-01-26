import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/patient.css";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../JS/AuthContext";
import OpenCVComponent from "../components/OpenCVComponent";
import OpenCVComponent2 from "../components/OpenCVComponent2";
import { he } from "date-fns/locale";
import api from "../api/apiClient";
import api8031 from "../api/apiClient8031";

function DemoSD() {
  const { t, i18n } = useTranslation();

  const { role } = useAuth();
  const location = useLocation();
  const searchParams = location.search;
  const navigate = useNavigate();

  const handleBackBtnClick = () => {
    navigate(location.state?.from || "/home");
  };

  const [rawdatum, setRawdatum] = useState([]);
  const [position, setPosition] = useState("");
  const [duration, setDuration] = useState("");
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);

  const macaddress = "80C9553B560C";
  const postData = async () => {
    try {
      // const response = await fetch(`/api/8031/rawdata/${macaddress}`, {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });

      // const contentType = response.headers.get("Content-Type");
      // if (!response.ok || !contentType?.includes("application/json")) {
      //   throw new Error(`Expected JSON, got: ${contentType}`);
      // }

      // const data = await response.json();
      const response = await api8031.get(`/api/8031/rawdata/${macaddress}`);

      const data = response.data;

      setRawdatum(data.IMAGE);
      //console.log("Rawdatum:", data.IMAGE);
      setPosition(data.POS);
      //console.log("Position:", data.POS);
      setDuration(formatSecondsToDHMS(data.HOLD));
      //console.log("Duration:", formatSecondsToDHMS(data.HOLD));
      setWidth(data.WIDTH);
      setHeight(data.HEIGHT);
    } catch (error) {
      console.error("Error making POST request:", error);
    }
  };

  useEffect(() => {
    postData();
    const interval = setInterval(postData, 900);
    return () => clearInterval(interval);
  }, []);

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

  // UEXT
  const [rawdataUEXT, setRawdataUEXT] = useState([]);
  const [widthUEXT, setWidthUEXT] = useState(null);
  const [heightUEXT, setHeightUEXT] = useState(null);

  const macaddressUEXT = "80C9553B5634";
  const postDataUEXT = async () => {
    try {
      // const response = await fetch(`/api/8031/rawdata/${macaddressUEXT}`, {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });

      // const contentType = response.headers.get("Content-Type");
      // if (!response.ok || !contentType?.includes("application/json")) {
      //   throw new Error(`Expected JSON, got: ${contentType}`);
      // }

      // const data = await response.json();
      const response = await api.get(`/api/8031/rawdata/${macaddressUEXT}`);

      const data = await response.data;

      setRawdataUEXT(data.IMAGE);
      setWidthUEXT(data.WIDTH);
      setHeightUEXT(data.HEIGHT);
    } catch (error) {
      console.error("Error making POST request:", error);
    }
  };

  useEffect(() => {
    postDataUEXT();
    const interval = setInterval(postDataUEXT, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <div className="wrap">
        <div className="main">
          <div className="monitor">
            {/* UEXT */}
            <div className="pressure" style={{gridColumn:"span 3"}}>
              <div className="title">UEXT</div>
              <div className="box">
                {width &&
                  height &&
                  (rawdataUEXT ? (
                    <OpenCVComponent
                      deviceid={macaddressUEXT}
                      rawdata={rawdataUEXT}
                      width={widthUEXT}
                      height={heightUEXT}
                    />
                  ) : (
                    <img
                      className="disconnect"
                      src="/src/assets/disconnect.png"
                      alt=""
                    ></img>
                  ))}
                <div className="bt-box">
                  <div className="spec row">
                    <div className="mr high">
                      {/* <img src="/src/assets/mr-high.svg" alt="" /> */}
                      {/* <p>12%</p> */}
                    </div>
                    <div className="mr mid">
                      {/* <img src="/src/assets/mr-mid.svg" alt="" /> */}
                      {/* <p>28%</p> */}
                    </div>
                    <div className="mr low">
                      {/* <img src="/src/assets/mr-low.svg" alt="" /> */}
                      {/* <p>60%</p> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* UMAP */}
            <div className="pressure" style={{gridColumn:"span 3"}}>
              <div className="title">UMAP</div>
              <div className="box">
                {width &&
                  height &&
                  (rawdatum ? (
                    <OpenCVComponent2
                      deviceid={macaddress}
                      rawdata={rawdatum}
                      width={width}
                      height={height}
                    />
                  ) : (
                    <img
                      className="disconnect"
                      src="/src/assets/disconnect.png"
                      alt=""
                    ></img>
                  ))}
                <div className="bt-box">
                  <div className="spec row">
                    <div className="mr high">
                      {/* <img src="/src/assets/mr-high.svg" alt="" /> */}
                      {/* <p>12%</p> */}
                    </div>
                    <div className="mr mid">
                      {/* <img src="/src/assets/mr-mid.svg" alt="" /> */}
                      {/* <p>28%</p> */}
                    </div>
                    <div className="mr low">
                      {/* <img src="/src/assets/mr-low.svg" alt="" /> */}
                      {/* <p>60%</p> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DemoSD;
