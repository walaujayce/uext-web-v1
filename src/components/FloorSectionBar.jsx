import React, { useState, useEffect } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";

function FloorSectionBar() {

    {/* Fetch Floors API */}
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
  useEffect(() => {fetchFloorList()}, []);

    {/* Floor Dropdown Menu Logic */}
  const [isFloorActive, SetFloorActive] = useState(false);
  const handleFloorDropDownMenu = ()=>{
    SetFloorActive((prev)=>!prev);
  }
  const [placeholderFloor, setPlaceholderFloor] = useState("9F"); // Input placeholder

  const handleFloorItemClick = (floor) => {
      setPlaceholderFloor(floor);
    SetFloorActive(false);
  };
   {/* Fetch Section API */}
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
   useEffect(() => {fetchSectionList()}, []);

       {/* Section Dropdown Menu Logic */}
  const [isSectionActive, SetSectionActive] = useState(false);
  const handleSectionDropDownMenu = ()=>{
    SetSectionActive((prev)=>!prev);
  }

  const [placeholderSection, setPlaceholderSection] = useState("Zone A"); // Input placeholder

    const handleSectionItemClick = (section) => {
        setPlaceholderSection(section);
      SetSectionActive(false);
    };

  return (
    <>
      <div className="input dropdown floor suffix">
        <label for="floor" className="label-container">
          <p>Floor</p>
          <img
            className="info"
            src="/src/assets/information-outline.svg"
            alt="gray outline information icon"
          />
        </label>
        <div className="input-gp" onClick={handleFloorDropDownMenu}>
          <input
            type="text"
            className="placeholder"
            id="name"
            name="name"
            placeholder={placeholderFloor}
            readOnly
          />
          <img className="suffix active" src="" alt="dropdown icon" />
        </div>
        <div className="assistive-text">this is a line of assistive text</div>
        <div className={`list ${isFloorActive ? "active" : ""}`}>
            {floors.map((floor)=>(
                <div className="item" key={floor.floorid} onClick={() => handleFloorItemClick(floor.description)}>{floor.description}</div>
            ))}
        </div>
      </div>
      <div className="input dropdown section suffix">
        <label for="section" className="label-container">
          <p>Section</p>
          <img
            className="info"
            src="/src/assets/information-outline.svg"
            alt="gray outline information icon"
          />
        </label>
        <div className="input-gp" onClick={handleSectionDropDownMenu}>
          <input
            type="text"
            className="placeholder"
            id="name"
            name="name"
            placeholder={placeholderSection}
            readOnly
          />
          <img className="suffix active" src="" alt="dropdown icon" />
        </div>
        <div className="assistive-text">this is a line of assistive text</div>
        <div className={`list ${isSectionActive ? "active" : ""}`}>
        {sections.map((section)=>(
                <div className="item" key={section.sectionid} onClick={() => handleSectionItemClick(section.description)}>{section.description}</div>
            ))}        </div>
      </div>
      <div className="input search">
      </div>
    </>
  );
}

export default FloorSectionBar;
