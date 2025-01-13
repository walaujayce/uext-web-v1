import React, { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/patient.css";
import OpenCVComponent from "../components/OpenCVComponent";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "./LoadingOverlay";

function PatientEngineer() {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

  const [rawData, setRawData] = useState([]);
  const [rawdatum, setRawdatum] = useState([]);
  const [position, setPosition] = useState("");
  const [duration, setDuration] = useState("");

  const [searchParams] = useSearchParams();
  const macaddress = searchParams.get("macaddress") || "";

  const postData = async () => {
    try {
      const response = await fetch(`/api/8031/rawdata/${macaddress}`, {
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
      setRawData(data);
      console.log("RawData:", data);
      setRawdatum(data.IMAGE);
      console.log("Rawdatum:", data.IMAGE);
      setPosition(data.POS);
      console.log("Position:", data.POS);
      setDuration(formatSecondsToDHMS(data.HOLD));
      console.log("Duration:", formatSecondsToDHMS(data.HOLD));
    } catch (error) {
      console.error("Error making POST request:", error);
    }
  };

  useEffect(() => {
    postData();
    const interval = setInterval(postData, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSecondsToDHMS = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    const dateTime =
      days > 0
        ? `${String(days).padStart(2, "0")}:${String(hours).padStart(
            2,
            "0"
          )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
            2,
            "0"
          )}`
        : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}:${String(seconds).padStart(2, "0")}`;

    return dateTime;
  };

  // Detect change value in input box then enable save buttons
  const [isDeviceConfigChanged, setIsDeviceConfigChanged] = useState(false);

  /// useSetInfoToInput Function ///
  function useSetConfigInput(initialPlaceHolder) {
    const [inputValue, setInputValue] = useState(initialPlaceHolder);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
      setIsDeviceConfigChanged(true);
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
    setIsDeviceConfigChanged(judgeMethod !== placeholderJudgeMethod);
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

  /// Device Configuration ///
  const PmioInput = useSetConfigInput("");
  const VmaxInput = useSetConfigInput("");
  const VminInput = useSetConfigInput("");
  const DebTstInput = useSetConfigInput("");
  const DebFpsInput = useSetConfigInput("");

  // judgemethod already set up above
  const edgeparDropdown = useDropdown(levelings[2]);
  const edgeboxDropdown = useDropdown(levelings[2]);
  const sitparDropdown = useDropdown(levelings[2]);
  const sitboxDropdown = useDropdown(levelings[2]);

  const HeightThInput = useSetConfigInput("");
  const BoxYStartInput = useSetConfigInput("");
  const ErmapInput = useSetConfigInput("");
  const EdgeSitPointInput = useSetConfigInput("");
  const EmasizeInput = useSetConfigInput("");
  const EmaThresInput = useSetConfigInput("");
  const NoiseThresInput = useSetConfigInput("");

  const [deviceInfo, setDeviceInfo] = useState([]);
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

  const dropdownJudgemethodStyleRef = useRef(null);
  const dropdownEdgeparStyleRef = useRef(null);
  const dropdownEdgeboxStyleRef = useRef(null);
  const dropdownSitparStyleRef = useRef(null);
  const dropdownSitboxStyleRef = useRef(null);

  useDynamicDropdownHeight(dropdownJudgemethodStyleRef, isJudgeMethodActive);
  // useDynamicDropdownHeight(dropdownEdgeparStyleRef, edgeparDropdown.isActive);
  // useDynamicDropdownHeight(dropdownEdgeboxStyleRef, edgeboxDropdown.isActive);
  // useDynamicDropdownHeight(dropdownSitparStyleRef, sitparDropdown.isActive);
  // useDynamicDropdownHeight(dropdownSitboxStyleRef, sitboxDropdown.isActive);

  {
    /* Fetch Get Device Information API */
  }

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
    /* PUT Device  API */
  }
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
    noisethres: parseInt(NoiseThresInput.inputValue, 10),
  };

  //reset device configuration to default
  const requestBody_PUT_RESET = {
    pmio: 100,
    vmax: 800,
    vmin: 200,
    debTst: 1,
    debFps: 1,
    judgemethod: 1,
    edgepar: 90,
    edgebox: 40,
    sitpar: 90,
    sitbox: 40,
    heightTh: 12,
    boxYStart: 7,
    erMap: "",
    edgeSitPoint: 3,
    emasize: 1,
    emathres: 10,
    noisethres: 2,
  };

  const handlePUT_API = (print_inputvalue) => {
    if (
      isDeviceConfigChanged &&
      print_inputvalue === requestBody_DeviceLConfiguration
    ) {
      console.log(
        "the input requestbody is device configuration",
        print_inputvalue
      );
      PUT_DeivceInfo(macaddress, print_inputvalue);
    } else if (print_inputvalue === requestBody_PUT_RESET) {
      console.log("the input requestbody is SET to DEFAULT", print_inputvalue);
      PUT_DeivceInfo(macaddress, print_inputvalue);
    }
  };

  const PUT_DeivceInfo = async (macaddress, requestBody) => {
    try {
      const updatedData = { ...deviceInfo, ...requestBody };

      setLoading(true);

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
      window.location.reload();
      return data; // Return the response data if needed
    } catch (error) {
      console.error("Error updating device:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="monitor">
      <div className="pressure">
        <div className="title">{t("PatientMonitor.PressureMap")}</div>
        <div className="box">
          <OpenCVComponent deviceid={macaddress} rawdata={rawdatum} />
          <div className="bt-box">
            {/* <div className="spec col">
              <p className="tag">Position</p>
              <h3>{`${position}`}</h3>
            </div>
            <div className="spec col">
              <p className="tag">Duration</p>
              <h3>{`${duration}`}</h3>
            </div> */}
            <div className="spec row">
              <div className="mr high">
                <img src="/src/assets/mr-high.svg" alt="" />
                {/* <p>12%</p> */}
              </div>
              <div className="mr mid">
                <img src="/src/assets/mr-mid.svg" alt="" />
                {/* <p>28%</p> */}
              </div>
              <div className="mr low">
                <img src="/src/assets/mr-low.svg" alt="" />
                {/* <p>60%</p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Parameters Result */}
      <div className="h-rate" style={{ gridRow: "span 1" }}>
        <div className="container">
          <div className="pl">
            <div className="head">
              <h3 className="fg1">FID</h3>
              <h3 className="fg1">STAT</h3>
              <h3 className="fg1">POS</h3>
              <h3 className="fg1">HOLD</h3>
              <h3 className="fg1">ER</h3>
              <h3 className="fg1">HR</h3>
              <h3 className="fg1">RR</h3>
              <h3 className="fg1">WIDTH</h3>
              <h3 className="fg1">HEIGHT</h3>
            </div>
            <div className="item-list" style={{ overflowY: "hidden" }}>
              <a className="item">
                <h3 className="fg1">{rawData.FID}</h3>
                <h3 className="fg1">{rawData.STAT}</h3>
                <h3 className="fg1">{rawData.POS}</h3>
                <h3 className="fg1">{formatSecondsToDHMS(rawData.HOLD)}</h3>
                <h3 className="fg1">{rawData.ER}</h3>
                <h3 className="fg1">{rawData.HR}</h3>
                <h3 className="fg1">{rawData.RR}</h3>
                <h3 className="fg1">{rawData.WIDTH}</h3>
                <h3 className="fg1">{rawData.HEIGHT}</h3>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Parameters Settings */}
      <div className="respiration">
        <div className="deviceSetting">
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
                  ref={dropdownJudgemethodStyleRef}
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
                  className={`list ${edgeparDropdown.isActive ? "active" : ""}`}
                  ref={dropdownEdgeparStyleRef}
                >
                  {levelings.map((leveling) => (
                    <div
                      className="item opt1"
                      key={leveling}
                      onClick={() => {
                        edgeparDropdown.selectItem(leveling);
                        setIsDeviceConfigChanged(true);
                      }}
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
                  className={`list ${edgeboxDropdown.isActive ? "active" : ""}`}
                  ref={dropdownEdgeboxStyleRef}
                >
                  {levelings.map((leveling) => (
                    <div
                      className="item opt1"
                      key={leveling}
                      onClick={() => {
                        edgeboxDropdown.selectItem(leveling);
                        setIsDeviceConfigChanged(true);
                      }}
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
                  className={`list ${sitparDropdown.isActive ? "active" : ""}`}
                  ref={dropdownSitparStyleRef}
                >
                  {levelings.map((leveling) => (
                    <div
                      className="item opt1"
                      key={leveling}
                      onClick={() => {
                        sitparDropdown.selectItem(leveling);
                        setIsDeviceConfigChanged(true);
                      }}
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
                  className={`list ${sitboxDropdown.isActive ? "active" : ""}`}
                  ref={dropdownSitboxStyleRef}
                >
                  {levelings.map((leveling) => (
                    <div
                      className="item opt1"
                      key={leveling}
                      onClick={() => {
                        sitboxDropdown.selectItem(leveling);
                        setIsDeviceConfigChanged(true);
                      }}
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
              <SimpleBackdrop open={loading} />
              <div
                className={`btn text-only ${
                  isDeviceConfigChanged ? "" : "inactive"
                }`}
                onClick={() => handlePUT_API(requestBody_DeviceLConfiguration)}
              >
                <img src="" alt="" className="prefix" />
                <p className="btn-text">{t("DeviceSettings.Save")}</p>
              </div>
              <div
                className="btn text-only outline"
                id="reset"
                onClick={() => handlePUT_API(requestBody_PUT_RESET)}
              >
                {/* <img src="" alt="" className="prefix" /> */}
                <p className="btn-text">{t("DeviceSettings.Reset")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientEngineer;
