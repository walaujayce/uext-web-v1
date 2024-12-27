import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import { useTranslation } from "react-i18next";

function FloorSectionBar({ selectPort,selectFloor,selectSection }) {
      const { t, i18n } = useTranslation();
  
  {
    /* Fetch Floors API */
  }
  const [floors, setFloors] = useState([]);

  const fetchFloorList = async () => {
    try {
      const response = await fetch("/api/7284/Floor", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setFloors(data);
      const floorToSet = data.find((floor) => floor.floorid === 0);
      if (floorToSet) {
        setPlaceholderFloor(floorToSet.description);
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
    selectFloor(floor); //call back to list filter
    handleFloorDropDownMenu;
  };
  {
    /* Fetch Section API */
  }
  const [sections, setSections] = useState([]);

  const fetchSectionList = async () => {
    try {
      const response = await fetch("/api/7284/Section");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setSections(data);
      const sectionToSet = data.find((section) => section.sectionid === 0);
      if (sectionToSet) {
        setPlaceholderSection(sectionToSet.description);
      }
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
    selectSection(section);
    handleSectionDropDownMenu;
  };
  {
    /* Port Dropdown Menu Logic */
  }
  const ports = ["7284", "7285", "8031"];
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

  // Use the custom hook for both dropdowns
  useDynamicDropdownHeight(dropdownFloorStyleRef, isFloorActive);
  useDynamicDropdownHeight(dropdownSectionStyleRef, isSectionActive);

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
            placeholder={placeholderFloor}
            readOnly
          />
          <img className="suffix active" src="" alt="dropdown icon" />
        </div>
        <div className="assistive-text">this is a line of assistive text</div>
        <div className={`list ${isFloorActive ? "active" : ""}`} ref={dropdownFloorStyleRef}>
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
            placeholder={placeholderSection}
            readOnly
          />
          <img className="suffix active" src="" alt="dropdown icon" />
        </div>
        <div className="assistive-text">this is a line of assistive text</div>
        <div className={`list ${isSectionActive ? "active" : ""}`} ref={dropdownSectionStyleRef}>
          {sections.map((section) => (
            <div
              className="item"
              key={section.sectionid}
              onClick={() => handleSectionItemClick(section.description)}
            >
              {section.description}
            </div>
          ))}
        </div>
      </div>
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
