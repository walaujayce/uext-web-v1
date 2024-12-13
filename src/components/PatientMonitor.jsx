import React, { useState, useEffect } from "react";
import { useLocation,useSearchParams } from "react-router-dom";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/patient.css";
import OpenCVComponent from "../components/OpenCVComponent";

function PatientMonitor() {
  const [rawdatum, setRawdatum] = useState([]);
  const [position, setPosition] = useState("");
  const [duration, setDuration] = useState("");

  const [searchParams] = useSearchParams();
  const macaddress = searchParams.get("macaddress") || "";

  const postData = async () => {
    try {
      const url = "/api/7285/rawdatum";
      const body = {
        MAC: macaddress,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setRawdatum(data.Data);
      console.log("Rawdatum:", data.Data);
      setPosition(data.POS);
      console.log("Position:", data.POS);
      setDuration(formatSecondsToDHMS(data.HOLD))
      console.log("Duration:", formatSecondsToDHMS(data.HOLD));
    } catch (error) {
      console.error("Error making POST request:", error);
    }
  };

  useEffect(() => {
    postData();
    const interval = setInterval(postData, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSecondsToDHMS = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    const dateTime = days > 0 ?  `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return dateTime;
};

  return (
    <div className="monitor">
      <div className="pressure">
        <div className="title">Pressure Map</div>
        <div className="box">
          <OpenCVComponent deviceid="12345" rawdata={rawdatum} />
          <div className="bt-box">
            {/* <div className="spec col">
              <p className="tag">Position</p>
              <h3>{`${position}`}</h3>
            </div>
            <div className="spec col">
              <p className="tag">Duration</p>
              <h3>{`${duration}`}</h3>
            </div> */}
            <div className="spec row">
              <div className="mr high">
                <img src="/src/assets/mr-high.svg" alt="" />
                {/* <p>12%</p> */}
              </div>
              <div className="mr mid">
                <img src="/src/assets/mr-mid.svg" alt="" />
                {/* <p>28%</p> */}
              </div>
              <div className="mr low">
                <img src="/src/assets/mr-low.svg" alt="" />
                {/* <p>60%</p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-rate">
        <div className="title">Health Rate</div>
        <img src="/src/assets/health-rate.png" alt="" />
        <div className="spec">
          <div>--</div>
          <div className="tag">Hz</div>
        </div>
      </div>
      <div className="respiration">
        <div className="title">Respiration</div>
        <img src="/src/assets/health-rate.png" alt="" />
        <div className="spec">
          <div>--</div>
          <div className="tag">Hz</div>
        </div>
      </div>
    </div>
  );
}

export default PatientMonitor;
