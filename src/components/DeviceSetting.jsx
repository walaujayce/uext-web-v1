import React, { useState, useRef, useEffect } from "react";
import "/src/CSS/device.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDropdownLogic, fetchList } from "../JS/GetFloorSectionAPI";
import Navbar from "./Navbar";
import AlertList from "./AlertList";

function DeviceSettings() {
  const [isDeleteBtnHovered, setIsDeleteBtnHovered] = useState(false);
  {
    /* Handle Back Button */
  }
  const navigate = useNavigate();
  const handleBackBtnClick = () => {
    navigate("/device");
  };

  {
    /* Floor and Section Fetch API */
  }
  const floors = ["1F", "2F", "3F", "4F", "5F", "6F", "7F", "8F", "9F", "All"];
  const sections = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E", "All"];

  {
    /* JudgeMethod Dropdown Menu Logic */
  }
  const [isJudgeMethodActive, setJudgeMethodActive] = useState(false);
  const handleJudgeMethodDropDownMenu = () => {
    setJudgeMethodActive((prev) => !prev);
  };

  const [placeholderJudgeMethod, setPlaceholderJudgeMethod] =
    useState("by size"); // Input placeholder

  const handleJudgeMethodItemClick = (judgeMethod) => {
    setPlaceholderJudgeMethod(judgeMethod);
    setJudgeMethodActive;
  };

  const levelings = ["Lowest", "Low", "Medium", "High", "Highest"];

  const getLevel = (level) => {
    switch (true) {
      case level === 90:
        return levelings[4];
      case level === 60:
        return levelings[3];
      case level === 40:
        return levelings[2];
      case level === 10:
        return levelings[1];
      case level === 0:
        return levelings[0];
      default:
        return "Invalid level";
    }
  };
  function useDropdown(initialPlaceholder) {
    const [isActive, setIsActive] = useState(false);
    const [placeholder, setPlaceholder] = useState(initialPlaceholder);

    const toggleActive = () => setIsActive((prev) => !prev);
    const selectItem = (value) => {
      setPlaceholder(value);
      toggleActive;
    };
    const setIsActiveFalse = () => {
      setIsActive(false);
    };

    return {
      isActive,
      placeholder,
      toggleActive,
      selectItem,
      setIsActiveFalse,
    };
  }
  const edgeparDropdown = useDropdown("Medium");
  const edgeboxDropdown = useDropdown("Medium");
  const sitparDropdown = useDropdown("Medium");
  const sitboxDropdown = useDropdown("Medium");
  const floorDropdown = useDropdown(floors[0]);
  const sectionDropdown = useDropdown(sections[0]);

  {
    /* useRef Logic */
  }

  const dropdownRefs = useRef([]);

  const addDropdownRef = (el) => {
    if (el && !dropdownRefs.current.includes(el)) {
      dropdownRefs.current.push(el);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRefs.current.every((ref) => ref && !ref.contains(event.target))
      ) {
        // Close all dropdowns or handle logic here
        setJudgeMethodActive(false);
        edgeparDropdown.setIsActiveFalse(false);
        edgeboxDropdown.setIsActiveFalse(false);
        sitparDropdown.setIsActiveFalse(false);
        sitboxDropdown.setIsActiveFalse(false);
        floorDropdown.setIsActiveFalse(false);
        sectionDropdown.setIsActiveFalse(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const [searchParams] = useSearchParams();
  const macaddress = searchParams.get("macaddress") || "";

  {
    /* Fetch Get Device Information API */
  }

  function useSetInfoToInput(initialPlaceHolder) {
    const [inputValue, setInputValue] = useState(initialPlaceHolder);
    //const [inputPlaceHolder, setInputPlaceholder] = useState(initialPlaceHolder);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };

    return {
      inputValue,
      handleInputChange,
      setInputValue,
    };
  }

  const deviceIDInput = useSetInfoToInput("Enter Device ID");
  const deviceMacInput = useSetInfoToInput("Enter MAC Address");
  const deviceIPInput = useSetInfoToInput("Enter Device IP");
  const deviceBedInput = useSetInfoToInput("Enter Bed No.");

  const [deviceInfo, setDeviceInfo] = useState([]);
  const fetchDeviceInfo = async (macaddress) => {
    try {
      const response = await fetch(`/api/7284/db/Device/${macaddress}`, {
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
      setDeviceInfo(data);

      deviceIDInput.setInputValue(data.deviceid || "");
      deviceMacInput.setInputValue(data.macaddress || "");
      deviceIPInput.setInputValue(data.ipaddress || "");
      deviceBedInput.setInputValue(data.bed || "");

      floorDropdown.selectItem(data.floor);
      floorDropdown.setIsActiveFalse;
      sectionDropdown.selectItem(data.section);
      sectionDropdown.setIsActiveFalse;

      setPlaceholderJudgeMethod(data.judgemethod ? "by size" : "by value");
      edgeparDropdown.selectItem(getLevel(data.edgepar));
      edgeboxDropdown.selectItem(getLevel(data.edgebox));
      sitparDropdown.selectItem(getLevel(data.sitpar));
      sitboxDropdown.selectItem(getLevel(data.sitbox));

      console.log(data);
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };
  useEffect(() => {
    fetchDeviceInfo(macaddress);
  }, []);

  {
    /* DELETE Device  API */
  }
  const deleteDevice = async (deviceId) => {
    try {
      const response = await fetch(`/api/7284/db/Device/${deviceId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("Content-Type");
      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error(`Expected JSON, got: ${contentType}`);
      }
      console.log(response.message);
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };

  const handleDeleteDevice = (deviceId) => {
    deleteDevice(deviceId);
    alert("Delete successfully!");
    navigate("/device");
  };

  {
    /* PUT Device  API */
  }
  const requestBody = {
    devicetype: deviceInfo.devicetype,
    macaddress: macaddress,
    ipaddress: deviceInfo.ipaddress,
    devicestatus: deviceInfo.devicestatus,
    used: deviceInfo.used,
    connect: deviceInfo.connect,
    actionid: deviceInfo.actionid,
    disconnectCnt: deviceInfo.disconnectCnt,
    recordMode: deviceInfo.recordMode,
    version: deviceInfo.version,
    judgemethod: placeholderJudgeMethod === "by value" ? 0 : 1,
    edgepar: deviceInfo.edgepar,
    edgebox: deviceInfo.edgebox,
    sitpar: deviceInfo.sitpar,
    sitbox: deviceInfo.sitbox,
    heightTh: deviceInfo.heightTh,
    erMap: deviceInfo.erMap,
    vmax: deviceInfo.vmax,
    vmin: deviceInfo.vmin,
    debTst: deviceInfo.debTst,
    debFps: deviceInfo.debFps,
    boxYStart: deviceInfo.boxYStart,
    edgeSitPoint: deviceInfo.edgeSitPoint,
    emasize: deviceInfo.emasize,
    emathres: deviceInfo.emathres,
    noisethres: deviceInfo.noisethres,
    pmio: deviceInfo.pmio,
    bed: deviceBedInput.inputValue,
    floor: floorDropdown.placeholder,
    section: sectionDropdown.placeholder,
  };
  const handleSaveDeviceLocation = async (macaddress, requestBody) => {
    try {
      console.log(requestBody.judgemethod);

      const response = await fetch(`/api/7284/db/Device/${macaddress}`, {
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
      return data; // Return the response data if needed
    } catch (error) {
      console.error("Error updating device:", error.message);
    }

    // console.log(deviceInfo.devicetype);
    // console.log(deviceIDInput.inputValue);
    // console.log(deviceMacInput.inputValue);
    // console.log(deviceIPInput.inputValue);
    // console.log(deviceInfo);

    // console.log(deviceBedInput.inputValue);
    // console.log(floorDropdown.placeholder);
    // console.log(sectionDropdown.placeholder);
  };

  return (
    <>
      <Navbar />
      <div className="wrap">
        <AlertList />
        <div className="main">
          <div className="box">
            <h1>Device Settings</h1>
            <a className="btn frameless" href="" onClick={handleBackBtnClick}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text">Back</p>
            </a>
          </div>
          <div className="device">
            <div className="deviceSetting">
              <h2>Device Information</h2>
              <div className="opt-list">
                <div className="opt-grid">
                  <div className="input g-col-3">
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
                        placeholder={deviceIDInput.inputValue}
                        value={deviceIDInput.inputValue}
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-3">
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
                        placeholder={deviceMacInput.inputValue}
                        maxLength={12}
                        value={deviceMacInput.inputValue}
                        onChange={deviceMacInput.handleInputChange}
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-3">
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
                        placeholder={deviceIPInput.inputValue}
                        value={deviceIPInput.inputValue}
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input connection g-col-3">
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
                        value={deviceInfo.connect ? "Connected" : "Disconnect"}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">click to reconnect</div>
                  </div>
                </div>
                <div className="btn-gp">
                  <div className="btn text-only">
                    <img src="" alt="" className="prefix" />
                    <p className="btn-text">Save</p>
                  </div>
                  <div className="btn text-only outline inactive">
                    <img src="" alt="" className="prefix" />
                    <p className="btn-text">Reconnect</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="deviceSetting">
              <h2>Device Location</h2>
              <div className="opt-list">
                <div className="opt-grid">
                  <div className="input g-col-3">
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
                        placeholder={deviceBedInput.inputValue}
                        value={deviceBedInput.inputValue}
                        onChange={deviceBedInput.handleInputChange}
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>

                  <div
                    className="input dropdown section g-col-3 suffix"
                    onClick={sectionDropdown.toggleActive}
                    ref={addDropdownRef}
                  >
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
                        placeholder={sectionDropdown.placeholder}
                        readOnly
                      />
                      <img
                        className="suffix active"
                        src=""
                        alt="dropdown icon"
                      />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                    <div
                      className={`list ${
                        sectionDropdown.isActive ? "active" : ""
                      }`}
                    >
                      {sections.map((section) => (
                        <div
                          className="item opt1"
                          key={section}
                          onClick={() => sectionDropdown.selectItem(section)}
                        >
                          {section}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="input dropdown floor g-col-3 suffix"
                    onClick={floorDropdown.toggleActive}
                    ref={addDropdownRef}
                  >
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
                        id="name"
                        placeholder={floorDropdown.placeholder}
                        readOnly
                      />
                      <img
                        className="suffix active"
                        src=""
                        alt="dropdown icon"
                      />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                    <div
                      className={`list ${
                        floorDropdown.isActive ? "active" : ""
                      }`}
                    >
                      {floors.map((floor) => (
                        <div
                          className="item opt1"
                          key={floor}
                          onClick={() => floorDropdown.selectItem(floor)}
                        >
                          {floor}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div
                  className="btn-gp"
                  onClick={() =>
                    handleSaveDeviceLocation(macaddress, requestBody)
                  }
                >
                  <div className="btn text-only">
                    <img src="" alt="" className="prefix" />
                    <p className="btn-text">Save</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="deviceSetting">
              <h2>Device Configuration</h2>
              <div className="opt-list">
                <div className="opt-grid">
                  <div className="input g-col-2 ">
                    <label htmlFor="pmio" className="label-container">
                      <p>PMIO</p>
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
                        id="pmio"
                        placeholder={deviceInfo.pmio}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-2 ">
                    <label htmlFor="vmax" className="label-container">
                      <p>VMAX</p>
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
                        id="vmax"
                        placeholder={deviceInfo.vmax}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-2">
                    <label htmlFor="vmin" className="label-container">
                      <p>VMIN</p>
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
                        id="vmin"
                        placeholder={deviceInfo.vmin}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-2">
                    <label htmlFor="Debounce_TST" className="label-container">
                      <p>Debounce_TST</p>
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
                        id="Debounce_TST"
                        placeholder={deviceInfo.debTst}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-2 ">
                    <label htmlFor="Debounce_FPS" className="label-container">
                      <p>Debounce_FPS</p>
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
                        id="Debounce_FPS"
                        placeholder={deviceInfo.debFps}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div
                    className="input dropdown set g-col-2 suffix"
                    onClick={handleJudgeMethodDropDownMenu}
                    ref={addDropdownRef}
                  >
                    <label htmlFor="judgemethod" className="label-container">
                      <p>Judge Method</p>
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
                        id="judgemethod"
                        placeholder={placeholderJudgeMethod}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                    <div
                      className={`list ${isJudgeMethodActive ? "active" : ""}`}
                    >
                      <div
                        className="item opt1"
                        onClick={() => handleJudgeMethodItemClick("by value")}
                      >
                        by value
                      </div>
                      <div
                        className="item opt2"
                        onClick={() => handleJudgeMethodItemClick("by size")}
                      >
                        by size
                      </div>
                    </div>
                  </div>
                  <div
                    className="input dropdown set g-col-2 suffix"
                    onClick={edgeparDropdown.toggleActive}
                    ref={addDropdownRef}
                  >
                    <label htmlFor="edgepar" className="label-container">
                      <p>EDGEPAR</p>
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
                        id="edgepar"
                        placeholder={edgeparDropdown.placeholder}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                    <div
                      className={`list ${
                        edgeparDropdown.isActive ? "active" : ""
                      }`}
                    >
                      {levelings.map((leveling) => (
                        <div
                          className="item opt1"
                          key={leveling}
                          onClick={() => edgeparDropdown.selectItem(leveling)}
                        >
                          {leveling}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="input dropdown set g-col-2 suffix"
                    onClick={edgeboxDropdown.toggleActive}
                    ref={addDropdownRef}
                  >
                    <label htmlFor="edgebox" className="label-container">
                      <p>EDGEBOX</p>
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
                        id="edgebox"
                        placeholder={edgeboxDropdown.placeholder}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                    <div
                      className={`list ${
                        edgeboxDropdown.isActive ? "active" : ""
                      }`}
                    >
                      {levelings.map((leveling) => (
                        <div
                          className="item opt1"
                          key={leveling}
                          onClick={() => edgeboxDropdown.selectItem(leveling)}
                        >
                          {leveling}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="input dropdown set g-col-2 suffix"
                    onClick={sitparDropdown.toggleActive}
                    ref={addDropdownRef}
                  >
                    <label htmlFor="sitpar" className="label-container">
                      <p>SITPAR</p>
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
                        id="sitpar"
                        placeholder={sitparDropdown.placeholder}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                    <div
                      className={`list ${
                        sitparDropdown.isActive ? "active" : ""
                      }`}
                    >
                      {levelings.map((leveling) => (
                        <div
                          className="item opt1"
                          key={leveling}
                          onClick={() => sitparDropdown.selectItem(leveling)}
                        >
                          {leveling}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="input dropdown set g-col-2 suffix"
                    onClick={sitboxDropdown.toggleActive}
                    ref={addDropdownRef}
                  >
                    <label htmlFor="sitbox" className="label-container">
                      <p>SITBOX</p>
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
                        id="sitbox"
                        placeholder={sitboxDropdown.placeholder}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                    <div
                      className={`list ${
                        sitboxDropdown.isActive ? "active" : ""
                      }`}
                    >
                      {levelings.map((leveling) => (
                        <div
                          className="item opt1"
                          key={leveling}
                          onClick={() => sitboxDropdown.selectItem(leveling)}
                        >
                          {leveling}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="input g-col-2">
                    <label htmlFor="HEIGHT_TH" className="label-container">
                      <p>HEIGHT_TH</p>
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
                        id="HEIGHT_TH"
                        placeholder={deviceInfo.heightTh}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-2">
                    <label htmlFor="BOX_Y_START" className="label-container">
                      <p>BOX_Y_START</p>
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
                        id="BOX_Y_START"
                        placeholder={deviceInfo.boxYStart}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-2 ">
                    <label htmlFor="ER_MAP" className="label-container">
                      <p>ER_MAP</p>
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
                        id="ER_MAP"
                        placeholder={deviceInfo.erMap}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-2">
                    <label htmlFor="EDGE_SIT_POINT" className="label-container">
                      <p>EDGE_SIT_POINT</p>
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
                        id="EDGE_SIT_POINT"
                        placeholder={deviceInfo.edgeSitPoint}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-2">
                    <label htmlFor="EMASIZE" className="label-container">
                      <p>EMASIZE</p>
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
                        id="EMASIZE"
                        placeholder={deviceInfo.emasize}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-2">
                    <label htmlFor="EMATHRES" className="label-container">
                      <p>EMATHRES</p>
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
                        id="EMATHRES"
                        placeholder={deviceInfo.emathres}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-2">
                    <label htmlFor="NOISETHRES" className="label-container">
                      <p>NOISETHRES</p>
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
                        id="NOISETHRES"
                        placeholder={deviceInfo.noisethres}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                </div>
                <div className="btn-gp">
                  <div className="btn text-only">
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
            <div className="deviceSetting">
              <h2>Device Version</h2>
              <div className="opt-list">
                <div className="ver-stat">
                  You are at the latest version! (v1.0.1)
                </div>
                <div className="btn-gp">
                  <div className="btn text-only inactive">
                    <img src="" alt="" className="prefix" />
                    <p className="btn-text">Update now</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="deviceSetting">
              <h2>Device Discharge</h2>
              <div className="opt-list">
                <div className="ver-stat">Remove current device.</div>
                <div
                  className="btn-gp"
                  onClick={() => {
                    handleDeleteDevice(deviceInfo.deviceid);
                  }}
                >
                  <div
                    className="btn text-only"
                    style={{
                      backgroundColor: isDeleteBtnHovered
                        ? "#ff050d"
                        : "#ff333a",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={() => setIsDeleteBtnHovered(true)}
                    onMouseLeave={() => setIsDeleteBtnHovered(false)}
                  >
                    <img src="" alt="" className="prefix" />
                    <p className="btn-text">Delete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeviceSettings;
