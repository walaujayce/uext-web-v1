import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/panel-list.css";
import { Link } from "react-router-dom";
import SignalRService from "../JS/SignalR";
import { useTranslation } from "react-i18next";
import AddNewUser from "../components/Modals/AddNewUser";
import api from "../api/apiClient";
const AccountList = () => {
  const { t, i18n } = useTranslation();

  const [accounts, setAccount] = useState([]);

  const fetchAccountList = async () => {
    try {
      const res = await api.get("/api/7284/User");
      console.log("res.data: ", res.data);
      // const response = await fetch("/api/7284/User");
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const data = await response.json();
      // console.log(data);
      setAccount(res.data);
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  useEffect(() => {
    fetchAccountList();
    const interval = setInterval(fetchAccountList, 1000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    const topic = "web/notify/update/device";
    const notifyMessage = {
      deviceid: "ABABABABBA",
    };

    try {
      // Convert the notify message to a JSON string
      const message = JSON.stringify(notifyMessage);

      // Send the message using SignalR
      await SignalRService.sendMessage(topic, message);
      console.log("Message sent successfully.");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const handleSendMessage = () => {
    sendMessage();
  };
  {
    /* Handle Overlay Visible */
  }
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const handleAddUserClick = (e) => {
    e.preventDefault();
    setOverlayVisible(!isOverlayVisible);
  };
{
    /* sort logic */
  }
  const sortTypes = [
    "userId",
    "userName",
    "password",
    "role",
    "email",
    "lastLogin",
  ];

  const [sortType, setSortType] = useState(sortTypes[0]);
  const [sortDirection, setSortDirection] = useState(true);
  function SortType(sortTypeIndex) {
    if (sortTypes[sortTypeIndex] !== sortType) setSortDirection(true);
    setSortType(sortTypes[sortTypeIndex]);
    if (sortTypes[sortTypeIndex] === sortType)
      setSortDirection((prev) => !prev);
  }

  const sortAlphabet = (a, b) => {
    // const aDigits = a.userid?.toUpperCase() || "";
    // const bDigits = b.userid?.toUpperCase() || "";
    // // Sort alphabetically first
    // if (aDigits < bDigits) return -1;
    // if (aDigits > bDigits) return 1;
    // // If alphabetical order is the same, sort numerically
    // const numA = parseInt(
    //   a.userid?.replace(/[^0-9]/g, "") || "0",
    //   10
    // );
    // const numB = parseInt(
    //   b.userid?.replace(/[^0-9]/g, "") || "0",
    //   10
    // );

    // return numA - numB; // Numeric ascending order

    const valA = (val) => val ?? "";
      switch (sortType) {      
        case sortTypes[0]: // user id
          console.log("sortType: ", sortType);
          if (sortDirection) {
            return valA(a.userid).localeCompare(
              valA(b.userid),
              undefined,
              { numeric: true }
            );
          } else {
            return valA(b.userid).localeCompare(
              valA(a.userid),
              undefined,
              { numeric: true }
            );
          }
        case sortTypes[1]: //user name
          console.log("sortType: ", sortType);
          if (sortDirection) {
            return valA(a.username).localeCompare(
              valA(b.username),
              undefined,
              { numeric: true }
            );
          } else {
            return valA(b.username).localeCompare(
              valA(a.username),
              undefined,
              { numeric: true }
            );
          }
        case sortTypes[2]: //password
          console.log("sortType: ", sortType);
          if (sortDirection) {
            return valA(a.password).localeCompare(
              valA(b.password),
              undefined,
              {
                numeric: true,
              }
            );
          } else {
            return valA(b.password).localeCompare(
              valA(a.password),
              undefined,
              {
                numeric: true,
              }
            );
          }
        case sortTypes[3]: // role
          console.log("sortType: ", sortType);
          if (sortDirection) {
            return String(b.role).localeCompare(String(a.role));
          } else {
            return String(a.role).localeCompare(String(b.role));
          }      
          case sortTypes[4]: // email
          console.log("sortType: ", sortType);
if (sortDirection) {
            return valA(a.email).localeCompare(
              valA(b.email),
              undefined,
              {
                numeric: true,
              }
            );
          } else {
            return valA(b.email).localeCompare(
              valA(a.email),
              undefined,
              {
                numeric: true,
              }
            );
          }
        case sortTypes[5]: // date
          console.log("sortType: ", sortType);
          if (sortDirection) {
            const dateA = a.lastlogin ? new Date(a.lastlogin) : new Date(0);
            const dateB = b.lastlogin ? new Date(b.lastlogin) : new Date(0);
            return dateB - dateA; // Subtracting dates sorts by timestamp
          } else {
            const dateA = b.lastlogin ? new Date(b.lastlogin) : new Date(0);
            const dateB = a.lastlogin ? new Date(a.lastlogin) : new Date(0);
            return dateB - dateA; // Subtracting dates sorts by timestamp
          }
        
      }
  };

  return (
    <>
      <div className="box">
        <h1>{t("AccountList.AccountList")}</h1>
      </div>
      <div className="container">
        <div className="top-bar">
          {/* <FloorSectionBar/> */}
          <div className="input dropdown floor suffix"></div>
          <div className="input dropdown section suffix"></div>
          <div className="input search"></div>
          <div className="btn" id="addUser" onClick={handleAddUserClick}>
            <img src="" alt="" className="prefix" />
            <p className="btn-text">{t("AccountList.NewUser")}</p>
          </div>
          {isOverlayVisible && <AddNewUser callback={handleAddUserClick} />}
        </div>
        <div className="pl">
          <div className="head">
            <h3 className={`fg1 ${sortType === sortTypes[0] ? "selected" : ""}`} onClick={() => SortType(0)}>{t("AccountList.UserID")}  {sortType === sortTypes[0] && (sortDirection ? "\u25BC" : "\u25B2")}</h3>
            <h3 className={`fg1 ${sortType === sortTypes[1] ? "selected" : ""}`} onClick={() => SortType(1)}>{t("AccountList.UserName")}  {sortType === sortTypes[1] && (sortDirection ? "\u25BC" : "\u25B2")}</h3>
            {/* <h3 className={`fg1 ${sortType === sortTypes[2] ? "selected" : ""}`} onClick={() => SortType(2)}>{t("AccountList.UserPassword")}  {sortType === sortTypes[2] && (sortDirection ? "\u25BC" : "\u25B2")}</h3> */}
            <h3 className={`fg1 ${sortType === sortTypes[3] ? "selected" : ""}`} onClick={() => SortType(3)}>{t("AccountList.UserRole")}  {sortType === sortTypes[3] && (sortDirection ? "\u25BC" : "\u25B2")}</h3>
            <h3 className={`fg1 ${sortType === sortTypes[4] ? "selected" : ""}`} onClick={() => SortType(4)}>{t("AccountList.UserEmail")}  {sortType === sortTypes[4] && (sortDirection ? "\u25BC" : "\u25B2")}</h3>
            <h3 className={`fg1 ${sortType === sortTypes[5] ? "selected" : ""}`} onClick={() => SortType(5)}>{t("AccountList.LastLogin")}  {sortType === sortTypes[5] && (sortDirection ? "\u25BC" : "\u25B2")}</h3>
          </div>
          <div className="item-list">
            {accounts
            .sort(sortAlphabet)
            .map((account) => (
              <Link
                to={`/account/account-settings?userid=${account.userid}`}
                key={account.userid}
              >
                <a className="item" key={account.userid}>
                  <h3 className="fg1">{account.userid}</h3>
                  <h3 className="fg1">{account.username}</h3>
                  {/* <h3 className="fg1">
                    {account.password[0] +
                      "*".repeat(account.password.length - 1)}
                  </h3> */}
                  <h3 className="fg1">
                    {account.role === 0
                      ? "Administrator"
                      : account.role === 1
                      ? "Engineer"
                      : "User"}
                  </h3>
                  <h3 className="fg1">{account.email}</h3>
                  <h3 className="fg1">
                    {dayjs(account.lastlogin).format("YYYY-MM-DD")}
                  </h3>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountList;
