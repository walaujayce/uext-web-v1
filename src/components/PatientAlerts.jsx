import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/patient.css";
import "/src/CSS/patient-custom.css";
import { useSearchParams } from "react-router-dom";
import useSessionStorageState from "../JS/PatientAlertSessionStorage";

function PatientAlerts() {
  const [searchParams] = useSearchParams();
  const macaddress = searchParams.get("macaddress") || "";

  const [currentState, setCurrentState] = useState([]);

  {
    /* GET API Patient Information */
  }
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
      const matchingPatient = data.find((item) => item.deviceid === macaddress);
      setPatient(matchingPatient);
      console.log("patient detail is ", matchingPatient);
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };

  {
    /* NOTIFICATION TIME RANGE ARRAY */
  }
  const NotificationTimeRange = [
    { id: 1, label: "00 - 24" },
    { id: 2, label: "00 - 08" },
    { id: 3, label: "08 - 16" },
    { id: 4, label: "16 - 24" },
    { id: 5, label: "Custom" },
  ];

  const PositionStatus = [
    { id: 1, label: "Resting on the bed" },
    { id: 2, label: "Sitting on the bed" },
    { id: 3, label: "Sitting on the bed edge" },
    { id: 4, label: "Leaving out bed" },
    { id: 5, label: "Unusual condition" },
    { id: 6, label: "Lying/Curled up on left side" },
    { id: 7, label: "Lying/Curled up on right side" },
  ];
  {
    /* HANDLE CHECK BOX */
  }
  // Notification
  const [selectedNotification, setSelectedNotification] = useState(null); // Track selected checkbox

  const [customStartTime, setCustomStartTime] = useState("");
  const handleAlertStartTimeChange = (e) => {
    setCustomStartTime(e.target.value);
  };

  const [customEndTime, setCustomEndTime] = useState("");
  const handleAlertEndTimeChange = (e) => {
    setCustomEndTime(e.target.value);
  };

  const handleNotificationCheckBox = (notification) => {
    setSelectedNotification((prev) =>
      prev === notification ? null : notification
    ); // Toggle the same option off, otherwise select
    setCustomStartTime("");
    setCustomEndTime("");
  };

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    switch (selectedNotification) {
      case 1:
        setStartTime(0);
        setEndTime(24);
        break;
      case 2:
        setStartTime(0);
        setEndTime(8);
        break;
      case 3:
        setStartTime(8);
        setEndTime(16);
        break;
      case 4:
        setStartTime(16);
        setEndTime(24);
        break;
    }
  }, [selectedNotification]);

  // Alert Repeat Time
  const [isARTChecked, setARTIsChecked] = useState(false);
  const handleARTCheckBox = () => {
    setARTIsChecked((prev) => !prev);
  };
  const [debounceInput, setDebounceInput] = useState("");
  const handleDebounceInputChange = (e) => {
    setDebounceInput(e.target.value);
  };
  // Exit Bed Rate
  const [isEBRChecked, setEBRIsChecked] = useState(false);
  const handleEBRCheckBox = () => {
    setEBRIsChecked((prev) => !prev);
  };
  // Position
  const [selectedNotifications2, setSelectedNotifications2] = useState([]); // Track selected checkboxes
  const [inputValues, setInputValues] = useState(
    PositionStatus.reduce((acc, option) => {
      acc[option.id] = ""; // Default value
      return acc;
    }, {})
  );

  const handleNotificationCheckBox2 = (notification) => {
    setSelectedNotifications2((prev) => {
      if (!Array.isArray(prev)) prev = []; // Ensure state is always an array
      return prev.includes(notification)
        ? prev.filter((item) => item !== notification) // Deselect if already selected
        : [...prev, notification]; // Add to selected if not already selected
    });
  };
  const handleInputChange = (id, value) => {
    setInputValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  // Respiraton and Heart Beat Rate
  const [isRnHBChecked1, setRnHBIsChecked1] = useState(false);
  const handleRnHBCheckBox1 = () => {
    setRnHBIsChecked1((prev) => !prev);
  };

  const [respHighInput, setRespHighInput] = useState("");
  const handleRespHighInputChange = (e) => {
    setRespHighInput(e.target.value);
  };
  const [respLowInput, setRespLowInput] = useState("");
  const handleRespLowInputChange = (e) => {
    setRespLowInput(e.target.value);
  };

  const [isRnHBChecked2, setRnHBIsChecked2] = useState(false);
  const handleRnHBCheckBox2 = () => {
    setRnHBIsChecked2((prev) => !prev);
  };

  const [hbHighInput, setHbHighInput] = useState("");
  const handleHbHighInputChange = (e) => {
    setHbHighInput(e.target.value);
  };
  const [hbLowInput, setHbLowInput] = useState("");
  const handleHbLowInputChange = (e) => {
    setHbLowInput(e.target.value);
  };

  const [isRnHBChecked3, setRnHBIsChecked3] = useState(false);
  const handleRnHBCheckBox3 = () => {
    setRnHBIsChecked3((prev) => !prev);
  };
  const [isRnHBChecked4, setRnHBIsChecked4] = useState(false);
  const handleRnHBCheckBox4 = () => {
    setRnHBIsChecked4((prev) => !prev);
  };

  {
    /* HANDLE TOGGLE BUTTON */
  }
  // Notification
  const [notificationToggleState, setNotificationToggleState] = useState(false);
  const handleNotificationToggle = () => {
    setNotificationToggleState((prev) => !prev);
    setSelectedNotification(() => false);
  };
  // Alert Repeat Time
  const [alertRepeatToggleState, setAlertRepeatToggleState] = useState(false);
  const handleAlertRepeatToggle = () => {
    setAlertRepeatToggleState((prev) => !prev);
    setARTIsChecked(() => false);
  };
  // Exit Bed Rate
  const [exitBedRateToggleState, setExitBedRateToggleState] = useState(false);
  const handleExitBedRateToggle = () => {
    setExitBedRateToggleState((prev) => !prev);
    setEBRIsChecked(() => false);
    setSensitivityDropDown(() => false);
  };
  // Position
  const [positionToggleState, setPositionToggleState] = useState(false);
  const handlePositionToggle = () => {
    setPositionToggleState((prev) => !prev);
    //setSelectedNotifications2((prev) => false);
  };
  // Respiration and Heart Beat
  const [respHeartBeatToggleState, setRespHeartBeatToggleState] =
    useState(false);
  const handleRespHeartBeatToggle = () => {
    setRespHeartBeatToggleState((prev) => !prev);
    setRnHBIsChecked1(() => false); // Resp. Max
    setRnHBIsChecked2(() => false); // Resp. Min
    setRnHBIsChecked3(() => false); // Heart beat Max
    setRnHBIsChecked4(() => false); // Heart beat Min
  };

  {
    /* HANDLE DROP DOWN MENU */
  }
  const [isSensitivityDropDown, setSensitivityDropDown] = useState(false);
  const [placeholder, setPlaceholder] = useState("Medium"); // Input placeholder

  const handleSensitivityDropDown = () => {
    setSensitivityDropDown((prev) => !prev);
  };
  const handleSensitivitySelect = (sensitivity) => {
    setPlaceholder(sensitivity);
    handleSensitivityDropDown;
  };

  {
    /* HANDLE DROP DOWN MENU CLICK OUTSIDE */
  }
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSensitivityDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  {
    /* CONVERT betwwen binary and int32 */
  }

  // xxxxxxxx xxxxxxx_b = Disable(0) / Enable(1) all alerts
  // xxxxxxxx xxxxxx_xb = Disable(0) / Enable(1) exit alerts
  // xxxxxxxx xxxxx_xxb = Disable(0) / Enable(1) all physiological alerts
  // xxxxxxxx xxxx_xxxb = Disable(0) / Enable(1) heart rate alert
  // xxxxxxxx xxx_xxxxb = Disable(0) / Enable(1) respiratory rate alert
  // xxxxxxxx xx_xxxxxb = Disable(0) / Enable(1) all posture alerts
  // xxxxxxx_ xxxxxxxxb = Disable(0) / Enable(1) posture alert 1
  // xxxxxx_x xxxxxxxxb = Disable(0) / Enable(1) posture alert 2
  // xxxxx_xx xxxxxxxxb = Disable(0) / Enable(1) posture alert 3
  // xxxx_xxx xxxxxxxxb = Disable(0) / Enable(1) posture alert 4
  // xxx_xxxx xxxxxxxxb = Disable(0) / Enable(1) posture alert 5
  // xx_xxxxx xxxxxxxxb = Disable(0) / Enable(1) posture alert 6
  // x_xxxxxx xxxxxxxxb = Disable(0) / Enable(1) posture alert 7

  const updateToggleStatesFromAlertController = (alertController) => {
    const binaryStr = (alertController >>> 0).toString(2).padStart(32, "0"); // Convert to 32-bit binary

    console.log("the alertcontroller ", binaryStr);
    setNotificationToggleState(binaryStr[31] === "1"); //all alerts
    setExitBedRateToggleState(binaryStr[30] === "1"); //exit alerts
    setRespHeartBeatToggleState(binaryStr[29] === "1"); //all physiological alerts
    setRnHBIsChecked1(binaryStr[28] === "1"); //heart rate alert
    setRnHBIsChecked2(binaryStr[27] === "1"); //respiratory rate alert
    setPositionToggleState(binaryStr[26] === "1"); //all posture alerts

    if (binaryStr[30] === "1") {
      switch (alertList.exitalert) {
        case 60:
          setPlaceholder("High");
          break;
        case 70:
          setPlaceholder("Medium");
          break;
        case 80:
          setPlaceholder("Low");
          break;
        default:
          setPlaceholder("Medium");
          break;
      }
    } else {
      setPlaceholder("Medium");
    }

    let positionSelected = [];
    let a = 1;
    [23, 22, 21, 20, 19, 18, 17].forEach((index) => {
      if (binaryStr[index] === "1") {
        positionSelected.push(a);
      }
      a++;
    });
    setSelectedNotifications2(positionSelected);
  };

  const generateAlertControllerFromToggleStates = () => {
    let positionSelected = [];
    if (selectedNotifications2) {
      positionSelected = selectedNotifications2;
    }
    let binaryStr = "";

    binaryStr =
      (positionSelected.includes(7) ? "1" : "0") +
      (positionSelected.includes(6) ? "1" : "0") +
      (positionSelected.includes(5) ? "1" : "0") +
      (positionSelected.includes(4) ? "1" : "0") +
      (positionSelected.includes(3) ? "1" : "0") +
      (positionSelected.includes(2) ? "1" : "0") +
      (positionSelected.includes(1) ? "1" : "0") +
      "00" +
      (positionToggleState ? "1" : "0") + // Bit 5
      (isRnHBChecked2 ? "1" : "0") + // Bit 4
      (isRnHBChecked1 ? "1" : "0") + // Bit 3
      (respHeartBeatToggleState ? "1" : "0") + // Bit 2
      (exitBedRateToggleState ? "1" : "0") + // Bit 1
      (notificationToggleState ? "1" : "0"); // Bit 0

    // Pad to 32 bits with leading zeros
    binaryStr = binaryStr.padStart(32, "0");

    return parseInt(binaryStr, 2); // Convert binary string back to int32
  };
  {
    /* GET API Patient Alert List */
  }
  const [alertList, setAlertList] = useState(null);

  const [isNewAlert, setNewAlert] = useState(false);

  const fetchAlertList = async (patientid) => {
    try {
      const response = await fetch(`/api/7284/db/Alert/${patientid}`, {
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
      if (data.code === -1) {
        console.log(data.message);
        setNewAlert(true);
        return;
      }
      console.log("Fetched data:", data);
      setAlertList(data); // Update state with filtered object
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };

  useEffect(() => {
    fetchPatientProfile();
  }, [macaddress]);

  useEffect(() => {
    if (patient && patient.patientid) {
      fetchAlertList(patient.patientid);
    }
  }, [patient]);

  useEffect(() => {
    if (alertList) {
      // Alert Controller
      updateToggleStatesFromAlertController(alertList.alertcontroller);
      // Alert Start and End Time
      if (alertList.alertstarttime === 0 && alertList.alertstoptime === 24) {
        setSelectedNotification(1);
      } else if (
        alertList.alertstarttime === 0 &&
        alertList.alertstoptime === 8
      ) {
        setSelectedNotification(2);
      } else if (
        alertList.alertstarttime === 8 &&
        alertList.alertstoptime === 16
      ) {
        setSelectedNotification(3);
      } else if (
        alertList.alertstarttime === 16 &&
        alertList.alertstoptime === 24
      ) {
        setSelectedNotification(4);
      } else if (
        alertList.alertstarttime === 0 &&
        alertList.alertstoptime === 0
      ) {
        setNotificationToggleState(false);
      } else {
        setSelectedNotification(5);
        setCustomStartTime(alertList.alertstarttime);
        setCustomEndTime(alertList.alertstoptime);
      }
      // Alert Repeat Time
      if (alertList.debounce !== 0) {
        setAlertRepeatToggleState(true);
        setDebounceInput(alertList.debounce);
      } else {
        setAlertRepeatToggleState(false);
      }
      // Exit Bed Alert Sensitivity

      // Position Alert
      const postureAlerts = {
        1: alertList.posturealert1,
        2: alertList.posturealert2,
        3: alertList.posturealert3,
        4: alertList.posturealert4,
        5: alertList.posturealert5,
        6: alertList.posturealert6,
        7: alertList.posturealert7,
      };
      setInputValues(postureAlerts);
      // Physiological Alert
      setRespHighInput(alertList.respiratoryratehighlimit);
      setRespLowInput(alertList.respiratoryratelowlimit);
      setHbHighInput(alertList.heartratehighlimit);
      setHbLowInput(alertList.heartratelowlimit);
    }
  }, [alertList]);

  {
    /* Requestbody */
  }
  const requestBody_PUT = {
    alertcontroller: generateAlertControllerFromToggleStates(),
    alertstarttime:
      (selectedNotification === 5
        ? parseInt(customStartTime, 10)
        : startTime) || 0,
    alertstoptime:
      (selectedNotification === 5 ? parseInt(customEndTime, 10) : endTime) || 0,
    debounce: alertRepeatToggleState ? parseInt(debounceInput, 10) : 0,
    exitalert: placeholder === "High" ? 60 : placeholder === "Medium" ? 70 : 80,
    posturealert1: parseInt(inputValues[1], 10),
    posturealert2: parseInt(inputValues[2], 10),
    posturealert3: parseInt(inputValues[3], 10),
    posturealert4: parseInt(inputValues[4], 10),
    posturealert5: parseInt(inputValues[5], 10),
    posturealert6: parseInt(inputValues[6], 10),
    posturealert7: parseInt(inputValues[7], 10),
    heartratehighlimit: parseInt(hbHighInput, 10),
    heartratelowlimit: parseInt(hbLowInput, 10),
    respiratoryratehighlimit: parseInt(respHighInput, 10),
    respiratoryratelowlimit: parseInt(respLowInput, 10),
  };

  const requestBody_POST = {
    alertcontroller: generateAlertControllerFromToggleStates() || 3,
    alertstarttime:
      (selectedNotification === 5
        ? parseInt(customStartTime, 10)
        : startTime) || 0,
    alertstoptime:
      (selectedNotification === 5 ? parseInt(customEndTime, 10) : endTime) ||
      24,
    debounce: (alertRepeatToggleState ? parseInt(debounceInput, 10) : 0) || 60,
    exitalert:
      (placeholder === "High" ? 60 : placeholder === "Medium" ? 70 : 80) || 70,
    posturealert1: parseInt(inputValues[1], 10) || 600,
    posturealert2: parseInt(inputValues[2], 10) || 600,
    posturealert3: parseInt(inputValues[3], 10) || 600,
    posturealert4: parseInt(inputValues[4], 10) || 600,
    posturealert5: parseInt(inputValues[5], 10) || 600,
    posturealert6: parseInt(inputValues[6], 10) || 600,
    posturealert7: parseInt(inputValues[7], 10) || 600,
    heartratehighlimit: parseInt(hbHighInput, 10) || 100,
    heartratelowlimit: parseInt(hbLowInput, 10) || 60,
    respiratoryratehighlimit: parseInt(respHighInput, 10) || 20,
    respiratoryratelowlimit: parseInt(respLowInput, 10) || 12,
    enablealert1: true,
    enablealert2: true,
    enablealert3: true,
    enablealert4: true,
    enablealert5: true,
    enablealert6: true,
    enablealert7: true,
    patientid: patient.patientid,
  };

  const handleUpdateAlertClicked = () => {
    // handle new patient but no change of toggle state
    if (
      isNewAlert &&
      !notificationToggleState &&
      !alertRepeatToggleState &&
      !exitBedRateToggleState &&
      !positionToggleState &&
      !respHeartBeatToggleState
    ) {
      alert("At least change one status of alert settings !");
      return;
    }
    if (isNewAlert) {
      console.log("the input requestbody is ", requestBody_PUT);
      POST_PatientAlert();
    } else {
      console.log("the input requestbody is ", requestBody_POST);
      PUT_PatientAlert();
    }
  };
  {
    /* POST API Update Toggle State */
  }
  const POST_PatientAlert = async () => {
    try {
      const response = await fetch(`/api/7284/db/Alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody_POST), // Convert the requestBody to JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.code !== 0) {
        console.log(data.message);
        alert(data.message);
        return;
      }
      console.log("Device POST successfully:", data);
      alert("Update Successfully!");
      console.log(data); // Return the response data if needed
    } catch (error) {
      console.error("Error updating device:", error.message);
    }
  };

  {
    /* PUT API Update Toggle State */
  }
  const PUT_PatientAlert = async () => {
    try {
      // Remove 'alertguid' from the alertList
      const { alertguid, ...filteredAlertList } = alertList; // Destructure to exclude alertguid

      // Combine the filtered alert list with the new request body
      const updatedData = { ...filteredAlertList, ...requestBody_PUT };

      const response = await fetch(`/api/7284/db/Alert/${patient.patientid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData), // Convert the requestBody to JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.code !== 0) {
        console.log(data.message);
        alert(data.message);
        return;
      }
      console.log("Device PUT successfully:", data);
      alert("Update Successfully!");
      console.log(data); // Return the response data if needed
    } catch (error) {
      console.error("Error updating device:", error.message);
    }
  };
  {
    /* PUT API RESET TO DEFAULT */
  }
  const requestBody_PUT_RESET = {
    alertcontroller: 3,
    alertstarttime: 0,
    alertstoptime: 24,
    debounce: 60,
    exitalert: 70,
    posturealert1: 600,
    posturealert2: 600,
    posturealert3: 600,
    posturealert4: 600,
    posturealert5: 600,
    posturealert6: 600,
    posturealert7: 600,
    heartratehighlimit: 100,
    heartratelowlimit: 60,
    respiratoryratehighlimit: 20,
    respiratoryratelowlimit: 12,
  };
  const PUT_PatientAlert_RESET = async () => {
    try {
      // Remove 'alertguid' from the alertList
      const { alertguid, ...filteredAlertList } = alertList; // Destructure to exclude alertguid

      // Combine the filtered alert list with the new request body
      const updatedData = { ...filteredAlertList, ...requestBody_PUT_RESET };

      const response = await fetch(`/api/7284/db/Alert/${patient.patientid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData), // Convert the requestBody to JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.code !== 0) {
        console.log(data.message);
        alert(data.message);
        return;
      }
      console.log("Device RESET successfully:", data);
      alert("Update Successfully!");
      console.log(data); // Return the response data if needed
    } catch (error) {
      console.error("Error updating device:", error.message);
    }
  };
  const handleResetAlertClicked = () => {
    if (!isNewAlert) {
      PUT_PatientAlert_RESET();
    }
  };

  return (
    <div className="alertSection">
      {/* Notification */}
      <div className="alertSetting">
        <div className="alertHead">
          <h1>Notification</h1>
          <div
            className={`toggle ${notificationToggleState ? "active" : ""}`}
            onClick={handleNotificationToggle}
          >
            <img
              className="line"
              src="/src/assets/toggle-line.svg"
              alt="toggle button"
            />
            <img className="dot" src="/src/assets/toggle-dot.svg" alt="" />
          </div>
        </div>
        <div className="alertOpt">
          <p className="alertDesc">
            These are alerts for different valid times.
          </p>
          <div className="opt-list">
            <div
              className={`opt-grid ${notificationToggleState ? "active" : ""}`}
            >
              {NotificationTimeRange.map((option) => (
                <div key={option.id} className="opt-box">
                  <div
                    className={`opt ${
                      option.id === 5 ? "custom" : "duration"
                    } ${notificationToggleState ? "on" : ""} ${
                      selectedNotification === option.id ? "active" : ""
                    }`}
                  >
                    <img
                      src="/src/assets/checkbox-blank-outline.svg"
                      alt=""
                      onClick={() => handleNotificationCheckBox(option.id)}
                    />
                    <div className="desc-box">
                      <p>{option.label}</p>
                      {option.id === 5 && (
                        <div className="desc">
                          <div className="desc-input">
                            <input
                              type="number"
                              value={customStartTime}
                              onChange={handleAlertStartTimeChange}
                              readOnly={selectedNotification !== option.id}
                            />
                          </div>
                          <p>to</p>
                          <div className="desc-input">
                            <input
                              type="number"
                              value={customEndTime}
                              onChange={handleAlertEndTimeChange}
                              readOnly={selectedNotification !== option.id}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="assistive-text">This is a line of text</div>
                </div>
              ))}
            </div>
            {/* <div className="btn-gp">
              <div
                className={`text-only btn ${
                  notificationToggleState ? "" : "inactive"
                }`}
              >
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Save</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <div className="alertSetting">
        <div className="alertHead">
          <h1>Alert Repeat Times</h1>
          <div
            className={`toggle ${alertRepeatToggleState ? "active" : ""}`}
            onClick={handleAlertRepeatToggle}
          >
            <img
              className="line"
              src="/src/assets/toggle-line.svg"
              alt="toggle button"
            />
            <img className="dot" src="/src/assets/toggle-dot.svg" alt="" />
          </div>
        </div>
        <div className="alertOpt">
          <p className="alertDesc">
            These are alerts for different in-bed positions.
          </p>
          <div className="opt-list">
            <div
              className={`opt-grid ${alertRepeatToggleState ? "active" : ""}`}
            >
              <div className="opt-box">
                <div
                  className={`opt ${alertRepeatToggleState ? "on" : ""} ${
                    alertRepeatToggleState ? "active" : ""
                  } `}
                >
                  <img src="/src/assets/checkbox-blank-outline.svg" alt="" />
                  <div className="desc-box">
                    <p>Debounce</p>
                    <div className="desc">
                      <p>Limit alert repeat times in this time interval.</p>
                      <div className="desc-input">
                        <input
                          type="number"
                          value={alertRepeatToggleState ? debounceInput : ""}
                          onChange={handleDebounceInputChange}
                          readOnly={!alertRepeatToggleState}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="assistive-text">This is a line of text</div>
              </div>
            </div>
            {/* <div className="btn-gp">
              <div
                className={`btn text-only ${
                  alertRepeatToggleState ? "" : "inactive"
                }`}
              >
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Save</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <div className="alertSetting">
        <div className="alertHead">
          <h1>Exit Bed Alerts</h1>
          <div
            className={`toggle ${exitBedRateToggleState ? "active" : ""}`}
            onClick={handleExitBedRateToggle}
          >
            <img
              className="line"
              src="/src/assets/toggle-line.svg"
              alt="toggle button"
            />
            <img className="dot" src="/src/assets/toggle-dot.svg" alt="" />
          </div>
        </div>
        <div className="alertOpt">
          <p className="alertDesc">
            These are alerts for different in-bed positions.
          </p>
          <div className="opt-list">
            <div
              className={`opt-grid ${exitBedRateToggleState ? "active" : ""}`}
            >
              <div className="opt-box">
                <div className={`opt ${exitBedRateToggleState ? "on" : ""} `}>
                  <img
                    src={`${
                      exitBedRateToggleState
                        ? "/src/assets/checkbox-filled-outline.svg"
                        : "/src/assets/checkbox-blank-outline.svg"
                    } `}
                    alt=""
                  />
                  <div className="desc-box">
                    <p>Sensitivity</p>
                    <div className="desc">
                      <p>Alert when exit rate exceeds a specific percentage.</p>
                      <div
                        className="input dropdown suffix"
                        onClick={handleSensitivityDropDown}
                        ref={dropdownRef}
                      >
                        <div className="input-gp">
                          <input
                            type="text"
                            className="placeholder"
                            id="name"
                            name="name"
                            placeholder={placeholder}
                            readOnly
                          />
                          <img className="suffix" src="" alt="dropdown icon" />
                        </div>
                        <div
                          className={`list ${
                            isSensitivityDropDown & exitBedRateToggleState
                              ? "active"
                              : ""
                          }`}
                        >
                          <div
                            className="item opt2"
                            onClick={() => handleSensitivitySelect("Low")}
                          >
                            Low
                          </div>
                          <div
                            className="item opt3"
                            onClick={() => handleSensitivitySelect("Medium")}
                          >
                            Medium
                          </div>
                          <div
                            className="item opt4"
                            onClick={() => handleSensitivitySelect("High")}
                          >
                            High
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="assistive-text">This is a line of text</div>
              </div>
            </div>
            {/* <div className="btn-gp">
              <div
                className={`text-only btn ${
                  exitBedRateToggleState ? "" : "inactive"
                }`}
              >
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Save</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <div className="alertSetting">
        <div className="alertHead">
          <h1>Position Alerts</h1>
          <div
            className={`toggle ${positionToggleState ? "active" : ""}`}
            onClick={handlePositionToggle}
          >
            <img
              className="line"
              src="/src/assets/toggle-line.svg"
              alt="toggle button"
            />
            <img className="dot" src="/src/assets/toggle-dot.svg" alt="" />
          </div>
        </div>
        <div className="alertOpt">
          <p className="alertDesc">
            These are alerts for different in-bed positions.
          </p>
          <div className="opt-list">
            <div className={`opt-grid ${positionToggleState ? "active" : ""}`}>
              {PositionStatus.map((option) => (
                <div key={option.id} className="opt-box">
                  <div
                    className={`opt ${positionToggleState ? "on" : ""} ${
                      Array.isArray(selectedNotifications2) &&
                      selectedNotifications2.includes(option.id)
                        ? "active"
                        : ""
                    }`}
                  >
                    <img
                      src="/src/assets/checkbox-blank-outline.svg"
                      alt=""
                      onClick={() => handleNotificationCheckBox2(option.id)}
                    />
                    <div className="desc-box">
                      <p>{option.label}</p>
                      <div className="desc">
                        <p>
                          Alert when current position holding for a specific
                          duration.
                        </p>
                        <div className="desc-input">
                          <input
                            type="number"
                            value={
                              Array.isArray(selectedNotifications2) &&
                              selectedNotifications2.includes(option.id) &&
                              positionToggleState
                                ? inputValues[option.id]
                                : ""
                            }
                            onChange={(e) =>
                              handleInputChange(option.id, e.target.value)
                            }
                            readOnly={
                              !(
                                Array.isArray(selectedNotifications2) &&
                                selectedNotifications2.includes(option.id)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="assistive-text">This is a line of text</div>
                </div>
              ))}
            </div>
            {/* <div className="btn-gp">
              <div
                className={`text-only btn ${
                  positionToggleState ? "" : "inactive"
                }`}
              >
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Save</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <div className="alertSetting">
        <div className="alertHead">
          <h1>Physiological Alerts</h1>
          <div
            className={`toggle ${respHeartBeatToggleState ? "active" : ""}`}
            onClick={handleRespHeartBeatToggle}
          >
            <img
              className="line"
              src="/src/assets/toggle-line.svg"
              alt="toggle button"
            />
            <img className="dot" src="/src/assets/toggle-dot.svg" alt="" />
          </div>
        </div>
        <div className="alertOpt">
          <p className="alertDesc">
            These are alerts for abnormal respiration & heartbeat.
          </p>
          <div className="opt-list">
            <div
              className={`opt-grid2 ${
                respHeartBeatToggleState ? "active" : ""
              }`}
            >
              <div className="opt-box">
                <div
                  className={`opt ${respHeartBeatToggleState ? "on" : ""} ${
                    isRnHBChecked1 ? "active" : ""
                  } `}
                >
                  <img
                    src="/src/assets/checkbox-blank-outline.svg"
                    alt=""
                    onClick={handleRnHBCheckBox1}
                  />
                  <div className="desc-box">
                    <p>Respiration Rate</p>
                    <div className="desc">
                      <p>Control highest & lowest limit of respiration rate.</p>
                      <div className="desc-input rpm max">
                        <input
                          type="number"
                          value={isRnHBChecked1 ? respHighInput : ""}
                          onChange={handleRespHighInputChange}
                          readOnly={!isRnHBChecked1}
                        />
                      </div>
                      <div className="desc-input rpm min">
                        <input
                          type="number"
                          value={isRnHBChecked1 ? respLowInput : ""}
                          onChange={handleRespLowInputChange}
                          readOnly={!isRnHBChecked1}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`opt-grid2 ${
                respHeartBeatToggleState ? "active" : ""
              }`}
            >
              <div className="opt-box">
                <div
                  className={`opt ${respHeartBeatToggleState ? "on" : ""} ${
                    isRnHBChecked2 ? "active" : ""
                  } `}
                >
                  <img
                    src="/src/assets/checkbox-blank-outline.svg"
                    alt=""
                    onClick={handleRnHBCheckBox2}
                  />
                  <div className="desc-box">
                    <p>Heartbeat Rate</p>
                    <div className="desc">
                      <p>Control highest & lowest limit of heartbeat rate.</p>
                      <div className="desc-input rpm max">
                        <input
                          type="number"
                          value={isRnHBChecked2 ? hbHighInput : ""}
                          onChange={handleHbHighInputChange}
                          readOnly={!isRnHBChecked2}
                        />
                      </div>
                      <div className="desc-input rpm min">
                        <input
                          type="number"
                          value={isRnHBChecked2 ? hbLowInput : ""}
                          onChange={handleHbLowInputChange}
                          readOnly={!isRnHBChecked2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="assistive-text">This is a line of text</div>
              </div>
            </div>
            {/* <div className="btn-gp">
              <div
                className={`btn text-only ${
                  respHeartBeatToggleState ? "" : "inactive"
                }`}
              >
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Save</p>
              </div>
            </div> */}
            <div className="btn-gp">
              <div
                className={`btn text-only`}
                onClick={handleUpdateAlertClicked}
              >
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Save</p>
              </div>
              <div
                className="btn text-only outline"
                id="reset"
                onClick={handleResetAlertClicked}
              >
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Reset to Default</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="alertSetting">
        <div className="alertHead"></div>
        <div className="alertOpt">
          <p className="alertDesc"></p>
          <div className="opt-list">
            <div className="btn-gp">
              <div className={`btn text-only `}  onClick={handleUpdateAlertClicked}>
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Save</p>
              </div>
              <div className="btn text-only outline" id="reset">
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Reset to Default</p>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default PatientAlerts;
