import React, { useState, useRef, useEffect } from "react";
import "/src/CSS/device.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDropdownLogic, fetchList } from "../JS/GetFloorSectionAPI";
import Navbar from "./Navbar";
import AlertList from "./AlertList";
import SignalRService from "../JS/SignalR"

function DeviceSettings() {
  const [searchParams] = useSearchParams();
  const macaddress = searchParams.get("macaddress") || "";  

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
  const [floors, setFloor] = useState([]);
  useEffect(() => {
    fetchList("/api/7284/Floor", setFloor);
  }, []);
  const [sections, setSection] = useState([]);
  useEffect(() => {
    fetchList("/api/7284/Section", setSection);
  }, []);

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

  /// useSetInfoToInput Function ///

  function useSetInfoToInput(initialPlaceHolder) {
    const [inputValue, setInputValue] = useState(initialPlaceHolder);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };

    return {
      inputValue,
      handleInputChange,
      setInputValue,
    };
  }
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
  {
    /* Leveling Dropdown Menu Logic */
  }
  const levelings = ["Lowest", "Low", "Medium", "High", "Highest"];

  const getLevel_String = (level) => {
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
  const getLevel_Int = (level) => {
    switch (true) {
      case level === levelings[4]:
        return 90;
      case level === levelings[3]:
        return 60;
      case level === levelings[2]:
        return 40;
      case level === levelings[1]:
        return 10;
      case level === levelings[0]:
        return 0;
      default:
        return "Invalid Input Value";
    }
  };

  /// useDropDown Function ///

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
  {
    /* Fetch Get Device Information API */
  }
  /// Device Information ///
  const deviceIDInput = useSetInfoToInput("Enter Device ID");
  const deviceMacInput = useSetInfoToInput("Enter MAC Address");
  const deviceIPInput = useSetInfoToInput("Enter Device IP");
  const deviceConnectStatus = useSetInfoToInput("");

  /// Device Location ///
  const deviceBedInput = useSetInfoToInput("");
  const sectionDropdown = useDropdown("");
  const floorDropdown = useDropdown("");

  /// Device Configuration ///
  const PmioInput = useSetInfoToInput("");
  const VmaxInput = useSetInfoToInput("");
  const VminInput = useSetInfoToInput("");
  const DebTstInput = useSetInfoToInput("");
  const DebFpsInput = useSetInfoToInput("");

  // judgemethod already set up above
  const edgeparDropdown = useDropdown(levelings[2]);
  const edgeboxDropdown = useDropdown(levelings[2]);
  const sitparDropdown = useDropdown(levelings[2]);
  const sitboxDropdown = useDropdown(levelings[2]);

  const HeightThInput = useSetInfoToInput("");
  const BoxYStartInput = useSetInfoToInput("");
  const ErmapInput = useSetInfoToInput("");
  const EdgeSitPointInput = useSetInfoToInput("");
  const EmasizeInput = useSetInfoToInput("");
  const EmaThresInput = useSetInfoToInput("");
  const NoiseThresInput = useSetInfoToInput("");

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
      console.log(data);
      setDeviceInfo(data);

      deviceIDInput.setInputValue(data.deviceid || "");
      deviceMacInput.setInputValue(data.macaddress || "");
      deviceIPInput.setInputValue(data.ipaddress || "");
      deviceConnectStatus.setInputValue(
        data.connect ? "Connected" : "Disconnect"
      );

      deviceBedInput.setInputValue(data.bed || "");
      floorDropdown.selectItem(data.floor);
      floorDropdown.setIsActiveFalse;
      sectionDropdown.selectItem(data.section);
      sectionDropdown.setIsActiveFalse;

      PmioInput.setInputValue(data.pmio);
      VmaxInput.setInputValue(data.vmax);
      VminInput.setInputValue(data.vmin);
      DebTstInput.setInputValue(data.debTst);
      DebFpsInput.setInputValue(data.debFps);

      setPlaceholderJudgeMethod(
        data.judgemethod === 1 ? "by size" : "by value"
      );
      edgeparDropdown.selectItem(getLevel_String(data.edgepar));
      edgeboxDropdown.selectItem(getLevel_String(data.edgebox));
      sitparDropdown.selectItem(getLevel_String(data.sitpar));
      sitboxDropdown.selectItem(getLevel_String(data.sitbox));

      HeightThInput.setInputValue(data.heightTh);
      BoxYStartInput.setInputValue(data.boxYStart);
      ErmapInput.setInputValue(data.erMap);
      EdgeSitPointInput.setInputValue(data.edgeSitPoint);
      EmasizeInput.setInputValue(data.emasize);
      EmaThresInput.setInputValue(data.emathres);
      NoiseThresInput.setInputValue(data.noisethres);
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };
  useEffect(() => {
    fetchDeviceInfo(macaddress);
  }, []);

  {
    /* DELETE Device BUT USE PUT API */
  }
  const [isDeleteBtnHovered, setIsDeleteBtnHovered] = useState(false);

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
  // Update device location
  const requestBody_DeviceLocation = {
    bed:  deviceBedInput.inputValue,
    section: sectionDropdown.placeholder,
    floor: floorDropdown.placeholder
  };
