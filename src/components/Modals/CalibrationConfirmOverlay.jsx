import React, { useState, useEffect, useRef } from "react";
import "../Modals/overlay.css";
import { useTranslation } from "react-i18next";

function CalibrationConfirmOverlay({ callback, calibrationbtn_click }) {
  const { t, i18n } = useTranslation();

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

  return (
    <>
      <div className="overlay discharge active" onClick={handleWindowClick}>
        <div className="warn">
          <img
            className="icon"
            src="/src/assets/alert-box.svg"
            alt="alert box"
          />
          <h1 className="title">{t("CalibrationModal.description")}</h1>
          <p className="desc">
            {/* You will need to reconnect to a bed to obtain live data. */}
          </p>
          <div className="btn-gp">
            <a className="btn text-only pri" onClick={calibrationbtn_click}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text" style={{ color: "white" }}>
                {t("CalibrationModal.Confirm")}
              </p>
            </a>
            <a className="btn text-only outline sec" onClick={callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text sec-text">{t("CalibrationModal.Cancel")}</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default CalibrationConfirmOverlay;
