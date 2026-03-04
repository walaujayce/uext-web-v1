import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "../LoadingOverlay";
import PatientAlerts from "../PatientAlerts";

const AlertBatchSetting = ({ callback, patientIDs }) => {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

  {
    /* Handle Overlay Logic */
  }
  const handleWindowClick = (e) => {
    // Prevent event propagation to the overlay
    e.stopPropagation();
  };
  // useEffect(()=>{
  //   console.log("alertbatchsetting: ", patientIDs);
  // }, [patientIDs]);

  return (
    <>
      <SimpleBackdrop open={loading} />

      <div
        className="addDevice"
        style={{ display: "block" }}
        onClick={handleWindowClick}
      >
        <div className="window">
          <a onClick={callback}>
            <img
              src="/src/assets/close.svg"
              alt="close icon"
              className="close"
            />
          </a>
          <img src="/src/assets/link-active.svg" alt="" className="icon" />
          <div className="tab-list">
            <a href="#" className="tab active tab-1">
              {t("AlertBatchSetting.Title")}
            </a>
            {/* <a href="#" className="tab tab-2">Device Connection</a> */}
          </div>
          {/* Device Profile */}
          <div className="" style={{ width: "100%" }}>
            <PatientAlerts patientIDs={patientIDs} isBatch={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertBatchSetting;
