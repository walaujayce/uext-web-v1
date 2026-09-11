import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/index.css";
import React from "react";
import { useTranslation } from "react-i18next";

export function Bed_disconnect({
  hold,
  macaddress,
  username,
  bed,
  deviceType,
}) {
  return (
    <div className="bed disconnect">
      <div className="b-num">{bed}&nbsp;</div>
      <div className="name">{username}&nbsp;</div>
      <div
        className="tag"
        style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}
      >
        <div
          className="notification-off"
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          <img src="" alt="" />
          <p className="timer" style={{ display: "block", color: "#CCCCCC" }}>
            {deviceType === 1 ? "UEXT" : "UMAP"}
          </p>
        </div>
        <div style={{ display: "none", alignItems: "center", gap: 4 }}>
          <img src="" alt="" />
          <p className="timer">{hold}</p>
        </div>
      </div>
      <div className="dis-tag">
        <img src="/src/assets/link-off.svg" alt="" />
        <p>Disconnected</p>
      </div>
      <img className="add" src="/src/assets/add.svg" alt="add icon" />
    </div>
  );
}

// 空床 = 這張床位還沒綁定裝置。點擊由父層決定要做什麼
// （首頁是開啟 AddNewBed modal 讓使用者綁裝置）。
export function Bed_vacant({ bed, onClick }) {
  const { t } = useTranslation();

  return (
    <div className="bed vacant" onClick={onClick}>
      <div className="b-num">{bed}&nbsp;</div>
      <div className="name">{t("Home.ClickToBindDevice")}</div>
      <div
        className="tag"
        style={{ flexDirection: "column", alignItems: "flex-end", gap: 4 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <img src="" alt="" />
          <p className="timer">&nbsp;</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <img src="" alt="" />
          <p className="timer">&nbsp;</p>
        </div>
      </div>
      <div className="dis-tag">
        <img src="/src/assets/link-off.svg" alt="" />
        <p>Disconnected</p>
      </div>
      <img className="add" src="/src/assets/add.svg" alt="add icon" />
    </div>
  );
}

export function Bed_default({ hold, macaddress, username, bed }) {
  return (
    <div className="bed default">
      <div className="b-num">{bed}&nbsp;</div>
      <div className="name">{username}&nbsp;</div>
      <div
        className="tag"
        style={{ flexDirection: "column", alignItems: "flex-end", gap: 4 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <img src="" alt="" />
          <p className="timer">{hold}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <img src="" alt="" />
          <p className="timer">{hold}</p>
        </div>
      </div>
      <div className="icon-tag">
        <img src="/src/assets/icon_homepage_rest.svg" alt="" />
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
      <div
        className="tag"
        style={{ flexDirection: "column", alignItems: "flex-end", gap: 4 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <img src="" alt="" />
          <p className="timer">{hold}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <img src="" alt="" />
          <p className="timer">{hold}</p>
        </div>
      </div>
      <div className="icon-tag">
        <img src="/src/assets/icon_homepage_edge.svg" alt="" />
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
      <div
        className="tag"
        style={{ flexDirection: "column", alignItems: "flex-end", gap: 4 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <img src="" alt="" />
          <p className="timer">{hold}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <img src="" alt="" />
          <p className="timer">{hold}</p>
        </div>
      </div>
      <div className="icon-tag">
        <img src="/src/assets/icon_homepage_exit.svg" alt="" />
      </div>
      <div className="dis-tag">
        <img src="/src/assets/link-off.svg" alt="" />
        <p>Disconnected</p>
      </div>
      <img className="add" src="/src/assets/add.svg" alt="add icon" />
    </div>
  );
}
export function Bed_Online({
  hold,
  macaddress,
  username,
  bed,
  pos,
  color,
  deviceType,
  isAlertSet = false,
}) {
  // POS
  let imgURL = "";
  if (deviceType === 1) {
    switch (pos || 0) {
      case 1:
        imgURL = "/src/assets/icon_homepage_rest.svg";
        break;
      case 2:
        imgURL = "/src/assets/icon_homepage_sitting.svg";
        break;
      case 3:
        imgURL = "/src/assets/icon_homepage_edge.svg";
        break;
      case 4:
        imgURL = "/src/assets/icon_homepage_exit.svg";
        break;
      case 6:
        imgURL = "/src/assets/icon_homepage_rest.svg";
        break;
      case 7:
        imgURL = "/src/assets/icon_homepage_rest.svg";
        break;
      default:
        imgURL = "/src/assets/icon_homepage_exit.svg";
    }
  } else {
    switch (pos || 0) {
      case 1:
        imgURL = "/src/assets/icon_homepage_rest.svg";
        break;
      case 2:
        imgURL = "/src/assets/icon_homepage_sitting.svg";
        break;
      case 3:
        imgURL = "/src/assets/icon_homepage_edge.svg";
        break;
      case 4:
        imgURL = "/src/assets/icon_homepage_exit.svg";
        break;
      case 6:
        imgURL = "/src/assets/icon_homepage_left.svg";
        break;
      case 7:
        imgURL = "/src/assets/icon_homepage_right.svg";
        break;
      default:
        imgURL = "/src/assets/icon_homepage_exit.svg";
    }
  }

  // COLOR
  let bedColor = "";
  switch (color) {
    case 0:
      bedColor = "default";
      break;
    case 1:
      bedColor = "alert";
      break;
    case 2:
      bedColor = "attention";
      break;
    default:
      bedColor = "default";
  }
  return (
    <div className={`bed ${bedColor}`}>
      <div className="b-num">{bed}&nbsp;</div>
      <div className="name">{username}&nbsp;</div>
      <div
        className="tag"
        style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}
      >
        <div
          className={`${isAlertSet ? "notification-on" : "notification-off"}`}
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          <img src="" alt="" />
          <p
            className="timer"
            style={{
              display: bedColor === "default" ? "block" : "",
              color: "white",
            }}
          >
            {deviceType === 1 ? "UEXT" : "UMAP"}
          </p>
        </div>
        {/* <div style={{ display: "flex", alignItems: "center", gap: 4 }}> */}
        <div style={{ display: (bedColor === "default" && deviceType === 1) ? "none" : "flex", alignItems: "center", gap: 4, paddingLeft: bedColor === "default" ? "3px" : "0px" }}>
          <img src="" alt="" />
          <p className="timer">{hold}</p>
        </div>
      </div>
      <div className="icon-tag">
        <img src={imgURL} alt="" />
      </div>
      <div className="dis-tag">
        <img src="/src/assets/link-off.svg" alt="" />
        <p>Disconnected</p>
      </div>
      <img className="add" src="/src/assets/add.svg" alt="add icon" />
    </div>
  );
}
