import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import "/src/CSS/index.css";
import { useAuth } from "../JS/AuthContext";
import LogOut_Modal from "./Modals/LogOut";
import { useTranslation } from "react-i18next";
import ChangePasswordModal from "./Modals/ChangePassword";

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
  const [isActiveAccount, setActiveAccount] = useState(false);

  const handleMouseEnterLang = () => {
    setLangAccount(true);
  };
  const handleMouseLeaveLang = () => {
    setLangAccount(false);
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
    /* Get User ID */
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
          <div className="notification">
            <img src="/src/assets/notice.svg" alt="" className="notiBtn" />
            <div className="list">
              <div className="notice">
                <div className="title">Patient Exit Bed Notification</div>
                <div className="content">
                  Chan Tai Ming (7/F, Zone A, Bed 113) just exit his bed.
                </div>
                <div className="time">Today 11:45</div>
                <img src="/src/assets/close.svg" alt="" className="close" />
              </div>
              <div className="notice">
                <div className="title">Patient Exit Bed Notification</div>
                <div className="content">
                  Chan Tai Ming (7/F, Zone A, Bed 113) just exit his bed.
                </div>
                <div className="time">Today 11:45</div>
                <img src="/src/assets/close.svg" alt="" className="close" />
              </div>
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
                <img src="/src/assets/lock.svg"  className="setting-img"
                    style={{ width: "34px" }} alt="" />
                <p>{t("Navbar.ChangePassword")}</p>
              </a>
              <a className="option logout" onClick={handleLogOutVisibleClick}>
                <img src="/src/assets/logout.svg" alt=""  className="setting-img"
                    style={{ width: "34px" }}/>
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
