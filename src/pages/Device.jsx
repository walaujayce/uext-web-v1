import React,{useState, useEffect} from "react";
import { Outlet, Link } from "react-router-dom";
import dayjs from "dayjs";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/panel-list.css";
import Navbar from '../components/Navbar';
import Alert from '../components/Alert';
import FloorSectionBar from "../components/FloorSectionBar";

function Device() {

  const [devices, setDevices] = useState([]);

  const fetchDeviceList = async () => {
    try {
      const response = await fetch('api/7285/devices');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setDevices(data);
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  useEffect(() => {
    fetchDeviceList();
    const interval = setInterval(fetchDeviceList, 1000); 
    return () => clearInterval(interval);
  }, []);



  return (
    <>
        <Navbar/>
        <div className='wrap'>
        <Alert/>
        <div className="main">
            <div className="box">
                <h1>Device List</h1>
            </div>
            <div className="container">
                <div className="top-bar">
                    <FloorSectionBar/>
                    <div className="btn" id="addDevice">
                        <img src="" alt="" className="prefix"/>
                        <p className="btn-text">New Device</p>
                    </div>
                </div>
                <div className="pl">
                    <div className="head">
                        <h3 className="fg1">Device Type</h3>
                        <h3 className="fg2">Device ID</h3>
                        <h3 className="fg2">MAC Address</h3>
                        <h3 className="fg2">IP Address</h3>
                        <h3 className="fg1">Bed</h3>
                        <h3 className="fg1">Section</h3>
                        <h3 className="fg1">Floor</h3>
                        <h3 className="fg1">Setting Date</h3>
                        <div className="connection fg2">
                            <img src="" alt=""/>
                            <h3>Device Status</h3>
                        </div>
                    </div>
                    <div className="item-list">
                        <a className="item">
                            <h3 className="fg1">UEXT</h3>
                            <h3 className="fg2">RRD42687891</h3>
                            <h3 className="fg2">D83ADD586CCE</h3>
                            <h3 className="fg2">192.9.0.101</h3>
                            <h3 className="fg1">6101</h3>
                            <h3 className="fg1">Zone A</h3>
                            <h3 className="fg1">6F</h3>
                            <h3 className="fg1">2024-10-22</h3>
                            <div className="connection connected fg2">
                                <img src="" alt=""/>
                                <h3>Connected</h3>
                            </div>
                        </a>
                        {devices.map((device) => (
                          <Link to={`/device/${device.deviceid}`} key={device.deviceid}>
                            <div className="item">
                              <h3 className="fg1">{device.devicetype === 0 ? "Not Specified"
                                                    : device.devicetype === 1 ? "UEXT"
                                                    : "UMAP"}
                                                    </h3>
                              <h3 className="fg2">{device.Deviceid || "N/A"}</h3>
                              <h3 className="fg2">{device.Devicemac || "N/A"}</h3>
                              <h3 className="fg2">{device.Deviceip || "N/A"}</h3>
                              <h3 className="fg1">{device.Bedno || "N/A"}</h3>
                              <h3 className="fg1">{device.section || "N/A"}</h3>
                              <h3 className="fg1">{device.Floorid || "N/A"}</h3>
                              <h3 className="fg1">{dayjs(device.Updatedat).format("YYYY-MM-DD") || "N/A"}</h3>
                              <div
                                className={`connection ${
                                  device.Connect ? "connected" : "disconnected"
                                } fg2`}
                              >
                                <img src="" alt="" />
                                <h3>{device.Connect ? "Connected" : "Disconnected"}</h3>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>        
        </div>
    </>
  );
}

export default Device;