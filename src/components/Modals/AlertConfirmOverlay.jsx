import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../JS/AuthContext";

const AlertConfirmOverlay = ({
  callback,
  confirmAlert_callback,
  alertDetail,
  imgUrl,
  confirmTitle
}) => {
  const { t, i18n } = useTranslation();
  const {isDarkMode} = useAuth();

  {
    /* Handle Overlay Logic */
  }
  const handleWindowClick = (e) => {
    // Prevent event propagation to the overlay
    e.stopPropagation();
  };


  return (
    <>
      <div className="overlay alert-new active" onClick={handleWindowClick}>
        <div className="warn">
          <img
            className="icon"
            src={imgUrl}
            alt="aler box in gray"
          />
          <h1 className="title">{confirmTitle}</h1>
          <p className="desc" style={{ margin: "10px 0px 20px 0px" }}>
            {t("ConfirmAlertModal.description-alert-p1", {
              PatientName: alertDetail.userName,
              BedNo: alertDetail.bedNo,
            })}
            <br /> {t("ConfirmAlertModal.description-alert-p2")}
          </p>
          <div className="btn-gp">
            <a className="btn text-only pri" onClick={confirmAlert_callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">
                {t("ConfirmAlertModal.GotIt")}
              </p>
            </a>
            <a className="btn text-only outline sec" onClick={callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text sec-text">
                {t("ConfirmAlertModal.Cancel")}
              </p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertConfirmOverlay;
