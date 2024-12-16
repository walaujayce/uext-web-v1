import React, { useEffect, useState } from "react";
import { Outlet,useLocation } from "react-router-dom";
import dayjs from "dayjs";
import Navbar from "../components/Navbar";
import Alert from "../components/Alert";
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
        <Alert />
        <div className="main">
        {showAccountList && (
            <AccountList handleHideAccountList={handleHideAccountList} />
          )}
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Account;
