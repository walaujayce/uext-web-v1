import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";
import { useTranslation } from "react-i18next";

const AlertConfirmOverlay = ({
  callback,
  confirmAlert_callback,
  alertDetail,
}) => {
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
      <div class="overlay alert-new active" onClick={handleWindowClick}>
        <div class="warn">
          <img
            class="icon"
            src={`${
              alertDetail.status === 3
                ? "/src/assets/attention.svg"
                : "/src/assets/alert.svg"
            }`}
            alt="aler box in gray"
          />
          <h1 class="title">{`${
            alertDetail.status === 3 ? t('ConfirmAlertModal.h1-attention') :t('ConfirmAlertModal.h1-alert')
          }`}</h1>
          <p class="desc" style={{margin:"10px 0px 20px 0px"}}>
          {`${
            alertDetail.status === 3 ? t('ConfirmAlertModal.description-attention-p1',{PatientName: alertDetail.userName , BedNo: alertDetail.bedNo}) :t('ConfirmAlertModal.description-alert-p1',{PatientName: alertDetail.userName , BedNo: alertDetail.bedNo})
          }`}
            <br /> {t('ConfirmAlertModal.description-alert-p2')}
          </p>
          <div class="btn-gp">
            <a class="btn text-only pri" onClick={confirmAlert_callback}>
              <img src="" alt="" class="prefix" />
              <p class="btn-text pri-text">{t('ConfirmAlertModal.GotIt')}</p>
            </a>
            <a className="btn text-only outline sec" onClick={callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text sec-text">{t('ConfirmAlertModal.Cancel')}</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertConfirmOverlay;
