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

const AccountList = () => {
  const { t, i18n } = useTranslation();

  const [accounts, setAccount] = useState([]);

  const fetchAccountList = async () => {
    try {
      const response = await fetch("/api/7284/User");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setAccount(data);
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

  const sortAlphabet = (a, b) => {
    const aDigits = a.userid?.toUpperCase() || "";
    const bDigits = b.userid?.toUpperCase() || "";
    // Sort alphabetically first
    if (aDigits < bDigits) return -1;
    if (aDigits > bDigits) return 1;
    // If alphabetical order is the same, sort numerically
    const numA = parseInt(
      a.userid?.replace(/[^0-9]/g, "") || "0",
      10
    );
    const numB = parseInt(
      b.userid?.replace(/[^0-9]/g, "") || "0",
      10
    );

    return numA - numB; // Numeric ascending order
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
            {isOverlayVisible && <AddNewUser callback={handleAddUserClick} />}
          </div>
        </div>
        <div className="pl">
          <div className="head">
            <h3 className="fg1">{t("AccountList.UserID")}</h3>
            <h3 className="fg1">{t("AccountList.UserName")}</h3>
            <h3 className="fg1">{t("AccountList.UserPassword")}</h3>
            <h3 className="fg1">{t("AccountList.UserRole")}</h3>
            <h3 className="fg1">{t("AccountList.UserEmail")}</h3>
            <h3 className="fg1">{t("AccountList.LastLogin")}</h3>
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
                  <h3 className="fg1">
                    {account.password[0] +
                      "*".repeat(account.password.length - 1)}
                  </h3>
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
