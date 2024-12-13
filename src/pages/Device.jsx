import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Alert from "../components/Alert";
import DeviceList from "../components/DeviceList";
import { Outlet,useLocation } from "react-router-dom";
import DeviceSettings from "../components/DeviceSetting";

function Device() {
  const [showDeviceList, setShowDeviceList] = useState(true);

  const handleHideDeviceList = () => {
    setShowDeviceList(false);
  };

  const location = useLocation();
  useEffect(() => {
    if (location.state?.reload) {
      // Perform any reset logic or force a refresh
      console.log("Resetting Device component");
      setShowDeviceList(true);
    }
  }, [location]);

  return (
    <>
      <Navbar />
      <div className="wrap">
        <Alert />
        <div className="main">
          {showDeviceList && (
            <DeviceList handleHideDeviceList={handleHideDeviceList} />
          )}
          <Outlet />
          {/* <DeviceSettings/> */}
        </div>
      </div>
    </>
  );
}

export default Device;
