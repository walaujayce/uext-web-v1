import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import "/src/CSS/index.css";
import { useAuth } from "../JS/AuthContext";
import LogOut_Modal from "./Modals/LogOut";
import { useTranslation } from "react-i18next";
import ChangePasswordModal from "./Modals/ChangePassword";
import dayjs from "dayjs";

function Navbar() {
  const { t, i18n } = useTranslation();

  const { logout, role } = useAuth();

  const [currentLang, setCurrentLang] = useState("zh");

  const [userName, setUserName] = useState("");

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Change the active language
    localStorage.setItem("i18nextLng", lng); // Persist the language to localStorage
    setCurrentLang(lng); // Update the current language state
  };

  useEffect(() => {
    const lang = localStorage.getItem("i18nextLng");
    if (lang) {
      changeLanguage(lang);
    } else {
      changeLanguage("zh");
    }
    setUserName(JSON.parse(localStorage.getItem("username")));
  }, []);
  {
    /* nav link 字體反黑 */
  }
  const location = useLocation();

  {
    /* Account Setting Dropdown Menu Logic */
  }
  const [isActiveLang, setLangAccount] = useState(false);
  const [isActiveNotification, setActiveNotification] = useState(false);
  const [isActiveAccount, setActiveAccount] = useState(false);

  const handleMouseEnterLang = () => {
    setLangAccount(true);
  };
  const handleMouseLeaveLang = () => {
    setLangAccount(false);
  };
  const handleMouseEnterNotification = () => {
    setActiveNotification(true);
  };
  const handleMouseLeaveNotification = () => {
    setActiveNotification(false);
  };
  const handleMouseEnter = () => {
    setActiveAccount(true);
  };
  const handleMouseLeave = () => {
    setActiveAccount(false);
  };

  {
    /* Handle LogOut Overlay Visible */
  }
  const [isLogoutOverlayVisible, setLogOutOverlayVisible] = useState(false);

  const handleLogOutVisibleClick = (e) => {
    e.preventDefault();
    setLogOutOverlayVisible(!isLogoutOverlayVisible);
    setActiveAccount(false);
  };
  {
    /* Handle Change Password Overlay Visible */
  }
  const [isChangePasswordOverlayVisible, setChangePasswordOverlayVisible] =
    useState(false);

  const handleChangePasswordVisibleClick = (e) => {
    e.preventDefault();
    setChangePasswordOverlayVisible(!isChangePasswordOverlayVisible);
    setActiveAccount(false);
  };
  {
    /* Get User ID for account setting */
  }
  const [selected_user_id, setSelectedUserId] = useState("");
  useEffect(() => {
    async function fetchData() {
      try {
        // Get userid based on username in local storage
        const response = await fetch("/api/7284/User", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const stored_username = JSON.parse(localStorage.getItem("username"));
        const selected_user = data.find(
          (user) => user.username == stored_username
        );
        setSelectedUserId(selected_user.userid);
      } catch (error) {
        console.error("Error updating password:", error.message);
      }
    }
    fetchData();
  }, []);

  {
    /* Notification */
  }
  const [errorlogs, setErrorlogs] = useState([]);

  // extract log content
  function extractContent(log) {
    const match = log.match(/(?:\s|^)([A-F0-9]{12})\s([^,]*)/);
    return match ? match[2].trim() : null;
  }
  //format logtime format
  function formatLogTime(logtime) {
    const date = new Date(logtime); // Parse the UTC time
    const utc8Date = new Date(date.getTime() + 8 * 60 * 60 * 1000); // Convert to UTC+8

    // Get local date in UTC+8 format
    const localDate = new Date();
    const localUtc8Date = new Date(localDate.getTime() + 0 * 60 * 60 * 1000);

    // Extract date parts
    const logYear = utc8Date.getFullYear();
    const logMonth = String(utc8Date.getMonth() + 1).padStart(2, "0");
    const logDay = String(utc8Date.getDate()).padStart(2, "0");

    const localYear = localUtc8Date.getFullYear();
    const localMonth = String(localUtc8Date.getMonth() + 1).padStart(2, "0");
    const localDay = String(localUtc8Date.getDate()).padStart(2, "0");

    // Extract time part
    const formattedTime = utc8Date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Ensure 24-hour format
    });

    // Compare the dates
    if (
      logYear === localYear &&
      logMonth === localMonth &&
      logDay === localDay
    ) {
      return `${t("Navbar.Notification-date-today")} ${formattedTime}`;
    } else {
      return `${logYear}-${logMonth}-${logDay} ${formattedTime}`;
    }
  }

  // get device type
  const getDeviceType = (devicetype) => {
    switch (devicetype) {
      case 0:
        return "UNDEFINED";
      case 1:
        return "UEXT";
      case 2:
        return "UMAP";
      case 3:
        return "UNC";
      default:
        return "UNDEFINED";
    }
  };
  useEffect(() => {
    async function fetchErrorlog() {
      try {
        // Get userid based on username in local storage
        const response = await fetch("/api/7284/db/Errorlog", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("error log: ", data);
        setErrorlogs(data);
      } catch (error) {
        console.error("Error :", error.message);
      }
    }
    fetchErrorlog();
  }, []);

  {
    /* PUT API set Checkstatus */
  }
  const requestbody_PUT = {
    checkStatus: true,
  };
  const setNotificationChecked_PUT = async (notification_Id) => {
    try {
      const response = await fetch(`/api/7284/db/Errorlog/${notification_Id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestbody_PUT), // Convert the requestBody to JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.code !== 0) {
        console.log(data.message);
        return;
      }
      console.log("Notification is set CHECKED successfully:", data);

      // Remove the dismissed notification from state
      setErrorlogs((prevLogs) =>
        prevLogs.filter((errorlog) => errorlog.guid !== notification_Id)
      );
    } catch (error) {
      console.error("Error updating device:", error.message);
    }
  };

  return (
    <>
      <header>
        {/* UEXT LOGO */}
        <Link to="/home" className="nav-link">
          <img
            src="/src/assets/uneo-logo.svg"
            alt="UEXT Logo"
            className="logo"
          />
        </Link>

        {/* sub-pages */}
        <div className="navbar">
          <Link
            to="/home"
            className={`nav-link ${
              location.pathname.includes("/home") ? "active" : ""
            }`}
          >
            {t("Navbar.Home")}
          </Link>
          <Link
            to="/patient"
            className={`nav-link ${
              location.pathname.includes("/patient") ? "active" : ""
            }`}
          >
            {t("Navbar.Patient")}
          </Link>
          <Link
            to="/device"
            state={{ reload: true }}
            className={`nav-link ${
              location.pathname.includes("/device") ? "active" : ""
            }`}
          >
            {t("Navbar.Device")}
          </Link>
          {role === "administrator" && (
            <Link
              to="/account"
              className={`nav-link ${
                location.pathname.includes("/account") ? "active" : ""
              }`}
            >
              {t("Navbar.Account")}
            </Link>
          )}
        </div>

        {/* Settings */}
        <div className="other">
          <div
            className={`lang ${isActiveLang ? "" : ""}`}
            onMouseEnter={handleMouseEnterLang}
            onMouseLeave={handleMouseLeaveLang}
          >
            <img
              src="/src/assets/lang.svg"
              alt="language button"
              className="langBtn"
            />
            <div className={`list ${isActiveLang ? "active" : ""}`}>
              <a
                href="#"
                className="option"
                onClick={() => changeLanguage("en")}
              >
                <img
                  src="/src/assets/check.svg"
                  alt=""
                  style={{ display: currentLang === "en" ? "flex" : "none" }}
                />
                English
              </a>
              <a
                href="#"
                className="option"
                onClick={() => changeLanguage("zh")}
              >
                <img
                  src="/src/assets/check.svg"
                  alt=""
                  style={{ display: currentLang === "en" ? "none" : "flex" }}
                />
                繁體中文
              </a>
            </div>
          </div>
          <div
            className="notification"
            onMouseEnter={handleMouseEnterNotification}
            onMouseLeave={handleMouseLeaveNotification}
          >
            <img src="/src/assets/notice.svg" alt="" className="notiBtn" />
            <div className={`list ${isActiveNotification ? "active" : ""}`}>
              {errorlogs
                .filter((errorlog) => /connected|offline/i.test(errorlog.log))
                .filter((errorlog) => errorlog.checkStatus === false)
                .map((errorlog) => (
                  <div className="notice" key={errorlog.guid}>
                    <div className="title">
                      {getDeviceType(errorlog.deviceType)} {errorlog.deviceid}
                    </div>
                    <div className="content">
                      {extractContent(errorlog.log)}
                    </div>
                    <div className="time">
                      {formatLogTime(errorlog.logtime)}
                    </div>
                    <img
                      src="/src/assets/close.svg"
                      alt=""
                      className="close"
                      onClick={() => setNotificationChecked_PUT(errorlog.guid)}
                    />
                  </div>
                ))}
              <div className="all-clear active">No more new updates </div>
            </div>
          </div>
          {/* Account */}
          <div
            className="setting"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src="/src/assets/account-active.svg"
              alt=""
              className="settingBtn"
            />
            <div className={`list ${isActiveAccount ? "active" : ""}`}>
              <div className="profile">
                <img src="/src/assets/account-active.svg" alt="" />
                <p>{userName}</p>
              </div>
              <Link
                to={`/account/account-settings?userid=${selected_user_id}`}
                key={selected_user_id}
              >
                <a href="#" className="option setting">
                  <img
                    src="/src/assets/setting.svg"
                    alt=""
                    className="setting-img"
                    style={{ width: "34px" }}
                  />
                  <p>{t("Navbar.AccountSettings")}</p>
                </a>
              </Link>
              <a
                href="#"
                className="option pw"
                id="changePassword"
                onClick={handleChangePasswordVisibleClick}
              >
                <img
                  src="/src/assets/lock.svg"
                  className="setting-img"
                  style={{ width: "34px" }}
                  alt=""
                />
                <p>{t("Navbar.ChangePassword")}</p>
              </a>
              <a className="option logout" onClick={handleLogOutVisibleClick}>
                <img
                  src="/src/assets/logout.svg"
                  alt=""
                  className="setting-img"
                  style={{ width: "34px" }}
                />
                <p>{t("Navbar.Logout")}</p>
              </a>
            </div>
          </div>
          <img src="/src/assets/hanmburger.svg" alt="" className="hamburger" />
        </div>
      </header>
      {/* Overlay */}
      <div>
        {isChangePasswordOverlayVisible && (
          <ChangePasswordModal callback={handleChangePasswordVisibleClick} />
        )}
        {isLogoutOverlayVisible && (
          <LogOut_Modal
            callback={handleLogOutVisibleClick}
            logout_callback={logout}
          />
        )}
      </div>
    </>
  );
}

export default Navbar;
