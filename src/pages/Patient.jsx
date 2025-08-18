import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import dayjs from "dayjs";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/panel-list.css";
import AlertList from "/src/components/AlertList.jsx";
import Navbar from "../components/Navbar";
import FloorSectionBar from "../components/FloorSectionBar";
import AddNewPatient from "../components/Modals/AddNewPatient";
import { useTranslation } from "react-i18next";

function Patient() {
  const { t, i18n } = useTranslation();

  const [select_floor, setSelect_Floor] = useState("");
  const handleSelectFloor = (floor) => {
    setSelect_Floor(floor);
  };
  const [select_section, setSelect_Section] = useState("");
  const handleSelectSection = (section) => {
    setSelect_Section(section);
  };

  const [patients, setPatients] = useState([]);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/7284/db/Patient");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setPatients(data);
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  useEffect(() => {
    fetchPatients();
    const interval = setInterval(fetchPatients, 1000);
    return () => clearInterval(interval);
  }, []);

  {
    /* sort logic */
  }
  const sortTypes = [
    "patientId",
    "patientName",
    "sex",
    "bed",
    "section",
    "floor",
    "deviceId",
    "status",
  ];

  const [sortType, setSortType] = useState(sortTypes[0]);
  const [sortDirection, setSortDirection] = useState(true);
  function SortType(sortTypeIndex) {
    if (sortTypes[sortTypeIndex] !== sortType) setSortDirection(true);
    setSortType(sortTypes[sortTypeIndex]);
    if (sortTypes[sortTypeIndex] === sortType)
      setSortDirection((prev) => !prev);
  }

  const filteredDevices = patients
    .slice()
    .filter((patient) => {
      return (
        select_floor === "" ||
        select_floor === "All" ||
        patient.floor === select_floor
      );
    })
    .filter((patient) => {
      return (
        select_section === "" ||
        select_section === "All" ||
        patient.section === select_section
      );
    })
    .sort((a, b) => {
      // const p_idA = a.patientid?.toUpperCase() || "";
      // const p_idB = b.patientid?.toUpperCase() || "";
      // // Sort alphabetically first
      // if (p_idA < p_idB) return -1;
      // if (p_idA > p_idB) return 1;
      // // If alphabetical order is the same, sort numerically
      // const numA = parseInt(a.patientid?.replace(/[^0-9]/g, "") || "0", 10);
      // const numB = parseInt(b.patientid?.replace(/[^0-9]/g, "") || "0", 10);
      // return numA - numB; // Numeric ascending order
      const valA = (val) => val ?? "";
      switch (sortType) {
        case sortTypes[0]: // patient id
          console.log("sortType: ", sortType);
          if (sortDirection) {
            return valA(a.patientid).localeCompare(
              valA(b.patientid),
              undefined,
              { numeric: true }
            );
          } else {
            return valA(b.patientid).localeCompare(
              valA(a.patientid),
              undefined,
              { numeric: true }
            );
          }
        case sortTypes[1]: //patient name
          console.log("sortType: ", sortType);
          if (sortDirection) {
            return valA(a.patientname).localeCompare(
              valA(b.patientname),
              undefined,
              { numeric: true }
            );
          } else {
            return valA(b.patientname).localeCompare(
              valA(a.patientname),
              undefined,
              { numeric: true }
            );
          }
        case sortTypes[2]: // sex
          console.log("sortType: ", sortType);
          if (sortDirection) {
            return String(b.sex).localeCompare(String(a.sex));
          } else {
            return String(a.sex).localeCompare(String(b.sex));
          }
        case sortTypes[3]: // bed
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
        case sortTypes[4]: // section
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
        case sortTypes[5]: // floor
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
        case sortTypes[6]: // device id
          console.log("sortType: ", sortType);
          if (sortDirection) {
            return valA(a.deviceid).localeCompare(valA(b.deviceid), undefined, {
              numeric: true,
            });
          } else {
            return valA(b.deviceid).localeCompare(valA(a.deviceid), undefined, {
              numeric: true,
            });
          }
        case sortTypes[7]: // status
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

  const handleAddPatientClick = (e) => {
    e.preventDefault();
    setOverlayVisible(!isOverlayVisible);
  };

  return (
    <>
      <Navbar />
      <div className="wrap">
        <AlertList />
        <div className="main">
          <div className="box">
            <h1>{t("PatientList.PatientList")}</h1>
          </div>
          <div className="container">
            <div className="top-bar">
              <FloorSectionBar
                selectFloor={handleSelectFloor}
                selectSection={handleSelectSection}
                enableDeviceType={false}
              />
              {/* <div
                className="btn"
                id="addPatient"
                onClick={handleAddPatientClick}
              >
                <img src="" alt="" className="prefix" />
                <p className="btn-text">New Patient</p>
                {isOverlayVisible && (
                  <AddNewPatient callback={handleAddPatientClick} />
                )}
              </div> */}
            </div>
            {/* Patient List Main body */}
            <div className="pl">
              {/* Patient List Title */}
              <div className="head">
                <h3
                  className={`fg2 ${
                    sortType === sortTypes[0] ? "selected" : ""
                  }`}
                  onClick={() => SortType(0)}
                >
                  {t("PatientList.PatientID")}{" "}
                  {sortType === sortTypes[0] &&
                    (sortDirection ? "\u25BC" : "\u25B2")}
                </h3>
                <h3
                  className={`fg2 ${
                    sortType === sortTypes[1] ? "selected" : ""
                  }`}
                  onClick={() => SortType(1)}
                >
                  {t("PatientList.PatientName")}{" "}
                  {sortType === sortTypes[1] &&
                    (sortDirection ? "\u25BC" : "\u25B2")}
                </h3>
                <h3
                  className={`fg1 ${
                    sortType === sortTypes[2] ? "selected" : ""
                  }`}
                  onClick={() => SortType(2)}
                >
                  {t("PatientList.Sex")}{" "}
                  {sortType === sortTypes[2] &&
                    (sortDirection ? "\u25BC" : "\u25B2")}
                </h3>
                {/* <h3 className="fg2">Birthday</h3>
              <h3 className="fg1">Height</h3>
              <h3 className="fg1">Weight</h3> */}
                <h3
                  className={`fg1 ${
                    sortType === sortTypes[3] ? "selected" : ""
                  }`}
                  onClick={() => SortType(3)}
                >
                  {t("PatientList.Bed")}{" "}
                  {sortType === sortTypes[3] &&
                    (sortDirection ? "\u25BC" : "\u25B2")}
                </h3>
                <h3
                  className={`fg1 ${
                    sortType === sortTypes[4] ? "selected" : ""
                  }`}
                  onClick={() => SortType(4)}
                >
                  {t("PatientList.Section")}{" "}
                  {sortType === sortTypes[4] &&
                    (sortDirection ? "\u25BC" : "\u25B2")}
                </h3>
                <h3
                  className={`fg1 ${
                    sortType === sortTypes[5] ? "selected" : ""
                  }`}
                  onClick={() => SortType(5)}
                >
                  {t("PatientList.Floor")}{" "}
                  {sortType === sortTypes[5] &&
                    (sortDirection ? "\u25BC" : "\u25B2")}
                </h3>
                <h3
                  className={`fg2 ${
                    sortType === sortTypes[6] ? "selected" : ""
                  }`}
                  onClick={() => SortType(6)}
                >
                  {t("PatientList.DeviceID")}{" "}
                  {sortType === sortTypes[6] &&
                    (sortDirection ? "\u25BC" : "\u25B2")}
                </h3>
                <div className="connection fg2" onClick={() => SortType(7)}>
                  <h3
                    className={`${sortType === sortTypes[7] ? "selected" : ""}`}
                  >
                    {t("PatientList.DeviceStatus")}
                    {`(${connectedDevicesCount})`}{" "}
                    {sortType === sortTypes[7] &&
                      (sortDirection ? "\u25BC" : "\u25B2")}
                  </h3>
                </div>
              </div>
              {/* Patient List */}
              <div className="item-list">
                {filteredDevices.map((patient) => (
                  <Link
                    to={`/patient/patient-detail/patient-monitor?macaddress=${patient.deviceid}`}
                    key={patient.deviceid}
                    state={{ from: "/patient" }}
                  >
                    <a className="item">
                      <h3 className="fg2">{patient.patientid || "N/A"}</h3>
                      <h3 className="fg2">{patient.patientname || "N/A"}</h3>
                      <h3 className="fg1">
                        {patient.sex === 0 ? "Female" : "Male"}
                      </h3>
                      {/* <h3 className="fg2">{dayjs(patient.birthday).format("YYYY-MM-DD") || "N/A"}</h3>
            <h3 className="fg1">{patient.height || "N/A"}</h3>
            <h3 className="fg1">{patient.weight || "N/A"}</h3> */}
                      <h3 className="fg1">{patient.bed || "N/A"}</h3>
                      <h3 className="fg1">
                        {patient.section === "" ? "N/A" : patient.section}
                      </h3>
                      <h3 className="fg1">
                        {patient.floor === "" ? "N/A" : patient.floor}
                      </h3>
                      <h3 className="fg2">{patient.deviceid || "N/A"}</h3>
                      <div
                        className={`connection ${
                          patient.devicestatus ? "connected" : "disconnected"
                        } fg2`}
                      >
                        <img src="" alt="" />
                        <h3>
                          {patient.devicestatus ? "Connected" : "Disconnected"}
                        </h3>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Patient;
