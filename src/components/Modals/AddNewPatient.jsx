import React, { useState, useRef, useEffect } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const AddNewPatient = ({ mac, callback }) => {
  {
    /* Handle Overlay Logic */
  }
  const handleOverlayClick = (e) => {
    // Close the modal when clicking outside the modal window
    callback(e);
  };

  const handleWindowClick = (e) => {
    // Prevent event propagation to the overlay
    e.stopPropagation();
  };

  {
    /* Handle Stage 1 Btn Logic */
  }
  const [isActive_Stage2, setActive_Stage2] = useState(false);

  const handleConfirm_S1_Click = (e) => {
    e.preventDefault();
    if (!patientid) {
      patientIdError.setErrorActive(true);
      return;
    }
    if (!patientname) {
      patientnameError.setErrorActive(true);
      return;
    }
    if (!height) {
      patientHeightError.setErrorActive(true);
      return;
    }
    if (!weight) {
      patientWeightError.setErrorActive(true);
      return;
    }
    if (!selectedDate || selectedDate === "") {
      patientDOBError.setErrorActive(true);
      return;
    }
    handleSubmit();
  };

  {
    /* Handle Sex Dropdown Menu */
  }
  const [isSexActive, setSexActive] = useState(false);
  const handleSexDropdown = () => {
    setSexActive((prev) => !prev);
  };
  {
    /* Handle Sex Placeholder */
  }
  const sexes = ["Female", "Male"];
  const [placeholderSex, setPlaceholderSex] = useState(sexes[0]); // Input placeholder

  const handleSexItemClick = (sex) => {
    setPlaceholderSex(sex);
    handleSexDropdown;
    setSex_POST(sex === sexes[0] ? 0 : 1);
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
  {
    /* handle submit logic */
  }
  const [patientname, setPatientName_POST] = useState("");
  const [patientid, setPatientId_POST] = useState("");
  const [height, setHeight_POST] = useState("");
  const [weight, setWeight_POST] = useState("");
  const [sex, setSex_POST] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");

  const handleSubmit = async () => {
    const requestBody = {
      patientname,
      patientid,
      sex,
      birthday: format(selectedDate, "yyyy-MM-dd"),
      height: parseInt(height, 10),
      weight: parseInt(weight, 10),
      deviceid: mac,
    };
    try {
      const response = await fetch("/api/7284/db/Patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 200) {
        setActive_Stage2(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Error while submitting data:", error);
      alert("Error: Unable to connect to the server.");
    }
  };

  {
    /* HANDLE INPUT BOX ERROR LOGIC */
  }

  function useErrorState(bool) {
    const [isErrorActive, setErrorActive] = useState(bool);

    return {
      isErrorActive,
      setErrorActive,
    };
  }

  const patientnameError = useErrorState(false);
  const patientIdError = useErrorState(false);
  const patientHeightError = useErrorState(false);
  const patientWeightError = useErrorState(false);
  const patientDOBError = useErrorState(false);
  

  return (
    <>
      <div
        className="addPatient"
        style={{ display: "block" }}
        onClick={handleWindowClick}
      >
        <div
          className="window"
          style={{ justifyContent: isActive_Stage2 ? "center" : "flex" }}
        >
          <a onClick={(e) => callback(e)}>
            <img
              src="/src/assets/close.svg"
              alt="close icon"
              className="close"
            />
          </a>
          <img
            src={`${isActive_Stage2 ? "/src/assets/check-active.svg" : ""}`}
            alt=""
            className="icon"
            style={{ display: isActive_Stage2 ? "block" : "none" }}
          />
          <div className="title">{`${
            isActive_Stage2 ? "New Patient Added" : "Add Patient"
          }`}</div>
          <div
            className="tab-list"
            style={{ display: isActive_Stage2 ? "none" : "" }}
          >
            <a href="#" className="tab active tab-1">
              Patient Profile
            </a>
            {/* <a href="#" className="tab tab-2">
              Bed Location
            </a> */}
          </div>
          {/* Stage 1 */}
          <form action="POST">
            <div
              className="grid st1"
              style={{ display: isActive_Stage2 ? "none" : "grid" }}
            >
              {/* ID */}
              <div className="input g-c-3">
                <label htmlFor="id" className="label-container">
                  <p>ID</p>
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
                    id="id"
                    name="id"
                    placeholder="Enter here"
                    value={patientid}
                    onChange={(e) => setPatientId_POST(e.target.value)}

                    required
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className={`assistive-text ${patientIdError.isErrorActive ? "active": ""}`}>
                  Information Required!
                </div>
              </div>
              {/* Name */}
              <div className="input g-c-3">
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
                    placeholder="Enter here"
                    value={patientname}
                    onChange={(e) => setPatientName_POST(e.target.value)}
                    required
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className={`assistive-text ${patientnameError.isErrorActive ? "active": ""}`}>Information Required!</div>
              </div>
              {/* Height */}
              <div className="input g-c-3">
                <label htmlFor="height" className="label-container">
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
                    placeholder="Enter here"
                    value={height}
                    onChange={(e) => setHeight_POST(e.target.value)}
                    required
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className={`assistive-text ${patientHeightError.isErrorActive ? "active": ""}`}>Information Required!</div>
              </div>
              {/* Weight */}
              <div className="input g-c-3">
                <label htmlFor="weight" className="label-container">
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
                    placeholder="Enter here"
                    value={weight}
                    onChange={(e) => setWeight_POST(e.target.value)}
                    required
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className={`assistive-text ${patientWeightError.isErrorActive ? "active": ""}`}>Information Required!</div>
              </div>
              {/* Sex */}
              <div
                className="input dropdown suffix g-c-3"
                onClick={handleSexDropdown}
                ref={dropdownRef}
              >
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
                    placeholder={placeholderSex}
                    readOnly
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  Oops! Something went wrong.
                </div>
                <div className={`list ${isSexActive ? "active" : ""}`}>
                  {sexes.map((a) => (
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
              {/* DOB */}
              <div className="input g-c-3">
                <label htmlFor="dob" className="label-container">
                  <p>Date of Birth</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    placeholderText="Select a date"
                    dateFormat="yyyy-MM-dd"
                    className="date-picker-input" // Optional custom styles
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className={`assistive-text ${patientDOBError.isErrorActive ? "active": ""}`}>Information Required!</div>
              </div>
            </div>
            <div
              className="btn-gp st1"
              style={{ display: isActive_Stage2 ? "none" : "" }}
            >
              <div
                className="btn text-only pri"
                onClick={handleConfirm_S1_Click}
              >
                <img src="" alt="" className="prefix" />
                <p className="btn-text pri-text">Continue</p>
              </div>
              <div className="btn text-only outline sec" onClick={(e) => callback(e)}>
                <img src="" alt="" className="prefix" />
                <p className="btn-text sec-text">Cancel</p>
              </div>
            </div>
          </form>
          {/* Stage 2 */}
          <form action="">
            <div className="grid st2">
              {/* Building */}
              <div className="input dropdown building suffix g-c-3">
                <label htmlFor="building" className="label-container">
                  <p>Building</p>
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
                    id="building"
                    placeholder="Please Select"
                    readOnly
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">Building 1</div>
                  <div className="item opt2">Building 2</div>
                  <div className="item opt3">Building 3</div>
                  <div className="item opt4">Building 4</div>
                  <div className="item opt5">Building 5</div>
                </div>
              </div>
              {/* Floor */}
              <div className="input dropdown floor suffix g-c-3">
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
                    placeholder="Please Select"
                    readOnly
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">1F</div>
                  <div className="item opt2">2F</div>
                  <div className="item opt3">3F</div>
                  <div className="item opt4">4F</div>
                  <div className="item opt5">5F</div>
                  <div className="item opt6">6F</div>
                  <div className="item opt7">7F</div>
                </div>
              </div>
              {/* Section */}
              <div className="input dropdown section suffix g-c-3">
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
                    placeholder="Please Select"
                    readOnly
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">Zone A</div>
                  <div className="item opt2">Zone B</div>
                  <div className="item opt3">Zone C</div>
                  <div className="item opt4">Zone D</div>
                </div>
              </div>
              {/* Bed */}
              <div className="input g-c-3">
                <label htmlFor="bed" className="label-container">
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
                    id="bed"
                    placeholder="Enter here"
                    required
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  Oops! Something went wrong.
                </div>
              </div>
            </div>
            <div className="btn-gp st2">
              <div className="btn text-only pri">
                <img src="" alt="" className="prefix" />
                <p className="btn-text pri-text">Continue</p>
              </div>
              <div className="btn text-only outline sec">
                <img src="" alt="" className="prefix" />
                <p className="btn-text sec-text">Back</p>
              </div>
            </div>
          </form>
          {/* Stage 3 */}
          <div
            className="btn-gp st3"
            style={{ display: isActive_Stage2 ? "flex" : "none" }}
          >
            <div className="btn text-only pri" onClick={(e) => callback(e)}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">Okay</p>
            </div>
            {/* <div className="btn text-only outline sec" >
              <img src="" alt="" className="prefix" />
              <p className="btn-text sec-text">Link a device</p>
            </div> */}
          </div>
          {/* Stage 4 */}
          <form action="">
            <div className="grid st4-1">
              <div className="input dropdown device suffix g-c-6">
                <label htmlFor="building" className="label-container">
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
                    id="device"
                    placeholder="Please Select"
                    readOnly
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">ADPS-003078-S</div>
                  <div className="item opt2">ADPS-003079-S</div>
                  <div className="item opt3">ADPS-003080-S</div>
                  <div className="item opt4">ADPS-003081-S</div>
                  <div className="item opt5">ADPS-003082-S</div>
                </div>
              </div>
            </div>
            <div className="btn-gp st4-1">
              <div className="btn text-only pri">
                <img src="" alt="" className="prefix" />
                <p className="btn-text pri-text">Confirm</p>
              </div>
              <div className="btn text-only outline sec">
                <img src="" alt="" className="prefix" />
                <p className="btn-text sec-text">Link with new device</p>
              </div>
            </div>
            <div className="grid st4-2">
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
                    placeholder="Please Enter"
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
              <div className="input g-c-3">
                <label htmlFor="mac" className="label-container">
                  <p>MAC</p>
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
                    id="mac"
                    placeholder="Please Enter"
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
              <div className="input g-c-3">
                <label htmlFor="d-ip" className="label-container">
                  <p>Device IP</p>
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
                    id="d-ip"
                    placeholder="Please Enter"
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
            </div>
            <div className="btn-gp st4-2">
              <div className="btn text-only pri">
                <img src="" alt="" className="prefix" />
                <p className="btn-text pri-text">Confirm</p>
              </div>
              <div className="btn text-only outline sec">
                <img src="" alt="" className="prefix" />
                <p className="btn-text sec-text">Link with registered device</p>
              </div>
            </div>
          </form>
          {/* Stage 5 */}
          <div className="connecting">
            <img src="/src/assets/connecting.gif" alt="connecting" />
            <p>Connecting...</p>
          </div>
          {/* Stage 6 */}
          <div className="btn-gp st6">
            <a href="patient-list.html" className="btn text-only pri">
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">Okay</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewPatient;
