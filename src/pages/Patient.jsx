import React,{useState, useEffect} from "react";
import { Outlet, Link } from "react-router-dom";
import dayjs from "dayjs";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/panel-list.css";
import Alert from "/src/components/Alert.jsx";
import Navbar from "../components/Navbar";
import FloorSectionBar from "../components/FloorSectionBar";

function Patient() {

  const [patients, setPatients] = useState([]);

  const fetchPatients = async () => {
    try {
      const response = await fetch('api/7284/db/Patient');
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

  return (
    <>
    <Navbar/>
    <div className="wrap">
      <Alert />
      <div className="main">
        <div className="box">
          <h1>Patient List</h1>
        </div>
        <div className="container">
          <div className="top-bar">
            <FloorSectionBar/>
            <div className="btn" id="addPatient">
              <img src="" alt="" className="prefix" />
              <p className="btn-text">New Patient</p>
            </div>
          </div>
          {/* Patient List Main body */}
          <div className="pl">
            {/* Patient List Title */}
            <div className="head">
              <h3 className="fg2">Patient ID</h3>
              <h3 className="fg2">Patient Name</h3>
              <h3 className="fg1">Sex</h3>
              <h3 className="fg2">Birthday</h3>
              <h3 className="fg1">Height</h3>
              <h3 className="fg1">Weight</h3>
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
              <Link to="/patient/patient-detail">
                <a href="" className="item">
                  <h3 className="fg2">F000003078</h3>
                  <h3 className="fg2">Chan</h3>
                  <h3 className="fg1">Male</h3>
                  <h3 className="fg2">2024-11-26</h3>
                  <h3 className="fg1">190</h3>
                  <h3 className="fg1">90</h3>
                  <h3 className="fg1">1004</h3>
                  <h3 className="fg1">Zone A</h3>
                  <h3 className="fg1">7F</h3>
                  <h3 className="fg2">RRD42687891</h3>
                  <div className="connection connected fg2">
                    <img src="" alt="" />
                    <h3>Connected</h3>
                  </div>
                </a>
              </Link>
              {patients.map((patient) => (
        <Link to={`/patient/${patient.patientid}`} key={patient.patientid}>
          <a className="item">
            <h3 className="fg2">{patient.patientid || "N/A"}</h3>
            <h3 className="fg2">{patient.patientname || "N/A"}</h3>
            <h3 className="fg1">{patient.sex === 0 ? "Female" : "Male"}</h3>
            <h3 className="fg2">{dayjs(patient.birthday).format("YYYY-MM-DD") || "N/A"}</h3>
            <h3 className="fg1">{patient.height || "N/A"}</h3>
            <h3 className="fg1">{patient.weight || "N/A"}</h3>
            <h3 className="fg1">{patient.bed || "N/A"}</h3>
            <h3 className="fg1">{patient.section===""? "N/A" : "Zone " + patient.section}</h3>
            <h3 className="fg1">{patient.floor===""? "N/A" : patient.floor + "F"}</h3>
            <h3 className="fg2">{patient.id || "N/A"}</h3>
            <div
              className={`connection ${
                patient.devicestatus ? "connected" : "disconnected"
              } fg2`}
            >
              <img src="" alt="" />
              <h3>{patient.devicestatus ? "Connected" : "Disconnected"}</h3>
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