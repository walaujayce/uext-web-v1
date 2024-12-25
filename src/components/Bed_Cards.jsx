import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/index.css";
import React, { useState } from "react";
import AddNewPatient from "./Modals/AddNewPatient";

export function Bed_disconnect({ hold, macaddress, username, bed }) {
  return (
    <a className="bed disconnect" >
      <div className="b-num">{bed}&nbsp;</div>
      <div className="name">{username}&nbsp;</div>
      <div className="tag">
        <img src="" alt="" />
        <p className="timer">{hold}</p>
      </div>
      <div className="dis-tag">
        <img src="/src/assets/link-off.svg" alt="" />
        <p>Disconnected</p>
      </div>
      <img className="add" src="/src/assets/add.svg" alt="add icon" />
    </a>
  );
}

export function Bed_vacant({ bed, macaddress }) {
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const handleAddPatientClick = (e) => {
    e.preventDefault();
    setOverlayVisible(!isOverlayVisible);
  };
  return (
    <a className="bed vacant" onClick={handleAddPatientClick}>
      <div className="b-num">{bed}&nbsp;</div>
      <div className="name">Click to add patient</div>
      <div className="tag">
        <img src="" alt="" />
        <p className="timer">02:14:42</p>
      </div>
      <div className="dis-tag">
        <img src="/src/assets/link-off.svg" alt="" />
        <p>Disconnected</p>
      </div>
      <img className="add" src="/src/assets/add.svg" alt="add icon" />
      {isOverlayVisible && <AddNewPatient key={macaddress} mac={macaddress} callback={handleAddPatientClick} />}
    </a>
  );
}

export function Bed_default({ hold, macaddress, username, bed }) {
  return (
    <a className="bed default">
      <div className="b-num">{bed}&nbsp;</div>
      <div className="name">{username}&nbsp;</div>
      <div className="tag">
        <img src="" alt="" />
        <p className="timer">{hold}</p>
      </div>
      <div className="dis-tag">
        <img src="/src/assets/link-off.svg" alt="" />
        <p>Disconnected</p>
      </div>
      <img className="add" src="/src/assets/add.svg" alt="add icon" />
    </a>
  );
}

export function Bed_attention({ hold, macaddress, username, bed }) {
  return (
    <a className="bed attention">
      <div className="b-num">{bed}&nbsp;</div>
      <div className="name">{username}&nbsp;</div>
      <div className="tag">
        <img src="" alt="" />
        <p className="timer">{hold}</p>
      </div>
      <div className="dis-tag">
        <img src="/src/assets/link-off.svg" alt="" />
        <p>Disconnected</p>
      </div>
      <img className="add" src="/src/assets/add.svg" alt="add icon" />
    </a>
  );
}

export function Bed_alert({ hold, macaddress, username, bed }) {
  return (
    <a className="bed alert">
      <div className="b-num">{bed}&nbsp;</div>
      <div className="name">{username}&nbsp;</div>
      <div className="tag">
        <img src="" alt="" />
        <p className="timer">{hold}</p>
      </div>
      <div className="dis-tag">
        <img src="/src/assets/link-off.svg" alt="" />
        <p>Disconnected</p>
      </div>
      <img className="add" src="/src/assets/add.svg" alt="add icon" />
    </a>
  );
}
