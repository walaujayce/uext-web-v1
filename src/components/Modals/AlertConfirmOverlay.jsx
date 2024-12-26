import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";

const AlertConfirmOverlay = ({
  callback,
  confirmAlert_callback,
  alertDetail,
}) => {
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
            alertDetail.status === 3 ? "Attention Alert" : "Bed Exit Alert"
          }`}</h1>
          <p class="desc">
            {`Bed ${alertDetail.bedNo || "--"}, ${
              alertDetail.userName || "Patient"
            } ${
              alertDetail.status === 3 ? "is too near on bed edge" : "has left bed"
            }, please follow up as soon as possible.`}
          </p>
          <div class="btn-gp">
            <a class="btn text-only pri" onClick={confirmAlert_callback}>
              <img src="" alt="" class="prefix" />
              <p class="btn-text pri-text">Got it</p>
            </a>
            <a className="btn text-only outline sec" onClick={callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text sec-text">Cancel</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertConfirmOverlay;
