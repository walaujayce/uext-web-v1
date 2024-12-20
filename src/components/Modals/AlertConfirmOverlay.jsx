import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";

const AlertConfirmOverlay = ({ callback, confirmAlert_callback }) => {
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
            src="/src/assets/alert-box.svg"
            alt="aler box in gray"
          />
          <h1 class="title">Exit Bed Alert</h1>
          <p class="desc">
            Patient at 7/F, Zone A, Bed 113 left his bed, please follow up as
            soon as possible.
          </p>
          <div class="btn-gp">
            <a class="btn text-only pri" onClick={confirmAlert_callback}>
              <img src="" alt="" class="prefix" />
              <p class="btn-text pri-text">Got it</p> 
            </a>
            <a className="btn text-only outline sec" onClick={callback}>
                    <img src="" alt="" className="prefix"/>
                    <p className="btn-text sec-text">Cancel</p>
                </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertConfirmOverlay;
