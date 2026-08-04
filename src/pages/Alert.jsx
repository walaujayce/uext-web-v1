import React, { useEffect, useState } from "react";
import { Outlet,useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import AlertList from "../components/AlertList";
import AlertGanttChart from "../components/AlertGanttChart";

function Alert() {

  return (
    <>
      <Navbar />
      <div className="wrap">
        <AlertList />
        <div className="main">
            <AlertGanttChart/>
        </div>
      </div>
    </>
  );
}

export default Alert;
