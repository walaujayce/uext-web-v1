/* eslint-disable no-unused-vars */
import React, {useState,useEffect} from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import Navbar from '/src/components/Navbar.jsx'
import Alert from '/src/components/Alert.jsx'
import FloorSectionBar from "../components/FloorSectionBar";
import { Bed_disconnect,Bed_alert, Bed_attention,Bed_vacant,Bed_default} from "../components/Bed_Cards";

function Home() {

const [devices, setDevices] = useState([]);

  const fetchDeviceList = async () => {
    try {
      const response = await fetch('api/8031/devices');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.DATA);
      setDevices(data.DATA || []);
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  useEffect(() => {
    fetchDeviceList();
    const interval = setInterval(fetchDeviceList, 1000); 
    return () => clearInterval(interval);
  }, []);

  const renderDeviceComponent = (device) => {
    const { STAT, POS, MAC, HOLD } = device;

    if (STAT === 0) {
      return <Bed_disconnect/>;
    } else if (STAT === 1) {
      return POS === 4 || POS ===5 ? (<Bed_alert key={MAC} hold={formatSecondsToDHMS(HOLD)} />)
       : POS === 3 ? (<Bed_attention/>)
       :(<Bed_default />
       );
    }

    return null; // Handle any unexpected case if necessary
  };

    const formatSecondsToDHMS = (seconds) => {
        const days = Math.floor(seconds / (24 * 3600));
        seconds %= 24 * 3600;
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        seconds %= 60;
        const dateTime = days > 0 ?  `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        return dateTime;
    };


  return (
    <>
        <Navbar/>
        <div className="wrap">
            <Alert/>
            <div className="main">
                <div className="box">
                <h1>Monitors</h1>
                </div>
                <div className="monitors">
                    <div className="top-bar">
                        <FloorSectionBar/>
                        <div className="sort">
                        <div className="label">Sort by</div>
                        <div className="opt-box">
                            <div className="opt s1 active">Bed</div>
                            <div className="opt s2">Status</div>
                            <div className="bg-bk s1"></div>
                        </div>
                        </div>
                    </div>
                    {/* Bed Grid Sort by Bed */}
                    <div className="grid active">
                            {devices.map((device) => renderDeviceComponent(device))}
                    </div>
                </div>
            </div>
        </div>
    </>
  );
}

export default Home;
