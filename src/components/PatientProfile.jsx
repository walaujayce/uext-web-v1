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

  const SEX = ["Female","Male"];
  /// useSetInfoToInput Function ///
  const [isChanged, setIsChanged] = useState(false); // Track changes to enable SAVE button

  function useSetInfoToInput(initialPlaceHolder) {
    const [inputValue, setInputValue] = useState(initialPlaceHolder);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
      setIsChanged(e.target.value !== initialPlaceHolder); 
    };

    return {
      inputValue,
      handleInputChange,
      setInputValue,
    };
  }
  {/* GET PATIENT INFO API */}
  const patientIDInput = useSetInfoToInput("");
  const patientNameInput = useSetInfoToInput("");
  const patientSexInput = useSetInfoToInput("");
  const patientDOBInput = useSetInfoToInput("");
  const patientHeightInput = useSetInfoToInput("");
  const patientWeightInput = useSetInfoToInput("");
  const patientBedInput = useSetInfoToInput("");
  const patientSectionInput = useSetInfoToInput("");
  const patientFloorInput = useSetInfoToInput("");

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

      patientIDInput.setInputValue(matchingPatient.patientid);
      patientNameInput.setInputValue(matchingPatient.patientname);
      patientSexInput.setInputValue(matchingPatient.sex === "" || matchingPatient.sex === null ? "" :(matchingPatient.sex === SEX[0] ? SEX[0] : SEX[1]));
      patientDOBInput.setInputValue(matchingPatient.birthday);
      patientHeightInput.setInputValue(matchingPatient.height);
      patientWeightInput.setInputValue(matchingPatient.weight);
      patientBedInput.setInputValue(matchingPatient.bed);
      patientSectionInput.setInputValue(matchingPatient.section);
      patientFloorInput.setInputValue(matchingPatient.floor);

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
  {/* PUT API */}
  const requestBody = {
    patientname: patientNameInput.inputValue,
    sex: parseInt(patientWeightInput.inputValue,10),
    birthday: patientDOBInput.inputValue,
    height: parseInt(patientHeightInput.inputValue,10),
    weight: parseInt(patientWeightInput.inputValue,10),
    deviceid: macaddress
  };

  const handlePut_API = (print_inputvalue) => {
    console.log("the input requestbody is ", print_inputvalue);
    PUT_PatientInfo(patientIDInput.inputValue, print_inputvalue);
  };

  const PUT_PatientInfo = async (patientid, requestBody) => {
    try {

      const response = await fetch(`/api/7284/db/Patient/${patientid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody), // Convert the requestBody to JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Device updated successfully:", data);
      alert("Update Successfully!");
      setIsChanged(false);
      return data; // Return the response data if needed
    } catch (error) {
      console.error("Error updating device:", error.message);
    }
  };
  return (
    <div className="pp">
      <h1>Patient Profile</h1>
      <div className="pfl">
        {/* Patient ID */}
        <div className="input g-c-6">
          <label htmlFor="p-id" className="label-container">
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
              placeholder={patientIDInput.inputValue}
              value={patientIDInput.inputValue}
              readOnly
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Patient Name */}
        <div className="input g-c-6">
          <label htmlFor="name" className="label-container">
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
              placeholder={patientNameInput.inputValue}
              value={patientNameInput.inputValue}
              onChange={patientNameInput.handleInputChange}
              required
              autoComplete="off"
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>

        {/* Sex */}
        <div className="input g-c-3">
          <label htmlFor="sex" className="label-container">
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
              placeholder={patientSexInput.inputValue}
              required
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Birthday Date */}
        <div className="input g-c-3">
          <label htmlFor="arrival" className="label-container">
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
              placeholder={formatDOB(patientDOBInput.inputValue)}
              required
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Height */}
        <div className="input g-c-3">
          <label htmlFor="height" className="label-container">
            <p>Height(cm)</p>
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
              placeholder={patientHeightInput.inputValue}
              value={patientHeightInput.inputValue}
              onChange={patientHeightInput.handleInputChange}
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Weight */}
        <div className="input g-c-3">
          <label htmlFor="weight" className="label-container">
            <p>Weight(kg)</p>
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
              placeholder={patientWeightInput.inputValue}
              value={patientWeightInput.inputValue}
              onChange={patientWeightInput.handleInputChange}
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Bed */}
        <div className="input g-c-2">
          <label htmlFor="p-id" className="label-container">
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
              placeholder={patientBedInput.inputValue}
              readOnly
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Section */}
        <div className="input g-c-2">
          <label htmlFor="section" className="label-container">
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
              placeholder={patientSectionInput.inputValue}
              readOnly
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Floor */}
        <div className="input g-c-2">
          <label htmlFor="floor" className="label-container">
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
              placeholder={patientFloorInput.inputValue}
              readOnly
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Device ID */}
        <div className="input g-c-3">
          <label htmlFor="d-id" className="label-container">
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
              value = {macaddress}
              readonly
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Connection Status */}
        <div className="input g-c-3 suffix">
          <label htmlFor="connection" className="label-container">
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
        <div className={`btn text-only ${isChanged ? "" : "inactive"}`} onClick={()=>{
          if(isChanged){
            handlePut_API(requestBody)
          }}}>
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
