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
  const statusMap = {
    // 0 = Not specified
    // 1 = Resting on the bed
    // 2 = Sitting on the bed
    // 3 = Sitting on the bed edge
    // 4 = Leaving out bed
    // 5 = Unusual condition
    // 6 = Lying / Curled up on left side
    // 7 = Lying / Curled up on right side
    // 8 = Leaving out bed (bed exit rate)
    0: {
      imgUrl: "/src/assets/attention.svg",
      title: t("ConfirmAlertModal.h1-NotSpecifiedAlert"),
      containerColor: "in-progress",
    },
    1: {
      imgUrl: "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("ConfirmAlertModal.h1-RestOnBedAlert"),
    },
    2: {
      imgUrl: "src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("ConfirmAlertModal.h1-SitOnBedAlert"),
    },
    3: {
      imgUrl: "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("ConfirmAlertModal.h1-SitOnBedEdgeAlert"),
    },
    4: {
      imgUrl: "/src/assets/alert.svg",
      containerColor: "",
      title: t("ConfirmAlertModal.h1-BedExitAlert"),
    },
    5: {
      imgUrl: "/src/assets/alert.svg",
      containerColor: "",
      title: t("ConfirmAlertModal.h1-UnusualConditionAlert"),
    },
    6: {
      imgUrl: "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("ConfirmAlertModal.h1-LeftAlert"),
    },
    7: {
      imgUrl: "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("ConfirmAlertModal.h1-RightAlert"),
    },
    8: {
      imgUrl: "/src/assets/attention.svg",
      containerColor: "in-progress",
      title: t("ConfirmAlertModal.h1-AttentionAlert"),
    },
  };

  return (
    <>
      <div className="overlay alert-new active" onClick={handleWindowClick}>
        <div className="warn">
          <img
            className="icon"
            src={statusMap[alertDetail.status].imgUrl}
            alt="aler box in gray"
          />
          <h1 className="title">{statusMap[alertDetail.status].title}</h1>
          <p className="desc" style={{ margin: "10px 0px 20px 0px" }}>
            {t("ConfirmAlertModal.description-alert-p1", {
                    PatientName: alertDetail.userName,
                    BedNo: alertDetail.bedNo,
                  })
            }
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