// update device configuration
  const requestBody_DeviceLConfiguration = {
    pmio: parseInt(PmioInput.inputValue, 10),
    vmax: parseInt(VmaxInput.inputValue, 10),
    vmin: parseInt(VminInput.inputValue, 10),
    debTst: parseInt(DebTstInput.inputValue, 10),
    debFps: parseInt(DebFpsInput.inputValue, 10),
    judgemethod: parseInt(placeholderJudgeMethod === "by value" ? 0 : 1, 10),
    edgepar: parseInt(getLevel_Int(edgeparDropdown.placeholder), 10),
    edgebox: parseInt(getLevel_Int(edgeboxDropdown.placeholder), 10),
    sitpar: parseInt(getLevel_Int(sitparDropdown.placeholder), 10),
    sitbox: parseInt(getLevel_Int(sitboxDropdown.placeholder), 10),
    heightTh: parseInt(HeightThInput.inputValue, 10),
    boxYStart: parseInt(BoxYStartInput.inputValue, 10),
    erMap: ErmapInput.inputValue,
    edgeSitPoint: parseInt(EdgeSitPointInput.inputValue, 10),
    emasize: parseInt(EmasizeInput.inputValue, 10),
    emathres: parseInt(EmaThresInput.inputValue, 10),
    noisethres: parseInt(NoiseThresInput.inputValue, 10)
  };
  //set used to false to hide device from device list
  const requestBody_delete = {
    used: false,
  };
  const handlePUT_API = (print_inputvalue) => {
    console.log("the input requestbody is ", print_inputvalue);
    PUT_DeivceInfo(macaddress, print_inputvalue);
  };

  const PUT_DeivceInfo = async (macaddress, requestBody) => {
    try {
      const updatedData = { ...deviceInfo, ...requestBody };

      const response = await fetch(`/api/7284/db/Device/${macaddress}`, {
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
      console.log("Device updated successfully:", data);
      alert("Update Successfully!");
      return data; // Return the response data if needed
    } catch (error) {
      console.error("Error updating device:", error.message);
    }
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
                        readOnly
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
                        readOnly
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
                        placeholder={deviceConnectStatus.inputValue}
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
                          key={section.sectionid}
                          onClick={() =>
                            sectionDropdown.selectItem(section.description)
                          }
                        >
                          {section.description}
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
                        id="floor"
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
                          key={floor.floorid}
                          onClick={() =>
                            floorDropdown.selectItem(floor.description)
                          }
                        >
                          {floor.description}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="btn-gp">
                  <div className="btn text-only" onClick={()=>handlePUT_API(requestBody_DeviceLocation)}>
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
                        placeholder={PmioInput.inputValue}
                        value={PmioInput.inputValue}
                        onChange={PmioInput.handleInputChange}
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
                        placeholder={VmaxInput.inputValue}
                        value={VmaxInput.inputValue}
                        onChange={VmaxInput.handleInputChange}
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
                        placeholder={VminInput.inputValue}
                        value={VminInput.inputValue}
                        onChange={VminInput.handleInputChange}
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
                        placeholder={DebTstInput.inputValue}
                        value={DebTstInput.inputValue}
                        onChange={DebTstInput.handleInputChange}
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
                        placeholder={DebFpsInput.inputValue}
                        value={DebFpsInput.inputValue}
                        onChange={DebFpsInput.handleInputChange}
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
                        placeholder={HeightThInput.inputValue}
                        value={HeightThInput.inputValue}
                        onChange={HeightThInput.handleInputChange}
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
                        placeholder={BoxYStartInput.inputValue}
                        value={BoxYStartInput.inputValue}
                        onChange={BoxYStartInput.handleInputChange}
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
                        placeholder={ErmapInput.inputValue}
                        value={ErmapInput.inputValue}
                        onChange={ErmapInput.handleInputChange}
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
                        placeholder={EdgeSitPointInput.inputValue}
                        value={EdgeSitPointInput.inputValue}
                        onChange={EdgeSitPointInput.handleInputChange}
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
                        placeholder={EmasizeInput.inputValue}
                        value={EmasizeInput.inputValue}
                        onChange={EmasizeInput.handleInputChange}
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
                        placeholder={EmaThresInput.inputValue}
                        value={EmaThresInput.inputValue}
                        onChange={EmaThresInput.handleInputChange}
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
                        placeholder={NoiseThresInput.inputValue}
                        value={NoiseThresInput.inputValue}
                        onChange={NoiseThresInput.handleInputChange}
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                </div>
                <div className="btn-gp">
                  <div className="btn text-only" onClick={()=>handlePUT_API(requestBody_DeviceLConfiguration)}>
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
                <div className="btn-gp">
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
                    onClick={()=>handlePUT_API(requestBody_delete)}
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
