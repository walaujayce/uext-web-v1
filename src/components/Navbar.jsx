import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import "/src/CSS/index.css";

function Navbar() {
  const location = useLocation();
  return (
    <header>
      {/* UEXT LOGO */}
      <Link to="/home" className="nav-link">
        <img src="/src/assets/logo.svg" alt="UEXT Logo" className="logo" />
      </Link>

      {/* sub-pages */}
      <div className="navbar">
        <Link to="/home" 
        className={`nav-link ${location.pathname === "/home" ? "active" : ""}`}
        >Home</Link>
        <Link to="/patient" 
        className={`nav-link ${location.pathname === "/patient" ? "active" : ""}`}
        >Patient</Link>
        <Link to="/device" 
        className={`nav-link ${location.pathname === "/device" ? "active" : ""}`}
        >Device</Link>
        <Link to="/account" 
        className={`nav-link ${location.pathname === "/account" ? "active" : ""}`}
        >Account</Link>
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
          <img src="/src/assets/notice-active.svg" alt="" className="notiBtn" />
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
        <div className="setting">
          <img
            src="/src/assets/account-active.svg"
            alt=""
            className="settingBtn"
          />
          <div className="list">
            <div className="profile">
              <img src="/src/assets/account-active.svg" alt="" />
              <p>UEXT - Amy</p>
            </div>
            <a href="account.html" className="option acc">
              <img src="/src/assets/account.svg" alt="" />
              <p>Account Settings</p>
            </a>
            <a href="#" className="option pw" id="changePassword">
              <img src="/src/assets/lock.svg" alt="" />
              <p>Change Password</p>
            </a>
            <a href="#" className="option logout">
              <img src="/src/assets/logout.svg" alt="" />
              <p>Logout</p>
            </a>
          </div>
        </div>
        <img src="/src/assets/hanmburger.svg" alt="" className="hamburger" />
      </div>
    </header>
  );
}

export default Navbar;
