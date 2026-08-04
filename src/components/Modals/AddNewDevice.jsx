import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "../LoadingOverlay";
import api from "../../api/apiClient";

const AddNewDevice = ({ callback }) => {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

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
    if (isHaLowRSelected) {
      if (!macaddress) {
        setMacError(true); // Mac Input Required
        return;
      }
      if (!dhcp && !ipaddress) {
        setIpError(true);
        return;
      }
      handleSubmit(); //Submit POST Request
    } else {
      if (!bed || !macaddress) {
        setBedError(true); // Bed Input Required
        setMacError(true); // Mac Input Required
        return;
      }
      if (!bed) {
        setBedError(true); // Bed Input Required
        return;
      }
      if (!macaddress) {
        setMacError(true); // Mac Input Required
        return;
      }
      handleSubmit(); //Submit POST Request
    }
  };
  {
    /* Handle Device Type Dropdown Menu */
  }
  const deviceTypes = ["Not specified", "UEXT", "UMAP", "UNC", "HaLow-R"];
  const [isDeviceTypeActive, setDeviceTypeActive] = useState(false);
  const handleDeviceTypeDropdownMenu = () => {
    setDeviceTypeActive((prev) => !prev);
  };
  const [placeholderDeviceType, setPlaceholderDeviceType] = useState(
    deviceTypes[0]
  ); // Input placeholder
  const isHaLowRSelected = placeholderDeviceType === "HaLow-R";
  const handleDeviceTypeItemClick = (deviceType) => {
    setPlaceholderDeviceType(deviceType);
    handleDeviceTypeDropdownMenu;
    if (deviceType === "UEXT") {
      setDeviceType_POST(1);
    } else if (deviceType === "UMAP") {
      setDeviceType_POST(2);
    } else if (deviceType === "UNC") {
      setDeviceType_POST(3);
    } else if (deviceType === "HaLow-R") {
      setDeviceType_POST(201);
    } else {
      setDeviceType_POST(0);
    }
  };
  {
    /* Fetch Floors API */
  }
  const [floors, setFloors] = useState([]);

  const fetchFloorList = async () => {
    try {
      // const response = await fetch("/api/7284/Floor");
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const data = await response.json();
      const response = await api.get("/api/7284/Floor");

      const data = response.data;
      //console.log(data);
      setFloors(data);
      if (data.length > 0) {
        setPlaceholderFloor(data[data.length - 1].description);
      }
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
  const [placeholderFloor, setPlaceholderFloor] = useState(""); // Input placeholder

  const handleFloorItemClick = (floor) => {
    setPlaceholderFloor(floor);
    handleFloorDropDownMenu;
    setFloor_POST(floor);
  };
  {
    /* Fetch Section API */
  }
  const [sections, setSections] = useState([]);

  const fetchSectionList = async () => {
    try {
      // const response = await fetch("/api/7284/Section");
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const data = await response.json();
      const response = await api.get("/api/7284/Section");
      const data = response.data;
      if (data.length > 0) {
        setPlaceholderSection(data[data.length - 1].description);
      }
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

  const [placeholderSection, setPlaceholderSection] = useState(""); // Input placeholder

  const handleSectionItemClick = (section) => {
    setPlaceholderSection(section);
    handleSectionDropDownMenu;
    setSection_POST(section);
  };
  {
    /* DHCP Dropdown Menu Logic */
  }
  const [isDhcpActive, setDhcpActive] = useState(false);
  const handleDhcpDropDownMenu = () => {
    setDhcpActive((prev) => !prev);
  };

  const [placeholderDhcp, setPlaceholderDhcp] = useState("DHCP"); // Input placeholder

  const handleDhcpItemClick = (dhcp) => {
    setPlaceholderDhcp(dhcp);
    handleDhcpDropDownMenu;
    if(dhcp === "DHCP"){
      setIpAddressInputBoxDisabled(true);
      setIpAddress_POST("");
      setDhcp_POST(true);
    }else{
      setIpAddressInputBoxDisabled(false);
      setDhcp_POST(false);
    }
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
        setDhcpActive(false);
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

  const dropdownDeviceTypeStyleRef = useRef(null);
  const dropdownFloorStyleRef = useRef(null);
  const dropdownDhcpStyleRef = useRef(null);

  useDynamicDropdownHeight(dropdownDeviceTypeStyleRef, isDeviceTypeActive);
  useDynamicDropdownHeight(dropdownFloorStyleRef, isFloorActive);
  useDynamicDropdownHeight(dropdownDhcpStyleRef, isDhcpActive);

  {
    /* handle input error logic */
  }
  const [bedError, setBedError] = useState(false);
  const [macError, setMacError] = useState(false);
  const [ipError, setIpError] = useState(false);
  {
    /* handle input box disable */
  }
  const [isIpAddressInputBoxDisabled, setIpAddressInputBoxDisabled] =
    useState(true);
  {
    /* handle submit logic */
  }
  const [devicetype, setDeviceType_POST] = useState(0);
  const [deviceid, setDeviceId_POST] = useState("");
  const [macaddress, setMacAddress_POST] = useState("");
  const [ipaddress, setIpAddress_POST] = useState("");
  const [dhcp, setDhcp_POST] = useState(true);
  const [bed, setBed_POST] = useState("");
  const [floor, setFloor_POST] = useState(placeholderFloor);
  const [section, setSection_POST] = useState(placeholderSection);

  const handleSubmit = async () => {
    const requestBody = {
      devicetype,
      macaddress,
      dhcp,
      ipaddress,
      bed,
      floor,
      section,
      used: true,
      jlog:{}
    };

    try {
      setLoading(true);
      // const response = await fetch("/api/7284/db/Device", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(requestBody),
      // });
      const response = await api.post("/api/7284/db/Device", requestBody);

      //console.log("devicetype", devicetype);
      //console.log("macaddress", macaddress);
      //console.log("dhcp", dhcp);
      //console.log("ipaddress", ipaddress);
      //console.log("bed", bed);
      //console.log("floor", floor);
      //console.log("section", section);

      if (response.status === 200) {
        setActive_Stage2(true);
      } else {
        const errorData = response.data;
        alert(`Error: ${errorData.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Error while submitting data:", error);
      alert("Error: Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SimpleBackdrop open={loading} />

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
            isActive_Stage2
              ? t("AddDeviceModal.NewDeviceAdd")
              : t("AddDeviceModal.AddDevice")
          }`}</div>
          <div
            className="tab-list"
            style={{ display: isActive_Stage2 ? "none" : "" }}
          >
            <a href="#" className="tab active tab-1">
              {t("AddDeviceModal.DeviceProfile")}
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
              <div
                className="input suffix g-c-3"
                onClick={handleDeviceTypeDropdownMenu}
                ref={addDropdownRef}
              >
                <label htmlFor="devicetype" className="label-container">
                  <p>{t("AddDeviceModal.DeviceType")}</p>
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
                    id="devicetype"
                    placeholder={placeholderDeviceType}
                    readOnly
                  />
                  <img
                    className="suffix active"
                    src="/src/assets/menu-down.svg"
                    alt="dropdown icon"
                  />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div
                  className={`list ${isDeviceTypeActive ? "active" : ""}`}
                  ref={dropdownDeviceTypeStyleRef}
                >
                  {deviceTypes.map((deviceType) => (
                    <div
                      className="item"
                      onClick={() => handleDeviceTypeItemClick(deviceType)}
                      key={deviceType}
                    >
                      {deviceType}
                    </div>
                  ))}
                </div>
              </div>
              {/* MAC */}
              <div className="input g-c-3">
                <label htmlFor="macaddress" className="label-container">
                  <p>{t("AddDeviceModal.MACAddress")}</p>
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
                    id="macaddress"
                    placeholder="Enter here"
                    required
                    maxLength={12}
                    value={macaddress}
                    onChange={(e) => setMacAddress_POST(e.target.value)}
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className={`assistive-text ${ipError ? "active" : ""} `}>
                  Invalid format.
                </div>
              </div>
              {isHaLowRSelected && (
                <div
                  className="input suffix g-c-3"
                  onClick={handleDhcpDropDownMenu}
                  ref={addDropdownRef}
                >
                  <label htmlFor="dhcp" className="label-container">
                    <p>{t("AddDeviceModal.DHCP")}</p>
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
                      id="dhcp"
                      placeholder={placeholderDhcp}
                      readOnly
                    />
                    <img
                      className="suffix active"
                      src="/src/assets/menu-down.svg"
                      alt="dropdown icon"
                    />
                  </div>
                  <div className="assistive-text">
                    this is a line of assistive text
                  </div>
                  <div
                    className={`list ${isDhcpActive ? "active" : ""}`}
                    ref={dropdownDhcpStyleRef}
                  >
                    {["DHCP", "Static IP"].map((dhcp) => (
                      <div
                        className="item"
                        key={dhcp}
                        onClick={() => handleDhcpItemClick(dhcp)}
                      >
                        {dhcp}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Bed */}
              {isHaLowRSelected ? (
                <div className="input g-c-3">
                  <label htmlFor="ip" className="label-container">
                    <p>{t("AddDeviceModal.IP")}</p>
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
                      id="ip"
                      placeholder="Enter here"
                      required
                      value={ipaddress}
                      onChange={(e) => setIpAddress_POST(e.target.value)}
                      disabled={isIpAddressInputBoxDisabled}
                    />
                    <img className="suffix" src="" alt="dropdown icon" />
                  </div>
                  <div className={`assistive-text ${ipError ? "active" : ""} `}>
                    Invalid format.
                  </div>
                </div>
              ) : (
                <div className="input g-c-3">
                  <label htmlFor="bed" className="label-container">
                    <p>{t("AddDeviceModal.Bed")}</p>
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
                  <div
                    className={`assistive-text ${bedError ? "active" : ""} `}
                  >
                    Oops! Something went wrong.
                  </div>
                </div>
              )}

              {/* Section */}
              <div
                className="input suffix g-c-3"
                onClick={handleSectionDropDownMenu}
                ref={addDropdownRef}
              >
                <label htmlFor="sectionInNewDevice" className="label-container">
                  <p>{t("AddDeviceModal.Section")}</p>
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
                    id="sectionInNewDevice"
                    placeholder={placeholderSection}
                    readOnly
                  />
                  <img
                    className="suffix active"
                    src="/src/assets/menu-down.svg"
                    alt="dropdown icon"
                  />
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
              <div
                className="input suffix g-c-3"
                onClick={handleFloorDropDownMenu}
                ref={addDropdownRef}
              >
                <label htmlFor="floorInNewDevice" className="label-container">
                  <p>{t("AddDeviceModal.Floor")}</p>
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
                    id="floorInNewDevice"
                    placeholder={placeholderFloor}
                    readOnly
                  />
                  <img
                    className="suffix active"
                    src="/src/assets/menu-down.svg"
                    alt="dropdown icon"
                  />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div
                  className={`list ${isFloorActive ? "active" : ""}`}
                  ref={dropdownFloorStyleRef}
                >
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
                <p className="btn-text pri-text">
                  {t("AddDeviceModal.Continue")}
                </p>
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
