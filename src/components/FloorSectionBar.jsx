import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";

function FloorSectionBar({ selectPort }) {
  {
    /* Fetch Floors API */
  }
  const [floors, setFloors] = useState([]);

  const fetchFloorList = async () => {
    try {
      const response = await fetch("api/7284/Floor", {
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
    handleFloorDropDownMenu;
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

  return (
    <>
      <div
        className="input dropdown floor suffix"
        onClick={handleFloorDropDownMenu}
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
            name="name"
            placeholder={placeholderFloor}
            readOnly
          />
          <img className="suffix active" src="" alt="dropdown icon" />
        </div>
        <div className="assistive-text">this is a line of assistive text</div>
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
      <div
        className="input dropdown section suffix"
        onClick={handleSectionDropDownMenu}
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
            name="name"
            placeholder={placeholderSection}
            readOnly
          />
          <img className="suffix active" src="" alt="dropdown icon" />
        </div>
        <div className="assistive-text">this is a line of assistive text</div>
        <div className={`list ${isSectionActive ? "active" : ""}`}>
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
