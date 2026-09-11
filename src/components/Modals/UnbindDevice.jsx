import React from "react";
import "../Modals/overlay.css";
import { useTranslation } from "react-i18next";

// 解除床位與裝置綁定的二次確認（版型沿用 DisChargePatient 的 .overlay .warn）
function UnbindDevice({ callback, unbindbtn_click }) {
  const { t } = useTranslation();

  {
    /* Handle Overlay Logic */
  }
  const handleWindowClick = (e) => {
    // Prevent event propagation to the overlay
    e.stopPropagation();
  };

  return (
    <>
      <div className="overlay unbind active" onClick={handleWindowClick}>
        <div className="warn">
          <img
            className="icon"
            src="/src/assets/alert-box.svg"
            alt="alert box"
          />
          <h1 className="title">{t("UnbindDeviceModal.description")}</h1>
          <p className="desc">{t("UnbindDeviceModal.note")}</p>
          <div className="btn-gp unbind">
            <a className="btn text-only pri" onClick={unbindbtn_click}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text unbind-text">
                {t("UnbindDeviceModal.Unbind")}
              </p>
            </a>
            <a className="btn text-only outline sec" onClick={callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text sec-text">
                {t("UnbindDeviceModal.Cancel")}
              </p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default UnbindDevice;
