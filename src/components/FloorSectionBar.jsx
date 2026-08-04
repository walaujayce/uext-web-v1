import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import { useTranslation } from "react-i18next";
import { useFloorSection } from "../JS/FloorSectionContext";

function FloorSectionBar({ selectPort,selectFloor,selectSection, selectDeviceType, enableDeviceType }) {
      const { t, i18n } = useTranslation();

  {
    /* Floor / Section data from global context (來源: /api/7284/IpAddress/all)
       section 會依照目前選取的 floor 連動 (cascade) */
  }
  const { floors, sections, floor, section, setSection, chooseFloor } =
    useFloorSection();

  {
    /* Floor Dropdown Menu Logic */
  }
  const [isFloorActive, setFloorActive] = useState(false);
  const handleFloorDropDownMenu = () => {
    setFloorActive((prev) => !prev);
  };

  const handleFloorItemClick = (nextFloor) => {
    // 換樓層時，context 會把 section 重設成該樓層的第一個區域
    const firstSection = chooseFloor(nextFloor);
    selectFloor?.(nextFloor); // call back to list filter
    selectSection?.(firstSection);
    // setFloorActive(false);
    handleFloorDropDownMenu;
  };

  {
    /* Section Dropdown Menu Logic */
  }
  const [isSectionActive, setSectionActive] = useState(false);
  const handleSectionDropDownMenu = () => {
    setSectionActive((prev) => !prev);
  };

  const handleSectionItemClick = (nextSection) => {
    setSection(nextSection);
    selectSection?.(nextSection);
    // setSectionActive(false);
    handleSectionDropDownMenu;
  };

  {
    /* 初次載入時，把 context 預設的第一個 floor / section 通知父層做篩選（只觸發一次） */
  }
  const didInitDefaults = useRef(false);
  useEffect(() => {
    if (!didInitDefaults.current && floor && section) {
      didInitDefaults.current = true;
      selectFloor?.(floor);
      selectSection?.(section);
    }
  }, [floor, section]);
  {
    /* Port Dropdown Menu Logic */
  }
  const ports = ["7284", "8031"];
  const [isPortActive, setPortActive] = useState(false);
  const handlePortDropDownMenu = () => {
    setPortActive((prev) => !prev);
  };

  const [placeholderPort, setPlaceholderPort] = useState("7284"); // Input placeholder

  const handlePortItemClick = (port) => {
    setPlaceholderPort(port);
    setPortActive;
    selectPort(port);
  };
    {
    /* DeviceType Dropdown Menu Logic */
  }
  const deviceTypes = ["All", "Not specified", "UEXT", "UMAP", "UNC", "HaLow-R"];

  const deviceTypeToIndex = (deviceType) =>{
    switch(deviceType) {
      case "Not specified":
        return 0;
      case "UEXT":
        return 1;
      case "UMAP":
        return 2;
      case "UNC":
        return 3;
      case "HaLow-R":
        return 201;
      default:
        return 'All'; // Not found or not specified
      }
    };

  const [isDeviceTypeActive, setDeviceTypeActive] = useState(false);
  const handleDeviceTypeDropDownMenu = () => {
    setDeviceTypeActive((prev) => !prev);
  };
  const [placeholderDeviceType, setPlaceholderDeviceType] = useState(deviceTypes[0]); // Input placeholder

  const handleDeviceTypeItemClick = (deviceType) => {
    setPlaceholderDeviceType(deviceType);
    selectDeviceType(deviceTypeToIndex(deviceType));
    handleDeviceTypeDropDownMenu;
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
        setPortActive(false);
        setDeviceTypeActive(false);
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
  const dropdownFloorStyleRef = useRef(null);
  const dropdownSectionStyleRef = useRef(null);
  const dropdownDeviceTypeStyleRef = useRef(null);

  // Use the custom hook for both dropdowns
  useDynamicDropdownHeight(dropdownFloorStyleRef, isFloorActive);
  useDynamicDropdownHeight(dropdownSectionStyleRef, isSectionActive);
  useDynamicDropdownHeight(dropdownDeviceTypeStyleRef, isDeviceTypeActive );

  return (
    <>
      <div
        className="input dropdown floor suffix"
        onClick={handleFloorDropDownMenu}
        ref={addDropdownRef}
      >
        <label htmlFor="floor" className="label-container">
          <p>{t('FloorSection.Floor')}</p>
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
            name="name"
            placeholder={floor || ""}
            readOnly
          />
          <img className="suffix active" src="" alt="dropdown icon" />
        </div>
        <div className="assistive-text">this is a line of assistive text</div>
        <div className={`list ${isFloorActive ? "active" : ""}`} ref={dropdownFloorStyleRef}>
          {floors.map((floor) => (
            <div
              className="item"
              key={floor}
              onClick={() => handleFloorItemClick(floor)}
            >
              {floor}
            </div>
          ))}
        </div>
      </div>
      <div
        className="input dropdown section suffix"
        onClick={handleSectionDropDownMenu}
        ref={addDropdownRef}
      >
        <label htmlFor="section" className="label-container">
          <p>{t('FloorSection.Section')}</p>
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
            name="name"
            placeholder={section || ""}
            readOnly
          />
          <img className="suffix active" src="" alt="dropdown icon" />
        </div>
        <div className="assistive-text">this is a line of assistive text</div>
        <div className={`list ${isSectionActive ? "active" : ""}`} ref={dropdownSectionStyleRef}>
          {sections.map((section) => (
            <div
              className="item"
              key={section}
              onClick={() => handleSectionItemClick(section)}
            >
              {section}
            </div>
          ))}
        </div>
      </div>
      {enableDeviceType && (
      <div
        className="input dropdown floor suffix"
        onClick={handleDeviceTypeDropDownMenu}
        ref={addDropdownRef}
      >
        <label htmlFor="deviceType" className="label-container">
          <p>{t('FloorSection.DeviceType')}</p>
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
            id="deviceType"
            name="name"
            placeholder={placeholderDeviceType}
            readOnly
          />
          <img className="suffix active" src="" alt="dropdown icon" />
        </div>
        <div className="assistive-text">this is a line of assistive text</div>
        <div className={`list ${isDeviceTypeActive ? "active" : ""}`} ref={dropdownDeviceTypeStyleRef}>
          {deviceTypes.map((deviceType) => (
            <div
              className="item"
              key={deviceType}
              onClick={() => handleDeviceTypeItemClick(deviceType)}
            >
              {deviceType}
            </div>
          ))}
        </div>
      </div>)}
      {/* <div
        className="input dropdown port suffix"
        onClick={handlePortDropDownMenu}
        ref={addDropdownRef}
      >
        <label htmlFor="port" className="label-container">
          <p>Port</p>
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
            id="port"
            name="name"
            placeholder={placeholderPort}
            readOnly
          />
          <img className="suffix active" src="" alt="dropdown icon" />
        </div>
        <div className="assistive-text">this is a line of assistive text</div>
        <div className={`list ${isPortActive ? "active" : ""}`}>
          {ports.map((port) => (
            <div
              className="item"
              key={port}
              onClick={() => handlePortItemClick(port)}
            >
              {port}
            </div>
          ))}
        </div>
      </div> */}
      <div className="input search"></div>
    </>
  );
}

export default FloorSectionBar;
