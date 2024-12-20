import React, { useState } from "react";
import { Outlet, Link, useLocation,useNavigate } from "react-router-dom";
import "/src/CSS/index.css";
import { useAuth } from "../JS/AuthContext";
import LogOut_Modal from "./Modals/LogOut";

function Navbar() {
  {
    /* nav link 字體反黑 */
  }
  const location = useLocation();

  {
    /* Account Setting Dropdown Menu Logic */
  }
  const [isActiveAccount, setActiveAccount] = useState(false);

  const handleMouseEnter = () => {
    setActiveAccount(true);
  };

  const handleMouseLeave = () => {
    setActiveAccount(false);
  };

  {/* Handle LogOut Overlay Visible */}
  const [isLogoutOverlayVisible, setLogOutOverlayVisible] = useState(false);

  const handleLogOutVisibleClick = (e) => {
      e.preventDefault();
      setLogOutOverlayVisible(!isLogoutOverlayVisible);
      setActiveAccount(false);

  };

  const { logout } = useAuth();

{
    /* useRef Logic */
  }

  return (
    <header>
      {/* UEXT LOGO */}
      <Link to="/home" className="nav-link">
        <img src="/src/assets/logo.svg" alt="UEXT Logo" className="logo" />
      </Link>

      {/* sub-pages */}
      <div className="navbar">
        <Link
          to="/home"
          className={`nav-link ${
            location.pathname.includes("/home") ? "active" : ""
          }`}
        >
          Home
        </Link>
        <Link
          to="/patient"
          className={`nav-link ${
            location.pathname.includes("/patient") ? "active" : ""
          }`}
        >
          Patient
        </Link>
        <Link
          to="/device"
          state={{ reload: true }}
          className={`nav-link ${
            location.pathname.includes("/device") ? "active" : ""
          }`}
        >
          Device
        </Link>
        <Link
          to="/account"
          className={`nav-link ${
            location.pathname.includes("/account") ? "active" : ""
          }`}
        >
          Account
        </Link>
      </div>

      {/* Settings */}
      <div className="other">
        <div className="lang">
          <img
            src="/src/assets/lang.svg"
            alt="language button"
            className="langBtn"
          />
          <div className="list">
            <a href="#" className="option active">
              <img src="/src/assets/check.svg" alt="" />
              English (Current)
            </a>
            <a href="index-chi.html" className="option">
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
            <div className="notice">
              <div className="title">Patient Exit Bed Notification</div>
              <div className="content">
                Chan Tai Ming (7/F, Zone A, Bed 113) just exit his bed.
              </div>
              <div className="time">Today 11:45</div>
              <img src="/src/assets/close.svg" alt="" className="close" />
              <div className="all-clear active">No more new updates </div>
            </div>
          </div>
        </div>
        {/* Account */}
        <div
          className={`setting ${isActiveAccount ? "active" : ""}`}
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
              <p>UEXT - Amy</p>
            </div>
            <a href="#" className="option setting">
              <img src="/src/assets/setting.svg" alt="" style={{width:"34px"}} />
              <p>Account Settings</p>
            </a>
            <a href="#" className="option pw" id="changePassword">
              <img src="/src/assets/lock.svg" alt="" />
              <p>Change Password</p>
            </a>
            <a className="option logout" onClick={handleLogOutVisibleClick}>
              <img src="/src/assets/logout.svg" alt="" />
              <p>Logout</p>
              {isLogoutOverlayVisible && <LogOut_Modal callback={handleLogOutVisibleClick} logout_callback = {logout}/>}
            </a>
          </div>
        </div>
        <img src="/src/assets/hanmburger.svg" alt="" className="hamburger" />
      </div>
    </header>
  );
}

export default Navbar;
