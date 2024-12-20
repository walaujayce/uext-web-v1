import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/patient.css";

function PatientProfile() {
  const [searchParams] = useSearchParams();
  const macaddress = searchParams.get("macaddress") || "";

  const [patient, setPatient] = useState([]);
  const fetchPatientProfile = async () => {
    try {
      const response = await fetch(`/api/7284/db/Patient`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("Content-Type");
      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error(`Expected JSON, got: ${contentType}`);
      }

      const data = await response.json();
      const matchingPatient = data.find(
        (item) => item.deviceid === macaddress
      ) || {
        patientname: "",
        patientid: "",
        sex: "",
        birthday: "",
        height: "",
        weight: "",
        bed: "",
        section: "",
        floor: "",
        deviceid: "",
        devicestatus: "",
      };

      setPatient(matchingPatient);
      console.log("patient detail is ", matchingPatient);
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };
  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const formatDOB = (birthday) => {
    if (!birthday) {
      return "";
    }
    return birthday.split("T")[0];
  };

  return (
    <div className="pp">
      <h1>Patient Profile</h1>
      <div className="pfl">
        {/* Patient ID */}
        <div className="input g-c-6">
          <label for="p-id" className="label-container">
            <p>Patient ID</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="input-gp">
            <input
              type="text"
              className="placeholder"
              id="p-id"
              name="p-id"
              placeholder={patient.patientid || ""}
              required
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Patient Name */}
        <div className="input g-c-6">
          <label for="name" className="label-container">
            <p>Name</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="input-gp">
            <input
              type="text"
              className="placeholder"
              id="name"
              name="name"
              placeholder={patient.patientname || ""}
              required
              autoComplete="off"
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>

        {/* Sex */}
        <div className="input g-c-3">
          <label for="sex" className="label-container">
            <p>Sex</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="input-gp">
            <input
              type="text"
              className="placeholder"
              id="sex"
              name="sex"
              placeholder={patient.sex === 1 ? "Male" : "Female"}
              required
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Birthday Date */}
        <div className="input g-c-3">
          <label for="arrival" className="label-container">
            <p>Birthday</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="input-gp">
            <input
              type="text"
              className="placeholder"
              id="arrival"
              name="arrival"
              placeholder={formatDOB(patient.birthday)}
              required
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Height */}
        <div className="input g-c-3">
          <label for="height" className="label-container">
            <p>Height</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="input-gp">
            <input
              type="text"
              className="placeholder"
              id="height"
              name="height"
              placeholder={patient.height ? patient.height + "cm" : ""}
              required
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Weight */}
        <div className="input g-c-3">
          <label for="weight" className="label-container">
            <p>Weight</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="input-gp">
            <input
              type="text"
              className="placeholder"
              id="weight"
              name="weight"
              placeholder={patient.weight ? patient.weight + "kg" : ""}
              required
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Bed */}
        <div className="input g-c-2">
          <label for="p-id" className="label-container">
            <p>Bed</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="input-gp">
            <input
              type="text"
              className="placeholder"
              id="p-id-bed"
              name="p-id"
              placeholder={patient.bed || ""}
              required
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Section */}
        <div className="input g-c-2">
          <label for="section" className="label-container">
            <p>Section</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="input-gp">
            <input
              type="text"
              className="placeholder"
              id="section"
              name="section"
              placeholder={patient.section || ""}
              required
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Floor */}
        <div className="input g-c-2">
          <label for="floor" className="label-container">
            <p>Floor</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="input-gp">
            <input
              type="text"
              className="placeholder"
              id="floor"
              name="floor"
              placeholder={patient.floor || ""}
              required
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Device ID */}
        <div className="input g-c-3">
          <label for="d-id" className="label-container">
            <p>Device ID</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="input-gp">
            <input
              type="text"
              className="placeholder"
              id="d-id"
              name="d-id"
              placeholder={macaddress}
              required
              readonly
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Connection Status */}
        <div className="input g-c-3 suffix">
          <label for="connection" className="label-container">
            <p>Connection Status</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="input-gp">
            <input
              type="text"
              className="placeholder"
              id="connection"
              name="connection"
              value={patient.devicestatus === 1 ? "Connected" : "Disconnect"}
              readonly
            />
            <img className="suffix active" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">click to reconnect</div>
        </div>
      </div>
      <div className="btn-gp">
        <div className="btn text-only inactive">
          <img src="" alt="" className="prefix" />
          <p className="btn-text">Save</p>
        </div>
        <div className="btn text-only outline" id="discharge">
          <img src="" alt="" className="prefix" />
          <p className="btn-text">Discharge</p>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
