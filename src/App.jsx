import { useState } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Patient from "./pages/Patient";
import Account from "./pages/Account";
import Device from "./pages/Device";
import PatientDetail from "./pages/PatientDetail";
import PatientMonitor from "./components/PatientMonitor";
import PatientAlerts from "./components/PatientAlerts";
import DeviceSettings from "./components/DeviceSetting";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Login />} />
        <Route path='/home' element={<Home/>}/>
        <Route path='/patient' element={<Patient/>}/>
        <Route path='/patient/patient-detail' element={<PatientDetail/>}>
          <Route index element={<Navigate to="patient-monitor" replace />} />   
          <Route path='patient-monitor' element={<PatientMonitor/>}/>
          <Route path='patient-alerts' element={<PatientAlerts/>}/>
        </Route>
        <Route path='/device' element={<Device/>}/>
        <Route path='/account' element={<Account/>}/>
        <Route path="*" element={<Navigate to="/" />}/> */}
        <Route path="/home" element={<Home />} />
        <Route path="/patient" element={<Patient />} />
        <Route path="/patient/patient-detail" element={<PatientDetail />}>
          <Route index element={<Navigate to="patient-monitor" replace />} />
          <Route path="patient-monitor" element={<PatientMonitor />} />
          <Route path="patient-alerts" element={<PatientAlerts />} />
        </Route>
        <Route path="/device" element={<Device />}>
          <Route path="device-settings" element={<DeviceSettings />} />
        </Route>
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;
