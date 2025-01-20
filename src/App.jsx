import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
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
import PatientEngineer from "./components/PatientEngineer";
import DeviceSettings from "./components/DeviceSetting";
import AccountSetting from "./components/AccountSetting";
import PrivateRoute from "./JS/PrivateRoute";
import ForgetPassword from "./components/ForgetPassword"
import ResetPassword from "./components/ResetPassword";

function App() {
  const location = useLocation();

  useEffect(() => {
    // Check if the user is navigating outside of `/patient` routes
    if (!location.pathname.startsWith("/patient")) {
      // Clear relevant sessionStorage keys
      sessionStorage.removeItem("notificationToggleState");
      sessionStorage.removeItem("alertRepeatToggleState");
      sessionStorage.removeItem("selectedNotification");
      sessionStorage.removeItem("debounceValue");
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/home"
        element={
          <PrivateRoute allowedRoles={["all"]}>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient"
        element={
          <PrivateRoute allowedRoles={["all"]}>
            <Patient />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/patient-detail"
        element={
          <PrivateRoute allowedRoles={["all"]}>
            <PatientDetail />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="patient-monitor" replace />} />
        <Route
          path="patient-monitor"
          element={
            <PrivateRoute allowedRoles={["all"]}>
              <PatientMonitor />
            </PrivateRoute>
          }
        />
        <Route
          path="patient-alerts"
          element={
            <PrivateRoute allowedRoles={["all"]}>
              <PatientAlerts />
            </PrivateRoute>
          }
        />
        <Route
          path="patient-engineer"
          element={
            <PrivateRoute allowedRoles={[ "engineer", "administrator"]}>
              <PatientEngineer />
            </PrivateRoute>
          }
        />
      </Route>
      <Route
        path="/device"
        element={
          <PrivateRoute allowedRoles={["all"]}>
            <Device />
          </PrivateRoute>
        }
      />
      <Route
        path="/device/device-settings"
        element={
          <PrivateRoute allowedRoles={["engineer", "administrator"]}>
            <DeviceSettings />
          </PrivateRoute>
        }
      />

      <Route
        path="/account"
        element={
          <PrivateRoute allowedRoles={["administrator"]}>
            <Account />
          </PrivateRoute>
        }
      />
      <Route
        path="/account/account-settings"
        element={
          <PrivateRoute allowedRoles={["administrator"]}>
            <AccountSetting />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
