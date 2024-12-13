import React,{useState} from "react";
import "/src/CSS/device.css";
import { useNavigate,useSearchParams } from "react-router-dom";

function DeviceSettings() {
  const [isDeleteBtnHovered, setIsDeleteBtnHovered] = useState(false);
  const navigate = useNavigate();

  const handleBackBtnClick = () =>{
    navigate('/device');
  }

  const [searchParams] = useSearchParams();
  const macaddress = searchParams.get("macaddress") || "";
  return (
    <>
      <div className="box">
        <h1>Device Settings</h1>
            <a className="btn frameless" href="" onClick={handleBackBtnClick}>
            <img src="" alt="" className="prefix" />
            <p className="btn-text">Back</p>
            </a>
      </div>
      <div className="device">
        <div className="deviceSetting">
          <h2>Device Information</h2>
          <div className="opt-list">
            <div className="opt-grid">
              <div className="input g-col-3">
                <label htmlFor="d-id" className="label-container">
                  <p>Device ID</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="d-id"
                    placeholder="ADPS-003078-S"
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
              <div className="input g-col-3">
                <label htmlFor="mac" className="label-container">
                  <p>MAC</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="mac"
                    placeholder="D83ADD8617DC"
                    value={macaddress}
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
              <div className="input g-col-3">
                <label htmlFor="d-ip" className="label-container">
                  <p>Device IP</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="d-ip"
                    placeholder="100.58.499.11"
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
            </div>
            <div className="btn-gp">
              <div className="btn text-only">
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Save</p>
              </div>
            </div>
          </div>
        </div>
        <div className="deviceSetting">
          <h2>Device Information</h2>
          <div className="opt-list">
            <div className="opt-grid">
              <div className="input dropdown floor g-col-3 suffix">
                <label htmlFor="floor" className="label-container">
                  <p>Floor</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="name"
                    placeholder="7F"
                    readOnly
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">1F</div>
                  <div className="item opt2">2F</div>
                  <div className="item opt3">3F</div>
                  <div className="item opt4">4F</div>
                  <div className="item opt5">5F</div>
                  <div className="item opt6">6F</div>
                  <div className="item opt7">7F</div>
                </div>
              </div>
              <div className="input dropdown section g-col-3 suffix">
                <label htmlFor="section" className="label-container">
                  <p>Section</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="section"
                    placeholder="Zone A"
                    readOnly
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">Zone A</div>
                  <div className="item opt2">Zone B</div>
                  <div className="item opt3">Zone C</div>
                  <div className="item opt4">Zone D</div>
                </div>
              </div>
              <div className="input g-col-3">
                <label htmlFor="bed" className="label-container">
                  <p>Bed</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="bed"
                    placeholder="1001"
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
              <div className="input connection g-col-3">
                <label htmlFor="connection" className="label-container">
                  <p>Connection Status</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="connection"
                    name="connection"
                    value="Connected"
                    readOnly
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">click to reconnect</div>
              </div>
            </div>
            <div className="btn-gp">
              <div className="btn text-only">
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Save</p>
              </div>
              <div className="btn text-only outline inactive">
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Reconnect</p>
              </div>
            </div>
          </div>
        </div>
        <div className="deviceSetting">
          <h2>Device Configuration</h2>
          <div className="opt-list">
            <div className="opt-grid">
              <div className="input dropdown set g-col-2 suffix">
                <label htmlFor="set1" className="label-container">
                  <p>Setting 1</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="set1"
                    placeholder="Default"
                    readOnly
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">custom 1</div>
                  <div className="item opt2">custom 2</div>
                  <div className="item opt3">custom 3</div>
                  <div className="item opt4">custom 4</div>
                </div>
              </div>
              <div className="input dropdown set g-col-2 suffix">
                <label htmlFor="set1" className="label-container">
                  <p>Setting 1</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="set1"
                    placeholder="Default"
                    readOnly
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">custom 1</div>
                  <div className="item opt2">custom 2</div>
                  <div className="item opt3">custom 3</div>
                  <div className="item opt4">custom 4</div>
                </div>
              </div>
              <div className="input dropdown set g-col-2 suffix">
                <label htmlFor="set1" className="label-container">
                  <p>Setting 1</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="set1"
                    placeholder="Default"
                    readOnly
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">custom 1</div>
                  <div className="item opt2">custom 2</div>
                  <div className="item opt3">custom 3</div>
                  <div className="item opt4">custom 4</div>
                </div>
              </div>
              <div className="input dropdown set g-col-2 suffix">
                <label htmlFor="set1" className="label-container">
                  <p>Setting 1</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="set1"
                    placeholder="Default"
                    readOnly
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">custom 1</div>
                  <div className="item opt2">custom 2</div>
                  <div className="item opt3">custom 3</div>
                  <div className="item opt4">custom 4</div>
                </div>
              </div>
              <div className="input dropdown set g-col-2 suffix">
                <label htmlFor="set1" className="label-container">
                  <p>Setting 1</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="set1"
                    placeholder="Default"
                    readOnly
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">custom 1</div>
                  <div className="item opt2">custom 2</div>
                  <div className="item opt3">custom 3</div>
                  <div className="item opt4">custom 4</div>
                </div>
              </div>
              <div className="input dropdown set g-col-2 suffix">
                <label htmlFor="set1" className="label-container">
                  <p>Setting 1</p>
                  <img
                    className="info"
                    src="element/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="set1"
                    placeholder="Default"
                    readOnly
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">custom 1</div>
                  <div className="item opt2">custom 2</div>
                  <div className="item opt3">custom 3</div>
                  <div className="item opt4">custom 4</div>
                </div>
              </div>
            </div>
            <div className="btn-gp">
              <div className="btn text-only">
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Save</p>
              </div>
              <div className="btn text-only outline" id="reset">
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Reset to Default</p>
              </div>
            </div>
          </div>
        </div>
        <div className="deviceSetting">
          <h2>Device Version</h2>
          <div className="opt-list">
            <div className="ver-stat">
              You are at the latest version! (v1.0.1)
            </div>
            <div className="btn-gp">
              <div className="btn text-only inactive">
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Update now</p>
              </div>
            </div>
          </div>
        </div>
        <div className="deviceSetting">
          <h2>Device Removal</h2>
          <div className="opt-list">
            <div className="ver-stat">Remove current device.</div>
            <div className="btn-gp">
              <div
                className="btn text-only"
                style={{
                  backgroundColor: isDeleteBtnHovered ? "#ff050d" : "#ff333a",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={() => setIsDeleteBtnHovered(true)}
                onMouseLeave={() => setIsDeleteBtnHovered(false)}
              >
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Delete</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeviceSettings;
