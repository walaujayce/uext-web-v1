import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";
import { useTranslation } from "react-i18next";

const LogOut_Modal = ({ callback, logout_callback }) => {
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
      <div className="overlay logout active" onClick={handleWindowClick}>
        <div className="warn">
          <img
            className="icon"
            src="/src/assets/logout-active.svg"
            alt="logout icon"
          />
          <h1 className="title">{t('LogoutModal.LogoutTitle')}</h1>
          <p className="desc">{t('LogoutModal.Logout-p')}</p>
          <div className="btn-gp">
            <a className="btn text-only pri" onClick={logout_callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">{t('LogoutModal.Confirm')}</p>
            </a>
            <a className="btn text-only outline sec" onClick={callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text sec-text">{t('LogoutModal.Cancel')}</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogOut_Modal;
