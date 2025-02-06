import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/patient.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DisChargePatient from "./Modals/DisChargePatient";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "./LoadingOverlay";

function PatientProfile() {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const macaddress = searchParams.get("macaddress") || "";

  {
    /* SEX  */
  }
  const [isSexActive, setSexActive] = useState(false);
  const handleSexDropdown = () => {
    setSexActive((prev) => !prev);
  };
  const SEX = ["Female", "Male"];
  const [placeholderSex, setPlaceholderSex] = useState(SEX[0]); // Input placeholder
  const handleSexItemClick = (sex) => {
    setPlaceholderSex(sex);
    handleSexDropdown;
    setIsChanged(true);
  };
  {
    /* Handle Item Select */
  }
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSexActive(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const useDynamicDropdownHeight = (ref, isActive) => {
    useEffect(() => {
      if (ref.current) {
        if (isActive) {
          // Calculate the total height of items
          const items = ref.current.querySelectorAll(".item");
          const totalHeight = Array.from(items).reduce(
            (acc, item) => acc + item.offsetHeight,
            0
          );

          // Set the height dynamically
          ref.current.style.height = `${totalHeight}px`;
        } else {
          // Reset height when inactive
          ref.current.style.height = "0px";
        }
      }
    }, [ref, isActive]);
  };

  const dropdownSexStyleRef = useRef(null);

  useDynamicDropdownHeight(dropdownSexStyleRef, isSexActive);

  {
    /* Handle Calender Logic */
  }
  const [selectedDate, setSelectedDate] = useState(new Date());
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsChanged(date?.toISOString() !== selectedDate?.toISOString());
  };
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
  {
    /* GET PATIENT INFO API */
  }
  const patientIDInput = useSetInfoToInput("");
  const patientNameInput = useSetInfoToInput("");
  // const patientSexInput = useSetInfoToInput("");
  // const patientDOBInput = useSetInfoToInput("");
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
      setPlaceholderSex(
        matchingPatient.sex === "" || matchingPatient.sex === null
          ? ""
          : matchingPatient.sex === 0
          ? SEX[0]
          : SEX[1]
      );
      setSelectedDate(new Date(matchingPatient.birthday));
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
  {
    /* PUT API */
  }
  const requestBody = {
    patientname: patientNameInput.inputValue,
    sex: placeholderSex === SEX[0] ? 0 : 1,
    birthday: format(selectedDate, "yyyy-MM-dd"),
    height: parseInt(patientHeightInput.inputValue, 10),
    weight: parseInt(patientWeightInput.inputValue, 10),
    deviceid: macaddress,
  };

  const handlePut_API = (print_inputvalue) => {
    console.log("the input requestbody is ", print_inputvalue);
    PUT_PatientInfo(patientIDInput.inputValue, print_inputvalue);
  };

  const PUT_PatientInfo = async (patientid, requestBody) => {
    try {
      setLoading(true);
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
      if (data.code !== 0) {
        console.log("Patient fail to update:", data);
        alert("Patient fail to update!");
        setIsChanged(false);
      } else {
        console.log("Patient updated successfully:", data);
        alert("Update Successfully!");
        window.location.reload();
        setIsChanged(false);
      }
      return data; // Return the response data if needed
    } catch (error) {
      console.error("Error updating device:", error.message);
    } finally {
      setLoading(false);
    }
  };
  {
    /* Discharge Patient Button */
  }
  const [isDischargeOverlayVisible, setDischargeOverlayVisible] =
    useState(false);
  const handleDisChargeOverlay = () => {
    setDischargeOverlayVisible(!isDischargeOverlayVisible);
  };

  const handleDischargePatient = (patientid) => {
    patientid = patient.patientid;
    console.log("delete patient ", patientid);
    deletePatient_API(patientid);
  };

  const deletePatient_API = async (patientId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/7284/db/Patient/${patientId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("Content-Type");
      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error(`Expected JSON, got: ${contentType}`);
      }
      const data = await response.json();
      console.log("Delete successfully!:", data);
      alert("Delete successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pp">
      <h1  style={{zIndex:"1"}}>{t("PatientProfile.PatientProfile")}</h1>
      <div className="pfl">
        {/* Patient ID */}
        <div className="input g-c-6">
          <label htmlFor="p-id" className="label-container">
            <p>{t("PatientProfile.PatientID")}</p>
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
            <p>{t("PatientProfile.PatientName")}</p>
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
        <div
          className="input dropdown suffix g-c-3"
          onClick={handleSexDropdown}
          ref={dropdownRef}
        >
          <label htmlFor="sex" className="label-container">
            <p>{t("PatientProfile.Sex")}</p>
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
              placeholder={placeholderSex}
              readOnly
            />
          </div>
          <div
            className={`list ${isSexActive ? "active" : ""}`}
            ref={dropdownSexStyleRef}
          >
            {SEX.map((a) => (
              <div
                className="item"
                key={a}
                onClick={() => handleSexItemClick(a)}
              >
                {a}
              </div>
            ))}
          </div>
        </div>
        {/* Birthday Date */}
        <div className="g-c-3">
          <label htmlFor="arrival" className="label-container">
            <p>{t("PatientProfile.Birthday")}</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="">
            <DatePicker
              dateFormat="yyyy/MM/dd"
              selected={selectedDate}
              onChange={handleDateSelect}
              peekNextMonth
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Height */}
        <div className="input g-c-3">
          <label htmlFor="height" className="label-container">
            <p>{t("PatientProfile.Height")}</p>
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
            <p>{t("PatientProfile.Weight")}</p>
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
            <p>{t("PatientProfile.Bed")}</p>
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
            <p>{t("PatientProfile.Section")}</p>
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
            <p>{t("PatientProfile.Floor")}</p>
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
            <p>{t("PatientProfile.DeviceID")}</p>
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
              value={macaddress}
              readOnly
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Connection Status */}
        <div className="input g-c-3 suffix">
          <label htmlFor="connection" className="label-container">
            <p>{t("PatientProfile.DeviceStatus")}</p>
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
              readOnly
            />
            <img className="suffix active" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">click to reconnect</div>
        </div>
      </div>
      <div className="btn-gp">
        <SimpleBackdrop open={loading} />
        <div
          className={`btn text-only ${isChanged ? "" : "inactive"}`}
          onClick={() => {
            if (isChanged) {
              handlePut_API(requestBody);
            }
          }}
          style={{ cursor: isChanged ? "pointer" : "default" }}
        >
          <img src="" alt="" className="prefix" />
          <p className="btn-text">{t("PatientProfile.Save")}</p>
        </div>
        <div
          className="btn text-only outline"
          id="discharge"
          onClick={handleDisChargeOverlay}
        >
          <img src="" alt="" className="prefix" />
          <p className="btn-text">{t("PatientProfile.Discharge")}</p>
          {isDischargeOverlayVisible && (
            <DisChargePatient
              callback={handleDisChargeOverlay}
              dischargebtn_click={handleDischargePatient}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
