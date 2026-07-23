import React from "react";
import Navbar from "../components/Navbar";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/patient.css";
import PatientProfile from "../components/PatientProfile";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../JS/AuthContext";
import { getCurrentServerIp, setCurrentServerIp } from "../api/serverStore";

function PatientDetail() {
  const { t, i18n } = useTranslation();

  const { role } = useAuth();
  const location = useLocation();
  const searchParams = location.search;
  const navigate = useNavigate();

  // 「All」模式下從 Home/Patient 帶進來的 ?ip=，代表這台裝置所屬的後端。
  // 在 render 期間就同步到 module store，確保底下各分頁(Profile/Monitor/discharge…)
  // 的請求都釘在正確那台（子元件的 effect 會晚於這裡執行，所以第一次 fetch 就會拿到正確 IP）。
  const ipParam = new URLSearchParams(location.search).get("ip");
  if (ipParam && getCurrentServerIp() !== ipParam) {
    setCurrentServerIp(ipParam);
  }

  const handleBackBtnClick = () => {
    navigate(location.state?.from || "/home");
  };

  return (
    <>
      <Navbar />
      <div className="wrap">
        <PatientProfile />
        <div className="main">
          <div className="tab">
            <Link
              to={`/patient/patient-detail/patient-monitor${searchParams}`}
              state={{ reload: true }}
            >
              <span
                className={`opt opt-1 
                            ${
                              location.pathname ===
                              "/patient/patient-detail/patient-monitor"
                                ? "active"
                                : ""
                            }`}
              >
                {t("PatientDetail.Monitor")}
              </span>
            </Link>
            <Link to={`/patient/patient-detail/patient-alerts${searchParams}`}>
              <span
                className={`opt opt-2 
                            ${
                              location.pathname ===
                              "/patient/patient-detail/patient-alerts"
                                ? "active"
                                : ""
                            }`}
              >
                {t("PatientDetail.Alerts")}
              </span>
            </Link>
            {["administrator"].includes(role) && (
              <Link
                to={`/patient/patient-detail/patient-engineer${searchParams}`}
              >
                <span
                  className={`opt opt-2 
                            ${
                              location.pathname ===
                              "/patient/patient-detail/patient-engineer"
                                ? "active"
                                : ""
                            }`}
                >
                  {t("PatientDetail.Debug")}
                </span>
              </Link>
            )}
            {["administrator"].includes(role) && (
              <Link
                to={`/patient/patient-detail/patient-analysis${searchParams}`}
              >
                <span
                  className={`opt opt-2 
                    ${
                      location.pathname ===
                      "/patient/patient-detail/patient-analysis"
                        ? "active"
                        : ""
                    }`}
                >
                  {t("PatientDetail.Analysis")}
                </span>
              </Link>
            )}

            <Link to={`/patient/patient-detail/patient-record${searchParams}`}>
              <span
                className={`opt opt-2 
                    ${
                      location.pathname ===
                      "/patient/patient-detail/patient-record"
                        ? "active"
                        : ""
                    }`}
              >
                {t("PatientDetail.Record")}
              </span>
            </Link>

            {/* <a  className="opt opt-3">Analysis</a>
                        <a  className="opt opt-4">Logs</a> */}
            <a className="btn frameless" onClick={handleBackBtnClick}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text">{t("PatientDetail.Back")}</p>
            </a>
          </div>
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default PatientDetail;
