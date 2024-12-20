import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AlertList from "../components/AlertList";
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
    const isDeviceSettingsRoute = location.pathname.includes("device-settings");
    setShowDeviceList(!isDeviceSettingsRoute);
  }, [location]);

  return (
    <>
      <Navbar />
      <div className="wrap">
        <AlertList />
        <div className="main">
            <DeviceList/>
        </div>
      </div>
    </>
  );
}

export default Device;
