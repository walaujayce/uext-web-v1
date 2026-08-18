import React, { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/patient.css";
import OpenCVComponent from "../components/OpenCVComponent";
import { useTranslation } from "react-i18next";
import Example from "./HeartRateGraph";
import HeartBeatGraph from "./HeartRateGraph";
import RespirationChart from "./RespiratoryGraph";
import api from "../api/apiClient";
import api8031, { isSkipped } from "../api/apiClient8031";
import RiskRegion from "./RiskRegion";
import RiskArea from "./RiskArea";
import RiskIndexBar from "./RiskIndexBar";

function PatientMonitor() {
  const { t, i18n } = useTranslation();

  const [searchParams] = useSearchParams();
  const macaddress = searchParams.get("macaddress") || "";
  const respirationArrayLimit = 60;

  const [rawdatum, setRawdatum] = useState([]);
  const [position, setPosition] = useState("");
  const [duration, setDuration] = useState("");
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);
  const [isUMAP, setIsUMAP] = useState(false);
  const [respirationStatus, setRespirationStatus] = useState(false);
  const [respirationValue, setRespirationValue] = useState(0);
  const [respirationHistoryArray, setRespirationHistoryArray] = useState([]);
  const [heartValue, setHeartValue] = useState(0);

  const temp = [
    { idx: 1, center_x: 0, center_y: 0, radius: 2, duration_sec: 5 },
    { idx: 2, center_x: 10, center_y: 10, radius: 2, duration_sec: 5 },
    { idx: 3, center_x: 20, center_y: 52, radius: 2, duration_sec: 5 },
    { idx: 4, center_x: 50, center_y: 42, radius: 2, duration_sec: 5 },
    { idx: 4, center_x: 40, center_y: 32, radius: 2, duration_sec: 5, risk_level:0 },
    { idx: 4, center_x: 80, center_y: 22, radius: 2, duration_sec: 5, risk_level:1 },
    { idx: 4, center_x: 100, center_y: 2, radius: 2, duration_sec: 5, risk_level:0 },
    { idx: 4, center_x: 200, center_y: 62, radius: 2, duration_sec: 5, risk_level:2 },
    { idx: 4, center_x: 24, center_y: 62, radius: 2, duration_sec: 5 },
    { idx: 99, center_x: 24, center_y: 62, radius: 2, duration_sec: 5 },
  ];
  const [riskRegionArray, setRiskRegionArray] = useState([]);

  // /rawdata health-check now lives in apiClient8031.js.
  // Locally we only need:
  //   - an AbortController to cancel the in-flight call on unmount
  //   - the interval id so we can stop polling
  const abortRef    = useRef(null);
  const intervalRef = useRef(null);
  const POLL_INTERVAL_MS = 1000; // poll every 1s

  const requestBody_Breathing = {
    deviceID: macaddress,
    count: 60,
  };
  const postData = async () => {
    // Per-call AbortController so we can cancel the in-flight request on unmount.
    const controller = new AbortController();
    abortRef.current = controller;

    // Common request options:
    //   signal          — abort on unmount
    //   skipIfPending   — apiClient8031 will reject (with isSkipped sentinel) if
    //                      a previous call to the same URL is still pending
    //   (timeout & latency logging are handled centrally in apiClient8031)
    const reqOpts = { signal: controller.signal, skipIfPending: true };

    try {
      if (import.meta.env.VITE_MODE === "dev") {
        // const response8031API = await fetch(
        //   `/api/7284/ss/SocketServer/${macaddress}`,
        //   {
        //     method: "GET",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //   }
        // );

        // const data = await response8031API.json();
        const response8031API = await api.get(
          `/api/7284/ss/SocketServer/${macaddress}`,
          { signal: controller.signal },
        );

        const data = response8031API.data;
        //console.log("Rawdata:", data);
        // //console.log("RawData:", data);
        setRawdatum(data.IMAGE);
        // //console.log("Rawdatum:", data.IMAGE);
        setPosition(data.POS);
        ////console.log("Position:", data.POS);
        setDuration(formatSecondsToDHMS(data.HOLD));
        ////console.log("Duration:", formatSecondsToDHMS(data.HOLD));
        setWidth(data.WIDTH);
        setHeight(data.HEIGHT);
        setIsUMAP(data.HEIGHT * data.WIDTH >= 1575);
        setRespirationValue(data.RR.value);
        setRespirationStatus(data.RR.status);
        setHeartValue(data.HR.value);

        setRespirationHistoryArray((prev) => {
          const next = [...prev, data.RR.value];
          return next.length > respirationArrayLimit
            ? next.slice(-respirationArrayLimit)
            : next;
        });

        // setRiskRegionArray(data.RecordDatumJlog.RiskRegions);
        setRiskRegionArray(data.RecordDatumJlog.RiskRegions.filter((region)=>region.risk_level !== 0));

        // setRiskRegionArray(temp);
        console.log("risk regions: ", data.RecordDatumJlog.RiskRegions);
      } else {
        // const response8031API = await fetch(`/api/8031/rawdata/${macaddress}`, {
        //   method: "GET",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        // });

        // const data = await response8031API.json();
        const response8031API = await api8031.get(
          `/api/8031/rawdata/${macaddress}`,
          reqOpts,
        );

        const data = response8031API.data;
        //console.log("Rawdata:", data);
        // //console.log("RawData:", data);
        setRawdatum(data.IMAGE);
        // //console.log("Rawdatum:", data.IMAGE);
        setPosition(data.POS);
        ////console.log("Position:", data.POS);
        setDuration(formatSecondsToDHMS(data.HOLD));
        ////console.log("Duration:", formatSecondsToDHMS(data.HOLD));
        setWidth(data.WIDTH);
        setHeight(data.HEIGHT);
        setIsUMAP(data.HEIGHT * data.WIDTH >= 1575);

        setRespirationValue(data.RR.Value);
        setRespirationStatus(data.RR.Status);
        setHeartValue(data.HR.Value);

        setRespirationHistoryArray((prev) => {
          const next = [...prev, data.RR.Value];
          return next.length > respirationArrayLimit
            ? next.slice(-respirationArrayLimit)
            : next;
        });
        // setRiskRegionArray(temp);
        // setRiskRegionArray(data.RecordDatumJlog.risk_regions);
        setRiskRegionArray(data.RecordDatumJlog.risk_regions.filter((region)=>region.risk_level !== 0));
      }
    } catch (error) {
      // apiClient8031 already logs timing / timeout / cancel / generic errors
      // centrally. Here we only need to silently ignore the "skipped because
      // previous request still pending" sentinel so it doesn't pollute logs.
      if (!isSkipped(error)) {
        // (Optional) re-throw or handle UI fallback here. Default: no-op.
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  // useEffect(() => {
  //   const fetchBreathingHistoryData = async () => {
  //     const response = await fetch(`/api/7284/Breathing`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(requestBody_Breathing), // Convert the requestBody to JSON
  //     });
  //     const results = await response.json();
  //     //console.log("Breathing API: ", results);
  //     setRespirationHistoryArray(results.map((r) => r.br).reverse());
  //   };
  //   fetchBreathingHistoryData();
  // }, []);

  useEffect(() => {
    postData();
    intervalRef.current = setInterval(postData, POLL_INTERVAL_MS);
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      // Cancel any in-flight /rawdata request so it doesn't try to
      // setState after the component unmounts.
      abortRef.current?.abort();
    };
  }, []);

  {
    /* GET API Patient Information */
  }
  const [patient, setPatient] = useState([]);
  const [respirationMinBaselineX, setRespirationMinBaselineX] = useState(null);
  const [respirationMaxBaselineX, setRespirationMaxBaselineX] = useState(null);

  const fetchPatientProfile = async () => {
    try {
      // const response = await fetch(`/api/7284/db/Patient`, {
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
      const response = await api.get(`/api/7284/db/Patient`);
      const data = response.data;
      const matchingPatient = data.find((item) => item.deviceid === macaddress);
      setPatient(matchingPatient);
      //console.log("patient detail is ", matchingPatient);
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };
  const fetchAlertList = async (patientid) => {
    try {
      // const response = await fetch(`/api/7284/db/Alert/${patientid}`, {
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
      const response = await api.get(`/api/7284/db/Alert/${patientid}`);

      const data = response.data;
      if (data.code === -1) {
        //console.log(data.message);
        setRespirationMaxBaselineX(null);
        setRespirationMinBaselineX(null);
        return;
      }
      //console.log("Fetched data:", data);
      const binaryStr = (data.alertcontroller >>> 0)
        .toString(2)
        .padStart(32, "0"); // Convert to 32-bit binary
      if (binaryStr[29] === "1") {
        setRespirationMaxBaselineX(data.respiratoryratehighlimit);
        setRespirationMinBaselineX(data.respiratoryratelowlimit);
      } else {
        setRespirationMaxBaselineX(null);
        setRespirationMinBaselineX(null);
      }
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  useEffect(() => {
    if (patient && patient.patientid) {
      fetchAlertList(patient.patientid);
    }
  }, [patient]);

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

  return (
    <div className="monitor">
      <div className="pressure">
        <div className="title">{t("PatientMonitor.PressureMap")}</div>
        <div className="box" style={{ position: "relative", background: isUMAP ? "none" : "" }}>
          {width &&
            height &&
            (rawdatum ? (
              <>
                <OpenCVComponent
                  deviceid={macaddress}
                  rawdata={rawdatum}
                  width={width}
                  height={height}
                  riskRegions={riskRegionArray}
                />
                {/* risk region 的 idx 標號：只有 riskRegionArray 有資料時才出現。
                    placement="right"/"left" → 直向排，數字的 y 對齊圓心 y
                    placement="top"/"bottom" → 橫向排，數字的 x 對齊圓心 x */}
                {isUMAP && <RiskIndexBar
                  data={riskRegionArray}
                  width={width}
                  height={height}
                  placement="right"
                />}
                {/* {isUMAP && (
                  <RiskArea
                    data={riskRegionArray}
                    width={width}
                    height={height}
                  />
                )} */}
              </>
            ) : (
              <img
                className="disconnect"
                src="/src/assets/disconnect.png"
                alt=""
                style={{alignSelf:"center"}}
              ></img>
            ))}
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
      {isUMAP ? (
        <RiskRegion data={riskRegionArray} />
      ) : (
        <>
          <div className="respiration">
            <div className="title">{t("PatientMonitor.RespiratoryRate")}</div>
            {respirationStatus ? (
              <RespirationChart
                respirationArray={respirationHistoryArray}
                minBaselineX={respirationMinBaselineX}
                maxBaselineX={respirationMaxBaselineX}
              />
            ) : (
              <img src="/src/assets/patient-monitor-disconnected.png" alt="" />
            )}

            <div className="spec">
              <div>{respirationValue}</div>
              <div className="tag">/min</div>
            </div>
          </div>
          <div className="h-rate">
            <div className="title">{t("PatientMonitor.HeartRate")}</div>
            <img src="/src/assets/patient-monitor-disconnected.png" alt="" />
            <div className="spec">
              <div>--</div>
              <div className="tag">bpm</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PatientMonitor;
