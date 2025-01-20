import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/index.css";
import React, { useEffect, useState, useRef } from "react";
import AddNewPatient from "./Modals/AddNewPatient";
import { useTranslation } from "react-i18next";

export function Bed_disconnect({ hold, macaddress, username, bed }) {
  return (
    <div className="bed disconnect">
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
    </div>
  );
}

export function Bed_vacant({ bed, macaddress }) {
  const { t, i18n } = useTranslation();

  const [isOverlayVisible, setOverlayVisible] = useState(false);
  
  const handleAddPatientClick = (e) => {
    e.preventDefault();
    setOverlayVisible(!isOverlayVisible);
  };

  const isInitialRender = useRef(true);
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false; // Mark initial render as completed
      return;
    }
    console.log("overlay visible is called!");
  }, [isOverlayVisible]);
  
  return (
    <div className="bed vacant" onClick={handleAddPatientClick}>
      <div className="b-num">{bed}&nbsp;</div>
      <div className="name">{t("AddPatientModal.ClickToAddPatient")}</div>
      <div className="tag">
        <img src="" alt="" />
        <p className="timer">02:14:42</p>
      </div>
      <div className="dis-tag">
        <img src="/src/assets/link-off.svg" alt="" />
        <p>Disconnected</p>
      </div>
      <img className="add" src="/src/assets/add.svg" alt="add icon" />
      {isOverlayVisible && (
        <AddNewPatient
          key={macaddress}
          mac={macaddress}
          callback={handleAddPatientClick}
        />
      )}
    </div>
  );
}

export function Bed_default({ hold, macaddress, username, bed }) {
  return (
    <div className="bed default">
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
    </div>
  );
}

export function Bed_attention({ hold, macaddress, username, bed }) {
  return (
    <div className="bed attention">
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
    </div>
  );
}

export function Bed_alert({ hold, macaddress, username, bed }) {
  return (
    <div className="bed alert">
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
    </div>
  );
}
