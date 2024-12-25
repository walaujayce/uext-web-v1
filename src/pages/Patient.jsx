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

function Patient() {
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
            <h1>Patient List</h1>
          </div>
          <div className="container">
            <div className="top-bar">
              <FloorSectionBar
                selectFloor={handleSelectFloor}
                selectSection={handleSelectSection}
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
                <h3 className="fg2">Patient ID</h3>
                <h3 className="fg2">Patient Name</h3>
                <h3 className="fg1">Sex</h3>
                {/* <h3 className="fg2">Birthday</h3>
              <h3 className="fg1">Height</h3>
              <h3 className="fg1">Weight</h3> */}
                <h3 className="fg1">Bed</h3>
                <h3 className="fg1">Section</h3>
                <h3 className="fg1">Floor</h3>
                <h3 className="fg2">Device ID</h3>
                <div className="connection fg2">
                  <img src="" alt="" />
                  <h3>Device Status</h3>
                </div>
              </div>
              {/* Patient List */}
              <div className="item-list">
                {patients
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
                    const p_idA = a.patientid?.toUpperCase() || "";
                    const p_idB = b.patientid?.toUpperCase() || "";
                    // Sort alphabetically first
                    if (p_idA < p_idB) return -1;
                    if (p_idA > p_idB) return 1;
                    // If alphabetical order is the same, sort numerically
                    const numA = parseInt(
                      a.patientid?.replace(/[^0-9]/g, "") || "0",
                      10
                    );
                    const numB = parseInt(
                      b.patientid?.replace(/[^0-9]/g, "") || "0",
                      10
                    );

                    return numA - numB; // Numeric ascending order
                  })
                  .map((patient) => (
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
