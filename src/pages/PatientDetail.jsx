import React from 'react';
import Navbar from '../components/Navbar';
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/patient.css";
import PatientProfile from '../components/PatientProfile';
import { Link, Outlet, useLocation } from 'react-router-dom';


function PatientDetail(){
    const location = useLocation();

    return(
        <>
            <Navbar/>
            <div className="wrap">
                <PatientProfile/>
                <div className="main">
                    <div className="tab">
                        <Link to='/patient/patient-detail/patient-monitor' state={{reload:true}}>
                            <span className={`opt opt-1 
                            ${location.pathname === "/patient/patient-detail/patient-monitor" ? "active" : ""
                            }`}>Monitor</span>
                        </Link>
                        <Link to='/patient/patient-detail/patient-alerts'>
                            <span className={`opt opt-2 
                            ${location.pathname === "/patient/patient-detail/patient-alerts" ? "active" : ""
                            }`}>Alerts</span>
                        </Link>
                        <a  className="opt opt-3">Analysis</a>
                        <a  className="opt opt-4">Logs</a>
                        <a  className="btn frameless" href="">
                            <img src="" alt="" className="prefix"/>
                            <p className="btn-text">Back</p>
                        </a>
                    </div>
                    <Outlet/>
                </div>
            </div>
        </>
    );
}

export default PatientDetail;