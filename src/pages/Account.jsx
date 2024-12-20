import React, { useEffect, useState } from "react";
import { Outlet,useLocation } from "react-router-dom";
import dayjs from "dayjs";
import Navbar from "../components/Navbar";
import AlertList from "../components/AlertList";
import AccountList from "../components/AccountList";

function Account() {
  const [showAccountList, setShowAccountList] = useState(true);

  const handleHideAccountList = () => {
    setShowAccountList(false);
  };

  const location = useLocation();
  useEffect(() => {
    if (location.state?.reload) {
      // Perform any reset logic or force a refresh
      console.log("Resetting Account component");
      setShowAccountList(true);
    }
  }, [location]);

  return (
    <>
      <Navbar />
      <div className="wrap">
        <AlertList />
        <div className="main">
            <AccountList />
        </div>
      </div>
    </>
  );
}

export default Account;
