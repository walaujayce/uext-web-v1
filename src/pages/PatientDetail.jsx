import React from 'react';
import Navbar from '../components/Navbar';
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/patient.css";
import PatientProfile from '../components/PatientProfile';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";


function PatientDetail(){
        const { t, i18n } = useTranslation();
    
    const location = useLocation();
    const searchParams = location.search;
    const navigate = useNavigate();

    const handleBackBtnClick = () => {
      navigate(location.state?.from || "/home");
    };


    return(
        <>
            <Navbar/>
            <div className="wrap">
                <PatientProfile/>
                <div className="main">
                    <div className="tab">
                        <Link to={`/patient/patient-detail/patient-monitor${searchParams}`} state={{reload:true}}>
                            <span className={`opt opt-1 
                            ${location.pathname === "/patient/patient-detail/patient-monitor" ? "active" : ""
                            }`}>{t('PatientDetail.Monitor')}</span>
                        </Link>
                        <Link to={`/patient/patient-detail/patient-alerts${searchParams}`}>
                            <span className={`opt opt-2 
                            ${location.pathname === "/patient/patient-detail/patient-alerts" ? "active" : ""
                            }`}>{t('PatientDetail.Alerts')}</span>
                        </Link>
                        {/* <a  className="opt opt-3">Analysis</a>
                        <a  className="opt opt-4">Logs</a> */}
                        <a  className="btn frameless" onClick={handleBackBtnClick}>
                            <img src="" alt="" className="prefix"/>
                            <p className="btn-text">{t('PatientDetail.Back')}</p>
                        </a>
                    </div>
                    <Outlet/>
                </div>
            </div>
        </>
    );
}

export default PatientDetail;