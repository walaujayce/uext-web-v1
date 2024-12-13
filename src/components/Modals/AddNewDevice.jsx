import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";

const AddNewDevice = ({ callback }) => {
  {
    /* Handle Overlay Logic */
  }
  const handleWindowClick = (e) => {
    // Prevent event propagation to the overlay
    e.stopPropagation();
  };

  {
    /* Handle Stage 1 Btn Logic */
  }
  const [isActive_Stage2, setActive_Stage2] = useState(false);
  const handleConfirm_S1_Click = () => {
    if (!bed || !mac) {
      setBedError(true); // Bed Input Required
      setMacError(true); // Mac Input Required
      return; 
    }
    if (!bed) {
      setBedError(true); // Bed Input Required
      return;
    }
    if (!mac) {
      setMacError(true); // Mac Input Required
      return;
    }
    handleSubmit(); //Submit POST Request
  };
  {
    /* Handle Device Type Dropdown Menu */
  }
  const deviceTypes = ["Not specified", "UEXT", "UMAP"];
  const [isDeviceTypeActive, setDeviceTypeActive] = useState(false);
  const handleDeviceTypeDropdownMenu = () => {
    setDeviceTypeActive((prev) => !prev);
  };

  const [placeholderDeviceType, setPlaceholderDeviceType] = useState(
    deviceTypes[0]
  ); // Input placeholder
  const handleDeviceTypeItemClick = (deviceType) => {
    setPlaceholderDeviceType(deviceType);
    setDeviceTypeActive(false);
    if(deviceType==="UEXT"){
      setDeviceType_POST(1);
    }else if(deviceType==="UMAP"){
      setDeviceType_POST(2);
    }else{
      setDeviceType_POST(0);
    }
  };
  {
    /* Fetch Floors API */
  }
  const [floors, setFloors] = useState([]);

  const fetchFloorList = async () => {
    try {
      const response = await fetch("api/7284/Floor");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setFloors(data);
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  useEffect(() => {
    fetchFloorList();
  }, []);

  {
    /* Floor Dropdown Menu Logic */
  }
  const [isFloorActive, setFloorActive] = useState(false);
  const handleFloorDropDownMenu = () => {
    setFloorActive((prev) => !prev);
  };
  const [placeholderFloor, setPlaceholderFloor] = useState("9F"); // Input placeholder

  const handleFloorItemClick = (floor) => {
    setPlaceholderFloor(floor);
    setFloorActive(false);
    setFloor_POST(floor);
  };
  {
    /* Fetch Section API */
  }
  const [sections, setSections] = useState([]);

  const fetchSectionList = async () => {
    try {
      const response = await fetch("api/7284/Section");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setSections(data);
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  useEffect(() => {
    fetchSectionList();
  }, []);

  {
    /* Section Dropdown Menu Logic */
  }
  const [isSectionActive, setSectionActive] = useState(false);
  const handleSectionDropDownMenu = () => {
    setSectionActive((prev) => !prev);
  };

  const [placeholderSection, setPlaceholderSection] = useState("Zone A"); // Input placeholder

  const handleSectionItemClick = (section) => {
    setPlaceholderSection(section);
    setSectionActive(false);
    setSection_POST(section);
  };
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
        setFloorActive(false);
        setSectionActive(false);
        setDeviceTypeActive(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  {
    /* handle input error logic */
  }
  const [bedError, setBedError] = useState(false);
  const [macError, setMacError] = useState(false);

  {
    /* handle submit logic */
  }
  const [devicetype, setDeviceType_POST] = useState(0);
  const [deviceid, setDeviceId_POST] = useState("");
  const [macaddress, setMacAddress_POST] = useState("");
  const [ipaddress, setIpAddress_POST] = useState("");
  const [bed, setBed_POST] = useState("");
  const [floor, setFloor_POST] = useState(placeholderFloor);
  const [section, setSection_POST] = useState(placeholderSection);

  function getRandomString(length = 12) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    
    return result;
  }

  function getRandomIPAddress() {
    const octet1 = Math.floor(Math.random() * 256); 
    const octet2 = Math.floor(Math.random() * 256);
    const octet3 = Math.floor(Math.random() * 256);
    const octet4 = Math.floor(Math.random() * 256);
  
    const ipAddress = `${octet1}.${octet2}.${octet3}.${octet4}`;
  
    return ipAddress;
  }

  const handleSubmit = async () => {

    const requestBody = {
      devicetype,
      deviceid : getRandomString(),
      macaddress,
      ipaddress : getRandomIPAddress(),
      bed,
      floor,
      section,
    };

    try {
      const response = await fetch("api/7284/db/Device", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("devicetype",devicetype);
      console.log("deviceid",deviceid);
      console.log("macaddress",macaddress);
      console.log("ipaddress",ipaddress);
      console.log("bed",bed);
      console.log("floor",floor);
      console.log("section",section);

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

  return (
    <>
      <div
        className="addDevice"
        style={{ display: "block" }}
        onClick={handleWindowClick}
      >
        <div
          className="window"
          style={{ justifyContent: isActive_Stage2 ? "center" : "" }}
        >
          <a onClick={callback}>
            <img
              src="/src/assets/close.svg"
              alt="close icon"
              className="close"
            />
          </a>
          <img
            src={`${isActive_Stage2 ? "/src/assets/link-active.svg" : ""}`}
            alt=""
            className="icon"
            style={{ display: isActive_Stage2 ? "block" : "none" }}
          />
          <div className="title">{`${
            isActive_Stage2 ? "New Device Added" : "Add Device"
          }`}</div>
          <div
            className="tab-list"
            style={{ display: isActive_Stage2 ? "none" : "" }}
          >
            <a href="#" className="tab active tab-1">
              Device Profile
            </a>
            {/* <a href="#" className="tab tab-2">Device Connection</a> */}
          </div>
          {/* Device Profile */}
          <form action="POST">
            <div
              className="grid st3 active"
              style={{ display: isActive_Stage2 ? "none" : "" }}
            >
              {/* Device Type */}
              <div className="input dropdown building suffix g-c-3">
                <label for="devicetype" className="label-container">
                  <p>Device Type</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div
                  className="input-gp"
                  onClick={handleDeviceTypeDropdownMenu}
                  ref={addDropdownRef}
                >
                  <input
                    type="text"
                    className="placeholder"
                    id="devicetype"
                    placeholder={placeholderDeviceType}
                    readOnly
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className={`list ${isDeviceTypeActive ? "active" : ""}`}>
                  {deviceTypes.map((deviceType) => (
                    <div
                      className="item"
                      onClick={() => handleDeviceTypeItemClick(deviceType)}
                    >
                      {deviceType}
                    </div>
                  ))}
                </div>
              </div>
              {/* MAC */}
              <div className="input g-c-3">
                <label for="mac" className="label-container">
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
                    placeholder="Enter here"
                    required
                    value={macaddress}
                    onChange={(e) => setMacAddress_POST(e.target.value)}
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className={`assistive-text ${macError ? "active" : ""} `}>
                  Oops! Something went wrong.
                </div>
              </div>
              {/* Bed */}
              <div className="input g-c-3">
                <label for="bed" className="label-container">
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
                    value={bed}
                    onChange={(e) => setBed_POST(e.target.value)}
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className={`assistive-text ${bedError ? "active" : ""} `}>
                  Oops! Something went wrong.
                </div>
              </div>

              {/* Section */}
              <div className="input dropdown section suffix g-c-3">
                <label for="section" className="label-container">
                  <p>Section</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div
                  className="input-gp"
                  onClick={handleSectionDropDownMenu}
                  ref={addDropdownRef}
                >
                  <input
                    type="text"
                    className="placeholder"
                    id="section"
                    placeholder={placeholderSection}
                    readOnly
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className={`list ${isSectionActive ? "active" : ""}`}>
                  {sections.map((section) => (
                    <div
                      className="item"
                      key={section.sectionid}
                      onClick={() =>
                        handleSectionItemClick(section.description)
                      }
                    >
                      {section.description}
                    </div>
                  ))}
                </div>
              </div>
              {/* Floor */}
              <div className="input dropdown floor suffix g-c-3">
                <label for="floor" className="label-container">
                  <p>Floor</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div
                  className="input-gp"
                  onClick={handleFloorDropDownMenu}
                  ref={addDropdownRef}
                >
                  <input
                    type="text"
                    className="placeholder"
                    id="floor"
                    placeholder={placeholderFloor}
                    readOnly
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className={`list ${isFloorActive ? "active" : ""}`}>
                  {floors.map((floor) => (
                    <div
                      className="item"
                      key={floor.floorid}
                      onClick={() => handleFloorItemClick(floor.description)}
                    >
                      {floor.description}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              className="btn-gp st1 active"
              style={{ display: isActive_Stage2 ? "none" : "" }}
              onClick={handleConfirm_S1_Click}
            >
              <div className="btn text-only pri">
                <img src="" alt="" className="prefix" />
                <p className="btn-text pri-text">Continue</p>
              </div>
            </div>
          </form>
          {/* Connecting */}
          <div className="connecting">
            <img src="/src/assets/connecting.gif" alt="connecting" />
            <p>Connecting...</p>
          </div>
          {/* Successful / Link to Patient */}
          <div className={`btn-gp st2 ${isActive_Stage2 ? "active" : ""}`}>
            <a className="btn text-only pri" onClick={callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">Okay</p>
            </a>
            {/* <div className="btn text-only outline sec">
              <img src="" alt="" className="prefix" />
              <p className="btn-text sec-text">Link device to a patient</p>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewDevice;
